import {
  ActionResolver,
  ChatRoomActionContextApi,
  FieldTemplate,
  NumberFieldMetadata,
} from '../types'

import {
  sf,
  misc,
} from '../../utils'

import {
  FieldType,
  EntityScope,
} from '../../gql-types'
import {
  registerReactionFnMap,
  ReactionFnMap,
  composeReactionFns,
} from '../../enginev3'
import {
  diff_hours,
  diff_mins,
  lotties,
  imageS3Key,
} from '../helpers'
import {
  hasVisited,
  setHasVisited,
  getActionButtonInventory,
  incrementPositionOnMap,
} from '../playerHelpers'
import {
  setGameState,
  getGameState,
  RootGameState,
  applyBackground,
} from '../chatRoomHelpers'
import * as fxChitChat from '../fx/animation.chitchat'
import * as fxAddToInventory from '../fx/animation.addtoinventory'
import * as DebugResetHandler from '../reactions/action.debug.reset'
import { items } from 'src/domain/items'
import { moves } from 'src/domain/moves'

// enums
enum GnomeState {
  AWAKE,
  ASLEEP
}

interface GameState extends RootGameState {
  gnomeState: GnomeState
  isPlaying: boolean
  smallTalkCount: number
}

const unObjectId = 'henry_gnome_1_1634'

const INITIAL_GAME_STATE: GameState = {
  version: 1.0,
  lastVisit: Date.now(),
  gnomeState: GnomeState.ASLEEP,
  isPlaying: true,
  smallTalkCount: 0,
}

// constants
// const max_daily_rubs: number = 2;
// const hours_in_a_day: number = 24;
// const energy_required: number = 3;

// Fields
const gnomeEnergy = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'gnomeEnergy',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: 0,
  },
})

const numRubs = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'numRubs',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: 0,
  },
})

const flower = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'flower',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: -1,
  },
})

// Lens
const numberValueLens = sf.lens('metadata.numberValue')

//Effects
// const animDayNightCycleEffectTemplate = misc.deepFreeze<EffectTemplate>({
//     type: EffectType.AnimationEffect,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         animationType: AnimationType.SourcedAnimation,
//         // sourceUri: 'https://assets4.lottiefiles.com/datafiles/ym5wjNFW1JC6bYQ/data.json',
//         sourceUri: lotties.clouds_2,
//         loop: true,
//     }
// });

// const animPlantSeedEffectTemplate = misc.deepFreeze<EffectTemplate>({
//     type: EffectType.AnimationEffect,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         animationType: AnimationType.SourcedAnimation,
//         sourceUri: 'https://assets10.lottiefiles.com/packages/lf20_50JEo9.json',
//     }
// });

// const animFeedFruitEffectTemplate = misc.deepFreeze<EffectTemplate>({
//     type: EffectType.AnimationEffect,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         animationType: AnimationType.SourcedAnimation,
//         sourceUri: 'https://assets6.lottiefiles.com/packages/lf20_nz20vA.json',
//         startFrame: '0',
//         endFrame: '32',
//     }
// });

// const animSleepZEffectTemplate = misc.deepFreeze<EffectTemplate>({
//     type: EffectType.AnimationEffect,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         animationType: AnimationType.SourcedAnimation,
//         sourceUri: 'https://assets3.lottiefiles.com/packages/lf20_XmaOva.json',
//         loop: true,
//     }
// });

// const animWaterDropffectTemplate = misc.deepFreeze<EffectTemplate>({
//     type: EffectType.AnimationEffect,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         animationType: AnimationType.SourcedAnimation,
//         sourceUri: 'https://assets9.lottiefiles.com/datafiles/9Py8o7A1g86DaBn/data.json',
//         loop: true,
//     }
// });

// Tiles
// const backgroundTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.gnome.background',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         containerStyle: {
//             top: 0,
//             right: 0,
//             height: 100,
//             width: 100,
//             zIndex: -1,  // This should be behind the avatar
//             borderWidth: 0
//         }
//     }
// });

// const plantTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.gnome.plant',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         containerStyle: {
//             top: 25,
//             right: 50,
//             height: 100,
//             width: 100,
//             zIndex: 10,
//             borderWidth: 0
//         }
//     }
// });

// const feedFruitTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.gnome.feedFruit',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         containerStyle: {
//             top: 25,
//             right: 60,
//             height: 30,
//             width: 30,
//             zIndex: 10,
//             borderWidth: 0
//         }
//     }
// });

