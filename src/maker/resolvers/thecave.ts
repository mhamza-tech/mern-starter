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
} from '../types'
import { actionOnSubjectWithOverlay } from '../imgix'
import {
  Image,
  TileType,
} from '../../gql-types'
import _ from 'lodash'
import { registerReactionFnMap, ReactionFnMap, composeReactionFns } from '../../enginev3'
import { lotties } from '../helpers'
import { navigate, getPermittedMoves, GameState, roomMap, Position, Room } from './maze'
import { incrementUserAttribute, hasVisited, setHasVisited, UserAttributeKey } from '../playerHelpers'
import { setGameState, getGameState, applyBackground } from '../chatRoomHelpers'
import * as DebugResetHandler from '../reactions/action.debug.reset'

const unObjectId = 'cave_408'
const initialGameState: GameState = {
  version: 1.2,
  lastVisit: Date.now(),
  level: 1,
  hasStarted: false,
  player: { hitPointsRemaining: 10, position: { x: 0, y: 0 }, experiencePoints: 0 },
  troll: { hitPointsRemaining: 10, position: { x: 1, y: 1 } },
}

const getCurrentRoom = (position: Position): Room => {
  return roomMap[position.y][position.x]
}

const localActions = {
  East: 'Action.TheCave.East',
  West: 'Action.TheCave.West',
  North: 'Action.TheCave.North',
  South: 'Action.TheCave.South',
  Fight: 'Action.TheCave.Fight',
  RestartLevel: 'Action.TheCave.RestartLevel',
}

