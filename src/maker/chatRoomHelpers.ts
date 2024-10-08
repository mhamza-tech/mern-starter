import _ from 'lodash'
import { ChatRoomActionContextApi, SetLocalStateInput } from './types'
import { SaveFieldOutput, FieldType, Field } from '../gql-types'
import { sf } from '../utils'
import { backgroundTileTemplate, metadataAnimationLottieURILens } from './fxHelpers'
import { LoggerFactory } from 'src/utils/logger'

const logger = LoggerFactory('chatRoomHelpers', 'ChatRoomHelpers')

interface RootGameState {
  version: number
  lastVisit: number
}

// enum LocalChatRoomProperties {
//     GameState,
// }

// const backgroundTile: SaveTileInputInContext = {
//     name: 'backgroundTile',
//     type: TileType.ImageTile,
//     metadata: {
//         containerStyle: {
//             backgroundColor: 'transparent',
//             top: 0,
//             left: 0,
//             height: 100,
//             width: 100,
//             borderWidth: 0,
//             borderColor: 'red',
//             zIndex: -1,
//         },
//     },
// }

const getGameState = async (contextApi: ChatRoomActionContextApi, initialGameState: object = null): Promise<any> => {
  const stateVariable = 'gameState'
  const defaultInput: SetLocalStateInput = {
    type: FieldType.JsonObjectField,
    name: stateVariable,
    metadata: {
      gameState: initialGameState,
    },
  }

  const retrievedObject = await contextApi
    .getChatRoom()
    .getLocalState(stateVariable, defaultInput)
    .then((field: Field) => _.get(field, 'metadata.gameState') as any)

  const previousVersion = _.get(retrievedObject, 'version')
  const currentVersion = _.get(initialGameState, 'version')

  logger.log('getGameState', { retrievedObject, initialGameState })

  if (!!!_.isNil(initialGameState)) {
    if (_.isNil(previousVersion) || (!_.isNull(initialGameState) && !_.isEqual(previousVersion, currentVersion)))
      return setGameState(contextApi, initialGameState)
  }

  return Promise.resolve(retrievedObject)
}

const setGameState = (contextApi: ChatRoomActionContextApi, gameState: object): Promise<object> => {
  const stateVariable = 'gameState'
  const setLocalStateInput: SetLocalStateInput = {
    type: FieldType.JsonObjectField,
    name: stateVariable,
    metadata: {
      gameState,
    },
  }
  return contextApi.getChatRoom()
    .setLocalState(setLocalStateInput)
    .then((saveFieldOutput: SaveFieldOutput) => _.get(saveFieldOutput.field, 'metadata.gameState') as object)
    .then(sf.tap((retMe: object) => logger.log('setGameState', { retMe, gameState })))
}

// export const applyBackground = (contextApi: ChatRoomActionContextApi, lottieUri: string): Promise<any> => {
//     return contextApi.getChatRoom().applyTile(backgroundTile.name, backgroundTile)
//         .then(() => contextApi.getChatRoom().applyAnimationOnTile(backgroundTile, AnimationType.SourcedAnimation, { sourceUri: lottieUri, loop: true }))

// }

export const applyBackground = (contextApi: ChatRoomActionContextApi, lottieUri: string): Promise<any> => {
  return Promise.resolve(null)
    .then(() => contextApi.getChatRoom().saveTile(metadataAnimationLottieURILens.set(lottieUri)(backgroundTileTemplate)))
}

export { getGameState, setGameState, RootGameState }
