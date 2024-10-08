/**
 * @rob4lderman
 * oct2019
 *
 * a bunch of store-related functions.
 * where "store" is DB / cache layer
 *
 */
import _ from 'lodash'
import {
  EntityType,
  EdgeType,
  EntityRef,
  TileInput,
  CacheRefetchOutput,
  CacheRefetchInput,
  EdgesInput,
  NotificationType,
  ChatRoomType,
  DynamicFeedItemLayout,
} from '../gql-types'
import {
  Edge,
  User,
  UnObject,
  Player,
  NewsfeedItem,
  Field,
  Tile,
  Effect,
  ActionX,
  ActionXInstance,
  ChatRoom,
  EdgeStats,
  CommentReceipt,
  Notification,
} from '../db/entity'
import { SimpleActionXInstanceObject } from 'src/db/entity/ActionXInstance'
import * as models from './models'
import { NotificationCacheKey } from './models'
import {
  sf,
  sft,
  misc,
} from 'src/utils'
import { LoggerFactory } from 'src/utils/logger'
import { userByIdCache } from 'src/graphql/User/user.cache'
import {
  actionXsByPackageCache,
  actionXByNameCache,
  actionXInstancesByPlayerCache,
  actionXByIdCache,
  unObjectByUsernameCache,
  unObjectByIdCache,
} from './Action/action.cache'
import {
  chatRoomByIdCache,
  commentReceiptByIdCache,
  commentReceiptByCollectionIdCache,
} from './Chat/chat.cache'
import {
  notificationByIdCache,
  notificationsByUserIdCache,
  newsFeedItemByIdCache,
  fieldByCollectionIdNameCache,
  tileByCollectionIdNameCache,
  tileByIdCache,
  fieldByIdCache,
  edgesByThisIdEdgeTypeCache,
  edgeByIdCache,
  edgesByThisThatIdsEdgeTypeCache,
  fieldsByCollectionIdTypeCache,
  edgeByThisIdCollectionIdCache,
  edgeStatsByEntityIdEdgeTypeDirectionCache,
  edgeStatsByIdCache,
  notificationsByUserIdIsReadCache,
  notificationsByUserIdTypeCache,
} from './Activity/activity.cache'
import * as chatModel from './Chat/chat.model'
import * as activityModel from './Activity/activity.model'
import { compileAndResolve } from './handlebars'
import { safeIn } from '../db/utils'
import DataLoader from 'dataloader'
import * as actionXModel from 'src/graphql/Action/actionx.model'
import * as unObjectModel from 'src/graphql/Action/unobject.model'
import { readUserByUsername } from 'src/graphql/User/user.model'

const logger = LoggerFactory('store', 'Store')

export const entityByEid = <T>(eid: string): Promise<T> => {
  if (!eid) {
    return Promise.resolve(null)
  }
  const entityRef = models.mapEidToEntityRef(eid)
  return entityByEntityRef(entityRef)
}

export const entitiesByEids = <T>(eids: string[]): Promise<T[]> => {
  return sft.promiseMap(eids, eid => entityByEid<T>(eid))
}

export const entityById = <T>(id: string, type: EntityType): Promise<T> => {
  if (_.isNil(id)) {
    return Promise.resolve(null)
  }
  const entityRef = {
    id,
    entityType: type,
  }
  return entityByEntityRef(entityRef)
}

export const entitiesByIds = <T>(ids: string[], type: EntityType): Promise<T[]> => {
  return sft.promiseMap(ids, id => entityById<T>(id, type))
}

export const assertMapEidToEntity = <T>(entityId: string): Promise<T> => {
  return entityByEid<T>(entityId)
    .then(sf.thru_if(_.isNil)(
      () => {
        throw new Error(`ERROR: Entity Not Found ${entityId}`)
      },
    ))
}

// TODO use cache for every type
export const entityByEntityRef = (entityRef: EntityRef): Promise<any> => {
  if (_.isEmpty(entityRef) || _.isEmpty(entityRef.id)) {
    return null
  }

  switch (entityRef.entityType) {
    case EntityType.User:
      return dataLoaders.userById.load(entityRef.id)
    case EntityType.UnObject:
      return dataLoaders.unObjectById.load(entityRef.id)
    case EntityType.ChatRoom:
      return dataLoaders.chatRoomById.load(entityRef.id)
    case EntityType.NewsfeedItem:
      return dataLoaders.newsfeedItemById.load(entityRef.id)
    case EntityType.Comment:
      return chatModel.readCommentBy({ id: entityRef.id })
    case EntityType.CommentReceipt:
      return chatModel.readCommentReceiptBy({ id: entityRef.id })
      // return dataLoaders.commentReceiptById.load(entityRef.id)
    case EntityType.ActionX:
      return dataLoaders.actionXById.load(entityRef.id)
    case EntityType.Tile:
      return dataLoaders.tileById.load(entityRef.id)
    case EntityType.Edge:
      return dataLoaders.edgeById.load({ id: entityRef.id })
    case EntityType.Field:
      return dataLoaders.fieldById.load(entityRef.id)
    case EntityType.Notification:
      return dataLoaders.notificationById.load(entityRef.id)
    default:
      throw new Error(`mapEntityRefToEntity: cannot resolve EntityRef: ${JSON.stringify(entityRef)}`)
  }
}