const trollTile: SaveTileInputInContext = {
  name: 'troll',
  type: TileType.ImageTile,
  metadata: {
    image: {
      // uri: `http://unrealfun.imgix.net/tile/troll_1.png?w=${750}`,
      uri: `http://unrealfun.imgix.net/tile/troll_002.png?w=${300}`,
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

const onActionDirection = async (direction: string, contextApi: ChatRoomActionContextApi): Promise<any> => {
  const gameState: GameState = await getGameState(contextApi) as GameState

  gameState.player.position = navigate(direction, gameState.player.position)
  const currentRoom = getCurrentRoom(gameState.player.position)
  gameState.hasStarted = true
  currentRoom.isTreasure && gameState.level++

  // const arrow = direction == 'n' ? '⏫' : direction == 's' ? '⏬' : direction == 'w' ? '⏪' : '⏩'

  // await contextApi.getUser().sendSystemComment(`${arrow} ${currentRoom.description}`)

  await contextApi.getActor().sendSystemMessage(`${currentRoom.description}`)

  if (currentRoom.isTreasure) {
    gameState.hasStarted = false

    // allPromises.push(contextApi.getUser().sendSystemComment(`You have been teleported to the next level...`))

    gameState.player.position = { x: 0, y: 0 }

    // gameState.troll.position = { x: _.sample([1, 2]), y: _.sample([1, 2]) }

    await contextApi.sendUnObjectComment(`Congratulations for making it to level ${gameState.level}`)

    await contextApi.getActor().sendSystemMessage(`${getCurrentRoom(gameState.player.position).description}`)
  } else {
    if (_.isEqual(gameState.troll.position, gameState.player.position) && gameState.troll.hitPointsRemaining > 0) {
      await contextApi.getActor().sendSystemMessage('A mean troll appears in the the corner of the room.  Perhaps you should fight ⚔️?')

      await contextApi.getChatRoom().applyTile(trollTile.name, trollTile)

      // await contextApi.getChatRoom().doLocalAnimationOnLocalTile(trollTile, AnimationType.NativeShakeAnimation)
    } else {
      await contextApi.getChatRoom().removeTile(trollTile.name)
    }
  }

  await setGameState(contextApi, gameState)

  return Promise.resolve(null)
}

const onActionFight = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const actorImage: Image = await contextApi.getUser().getImage()

  const gameState: GameState = await getGameState(contextApi) as GameState

  const strike = _.sample([-7, -3, -2, -1, 0, 1, 2, 3, 7])

  const killXPs = 100

  const coins = 118

  gameState.player.hitPointsRemaining += strike < 0 ? strike : 0

  gameState.troll.hitPointsRemaining -= strike > 0 ? strike : 0

  gameState.player.experiencePoints += gameState.troll.hitPointsRemaining <= 0 ? killXPs : 0
  // gameState.player.coins += gameState.troll.hitPointsRemaining <= 0 ? coins : 0

  gameState.troll.hitPointsRemaining <= 0 && await incrementUserAttribute(contextApi.getActor(), UserAttributeKey.Wealth, coins)

  const strikeSummary =
    strike < 0
      ? `[OUCH] You've been struck by the troll. You suffered ${Math.abs(strike)} hit points. You have ${
        gameState.player.hitPointsRemaining
      } hit points remaining.`
      : strike == 0
        ? 'You both missed!'
        : `[NICE] You've hit the troll where it hurts and he has suffered ${Math.abs(strike)} hit points. He has have ${
          gameState.troll.hitPointsRemaining
        } hit points remaining`

  if (gameState.player.hitPointsRemaining <= 0) {
    await contextApi.getUser().sendSystemComment('☠️☠️☠️ YOU\'RE DEAD ☠️☠️☠️')

    // await contextApi.getUnObject().sendSystemComment(`${playerName} just got killed ☠️!`)

    const backgroundImage = await contextApi.getUnObject().getImage()

    await contextApi.createNewsfeedItemUnObjectImage('{{ name actor }} got killed by a troll in the Cave ☠️', {
      uri: actionOnSubjectWithOverlay(
        backgroundImage.uri,
        'overlay/1x1.png',
        'overlay/1x1.png',
        'overlay/1x1.png',
        'overlay/crimescene.png'
      ),
    })

    // await contextApi.createNewsfeedItemUnObjectCard(`{{ name actor }} got killed by a troll in the Cave ☠️`)

    await contextApi.getChatRoom().removeTile(trollTile.name)
  } else if (gameState.troll.hitPointsRemaining <= 0) {
    await contextApi
      .getUser()
      .sendSystemComment(
        `[WIN] You've killed the troll and gained ${killXPs} experience points and stole his money! You have\n - ${gameState.player.experiencePoints} XPs\n - and ${coins} new dollars`
      )

    await contextApi.getChatRoom().removeTile(trollTile.name)

    // await contextApi.createNewsfeedItemUnObjectCard(
    //   `{{ name actor }} just killed troll and {{ heshe actor }} increased {{ hisher actor }} #WEALTH.`,
    // )

    await contextApi.createNewsfeedItemUnObjectImage('{{ name actor }} killed a troll in the Cave.', {
      uri: actionOnSubjectWithOverlay(
        `${actorImage.uri}?w=424`,
        'backgrounds/red_1.png',
        'tile/troll_1.png',
        'tile/machine_gun.png',
        'overlay/blood_bath_2.png'
      ),
    })
  } else {
    await contextApi.doSourcedAnimation(lotties.swordfight1)

    // Set a timer here because the fight animation lasts for approx 4 seconds
    setTimeout(() => {
      contextApi.getUser().sendSystemMessage(strikeSummary) 
    }, 4000)
  }

  await setGameState(contextApi, gameState)

  return Promise.resolve(null)
}

const onActionRestartLevel = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const gameState: GameState = await getGameState(contextApi) as GameState

  await setGameState(contextApi, {
    ...gameState,
    hasStarted: initialGameState.hasStarted,
    player: {
      ...gameState.player,
      position: initialGameState.player.position,
      hitPointsRemaining: initialGameState.player.hitPointsRemaining,
    },
    troll: {
      ...gameState.troll,
      hitPointsRemaining: initialGameState.troll.hitPointsRemaining,
      //   position: { x: _.sample([0, 1]), y: _.sample([1, 2]) },
      position: initialGameState.troll.position,
    },
  } as GameState)
  const currentRoom = getCurrentRoom(initialGameState.player.position)
  await contextApi.sendUnObjectComment(
    `You are at the beginning of level ${gameState.level}.`// You have\n - ${gameState.player.experiencePoints} XPs\n - ${gameState.player.coins} gold coins`,
  )
  await contextApi.getActor().sendSystemComment(`${currentRoom.description}`)
  await contextApi.getChatRoom().removeTile(trollTile.name)
  return Promise.resolve(null)
}

const onActionResetChatRoom = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  // const gameState: GameState = await getGameState(contextApi) as GameState

  await setGameState(contextApi, {
    ...initialGameState,
  } as GameState)

  await contextApi.getChatRoom().removeTile(trollTile.name)

  await setHasVisited(contextApi, false)

  await contextApi.getActor().sendSystemMessage('Playroom has been Reset')

  await onEnter(contextApi)

  return Promise.resolve(null)
}

