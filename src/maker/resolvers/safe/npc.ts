import _ from 'lodash'
import {
  ActionResolver,
  ChatRoomActionContextApi,
  NodeApi,
  TileTemplate,
  ActionXStub,
} from '../../types'
import { LoggerFactory } from 'src/utils/logger'
import {
  registerReactionFnMap,
  ReactionFnMap,
  WILDCARD_ACTION,
} from '../../../enginev3'
import * as ResetAction from '../../reactions/action.debug.reset'
import {
  GameState,
  itemTile,
  Actions,
} from './assets'
import { ActionXInstance } from 'src/gql-types'
import { defaultsDeep } from 'src/utils/misc'
import {
  addTilesAnimated,
  deleteTilesAnimated,
  sendNPCMessage,
} from '../../playerHelpers'
import { promiseMap } from 'src/utils/sf.typed'
import { NPCId } from 'src/domain/npcs'

const ID: NPCId = 'my_safe_1621'
const logger = LoggerFactory(ID, 'NPC')

// Tiles render
const SIZE = 18 // %
const COLS = 5
const ROWS = 4
const MARGIN_LEFT = Math.floor(100 - SIZE * COLS) / 2 // %
const MARGIN_TOP = Math.floor(100 - SIZE * ROWS) / 2 // %

const getState = (api: ChatRoomActionContextApi): Promise<GameState> => {
  return Promise
    .all([
      api.getActor().readAllActionInstances(),
      api.getChatRoom().readAllActionInstances(),
    ])
    .then(([inventory, stored]) => {
      const actionNames = _.uniqBy([...inventory, ...stored], 'actionName').map(item => item.actionName)
      return Promise.all([inventory, stored, api.getActionsByName(actionNames)])
    })
    .then(([inventory, stored, actions]): GameState => (
      { inventory, stored, actions }
    ))
}

const itemsToActionXStubs = (items: ActionXInstance[], isGivable: boolean): ActionXStub[] => {
  return _.uniqBy(items, 'actionName').map((item): ActionXStub => (
    { actionName: item.actionName, isGivable }
  ))
}

const makeTiles = (items: ActionXInstance[], state: GameState): TileTemplate[] => {
  let nextIndex = state.stored.length
  return items.map((item) => {
    let index = state.stored.findIndex(i => i.id === item.id)
    if (index === -1) {
      // Append at the end
      index = nextIndex++
    }
    const action = state.actions.find(a => a.name === item.actionName)
    const col = index % COLS
    const row = Math.floor(index / COLS)
    return defaultsDeep({
      name: item.id,
      metadata: {
        image: { s3Key: action?.s3Key },
        containerStyle: {
          left: MARGIN_LEFT + SIZE * col,
          top: MARGIN_TOP + SIZE * row,
          width: SIZE,
          height: SIZE,
        },
      },
    }, itemTile) as TileTemplate
  })
}

const recalculateItems = (api: ChatRoomActionContextApi): Promise<any> => {
  return getState(api).then((state) => {
    const pick: ActionXStub = { actionName: Actions.Pick, isDisabled: !state.stored.length, isUsable: false, isGivable: false }
    return api.getActor().saveCurrentActionStubs({
      staticActionStubs: [pick, ...itemsToActionXStubs(state.stored, false)],
      actionInstanceStubs: itemsToActionXStubs(state.inventory, true),
    })
  })
}

const transfer = (items: ActionXInstance[], from: NodeApi, to: NodeApi): Promise<ActionXInstance[]> => {
  return Promise.all(items.map(item =>
    from.transferActionInstance({ id: item.id, transferToPlayerEid: to.getEid() })
  ))
}

const withdraw = (api: ChatRoomActionContextApi, items: ActionXInstance[], state: GameState): Promise<any> => {
  const room = api.getChatRoom()
  return transfer(items, api.getChatRoom(), api.getActor())
    .then(items => makeTiles(items, state))
    // Create the templates, fetch the tiles 1 by 1
    // TODO: this is SUPER inefficient
    .then(tiles => promiseMap(tiles, tile => room.tile(tile)))
    .then(tiles => deleteTilesAnimated(room, tiles))
    .then(() => recalculateItems(api))
}

const onPick = (api: ChatRoomActionContextApi): Promise<any> => {
  const itemId = api.getCurrentActionTarget()
  logger.info('onPick', itemId)
  return getState(api).then((state) => {
    const item = state.stored.find(i => i.id === itemId)
    return item && withdraw(api, [item], state)
  })
}

const onItem = (api: ChatRoomActionContextApi): Promise<any> => {
  const actionName = api.getCurrentActionName()
  logger.info('onItem', actionName)
  return getState(api).then((state) => {
    const actor = api.getActor()
    const room = api.getChatRoom()

    if (api.isGiveTarget()) {
      const toDeposit = state.inventory.filter(item => item.actionName === actionName)
      return transfer(toDeposit, actor, room)
        .then(() => addTilesAnimated(room, makeTiles(toDeposit, state)))
        .then(() => recalculateItems(api))
    }

    const toWithdraw = state.stored.filter(item => item.actionName === actionName)
    return withdraw(api, toWithdraw, state)
  })
}

const onEnter = (api: ChatRoomActionContextApi): Promise<any> => {
  logger.log('onEnter')
  return Promise.all([
    sendNPCMessage(api, 'Welcome to your safe!'),
    recalculateItems(api),
  ])
}

const onReset = (api: ChatRoomActionContextApi): Promise<any> => {
  logger.log('onReset')
  return getState(api)
    .then(state => {
      if (!state.stored.length) {
        return null
      }
      return Promise.all([
        // Delete all action instances stored
        promiseMap(state.stored, item => (
          api.getChatRoom().deleteActionInstance({ id: item.id })
        )),
        // Delete all tiles
        deleteTilesAnimated(api.getChatRoom(), makeTiles(state.stored, state)),
      ])
    })
    .then(() => onEnter(api))
}

const registerReactionFns = (): Promise<any> => {
  const reactions: ReactionFnMap = {
    [Actions.Pick]: onPick,
    [ResetAction.NAME]: onReset,
    [WILDCARD_ACTION]: onItem,
  }
  return registerReactionFnMap(ID, reactions)
}

const actionResolver: ActionResolver = {
  unObjectId: ID,
  onEnter,
  onLoad: registerReactionFns,
  onReset,
}

export default actionResolver
