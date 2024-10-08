
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