export const saveCommentReceipt = (commentReceipt: CommentReceipt, saveFn = chatModel.saveCommentReceipt): Promise<CommentReceipt> => {
  return commentReceiptByIdCache.writeThru(saveFn)(commentReceipt)
    .then(sft.tap(
      receipt => dataLoaders.commentReceiptById.clear(commentReceiptByIdCache.pickKey(receipt))
    ))
}

export const commentReceiptById = (id: string): Promise<CommentReceipt> => {
  return entityById<CommentReceipt>(id, EntityType.CommentReceipt)
}

export const commentReceiptsByCollectionId = (key: models.CommentReceiptCacheKey): Promise<CommentReceipt[]> => {
  return dataLoaders.commentReceiptByCollectionId.load(key)
    .then(receipts => sft.promiseMap(receipts, r => commentReceiptById(r.id)))
}

export const fieldById = (id: string, field?: Field): Promise<Field> => {
  if (field) {
    return Promise.resolve(field)
  }
  return entityById<Field>(id, EntityType.Field)
}

export const fieldByCollectionIdName = (key: models.FieldCacheKey): Promise<Field> => {
  return dataLoaders.fieldByCollectionIdName.load(key)
    .then(fields => _.isEmpty(fields) || !_.isNil(fields[0].collectionId)
      ? fields[0]
      : fieldById(fields[0].id),
    )
}

export const fieldsByCollectionIdType = (key: models.FieldCacheKey): Promise<Field[]> => {
  return dataLoaders.fieldsByCollectionIdType.load(key)
    .then(fields => sft.promiseMap(
      fields, 
      field => _.isNil(field) || !_.isNil(field.collectionId)
        ? Promise.resolve(field)
        : fieldById(field.id)
    ))
}

/**
 * ALL FIELD UPDATES MUST STREAM THRU THIS METHOD (in order to keep cache in sync).
 * @return Promise<Field> w/ updated Field.
 */
export const saveField = (field: Field): Promise<Field> => {
  return fieldByCollectionIdNameCache.writeThru(activityModel.createOrUpdateField)(field)
    .then(sf.tap(
      field => Promise.all([
        dataLoaders.fieldByCollectionIdName.clear(fieldByCollectionIdNameCache.pickKey(field)),
        dataLoaders.fieldsByCollectionIdType.clear(fieldsByCollectionIdTypeCache.pickKey(field)),
        dataLoaders.fieldById.clear(fieldByIdCache.pickKey(field)),
      ]),
    ))
}

export const tileById = (id: string): Promise<Tile> => {
  return entityById<Tile>(id, EntityType.Tile)
}

export const tileByCollectionIdName = (input: TileInput): Promise<Tile> => {
  return dataLoaders.tileByCollectionIdName.load(input)
    .then(tile => _.isNil(tile) || !_.isNil(tile.collectionId)
      ? tile
      : tileById(tile.id),
    )
}

/**
 * ALL TILE UPDATES MUST STREAM THRU THIS METHOD (in order to keep cache in sync).
 * @return Promise<Tile> w/ updated Tile.
 */
export const saveTile = (tile: Tile): Promise<Tile> => {
  return tileByCollectionIdNameCache.writeThru(activityModel.createOrUpdateTile)(tile)
    .then(sf.tap(
      tile => Promise.all([
        dataLoaders.tileByCollectionIdName.clear(tileByCollectionIdNameCache.pickKey(tile)),
        dataLoaders.tileById.clear(tileByIdCache.pickKey(tile)),
      ])),
    )
}

export const edgeById = (id: string, dbOptions?: any): Promise<Edge> => {
  return dataLoaders.edgeById.load({ id, dbOptions })
}

const edgesById = (edges: Edge[], dbOptions?: any): Promise<Edge[]> => {
  return sft.promiseMap(edges, 
    edge => !_.isNil(edge.thisEntityId)
      ? Promise.resolve(edge)
      : edgeById(edge.id, dbOptions)
  )
}

export const edgesByThisIdEdgeType = (key: models.EdgesCacheKey): Promise<Edge[]> => {
  return dataLoaders.edgesByThisIdEdgeType.load(key)
    .then(edges => edgesById(edges, key.dbOptions))
}

export const edgesByThisThatIdsEdgeType = (key: models.EdgesCacheKey): Promise<Edge[]> => {
  return dataLoaders.edgesByThisThatIdsEdgeType.load(key)
    .then(edges => edgesById(edges, key.dbOptions))
}

