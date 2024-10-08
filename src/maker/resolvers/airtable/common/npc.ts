import moment from 'moment'
import { AppLogger, LoggerFactory } from 'src/utils/logger'
import { getModifiers, hasModifiers } from 'src/utils/gameLogic'
import { BeforeEnterAsset, ReactionFnMap, registerReactionFnMap } from 'src/enginev3'
import { moves, MoveName, Move } from 'src/domain/moves'
import { items, ItemName, Item } from 'src/domain/items'
import { ModifierId } from 'src/domain/modifiers'
import { NPCId } from 'src/domain/npcs'
import { deepFreeze, defaultsDeep } from 'src/utils/misc'
import { events } from 'src/events'
import { getMovesAssets } from 'src/maker/playerHelpers'
import * as ResetAction from 'src/maker/reactions/action.debug.reset'
import { ActionResolver, ChatRoomActionContextApi, ActionXStub } from 'src/maker/types'
import { Config, FullConfig, GameState } from './types'
import { gameStateField } from './assets'
import { ActionXModifier } from 'src/gql-types'
import { HandlebarsValues } from 'src/types'
import { promiseMap } from 'src/utils/sf.typed'
import { LOCAL_DEV_ENV } from 'src/env'

export default class AirtableNPC {

  private readonly config: Readonly<FullConfig>
  private readonly id: NPCId
  private readonly logger: AppLogger

  public constructor(config: Config) {
    this.config = this.getConfig(config)
    this.id = this.config.npc.id
    this.logger = LoggerFactory(this.id, 'NPC')
  }

  private getConfig = (config: Config): Readonly<FullConfig> => {
    const moveList = Object.values(moves).filter(move => hasModifiers(move.name))
    if (LOCAL_DEV_ENV) {
      // TODO: Solve from outside the NPC
      moveList.push(
        moves.debug_reset_states_2160,
        moves.debug_reset_counters_2161,
        moves.debug_inspect_states_2159,
      )
    }
    return deepFreeze({
      ...config,
      items: Object.values(items).filter(item => hasModifiers(item.name)),
      moves: moveList,
    })
  }
  
  private getState = (api: ChatRoomActionContextApi): Promise<GameState> => {
    return api.getChatRoom().field(gameStateField).then((field) => field?.metadata?.state)
  }

  private actionToStub = (actionName: string, isUsable: boolean, disabledUntil: string, modifiers: ActionXModifier[], isGivable: boolean): ActionXStub => {
    // TODO: isGivable is temporary, is going away soon
    return { actionName, isGivable, isUsable, disabledUntil, isDisabled: !isGivable && !isUsable && !modifiers.length, modifiers: modifiers }
  }

  private handles = (api: ChatRoomActionContextApi, actionName: string, modifierId?: ModifierId): boolean => {
    const args = api.getArgs() || {}
    const { input } = args
    // Hack the internal representation of the action and target
    args.input = { name: actionName, target: modifierId }
    const res = events.room.action.receiving.handles({ api })
    args.input = input
    return res
  }

  private generateStubs = (actions: (Item|Move)[], api: ChatRoomActionContextApi, state: GameState, isGivable: boolean): Promise<ActionXStub[]> => {
    const actor = api.getActor()
    return promiseMap(actions, async ({ name }) => {
      const values: HandlebarsValues = { itemName: name as ItemName, moveName: name as MoveName }
      const modifiers: ActionXModifier[] = []
      for (const modifier of getModifiers(name)) {
        if (this.handles(api, name, modifier.id)) {
          modifiers.push({
            id: modifier.id,
            name: await actor.resolveText(modifier.name, values),
            description: modifier.description,
          })
        }
      }
      return this.actionToStub(name, this.handles(api, name), state.cooldowns[name], modifiers, isGivable)
    })
      .then(stubs => stubs.sort((a, b) => !a.isDisabled && b.isDisabled ? -1 : 0))
  }

  private updateActionStubs = (api: ChatRoomActionContextApi, state: GameState): Promise<any> => {
    const isM2M = api.isSelfChatRoom()
    return Promise
      .all([
        this.generateStubs(this.config.moves, api, state, false),
        this.generateStubs(this.config.items, api, state, !isM2M),
      ])
      .then(([staticActionStubs, actionInstanceStubs]) => (
        api.getActor().saveCurrentActionStubs({ staticActionStubs, actionInstanceStubs })
      ))
  }

  private updateUI = (api: ChatRoomActionContextApi, state: GameState): Promise<any> => {
    return Promise.all([
      this.updateActionStubs(api, state),
      // Save the game state
      api.getChatRoom().saveField(defaultsDeep({ metadata: { state } }, gameStateField)),
    ])
  }

  private onItem = (api: ChatRoomActionContextApi): Promise<any> => {
    const item = items[api.getCurrentActionName() as ItemName]
    this.logger.log('onItem', item.name)
    return this.getState(api).then(state => this.updateUI(api, state))
  }

  private onMove = async (api: ChatRoomActionContextApi): Promise<any> => {
    const move = moves[api.getCurrentActionName() as MoveName]
    this.logger.log('onMove', move.name)
    if (move.cooldown) {
      const state = await this.getState(api)
      state.cooldowns[move.name] = moment().add(move.cooldown).toISOString()
      return this.updateUI(api, state)
    }
  }

  private onBeforeEnter = async (): Promise<BeforeEnterAsset[]> => {
    this.logger.log('onBeforeEnter')
    // TODO: Should we preload items and their VStates?
    return getMovesAssets(this.config.moves)
  }

  private onEnter = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.log('onEnter')
    return this.updateUI(api, { cooldowns: {} })
  }

  private onReset = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.log('onReset')
    return this.onEnter(api)
  }

  private registerReactionFns = (): Promise<any> => {
    const reactions: ReactionFnMap = {
      [ResetAction.NAME]: this.onReset,
    }
    for (const move of this.config.moves) {
      reactions[move.name] = this.onMove
    }
    for (const item of this.config.items) {
      reactions[item.name] = this.onItem
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