// const waterDropTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.gnome.water',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         containerStyle: {
//             top: 25,
//             right: 50,
//             height: 100,
//             width: 100,
//             zIndex: 10,
//             borderWidth: 0
//         }
//     }
// });

// const seedIndicatorTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.gnome.seedIndicator',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         containerStyle: {
//             top: 25,
//             right: 10,
//             height: 100,
//             width: 100,
//             zIndex: 10,
//             borderWidth: 0
//         }
//     }
// });

// const sleepZTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.gnome.sleepz',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         containerStyle: {
//             top: 20,
//             right: 20,
//             height: 100,
//             width: 100,
//             zIndex: 5,
//             borderWidth: 0
//         }
//     }
// });

// const gnomeTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.gnome.gnomeavatar',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         image: {
//             s3Key: 'object/gnome.png'
//         },
//         containerStyle: {
//             top: 0,
//             right: 50,
//             height: 100,
//             width: 100,
//             zIndex: 2,
//             borderWidth: 0
//         }
//     }
// });

// const flowerTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.gnome.flower',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         containerStyle: {
//             top: 50,
//             right: 25,
//             height: 50,
//             width: 50,
//             zIndex: 2,
//             borderWidth: 0
//         }
//     }
// });

// conditions
// const isRubAllowed = (contextApi: ChatRoomActionContextApi): Promise<any> => {
//     return contextApi.getActor().field(numRubs).
//         then(numberValueLens.get).
//         then((n: number) => { return n < max_daily_rubs });
// }

// const getGnomeState = (date: Date): GnomeState => {
//     return (date.getHours() > 6 && date.getHours() < 18) ? GnomeState.ASLEEP : GnomeState.AWAKE;
// }

// Events
const enter = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  // fxChitChat.remove(contextApi)
  // fxAddToInventory.remove(contextApi)

  // date
  const currentVisitTime = Date.now()
  const currentDate = new Date(currentVisitTime)

  // game state
  const gameState = await getGameState(contextApi, INITIAL_GAME_STATE) as GameState

  // check status
  const isNewDay = diff_hours(new Date(gameState.lastVisit), currentDate)

  // check if visited before
  if (!await hasVisited(contextApi)) {
    contextApi.getActor().sendSystemMessage('Welcome to the garden gnome.')
    setHasVisited(contextApi, true)
  } else {
    // reset the number of rubs
    if (isNewDay) contextApi.getActor().saveField(numberValueLens.set(0)(numRubs))
  }

  // add background animation
  // await contextApi.getChatRoom().saveEffectOnTile(animDayNightCycleEffectTemplate, backgroundTileTemplate);

  // for testing
  gameState.gnomeState = GnomeState.AWAKE

  // await delay(300);
  // await contextApi.getChatRoom().saveEffectOnTile(animSleepZEffectTemplate, sleepZTileTemplate);
  // await contextApi.getActor().readOrCreateLocalActionEdges(localActionNames);

  setGameState(contextApi, gameState)

  applyBackground(contextApi, lotties.blue_yellow_circles)

  pushPlayerActionSheet(contextApi)

  return Promise.resolve(null)
}

// const dayCycle = async (contextApi: ChatRoomActionContextApi): Promise<any> => {

//     console.log("day");

//     const allPromises = [];

//     let gameState: GameState = await getGameState(contextApi) as GameState;
//     gameState.gnomeState = GnomeState.ASLEEP;

//     allPromises.push(setGameState(contextApi, gameState));
//     allPromises.push(contextApi.getChatRoom().saveTile((isDeletedLens.set(false))(sleepZTileTemplate)));
//     allPromises.push(contextApi.getChatRoom().saveEffectOnTile(animSleepZEffectTemplate, sleepZTileTemplate));

//     return Promise.all(allPromises);

// }

// const nightCycle = async (contextApi: ChatRoomActionContextApi): Promise<any> => {

//     console.log("night");

//     const allPromises = [];

//     let gameState: GameState = await getGameState(contextApi) as GameState;
//     gameState.gnomeState = GnomeState.AWAKE;

//     allPromises.push(setGameState(contextApi, gameState));
//     allPromises.push(contextApi.getChatRoom().saveTile((isDeletedLens.set(true))(sleepZTileTemplate)));

//     return Promise.all(allPromises);

// }

// const delay = async (ms: number): Promise<any> => {

//     return new Promise(resolve => setTimeout(resolve, ms));

// }

// const onPlayerActionLook = async (contextApi: ChatRoomActionContextApi): Promise<any> => {

//     let systemMessage = `Looks like a garden gnome.`

//     await contextApi.getActor().sendSystemMessage(systemMessage)

