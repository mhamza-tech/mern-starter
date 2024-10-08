import { GeneratorConfig, GeneratorEngineState, Interaction, Counter, CounterState, RequiredNodeApi, FinishedCondition, EngineStatus, StringOptions, Cooldown, InteractionMap, InteractionConfig, BooleanPath, StubSource, BooleanChoice, CounterMap, Conditions, InteractionIntent, JobCallback, ConditionResult, PrizeConfig, PrizeId, CustomIntentParams, CustomIntentFn, CustomIntent, IntentPriority, ConditionConfig, StringConfig, StateContext, StateValueResult, NewsfeedConfig } from './types'
import { ChatRoomActionContextApi, HandlebarsValues } from 'src/types'
import { defaultsDeep, isKeyOf, keysOf, cloneDeep } from 'src/utils/misc'
import { misc } from 'src/utils'
import moment from 'moment'
import { moves, Move } from 'src/domain/moves'
import { items, Item } from 'src/domain/items'
import { BeforeEnterAsset, ReactionFnMap } from 'src/enginev3'
import { incCounter, resetCounter, getCounter } from 'src/maker/counters'
import { defaultStateField, lottieTile } from './assets'
import { AppLogger, LoggerFactory } from 'src/utils/logger'
import { getUserState, incUserState, setUserState } from 'src/maker/userStates'
import { animate } from 'src/maker/fx/animation.removeFromRoom'
import { Field, Tile, TileMetadata, DynamicFeedItemLayout, FeedItemActionEntityType, FeedItemActionType, ContainerStyleV2, EffectType, EntityScope, AnimationType } from 'src/gql-types'
import _ from 'lodash'
import { StringTag } from 'src/domain/strings'
import { UserStateId } from 'src/domain/userStates'
import { incHashtribute } from 'src/maker/hashtributes'
import { HashtributeId } from 'src/domain/hashtributes'
import { SYSTEM_USER_EID } from 'src/env'
import { events } from 'src/events'
import { lookupString } from 'src/maker/strings'
import { TILE_NAME_UNOBJECT } from '../../common/assets'

const DEFAULT_NEWSFEED_DELAY = 8 // seconds

/*******************************************************
* Potential Engine Upgrades:
*
* 1. Prizes: remove prize type and array of those types
* and make an array of prizes WITH types, so for example
* Bigfoot calls you a dumbass and hurts you, that would
* result in the hashtribute AND a state change
********************************************************/
export class Engine {
  
  public constructor(config: GeneratorConfig) {
    this.config = config
    this.logger = LoggerFactory(this.config.id, 'NPC')

    const keys = Object.keys(this.config.interaction || {})
    // any moves we have configured, map them to an array of moves
    // any items we have configured, map them to an array of items
    this.moves = []
    this.items = []
    keys.forEach((key) => {
      if(isKeyOf(key, moves)) {
        this.moves.push(moves[key])
      } else if(isKeyOf(key, items)) {
        this.items.push(items[key])
      }
    })
  }

  private readonly config: GeneratorConfig
  private readonly logger: AppLogger
  private interaction: InteractionMap
  private counters: CounterMap
  private prizes: PrizeConfig[]
  private readonly moves : Move[]  // may scrap these and use just the interaction type
  private readonly items : Item[]  // ditto
  private engineStatus : EngineStatus
  private stateContext : UserStateId

  // DEBUG

  private debug = (api: ChatRoomActionContextApi) : Promise<any> => {
    if(!this.config.debug || this.config.debug.enabled === false) {
      return null
    }

    if(this.config.debug.states) {
      const promises : Promise<any>[] = []
      this.config.debug.states.forEach(state => {
        promises.push(
          setUserState(state.api === RequiredNodeApi.Actor
            ? api.getActor() : api.getChatRoom(),
          state.id as UserStateId,
          { delta: state.value, numberValue: state.value, changedAt: new Date().toISOString() })
        )
      })
      return Promise.all(promises)
    }
    return null
  }

  // STATE CONTEXT

  private chooseUserStateContext = async (api: ChatRoomActionContextApi): Promise<string> => {
    if(!this.config.stateContext) {
      return 'no_afflictions'
    }

    const stateContext : StateContext = this.config.stateContext
    if(stateContext.choice === 'index' && stateContext.index !== undefined) {
      return stateContext.states[stateContext.index]
    }

    if(stateContext.choice === 'random') {
      const results : StateValueResult[] = []
      for await (const userStateId of stateContext.states) {
        const stateResult = await getUserState(
          stateContext.api === RequiredNodeApi.Actor ? api.getActor() : api.getChatRoom(),
          userStateId
        )
        if(stateResult.numberValue > 0) {
          const result : StateValueResult = {
            userStateId,
            numberValue: stateResult.numberValue,
          }
          results.push(result)
        }
      }
      return (results && results.length > 0 && _.sample(results).userStateId as string) || 'no_afflictions'
    } else if(stateContext.choice === 'highest') {
      const results : StateValueResult[] = []
      for await (const userStateId of stateContext.states) {
        const stateResult = await getUserState(
          stateContext.api === RequiredNodeApi.Actor ? api.getActor() : api.getChatRoom(),
          userStateId
        )
        const result : StateValueResult = {
          userStateId,
          numberValue: stateResult.numberValue,
        }
        results.push(result)
      }
      const highest = results.sort((a, b) => (a.numberValue < b.numberValue) ? 1 : ((a.numberValue > b.numberValue) ? -1 : 0))
      return highest[0].userStateId
    }

    console.log('could not detect a state context for user')

    return null
  }

