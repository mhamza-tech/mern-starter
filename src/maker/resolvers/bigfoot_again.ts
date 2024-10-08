import {
  ActionResolver,
  ChatRoomActionContextApi,
  ActionStubSet,
} from '../types'
import _ from 'lodash'
import { imageS3Key } from '../helpers'
import { registerReactionFnMap, ReactionFnMap, composeReactionFns } from '../../enginev3'
import { hasVisited, setHasVisited } from '../playerHelpers'
import { setGameState, getGameState, RootGameState, applyBackground } from '../chatRoomHelpers'
import { incrementUserXP } from '../experiencePoints'
import { diff_hours, diff_mins, lotties } from '../helpers'
import * as fxAddToInventory from '../fx/animation.addtoinventory'
import * as DebugResetHandler from '../reactions/action.debug.reset'
import { items } from 'src/domain/items'
import { moves } from 'src/domain/moves'

const unObjectId = 'big_foot_1_363'
interface GameState extends RootGameState {
  unShavedBodyParts: string[]
  shavedPartsCount: number
}

const INITIAL_GAME_STATE: GameState = {
  version: 1.1,
  lastVisit: Date.now(),
  unShavedBodyParts: ['back', 'forearms', 'lower shins'],
  shavedPartsCount: 0,
}

const onActionShaveRespone = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const npcName = contextApi.getUnObject().getName()

  const gameState: GameState = await getGameState(contextApi) as GameState

  let { unShavedBodyParts, shavedPartsCount } = gameState

  const nextBodyPart = unShavedBodyParts[0]

  console.log(`before drop unShavedBodyParts=${JSON.stringify(unShavedBodyParts)}`)

  unShavedBodyParts = _.drop(unShavedBodyParts)

  console.log(`after drop unShavedBodyParts=${JSON.stringify(unShavedBodyParts)}`)

  ++shavedPartsCount

  gameState.unShavedBodyParts = unShavedBodyParts
  gameState.shavedPartsCount = shavedPartsCount

  if (shavedPartsCount == INITIAL_GAME_STATE.unShavedBodyParts.length) {
    await contextApi.getActor().sendSystemMessage(`${npcName} says, "thank you for shaving my ${nextBodyPart}. Here's a gift for your troubles."`)

    fxAddToInventory.animate(contextApi, imageS3Key.Pizza)

    await contextApi.getActor().createActionInstance({
      actionName: items.san_francisco_sourdough_bread_85.name,
      trxDescription: `Given to you by ${contextApi.getUnObject().getName()}`,
    })
  } else {
    await contextApi.getActor().sendSystemMessage(`${npcName} says, "thank you, now could you shave my ${unShavedBodyParts[0]}?"`)
  }

  await incrementUserXP(contextApi.getActor(), 10)

  await setGameState(contextApi, gameState)

  return Promise.resolve(null)
}

const onPlayerActionLook = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const npcName = contextApi.getUnObject().getName()

  await contextApi.getActor().sendSystemMessage(`${npcName} grumbles, "what are you looking at?"`)

  return Promise.resolve(null)
}

const reset = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await setGameState(contextApi, {
    ...INITIAL_GAME_STATE,
  } as GameState)

  await setHasVisited(contextApi, false)

  return Promise.resolve(null)
}

const pushPlayerActionSheet = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await contextApi.getActor().saveCurrentActionStubs(actionStubSet)

  return null
}

const enter = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const currentVisitTime = Date.now()

  const gameState = await getGameState(contextApi, INITIAL_GAME_STATE) as GameState
  const npcName = contextApi.getUnObject().getName()
  if (!await hasVisited(contextApi)) {
    contextApi.getActor().sendSystemMessage(`"Hi, would you mind shaving me?", ${npcName} says with a smile.`)

    setHasVisited(contextApi, true)
  }

  if (diff_hours(new Date(gameState.lastVisit), new Date(currentVisitTime)) > 24) {
    await contextApi.getActor().sendSystemMessage(`${npcName} cries, "I thought you left me forever. It seems all my hair has grown back. Would you mind shaving me again?"`)
    _.merge(gameState, { ...INITIAL_GAME_STATE })
  }

  _.merge(gameState, { lastVisit: currentVisitTime })

  await setGameState(contextApi, gameState)

  await applyBackground(contextApi, lotties.clouds_2)

  await pushPlayerActionSheet(contextApi)

  return Promise.resolve(null)
}

const checkIfShouldReset = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const currentVisitTime = Date.now()
  const gameState = await getGameState(contextApi, INITIAL_GAME_STATE) as GameState
  if (diff_mins(new Date(gameState.lastVisit), new Date(currentVisitTime)) >= 5) {
    await reset(contextApi)
  }
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
      reset, enter, postAction
    ),

  } as ReactionFnMap)
}

const localActions = {
  Shave: 'Action.BigFootShave.Shave',
}

const localActionNames = _.values(localActions)

const globalActionNames = [
  moves.tickle_782.name,
]

const actionStubSet: ActionStubSet = {
  staticActionNames: [
    ...localActionNames,
    ...globalActionNames,
  ],
  actionInstanceNames: [],
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter: composeReactionFns(
    checkIfShouldReset,
    enter
  ),
  onReset: null,
  onLoad: registerReactionFns,
}

export default actionResolver
