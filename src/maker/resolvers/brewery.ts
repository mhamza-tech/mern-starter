import {
  ActionResolver,
  ChatRoomActionContextApi,
  SaveTileInputInContext,
  EnumDictionary,
  ActionStubSet,
} from '../types'
import { sleep } from '../async_utils'
import { AnimationType, TileType } from '../../gql-types'
import { registerReactionFnMap, ReactionFnMap, composeReactionFns } from '../../enginev3'
import { lotties, imageS3Key } from '../helpers'
import { RootGameState, getGameState, setGameState } from '../chatRoomHelpers'
import { setHasVisited, hasVisited, hasPostedThisNewsfeedItem, setHasPostedThisNewsfeedItem } from '../playerHelpers'
import { incrementUserXP } from '../experiencePoints'
import * as DebugResetHandler from '../reactions/action.debug.reset'
import _ from 'lodash'
import { items } from 'src/domain/items'

const localActions = {
  Corn: 'Action.Brewery.Corn',
  Hops: 'Action.Brewery.Hops',
  Water: items.water_balloon_1358.name,
  TryAgain: 'Action.Brewery.TryAgain',
}

/** 
 * Mapping from state => action set
 */

interface GameState extends RootGameState {
  orderedIngredients: IngredientKey[]
}

const unObjectId = 'brewery_388'
const INITIAL_GAME_STATE: GameState = {
  version: 1.0,
  lastVisit: Date.now(),
  orderedIngredients: [],
}

enum OutputKey {
  Beer,
  Whiskey
}

enum IngredientKey {
  Corn,
  Water,
  Hops,
}

interface Ingredient {
  imageS3Key: string
}

const Ingredients: EnumDictionary<IngredientKey, Ingredient> = {
  [IngredientKey.Corn]: { imageS3Key: imageS3Key.Corn },
  [IngredientKey.Hops]: { imageS3Key: imageS3Key.Hops },
  [IngredientKey.Water]: { imageS3Key: imageS3Key.WaterDropH2O },
}

const dualKey = (key1: IngredientKey, key2: IngredientKey): string => {
  return `${IngredientKey[key1]}_${IngredientKey[key2]}`
}

const allowedIngredientCombos = {
  [dualKey(IngredientKey.Corn, IngredientKey.Water)]: {
    imageS3Key: imageS3Key.Whiskey,
    outputKey: OutputKey.Whiskey,
  },
  [dualKey(IngredientKey.Hops, IngredientKey.Water)]: {
    imageS3Key: imageS3Key.Beer,
    outputKey: OutputKey.Beer,
  },
}

const largeOverlayStyle = {
  backgroundColor: 'transparent',
  top: null,
  left: 10,
  bottom: 0,
  height: 80,
  width: 80,
  borderWidth: 0,
  borderColor: 'red',
}

const brewKitBackgroundTile: SaveTileInputInContext = {
  name: 'backgroundTile',
  type: TileType.ImageTile,
  metadata: {
    image: {
      s3Key: 'tile/brewery.brewmachine.v4.png',
    },
    containerStyle: {
      backgroundColor: 'transparent',
      ...largeOverlayStyle,
      zIndex: 1,
    },
  },
}

const ingredientStyle = {
  backgroundColor: 'transparent',
  bottom: 6.5,
  height: 14,
  width: 14,
  borderWidth: 0,
  borderColor: 'red',
}

const leftIngredientTile: SaveTileInputInContext = {
  name: 'leftIngredientTile',
  type: TileType.ImageTile,
  metadata: {
    containerStyle: {
      ...ingredientStyle,
      left: 20.5,
      zIndex: 2,
    },
  },
}

const rightIngredientTile: SaveTileInputInContext = {
  name: 'rightIngredientTile',
  type: TileType.ImageTile,
  metadata: {
    containerStyle: {
      ...ingredientStyle,
      left: 35,
      zIndex: 3,
    },
  },
}

const outputTileStyle = {
  backgroundColor: 'transparent',
  right: 19.5,
  bottom: 3.8,
  height: 19,
  width: 19,
  borderWidth: 0,
  borderColor: 'red',
}