  // STATE
  
  private defaultState = (): GeneratorEngineState => {
    const cooldowns : Cooldown = {}
    const booleanPath : BooleanPath = []
    this.moves?.forEach((move) => cooldowns[move.name] = moment().toISOString())
    const defaultState = misc.deepFreeze<GeneratorEngineState>({
      npcCooldown: false,
      cooldowns,
      booleanPath,
    })

    return defaultState
  }

  private getState = (api: ChatRoomActionContextApi): Promise<GeneratorEngineState> => {
    return api.getChatRoom().field(misc.defaultsDeep({
      name: 'generator.internal.engine.state',
    }, defaultStateField))
      .then((field): GeneratorEngineState => field.metadata.state)
  }

  private saveState = (api: ChatRoomActionContextApi, state: GeneratorEngineState): Promise<GeneratorEngineState> => {
    const room = api.getChatRoom()
    return room.saveField(defaultsDeep({ metadata: { state } }, misc.defaultsDeep({
      name: 'generator.internal.engine.state',
    }, defaultStateField)))
      .then((field): GeneratorEngineState => field.metadata.state)
  }

  private updateState = (state: GeneratorEngineState, actionName: string): GeneratorEngineState => {
    this.updateStateForCooldowns(state, actionName)
    return state
  }

  private updateStateForCooldowns = (state: GeneratorEngineState, actionName: string) : void => {
    const move = this.moves.find((move) => move.name === actionName)
    if(move) {
      if(this.config.globalCooldown) {
        const cooldowns : Cooldown = {}
        this.moves.forEach((move) => cooldowns[move.name] = this.isInteractionDisabled(move.name) ? moment().toISOString() : this.getCooldownDuration(state, move))
        state.cooldowns = cooldowns
      } else {
        const cooldowns : Cooldown = { ...state.cooldowns, [move.name]: moment().add(move.cooldown).toISOString() }
        state.cooldowns = cooldowns
      }
    }
  }

  private updateStateForBooleanPath = (state: GeneratorEngineState, choice: BooleanChoice) : void => {
    state.booleanPath = [...state.booleanPath, choice]
  }

  private onUpdateInventory = async (api: ChatRoomActionContextApi, item: Item): Promise<any> => {
    return Promise.all([
      api.getActor().createActionInstance({ actionName: item.name }),
      this.restartJobsOnInteraction(api),
    ])
      .then(() => this.getState(api))
      .then((state) => this.onUpdateUI(api, state, 'onUpdateInventory'))
  }

  // HOOKS

  public onBeforeEnter = async (): Promise<BeforeEnterAsset[]> => {
    this.logger.log('onBeforeEnter')
    return this.moves
  }

  public onEnter = (api: ChatRoomActionContextApi): Promise<any> => {
    return Promise.all([
      this.onReset(api),
    ])
      .then(() => this.getState(api))
      .then((state) => this.onUpdateUI(api, state, 'onEnter'))
  }

  public onReset = async (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onReset')
    const defaultState = this.defaultState()
    this.engineStatus = EngineStatus.SessionRunning
    // same for interaction, read config and instance
    this.setupInteraction()
    this.setupCounters()
    this.setupPrizes()
    await this.debug(api)
    this.stateContext = await this.chooseUserStateContext(api) as UserStateId
    return Promise.all([
      this.saveState(api, defaultState),
      this.resetCounters(api),
      this.showString(api, 'welcome', {roomStateContext: this.stateContext}, defaultState),
      this.config.enableSessionSupport === true && events.npc.session.started.notify({ api }),
    ]).then(() => this.startAllJobs(api)) // last moment
  }

  private renderResetStub = (api: ChatRoomActionContextApi) : Promise<Field> => {
    const stubs = [{
      actionName: 'restart_word_bubble_2237',
      isUsable: true,
      isGivable: false,
      isDisabled: false,
    }]
    return api.getActor().saveCurrentActionStubs({
      staticActionStubs: stubs,
    })
  }

  private renderStubs = (api: ChatRoomActionContextApi, state: GeneratorEngineState) : Promise<Field> => {
    if(!this.config.interaction ||
      (this.engineStatus === EngineStatus.SessionFinished && this.config.offerSessionRestart === true)) {
      return null
    }

    const stubSource : StubSource[] = [...this.moves, ...this.items] // can we mix? overkill?
    const stubs = stubSource.filter((move) => move.name !== 'restart_word_bubble_2237')
      .map((move) => ({
        actionName: move.name,
        isUsable: true,
        isGivable: false,
        isDisabled: this.isInteractionDisabled(move.name),
        disabledUntil: state.cooldowns[move.name], // TODO Check why not working!
      }))
    return api.getActor().saveCurrentActionStubs({
      staticActionStubs: stubs,
    })
  }