//     return Promise.resolve(null)
// }

// const onPlayerActionGiveSeed = async (contextApi: ChatRoomActionContextApi): Promise<any> => {

//     console.log("Give seed");
//     const gameState: GameState = await getGameState(contextApi) as GameState;

//     //if (gameState.gnomeState == GnomeState.ASLEEP ) return Promise.resolve(null);

//     await contextApi.getActor().saveField((numberValueLens.set(1))(hasSeed))
//     await checkIfCanPlantSeed(contextApi);

//     return Promise.resolve(null);

// }

// const checkIfCanPlantSeed = async (contextApi: ChatRoomActionContextApi): Promise<any> => {

//     console.log("Checking plant seed");
//     if (!await contextApi.getActor().field(hasSeed).then(numberValueLens.get).then((val: number) => { return val; }))
//         return Promise.resolve(null);

//     let e = await contextApi.getActor().field(gnomeEnergy).then(numberValueLens.get).then((val: number) => { return val });
//     console.log(e);
//     if (e >= energy_required) {

//         await updateFlowerTile(contextApi);
//         await contextApi.getActor().incrementField(gnomeEnergy, -energy_required);
//         await contextApi.getActor().saveField((numberValueLens.set(0))(hasSeed))

//     }

//     return Promise.resolve(null);

// }

// const updateFlowerTile = async (contextApi: ChatRoomActionContextApi): Promise<any> => {

//     console.log("Update Flower Tile");
//     let current_stage = await contextApi.getActor().field(flower).then(numberValueLens.get).then((val: number) => { return val; });
//     current_stage++;

//     if (current_stage == 0) {
//         await contextApi.getChatRoom().saveEffectOnTile(animPlantSeedEffectTemplate, plantTileTemplate);
//         await delay(300);
//     }

//     let stage_sprite = 'tile/stage_' + current_stage + '.png';

//     console.log(stage_sprite);
//     await contextApi.getActor().saveField(numberValueLens.set(current_stage)(flower));
//     await contextApi.getChatRoom().saveTile((imageS3KeyLens.set(stage_sprite))(flowerTileTemplate));

//     return Promise.resolve(null);

// }

// const onPlayerActionGiveFruit = async (contextApi: ChatRoomActionContextApi): Promise<any> => {

//     console.log("Give Fruit!");
//     const gameState: GameState = await getGameState(contextApi) as GameState;

//     //if (gameState.gnomeState == GnomeState.ASLEEP) return Promise.resolve(null);

//     await contextApi.getChatRoom().saveEffectOnTile(animFeedFruitEffectTemplate, feedFruitTileTemplate);

//     await contextApi.getActor().incrementField(gnomeEnergy, 1);

//     await delay(300);

//     await checkIfCanPlantSeed(contextApi);

//     return Promise.resolve(null);

// }

// const onPlayerActionGiveWater = async (contextApi: ChatRoomActionContextApi): Promise<any> => {

//     if (await contextApi.getActor().field(flower).then(numberValueLens.get).then((val: number) => { return val; }) < 0)
//         return Promise.resolve(null);

//     await contextApi.getChatRoom().saveEffectOnTile(animWaterDropffectTemplate, waterDropTileTemplate);

//     await delay(300);

//     await updateFlowerTile(contextApi);

//     return Promise.resolve(null);

// }

// const onPlayerActionRub = async (contextApi: ChatRoomActionContextApi): Promise<any> => {

//     const gameState: GameState = await getGameState(contextApi) as GameState;

//     if (gameState.gnomeState == GnomeState.ASLEEP) return Promise.resolve(null);

//     await contextApi.getActor().incrementField(gnomeEnergy, 1);
//     await checkIfCanPlantSeed(contextApi);

//     return Promise.resolve(null);

// }