export const edgeByThisThatIdsEdgeType = (key: models.EdgesCacheKey): Promise<Edge> => {
  return edgesByThisThatIdsEdgeType(key)
    .then(edges => edges[0])
}

/**
 * NOTE: thisEntityId:collectionId is unique per edge item,
 * hence we take the first item from the list
 *
 */
export const edgeByThisIdCollectionId = (key: models.EdgesCacheKey): Promise<Edge> => {
  return dataLoaders.edgeByThisIdCollectionId.load(key)
    .then(edges => edgesById(edges, key.dbOptions))
    .then(edges => edges[0])
}

export const edgeStatsById = (id: number): Promise<EdgeStats> => {
  return dataLoaders.edgeStatsById.load(id)
}

// we expect this to return only 1 value so we return the first one
export const edgeStatsByEntityIdEdgeTypeDirection = (key: models.EdgeStatsCacheKey): Promise<EdgeStats> => {
  return dataLoaders.edgeStatsByEntityIdEdgeTypeDirection.load(key)
    .then(edgeStats => _.isEmpty(edgeStats) || !_.isNil(edgeStats[0].entityId)
      ? edgeStats[0]
      : edgeStatsById(edgeStats[0].id),
    )
}

export const edgeStatsCountByEntityIdEdgeTypeDirection = (key: models.EdgeStatsCacheKey): Promise<number> => {
  return edgeStatsByEntityIdEdgeTypeDirection(key)
    .then(edgeStats => edgeStats?.count || 0)
}

export const saveEdgeStats = (edge: Edge, inboundOnly = false): Promise<any> => {
  // we do not YET need to cache any edge stats
  // besides Likes, Friend & FriendRequest
  if (!_.isEqual(edge.edgeType, EdgeType.Likes)
    && !_.isEqual(edge.edgeType, EdgeType.Friend)
    && !_.isEqual(edge.edgeType, EdgeType.FriendRequest)
  ) {
    return activityModel.updateEdgeStatsForEdge(edge)
  }

  const saveAndInvalidateCache = (edgeStats: EdgeStats): Promise<EdgeStats> => {
    return edgeStatsByEntityIdEdgeTypeDirectionCache.writeThru(activityModel.saveEdgeStats)(edgeStats)
      .then(sft.tap(
        es => Promise.all([
          dataLoaders.edgeStatsByEntityIdEdgeTypeDirection
            .clear(edgeStatsByEntityIdEdgeTypeDirectionCache.pickKey(es)),
          dataLoaders.edgeStatsById.clear(edgeStatsByIdCache.pickKey(es)),
        ])
      ))
  }

  if (inboundOnly) {
    return activityModel.updateInboundEdgeStats(edge)
      .then(saveAndInvalidateCache)
  }

  return Promise.all([
    activityModel.updateInboundEdgeStats(edge)
      .then(saveAndInvalidateCache),
    activityModel.updateOutboundEdgeStats(edge)
      .then(saveAndInvalidateCache),
  ])
}

export const invalidateEdgeCaches = (edge: Edge, deleteKeys?: boolean): Promise<Edge> => {
  if (!edge) {
    return Promise.resolve(edge)
  }
  const caches: any[] = [
    dataLoaders.edgesByThisIdEdgeType.clear(edgesByThisIdEdgeTypeCache.pickKey(edge)),
    dataLoaders.edgesByThisThatIdsEdgeType.clear(edgesByThisThatIdsEdgeTypeCache.pickKey(edge)),
    dataLoaders.edgeByThisIdCollectionId.clear(edgeByThisIdCollectionIdCache.pickKey(edge)),
    dataLoaders.edgeById.clear(edgeByIdCache.pickKey(edge)),
  ]
  if (deleteKeys) {
    caches.push(...[
      edgesByThisIdEdgeTypeCache.remove(edge),
      edgeByIdCache.remove(edge),
    ])
  }
  return Promise.all(caches)
    .then(() => edge)
}

/**
 * ALL EDGE UPDATES SHOULD STREAM THRU THIS METHOD (to keep cache in sync)
 * @return Promise<Edge> w/ updated Edge.
 *
 */
export const saveEdge = (edge: Edge, updateInboundEdgeStatsOnly = false): Promise<Edge> => {
  logger.debug('saveEdge', edge)
  if (edge.edgeType === EdgeType.ActionX) {
    return activityModel.createOrUpdateEdge(edge)
  }
  return edgesByThisIdEdgeTypeCache.writeThru(activityModel.createOrUpdateEdge)(edge)
    .then(sf.tap(e => saveEdgeStats(e, updateInboundEdgeStatsOnly)))
    .then(sft.tap(e => invalidateEdgeCaches(e)))
}

/**
 * @param id - either userId or unObjectId
 * @return Promise<Player> where Player is either a User or UnObject.
 */
export const mapLocalIdToPlayer = (id: string): Promise<Player> => {
  return Promise.all([userById(id), unObjectById(id)])
    .then(([user, unObject]) => !user ? unObject : user)
}

