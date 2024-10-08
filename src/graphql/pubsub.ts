/**
 * @rob4lderman
 * feb2020
 * 
 * 
 * Channel types:
 * 
 * user-public channel - 
 *      - public channel
 *      - anyone w/ interest in the user can subscribe to this channel
 *      - channelId: user/{id}/public
 *      - channelId: unobject/{id}/public
 * user-private channel 
 *      - private, direct to a specific user
 *      - only the specific user subscribes to this channel
 *      - channelId: user/{id}/private
 * chatroom channel
 *      - for chatroom-specific events
 *      - channelId: chatroom/{id}/public
 * chatroom user-private channel
 *      - private, direct to a specific user
 *      - for chatroom-specific events     
 *      - channelId: chatroom/{id}/user/{id}/private
 * 
 */

import _ from 'lodash'
import {
  EntityScope,
  EntityType,
  EffectType,
  ActionXInstance,
  TransferActionEffectMetadata,
  CreateActionEffectMetadata,
  FriendRequest,
  FieldType,
  FeedItem,
  NotificationType,
} from '../gql-types'
import {
  sf,
  sft,
} from '../utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  Comment,
  CommentReceipt,
  Receipt,
  Edge,
  Tile,
  Effect,
  Field,
  Notification,
} from '../db/entity'
import * as models from './models'
import * as store from './store'
import * as chatModel from './Chat/chat.model'
import moment from 'moment'
import { redisPubSub } from 'src/services'
import * as activityModel from './Activity/activity.model'
import * as notifModel from 'src/graphql/Activity/notification.model'

const logger = LoggerFactory('pubsub', 'PubSub')

const mapCollectionIdToRootNodePublicChannelId = (collectionId: string): string => {
  const rootNodeEid = models.mapCollectionIdToFirstEid(collectionId)
  return `${rootNodeEid}/public`
}

/**
 * Published on: chatroom/id/public
 * OR: newsfeeditem/id/public
 * (roodNodeEid/public)
 * 
 * @param comment 
 */
export const publishComment = (comment: Comment): Promise<Comment | void> => {
  logger.debug('publishComment', { collectionId: comment.collectionId, comment })
  if (models.isCollectionIdFirstEidEntityType(comment.collectionId, EntityType.ChatRoom)) {
    return publishChatRoomComment(comment)
  }
  if (models.isCollectionIdFirstEidEntityType(comment.collectionId, EntityType.NewsfeedItem)) {
    return publishNewsfeedItemComment(comment)
  }
  return Promise.resolve()
}

export const publishChatRoomComment = (comment: Comment): Promise<Comment> => {
  return Promise.resolve(models.mapCommentToChatRoomId(comment))
    .then(store.chatRoomPlayerEids)
    .then(sf.list_fmap_wait(
      (playerEid: string) => redisPubSub.publish(`${playerEid}/private`, comment)
    ))
    .then(() => comment)
}

export const publishChatRoomCommentReceipt = (commentReceipt: CommentReceipt): Promise<CommentReceipt> => {
  return chatModel.readCommentById(commentReceipt.commentId)
    .then(models.mapCommentToChatRoomId)
    .then(store.chatRoomPlayerEids)
    .then(playerEids => sft.promiseMap(
      playerEids,
      playerEid => redisPubSub.publish(`${playerEid}/private`, commentReceipt)
    ))
    .then(() => commentReceipt)
}

export const publishNewsfeedItemComment = (comment: Comment): Promise<Comment> => {
  return redisPubSub.publish(comment.collectionId, comment)
    .then(() => comment)
}

/**
 * Published on: user/id/private
 * OR: newsfeeditem/id/public
 * (roodNodeEid/public)
 * 
 * @param commentReceipt
 */
export const publishCommentReceipt = (commentReceipt: CommentReceipt): Promise<CommentReceipt> => {
  const channelId = mapCollectionIdToRootNodePublicChannelId(commentReceipt.collectionId)
  if (channelId.startsWith('chatroom')) {
    return publishChatRoomCommentReceipt(commentReceipt)
  }
  return redisPubSub.publish(channelId, commentReceipt)
    .then(() => commentReceipt)
}

const parseCollectionDirName = (collectionId: string): string => {
  return _.join(_.initial(_.split(collectionId, '/')), '/')
}

/**
 * Published on: chatroom/id/public
 * OR: newsfeeditem/id/public
 * (roodNodeEid/public)
 * 
 * @param receipt 
 */
