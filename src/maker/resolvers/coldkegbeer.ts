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
  TileTemplate,
  HashStatusFieldMetadata,
  ActionStubSet,
} from '../types'
import {
  misc,
} from '../../utils'
import { TileType, EntityScope } from '../../gql-types'
import _ from 'lodash'
import { registerReactionFnMap, ReactionFnMap, composeReactionFns, SkipReactionsError } from '../../enginev3'

import { diff_hours, lotties, imageS3Key } from '../helpers'
import { hasVisited, setHasVisited } from '../playerHelpers'
import { setGameState, getGameState, RootGameState, applyBackground } from '../chatRoomHelpers'
import { isDeletedLens, metadataAnimationLens, nativeAnimatableEffectTemplate, nativeAnimatableEffectTemplateShort } from '../fxHelpers'
import { incrementUserXP } from '../experiencePoints'
import { ReactNativeAnimations } from 'src/maker/animations'

import * as DebugResetHandler from '../reactions/action.debug.reset'
import { getUserState, incUserState } from '../userStates'
import * as fxAddToInventory from '../fx/animation.addtoinventory'
import { items } from 'src/domain/items'

interface GameState extends RootGameState {
  totalCupsAvailable: number
  cupsRemaining: number
  maxPressure: number
  currentPressure: number
}

const pressureImageS3Key = [
  'tile/psi1.png',
  'tile/psi2.png',
  'tile/psi3.png',
  'tile/psi4.png',
  'tile/psi5.png',
  'tile/psi6.png',
]

const cupsImageS3Key = [
  'tile/cups1.png',
  'tile/cups2.png',
  'tile/cups3.png',
  'tile/cups4.png',
  'tile/cups5.png',
  'tile/cups6.png',
]

const unObjectId = 'beer_keg_1641'

const INITIAL_GAME_STATE: GameState = {
  version: 1.3,
  lastVisit: Date.now(),
  totalCupsAvailable: 5,
  cupsRemaining: 5,
  maxPressure: 5,
  currentPressure: 1,
}

const beerCupTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.beerkeg.cup',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: imageS3Key.Beer,
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 24,
      right: 5.5,
      height: 15,
      width: 15,
      zIndex: 5,
      borderWidth: 0,
      borderColor: 'red',
    },
  },
})

const pressureTileTemplate: TileTemplate = {
  name: 'tile.beerkeg.pressure',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: pressureImageS3Key[INITIAL_GAME_STATE.currentPressure],
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 8,
      bottom: null,
      left: 22,
      height: 26,
      width: 26,
      zIndex: 5,
      borderWidth: 0,
      borderColor: 'red',
    },
  },
}

const cupsTileTemplate: TileTemplate = {
  name: 'tile.beerkeg.cups',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: cupsImageS3Key[INITIAL_GAME_STATE.cupsRemaining],
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 8,
      bottom: null,
      right: 22,
      height: 26,
      width: 26,
      zIndex: 5,
      borderWidth: 0,
      borderColor: 'red',
    },
  },
}

const isPumpAllowed = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return getUserState(contextApi.getActor(), 'sleepy_261')
    .then((metadata: HashStatusFieldMetadata) => {
      if (metadata.numberValue == 5) {
        contextApi.getActor().sendSystemMessage('You are too tired to pump the keg. Perhaps some caffeine will help?!')
        return Promise.reject(SkipReactionsError)
      } else {
        return Promise.resolve(null)
      }
    })
}

const updatePressureGauge = async (contextApi: ChatRoomActionContextApi, previousPressure: number, currentPressure: number, maxPressure: number): Promise<any> => {
  const allPromises = []

  _.merge(pressureTileTemplate, {
    metadata: {
      image: {
        s3Key: pressureImageS3Key[currentPressure],
      },
    },
  })

  allPromises.push(contextApi.getChatRoom().applyTile(pressureTileTemplate.name, pressureTileTemplate))

  // if (currentPressure != previousPressure) {

  //     if (_.isEqual(currentPressure, maxPressure) || _.isEqual(currentPressure, 0)) {

  //         allPromises.push(contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(rnAnimations.shake)(nativeAnimatableEffectTemplateShort), pressureTileTemplate))

  //     } else {

  //         allPromises.push(contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(rnAnimations.pulse)(nativeAnimatableEffectTemplate), pressureTileTemplate))

  //     }

  // }

  if ((currentPressure == previousPressure) && (_.isEqual(currentPressure, maxPressure) || _.isEqual(currentPressure, 0))) {
    allPromises.push(contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(ReactNativeAnimations.Shake)(nativeAnimatableEffectTemplateShort), pressureTileTemplate))
  } else {
    allPromises.push(contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(ReactNativeAnimations.Pulse)(nativeAnimatableEffectTemplate), pressureTileTemplate))
  }

  return Promise.all(allPromises)
}

const updateCupsGauge = async (contextApi: ChatRoomActionContextApi, previousCups: number, currentCups: number): Promise<any> => {
  const allPromises = []

  _.merge(cupsTileTemplate, {
    metadata: {
      image: {
        s3Key: cupsImageS3Key[currentCups],
      },
    },
  })

  allPromises.push(contextApi.getChatRoom().applyTile(cupsTileTemplate.name, cupsTileTemplate))

  if ((previousCups == currentCups) && _.isEqual(currentCups, 0)) {
    allPromises.push(contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(ReactNativeAnimations.Shake)(nativeAnimatableEffectTemplateShort), cupsTileTemplate))
  } else {
    allPromises.push(contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(ReactNativeAnimations.Pulse)(nativeAnimatableEffectTemplate), cupsTileTemplate))
  }

  return Promise.all(allPromises)
}