export const userByEid = (playerEid: string): Promise<User> => {
  return entityByEid<User>(playerEid)
}

export const mapPlayerToUser = (player: Player): Promise<User> => {
  switch (player.entityType) {
    case EntityType.User:
      return Promise.resolve(player as User)
    case EntityType.UnObject:
      return mapUnObjectToUser(player as UnObject)
    default:
      return null   // not a User or UnObject.
  }
}

export const mapUnObjectToUser = (unObject: UnObject): Promise<User> => {
  if (!unObject) {
    return Promise.resolve(null)
  }
  return entityById<User>(unObject.createdByUserId, EntityType.User)
}

/*
 *
 * @param documentId
 *          eg. 'user/{id}'
 *          eg. 'newsfeeditem/{id}/comment/{id}'
 *        the entity type is the 2nd-to-last segment when splitting on '/'
 */
const mapDocumentIdToEntityRef = (documentId: string): EntityRef => {
  if (_.isEmpty(documentId)) {
    return null
  }
  const splitId = _.split(documentId, '/')
  return {
    id: _.nth(splitId, -1),
    entityType: models.mapEntityTypeStringToEntityType(_.nth(splitId, -2)),
  }
}

export const mapDocumentIdToEntity = (documentId: string): Promise<any> => {
  return Promise.resolve(documentId)
    .then(mapDocumentIdToEntityRef)
    .then(entityByEntityRef)
}

export const mapEdgeToThatEntityRef = (edge: Edge): EntityRef => ({
  entityType: edge.thatEntityType,
  id: edge.thatEntityId,
})

// TODO fetch edge from thatEntityType:thatEntityId:edgeType
export const mapEdgeToThisEntityRef = (edge: Edge): EntityRef => ({
  entityType: edge.thisEntityType,
  id: edge.thisEntityId,
})

export const thisEntityOfEdge = <T>(edge: Edge): Promise<T> => {
  return entityById(edge.thisEntityId, edge.thisEntityType)
}

export const thisEntityOfField = <T>(field: Field): Promise<T> => {
  return entityById(field.thisEntityId, field.thisEntityType)
}

export const mapEffectToThisEntityRef = (effect: Effect): EntityRef => ({
  entityType: effect.thisEntityType,
  id: effect.thisEntityId,
})

export const thisEntityOfEffect = <T>(effect: Effect): Promise<T> => {
  return entityById(effect.thisEntityId, effect.thisEntityType)
}

export const thatEntityOfEdge = <T>(edge: Edge): Promise<T> => {
  return entityById(edge.thatEntityId, edge.thatEntityType)
}

export const thisEntitiesOfEdges = <T>(edges: Edge[]): Promise<T[]> => {
  return sft.promiseMap(edges, edge => thisEntityOfEdge<T>(edge))
}

export const thatEntitiesOfEdges = <T>(edges: Edge[]): Promise<T[]> => {
  return sft.promiseMap(edges, edge => thatEntityOfEdge<T>(edge))
}

export const readThatEntitiesOfEdges = <T>(options: object): Promise<T[]> => {
  return activityModel.readEdgesBy(options)
    .then(edges => thatEntitiesOfEdges<T>(edges))
    .catch<T[]>(sf.tap_throw(err => logger.error('readThatEntitiesOfEdges', { err, options }))) as Promise<T[]>
}

export const readThisEntitiesOfEdges = <T>(options: object): Promise<T[]> => {
  return activityModel.readEdgesBy(options)
    .then(edges => thisEntitiesOfEdges<T>(edges))
    .catch<T[]>(sf.tap_throw(err => logger.error('readThisEntitiesOfEdges', { err, options }))) as Promise<T[]>
}

export const readThatEntitiesOfEdgesPageByOrder = <T>(edgesInput: EdgesInput): Promise<T[]> => {
  return activityModel.readEdgesPageByOrder(edgesInput)
    .then(edges => thatEntitiesOfEdges<T>(edges))
    .catch<T[]>(sf.tap_throw(err => logger.error('readThatEntitiesOfEdgesPageByOrder', {
    err,
    edgesInput,
  }))) as Promise<T[]>
}

/**
 * @param thisEntityId
 * @param edgeType
 * @return outbound edges from thisEntityId:edgeType -> thatEntitys
 */
export const thatEntitiesOfEdgesByThisIdEdgeType = <T>(thisEntityId: string, edgeType: EdgeType): Promise<T[]> => {
  return edgesByThisIdEdgeType({
    thisEntityId,
    edgeType,
  })
    .then(edges => thatEntitiesOfEdges<T>(edges))
}

/**
 * @param thisEntityId
 * @return outbound edges from thisEntityId:edgeType -> thatEntitys
 */
export const readThatEntitiesOfEdgesByThisIdCollectionName = <T>(thisEntityId: string, collectionName: string): Promise<T[]> => {
  return readThatEntitiesOfEdges<T>({
    thisEntityId,
    collectionName,
    isDeleted: false,
  })
}