  private renderTiles = (api: ChatRoomActionContextApi) : Promise<Tile> => {
    if(!this.config.tiles) {
      return null
    }

    return api.getChatRoom().saveTiles(Object.values(this.config.tiles).map((tile) => tile))
  }

  private renderConcurrentEffects = (api: ChatRoomActionContextApi) : Promise<any> => {
    if(!this.config.concurrentEffects) {
      return null
    }
    const promises : Promise<any>[] = []
    Object.values(this.config.concurrentEffects).forEach((effect) => {
      promises.push(api.getChatRoom().saveEffect(effect))
    })
    return Promise.all(promises)
  }

  public onUpdateUI = async (api: ChatRoomActionContextApi, state: GeneratorEngineState, fromTag: string): Promise<any> => {
    this.logger.info('onUpdateUI', fromTag)
    return Promise.all([
      this.renderStubs(api, state),
      this.renderTiles(api),
    ])
  }

  // INTERACTION

  protected onInteraction = async (api: ChatRoomActionContextApi): Promise<any> => {
    this.cancelJobsOnInteraction(api)
    const state = await this.getState(api)
    const actionName = api.getCurrentActionName()

    //console.log('options', options)

    const config = this.config.interaction[actionName]

    if(!config) {
      return null
    }

    return this.updateIntents(api, 'before', config, actionName, state) // run first
      .then(() => this.updateIntents(api, 'main', config, actionName, state))
      .then(() => this.broadcastNews(api, state))
      .then(() => this.updateCounterStatus(api))
      .then(() => this.updateSessionStatus(api))
      .then(() => Promise.all([
        this.restartJobsOnInteraction(api),
        this.checkPrizePayout(api, state)
          .then(() => this.saveState(api, this.updateState(state, actionName)))
          .then(() => this.onUpdateUI(api, state, 'onInteraction'))
          .then(() => this.updateIntents(api, 'cleanup', config, actionName, state)),
      ]))
  }

  private setupInteraction = () : void => {
    this.interaction = misc.cloneDeep<InteractionMap>(this.config.interaction || {})
    keysOf(this.interaction).forEach((key) => this.interaction[key].disabled = this.interaction[key].initiallyDisabled)
  }

  private updateIntents = (api: ChatRoomActionContextApi, priority: IntentPriority, config: InteractionConfig, actionName: string, state: GeneratorEngineState): Promise<any> => {
    const options : StringOptions = {
      item: actionName in items && items[actionName] || null,
      move: actionName in moves && moves[actionName] || null,
    }
    return Promise.all([
      ...config.intent.filter((intent) => intent.priority === priority).map((intent) => {
        // WIP
        // if(intent.type === 'item') {
        //   return this.giveItemIntent(api, intent as ItemIntent)
        // }
        // WIP
        // if(intent.type === 'slotMachine') {
        //   return this.slotMachineIntent(api, intent as SlotMachineIntent)
        // }
        switch(intent.type) {
          case 'moveMessage' : {
            return this.showString(api, 'interact', options, state) // may need to reorder this
          }
          case 'counter' : {
            return this.updateCounter(api, intent)
          }
          case 'booleanPath' : {
            return this.updatePath(api, actionName, state)
          }
          case 'restart' : {
            return this.onReset(api)
              .then(() => this.onUpdateUI(api, state, 'updateIntents: restart'))
          }
          case 'animateNpc' : {
            return this.animateNPC(api, actionName)
          }
          case 'custom' : {
            return this.customIntent(api, this, actionName, (intent as CustomIntent).callback, state)
          }
          case 'rockPaperScissors' : {
            // return this.updateRockPaperScissors(api, config, actionName)
            break
          }
          default: {
            this.logger.info('WARNING: Use of unsupported intent:', intent.type)
          }
        }
      }),
    ])
  }

  // ITEM INTENT WIP

  // private giveItemIntent = (api: ChatRoomActionContextApi, intent: ItemIntent): Promise<any> => {
  //   const prize = items[intent.prize]
  //   return this.giveItemPrize(api, prize)
  // }

  // WIP
  // SLOT MACHINE MECHANIC

  // private slotMachineIntent = (api: ChatRoomActionContextApi, intent: SlotMachineIntent): Promise<any> => {
  //   console.log(api, intent)

  //   return null
  // }

  // BOOLEAN PATH MECHANIC

  private updatePath = async (api: ChatRoomActionContextApi, actionName: string, state: GeneratorEngineState): Promise<any> => { 
    return this.updateStateForBooleanPath(state, this.config.interaction[actionName].booleanChoice)
  }

  private customIntent = async (api: ChatRoomActionContextApi, engine: Engine, actionName: string, callback: CustomIntentFn, state: GeneratorEngineState): Promise<any> => { 
    const params: CustomIntentParams = {
      counters: this.counters,
      sessionStatus: this.engineStatus,
    }
    return callback(api, this, actionName, params, state)
  }

  // WIP - ROCK PAPER SCISSORS MECHANIC

  // private updateRockPaperScissors = (api: ChatRoomActionContextApi, config: InteractionConfig, actionName: string): Promise<any> => {
  //   console.log(api, config, actionName)
  //   return null
  // }

  // COUNTERS

