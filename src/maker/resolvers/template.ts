/**
 * @rob4lderman
 * feb2020
 * 
 * Template handler module.
 * 
 * https://gitlab.com/unrealfun/docs/-/blob/master/HandlerApi.md#unobjects
 * How to make an UnObject / NPC
 * 1. define the UnObject in a static/unobjects/unobjects.yml
 *      - note: the unObjectId must be unique
 *      - the yaml files are parsed at startup and the UnObjects are upserted into the DB
 *        from stomping on your changes
 *      - requires image asset
 * 2. create a Handler Module aka ActionResolver
 *      - make a copy of this template module (and optionally template.assets.ts) to get started 
 *      - update the unObjectId 
 *      - Handler Modules are defined under src/maker/resolvers
 *      - Handler Module is linked to the UnObject/NPC via the unObjectId
 * 3. add your Handler Module to src/graphql/Chat/chat.actions.ts
 *      - follow the pattern established by all the other modules
 *      - you should now be able to search for your unobject in the app
 */

import {
  ActionResolver,
  ChatRoomActionContextApi,
} from '../types'
import { LoggerFactory } from 'src/utils/logger'
import {
  registerReactionFnMap,
  ReactionFnMap,
} from '../../enginev3'
import { ActionStubSet } from '../types'
import { NPCId } from 'src/domain/npcs'

const logger = LoggerFactory('template', 'NPC')
const log = logger.info

/**
 * @param contextApi 
 */
const onActionYes = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return contextApi.getActor().sendSystemMessage('You played YES')
}

/**
 * @param contextApi 
 */
const onActionNo = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return contextApi.getActor().sendSystemMessage('You played NO')
}

/**
 * @param contextApi 
 */
const onActionMore = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return contextApi.getActor().sendSystemMessage('You played MORE')
}

/**
 * Long-pressing the user's avatar in the upper-right of the Chat Room will
 * execute the 'Action.Debug.Reset' action, which is wired up to this method.
 * 
 * @param contextApi 
 */
const onReset = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onReset')
  return Promise.resolve([
    contextApi.getActor().sendSystemMessage('RESET!'),
  ])
}

/**
 * This method is called every time a User enters this Chat Room.
 * @param contextApi 
 */
const onEnter = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onEnter')

  // Streams down the action sheet to the app
  contextApi.getActor().saveCurrentActionStubs(actionStubSet)

  return contextApi.getActor().sendSystemMessage(
    `HI! Welcome to ${contextApi.getUnObject().getName()}!`
  )
}

/**
 * The NPC's unObjectId for this handler module.
 * Each handler module is associated with a specific NPC.
 */
const unObjectId = 'template' as NPCId

/**
 * The ActionStubSet to show in the action sheet in this ChatRoom.
 * You can have multiple ActionStubSets.
 * An ActionStubSet is streamed down to the app via:
 *      contextApi.getActor().saveCurrentActionStubs( actionStubSet )
 */
export const actionStubSet: ActionStubSet = {
  staticActionNames: [
    'Action.Debug.Reset',
    'template.action.yes',
    'template.action.no',
    'template.action.more',
  ],
  actionInstanceNames: [],
}

/**
 * This wires up the reaction functions in this module to the action router. 
 * This method should be called from onLoad.
 */
const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {
    'template.action.yes': onActionYes,
    'template.action.no': onActionNo,
    'template.action.more': onActionMore,
    'Action.Debug.Reset': onReset,
  } as ReactionFnMap)
}

/**
 * All handler modules export an ActionResolver object.
 */
const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onReset,
  onLoad: registerReactionFns,
}

export default actionResolver