const outputTileSpinner: SaveTileInputInContext = {
  name: 'outputTileSpinner2',
  type: TileType.ImageTile,
  metadata: {
    containerStyle: {
      ...outputTileStyle,
      zIndex: 30,
    },
  },
}

const outputTile: SaveTileInputInContext = {
  name: 'outputTile',
  type: TileType.ImageTile,
  metadata: {
    containerStyle: {
      ...outputTileStyle,
      zIndex: 40,
    },
  },
}

const configuratorTile: SaveTileInputInContext = {
  name: 'configuratorTile',
  type: TileType.ImageTile,
  metadata: {
    containerStyle: {
      ...largeOverlayStyle,
      zIndex: 100,
    },
  },
}

const onActorActionDropIngredient = async (ingredientKey: IngredientKey, contextApi: ChatRoomActionContextApi): Promise<any> => {
  let gameState: GameState

  const { imageS3Key } = Ingredients[ingredientKey]

  gameState = await getGameState(contextApi) as GameState

  const { orderedIngredients } = gameState

  orderedIngredients.push(ingredientKey)

  const ingredientTile = _.merge({}, orderedIngredients.length == 1 ? leftIngredientTile : rightIngredientTile, {
    image: {
      s3Key: imageS3Key,
    },
  })

  await contextApi.getChatRoom().applyTile(ingredientTile.name, ingredientTile)

  gameState = await setGameState(contextApi, gameState) as GameState

  if (orderedIngredients.length == 2) {
    const combo = allowedIngredientCombos[dualKey(orderedIngredients[0], orderedIngredients[1])]

    const s3Key = _.isUndefined(combo) ? 'tile/brewery.failed.png' : combo.imageS3Key

    let systemMessage: string
    let newsfeedText: string = null
    let hasPosted = false
    let outputKey: OutputKey = null

    if (_.isUndefined(combo)) {
      systemMessage = 'Bad Alchemy... try again!'
    } else {
      outputKey = combo.outputKey

      systemMessage = `You've made ${OutputKey[outputKey]}. It's been added to your inventory.`

      hasPosted = await hasPostedThisNewsfeedItem(contextApi, OutputKey[outputKey])

      await setHasPostedThisNewsfeedItem(contextApi, OutputKey[outputKey], true)

      if (_.isEqual(OutputKey.Beer, outputKey)) {
        await contextApi.getActor().createActionInstance({
          actionName: items.belgian_beer_359.name,
          trxDescription: 'Made at the brewery!',
        })

        newsfeedText = '{{ linkName actor }} just brewed {{ himselfherself actor }} a microbrew.'
      }
      if (_.isEqual(OutputKey.Whiskey, outputKey)) {
        await contextApi.getActor().createActionInstance({
          actionName: items.breath_mint_386.name,
          trxDescription: 'Made at the brewery!',
        })

        newsfeedText = '{{ linkName actor }} just distilled {{ himselfherself actor }} some seriously strong whiskey.'
      }
    }
    await contextApi.getChatRoom().applyTile(outputTileSpinner.name, outputTileSpinner)
    await contextApi.getChatRoom().applyAnimationOnTile(outputTileSpinner, AnimationType.SourcedAnimation, { animationType: AnimationType.SourcedAnimation, sourceUri: lotties.multispinninggear })
    await sleep(2000)
    await contextApi.getChatRoom().removeTile(outputTileSpinner.name)
    await contextApi.getChatRoom().applyTile(outputTile.name, _.merge({}, outputTile, { image: { s3Key } }))

    if (!_.isUndefined(combo)) {
      await incrementUserXP(contextApi.getActor(), 100)

      await contextApi.doSourcedAnimation(lotties.glitter1)
      setTimeout(() => {
      }, 2000)
    } else {
    }
    await contextApi.getActor().sendSystemMessage(systemMessage)
    !!!_.isNull(newsfeedText) && !!!hasPosted && await contextApi.createNewsfeedItemUnObjectCard(newsfeedText)
  }

  return Promise.resolve(null)
}