  private setupCounters = () : void => {
    this.counters = misc.cloneDeep<CounterMap>(this.config.counters || {})
  }

  private resetCounters = (api: ChatRoomActionContextApi) : Promise<any> => {
    if(!this.config.counters) {
      return null
    }
    const promises : Promise<any>[] = []
    Object.values(this.counters).forEach((counter) => {
      if(counter.resetOnStart) {
        promises.push(resetCounter(counter.api === RequiredNodeApi.Actor
          ? api.getActor()
          : api.getChatRoom()
        , counter.tags))
      }
    })
    return Promise.all(promises)
  }

  private getSystemCounterValue = (api: ChatRoomActionContextApi, counterName: string) : Promise<number> => {
    // console.log('getSystemCounterName - name: ', counterName)
    const counter = this.counters[counterName]
    return getCounter(
      counter.api == RequiredNodeApi.Actor
        ? api.getActor()
        : api.getChatRoom()
      , counterName)
  }

  private updateCounter = (api: ChatRoomActionContextApi, intent: InteractionIntent): Promise<any> => {
    const actionName = intent.name
    const counter = this.getCounterForInteraction(actionName)
    if (actionName != undefined) {
      if(counter && counter.state === CounterState.Active) {
        const nodeApi = counter.api === RequiredNodeApi.Actor
          ? api.getActor()
          : api.getChatRoom() 
        return incCounter(nodeApi, counter.tags)
      }
    }
    return null
  }

  private updateCounterStatus = (api: ChatRoomActionContextApi): Promise<any> => {
    const promises : Promise<any>[] = []
    Object.values(this.counters).forEach(counter => {
      if(counter && counter.state === CounterState.Active) {
        const nodeApi = counter.api === RequiredNodeApi.Actor
          ? api.getActor()
          : api.getChatRoom() 
        promises.push(getCounter(nodeApi, counter.tags)
          .then((value) => {
            if(value === counter.max) {
              if(counter.repeat) {
                resetCounter(nodeApi, counter.tags)
              } else {
                counter.state = CounterState.AtMaximum
              }
            }
          })
        )
      }
    })
      
    return Promise.all(promises)
  }

  // SESSION

  // Not happy with this, I want a better method for supplying a finished condition
  // in the config, even if it's a simple lambda, but stays for now until upgrade required

  private updateSessionStatus = (api: ChatRoomActionContextApi) : Promise<any> => {
    // console.log('updateSessionStatus')
    if(this.config.finishedCondition == FinishedCondition.AllCountersMax) {
      const keys = Object.keys(this.counters)
      // Object.values(this.counters).forEach((counter: Counter) => console.log('counter', counter.tags, counter.state))
      const maxxedCounters = Object.values(this.counters)
        .filter((counter) => counter.state === CounterState.AtMaximum)
      if(maxxedCounters.length === keys.length) {
        this.engineStatus = EngineStatus.SessionFinished
        if(this.config.offerSessionRestart === true) {
          return this.renderResetStub(api)
        }
      }
    } else if(this.config.finishedCondition === FinishedCondition.NamedCounterAtMax) {
      if(this.config.finishedConditionOptions.counterName) {
        const counter = this.counters[this.config.finishedConditionOptions.counterName]
        if(counter.state === CounterState.AtMaximum) {
          this.engineStatus = EngineStatus.SessionFinished
          if(this.config.offerSessionRestart === true) {
            return this.renderResetStub(api)
          }
        }
      }
    }
    return null
  }

  // PRIZES

  private setupPrizes = () : void => {
    this.prizes = misc.cloneDeep<PrizeConfig[]>(this.config.prizes || [])
  }

  private calculatePrizeIndex = (prize: PrizeConfig) : number => {
    if(prize.prizes.length === 0) {
      return 0
    }

    if(_.hasIn(prize, 'chances',)) {
      const rn = _.random(0, 100)
      const index = prize.chances.reduce((acc, chance) => {
        return chance <= rn
          ? acc + 1
          : acc
      }, 0)
      return index
    } else {
      return _.random(0, prize.prizes.length-1)
    }
  }

  public playLottie = (api: ChatRoomActionContextApi, id: string, containerStyle: ContainerStyleV2): Promise<any> => {
    const template = cloneDeep(lottieTile)
    template.isDeleted = false
    const lottieMetadata = template.metadata as TileMetadata
    lottieMetadata.animation.sourceUri = id
    lottieMetadata.containerStyle = containerStyle

    return api.getChatRoom().saveTile(template)
  }

  public stopLottie = (api: ChatRoomActionContextApi): Promise<any> => {
    const template = cloneDeep(lottieTile)
    template.isDeleted = true
    return api.getChatRoom().saveTile(template)
  }

