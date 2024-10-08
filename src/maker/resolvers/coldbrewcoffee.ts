import _ from 'lodash'
import { ActionResolver, ChatRoomActionContextApi, ActionStubSet } from '../types'
import { composeReactionFns, registerReactionFnMap } from '../../enginev3'
import { hasVisited, setHasVisited } from '../playerHelpers'
import { getGameState, setGameState, RootGameState, applyBackground } from '../chatRoomHelpers'
import { lotties } from '../helpers'
import { incUserState } from '../userStates'
import { incrementUserXP } from '../experiencePoints'
import * as DebugResetHandler from '../reactions/action.debug.reset'
import { moves } from 'src/domain/moves'

const systemMessages = {
  start: 'A cold cup of coffee sits in front of you.',
  inspect: 'It\'s a cup of cold brew! Like coffee, but cold and therefore trendy.',
  onCoffeeDrink: 'You drink the cold brew. It\'s both refreshing and energizing',
  onCoffeeFlirt: 'Cold Brew Coffee likes you, but as a friend',
  onCoffeeKiss: 'You kiss cold brew coffee.  Your lips are numb.',
  onCoffeePunch: 'You\'ve completely spilled you drink, ruining your nice white shirt.',
  chat: 'Coffee is a good listener, but doesn\'t say much',
}

const unObjectId = 'cold_brew_coffee_433'

interface GameState extends RootGameState {
  hasBeenDrunk: boolean
}

const INITIAL_GAME_STATE: GameState = {
  version: 1.0,
  lastVisit: Date.now(),
  hasBeenDrunk: false,
}

const onPlayerActionInspect = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await contextApi.getUser().sendSystemMessage(systemMessages.inspect)
}

const onPlayerActionDrink = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const gameState: GameState = (await getGameState(contextApi)) as GameState
  await incUserState(contextApi.getActor(), 'sleepy_261', -1)
  await incrementUserXP(contextApi.getActor(), 1)
  _.merge(gameState, { hasbeenDrunk: true })
  await setGameState(contextApi, gameState)
  await contextApi.getActor().sendSystemMessage(systemMessages.onCoffeeDrink)
  return Promise.resolve(null)
}

const onPlayerActionPunch = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await contextApi.getUser().sendSystemMessage(systemMessages.onCoffeePunch)
  await contextApi.createNewsfeedItemUnObjectCard('{{ name actor }} spilled cold coffee all over {{ himselfherself actor }}!')
}

const localActions = {
  Drink: 'Action.ColdBrewCoffee.DrinkColdBrewCoffee',
}

const localActionNames = _.values(localActions)

const globalActionNames = [moves.tickle_782.name, moves.punch_80.name]

const actionStubSet: ActionStubSet = {
  staticActionNames: [
    ...localActionNames,
    ...globalActionNames,
  ],
  actionInstanceNames: [

  ],
}

const updateActions = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const allPromises = []
  const gameState = (await getGameState(contextApi, INITIAL_GAME_STATE)) as GameState
  await contextApi.getActor().saveCurrentActionStubs(actionStubSet)

  allPromises.push(
    contextApi.getActor().setLocalAction({
      name: localActions.Drink,
      isDeleted: false,
      isDisabled: gameState.hasBeenDrunk,
    })
  )

  return Promise.all(allPromises)
}

const onEnter = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const allPromises = []

  if (!(await hasVisited(contextApi))) {
    await Promise.all([setHasVisited(contextApi, true)])
  }
  applyBackground(contextApi, lotties.blue_yellow_circles)

  contextApi.getActor().sendSystemMessage('Drinking Cold Brew Coffee gives you energy.')
  allPromises.push(updateActions(contextApi))

  return Promise.all(allPromises)
}

const onPlayerActionReset = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await setHasVisited(contextApi, false)

  await setGameState(contextApi, {
    ...INITIAL_GAME_STATE,
  })

  return Promise.resolve(null)
}

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {

    [moves.tickle_782.name]: composeReactionFns(
      onPlayerActionInspect,
      updateActions
    ),

    [moves.punch_80.name]: composeReactionFns(
      onPlayerActionPunch,
      updateActions
    ),
    [DebugResetHandler.NAME]: composeReactionFns(
      onPlayerActionReset, onEnter
    ),

    [localActions.Drink]: composeReactionFns(
      onPlayerActionDrink,
      updateActions
    ),
  })
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onReset: null,
  onLoad: registerReactionFns,
}

export default actionResolver
