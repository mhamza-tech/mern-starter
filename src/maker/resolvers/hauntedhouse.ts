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
  SaveTileInputInContext,
  HashStatusFieldMetadata,
} from '../types'
import { actionOnSubjectWithOverlay } from '../imgix'
import {
  Image,
  TileType,
} from '../../gql-types'
import { sf } from '../../utils'
import _ from 'lodash'
import {
  registerReactionFnMap,
  ReactionFnMap,
  composeReactionFns,
} from '../../enginev3'
import {
  lotties,
  diff_mins,
  imageS3Key,
} from '../helpers'
import {
  isDeletedLens,
  zIndexLens,
} from '../fxHelpers'
import {
  navigate,
  getPermittedMoves,
  Position,
  Room,
  entranceTileTemplateAnimation,
  localActions,
  getCurrentRoom,
  incrementZIndex,
  foyerTileTemplateAnimation,
  backYardTileTemplateAnimation,
  kitchenTileTemplateAnimation,
  bathroomTileTemplateAnimation,
  sideYardTileTemplateAnimation,
  monsterTileTemplateAnimation,
} from './hauntedhouse.assets'
import {
  incrementUserAttribute,
  hasVisited,
  setHasVisited,
  UserAttributeKey,
  getActionButtonInventory,
} from '../playerHelpers'
import {
  setGameState,
  getGameState,
  applyBackground,
  RootGameState,
} from '../chatRoomHelpers'
import {
  incUserState,
  getUserState,
} from '../userStates'
import * as DebugResetHandler from '../reactions/action.debug.reset'
import * as fxAddToInventory from '../fx/animation.addtoinventory'
import Bluebird from 'bluebird'
import { moves } from 'src/domain/moves'
import { items } from 'src/domain/items'

const unObjectId = 'haunted_house_1633'

interface GameState extends RootGameState {
  player: { /*hitPointsRemaining: number;*/ position: Position }
  troll: { hitPointsRemaining: number; position: Position }
}

const INITIAL_GAME_STATE: GameState = {
  version: 1.0,
  lastVisit: Date.now(),
  player: { /*hitPointsRemaining: 10,*/ position: { x: 0, y: 1 } },
  troll: { hitPointsRemaining: 10, position: { x: 2, y: 1 } },
}

const monsterTile: SaveTileInputInContext = {
  // name: 'haunted.house.monster.tile',
  name: 'troll',
  type: TileType.ImageTile,
  metadata: {
    image: {
      // uri: `http://unrealfun.imgix.net/tile/troll_1.png?w=${750}`,
      uri: `http://unrealfun.imgix.net/tile/monster.png?w=${300}`,
    },
    containerStyle: {
      backgroundColor: 'transparent',
      right: null,
      left: 5,
      top: null,
      bottom: 20,
      height: 50,
      width: 50,
      zIndex: 5,
    },
  },
}

// const applyCutOut = (contextApi: ChatRoomActionContextApi) => {
//     return Promise.all([
//         contextApi.getChatRoom().saveTile(subwindowFrameTileTemplate)
//             .then(sf.pause(1 * 1000))
//             .then(() => contextApi.getChatRoom().saveTile(imageS3KeyLens.set(imageS3Key.s3Key)(currentRoomTileTemplate)))
//     ]);
// };

const renderRoom = (contextApi: ChatRoomActionContextApi, currentRoom: Room, gameState: GameState): Promise<any> => {
  return incrementZIndex(contextApi)
    .then((zIndex: number) => contextApi.getChatRoom().saveTile(zIndexLens.set(zIndex)(currentRoom.tile)))
    .then(sf.pause(1000 * 3))
    // .then(() => { return _.isNull(previousRoom) ? Promise.resolve(null) : contextApi.getChatRoom().saveEffectOnTile(fadeOutEffectTemplate, previousRoom.tile) })
    .then(() => _.isEqual(gameState.troll.position, gameState.player.position) && gameState.troll.hitPointsRemaining > 0)
    .then((isMonster: boolean) => {
      return isMonster
        ? Promise.resolve(sf.pause(1000 * 2))
          .then(() => contextApi.getChatRoom().saveTile(monsterTileTemplateAnimation))
          .then(() => `${currentRoom.description}\n\nA mean monster appears.`)
        : Promise.resolve(`${currentRoom.description}`)
    }).then(contextApi.getActor().sendSystemMessage)
  // .then(() => setGameState(contextApi, gameState))
}