export const readThisEntitiesOfEdgesByThatIdEdgeType = <T>(thatEntityId: string, edgeType: EdgeType): Promise<T[]> => {
  return readThisEntitiesOfEdges<T>({
    thatEntityId,
    edgeType,
    isDeleted: false,
  })
}

export const chatRoomById = (id: string, chatRoom?: ChatRoom): Promise<ChatRoom> => {
  if (chatRoom) {
    return Promise.resolve(chatRoom)
  }
  return entityById<ChatRoom>(id, EntityType.ChatRoom)
}

export const chatRoomPlayerEids = (chatRoomId: string, chatRoom?: ChatRoom): Promise<string[]> => {
  return chatRoomById(chatRoomId, chatRoom)
    .then(room => !room
      ? []
      : misc.stringToArray(room.playerEids)
    )
}

export const chatRoomPlayers = (chatRoomId: string, chatRoom?: ChatRoom): Promise<Player[]> => {
  return chatRoomPlayerEids(chatRoomId, chatRoom)
    .then(playerEids => sft.promiseMap(playerEids, eid => entityByEid<Player>(eid)))
}

export const chatRoomPlayerIds = (chatRoomId: string, chatRoom?: ChatRoom): Promise<string[]> => {
  return chatRoomPlayerEids(chatRoomId, chatRoom)
    .then(playerEids => playerEids.map(models.mapEidToId))
}

export const zipPlayerEidsWithUsers = (playerEids: string[]): Promise<any[]> => {
  return Promise.all([
    playerEids,
    Promise.all(_.map(playerEids, userByEid)),
  ])
    .then(([playerEids, users]) => _.zip(playerEids, users))
    .then(sf.list_fmap(([playerEid, user]: [string, User]) => ({ playerEid, user })))
}

/**
 * has to be here to avoid circular deps.
 * activity.resolvers and notifs depend on it.
 */
export const newsfeedItemStatusText = (newsfeedItem: NewsfeedItem, user?: User, withCTA = true): Promise<string> => {
  const cta = newsfeedItem.metadata.action?.text
  let { statusText } = newsfeedItem.metadata
  if (withCTA && cta) {
    // We append the CTA to the statusText
    statusText += ' ' + cta
  }
  if (!statusText) {
    return Promise.resolve('')
  }
  // When no user is provided, use the newsfeed item's owner and disable you detection
  const isYou = user || newsfeedItem.layout === DynamicFeedItemLayout.Dynamic2 ? undefined : false
  const { actorEid, partnerEid, unObjectEid } = newsfeedItem.context
  return Promise.all([
    user || userById(newsfeedItem.userId),
    entityByEid<Player>(actorEid),
    entityByEid<Player>(partnerEid),
    entityByEid<UnObject>(unObjectEid),
  ])
    .then(([node, actor, partner, unObject]) => (
      compileAndResolve(statusText, { ...newsfeedItem.context, actor, partner, unObject, node, isYou })
    ))
}

