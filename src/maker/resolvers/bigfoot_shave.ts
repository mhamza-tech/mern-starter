import {
  ActionResolver,
  ChatRoomActionContextApi,
} from '../types'
import _ from 'lodash'

import { registerReactionFnMap, ReactionFnMap, composeReactionFns } from '../../enginev3'
import { hasVisited, setHasVisited, getActionButtonInventory } from '../playerHelpers'
import { setGameState, getGameState, applyBackground, RootGameState } from '../chatRoomHelpers'
import { incrementUserXP } from '../experiencePoints'
import { diff_hours, lotties } from '../helpers'
import * as DebugResetHandler from '../reactions/action.debug.reset'
import { items } from 'src/domain/items'
import { moves } from 'src/domain/moves'

const unObjectId = 'big_foot_2_1628'
interface GameState extends RootGameState {
  unShavedBodyParts: string[]
  shavedPartsCount: number
}

const INITIAL_GAME_STATE: GameState = {
  version: 1.1,
  lastVisit: Date.now(),
  unShavedBodyParts: ['back', 'armpits', 'balls'],
  shavedPartsCount: 0,
}

const onActionShaveRespone = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const gameState: GameState = await getGameState(contextApi) as GameState

  const hasPizza: boolean = (await getActionButtonInventory(contextApi.getActor(), items.san_francisco_sourdough_bread_85.name)) > 0

  let { unShavedBodyParts, shavedPartsCount } = gameState

  const nextBodyPart = unShavedBodyParts[0]

  const qtyDescription = hasPizza ? 'another' : 'a'

  console.log(`before drop unShavedBodyParts=${JSON.stringify(unShavedBodyParts)}`)

  unShavedBodyParts = _.drop(unShavedBodyParts)

  console.log(`after drop unShavedBodyParts=${JSON.stringify(unShavedBodyParts)}`)

  ++shavedPartsCount

  gameState.unShavedBodyParts = unShavedBodyParts
  gameState.shavedPartsCount = shavedPartsCount

  if (shavedPartsCount == INITIAL_GAME_STATE.unShavedBodyParts.length) {
    await contextApi.sendUnObjectComment(`Thank you for shaving my sweaty ${nextBodyPart}. I've given you ${qtyDescription} slice of pizza for your troubles.`)

    await contextApi.getActor().createActionInstance({
      actionName: items.san_francisco_sourdough_bread_85.name,
      trxDescription: `Given to you by ${contextApi.getUnObject().getName()}`,
    })
  } else {
    await contextApi.sendUnObjectComment(`Thank you for shaving my sweaty ${nextBodyPart}. I've given you ${qtyDescription} slice of pizza for your troubles.\n\nWould you mind shaving my ${unShavedBodyParts[0]} next?`)

    await contextApi.getActor().createActionInstance({
      actionName: items.san_francisco_sourdough_bread_85.name,
      trxDescription: `Given to you by ${contextApi.getUnObject().getName()}`,
    })
  }

  await incrementUserXP(contextApi.getActor(), 10)

  await setGameState(contextApi, gameState)

  return Promise.resolve(null)
}

const onPlayerActionLook = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await contextApi.sendUnObjectComment('I\'m a hairy creature that lives in the Pacific Northwest.')

  return Promise.resolve(null)
}

const onPlayerActionFeedPizza = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await contextApi.sendUnObjectComment('Thanks, but I\'m not quite hungry... for pizza')

  return Promise.resolve(null)
}

const onActionResetChatRoom = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await setGameState(contextApi, {
    ...INITIAL_GAME_STATE,
  } as GameState)

  await setHasVisited(contextApi, false)

  await contextApi.getActor().sendSystemMessage('Playroom has been Reset')

  await onEnter(contextApi)

  return Promise.resolve(null)
}

const pushPlayerActionSheet = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const gameState = await getGameState(contextApi) as GameState

  const hasPizza: boolean = (await getActionButtonInventory(contextApi.getActor(), items.san_francisco_sourdough_bread_85.name)) > 0

  const { unShavedBodyParts } = gameState

  await Promise.all([
    contextApi.getActor().setGlobalActions([
      {
        name: moves.tickle_782.name,
        isDeleted: false,
        isDisabled: false,
      },
      {
        name: items.san_francisco_sourdough_bread_85.name,
        isDeleted: /* shavedPartsCount == 0 && */ !hasPizza,
        isDisabled: false,
      },
      {
        name: DebugResetHandler.NAME,
        isDeleted: false,
        isDisabled: false,
      },
    ])
    ,
    contextApi.getActor().setLocalAction({
      name: localActions.Shave,
      isDeleted: false,
      isDisabled: unShavedBodyParts.length == 0,
    }),

  ])

  await contextApi.getActor().setCurrentActionEdges(_.union(localActionNames, globalActionNames))

  return null
}

const onEnter = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const currentVisitTime = Date.now()

  const gameState = await getGameState(contextApi, INITIAL_GAME_STATE) as GameState

  if (!await hasVisited(contextApi)) {
    contextApi.sendUnObjectComment(
      '👋🏼 Would you mind shaving me? 😍😘'
    )

    setHasVisited(contextApi, true)
  }

  if (diff_hours(new Date(gameState.lastVisit), new Date(currentVisitTime)) > 24) {
    await contextApi.sendUnObjectComment('I thought you left me forever. It seems all my hair has grown back. Would you mind shaving me again?')
    _.merge(gameState, { ...INITIAL_GAME_STATE })
  }

  _.merge(gameState, { lastVisit: currentVisitTime })

  await setGameState(contextApi, gameState)

  await applyBackground(contextApi, lotties.clouds_2)

  await contextApi.getActor().readOrCreateLocalActionEdges(localActionNames)

  await pushPlayerActionSheet(contextApi)

  return Promise.resolve(null)
}

const postAction = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await pushPlayerActionSheet(contextApi)

  return Promise.resolve(null)
}

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {

    [localActions.Shave]: composeReactionFns(_.partial(onActionShaveRespone), postAction)

    , [moves.tickle_782.name]: composeReactionFns(
      onPlayerActionLook, postAction
    )

    , [DebugResetHandler.NAME]: composeReactionFns(
      onActionResetChatRoom, postAction
    )

    , [items.san_francisco_sourdough_bread_85.name]: composeReactionFns(onPlayerActionFeedPizza, postAction),

  } as ReactionFnMap)
}

const localActions = {
  Shave: 'Action.BigFootShave.Shave',
}

const localActionNames = _.values(localActions)

const globalActionNames = [
  moves.tickle_782.name,
  DebugResetHandler.NAME,
  items.san_francisco_sourdough_bread_85.name,
]

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onReset: null,
  onLoad: registerReactionFns,
}

export default actionResolver