export const publishReceipt = (receipt: Receipt): Promise<Receipt> => {
  const collectionId = parseCollectionDirName(receipt.entityCollectionId) + '/receipt'
  logger.debug('publishReceipt', { collectionId, receipt })
  return redisPubSub.publish(mapCollectionIdToRootNodePublicChannelId(receipt.entityCollectionId), receipt).then(() => receipt)
}

const isSameCollectionId = (entitys: any[]): boolean => {
  const s = _.uniqBy(entitys, entity => _.get(entity, 'collectionId'))
  return (_.isEmpty(s) || s.length == 1)
}

/**
 * Published to: 
 * LOCAL: chatroom/id/public
 * GLOBAL: user/id/public
 * 
 * @param effect 
 */
export const publishEdges = (edges: Edge[]): Promise<any> => {
  const collectionId = _.get(_.first(edges), 'collectionId')
  if (_.isEmpty(collectionId)) {
    return Promise.resolve(null)
  } else if (!!!isSameCollectionId(edges)) {
    throw new Error(`ERROR: publishEdges: all edges must have same collectionId: ${JSON.stringify(edges)}`)
  }
  logger.debug('publishEdges', { collectionId: collectionId, edges })
  const edge: Edge = _.first(edges)
  const scope = _.includes(edge.collectionId, 'local')
    ? EntityScope.ChatRoomScope
    : EntityScope.GlobalScope

  switch (scope) {
    case EntityScope.ChatRoomScope:
      return redisPubSub.publish(mapCollectionIdToRootNodePublicChannelId(edge.collectionId), { updatedAt: moment().toISOString(), pubsubArray: edges })
    case EntityScope.GlobalScope:
      return redisPubSub.publish(`${models.buildEid(edge.thisEntityType, edge.thisEntityId)}/public`, { updatedAt: moment().toISOString(), pubsubArray: edges })
    default:
      logger.error('ERROR: publishedge: invalid scope', { edge })
      return Promise.resolve(null)
  }
}

/**
 * Published to: 
 * LOCAL: chatroom/id/public
 * GLOBAL: user/id/public
 * 
 * @param effect 
 */
export const publishEdge = (edge: Edge): Promise<any> => {
  if (_.isEmpty(edge.collectionId)) {
    return Promise.resolve(null)
  }
  logger.debug('publishEdge', { collectionId: edge.collectionId, edge })

  const scope = _.includes(edge.collectionId, 'local')
    ? EntityScope.ChatRoomScope
    : EntityScope.GlobalScope

  switch (scope) {
    case EntityScope.ChatRoomScope:
      return redisPubSub.publish(mapCollectionIdToRootNodePublicChannelId(edge.collectionId), edge)
    case EntityScope.GlobalScope:
      return redisPubSub.publish(`${models.buildEid(edge.thisEntityType, edge.thisEntityId)}/public`, edge)
    default:
      logger.error('ERROR: publishedge: invalid scope', { edge })
      return Promise.resolve(null)
  }
}

/**
 * publish feedTemplateItem to user private channel
 * @param userId
 * @param feedItem
 */
export const publishFeedItem = (userId: string, feedItem: FeedItem): Promise<any> =>{
  logger.debug('publishFeedItem', { collectionId: 'feedItem', feedItem })
  return redisPubSub.publish(`user/${userId}/private`, feedItem)
}

/**
 * Published to: 
 * LOCAL: chatroom/id/public
 * GLOBAL: user/id/public
 * LOCAL-PRIVATE: chatroom/id/user/id/private
 * GLOBAL-PRIVATE: user/id/private
 * 
 * @param effect 
 */
export const publishEffect = (effect: Effect): Promise<any> => {
  logger.debug('publishEffect', effect)
  if (_.isEmpty(effect)) {
    return Promise.resolve(effect)
  }
  // switch-case polymorphism
  switch (effect.type) {
    case EffectType.SaveFieldEffect:
    case EffectType.SaveEdgeEffect:
    case EffectType.SaveTileEffect:
      return Promise.resolve(null)
    case EffectType.TransferActionEffect:
      return publishTransferActionEffect(effect)
    case EffectType.CreateActionEffect:
    case EffectType.DeleteActionEffect:
      return publishCreateActionEffect(effect)
    default:
      return publishDefaultEffect(effect)
  }
}

/**
 * Publish to the private channels of both the sender and receiver.
 * 
 * @param effect 
 */