// TODO use { cache: false } to disable in-memory cache
//  use { cacheKeyFn: cache.buildKey } to build cache key
export const dataLoaders = {
  notificationById: new DataLoader<string, Notification>((ids: string[]) => notificationByIdCache.loadMany(ids)),
  notificationsByUserId: new DataLoader<models.NotificationCacheKey, Notification[]>(
    (ids: models.NotificationCacheKey[]) => notificationsByUserIdCache.loadMany(ids)
  ),
  notificationsByUserIdIsRead: new DataLoader<models.NotificationCacheKey, Notification[]>(
    (ids: models.NotificationCacheKey[]) => notificationsByUserIdIsReadCache.loadMany(ids)
  ),
  notificationsByUserIdType: new DataLoader<models.NotificationCacheKey, Notification[]>(
    (ids: models.NotificationCacheKey[]) => notificationsByUserIdTypeCache.loadMany(ids)
  ),
  newsfeedItemById: new DataLoader<string, NewsfeedItem>((ids: string[]) => newsFeedItemByIdCache.loadMany(ids)),
  userById: new DataLoader<string, User>((ids: string[]) => userByIdCache.loadMany(ids)),
  edgeById: new DataLoader<models.EdgeCacheKey, Edge>((ids: models.EdgeCacheKey[]) => edgeByIdCache.loadMany(ids)),
  edgesByThisIdEdgeType: new DataLoader<models.EdgesCacheKey, Edge[]>(
    (ids: models.EdgesCacheKey[]) => edgesByThisIdEdgeTypeCache.loadMany(ids)
  ),
  edgesByThisThatIdsEdgeType: new DataLoader<models.EdgesCacheKey, Edge[]>(
    (ids: models.EdgesCacheKey[]) => edgesByThisThatIdsEdgeTypeCache.loadMany(ids)
  ),
  edgeByThisIdCollectionId: new DataLoader<models.EdgesCacheKey, Edge[]>(
    (ids: models.EdgesCacheKey[]) => edgeByThisIdCollectionIdCache.loadMany(ids)
  ),
  edgeStatsById: new DataLoader<number, EdgeStats>((ids: number[]) => edgeStatsByIdCache.loadMany(ids)),
  edgeStatsByEntityIdEdgeTypeDirection: new DataLoader<models.EdgeStatsCacheKey, EdgeStats[]>(
    (ids: models.EdgeStatsCacheKey[]) => edgeStatsByEntityIdEdgeTypeDirectionCache.loadMany(ids)
  ),
  fieldByCollectionIdName: new DataLoader<models.FieldCacheKey, Field[]>(
    (ids: models.FieldCacheKey[]) => fieldByCollectionIdNameCache.loadMany(ids)
  ),
  fieldsByCollectionIdType: new DataLoader<models.FieldCacheKey, Field[]>(
    (ids: models.FieldCacheKey[]) => fieldsByCollectionIdTypeCache.loadMany(ids)
  ),
  fieldById: new DataLoader<string, Field>((ids: any[]) => fieldByIdCache.loadMany(ids)),
  tileByCollectionIdName: new DataLoader<any, Tile>((ids: any[]) => tileByCollectionIdNameCache.loadMany(ids)),
  tileById: new DataLoader<any, Tile>((ids: any[]) => tileByIdCache.loadMany(ids)),
  actionXsByPackage: new DataLoader<string, ActionX[]>((ids: any[]) => actionXsByPackageCache.loadMany(ids)),
  actionXByName: new DataLoader<string, ActionX>((ids: any[]) => actionXByNameCache.loadMany(ids)),
  actionXById: new DataLoader<string, ActionX>((ids: any[]) => actionXByIdCache.loadMany(ids)),
  actionXInstancesByPlayer: new DataLoader<string, ActionXInstance[]>((eids: any[]) => actionXInstancesByPlayerCache.loadMany(eids)),
  unObjectByUsername: new DataLoader<string, UnObject>((ids: any[]) => unObjectByUsernameCache.loadMany(ids)),
  unObjectById: new DataLoader<string, UnObject>((ids: any[]) => unObjectByIdCache.loadMany(ids)),
  chatRoomById: new DataLoader<string, ChatRoom>((ids: any[]) => chatRoomByIdCache.loadMany(ids)),
  commentReceiptById: new DataLoader<string, CommentReceipt>((ids: any[]) => commentReceiptByIdCache.loadMany(ids)),
  commentReceiptByCollectionId: new DataLoader<models.CommentReceiptCacheKey, CommentReceipt[]>(
    (ids: models.CommentReceiptCacheKey[]) => commentReceiptByCollectionIdCache.loadMany(ids)
  ),
}

// TODO are we using this?
export const cacheRefetch = (parent, args): Promise<CacheRefetchOutput> => {
  const input: CacheRefetchInput = args.input
  return Promise.resolve(input)
    .then((input: CacheRefetchInput): Promise<any> => {
      switch (input.cacheName) {
        case 'userByIdCache':
          return userById(input.cacheKey)
        case 'unObjectByIdCache':
          return unObjectById(input.cacheKey)
        case 'edgesByThisEntityIdThatEntityIdEdgeTypeCache':
          return dataLoaders.edgesByThisThatIdsEdgeType.load(input.compositeCacheKey)
        // case 'edgeStatsByEntityIdEdgeDirectionEdgeTypeCache': return edgeStatsByEntityIdEdgeDirectionEdgeTypeCache.refetch(input.compositeCacheKey)
        // -rx- case 'fieldByCollectionIdNameCache': return fieldByCollectionIdNameCache.refetch( input.compositeCacheKey );
        // -rx- case 'tileByCollectionIdNameCache': return tileByCollectionIdNameCache.refetch( input.compositeCacheKey );
        case 'fieldByCollectionIdNameCache':
          return fieldByCollectionIdNameCache.remove(input.compositeCacheKey)
        case 'tileByCollectionIdNameCache':
          return tileByCollectionIdNameCache.remove(input.compositeCacheKey)
        default:
          throw new Error(`invalid cache name ${input.cacheName}`)
      }
    })
    .then((result: any) => _.isArray(result) ? { result: { arr: result } } : { result })
}

export const mapCollectionIdToLastEntity = (collectionId: string): Promise<any> => {
  return models.isLocalCollectionId(collectionId)
    ?
    Promise.resolve(collectionId)
      .then(models.mapCollectionIdToLocalId)
      .then(mapLocalIdToPlayer)
    :
    Promise.resolve(collectionId)
      .then(models.mapCollectionIdToLastEid)
      .then(entityByEid)
}