  private checkPrizePayout = async (api: ChatRoomActionContextApi, state: GeneratorEngineState): Promise<any> => {
    const promises : Promise<ConditionResult>[] = []
    Object.values(this.prizes).forEach((prize, index) => {
      if(prize.stock === undefined || prize.stock > 0) {
        promises.push(this.checkConditions(api, prize.conditions, index, state))
      }
    })

    return Promise.all(promises)
      .then((results) => {
        const winConditionResult = results.find((result) => result.result === true)
        if(winConditionResult) {
          const prize : PrizeConfig = this.prizes[winConditionResult.id]
          if(prize.stock > 0) {
            prize.stock--
          }
          // NEW Play an effect if required
          if(prize.lottieEffect) {
            this.playLottie(api, prize.lottieEffect.id, prize.lottieEffect.containerStyle)
          }
          switch(prize.prizeType) {
            case 'item': {
              const prizeIndex = this.calculatePrizeIndex(prize)
              const itemPrize = items[prize.prizes[prizeIndex]]
              return Promise.all<any>([
                this.config.enableSessionSupport === true && prize.sessionCompleted === true
                  ? events.npc.session.completed.notify({ api, success: true, item: itemPrize })
                  : this.giveItemPrize(api, itemPrize),
              ])
            }
            case 'stateChange': {
              const prizeIndex = this.calculatePrizeIndex(prize)
              const modifier = prize.stateModifiers[prizeIndex]
              const userStateId = prize.prizes[prizeIndex] as UserStateId
              return Promise.all<any>([
                this.config.enableSessionSupport === true &&
                  prize.sessionCompleted === true
                    && events.npc.session.completed.notify({ api, success: true }),
                incUserState(api.getActor(), userStateId, modifier),
              ])
            }
            case 'hashtribute': {
              // unlikely to have multiple options for hashtributes
              // so pick first.
              return Promise.all<any>([
                this.config.enableSessionSupport === true &&
                  prize.sessionCompleted === true &&
                    events.npc.session.completed.notify({ api, success: true }),
                incHashtribute(api.getActor(), prize.prizes[0] as HashtributeId),
              ])
            }
            // no broadcasting of news on jobs as yet
            // we can manually do it in the callbacks ('you have been cursed' etc)
            case 'futureJob': {
              return Promise.all<any>([
                this.config.enableSessionSupport === true &&
                  prize.sessionCompleted === true &&
                    events.npc.session.completed.notify({ api, success: true }),
                this.startJob(api, prize.prizes[0]),
              ])
            }
            default: {
              this.logger.info('Unsupported Prize Type in config')
              return this.config.enableSessionSupport === true && prize.sessionCompleted === true
                ? events.npc.session.completed.notify({ api, success: true })
                : null
              break
            }
          }
        }
      })
  }

  private giveItemPrize = (api: ChatRoomActionContextApi, prize: Item): Promise<any> => {
    return Promise.all([
      api.getChatRoom().saveEffect(animate(prize.s3Key)),
      this.onUpdateInventory(api, prize),
    ])
  }

  // NEWS

  private postItemToNewsfeed = (api: ChatRoomActionContextApi, config : NewsfeedConfig, item: Item, text: string): Promise<any> => {
    const actor = api.getActor()
    return Promise.resolve(null)
      .then(() => {
        setTimeout(() => {
          api.saveNewsfeedItem({
            layout: config.layout || DynamicFeedItemLayout.Dynamic1,
            userId: actor.getId(),
            fromEid: SYSTEM_USER_EID,
            context: { itemName: item.name, actorEid: actor.getEid() },
            rateId: this.config.newsfeedRateLimit ? `${this.config.id}.${api.getActor().getEid()}.${item.name}` : undefined,
            rateLimit: this.config.newsfeedRateLimit,
            metadata: {
              backgroundColor: item.backgroundColor,
              backgroundImage: config.backgroundImageS3Key ? { s3Key: config.backgroundImageS3Key } : undefined,
              image: { s3Key: item.s3Key },
              overlayImage: config.overlayImageS3Key ? { s3Key: config.overlayImageS3Key } : undefined,
              title: item.text,
              description: item.description,
              insetPlayerEid: api.getUnObject().getEid(),
              isNew: true,
              statusText: text,
              action: {
                entityId: item.name,
                entityType: FeedItemActionEntityType.Item,
                type: FeedItemActionType.Backpack,
              },
            },
          })
        }, (config.delay || DEFAULT_NEWSFEED_DELAY) * 1000)
      })
  }

  private postConfigToNewsfeed = (api: ChatRoomActionContextApi, config : NewsfeedConfig, text: string): Promise<any> => {
    const actor = api.getActor()
    return Promise.resolve(null)
      .then(() => {
        setTimeout(() => {
          api.saveNewsfeedItem({
            layout: config.layout || DynamicFeedItemLayout.Dynamic1,
            userId: actor.getId(),
            fromEid: SYSTEM_USER_EID,
            context: { unObjectEid: this.config.id, actorEid: actor.getEid() },
            rateId: this.config.newsfeedRateLimit ? `${this.config.id}.${api.getActor().getEid()}.${config.contextId}` : undefined,
            rateLimit: this.config.newsfeedRateLimit,
            metadata: {
              backgroundColor: config.backgroundColor,
              backgroundImage: config.backgroundImageS3Key ? { s3Key: config.backgroundImageS3Key } : undefined,
              image: config.foregroundImageS3Key ? { s3Key: config.foregroundImageS3Key } : undefined,
              overlayImage: config.overlayImageS3Key ? { s3Key: config.overlayImageS3Key } : undefined,
              title: config.title,
              description: config.description,
              insetPlayerEid: api.getUnObject().getEid(),
              isNew: true,
              statusText: text,
              action: config.actionId && config.actionEntityType && config.actionType ? {
                entityId: config.actionId,
                entityType: config.actionEntityType,
                type: config.actionType,
              } : undefined,
            },
          })
        }, (config.delay || DEFAULT_NEWSFEED_DELAY) * 1000)
      })
  }