export const publishCreateActionEffect = (effect: Effect): Promise<any> => {
  const metadata: CreateActionEffectMetadata = effect.metadata
  if (_.isEmpty(metadata)) {
    return Promise.resolve(null)
  }

  return redisPubSub.publish(`${metadata.input.playerEid}/private`, effect)
}

/**
 * Publish to the private channels of both the sender and receiver.
 * 
 * @param effect 
 */
export const publishTransferActionEffect = (effect: Effect): Promise<any> => {
  const metadata: TransferActionEffectMetadata = effect.metadata
  if (_.isEmpty(metadata)) {
    return Promise.resolve(null)
  }
  return Promise.all([
    redisPubSub.publish(`${metadata.input.playerEid}/private`, effect),
    redisPubSub.publish(`${metadata.input.transferToPlayerEid}/private`, effect),
  ])
}

export const publishDefaultEffect = (effect: Effect): Promise<any> => {
  switch (effect.scope) {
    case EntityScope.ChatRoomScope:
      return redisPubSub.publish(mapCollectionIdToRootNodePublicChannelId(effect.collectionId), effect)
    case EntityScope.GlobalScope:
      return redisPubSub.publish(`${models.buildEid(effect.thisEntityType, effect.thisEntityId)}/public`, effect)
    case EntityScope.ChatRoomPrivateScope:
      return redisPubSub.publish(`${models.mapCollectionIdToFirstEid(effect.collectionId)}/${models.buildEid(effect.thisEntityType, effect.thisEntityId)}/private`, effect)
    case EntityScope.GlobalPrivateScope:
      return redisPubSub.publish(`${models.buildEid(effect.thisEntityType, effect.thisEntityId)}/private`, effect)
    default:
      logger.error('ERROR: publishEffect: invalid scope', { effect })
      return Promise.resolve(null)
  }
}

// Probably more should be muted but needs a very deep analysis
const MUTED_FIELDS = [FieldType.JsonObjectField, FieldType.StringField]

const shouldPublishField = (field: Field): boolean => {
  if (MUTED_FIELDS.includes(field.type)) {
    return false
  }
  // Fields can be silenced individually, also counters are silenced
  if (field.metadata.silent || field.collectionName === 'counters') {
    return false
  }
  return true
}

/**
 * Published to: 
 * LOCAL: chatroom/id/public
 * GLOBAL: user/id/public
 * LOCAL-PRIVATE: chatroom/id/user/id/private
 * GLOBAL-PRIVATE: user/id/private
 * 
 * @param field 
 */
export const publishField = (field: Field): Promise<any> => {
  if (field.name === 'currentActionStubs') {
    logger.info('publishField', logger.inspect(field))
  } else {
    logger.debug('publishField', field)
  }
  
  if (!shouldPublishField(field)) {
    return Promise.resolve()
  }

  switch (field.scope) {
    case EntityScope.ChatRoomScope:
      return redisPubSub.publish(mapCollectionIdToRootNodePublicChannelId(field.collectionId), field)
    case EntityScope.GlobalScope:
      return redisPubSub.publish(`${models.buildEid(field.thisEntityType, field.thisEntityId)}/public`, field)
    case EntityScope.ChatRoomPrivateScope:
      return redisPubSub.publish(`${models.mapCollectionIdToFirstEid(field.collectionId)}/${models.buildEid(field.thisEntityType, field.thisEntityId)}/private`, field)
    case EntityScope.GlobalPrivateScope:
      return redisPubSub.publish(`${models.buildEid(field.thisEntityType, field.thisEntityId)}/private`, field)
    default:
      logger.error('ERROR: publishField: invalid scope', { field })
      return Promise.resolve(null)
  }
}

export const publishCount = (userId: string, name: string, value: number): Promise<any> => {
  const field = activityModel.numberField(userId, name, value)
  return publishField(field)
}

/**
 * Published to: 
 * LOCAL: chatroom/id/public
 * GLOBAL: user/id/public
 * LOCAL-PRIVATE: chatroom/id/user/id/private
 * GLOBAL-PRIVATE: user/id/private
 * @param tile 
 */