export const actionsByPackage = (pkg: string): Promise<ActionX[]> => {
  return dataLoaders.actionXsByPackage.load(pkg)
    .then(actions => {
      if (_.isEmpty(actions) || (actions.length && actions[0].name)) {
        return actions
      }
      return sft.promiseMap(actions, action => dataLoaders.actionXById.load(action.id))
    })
}

export const actionByName = (name: string): Promise<ActionX> => {
  return dataLoaders.actionXByName.load(name)
    .then(action => !action || action.name
      ? action
      : dataLoaders.actionXById.load(action.id),
    )
}

export const saveAction = (actionX: ActionX): Promise<ActionX> => {
  return actionXByNameCache.writeThru(actionXModel.createOrUpdateActionX)(actionX)
    .then(sf.tap(
      action => Promise.all([
        dataLoaders.actionXByName.clear(actionXByNameCache.pickKey(action)),
        dataLoaders.actionXById.clear(actionXByIdCache.pickKey(action)),
      ])
    ))
}

export const actionXInstancesByPlayer = (playerEid: string): Promise<SimpleActionXInstanceObject[]> => {
  return dataLoaders.actionXInstancesByPlayer.load(playerEid)
    // FIXME: Patch EDISON-2831 until this cache is migrated to a ZSet
    // Force the items to be sorted by updatedAt DESC, even if that breaks at the cache level
    .then(instances => instances.sort(misc.sortByDesc('updatedAt')))
}

export const saveActionInstance = (actionInstance: ActionXInstance): Promise<ActionXInstance> => {
  return actionXInstancesByPlayerCache.writeThru(actionXModel.saveActionXInstance)(actionInstance)
    .then(sf.tap(
      instance => invalidateActionInstancesByPlayerCache(instance)
    ))
}

export const invalidateActionInstancesByPlayerCache = (input: any, deleteKeys?: boolean): Promise<any> => {
  const caches: any[] = [
    dataLoaders.actionXInstancesByPlayer.clear(actionXInstancesByPlayerCache.pickKey(input)),
  ]
  if (deleteKeys) {
    caches.push(actionXInstancesByPlayerCache.invalidate(input))
  }
  return Promise.all(caches)
}

export const unObjectById = (id: string): Promise<UnObject> => {
  return entityById<UnObject>(id, EntityType.UnObject)
}

export const unObjectByUsername = (username: string): Promise<UnObject> => {
  return dataLoaders.unObjectByUsername.load(username)
    .then(unObject => !unObject || unObject.username
      ? unObject
      : unObjectById(unObject.id)
    )
}

export const saveUnObject = (unObject: UnObject): Promise<UnObject> => {
  return unObjectByIdCache.writeThru(unObjectModel.saveUnObject)(unObject)
    .then(sf.tap(
      unObject => Promise.all([
        dataLoaders.unObjectById.clear(unObjectByIdCache.pickKey(unObject)),
        dataLoaders.unObjectByUsername.clear(unObjectByUsernameCache.pickKey(unObject)),
      ])
    ))
}

export const updateChatRoomOrder = (chatRoomId: string, chatRoom?: ChatRoom): Promise<ChatRoom> => {
  const date = new Date()
  return chatRoomById(chatRoomId, chatRoom)
    .then(room => {
      room.updatedAt = date
      return room
    })
    .then(room => {
      if (room.type === ChatRoomType.PersonalPlayRoom) {
        return saveChatRoom(room)
      }

      const playerEids = room.playerEids.split(',')
      const edgeConnections = models.mapPlayerEidsToEdgeConnections(playerEids)
      return sft.promiseMap(edgeConnections, ec =>
        edgeByThisIdCollectionId({
          thisEntityId: ec.this.id,
          edgeType: EdgeType.ChatRoom,
          collectionId: chatRoomId,
          dbOptions: { isDeleted: safeIn([false, true]) },
        })
      )
        .then(edges => {
          const promises: Promise<any>[] = [
            saveChatRoom(room),
            ...edges.map(edge => {
              edge.isDeleted = false
              edge.updatedAt = date
              edge.order = date.toISOString()
              return saveEdge(edge)
            }),
          ]
          return Promise.all(promises)
        })
        .then(() => room)
    })
}

export const saveChatRoom = (chatRoom: ChatRoom): Promise<ChatRoom> => {
  return chatRoomByIdCache.writeThru(chatModel.saveChatRoom)(chatRoom)
    .then(invalidateChatRoomCache)
}

export const invalidateChatRoomCache = (chatRoom: ChatRoom, deleteKeys ?: boolean): Promise<ChatRoom> => {
  if (!chatRoom) {
    return Promise.resolve(chatRoom)
  }
  const caches: any[] = [dataLoaders.chatRoomById.clear(chatRoomByIdCache.pickKey(chatRoom))]
  if (deleteKeys) {
    caches.push(chatRoomByIdCache.remove(chatRoom))
  }
  return Promise.all(caches)
    .then(() => chatRoom)
}

export const refetchUser = (user: User): Promise<User> => {
  return invalidateUserCaches(user, true)
    .then(() => userById(user.id))
}

