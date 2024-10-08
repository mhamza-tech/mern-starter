/**
 * @rob4lderman
 * nov2019
 * 
 * 
 */

import * as sf from '../utils/sf'
import { LoggerFactory } from 'src/utils/logger'
import _ from 'lodash'
import {
  ReactionFn,
  ReactionFnMap,
  Reaction,
  ReactionRouter,
  RouteInput,
} from './types'
import Bluebird from 'bluebird'
import { NPCId } from 'src/domain/npcs'

export const WILDCARD_ACTION = '*'

const logger = LoggerFactory('Router', 'ActionsRouter')

const router: ReactionRouter = {

}

// -rx- const isActionMatch = (actionMatcher1:ActionMatcher, action:ActionX): boolean => {
// -rx-     const name1: string = _.get( actionMatcher1, 'name' );
// -rx-     const matchName = !!! _.isEmpty( name1 ) && name1 == _.get(action, 'name');
// -rx-     const matchTag = !!! _.isEmpty( _.intersection( 
// -rx-         _.get( actionMatcher1, 'tags', [] ),
// -rx-         _.get( action, 'tags', [] ),
// -rx-     ));
// -rx-     return matchName || matchTag;
// -rx- };

/**
 * TODO
 * @param reactions 
 */
const pickOneReaction = (reactions: Reaction[]): Reaction => {
  return _.sample(reactions)
}

const getReactions = (key: string): Promise<Reaction[]> => {
  if (_.isEmpty(key)) {
    return Promise.resolve([])
  }
  const reactions = router[key]
  logger.log('getReactions', { key, reactions })
  return Promise.resolve(reactions)
}

const getOneReaction = (key: string): Promise<Reaction> => {
  return getReactions(key)
    .then(pickOneReaction)
}

const buildReactionFnKey = (unObjectIdOrUsername: string, name: string): string => {
  return _.isEmpty(unObjectIdOrUsername)
    ? null
    : `unObjectIdOrUsername=${unObjectIdOrUsername}&name=${name}`
}

const buildReactionFnNameKey = (name: string): string => {
  return `name=${name}`
}

const buildReactionFnTagKey = (tag: string): string => {
  return `tag=${tag}`
}

// Returns true if there are "global" handlers for name
export const hasNameHandler = (name: string): boolean => (
  buildReactionFnNameKey(name) in router
)

// 
// what are the rules?
// 1. find unObjectId:name match
// 2. find unObjectId:* match
// 3. else, find name match
// 4. else, find all tag matches
//
// reactionFnRegistry: {
//      [unObjectId:name]: Reaction[]
//      [unObjectId:tag]: Reaction[]
//      [name]: Reaction[]
//      [tag]: Reaction[]
// }
//
// Reaction[] - run all or run one?
//
const findReactions = (input: RouteInput): Promise<Reaction[]> => {
  return getOneReaction(buildReactionFnKey(input.unObjectId, input.name))
    .then(sf.thru_if(_.isNil)(
      () => getOneReaction(buildReactionFnKey(input.unObjectId, WILDCARD_ACTION))
    ))
    .then(sf.thru_if(_.isNil)(
      () => getOneReaction(buildReactionFnKey(input.handlerUnObjectId, input.name))
    ))
    .then(sf.thru_if(_.isNil)(
      () => getOneReaction(buildReactionFnKey(input.username, input.name))
    ))
    .then(sf.thru_if(_.isNil)(
      () => getOneReaction(buildReactionFnNameKey(input.name))
    ))
    .then(sf.thru_if(_.isNil)(
      () => Promise.all(_.map(
        input.tags,
        tag => getOneReaction(buildReactionFnTagKey(tag))
      ))
    ))
    .then(reactions => _.isArray(reactions) ? reactions : [reactions])
    .then(_.compact)
    .then(sf.tap((reactions: Reaction[]) => logger.log('findReactionFns', { input, reactions })))
}

export const route = (input: RouteInput, actionContextApi: any): Promise<any> => {
  return findReactions(input)
    .then((reactions: Reaction[]) => Promise.all(_.map(
      reactions,
      (reaction: Reaction) => reaction.reactionFn(actionContextApi, _.result(actionContextApi, 'getArgs'))
    )))
}

/**
 * 
 * @param key 
 * @param reaction 
 * @return reaction
 */
const registerReaction = (key: string, reaction: Reaction): Reaction => {
  logger.log('registerReaction', { key, reaction })
  router[key] = _.concat(_.get(router, key, []), reaction)
  return reaction
}

export const registerReactionFnByName = (name: string, reactionFn: ReactionFn): Reaction => {
  logger.info('registerReactionFnByName', { name })
  return registerReaction(
    buildReactionFnNameKey(name),
    { reactionFn }
  )
}

export const registerReactionFnByTag = (tag: string, reactionFn: ReactionFn): Reaction => {
  return registerReaction(
    buildReactionFnTagKey(tag),
    { reactionFn }
  )
}

interface RegisterReactionInput {
  unObjectId?: string
  username?: string
  reactionFn: ReactionFn
  actionName: string
}

export const registerReactionFnMap = (unObjectId: NPCId, reactionFnMap: ReactionFnMap): Promise<any> => {
  return registerReactionFnMapForUnObjectId(unObjectId, reactionFnMap)
}