export const publishTile = (tile: Tile): Promise<any> => {
  logger.debug('publishTile', tile)

  // channel refactor
  switch (tile.scope) {
    case EntityScope.ChatRoomScope:
      return redisPubSub.publish(mapCollectionIdToRootNodePublicChannelId(tile.collectionId), tile)
    case EntityScope.GlobalScope:
      return redisPubSub.publish(`${models.buildEid(tile.thisEntityType, tile.thisEntityId)}/public`, tile)
    case EntityScope.ChatRoomPrivateScope:
      return redisPubSub.publish(`${models.mapCollectionIdToFirstEid(tile.collectionId)}/${models.buildEid(tile.thisEntityType, tile.thisEntityId)}/private`, tile)
    case EntityScope.GlobalPrivateScope:
      return redisPubSub.publish(`${models.buildEid(tile.thisEntityType, tile.thisEntityId)}/private`, tile)
    default:
      logger.error('ERROR: publishTile: invalid scope', { tile })
      return Promise.resolve(null)
  }
}

/**
 * Published to: 
 * LOCAL: chatroom/id/public
 * GLOBAL: user/id/public
 * LOCAL-PRIVATE: chatroom/id/user/id/private
 * GLOBAL-PRIVATE: user/id/private
 * 
 * @param tiles
 */
export const publishTiles = (tiles: Tile[]): Promise<any> => {
  const collectionId = _.get(_.first(tiles), 'collectionId')
  if (_.isEmpty(collectionId)) {
    return Promise.resolve(null)
  } else if (!!!isSameCollectionId(tiles)) {
    throw new Error(`ERROR: publishTiles: all tiles must have same collectionId: ${JSON.stringify(tiles)}`)
  }
  logger.debug('publishTiles', tiles)

  const tile = _.first(tiles)
  switch (tile.scope) {
    case EntityScope.ChatRoomScope:
      return redisPubSub.publish(mapCollectionIdToRootNodePublicChannelId(tile.collectionId), { updatedAt: moment().toISOString(), pubsubArray: tiles })
    case EntityScope.GlobalScope:
      return redisPubSub.publish(`${models.buildEid(tile.thisEntityType, tile.thisEntityId)}/public`, { updatedAt: moment().toISOString(), pubsubArray: tiles })
    case EntityScope.ChatRoomPrivateScope:
      return redisPubSub.publish(`${models.mapCollectionIdToFirstEid(tile.collectionId)}/${models.buildEid(tile.thisEntityType, tile.thisEntityId)}/private`, { updatedAt: moment().toISOString(), pubsubArray: tiles })
    case EntityScope.GlobalPrivateScope:
      return redisPubSub.publish(`${models.buildEid(tile.thisEntityType, tile.thisEntityId)}/private`, { updatedAt: moment().toISOString(), pubsubArray: tiles })
    default:
      logger.error('ERROR: publishTiles: invalid scope', { tile })
      return Promise.resolve(null)
  }
}

/**
 * @param actionInstance - published to the player's private channel
 */
export const publishActionXInstance = (actionInstance: ActionXInstance): Promise<ActionXInstance> => {
  logger.debug('publishActionXInstance', { actionInstance })
  return redisPubSub.publish(`${actionInstance.playerEid}/private`, actionInstance).then(() => actionInstance)
}

export const publishFriendRequest = (receiverEid: string, request: FriendRequest): Promise<FriendRequest> => {
  logger.debug('publishFriendRequest', { request })
  return redisPubSub.publish(`${receiverEid}/private`, request).then(() => request)
}

export const publishUnreadActivityCount = (userId: string, type?: NotificationType): Promise<any> => {
  if (!_.isNil(type) && !notifModel.DEFAULT_LOOKUP_TYPES.includes(type)) {
    return null
  }
  return store.notificationsCountByUser(userId, false, notifModel.DEFAULT_LOOKUP_TYPES)
    .then(count => publishCount(userId, 'unreadActivityCount', count))
}

export const publishUnreadMessagesCount = (userId: string, type: NotificationType): Promise<any> => {
  if (type !== NotificationType.ChatRoomCommentNotification) {
    return null
  }
  return store.unreadCommentsCount(userId)
    .then(count => publishCount(userId, 'unreadMessagesCount', count))
}

export const publishUnreadNotificationsCount = (userId: string): Promise<any> => {
  return store.notificationsCountByUser(userId)
    .then(count => publishCount(userId, 'unreadNotificationsCount', count))
}

export const publishNotification = (notification: Notification): Promise<any> => {
  const channelId = `${models.buildEid(EntityType.User, notification.userId)}/private`
  return Promise.all([
    redisPubSub.publish(channelId, notification),
    publishUnreadNotificationsCount(notification.userId),
    publishUnreadActivityCount(notification.userId, notification.type),
  ])
}
