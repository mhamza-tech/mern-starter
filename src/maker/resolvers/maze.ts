import { RootGameState } from '../chatRoomHelpers'

export interface Room {
  //   isKillZone: boolean
  isTreasure: boolean
  description: string
}

export interface Position {
  x: number
  y: number
}

// export interface PlayerState {
//   hasStarted: boolean
//   hitPointsRemaining: number
//   position: PlayerPosition
// }

export interface GameState extends RootGameState {
  level: number
  hasStarted: boolean
  player: { hitPointsRemaining: number; position: Position; experiencePoints: number }
  troll: { hitPointsRemaining: number; position: Position }
}

const entrance: Room = {
  isTreasure: false,
  description:
    'ENTRANCE: You are standing in the entrance to the cave. Your flickering torch casts ominous shadows against its moss covered walls.',
}
const narrowingTunnel: Room = {
  isTreasure: false,
  description:
    'NARROWING TUNNEL: The sound of gravel crushes beneath your feet and echos against the narrowing walls all around you. The humidity seems to be rising.',
}

const rainRoom: Room = {
  isTreasure: false,
  description:
    'RAIN ROOM: The mist within the cave seems to get thicker, making it quite difficult to see. Be careful!',
}

const skylight: Room = {
  isTreasure: false,
  description:
    'SKYLIGHT ROOM: What an odd room! A ray of light breaks through the ancient ceilings, casting a tiny rainbow upon the floor 🌈.  A small green plant grows where the light hits the floor. 🌱',
}

const deathRoom: Room = {
  isTreasure: false,
  //   description: '[TROLL ROOM] You feel the bones in your skull crush, as a heavy blow is dealt to your head.',
  description: 'DEATH ROOM: This room smells of death.',
}

const teleportRoom: Room = {
  isTreasure: true,
  description: 'SECRET PASSAGE: What a delight! You\'ve found a secret passage to the next level of the game.',
}

export const roomMap: Room[][] = [[entrance, narrowingTunnel, rainRoom], [skylight, deathRoom, teleportRoom]]

export const navigate = (direction: string, currentPosition: Position): Position => {
  switch (direction) {
    case 'n':
      console.log('> GO NORTH')
      if (currentPosition.y <= 0) {
        console.log('You can\'t go north')
        return currentPosition
      } else {
        return { ...currentPosition, y: --currentPosition.y }
      }
      break
    case 's':
      console.log('> GO SOUTH')
      if (currentPosition.y >= roomMap.length - 1) {
        console.log('You can\'t go south')
        return currentPosition
      } else {
        return { ...currentPosition, y: ++currentPosition.y }
      }
      break
    case 'e':
      console.log('> GO EAST')
      if (currentPosition.x <= 0) {
        console.log('You can\'t go east')
        return currentPosition
      } else {
        return { ...currentPosition, x: --currentPosition.x }
      }
      break
    case 'w':
      console.log('> GO WEST')
      if (currentPosition.x >= roomMap[currentPosition.y].length - 1) {
        console.log('You can\'t go west')
        return currentPosition
      } else {
        return { ...currentPosition, x: ++currentPosition.x }
      }
      break
    default:
      console.log('Bad Direction Command')
      return currentPosition
  }
}

export const getPermittedMoves = (currentPosition: Position): string[] => {
  const moves: string[] = []

  currentPosition.y >= 1 ? moves.push('n') : null
  currentPosition.y < roomMap.length - 1 ? moves.push('s') : null
  currentPosition.x >= 1 ? moves.push('e') : null
  currentPosition.x < roomMap[currentPosition.y].length - 1 ? moves.push('w') : null
  return moves
}

/*
const doPath = (path: string[], player: PlayerState) => {
  let position = player.position
  let currentPosition = { ...position }
  _.forEach(path, direction => {
    console.log(`permitted moves ${getPermittedMoves(currentPosition).join(', ')}`)

    currentPosition = navigate(direction, currentPosition)
    console.log(`room ${JSON.stringify(roomMap[currentPosition.y][currentPosition.x])}`)
    if (roomMap[currentPosition.y][currentPosition.x].isKillZone) {
      console.error(`YOU HAVE BEEN KILLED`)
      return false
    }
    // console.log(`position x:${currentPosition.x} y: ${currentPosition.y}`);
  })
}

let startPosition: PlayerPosition = { x: 0, y: 0 };
let player1State: PlayerState = { alive: true, position: startPosition };
doPath(["n", "s", "s", "e", "w", "w", "n", "e", "e"], player1State);
*/