export const userById = (id: string): Promise<User> => {
  return entityById<User>(id, EntityType.User)
}

export const userByIdOrUsername = (idOrUsername: string): Promise<User> => {
  return entityById<User>(idOrUsername, EntityType.User)
    .then(user => !_.isNil(user)
      ? user
      : readUserByUsername(idOrUsername)
    )
}

export const saveUser = (user: User, saveFn: any): Promise<User> => {
  return userByIdCache.writeThru(saveFn)(user)
    .then(invalidateUserCaches)
}

export const invalidateUserCaches = (user: User, deleteKeys?: boolean): Promise<User> => {
  if (!user) {
    return Promise.resolve(user)
  }
  const caches: any[] = [dataLoaders.userById.clear(userByIdCache.pickKey(user))]
  if (deleteKeys) {
    caches.push(userByIdCache.remove(user))
  }
  return Promise.all(caches)
    .then(() => user)
}

export const deleteEdgesBy = (query: any, updateInboundEdgeStatsOnly = false): Promise<boolean> => {
  return activityModel.readEdgesBy({ where: query })
    .then(edges => _.isEmpty(edges)
      ? true
      : sft.promiseMap(edges, edge => {
        edge.isDeleted = true
        edge.count = 0
        return saveEdge(edge, updateInboundEdgeStatsOnly)
      })
        .then(() => true)
    )
}

export const deleteEdgesByThisThatIdsEdgeType = (input: {
  thisEntityIds: string[]
  thatEntityIds: string[]
  edgeTypes: EdgeType[]
}): Promise<boolean> => {
  const query = {
    thisEntityId: safeIn(input.thisEntityIds),
    thatEntityId: safeIn(input.thatEntityIds),
    edgeType: safeIn(input.edgeTypes),
    isDeleted: false,
  }
  return deleteEdgesBy(query)
}

export const newsfeedItemById = (id: string): Promise<NewsfeedItem> => {
  return entityById<NewsfeedItem>(id, EntityType.NewsfeedItem)
}

export const saveNewsfeedItem = (newsFeedItem: NewsfeedItem, saveFn: any): Promise<NewsfeedItem> => {
  return newsFeedItemByIdCache.writeThru(saveFn)(newsFeedItem)
    .then(sft.tap(
      item => dataLoaders.newsfeedItemById.clear(newsFeedItemByIdCache.pickKey(item))
    ))
}

export const notificationsCountByUser = (
  userId: string,
  isRead = false,
  types?: NotificationType[],
): Promise<number> => {
  return activityModel.readNotificationsCountByUser(userId, isRead, types)
}

export const unreadCommentsCount = (userId: string): Promise<number> => {
  return notificationsCountByUser(userId, false, [NotificationType.ChatRoomCommentNotification])
}

export const notificationById = (id: string): Promise<Notification> => {
  return entityById(id, EntityType.Notification)
}

export const notificationsByUser = (key: models.NotificationCacheKey): Promise<Notification[]> => {
  return Promise.resolve(null)
    .then(() => _.isNil(key.isRead)
      ? dataLoaders.notificationsByUserId.load(key)
      : dataLoaders.notificationsByUserIdIsRead.load(key)
    )
    .then(notifications => {
      if (_.isEmpty(notifications) || _.first(notifications)?.userId) {
        return notifications
      }
      return sft.promiseMap(notifications, notif => notificationById(notif.id))
    })
}

export const notificationsByIdsUser = (
  ids: string[],
  userId: string,
  isRead ?: boolean,
): Promise<Notification[]> => {
  return notificationsByUser({ userId, isRead })
    .then(notifications => notifications.filter(notif => ids.includes(notif.id)))
}

// TODO create a userId:eventEid cache
export const notificationByUserEventEid = (key: NotificationCacheKey): Promise<Notification> => {
  return notificationsByUser(key)
    .then(notifications => notifications.filter(notif => notif.eventEid === key.eventEid))
    .then(_.first)
}

const invalidateNotificationCaches = (notif: Notification): void => {
  dataLoaders.notificationsByUserId.clear(notificationsByUserIdCache.pickKey(notif))
  dataLoaders.notificationsByUserIdIsRead.clear(notificationsByUserIdIsReadCache.pickKey(notif))
  dataLoaders.notificationsByUserIdType.clear(notificationsByUserIdTypeCache.pickKey(notif))
  dataLoaders.notificationById.clear(notificationByIdCache.pickKey(notif))
}

export const saveNotification = (notification: Notification): Promise<Notification> => {
  return notificationsByUserIdCache.writeThru(activityModel.saveNotification)(notification)
    .then(sft.tap(invalidateNotificationCaches))
}

export const removeNotificationFromCache = (notification: Notification): Promise<any> => {
  return Promise.all([
    notificationsByUserIdCache.remove(notification),
    invalidateNotificationCaches,
  ])
}