const onActionDirection = async (direction: string, contextApi: ChatRoomActionContextApi): Promise<any> => {
  return disableAllActions(contextApi)
    .then(() => getGameState(contextApi))
    .then((gameState: GameState) => {
      const newGameState = _.cloneDeep(gameState)
      const newPosition = navigate(direction, gameState.player.position)
      _.merge(newGameState, {
        player: { position: newPosition },
      })
      return Bluebird.Promise.props({
        newRoom: getCurrentRoom(newPosition),
        gameState: setGameState(contextApi, newGameState),
        previousRoom: getCurrentRoom(gameState.player.position),
      })
    }).then(({ newRoom, gameState }) => {
      return renderRoom(contextApi, newRoom, gameState as any)
    })
}

/*
const onActionDirection = async (direction: string, contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
 
    const gameState: GameState = await getGameState(contextApi) as GameState
    const previousRoom = getCurrentRoom(gameState.player.position)
    gameState.player.position = navigate(direction, gameState.player.position)
 
    // console.log(`player = ${JSON.stringify(gameState.player.position)}`)
    // console.log(`monster = ${JSON.stringify(gameState.troll.position)}`)
    const currentRoom = getCurrentRoom(gameState.player.position)
    // gameState.hasStarted = true
    // currentRoom.isTreasure && gameState.level++
 
    // const rnAnimation =
    //     direction == 'n' ? rnAnimations.slideInDown
    //         : direction == 's' ? rnAnimations.slideInUp
    //             : direction == 'w' ? rnAnimations.slideInLeft
    //                 : rnAnimations.slideInRight
 
    // contextApi.getChatRoom().saveTile(imageS3KeyLens.set(currentRoom.s3Key)(currentRoomTileTemplate))
 
    return contextApi.getChatRoom().saveTile(zIndexLens.set(incrementZIndex())(currentRoom.tile))
        .then(sf.pause(1000 * 3))
        // .then(() => contextApi.getChatRoom().saveTile(opacityLens.set(0)(previousRoom.tile)))
        .then(() => contextApi.getChatRoom().saveEffectOnTile(fadeOutEffectTemplate, previousRoom.tile))
        .then(() => _.isEqual(gameState.troll.position, gameState.player.position) && gameState.troll.hitPointsRemaining > 0)
        .then((isMonster: boolean) => {
            return isMonster
                ? Promise.resolve(sf.pause(1000 * 2))
                    .then(() => contextApi.getChatRoom().saveTile(monsterTileTemplateAnimation))
                    .then(() => `${currentRoom.description}\n\nA mean monster appears.`)
                : Promise.resolve(`${currentRoom.description}`)
        }).then(contextApi.getActor().sendSystemMessage)
        .then(() => setGameState(contextApi, gameState))
 
}
 
// const onActionBeer = async (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
//     //   const playerName = contextApi.getUser().getName()
//     const actorImage: Image = await contextApi.getUser().getImage()
//     const allPromises = []
//     allPromises.push(
//         contextApi.createNewsfeedItemUnObjectImage(`{{ name actor }} and the mean troll are drinking beer together.`, {
//             uri: actionOnSubjectWithOverlay(
//                 `${actorImage.uri}?w=424`,
//                 '/backgrounds/blue_circles.png',
//                 '/tile/troll_1.png',
//                 '/tile/beer_1.png',
//                 '/overlay/1x1.png',
//             ),
//         }),
//     )
 
//     return Promise.all(allPromises)
// }
*/