/**
 * Register a map of action.names => reaction functions, for chat rooms with the given NPC unObjectId.
 * 
 * @param unObjectId - the NPC's unObjectId
 * @param reactionFnMap - map of action.name => reaction function
 * @return reactionFnMap
 */
export const registerReactionFnMapForUnObjectId = (unObjectId: string, reactionFnMap: ReactionFnMap): Promise<any> => {
  logger.info('registerReactionFnMapForUnObjectId', { unObjectId })
  return Promise.resolve(null)
    // TODO: .then( deleteReactionFnEdgesForUnObject )
    .then(() => _.mapValues(
      reactionFnMap,
      (reactionFn: ReactionFn, actionName: string) => ({
        unObjectId,
        reactionFn,
        actionName,
      })
    ))
    .then(_.values)
    .then(sf.list_fmap_wait(
      (input: RegisterReactionInput) => Promise.resolve(input)
        .then(sf.tap(
          (input: RegisterReactionInput) => registerReaction(
            buildReactionFnKey(input.unObjectId, input.actionName),
            { reactionFn: input.reactionFn }
          )
        ))
      // TODO: .then( saveReactionEdge )
    ))
    .catch(sf.tap_throw((err: any) => logger.error('ERROR: registerReactionFnMapForUnObjectId', { err, unObjectId })))
    .catch(() => null)
}

/**
 * Register a map of action.names => reaction functions, for chat rooms with the given NPC unObjectId.
 * 
 * @param username - the user's username
 * @param reactionFnMap - map of action.name => reaction function
 * @return reactionFnMap
 */
export const registerReactionFnMapForUsername = (username: string, reactionFnMap: ReactionFnMap): Promise<any> => {
  logger.info('registerReactionFnMapForUsername', { username })
  return Promise.resolve(null)
    .then(() => _.mapValues(
      reactionFnMap,
      (reactionFn: ReactionFn, actionName: string) => ({
        username,
        reactionFn,
        actionName,
      })
    ))
    .then(_.values)
    .then(sf.list_fmap_wait(
      (input: RegisterReactionInput) => Promise.resolve(input)
        .then(sf.tap(
          (input: RegisterReactionInput) => registerReaction(
            buildReactionFnKey(input.username, input.actionName),
            { reactionFn: input.reactionFn }
          )
        ))
    ))
    .catch(sf.tap_throw((err: any) => logger.error('ERROR: registerReactionFnMapForUsername', { err, username })))
    .catch(() => null)
}

// const deleteReactionFnEdgesForUnObject = (unObjectId: string): Promise<any> => {
//   return activityModel.updateEdgesBy(
//     {
//       thisEntityId: unObjectId,
//       edgeType: EdgeType.ReactionEdge,
//       isDeleted: false,
//     },
//     {
//       isDeleted: true
//     }
//   );
// };

/**
 * @deprecated - we were using ReactionEdges to identify which Actions an NPC 
 *               had registered a ReactionFn.  For the purpose of filtering the
 *               action sheet to include just those Actions.  But we don't 
 *               need it anymore, since NPC handler code specifies exactly which
 *               Actions should appear in the action sheet.
 * @param input 
 */
// const saveReactionEdge = (input: RegisterReactionInput): Promise<any> => {
//   return Bluebird.Promise.props({
//     unObject: store.mapEntityRefToEntity({ id: input.unObjectId, entityType: EntityType.UnObject }),
//     action: actionXByNameCache.get(input.actionName),
//   })
//     .then(({ unObject, action }) => createOrUpdateReactionEdge(unObject, action))
//     ;
// };

// const createOrUpdateReactionEdge = (unObject: UnObject, action: ActionX): Promise<Edge> => {
//   if (_.isEmpty(unObject) || _.isEmpty(action)) {
//     return Promise.resolve(null);
//   }
//   const input: SaveEdgeInput = {
//     ...models.mapEntityRefToThisEntityRef(unObject as any as EntityRef),
//     ...models.mapEntityRefToThatEntityRef(action as any as EntityRef),
//     edgeType: EdgeType.ReactionEdge,
//     order: action.order,
//     name: `reaction.${action.name}`,
//     collectionId: models.buildCollectionId(models.mapEntityToEid(unObject), 'edge'),
//     // collectionName: ? 
//   };
//   return Promise.resolve(input)
//     .then(activityModel.mapSaveEdgeInputToEdge)
//     .then(activityModel.createOrUpdateEdge)
//     .catch(sf.tap_throw((err: any) => logger.error('ERROR: registerReactionForUnObject', { err, input })))
//     .catch(() => null)
//     ;
// };

export const SkipReactionsError: Error = new Error('unreal.skip.reactions')

const checkForSkipReactionsError = (err: Error): any => {
  if (err.message == SkipReactionsError.message) {
    return null
  } else {
    throw err
  }
}

/**
 * 
 * @param reactionFns - compose into a single reactionFn. Each reactionFn is called
 *                      in order.  If a reactionFn returns a Promise, it is waited on
 *                      before calling the next reactionFn.
 * @return ReactionFn - composed reactionFn
 */
export const composeReactionFns = (...reactionFns: ReactionFn[]): ReactionFn => {
  return (contextApi: any, args: any): Promise<any> => {
    return Bluebird.Promise.mapSeries(
      reactionFns,
      (reactionFn: ReactionFn) => reactionFn(contextApi, args)
    )
      .catch(checkForSkipReactionsError)
  }
}
