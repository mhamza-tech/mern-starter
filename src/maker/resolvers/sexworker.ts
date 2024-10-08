/**
 * @rob4lderman
 * oct2019
 *
 * EXAMPLE.
 *
 */

import {
  ActionResolver,
  ChatRoomActionContextApi,
  ActionStubSet,
} from '../types'
import _ from 'lodash'
import { registerReactionFnMap, ReactionFnMap, composeReactionFns } from '../../enginev3'
import { hasVisited, setHasVisited, getActionButtonInventory } from '../playerHelpers'
import { incUserState, resetUserState } from '../userStates'

import {
  diff_hours,
  lotties,
} from '../helpers'

import { getGameState, setGameState, RootGameState, applyBackground } from '../chatRoomHelpers'
import { LoggerFactory } from 'src/utils/logger'
import { moves } from 'src/domain/moves'

interface GameState extends RootGameState {
  smallTalkCount: number
}

const INITIAL_GAME_STATE: GameState = {
  version: 1.0,
  lastVisit: Date.now(),
  smallTalkCount: 0,
}

const logger = LoggerFactory('sexworker', 'NPC')
const unObjectId = 'ginger_1632'

// const thoughtBubbleTile: SaveTileInputInContext = {
//     name: 'thoughtBubbleTile',
//     type: TileType.ImageTile,
//     image: {
//         uri: 'https://unrealfun.imgix.net/overlay/though_bubble_1.png',
//     },
//     metadata: {
//         containerStyle: {
//             backgroundColor: 'transparent',
//             top: 10,
//             right: 30,
//             height: 20,
//             width: 20,
//             zIndex: 5,
//         },
//     },
// }

const pushPlayerActionSheet = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  // const gameState: GameState = await getGameState(contextApi) as GameState
  // const hasBeer: boolean = (await getActionButtonInventory(contextApi.getActor(), RewardedGiveBeerHandler.NAME)) > 0
  const hasWhiskey: boolean = (await getActionButtonInventory(contextApi.getActor(), moves.drink_whiskey_1710.name)) > 0

  await contextApi.getActor().setGlobalActions([
    {
      name: moves.kiss_53.name,
      isDeleted: false,
      isDisabled: false,
    },
    {
      name: moves.drink_whiskey_1710.name,
      isDeleted: !hasWhiskey,
      isDisabled: false,
    },
  ])

  await contextApi.getActor().saveCurrentActionStubs(actionStubSet)

  return Promise.resolve(null)
}

const onPlayerActionKiss = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.all([
    contextApi.getActor().sendSystemMessage('Your lips touch.'),
    // setTimeout(() => { makerApi.createChatRoomComment(contextApi.getPartner().getNode() as any, `[GIGGLES]`, contextApi.getContext()) }, 1000),
    // contextApi.createNewsfeedItemUnObjectCard('{{ linkName actor }} kissed a hooker.'),
  ])
}

const onPlayerActionGiveAlcohol = async (alcoholName: string, contextApi: ChatRoomActionContextApi): Promise<any> => {
  setTimeout(() => {
    // contextApi.sendUnObjectComment(_.isEqual('beer', alcoholName) ? `[CHUGS BEER]` : _.isEqual('whiskey', alcoholName) ? `[SHOOTS WHISKEY]` : `[DRINKS THE DRINK]`)
    incUserState(contextApi.getPartner(), 'wasted_304',
      _.isEqual('beer', alcoholName) ? 1 : _.isEqual('whiskey', alcoholName) ? 2 : 1
    )
  }, 10 * 1000)

  return contextApi.getActor().sendSystemMessage(`Thanks for the ${alcoholName} but you don't have to get me drunk to get a piece 😉`)
}

const onActionResetChatRoom = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await contextApi.getActor().sendSystemMessage('Playroom Has been Reset')

  await setHasVisited(contextApi, false)

  await resetUserState(contextApi.getActor(), 'herpes_197')

  await onEnter(contextApi)

  return Promise.resolve(null)
}

// const onComment = async (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
//     return Promise.resolve(null)
// }

// const onReset = (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
//     ret  urn null
// }

// const preAction = (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
//     // log('avocado.preAction');
//     return Promise.resolve('hi from preAction')
// }

const postAction = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const allPromises = []

  allPromises.push(pushPlayerActionSheet(contextApi))

  return Promise.all(allPromises)
}

const actionStubSet: ActionStubSet = {
  staticActionNames: [
    moves.kiss_53.name,
  ],
  actionInstanceNames: [
    moves.drink_whiskey_1710.name,
  ],
}

const onLoad = (): Promise<any> => {
  logger.debug('sex worker.onLoad')
  return Promise.resolve(registerReactionFns())
}

const onEnter = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const allPromises = []
  const currentVisitTime = Date.now()
  const gameState = await getGameState(contextApi, INITIAL_GAME_STATE) as GameState
  // const traitFriendlyValue: number = (await getHashtribute(contextApi.getActor(), 'friendly_178')).numberValue

  const introMessages: string[] = [
    'Gimme things and I\'ll make you happy.',
    'What\'s your fantasy?!',
    'Take me home with you.',
  ]

  if (!await hasVisited(contextApi)) {
    await Promise.all([
      contextApi.getActor().sendSystemMessage(_.sample(introMessages)),
      // contextApi.sendUnObjectComment(_.sample(introMessages)),
      // contextApi.createNewsfeedItemUnObjectCard(`{{ linkName actor }} is visiting with a sex worker.`),
      setHasVisited(contextApi, true),

    ])
  } else {
    diff_hours(new Date(gameState.lastVisit), new Date(currentVisitTime)) > 24
      && await contextApi.getActor().sendSystemMessage('Welcome back!')
  }

  await applyBackground(contextApi, lotties.hearts_pluses)

  await setGameState(contextApi, { ...gameState, lastVisit: currentVisitTime })

  await contextApi.getActor().saveCurrentActionStubs(actionStubSet)

  allPromises.push(pushPlayerActionSheet(contextApi))

  return Promise.all(allPromises)
}

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {
    [moves.kiss_53.name]: composeReactionFns(
      onPlayerActionKiss, postAction
    ),

    [moves.drink_whiskey_1710.name]: composeReactionFns(
      _.partial(onPlayerActionGiveAlcohol, 'whiskey'), postAction
    ),

  } as ReactionFnMap)
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onReset: onActionResetChatRoom,
  onLoad,
}

export default actionResolver
