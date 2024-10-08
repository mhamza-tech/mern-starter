import ExchangeNPC from './common/npc'
import { Actions, Config, JobArgs, GameState, NPCStatus, UnicornLoungeGameState } from './common/types'
import { moves, MoveName, Move } from 'src/domain/moves'
import { NPCId } from 'src/domain/npcs'
import { ChatRoomActionContextApi, TileTemplate } from 'src/types'
import { defaultsDeep } from 'src/utils/misc'
import moment from 'moment'
import _ from 'lodash'
import { resetUserState, getUserState } from 'src/maker/userStates'
import { countdownField, barSessionStateTile } from './common/assets'
import { misc } from 'src/utils'
import { registerReactionFnMap, ReactionFnMap, BeforeEnterAsset } from 'src/enginev3'
import { ActionResolver, ActionXStub, FieldTemplate, JsonObjectFieldMetadata } from 'src/maker/types'
import * as ResetAction from '../../reactions/action.debug.reset'
import { tap_wait } from 'src/utils/sf.typed'
import { assets } from 'src/domain/assets'
import { vstateToAssets } from 'src/maker/vstate'
import vstates from 'src/maker/vstate/states'
import { FieldType, EntityScope } from 'src/gql-types'
import { incCounter, resetCounter, getCounter } from 'src/maker/counters'

const ID: NPCId = 'stinkys_bar_1547'

class UnicornLoungeNPC extends ExchangeNPC {

  public constructor(config: Config) {
    super(config)
  }

  readonly dropTileTemplate: TileTemplate
  readonly weightedChoices: Move[]
  
  private readonly gameStateField = misc.deepFreeze<FieldTemplate<JsonObjectFieldMetadata>>({
    type: FieldType.JsonObjectField,
    name: 'gamestate.unicorn.lounge',
    scope: EntityScope.GlobalScope,
    metadata: { version: 1.0, state: {} },
  })
  
  protected defaultState = (defeatTime: moment.Moment, wastedValue: number): UnicornLoungeGameState => {
    const cooldowns = {}
    menu.forEach((name) => cooldowns[name] = moment().toISOString())
    return misc.deepFreeze<UnicornLoungeGameState>({
      npcCooldown: false,
      cooldowns,
      defeatTime: defeatTime.toISOString(),
      matchId: Date.now(),
      npcState: wastedValue < 100 ? NPCStatus.NPCSessionActive : NPCStatus.NPCSessionFinished,
      drinkNames: this.nextMoves(wastedValue),
    })
  }

  protected getState = (api: ChatRoomActionContextApi): Promise<any> => {
    return api.getChatRoom().field(this.gameStateField)
      .then((field) : UnicornLoungeGameState => field.metadata.state)
  }
  
  protected saveState = (api: ChatRoomActionContextApi, state: UnicornLoungeGameState) : Promise<any> => {
    const room = api.getChatRoom()
    return room.saveField(defaultsDeep({ metadata: { state } }, this.gameStateField))
      .then((field) : UnicornLoungeGameState => field.metadata.state)
  }

  protected onBeforeEnter = async (): Promise<BeforeEnterAsset[]> => {
    this.logger.log('onBeforeEnter')
    const cache : BeforeEnterAsset[] = _.flatMap([vstates.pickable, vstates.pickup], vstateToAssets)
    cache.push(
      assets.closed_sign_749.s3Key,
      assets.open_sign_750.s3Key,
      ...menu.map((moveName) => moves[moveName].s3Key),
    )
    return cache
  }

  protected onEnter = async (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onEnter Unicorn Lounge')
    const defeatTime = moment().add({ minutes: 1 })
    // undelete this like to reset wasted state for testing
    //resetUserState(api.getActor(), 'wasted_304') // temp!!!! DELETE DELETE DELETE!
    const wastedState = await getUserState(api.getActor(), 'wasted_304')
    const defaultState = this.defaultState(defeatTime, wastedState.numberValue)
    const id = `${api.getActor().getEid()}.${api.getUnObject().getEid()}.${defaultState.matchId}`
    return Promise.all([
      wastedState.numberValue < 100 && api.cancelJob(id).then(() => api.scheduleJob({
        id,
        actionName: Actions.GameOver,
        // todo
        args: { matchId: defaultState.matchId } as JobArgs,
        dispatchAt: defeatTime.toDate(),
      })),
      wastedState.numberValue < 100
        ? this.showString(api, 'welcome')
        : this.showString(api, 'wasted'),
      this.saveState(api, defaultState),
      resetCounter(api.getChatRoom(), ['drinkAlcohol']),
    ]).then(() => this.updateUI(api))
  }

  private readonly openClosedKeys = [assets.closed_sign_749.s3Key, assets.open_sign_750.s3Key]

  protected updateUI = async (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('updateUI')
    const room = api.getChatRoom()
    const actor = api.getActor()
    const state = await this.getState(api)
    const openClosedTile = misc.cloneDeep(barSessionStateTile)
    openClosedTile.metadata.image.s3Key = this.openClosedKeys[state.npcState]

    return Promise.all([
      room.saveTile(openClosedTile),
      room.saveField(defaultsDeep({
        isDeleted: state.npcState == NPCStatus.NPCSessionFinished,
        metadata: { expiryDateTime: state.defeatTime },
      }, countdownField)),

      actor.saveCurrentActionStubs({
        staticActionStubs: state.drinkNames.map((name: MoveName): ActionXStub => ({ actionName: name, isUsable: true, isGivable: false, isDisabled: state.npcState === NPCStatus.NPCSessionFinished, disabledUntil: state.cooldowns[name] })),
      }),
    ])
  }