const onActorActionTryAgain = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await Promise.all([

    contextApi.getChatRoom().removeTile(leftIngredientTile.name),

    contextApi.getChatRoom().removeTile(rightIngredientTile.name),

    contextApi.getChatRoom().removeTile(outputTile.name),

    contextApi.getChatRoom().removeTile(outputTileSpinner.name),

    setGameState(contextApi, INITIAL_GAME_STATE),

  ])

  await contextApi.getChatRoom().removeTile(brewKitBackgroundTile.name)

  const introSpinner = async (): Promise<any> => {
    let count = 0
    const s3Keys = ['tile/brewery.info.calibrating.png', 'tile/brewery.info.cleaningpipes.png', 'tile/brewery.info.sprockets.png', 'tile/brewery.info.updating.png']
    while (count < 12) {
      const idx = count % s3Keys.length
      const s3Key = s3Keys[idx]

      await contextApi.getChatRoom().applyTile(configuratorTile.name, _.merge({}, configuratorTile, { image: { s3Key } }))

      await sleep(300)

      count++
    }

    return Promise.resolve(null)
  }
  /*
  await introSpinner()

  await contextApi.getChatRoom().removeTile(configuratorTile.name)

  await contextApi.getChatRoom().applyTile(brewKitBackgroundTile.name, brewKitBackgroundTile)
  */
  introSpinner()
    .then(() => contextApi.getChatRoom().removeTile(configuratorTile.name))
    .then(() => contextApi.getChatRoom().applyTile(brewKitBackgroundTile.name, brewKitBackgroundTile))

  return Promise.resolve(null)
}

const pushPlayerActionSheet = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await contextApi.getActor().saveCurrentActionStubs(actionStubSet)

  return null
}

const gridTile: SaveTileInputInContext = {
  name: 'grid',
  type: TileType.ImageTile,
  isDeleted: true,
  metadata: {
    image: {
      s3Key: 'overlay/grid.png',
    },
    containerStyle: {
      top: 0,
      left: 0,
      bottom: null,
      right: null,
      height: 99,
      width: 99,
      zIndex: 1000,
    },
  },
}

const onEnter = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await onActorActionTryAgain(contextApi)

  if (!await hasVisited(contextApi)) {
    await Promise.all([
      contextApi.getActor().sendSystemMessage('Welcome to the Brewery, where you can brew anything you like. You need to have the right ingredients and combine them in the right order.'),
      setHasVisited(contextApi, true),
    ])
  }

  contextApi.getChatRoom().setGlobalTile(gridTile.name, gridTile)

  await pushPlayerActionSheet(contextApi)

  return Promise.resolve(null)
}

const onPlayerActionReset = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await Promise.all([

    contextApi.getChatRoom().removeTile(leftIngredientTile.name),

    contextApi.getChatRoom().removeTile(rightIngredientTile.name),

    contextApi.getChatRoom().removeTile(outputTile.name),

    contextApi.getChatRoom().removeTile(outputTileSpinner.name),

  ])

  await contextApi.getChatRoom().removeTile(brewKitBackgroundTile.name)

  await setHasVisited(contextApi, false)

  await onEnter(contextApi)

  return Promise.resolve(null)
}

const postAction = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const allPromises = []

  allPromises.push(pushPlayerActionSheet(contextApi))

  return Promise.all(allPromises)
}

const localActionNames = _.values(localActions)

const globalActionNames = [
]

const actionStubSet: ActionStubSet = {
  staticActionNames: [
    ...globalActionNames,
    localActions.TryAgain,
  ],
  actionInstanceNames: [
    ...localActionNames,
    items.belgian_beer_359.name,
    items.breath_mint_386.name,
  ],
}

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {

    [DebugResetHandler.NAME]: composeReactionFns(
      onPlayerActionReset,
      postAction
    ),

    [localActions.Corn]: composeReactionFns(_.partial(onActorActionDropIngredient, IngredientKey.Corn), postAction),
    [localActions.Hops]: composeReactionFns(_.partial(onActorActionDropIngredient, IngredientKey.Hops), postAction),

    [localActions.Water]: composeReactionFns(
      _.partial(onActorActionDropIngredient, IngredientKey.Water)
      , postAction
    ),

    [localActions.TryAgain]: composeReactionFns(onActorActionTryAgain, postAction),
  } as ReactionFnMap)
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onReset: null,
  onLoad: registerReactionFns,
}

export default actionResolver