const pushPlayerActionSheet = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const gameState: GameState = await getGameState(contextApi) as GameState
  const permittedMoves = getPermittedMoves(gameState.player.position)
  const playerIsAlive = gameState.player.hitPointsRemaining > 0

  await contextApi.getActor().setLocalActions([
    {
      name: localActions.Fight,
      isDeleted: false,
      isDisabled: !(playerIsAlive &&
        _.isEqual(gameState.troll.position, gameState.player.position) &&
        gameState.troll.hitPointsRemaining > 0),
    },

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
      isDeleted: false,
      isDisabled: !(_.includes(permittedMoves, 'w') && playerIsAlive),
    },
    {
      name: localActions.East,
      isDeleted: false,
      isDisabled: !(_.includes(permittedMoves, 'e') && playerIsAlive),
    },
    {
      name: localActions.North,
      isDeleted: false,
      isDisabled: !(_.includes(permittedMoves, 'n') && playerIsAlive),
    },
    {
      name: localActions.South,
      isDeleted: false,
      isDisabled: !(_.includes(permittedMoves, 's') && playerIsAlive),
    },
    {
      name: localActions.RestartLevel,
      isDeleted: false,
      isDisabled: !(gameState.hasStarted),
    },
  ])

  await contextApi.getActor().setCurrentActionEdges(_.union(localActionNames, globalActionNames))

  return null
}

const onEnter = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  // const playerName = contextApi.getUser().getName()

  const gameState: GameState = await getGameState(contextApi, initialGameState) as GameState

  const currentRoom = getCurrentRoom(gameState.player.position)

  if (!await hasVisited(contextApi)) {
    await contextApi.sendUnObjectComment(
      'Welcome! Come inside, but beware of the danger that awaits. I offer riches to those who venture forth...'
    )

    await setHasVisited(contextApi, true)

    await contextApi.getActor().sendSystemMessage(`${currentRoom.description}`)
    // await contextApi.getUnObject().sendSystemComment(`${playerName} is standing at the entrance to your cave.`)
  }

  await applyBackground(contextApi, lotties.clouds_2)

  await contextApi.getActor().readOrCreateLocalActionEdges(localActionNames)

  await pushPlayerActionSheet(contextApi)

  return Promise.resolve(null)
}

const postAction = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return pushPlayerActionSheet(contextApi)
}

const localActionNames = _.values(localActions)
const globalActionNames = [
  DebugResetHandler.NAME,
]

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {

    [DebugResetHandler.NAME]: composeReactionFns(
      onActionResetChatRoom, postAction
    )

    , [localActions.East]: composeReactionFns(_.partial(onActionDirection, 'e'), postAction),
    [localActions.West]: composeReactionFns(_.partial(onActionDirection, 'w'), postAction),
    [localActions.South]: composeReactionFns(_.partial(onActionDirection, 's'), postAction),
    [localActions.North]: composeReactionFns(_.partial(onActionDirection, 'n'), postAction),
    [localActions.Fight]: composeReactionFns(onActionFight, postAction),

    [localActions.RestartLevel]: composeReactionFns(onActionRestartLevel, postAction),

  } as ReactionFnMap)
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onReset: null,
  onLoad: registerReactionFns,
}

export default actionResolver
