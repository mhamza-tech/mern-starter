/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @rob4lderman
 * dec2019
 * 
 * node ranking algorithm.
 * (similar to FB edgerank, google's pagerank, etc)
 * data is modeled as a directed graph (nodes + edges).
 * uses markov chains to determine stationary distribution of the graph. 
 * each outbound edge from a node has a weight.
 * all outbound edge weights for a node must sum to 1. 
 * this is the transition matrix, or the "Q" matrix.
 * 
 *              U = alpha * Q + (1 - alpha) * J/m,
 * 
 * U: the adjusted transition matrix
 * Q: transition matrix nxn - all outbound edges (real + implied) <-- NEED TO CONTINUOUSLY BUILD/UPDATE THIS
 * J: matrix of 1's
 * m: number of nodes
 * 
 * U * s = s  (long-run dist)
 * s: stationary distribution 
 * 
 * 
 * score(n): beta1 * time-score(n) + beta2 * popularity-score(n) + beta3 * relatedness-score(me,n) 
 * time-score(n) = n.createdAt in epoch seconds
 * popularity-score(n) = stationary-distribution[n]
 * relatedness-score(me,n) = 
 *      start with initial distribution s = [0, 0, .... 1, 0 , 0, ...]  <-- starting at ME.
 *      step5-distribution = Q^5 * s
 *      return step5-distribution[n]
 * 
 * pruning: TODO.
 * 
 * ---------------------------------------------------------------------------
 * building-Q:
 * for each node...
 *      - get all real + implied outbound edges => QEdges
 *      - note: not all outbound edges actually exist (e.g. a user to their comments)
 *      - assign weight to all nodes
 * 
 * Graph nodes: User, UnObject, ChatRoom, CompletedAction, NewsfeedItem, Comment
 * 
 * ok so i can calculate the transition probabilities (little q).
 * 1. createQEdges for all nodes.
 *      * add QEdgeType for each node to itself (?)
 * 1b. assign q values to all QEdges.
 *      * QEdgeTypes have different weights
 *      * normalize weights to between 0 and 1
 * 
 * 2. build the Q matrix.
 *      * we can't actually build the matrix. way too much memory required.
 *      * instead process each dot-product of the matrix multiplication separately
 * 
 *      s = s_initial   // uniformly distributed, or starting at a single node (for local affinity measures)
 *                      // s is a map of nodeId => probability (not an array of probs)
 * 
 *      for all nodeId:     <-- we can be smarter.  only want outbound edges from all non-zero nodeIds in s
 *                              select UNIQUE thatEntityIds from QEDGES where thisEntityId IN {nonzero(s)}
 *          select * from QEDGE where thatEntityId = nodeId;    
 *                                                      // all the q values for all nodes that link to thatEntityID
 *          s'[nodeId] = dot( inboundQedges.q, s )      // probability s'[nodeId] of being on nodeId after this iteration
 *                                                      // equal to probablity of being on any node in s
 *                                                      // multiplied by transition probs inboundEedges.q from s -> nodeId
 *          if ( s'[nodeId] == 0 ) delete s'[nodeId]    // only keep non-zero probs in s
 *      
 *      
 *      store s' in db
 *          - s_initial
 *          - step_number
 *          - s'
 * 
 *      verification query: select * from QDists where sourceNodeId={me} and stepNumber=1
 *      QDists
 *          - startAtNodeId (="uniform" for calculating stationary dist)
 *          - iteration
 *          - nodeId
 *          - probability 
 * 
 *          
 * 
 *      dot( qedges, smap ):
 *          _.reduce( 
 *              qedges,
 *              (memo, qedge) => qedge.q * _.get( smap, qedge.thatEntityId, 0 )
 *              0
 *          )
       
 * 
 *      
 * 
 * select sorted IDs from QEdges
 * _.sortedIndex(ID)
 * const sortedIndexMemo = _.memoize( _.sortedIndex )
 * Q[ sortedIndexMemo( qedge.thatEntityId ) ][ sortedIndexMemo( qedge.thisEntityId ) ] = qedge.q
 * qedge.type -> weight
 * q = ??
 * 
 * 
 * 3. run Q * s several times, starting from ME, 
 * create EdgeType.RelatednessEdge (where)
 * createRelatednessEdge( ME, thatEntity, edgeType:RelatednessEdge, order=probability)
 * 
 * 
 * 4. compute scores
 * createScoredEdge( ME, thatEntity, edgeType:RankedEdge, order=rankscore)
 * rankscore(ME,n): beta1 * time-score(n) + beta2 * popularity-score(n) + beta3 * relatedness-score(me,n) 
 * 
 * 5. readEdgesBy( thatEntityType:NewsfeedItem, edgeType:RankedEdge, orderBy:order )
 * 
 * 
 */

import _ from 'lodash'
import {
  User,
  QEdge,
  Comment,
  UnObject,
  CompletedAction,
  NewsfeedItem,
  ChatRoom,
  SDist,
} from '../db/entity'
import * as activityModel from './Activity/activity.model'
import * as qedgeModel from './Activity/qedge.model'
import * as chatModel from './Chat/chat.model'
import * as userModel from './User/user.model'
import * as store from './store'
import { sf } from '../utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  EntityType,
  EdgeType,
  EntityRef,
  QEdgeType,
  CreateSDistInput,
} from '../gql-types'
import { createConnectionsPromise } from '../db/connect'
import * as models from 'src/graphql/models'
import {
  readUnObjectsBy,
  readUnObjectBy,
} from 'src/graphql/Action/unobject.model'
import {
  readCompletedActionsBy,
  readCompletedActionBy,
} from 'src/graphql/Action/actionx.model'
import { readNewsfeedItemBy } from 'src/graphql/Activity/newsfeeditem.model'

const logger = LoggerFactory('rank', 'Rank')

// const userEdgeBetas = {
//   reaction: 2 / 20,
//   comment: 3 / 20,
//   following: 3 / 20,
//   followers: 1 / 20,
//   newsfeedItem: 4 / 20,
//   completedAction: 3 / 20,
//   unObject: 4 / 20,
// };

// const qedgeBetas = {
//   CommentToAuthor: 4 / 20,
// };

// const formatProbabilityString = (prob: number): string => {
//   if (prob <= 0 || prob > 1) {
//     throw new Error(`ERROR: formatProbabilityString: prob (${prob}) must be between 0 and 1`);
//   }
//   return sprintf("%0.8f", prob);
// };

const createQEdges = (thisEntity: EntityRef, thatEntitys: EntityRef[], type: QEdgeType): Promise<QEdge[]> => {
  if (_.isEmpty(thisEntity) || _.isEmpty(thatEntitys)) {
    return Promise.resolve([])
  }
  // const m = thatEntitys.length;
  return Promise.resolve(thatEntitys)
    .then(sf.list_fmap_wait(
      (thatEntity: EntityRef) => qedgeModel.buildQEdge({
        thisEntityId: thisEntity.id,
        thisEntityType: thisEntity.entityType,
        thatEntityId: thatEntity.id,
        thatEntityType: thatEntity.entityType,
        buildPhase: 'staging',
        type,
      })
    ))
    .then(sf.list_fmap_wait(
      qedgeModel.createOrUpdateQEdge
    )) as Promise<QEdge[]>
}

/**
 * User edges:
 *      - reactions (Edge.thisEntityId, edgeType:Like|Heart|etc)
 *          - to: comment
 *          - to: newsfeeditem
 */
const createQEdgesActorToReactions = (actor: EntityRef): Promise<QEdge[]> => {
  return activityModel.readEdgesBy({
    where: {
      thisEntityId: actor.id,
      thisEntityType: actor.entityType,
      edgeType: EdgeType.Likes,
      isDeleted: false,
    },
  })
    .then(sf.list_fmap(store.mapEdgeToThatEntityRef))
    .then((thatEntitys: EntityRef[]) => createQEdges(
      actor,
      thatEntitys,
      QEdgeType.ActorToReactions
    ))
}

const createQEdgesPlayerToFollowing = (player: EntityRef): Promise<QEdge[]> => {
  return activityModel.readEdgesBy({
    where: {
      thisEntityId: player.id,
      thisEntityType: player.entityType,
      edgeType: EdgeType.Follows,
      isDeleted: false,
    },
  })
    .then(sf.list_fmap(store.mapEdgeToThatEntityRef))
    .then((thatEntitys: EntityRef[]) => createQEdges(
      player,
      thatEntitys,
      QEdgeType.PlayerToFollowing
    ))
}

const createQEdgesPlayerToFollowers = (player: EntityRef): Promise<QEdge[]> => {
  return activityModel.readEdgesBy({
    where: {
      thatEntityId: player.id,
      thatEntityType: player.entityType,
      edgeType: EdgeType.Follows,
      isDeleted: false,
    },
  })
    .then(sf.list_fmap(store.mapEdgeToThisEntityRef))
    .then((thatEntitys: EntityRef[]) => createQEdges(
      player,
      thatEntitys,
      QEdgeType.PlayerToFollowers
    ))
}

const createQEdgesPlayerToNewsfeedItems = (player: EntityRef): Promise<QEdge[]> => {
  return activityModel.readEdgesBy({
    where: {
      thatEntityId: player.id,
      thatEntityType: player.entityType,
      thisEntityType: EntityType.NewsfeedItem,
      isDeleted: false,
    },
  })
    .then(sf.list_fmap(store.mapEdgeToThisEntityRef))
    .then((thatEntitys: EntityRef[]) => createQEdges(
      player,
      thatEntitys,
      QEdgeType.PlayerToNewsfeedItems
    ))
}

const createQEdgesUserToUnObjects = (user: User): Promise<QEdge[]> => {
  return readUnObjectsBy({
    where: {
      createdByUserId: user.id,
      isDeleted: false,
    },
  })
    .then(
      (unObjects: UnObject[]) => createQEdges(
        user as EntityRef,
        unObjects as EntityRef[],
        QEdgeType.UserToUnObjects
      )
    )
}

const createQEdgesAuthorToComments = (author: EntityRef): Promise<QEdge[]> => {
  return chatModel.readCommentsBy({
    authorEid: models.mapEntityRefToEid(author),
    isDeleted: false,
  })
    .then(
      (comments: Comment[]) => createQEdges(
        author,
        comments as EntityRef[],
        QEdgeType.AuthorToComments
      )
    )
}

const createQEdgesActorToCompletedActions = (actor: EntityRef): Promise<QEdge[]> => {
  return readCompletedActionsBy({
    actorEid: models.mapEntityRefToEid(actor),
  })
    .then(
      (completedActions: CompletedAction[]) => createQEdges(
        actor,
        completedActions as EntityRef[],
        QEdgeType.ActorToCompletedActions
      )
    )
}

/**
 * User edges:
 *      - reactions (Edge.thisEntityId, edgeType:Like|Heart|etc)
 *          - to: comment
 *          - to: newsfeeditem
 *      - comments (Comment.authorEid)
 *          - to: chatroom
 *          - to: newsfeeditem
 *      - following (Edge.thisEntityId, edgeType:Follows)
 *          - to: unobject
 *          - to: user
 *      - followers ? (Edge.thatEntityId, edgeType:Follows)
 *          - to: user
 *      - unObjects (UnObject.createdByUserId)
 *          - to: unobject
 *      - newsfeedItems:actor/player1/player2 (Edge.thatEntityId,Edge.thisEntityType:NewsfeedItem)
 *          - to: newsfeeditem
 *      - completedActions (CompletedAction.actorEid)
 *          - to: completedaction
 *
 */
const createQEdgesUser = (user: User): Promise<any> => {
  return qedgeModel.deleteQEdgesBy({
    thisEntityId: user.id,
    buildPhase: 'staging',
  })
    .then(() => Promise.all([
      createQEdgesActorToReactions(user),
      createQEdgesPlayerToFollowing(user),
      createQEdgesPlayerToFollowers(user),
      createQEdgesAuthorToComments(user),
      createQEdgesUserToUnObjects(user),
      createQEdgesPlayerToNewsfeedItems(user),
      createQEdgesActorToCompletedActions(user),
    ]))
    .catch(sf.tap_throw(err => logger.error('ERROR: createQEdgesUser', { err })))
}

const createQEdgesNewsfeedItemToReactions = (newsfeedItem: NewsfeedItem): Promise<QEdge[]> => {
  return activityModel.readEdgesBy({
    where: {
      thatEntityId: newsfeedItem.id,
      thatEntityType: newsfeedItem.entityType,
      edgeType: EdgeType.Likes,
      isDeleted: false,
    },
  })
    .then(sf.list_fmap(store.mapEdgeToThisEntityRef))
    .then((thatEntitys: EntityRef[]) => createQEdges(
      newsfeedItem as EntityRef,
      thatEntitys,
      QEdgeType.NewsfeedItemToReactions
    ))
}

const createQEdgesNewsfeedItemToComments = (newsfeedItem: NewsfeedItem): Promise<QEdge[]> => {
  return chatModel.readCommentsBy({
    collectionId: models.buildCollectionId(models.mapEntityToEid(newsfeedItem), 'comment'),
    isDeleted: false,
  })
    .then(
      (comments: Comment[]) => createQEdges(
        newsfeedItem as EntityRef,
        comments as EntityRef[],
        QEdgeType.NewsfeedItemToComments
      )
    )
}

const createQEdgesNewsfeedItemToPlayers = (newsfeedItem: NewsfeedItem): Promise<QEdge[]> => {
  return Promise.all(
    _.map(
      ['unObject', 'player1', 'player2', 'actor'],
      (name: string) => activityModel.readEdgeBy({
        thisEntityId: newsfeedItem.id,
        thisEntityType: newsfeedItem.entityType,
        name,
        isDeleted: false,
      })
    )
  )
    .then(_.compact)
    .then(sf.list_fmap(store.mapEdgeToThatEntityRef))
    .then((thatEntitys: EntityRef[]) => createQEdges(
      newsfeedItem as EntityRef,
      thatEntitys,
      QEdgeType.NewsfeedItemToPlayers
    ))
}

/**
 * 
 * newsfeedItem 
 *      - actor, player1, player2, unObject
 *          - to: user
 *          - to: unobject
 *      - comments
 *          - to: comment
 *      - reactions
 *          - to: user
 *          - to: unobject
 *
 */
const createQEdgesNewsfeedItem = (newsfeedItem: NewsfeedItem): Promise<any> => {
  return qedgeModel.deleteQEdgesBy({
    thisEntityId: newsfeedItem.id,
    buildPhase: 'staging',
  })
    .then(() => Promise.all([
      createQEdgesNewsfeedItemToReactions(newsfeedItem),
      createQEdgesNewsfeedItemToComments(newsfeedItem),
      createQEdgesNewsfeedItemToPlayers(newsfeedItem),
    ]))
    .catch(sf.tap_throw(err => logger.error('ERROR: createQEdgesNewsfeedItem', { err })))
}

const createQEdgesChatRoomToPlayers = (chatRoom: ChatRoom): Promise<QEdge[]> => {
  return activityModel.readEdgesBy({
    where: {
      collectionId: chatRoom.id,
      edgeType: EdgeType.ChatRoom,
      isDeleted: false,
    },
  })
    .then(sf.list_fmap(store.mapEdgeToThatEntityRef))
    .then((thatEntitys: EntityRef[]) => createQEdges(
      chatRoom as EntityRef,
      thatEntitys,
      QEdgeType.ChatRoomToPlayers
    ))
}

const createQEdgesChatRoomToUnObject = (chatRoom: ChatRoom): Promise<QEdge[]> => {
  return Promise.all(
    _.map(
      [EdgeType.UnObject, EdgeType.ChatRoom],
      (edgeType: EdgeType) => activityModel.readEdgeBy({
        thisEntityId: chatRoom.id,
        thisEntityType: chatRoom.entityType,
        edgeType,
        isDeleted: false,
      })
    )
  )
    .then(_.compact)
    .then(sf.list_fmap(store.mapEdgeToThatEntityRef))
    .then((thatEntitys: EntityRef[]) => createQEdges(
      chatRoom as EntityRef,
      thatEntitys,
      QEdgeType.ChatRoomToUnObject
    ))
}

const createQEdgesChatRoomToComments = (chatRoom: ChatRoom): Promise<QEdge[]> => {
  return chatModel.readCommentsBy({
    collectionId: models.buildCollectionId(models.mapEntityToEid(chatRoom), 'comment'),
    isDeleted: false,
  })
    .then(
      (comments: Comment[]) => createQEdges(
        chatRoom as EntityRef,
        comments as EntityRef[],
        QEdgeType.ChatRoomToComments
      )
    )
}

/**
 * 
 * ChatRoom edges:
 *      - players 
 *          - to: user
 *          - to: unobject
 *      - unObject
 *          - to: unobject
 *      - maker
 *          - to: user
 *      - comments
 *          - to: comment
 */
const createQEdgesChatRoom = (chatRoom: ChatRoom): Promise<any> => {
  return qedgeModel.deleteQEdgesBy({
    thisEntityId: chatRoom.id,
    buildPhase: 'staging',
  })
    .then(() => Promise.all([
      createQEdgesChatRoomToComments(chatRoom),
      createQEdgesChatRoomToPlayers(chatRoom),
      createQEdgesChatRoomToUnObject(chatRoom),
    ]))
    .catch(sf.tap_throw(err => logger.error('ERROR: createQEdgesChatRoom', { err })))
}

const createQEdgesUnObjectToMaker = (unObject: UnObject): Promise<QEdge[]> => {
  const createdByUserId = _.get(unObject, 'createdByUserId')
  if (_.isEmpty(createdByUserId) || createdByUserId == '0') {
    return Promise.resolve([])
  }
  return Promise.resolve({ id: createdByUserId, entityType: EntityType.User })
    .then(
      (maker: EntityRef) => createQEdges(
        unObject,
        [maker],
        QEdgeType.UnObjectToMaker
      )
    )
}

/**
 * 
 * UnObject edges:
 *      - reactions (Edge.thisEntityId, edgeType:Like|Heart|etc)
 *          - to: comment
 *          - to: newsfeeditem
 *      - comments (Comment.authorEid)
 *          - to: chatroom
 *          - to: newsfeeditem
 *      - followers ? (Edge.thatEntityId, edgeType:Follows)
 *          - to: user
 *      - maker (UnObject.createdByUserId)
 *          - to: user
 *      - newsfeedItems:actor/player1/player2 (Edge.thatEntityId,Edge.thisEntityType:NewsfeedItem)
 *          - to: newsfeeditem
 *      - completedActions (CompletedAction.actorEid)
 *          - to: completedaction
 */
const createQEdgesUnObject = (unObject: UnObject): Promise<any> => {
  return qedgeModel.deleteQEdgesBy({
    thisEntityId: unObject.id,
    buildPhase: 'staging',
  })
    .then(() => Promise.all([
      createQEdgesActorToReactions(unObject),
      createQEdgesPlayerToFollowers(unObject),
      createQEdgesPlayerToFollowing(unObject),
      createQEdgesAuthorToComments(unObject),
      createQEdgesPlayerToNewsfeedItems(unObject),
      createQEdgesActorToCompletedActions(unObject),
      createQEdgesUnObjectToMaker(unObject),
    ]))
    .catch(sf.tap_throw(err => logger.error('ERROR: createQEdgesUnObject', { err })))
}

const createQEdgesCommentToAuthor = (comment: Comment): Promise<QEdge[]> => {
  return Promise.resolve(models.mapEidToEntityRef(comment.authorEid))
    .then(sf.maybe_fmap(
      (author: EntityRef) => createQEdges(
        comment,
        [author],
        QEdgeType.CommentToAuthor
      )
    ))
}

const createQEdgesCompletedActionToActor = (completedAction: CompletedAction): Promise<QEdge[]> => {
  return Promise.resolve(models.mapEidToEntityRef(completedAction.actorEid))
    .then(sf.maybe_fmap(
      (actor: EntityRef) => createQEdges(
        completedAction,
        [actor],
        QEdgeType.CompletedActionToActor
      )
    ))
}

const createQEdgesCommentToReactions = (comment: Comment): Promise<QEdge[]> => {
  return activityModel.readEdgesBy({
    where: {
      thatEntityId: comment.id,
      thatEntityType: comment.entityType,
      edgeType: EdgeType.Likes,
      isDeleted: false,
    },
  })
    .then(sf.list_fmap(store.mapEdgeToThisEntityRef))
    .then((thatEntitys: EntityRef[]) => createQEdges(
      comment,
      thatEntitys,
      QEdgeType.CommentToReactions
    ))
}

const createQEdgesCommentToCollection = (comment: Comment): Promise<QEdge[]> => {
  return Promise.resolve(models.mapEidToEntityRef(models.chompCollectionId(comment.collectionId)))
    .then(
      (coll: EntityRef) => createQEdges(
        comment,
        [coll],
        QEdgeType.CommentToCollection
      )
    )
}

const createQEdgesCompletedActionToCollection = (completedAction: CompletedAction): Promise<QEdge[]> => {
  return Promise.resolve(models.mapEidToEntityRef(completedAction.contextId))
    .then(
      (coll: EntityRef) => createQEdges(
        completedAction,
        [coll],
        QEdgeType.CompletedActionToCollection
      )
    )
}

/**
 * 
 * Comment edges:
 *      - author
 *          - to: user
 *          - to: unobject
 *      - reactions
 *          - to: user
 *          - to: unobject
 *      - collection/context
 *          - to: chatroom
 *          - to: newsfeeditem
 * 
 */
const createQEdgesComment = (comment: Comment): Promise<any> => {
  return qedgeModel.deleteQEdgesBy({
    thisEntityId: comment.id,
    buildPhase: 'staging',
  })
    .then(() => Promise.all([
      createQEdgesCommentToAuthor(comment),
      createQEdgesCommentToReactions(comment),
      createQEdgesCommentToCollection(comment),
    ]))
    .catch(sf.tap_throw(err => logger.error('ERROR: createQEdgesComment', { err })))
}

/**
 * 
 * CompletedAction edges:
 *      - actor
 *          - to: user
 *          - to: unobject
 *      - collection/context
 *          - to: chatroom
 *          - to: newsfeeditem
 *
 */
const createQEdgesCompletedAction = (completedAction: CompletedAction): Promise<any> => {
  return qedgeModel.deleteQEdgesBy({
    thisEntityId: completedAction.id,
    buildPhase: 'staging',
  })
    .then(() => Promise.all([
      createQEdgesCompletedActionToActor(completedAction),
      createQEdgesCompletedActionToCollection(completedAction),
    ]))
    .catch(sf.tap_throw(err => logger.error('ERROR: createQEdgesCompletedAction', { err })))
}

/**
 * PHASE 1.
 */
const buildQEdgesTable = (): Promise<any> => {
  return createConnectionsPromise
    .then(sf.tap(() => logger.info('buildQEdgesTable: entry')))
    .then(() => userModel.readUserById('3af78ab0-d0cf-4b3d-954d-cfe79b02001a'))
    .then(sf.maybe_fmap(createQEdgesUser))
    .then(() => readNewsfeedItemBy({ id: 'd981c6f5-baca-45a6-a86f-64b68392177c' }))
    .then(sf.maybe_fmap(createQEdgesNewsfeedItem))
    .then(() => chatModel.readChatRoomBy({ id: '495e2ac1-6958-4beb-8899-92153666c576' }))
    .then(sf.maybe_fmap(createQEdgesChatRoom))
    .then(() => readUnObjectBy({ id: '35' }))
    .then(sf.maybe_fmap(createQEdgesUnObject))
    .then(() => chatModel.readCommentBy({ id: '27032149-9073-4e0d-8bef-b3dbd20ac8bb' }))
    .then(sf.maybe_fmap(createQEdgesComment))
    .then(() => readCompletedActionBy({ id: 'a2388c1e-a878-42b5-99f0-06678a65f550' }))
    .then(sf.maybe_fmap(createQEdgesCompletedAction))
    .then(sf.tap(() => logger.info('buildQEdgesTable: exit')))
    .catch(err => logger.error('ERROR: rank', { err }))
}

/**
 * PHASE 2.
 */
const computeQs = (): Promise<any> => {
  return createConnectionsPromise
    .then(sf.tap(() => logger.info('computeQs: entry')))
    .then(() => qedgeModel.queryQEdges(
      'SELECT "thisEntityId", COUNT(*) AS "cnt" FROM "q_edge" GROUP BY "thisEntityId" '
    ))
    .then(sf.tap(result => logger.log('queryQEdges.SELECT', { result })))
    .then(sf.list_fmap_wait(computeQsForNode))
    .then(sf.tap(() => logger.info('computeQs: exit')))
}

const computeQsForNode = ({ thisEntityId, cnt }): Promise<any> => {
  const sql = `UPDATE "q_edge" SET "q" = ${1 / cnt} WHERE "thisEntityId" = '${thisEntityId}' `
  return qedgeModel.queryQEdges(sql)
    .then(sf.tap(result => logger.log('queryQEdges.UPDATE', { sql, result })))
}

const computeSDists = (): Promise<any> => {
  return createConnectionsPromise
    .then(sf.tap(() => logger.info('computeSDists: entry')))
    .then(() => qedgeModel.queryQEdges(
      'SELECT "thisEntityId", "thisEntityType", COUNT(*) AS "cnt" FROM "q_edge" GROUP BY "thisEntityId", "thisEntityType" '
    ))
    .then(sf.list_fmap_wait(computeSDistFromStartingNode))
    .then(sf.tap(() => logger.info('computeSDists: exit')))
}

const startingNodeBeta = 0.2

const createSDist = (input: CreateSDistInput): Promise<SDist> => {
  // logger.log( 'createSDist', { input } );
  return Promise.resolve(qedgeModel.mapCreateSDistInputToSDist(input))
    .then(qedgeModel.createOrUpdateSDist)
    .catch(sf.tap_throw(err => logger.error('createSDist', { input, err })))
}

const computeSDistFromStartingNode = ({ thisEntityId, thisEntityType, cnt }): Promise<any> => {
  const iterations = 1
  const startingNodeEid = models.buildEid(thisEntityType, thisEntityId)
  // s dist at the start (all on startingNode)
  const s_start = {
    [startingNodeEid]: 1.0,
  }
  // s dist at the end (populated by computePathsForNode)
  const s_end = {
    [startingNodeEid]: startingNodeBeta,        // initial "stay here" probability
  }
  return computeSDistFromNode(startingNodeEid, s_start, s_end)
    .then(sf.tap(() => logger.log('computeSDistFromStartingNode', { startingNodeEid, s_start, s_end })))
    // store sdist in db
    .then(() => Promise.all(
      _.values(
        _.mapValues(
          s_end,
          (s, endingNodeEid) => createSDist({
            startingNodeEid,
            endingNodeEid,
            s,
            iterations,
          })
        )
      )
    ))
    .catch(sf.tap_throw(err => logger.error('computeSDistFromStartingNode', { err })))
}

/**
 * For all outbound QEdges from fromNodeId (QEdge.thisEntityId),
 * compute the resulting SDists for the endingNodeIds (QEdge.thatEntityIds)
 * 
 * @param fromNodeEid 
 * @param s_start - starting sdist for this iteration
 * @param s_end - ending sdist for this iteration (updated by this function)
 */
const computeSDistFromNode = (fromNodeEid: string, s_start: any, s_end: any): Promise<any> => {
  return qedgeModel.readQEdgesBy({ thisEntityId: models.mapEidToId(fromNodeEid) })
    // beta = Prob( return-to-starting-nodeId )
    // q(thisEntityId->thatEntityId) = qedge.q * (1 - beta)
    // q(thisEntityId->startingNodeId) = qedge.q * (1 - beta) + beta
    // s[thatEntityId] = s[thatEntityId] + q(thisEntityId->thatEntityId)
    // s[thisEntityId] = startingNodeBeta;
    .then(sf.list_fmap_wait(
      (qedge: QEdge) => {
        // qedge.q: transition probability from thisEntityId->thatEntityId
        // q' = qedge.q * (1 - startingNodeBeta):   adjustment to account for the transition probability of returning to the starting node
        // s_start[thisEntityId]:                   qdist probability of starting at node thisEntityId
        // s' = s_start[thisEntityId] * q':         probability of ending at node thatEntityId
        // s_end[thatEntityId] += s'
        const qprime = (1 - startingNodeBeta) * qedge.q
        const sprime = s_start[fromNodeEid] * qprime
        const endingNodeEid = models.buildEid(qedge.thatEntityType, qedge.thatEntityId)
        s_end[endingNodeEid] = _.get(s_end, endingNodeEid, 0) + sprime
      }
    ))
}

export const load = (): Promise<any> => {
  logger.info('load: entry')
  return Promise.resolve(null)
  // PHASE 1: build the QEdges table. 
  // The QEdges table contains all edges in the Q matrix.
  // TODO: .then( buildQEdgesTable )

  // PHASE 2: compute the little q's - i.e. the transition probablities.
  // Note we have to do this AFTER building the QEdges table, so we know
  // exactly how many outbound edges there are for each node, so we can 
  // calculate the little q's and ensure they are evenly distributed across
  // the outbound edges and that they all add up to 1.
  // TODO: .then( computeQs )

  // PHASE 3: build the SDists table.
  // Each record in the SDists gives the little s probability of ending
  // up on the sdist.endingNodeEid, given that we started random walk on 
  // the sdist.startingNodeEid and walked the markov chain for sdist.iterations.
  // TODO: .then( computeSDists )

    .then(sf.tap(() => logger.info('load: exit')))
}