  protected onReset = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onReset')
    const actor = api.getActor()
    return Promise.all([
      resetUserState(actor, 'wasted_304'),
    ])
  }

  protected onMovePerformed = async (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onMovePerformed')
    const actionName: MoveName = api.getCurrentActionName() as MoveName
    const actor = api.getActor()
    const state = await this.getState(api)
    if (actionName != undefined) {
      // Get the current move...
      const currentMove = moves[actionName]
      // Get the new moves...
      const wastedState = await getUserState(actor, 'wasted_304')
      const newMoves : string[] = this.nextMoves(wastedState.numberValue)
      // Make all new moves cooldown
      const cooldowns = Object.fromEntries(newMoves.map((name) => [name, moment().add(moves[name].cooldown, 'seconds').toISOString()]))
      const newState = defaultsDeep({ cooldowns, drinkNames: newMoves }, state)
      return Promise.all([

        // what I want to do here is display a congrats! you WON! message, however there are
        // two issues, one, the state is not updated by this point and I can't see how
        // to find out if the current move, plus the current state will cause 100%
        // SECONDLY! There is a system message that appears at the same time occasionally
        // that will clash with my 'won' message. i.e. 'your so wasted, unlocked news feed item'
        this.showString(api, 'barmenu', currentMove, {mentioned: true}),

        this.saveState(api, newState),
        weights[currentMove.name].alcohol && incCounter(api.getChatRoom(), ['drinkAlcohol']), 
      ]).then(() => this.updateUI(api))
    }

    return null
  }

  private onGameOver = (api: ChatRoomActionContextApi, state: GameState): Promise<any> => {
    this.logger.info('onGameOver', state.matchId)
    const newState = defaultsDeep({npcState: NPCStatus.NPCSessionFinished}, state)
    return Promise.all([
      getCounter(api.getChatRoom(), 'drinkAlcohol').then((numberValue) => {
        if(numberValue > 0) {
          this.showString(api, 'bar_closed')
        }
      }),
      this.saveState(api, newState),
    ]).then(() => this.updateUI(api))
  }

  private onJobGameOver = (api: ChatRoomActionContextApi): Promise<any> => {
    const { matchId } = api.getCurrentAction().args as JobArgs
    this.logger.info('onGameOver', matchId)

    return this.getState(api)
      .then((state) => {
        // Ignore a defeat for a previous match or one that was already decided
        if (state.matchId !== matchId || state.npcState !== NPCStatus.NPCSessionActive) {
          throw new Error('Invalid state')
        }
        return state
      })
      .then(tap_wait(() => api.getActor().sendPing()))
      .then(state => this.onGameOver(api, state))
      // If either the match was over or the user is not here, ignore the job
      .catch(() => {})
  }

  private nextMoves = (wastedState: number): string[] => {
    const selectionPool = getWeightedChoices(wastedState)
    const choices : string[] = []
    _.times(4, () => {
      choices.push(_.sample(selectionPool.filter((name) => !choices.includes(name))))
    })
    return choices
  }
  
  protected registerReactionFns = (): Promise<any> => {
    const reactions: ReactionFnMap = {
      [ResetAction.NAME]: this.onReset,
      [Actions.MessageOnOffered]: this.onExchangeAnimationFinished,
      [Actions.GameOver]: this.onJobGameOver,
    }
    
    menu.forEach((moveName) => reactions[moveName] = this.onMovePerformed)

    return registerReactionFnMap(this.id, reactions)
  }

  public createResolver = (): ActionResolver => {
    return {
      unObjectId: this.id,
      onEnter: this.onEnter,
      onLoad: this.registerReactionFns,
      onReset: this.onReset,
      onBeforeEnter: this.onBeforeEnter,
    }
  }

}

const weights = {
  'drink_soft_drink_1_1708': { weight: 40, alcohol: false},
  'drink_soft_drink_2_1709': { weight: 40, alcohol: false},
  'drink_water_1667': { weight: 40, alcohol: false},
  'eat_peanuts_1669': { weight: 40, alcohol: false},
  'chug_beer_960': { weight: 20, alcohol: true},
  'drink_wine_in_a_can_1705': { weight: 20, alcohol: true},
  'drink_whiskey_1710': { weight: 10, alcohol: true},
  'drink_vodka_1668': { weight: 10, alcohol: true},
  'drink_high_strength_cocktail_1707': { weight: 20, alcohol: true},
}

const menu = [
  'chug_beer_960',
  'drink_vodka_1668',
  'eat_peanuts_1669',
  'drink_water_1667',
  'drink_wine_in_a_can_1705',
  'drink_soft_drink_1_1708',
  'drink_soft_drink_2_1709',
  'drink_high_strength_cocktail_1707',
  'drink_whiskey_1710',
]

const getWeightedChoices = (wastedState: number) : string[] => {
  const difficulty = 1 - wastedState / 100
  const weightedChoices : string[] = []
  menu.forEach((name: string) => {
    const weight = weights[name].weight
    const alcohol = weights[name].alcohol
    weightedChoices.push(
      ..._.times(alcohol ? weight * difficulty : weight, () => name)
    )
  })
  return weightedChoices
}

const npc = new UnicornLoungeNPC({
  npcId: ID,
  moves: menu.slice(0, 4).map(moveName => moves[moveName]),
  celebrationEffectTemplate: null,
  prizeEffectTemplate: null,
})

export default npc.createResolver()