const onActionFight = async (weapon: string, contextApi: ChatRoomActionContextApi): Promise<any> => {
  // TODO JT, loop thru all fighting actions and disable them here or just hide all the actions
  // contextApi.getActor().setLocalActions([
  //     {
  //         name: localActions.Fight,
  //         isDeleted: false,
  //         isDisabled: true

  //     }
  // ])

  // contextApi.getActor().setCurrentActionEdges([])

  const gameState: GameState = await getGameState(contextApi) as GameState

  //  HACK JT to test strike and evict from play room
  // const strike = _.sample([-7, -3, -2, -1, 0, 1, 2, 3, 7])

  // positive strike value is damage to the user
  // negative strike value is damage to the enemy
  let strike: number //-10

  if (_.isEqual(weapon, 'knife')) {
    strike = -10
  } else if (_.isEqual(weapon, 'punch')) {
    strike = _.sample([-3, -2, -1, 0, 1, 2, 3, 7])
  } else if (_.isEqual(weapon, 'hug')) {
    strike = 10
  } else {
    strike = 0
  }

  if (strike > 0) {
    await incUserState(contextApi.getActor(), 'injured_876', strike)
  } else if (strike < 0) {
    gameState.troll.hitPointsRemaining += strike
  }

  // gameState.player.hitPointsRemaining += strike < 0 ? strike : 0

  // gameState.troll.hitPointsRemaining -= strike > 0 ? strike : 0

  const injured: boolean = (await getUserState(contextApi.getActor(), 'injured_876') as HashStatusFieldMetadata).numberValue >= 5

  if (injured) {
    gameState.player.position = INITIAL_GAME_STATE.player.position
  }

  await setGameState(contextApi, gameState)

  let strikeSummary =
    strike > 0
      ? 'Ouch! You\'ve been bitten by the monster.'
      : strike == 0
        ? 'You missed!'
        : `Nice! You've hit the monster where it hurts and he suffered ${Math.abs(strike)} hit points. He has have ${gameState.troll.hitPointsRemaining} hit points remaining`

  // await contextApi.doSourcedAnimation(lotties.swordfight1)

  // TODO JT - this pause does not seem to work properly.  we want the animated injured bar graph to increase only after the message displays
  // Set a timer here because the fight animation lasts for approx 4 seconds
  // setTimeout(async () => {

  if (injured) {
    strikeSummary = 'You\'ve been severly hurt. See Doctor Spaceman and come back when you are not injured.'

    await removeAllTiles(contextApi)

    // await incUserState(contextApi.getActor(), UserStateId.Injured, 100) // 100 just to be safe, but should get capped at 5 max

    contextApi.getActor().setCurrentActionEdges([])
  } else if (gameState.troll.hitPointsRemaining <= 0) {
    const coins = 18

    strikeSummary = `You've killed the monster and stolen ${coins} dollars that you found in his butt crack!`

    fxAddToInventory.animate(contextApi, imageS3Key.StackOfMoney)

    await incrementUserAttribute(contextApi.getActor(), UserAttributeKey.Wealth, coins)

    contextApi.getChatRoom().saveTile(isDeletedLens.set(true)(monsterTileTemplateAnimation))

    // await contextApi.createNewsfeedItemUnObjectImage(`{{ name actor }} killed a monster at the haunted house.`, {
    //     uri: actionOnSubjectWithOverlay(
    //         `${actorImage.uri}?w=424`,
    //         '/backgrounds/red_1.png',
    //         '/tile/monster.png',
    //         '/action/color/punch.png',
    //         '/overlay/blood_bath_2.png',
    //     ),
    // })
    const actorImage: Image = await contextApi.getUser().getImage()
    await contextApi.createNewsfeedItemUnObjectImage('{{ name actor }} killed a monster in the haunted house.', {
      uri: actionOnSubjectWithOverlay(
        `${actorImage.uri}?w=424`,
        'backgrounds/red_1.png',
        'tile/monster.png',
        'action/color/punch.png',
        'overlay/blood_bath_2.png'
      ),
    })

    await updateActions(contextApi)
  }

  contextApi.getUser().sendSystemMessage(strikeSummary)

  // }, 4000)

  return Promise.resolve(null)
}