  public postToNewsfeed(api: ChatRoomActionContextApi, config : NewsfeedConfig): Promise<any> {
    const text = lookupString(config.stringTags, config.stringOptional || [])
    if(text) {
      switch(config.context) {
        case 'item': {
          return this.postItemToNewsfeed(api, config, items[config.contextId], text)
        }
        case 'hashtribute': {
          return this.postConfigToNewsfeed(api, config, text)
        }
        case 'future': {
          return this.postConfigToNewsfeed(api, config, text)
        }
        case 'future-complete': {
          return this.postConfigToNewsfeed(api, config, text)
        }
        default: {
          this.logger.info('Unsupported Newsfeed Context: ', config.context)
          break
        }
      }
    } else {
      this.logger.info('Could not locate String for tags:', config.stringTags)
    }
    return Promise.resolve(null)
  }

  private broadcastNews = (api: ChatRoomActionContextApi, state: GeneratorEngineState): Promise<any> => {
    if(this.config.newsfeed === undefined || this.config.newsfeed === null || this.engineStatus === EngineStatus.SessionFinished) {
      return null
    }
    const promises : Promise<ConditionResult>[] = []
    Object.values(this.config.newsfeed).forEach((newsConfig, index) => {
      promises.push(this.checkConditions(api, newsConfig.conditions, index, state))
    })

    return Promise.all(promises).then((results) => {
      const conditionResult = results.find((result) => result.result === true)
      if(conditionResult) {
        const newsConfig : NewsfeedConfig = this.config.newsfeed[conditionResult.id]
        newsConfig.debug && this.logger.info(newsConfig.debug)
        return this.postToNewsfeed(api, newsConfig)
      }
      return null
    })
  }

  // CONDITIONS

  private checkConditionPass = (condition: ConditionConfig, value: number) : boolean => {
    return condition.test == 'equalTo'       && value === condition.value ||
    condition.test == 'lessThan'             && value <   condition.value ||
    condition.test == 'greaterThan'          && value >   condition.value ||
    condition.test == 'lessThanOrEqualTo'    && value <=  condition.value ||
    condition.test == 'greaterThanOrEqualTo' && value >=  condition.value
  }

  private checkConditions = async (api: ChatRoomActionContextApi, conditions: Conditions, id: number | string, state?: GeneratorEngineState) : Promise<ConditionResult> => {
    if(!conditions) {
      return { id, result: true }
    }
    const promises : Promise<ConditionResult>[] = []
    conditions.forEach(condition => {
      promises.push(this.checkSingleCondition(api, condition, id, state))
    })
    const results : ConditionResult[] = await Promise.all(promises)
    const conditionResult: ConditionResult = {
      id,
      result: results.filter((conditionresult => conditionresult.result === true)).length === conditions.length,
    }
    return conditionResult
  }

  private checkSingleCondition = async (api: ChatRoomActionContextApi, condition: ConditionConfig, id: number | string, state?: GeneratorEngineState) : Promise<ConditionResult> => {
    if(!condition) {
      return { id, result: false }
    }
    switch (condition.type) {
      case 'userState': {
        if(condition.name === 'no_afflictions') {
          return { id, result: false }
        } else {
          const userState = await getUserState(condition.api === RequiredNodeApi.Actor
            ? api.getActor()
            : api.getChatRoom(),
          condition.name as UserStateId)
          // console.log('userState.numberValue', userState.numberValue)
          if(this.checkConditionPass(condition, userState.numberValue)) {
            // console.log('PASS!')
            return { id, result: true }
          }
          // console.log('FAIL!')
        }
        break
      }
      case 'roomStateContext': {
        if(condition.value == this.stateContext) {
          return { id, result: true }
        }
        break
      }
      case 'counterValue' : {
        const counterValue = await this.getSystemCounterValue(api, condition.name)
        if(this.checkConditionPass(condition, counterValue)) {
          return { id, result: true }
        }
        break
      }
      case 'counterState' : {
        const counter = this.counters[condition.name]
        if(this.checkConditionPass(condition, counter.state)) {
          return { id, result: true }
        }
        break
      }
      case 'booleanPath' : {
        const result = (condition.value as PrizeId[][]).find((value) => _.isEqual(value, state.booleanPath))
        if(result) {
          return { id, result: true }
        }
        break
      }
      case 'session' : {
        // console.log('checking session status...')
        if(this.checkConditionPass(condition, this.engineStatus)) {
          // console.log('PASS!')
          return { id, result: true }
        }
        // console.log('FAIL!')
        break
      }
      // WIP
      // case 'prizeStock' : {
      //   console.log('checking prize stock status...')
      //   if(this.config.prizes) {
      //     const prize = this.config.prizes.find((p) => p.id === condition.name)
      //     if(prize) {
      //       if(this.checkConditionPass(condition, prize.stock)) {
      //         console.log('PASS!')
      //         return { id, result: true }
      //       }
      //     }
      //   }
      //   console.log('FAIL!')
      //   break
      // }
    }
    return { id, result: false }
  }

