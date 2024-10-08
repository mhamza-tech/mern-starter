import { Item, ItemName, items } from 'src/domain/items'
import { NPCId, npcs } from 'src/domain/npcs'
import { StringTag } from 'src/domain/strings'
import { BeforeEnterAsset, ReactionFnMap, registerReactionFnMap, WILDCARD_ACTION } from 'src/enginev3'
import { SYSTEM_USER_EID } from 'src/env'
import { Gender } from 'src/gql-types'
import { FTUE, getCounter, incCounter, resetCounter } from 'src/maker/counters'
import * as ResetAction from 'src/maker/reactions/action.debug.reset'
import { ActionResolver, ActionXStub, ChatRoomActionContextApi } from 'src/maker/types'
import { AppLogger, LoggerFactory } from 'src/utils/logger'
import { deepFreeze } from 'src/utils/misc'
import { FEMALE_ITEMS, MALE_ITEMS, STARTING_ITEMS, STEPS } from './assets'
import { Config, GameState } from './types'
import { delay } from 'src/utils/async_utils'
import { MoveName, moves } from 'src/domain/moves'

class ClassroomNPC {

  private readonly config: Readonly<Config>
  private readonly id: NPCId
  private readonly logger: AppLogger

  public constructor(config: Config) {
    this.config = deepFreeze(config)
    this.id = this.config.npc.id
    this.logger = LoggerFactory(this.id, 'NPC')
  }

  private getState = (api: ChatRoomActionContextApi): Promise<GameState> => {
    return getCounter(api.getActor(), FTUE).then(step => ({ step }))
  }

  private incState = async (api: ChatRoomActionContextApi): Promise<any> => {
    const step = await incCounter(api.getActor(), FTUE)
    this.logger.info('Entered state', step)
    await this.notify(api, step - 1, 'success')
    await delay(4000)
    return Promise.all([
      this.notify(api, step, 'help'),
      this.updateUI(api, { step }),
    ])
  }

  private notify = (api: ChatRoomActionContextApi, step: number, tag: StringTag): Promise<any> => {
    return api.getActor().sendMessage({ tags: ['ftue', 'target_actor', tag, step] })
  }

  private giveItems = (api: ChatRoomActionContextApi, items: Item[]): Promise<any> => {
    const promises: Promise<any>[] = items.map(item => (
      api.getActor().createActionInstance({ creatorEid: SYSTEM_USER_EID, actionName: item.name })
    ))
    return Promise.all([
      ...promises,
    ])
  }

  private actionToStub = (actionName: string, isGivable: boolean, isUsable: boolean): ActionXStub => {
    return { actionName, isGivable, isUsable, isDisabled: !isGivable && !isUsable }
  }

  private updateUI = (api: ChatRoomActionContextApi, state: GameState): Promise<any> => {
    const step = STEPS[state.step]
    return api.getActor().saveCurrentActionStubs({
      staticActionStubs: step.moves.map(move => this.actionToStub(move.name, false, true)),
      actionInstanceStubs: step.items.map(item => this.actionToStub(item.name, false, true)),
    })
  }

  private onItem = async (api: ChatRoomActionContextApi): Promise<any> => {
    return this.getState(api).then(state => this.updateUI(api, state))
  }

  private onStartingItem = async (api: ChatRoomActionContextApi): Promise<any> => {
    const item = items[api.getCurrentActionName() as ItemName]
    this.logger.log('onStartingItem', item.name)
    const state = await this.getState(api)
    if (state.step !== 1) {
      return
    }
    if (item.effectVState) {
      await delay(item.effectVState.duration)
    }
    const gender: Gender = api.getActor().getKey('gender')
    return Promise.all([
      // #1->#2
      this.incState(api),
      this.giveItems(api, gender === Gender.Male ? MALE_ITEMS : FEMALE_ITEMS),
    ])
  }

  private onMove = async (api: ChatRoomActionContextApi): Promise<any> => {
    const move = moves[api.getCurrentActionName() as MoveName]
    this.logger.log('onMove', move.name)
    const state = await this.getState(api)
    if (state.step !== 3) {
      return
    }
    await delay(move.effectVState.duration)
    // #3->4
    return this.incState(api)
  }

  private onBeforeEnter = async (): Promise<BeforeEnterAsset[]> => {
    this.logger.log('onBeforeEnter')
    return []
  }

  private onEnter = (api: ChatRoomActionContextApi): Promise<any> => {
    return this.getState(api).then((state): Promise<any> => {
      const { step } = state
      this.logger.log('onEnter', step)
      /**
       * FTUE Steps
       * - #0->#1: enter room, get the free item
       * - #1->#2: use the free item (-> get gender-based items)
       * - #2->#3: visit the NPC again and receive more items
       * - #3->#4: use a move
       */
      switch (step) {
        case 0:
          return Promise.all([
            // #0->#1
            this.incState(api),
            this.giveItems(api, STARTING_ITEMS),
          ])
        case 1:
          return api.getActor().readActionInstances(STARTING_ITEMS[0].name).then((list) => {
            return Promise.all([
              // If they lost the item, give another
              list.length === 0 && this.giveItems(api, STARTING_ITEMS),
              this.notify(api, step, 'help'),
              this.updateUI(api, state),
            ])
          })
        case 2:
          return Promise.all([
            // #2->#3
            this.incState(api),
            // this.giveItems(api, EXTRA_ITEMS),
          ])
        default:
          return Promise.all([
            this.notify(api, step, 'help'),
            this.updateUI(api, state),
          ])
      }
    })
  }

  private onReset = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.log('onReset')
    return resetCounter(api.getActor(), FTUE).then(() => this.onEnter(api))
  }

  private registerReactionFns = (): Promise<any> => {
    const reactions: ReactionFnMap = {
      [ResetAction.NAME]: this.onReset,
      [STARTING_ITEMS[0].name]: this.onStartingItem,
      [WILDCARD_ACTION]: this.onItem,
    }
    for (const step of STEPS) {
      for (const move of step.moves) {
        reactions[move.name] = this.onMove
      }
    }
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

export default new ClassroomNPC({ npc: npcs.classroom_1773 }).createResolver()