const onPlayerActionFillCup = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const gameState: GameState = await getGameState(contextApi) as GameState

  const { cupsRemaining, currentPressure, maxPressure } = gameState

  if (cupsRemaining == 0) {
    await contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(ReactNativeAnimations.Shake)(nativeAnimatableEffectTemplateShort), cupsTileTemplate)
  } else if (currentPressure == 0) {
    await contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(ReactNativeAnimations.Shake)(nativeAnimatableEffectTemplateShort), pressureTileTemplate)
  } else {
    const newCupsRemaining = Math.max(cupsRemaining - 1, 0)

    const newPressure: number = Math.max(currentPressure - 1, 0)

    _.merge(gameState, {
      cupsRemaining: newCupsRemaining,
      currentPressure: newPressure,
    })

    await updatePressureGauge(contextApi, currentPressure, newPressure, maxPressure)

    await updateCupsGauge(contextApi, cupsRemaining, newCupsRemaining)

    await setGameState(contextApi, gameState)

    await contextApi.getActor().createActionInstance({
      actionName: items.belgian_beer_359.name,
      trxDescription: `Given to you by ${contextApi.getUnObject().getName()}`,
    })

    if (!_.isEqual(cupsRemaining, newCupsRemaining) && _.isEqual(cupsRemaining, 0)) {
      await contextApi.getActor().sendSystemMessage('The Keg is kicked! You\'ve been gifted the power of High-Fiving cause you\'re a party animal 🎉')

      await contextApi.createNewsfeedItemUnObjectCard('{{ name actor }} finished a whole keg of beer.')

      await contextApi.doSourcedAnimation(lotties.fireworks1)

      await incrementUserXP(contextApi.getActor(), 10)
    } else {
      fxAddToInventory.animate(contextApi, imageS3Key.Beer)
    }
  }

  return Promise.resolve(null)
}

const onPlayerActionPumpKeg = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const allPromises = []

  let gameState: GameState

  const { currentPressure, maxPressure } = gameState

  const newPressure = Math.min(maxPressure, currentPressure + 1)

  _.merge(gameState, {
    currentPressure: newPressure,
  })

  allPromises.push(setGameState(contextApi, gameState))

  allPromises.push(updatePressureGauge(contextApi, currentPressure, newPressure, maxPressure))

  allPromises.push(incrementUserXP(contextApi.getActor(), 3))

  allPromises.push(incUserState(contextApi.getActor(), 'sleepy_261', 1))

  return Promise.all(allPromises)
}

const pushPlayerActionSheet = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await contextApi.getActor().saveCurrentActionStubs(actionStubSet)

  return Promise.resolve(null)
}

const onEnter = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const currentVisitTime = Date.now()

  const gameState = await getGameState(contextApi, INITIAL_GAME_STATE) as GameState

  await contextApi.getChatRoom().saveTile(isDeletedLens.set(true)(beerCupTileTemplate))

  if (!await hasVisited(contextApi)) {
    await contextApi.getChatRoom().applyTile(pressureTileTemplate.name, pressureTileTemplate)

    await applyBackground(contextApi, lotties.hearts_pluses)

    await updatePressureGauge(contextApi, 0, gameState.currentPressure, gameState.maxPressure)

    await updateCupsGauge(contextApi, gameState.cupsRemaining, gameState.cupsRemaining)

    await Promise.all([
      contextApi.getActor().sendSystemMessage('Help yourself to a beer.'),
      setHasVisited(contextApi, true),
    ])
  } else {
    if (diff_hours(new Date(gameState.lastVisit), new Date(currentVisitTime)) > 24) {
      await contextApi.getActor().sendSystemMessage('Welcome back! The keg has gone flat since you were last here.')

      _.merge(gameState, {
        currentPressure: 0,
      })

      await updatePressureGauge(contextApi, 0, 0, gameState.maxPressure)
    }
  }

  _.merge(gameState, { lastVisit: currentVisitTime })

  await setGameState(contextApi, gameState)

  await pushPlayerActionSheet(contextApi)

  return Promise.resolve(null)
}

const onPlayerActionReset = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await setGameState(contextApi, {
    ...INITIAL_GAME_STATE,
  } as GameState)

  await setHasVisited(contextApi, false)

  return Promise.resolve(null)
}

const postAction = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const allPromises = []

  allPromises.push(pushPlayerActionSheet(contextApi))

  return Promise.all(allPromises)
}

const localActions = {
  FillCup: 'Action.ColdKegBeer.FillCup',
  PumpKeg: 'Action.ColdKegBeer.PumpKeg',
}

const actionStubSet: ActionStubSet = {
  staticActionNames: [
    ..._.values(localActions),
  ],
  actionInstanceNames: [],
}

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {

    [DebugResetHandler.NAME]: composeReactionFns(
      onPlayerActionReset,
      onEnter,
      postAction
    )

    , [localActions.FillCup]: composeReactionFns(
      onPlayerActionFillCup
      , postAction
    )

    , [localActions.PumpKeg]: composeReactionFns(
      isPumpAllowed
      , onPlayerActionPumpKeg
      , postAction
    ),

  } as ReactionFnMap)
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onReset: null,
  onLoad: registerReactionFns,
}

export default actionResolver