const onActionChitChat = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return getGameState(contextApi)
    .then((gameState: GameState) => {
      return setGameState(contextApi, { ...gameState, smallTalkCount: ++gameState.smallTalkCount })
    }).then((gameState: GameState) => Promise.all([
      gameState,
      getActionButtonInventory(contextApi.getActor(), items.knife_585.name),
    ])
    ).then((results) => {
      const gameState: GameState = results[0] as GameState
      const knifeCount: number = results[1] as number

      const npcName = contextApi.getUnObject().getName()

      const threshold = 6

      const says = [
        `${npcName} explains, "I've been living here my whole life."`,
        `${npcName} continues, "I've seen all kinds of types."`,
        `${npcName} mummbles, "yep"`,
        `${npcName} agrees, "totally!"`,
        `${npcName} nods, "yeah, bigfoot is a very gentle soul."`,
        `${npcName} grumbles, "yeah, you can threaten him with a knife."`,
        `${npcName} nods again, "i agree"`,
        `${npcName} shrugs, "mmmmm hmmmm"`,
        `${npcName} seems to be ignoring you now.`,
      ]

      console.log(`knifeCount = ${knifeCount}, smallTalkCount = ${gameState.smallTalkCount}, Threshold = ${threshold}`)

      if (knifeCount == 0 && gameState.smallTalkCount == threshold) {
        return Promise.all([
          fxAddToInventory.animate(contextApi, imageS3Key.Knife),
          incrementPositionOnMap(contextApi.getActor()),
          contextApi.getActor().createActionInstance({
            actionName: items.knife_585.name,
            trxDescription: `Given to you by ${contextApi.getActor().getName()}`,
          }),
        ])
          .then(() => `${npcName} grumbles, "Take this knife, just in case."`)
      } else {
        return Promise.resolve(says[Math.min(gameState.smallTalkCount - 1, says.length - 1)])
      }
    })
    .then(contextApi.getActor().sendSystemMessage)

  //     contextApi.getActor().sendSystemMessage(says[Math.min(gameState.smallTalkCount - 1, says.length - 1)])

  //     if (gameState.smallTalkCount == threshold) {
  //         fxAddToInventory.animate(contextApi, imageS3Key.Knife)
  //         incrementPositionOnMap(contextApi.getActor())
  //     }

  //     return Promise.resolve(null)
  // })
}

const pushPlayerActionSheet = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await contextApi.getActor().setCurrentActionEdges(globalActionNames)

  return Promise.resolve(null)
}

const reset = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  setGameState(contextApi, {
    ...INITIAL_GAME_STATE,
  } as GameState)

  setHasVisited(contextApi, false)

  contextApi.getActor().saveField(numberValueLens.set(0)(gnomeEnergy))
  contextApi.getActor().saveField(numberValueLens.set(-1)(flower))
  // contextApi.getChatRoom().saveTile((isDeletedLens.set(true))(flowerTileTemplate))
  // contextApi.getChatRoom().saveTile((isDeletedLens.set(true))(sleepZTileTemplate));
  // contextApi.getChatRoom().saveTile((isDeletedLens.set(true))(backgroundTileTemplate))

  return Promise.resolve(null)
}

const postAction = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const allPromises = []

  allPromises.push(pushPlayerActionSheet(contextApi))

  return Promise.all(allPromises)
}

const checkIfShouldReset = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const currentVisitTime = Date.now()
  const gameState = await getGameState(contextApi, INITIAL_GAME_STATE) as GameState
  if (diff_mins(new Date(gameState.lastVisit), new Date(currentVisitTime)) >= 5) {
    await reset(contextApi)
  }
  return Promise.resolve(null)
}

// var localActions = {
// }

// const localActionNames = _.values(localActions);

const globalActionNames = [
  // GeneralLookHandler.NAME,
  // GeneralGiveSeedHandler.NAME,
  // GeneralGiveFruitHandler.NAME,
  // GeneralGiveWaterHandler.NAME,
  moves.tickle_782.name,
  //GeneralRubHandler.NAME,
]

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {

    [moves.tickle_782.name]: composeReactionFns(
      // GeneralChitChatHandler.incrementXPForActor
      fxChitChat.animate,
      onActionChitChat
      // , GeneralChitChatHandler.playDefaultAnimation
      // onPlayerActionMakeSmallTalk,
      // updateActions
    ),

    // [GeneralLookHandler.NAME]: composeReactionFns(
    //     onPlayerActionLook
    //     // , GeneralLookHandler.playDefaultAnimation
    //     , postAction
    // )

    // , [GeneralGiveSeedHandler.NAME]: composeReactionFns(
    //     onPlayerActionGiveSeed
    //     , postAction
    // )

    // , [GeneralGiveFruitHandler.NAME]: composeReactionFns(
    //     onPlayerActionGiveFruit
    //     , postAction
    // )

    // , [GeneralGiveWaterHandler.NAME]: composeReactionFns(
    //     onPlayerActionGiveWater,
    //     postAction
    // )

    [DebugResetHandler.NAME]: composeReactionFns(
      reset,
      enter,
      postAction
    ),

  } as ReactionFnMap)
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter: composeReactionFns(
    checkIfShouldReset
    , enter
    // , updateActions
  ),
  onReset: null,
  onLoad: registerReactionFns,
}

export default actionResolver