const disableAllActions = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return contextApi.getActor().setLocalActions([
    {
      name: localActions.West,
      isDisabled: true,
    },
    {
      name: localActions.East,
      isDisabled: true,
    },
    {
      name: localActions.North,
      isDisabled: true,
    },
    {
      name: localActions.South,
      isDisabled: true,
    },
  ])
}

const updateActions = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const gameState: GameState = await getGameState(contextApi) as GameState
  const permittedMoves = getPermittedMoves(gameState.player.position)
  const isInjured: boolean = (getUserState(contextApi.getActor(), 'injured_876') as any).numberValue >= 5
  // const playerIsAlive = gameState.player.hitPointsRemaining > 0
  const isInCombatState = (
    _.isEqual(gameState.troll.position, gameState.player.position) &&
    gameState.troll.hitPointsRemaining > 0)

  await contextApi.getActor().setLocalActions([
    // {
    //     name: localActions.Fight,
    //     isDeleted: false,
    //     isDisabled: !(playerIsAlive &&
    //         _.isEqual(gameState.troll.position, gameState.player.position) &&
    //         gameState.troll.hitPointsRemaining > 0),

    // },

    // {
    //     name: 'Action.HauntedHouse.Fight',
    //     // name: localActions.Fight,
    //     isDeleted: !isInCombatState,
    //     isDisabled: false

    // },

    // TODO: reinstate the give beer functionality
    //  once we know how to handle the disabling of rewarded action, just within a specific chat room.

    // allPromises.push(
    //     contextApi.getActor().setLocalAction({
    //         name: RewardedGiveBeerHandler.NAME,
    //         isDeleted: false,
    //         isDisabled: !(playerIsAlive &&
    //             _.isEqual(gameState.troll.position, gameState.player.position) &&
    //             gameState.troll.hitPointsRemaining > 0 &&
    //             hasBeer),
    //     }))

    {
      name: localActions.West,
      isDeleted: isInCombatState || isInjured,
      isDisabled: !(_.includes(permittedMoves, 'w')),
    },
    {
      name: localActions.East,
      isDeleted: isInCombatState || isInjured,
      isDisabled: !(_.includes(permittedMoves, 'e')),
    },
    {
      name: localActions.North,
      isDeleted: isInCombatState || isInjured,
      isDisabled: !(_.includes(permittedMoves, 'n')),
    },
    {
      name: localActions.South,
      isDeleted: isInCombatState || isInjured,
      isDisabled: !(_.includes(permittedMoves, 's')),
    },

  ])

  if (isInCombatState) {
    const fightActions = await getFightActions(contextApi)
    await contextApi.getActor().setCurrentActionEdges(fightActions)
  } else {
    await contextApi.getActor().setCurrentActionEdges(_.union(localActionNames, globalActionNames))
  }

  return null
}

const checkIfShouldReset = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const currentVisitTime = Date.now()
  const gameState = await getGameState(contextApi, INITIAL_GAME_STATE) as GameState
  if (diff_mins(new Date(gameState.lastVisit), new Date(currentVisitTime)) >= 5) {
    await reset(contextApi)
  }
  return Promise.resolve(null)
}

const removeAllTiles = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return contextApi.getChatRoom().saveTiles([
    isDeletedLens.set(true)(entranceTileTemplateAnimation),
    isDeletedLens.set(true)(foyerTileTemplateAnimation),
    isDeletedLens.set(true)(backYardTileTemplateAnimation),
    isDeletedLens.set(true)(sideYardTileTemplateAnimation),
    isDeletedLens.set(true)(kitchenTileTemplateAnimation),
    isDeletedLens.set(true)(bathroomTileTemplateAnimation),
    isDeletedLens.set(true)(monsterTileTemplateAnimation),
  ])
}