  // STRINGS

  private replaceWildCards = (conditions: Conditions, options: StringOptions) : Conditions => {
    const configuredConditions : ConditionConfig[] = []
    conditions.forEach(condition => {
      configuredConditions.push(this.replaceSingleConditionWildcard(condition, options))
    })
    return configuredConditions
  }
  
  private replaceSingleConditionWildcard = (condition: ConditionConfig, options: StringOptions) : ConditionConfig => {
    if(condition && condition.name === '*' && options !== undefined) {
      // sanity config check
      const validWildCardData = Object.keys(options).filter((key) => key && options[key]).length == 1
      if(validWildCardData) {
        const name = (options.item?.name || options.move?.name || options.jobId || options.roomStateContext || options.prizeName) as string
        return { ...condition, name }
      } else {
        console.log('Code (Engine) Warning: You should only have one option configured for strings!', options)
        return condition
      }
    }
    return condition
  }

  private conditionalRenderString = async (api: ChatRoomActionContextApi, context: string, config: StringConfig, options?: StringOptions, state?: GeneratorEngineState): Promise<boolean> => {
    if(!config) {
      return null
    }
    const conditions = config.conditions && this.replaceWildCards(config.conditions, options) || null
    if(!conditions || (await this.checkConditions(api, conditions, context, null)).result == true) {
      return this.renderString(api, context, config, options, state)
    }
    return null
  }

  private renderString = async (api: ChatRoomActionContextApi, context: string, config: StringConfig, options?: StringOptions, state?: GeneratorEngineState): Promise<any> => {
    if(!this.config.narrative || !isKeyOf(context, this.config.narrative)) {
      console.log('Could not find context', context, 'in narrative config')
      return null
    }
    const tags = [this.config.id as StringTag, ...config.tags]
    const item = config.referenceItem && options?.item
    const move = config.referenceMove && options?.move
    const vals: HandlebarsValues = { item, move }
    if(item) {
      tags.push(item.name)
    }
    if(move) {
      tags.push(move.name)
    }
    if(config.referenceCounterByInteraction && (move || item)) {
      const name = (move && move.name || item && item.name)
      const value = this.counters[name].state === CounterState.AtMaximum
        ? 0
        : await this.getSystemCounterValue(api, name)
      tags.push(value)
    } else if(config.referenceCounterByName) {
      const name = config.referenceCounterByName
      const value = await this.getSystemCounterValue(api, name)
      tags.push(value)
    }
    if(config.referenceState) {
      const stateConfig = config.referenceState
      
      if(stateConfig.referenceType === 'namedState') {
        if(stateConfig.referenceName) {
          tags.push(stateConfig.userStateId)
        }
        if(stateConfig.referenceValue && stateConfig.api && stateConfig.granularity > 0) {
          const userState = await getUserState(
            stateConfig.api === RequiredNodeApi.Actor ? api.getActor() : api.getChatRoom(),
            stateConfig.userStateId
          )
          const value = (userState.numberValue / stateConfig.granularity)
          tags.push(value)
        }
      } else if(stateConfig.referenceType === 'contextState') {
        if(stateConfig.referenceName) {
          tags.push(this.stateContext)
        }
        if(stateConfig.referenceValue && stateConfig.api && stateConfig.granularity > 0) {
          const userState = await getUserState(
            stateConfig.api === RequiredNodeApi.Actor ? api.getActor() : api.getChatRoom(),
            this.stateContext
          )
          const value = (userState.numberValue / stateConfig.granularity)
          tags.push(value)
        }
      } else {
        console.log('Error: Unsupported UserState Reference Type in StringConfig')
      }
    }
    if(config.referenceBooleanPathHistory) {
      const value = state.booleanPath.reduce((acc, answer) => {
        return `${acc}${answer === 'no' ? '0' : '1'}`
      }, '')
      const tag : StringTag = `answers_${value}` as StringTag
      tags.push(tag)
    }
    return api.getActor().sendMessage({ tags, optional: [], from: api.getUnObject(), values: vals })
  }

  private tryShowString = async (api: ChatRoomActionContextApi, context: string, stringOptions?: StringOptions, state?: GeneratorEngineState): Promise<any> => {
    const config = this.config.narrative[context]
    if(!config) {
      return null
    }
    for await (const configOption of config) {
      const result = await this.conditionalRenderString(api, context, configOption, stringOptions, state)
      if(result != null) {
        return result
      }
    }
    return null
  }