const enter = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  // TODO JT figure out why composeRNFns does not chain properly
  // TODO JT figure out how to remove monster tile
  return contextApi.getChatRoom().removeTile(monsterTile.name) // can't seem to remove the monster tile geez
    .then(() => removeAllTiles(contextApi))
    .then(() => Promise.all([

      // fxAddToInventory.remove(contextApi),

      contextApi.getActor().readOrCreateLocalActionEdges(localActionNames),

      applyBackground(contextApi, lotties.clouds_2),

      getGameState(contextApi, INITIAL_GAME_STATE)
        .then((gameState: GameState) => setGameState(contextApi, { ...gameState, lastVisit: Date.now() }))
        .then((gameState: GameState) => {
          return Promise.all([
            getUserState(contextApi.getActor(), 'injured_876'),
            hasVisited(contextApi),
            Promise.resolve(gameState),
          ])
        })
        .then((results) => {
          const injured: boolean = (results[0] as HashStatusFieldMetadata).numberValue >= 5
          const gameState: GameState = results[2] as GameState

          return Promise.all([
            Promise.resolve(injured),
            //Promise.resolve(getCurrentRoom(gameState.player.position)),
            // .then((currentRoom: Room) => {
            //     if (injured) {
            //         return Promise.resolve('You are too injured to enter the house.')
            //     } else {
            //         return Promise.resolve(`${hasVisited ? 'Welcome Back ----' : ''}${currentRoom.description}`)
            //     }
            // })
            // .then(contextApi.getActor().sendSystemMessage),
            contextApi.getActor().setCurrentActionEdges([]),
            setHasVisited(contextApi, true),
            gameState,
            // setGameState(contextApi, { ...gameState, lastVisit: Date.now() })
          ])
        })
        .then((results) => {
          const gameState: GameState = results[3] as GameState
          const injured: boolean = results[0] as boolean
          // return injured
          //     ? Promise.resolve(null)
          //     : Promise.resolve(sf.pause(3 * 1000))
          //         .then(() => contextApi.getChatRoom().saveTile(zIndexLens.set(incrementZIndex())(currentRoom.tile)))
          //         .then(sf.pause(2 * 1000))
          //         .then(() => updateActions(contextApi))
          return injured
            ? contextApi.getActor().sendSystemMessage('You are too injured to enter the house.')
            : renderRoom(contextApi, getCurrentRoom(gameState.player.position), gameState)
              // .then(sf.pause(2 * 1000))
              .then(() => updateActions(contextApi))
        }),
    ]))
}

const reset = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.all([
    setGameState(contextApi, { ...INITIAL_GAME_STATE }),
    setHasVisited(contextApi, false),
  ])
}

// const test = (): Promise<any> => {
//     console.log('ok!!!!!!!!!!!!!!!!!!!')
//     return Promise.resolve(null)
// }

const localActionNames = _.values(localActions)
const globalActionNames = []
const generalFightActionNames = [
  moves.punch_80.name,
  moves.hug_50.name,
]

const getFightActions = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return getActionButtonInventory(contextApi.getActor(), items.knife_585.name)
    .then((result: number) => {
      return result > 0 ? Promise.resolve([items.knife_585.name]) : Promise.resolve([])
    })
    .then((result) => _.union(generalFightActionNames, result))
}

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {

    [DebugResetHandler.NAME]: composeReactionFns(reset, enter),

    [moves.hug_50.name]: composeReactionFns(_.partial(onActionFight, 'hug')),
    [moves.punch_80.name]: composeReactionFns(_.partial(onActionFight, 'punch')),
    [items.knife_585.name]: composeReactionFns(_.partial(onActionFight, 'knife')),
    [localActions.East]: composeReactionFns(_.partial(onActionDirection, 'e'), updateActions),
    [localActions.West]: composeReactionFns(_.partial(onActionDirection, 'w'), updateActions),
    [localActions.South]: composeReactionFns(_.partial(onActionDirection, 's'), updateActions),
    [localActions.North]: composeReactionFns(_.partial(onActionDirection, 'n'), updateActions),

  } as ReactionFnMap)
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter: composeReactionFns(
    checkIfShouldReset,
    enter
    // updateActions
  ),
  onReset: null,
  onLoad: registerReactionFns,
}

export default actionResolver