  public showString = async (api: ChatRoomActionContextApi, context: string, options?: StringOptions, state?: GeneratorEngineState): Promise<any> => {
    if(!this.config.narrative || !this.config.narrative[context !== 'job' ? context : options.jobId]) {
      return null
    }

    switch(context) {
      case 'welcome' : {
        return this.tryShowString(api, 'welcome', options, state).then((result) => {
          if(result === null) {
            return this.tryShowString(api, 'roomStateMaximum', {}, state)
          }
        })
      }
      case 'interact': {
        return this.tryShowString(api, 'roomStateMaximum', options, state).then((result) => {
          if(result === null) {
            return this.tryShowString(api, 'interact', options, state).then((result) => {
              if(result === null) {
                return this.tryShowString(api, 'sessionOver', options, state).then((result) => {
                  if(result === null) {
                    return this.tryShowString(api, 'outOfStock', options, state).then((result) => {
                      if(result === null) {
                        return this.tryShowString(api, 'reward', options, state)
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
      case 'job': {
        return this.tryShowString(api, options.jobId, {}, state)
      }
      default: {
        console.log('STRING CURRENTLY NOT SUPPORTED!')
        return null
      }
    }
  }

  // JOBS

  private startAllJobs = (api: ChatRoomActionContextApi): Promise<any> => {
    if(!this.config.jobConfig) {
      return null
    }
    const promises : Promise<any>[] = []
    Object.keys(this.config.jobConfig).forEach(id => {
      const job = this.config.jobConfig[id]
      if(job.startOnEnter) {
        promises.push(this.startJob(api, id))
      }
    })
    return Promise.all(promises)
  }

  private cancelAllJobs = (api: ChatRoomActionContextApi): Promise<any> => {
    if(!this.config.jobConfig) {
      return null
    }
    return Promise.all(Object.keys(this.config.jobConfig).map((id: string) => this.cancelJob(api, id)))
  }

  private cancelJobsOnInteraction = (api: ChatRoomActionContextApi): Promise<any> => {
    if(!this.config.jobConfig) {
      return null
    }
    return Promise.all(Object.keys(this.config.jobConfig).filter((id: string) => this.config.jobConfig[id].cancelOnInteraction)
      .map((id) => this.cancelJob(api, id))
    )
  }

  private restartJobsOnInteraction = (api: ChatRoomActionContextApi): Promise<any> => {
    if(!this.config.jobConfig) {
      return null
    }
    return Promise.all(Object.keys(this.config.jobConfig).filter((id: string) => this.config.jobConfig[id].restartAfterInteraction)
      .map((id) => this.startJob(api, id))
    )
  }

  public runJobCallback = (api: ChatRoomActionContextApi, jobId: string, callbackFn: JobCallback): Promise<any> => {
    const index = jobId.lastIndexOf('.')
    const internalId = jobId.slice(index + 1)
    const conditions = this.config.jobConfig[internalId].conditions
    this.checkConditions(api, conditions, internalId, null).then((passed) => {
      if(passed.result === true) {
        callbackFn(api)
      }
    })

    return null
  }

  public cancelJob = (api: ChatRoomActionContextApi, jobId: string): Promise<any> => {
    this.logger.info('Cancel Job')
    if(!this.config.jobConfig) {
      return null
    }
    const jobConfig = this.config.jobConfig[jobId]
    if(!jobConfig) {
      return null
    }
    const fullId = `${api.getActor().getEid()}.${api.getUnObject().getEid()}.${jobId}`
    return api.cancelJob(fullId)
  }

  public startJob = async (api: ChatRoomActionContextApi, jobId: string): Promise<any> => {
    this.logger.info('Start Job')

    const jobConfig = this.config.jobConfig[jobId]
    if(jobConfig) {
      const conditionsPassed = await this.checkConditions(api, jobConfig.conditions, jobId, null)
      if(conditionsPassed.result == true) {
        const fullId = `${api.getActor().getEid()}.${api.getUnObject().getEid()}.${jobId}`
        return api.scheduleJob({
          id: fullId,
          actionName: jobConfig.action,
          dispatchAt: moment().add(jobConfig.delay).toDate(),
        })
      }
    }
    return null
  }

  // ANIMATIONS

  private animateNPC = (api: ChatRoomActionContextApi, actionName: string) : Promise<any> => {
    const animationConfig = this.config.npcAnimationMap[actionName]
    const effect = misc.deepFreeze({
      type: EffectType.AnimationEffect,
      scope: EntityScope.GlobalScope,
      waitForTap: false,
      isDeletedOnFinish: false,
      metadata: {
        tileName: TILE_NAME_UNOBJECT,
        animationType: AnimationType.NativeAnimatableAnimation,
        animation: animationConfig.animation,
        duration: animationConfig.duration | 2000,
      },
    })

    return api.getChatRoom().saveEffect(effect)
  }
   
  // HELPERS

  private isInteractionDisabled = (action: Interaction) : boolean => {
    const interactionConfig = this.interaction[action]
    const counter : Counter = this.counters && this.counters[action]
    return (this.engineStatus === EngineStatus.SessionFinished && this.config.offerSessionRestart !== true)
      || interactionConfig.disabled
      || (interactionConfig.disableAtCounterMax && counter && counter.state === CounterState.AtMaximum)
  }

  private getCounterForInteraction = (name: string) : Counter => {
    return this.counters![name]
  }

  public registerInteractions = (fnMap: ReactionFnMap) : void => {
    [...this.moves, ...this.items].forEach((interaction) => fnMap[interaction.name] = this.onInteraction)
  }

  private getCooldownDuration = (state: GeneratorEngineState, move: Move) : string => {
    return moment().isBefore(state.cooldowns[move.name])
      ? state.cooldowns[move.name]
      : moment().add(move.cooldown).toISOString()
  }

}
