import _ from 'lodash'
import {
  Edge,
  Field,
  Tile,
  EdgeStats,
  Notification,
  NewsfeedItem,
} from 'src/db/entity'
import {
  RedisCache,
  CacheType,
  sft,
} from 'src/utils'
import * as model from './activity.model'
import * as nofiticationModel from './notification.model'
import {
  EntityType,
  EdgeType,
  FieldType,
  EdgeDirection,
  NotificationType,
} from 'src/gql-types'
import { safeIn } from 'src/db/utils'
import {
  EdgesCacheKey,
  FieldCacheKey,
  EdgeStatsCacheKey,
  NotificationCacheKey,
  EdgeCacheKey,
} from 'src/graphql/models'
import { readNewsfeedItemsBy } from 'src/graphql/Activity/newsfeeditem.model'

const buildEdgeKey = (key: EdgesCacheKey): string => `${EntityType.Edge}:${key.thisEntityId}`

const buildEdgeFullKey = (key: EdgesCacheKey): string => {
  const baseKey = `${EntityType.Edge}:${key.thisEntityId}`
  if (key.thatEntityId && key.edgeType) {
    return `${baseKey}:${key.thatEntityId}:${key.edgeType}`
  }
  if (key.collectionId) {
    return `${baseKey}:${key.collectionId}`
  }
  if (key.edgeType) {
    return `${baseKey}:${key.edgeType}`
  }
  return baseKey
}

const buildEdgeMatchingValue = (key: EdgesCacheKey): string => {
  if (key.thatEntityId && key.edgeType) {
    return `*:${key.thatEntityId}:${key.edgeType}:*`
  }
  if (key.collectionId) {
    return `*:${key.collectionId}`
  }
  if (key.edgeType) {
    return `*:${key.edgeType}:*`
  }
  return '*'
}

const buildEdgeValue = (edge: Edge): string =>
  `${edge.id}:${edge.thatEntityId}:${edge.edgeType}:${edge.collectionId}`

const parseEdgeValue = (value: string): Edge => {
  const [id, thatEntityId, edgeType, collectionId] = value.split(':')
  const edge = new Edge()
  edge.id = id
  edge.thatEntityId = thatEntityId
  edge.edgeType = EdgeType[edgeType]
  edge.collectionId = collectionId
  return edge
}

const otherEdgeKey = (key: EdgesCacheKey): Partial<EdgesCacheKey> => ({
  thisEntityId: key.thisEntityId,
  edgeType: key.edgeType,
})

export const edgeByIdCache = new RedisCache<Edge>({
  name: 'edgeByIdCache',
  type: CacheType.HashSet,
  buildKey: (): string => EntityType.Edge,
  parseDBKey: (key: EdgeCacheKey): any => {
    const delVal = key.dbOptions?.isDeleted || false
    return {
      id: key.id,
      isDeleted: delVal,
    }
  },
  buildFullKey: (key: EdgeCacheKey): string => `${EntityType.Edge}:${key.id}`,
  pickKey: (edge: Edge): EdgeCacheKey => ({ id: edge.id }),
  matchingValue: (key: EdgeCacheKey): string => key.id,
  fetchFromDB: (filters: any[], dbOptions?: any): Promise<Edge[]> =>
    model.readEdgesBy({ where: filters, ...dbOptions }),
})

const primeEdgeCaches = (edges: Edge[]): Promise<Edge[]> => {
  return sft.promiseMap(edges, edgeByIdCache.prime)
}

export const edgesByThisIdEdgeTypeCache = new RedisCache<any>({
  name: 'edgesByThisIdEdgeTypeCache',
  type: CacheType.Set,
  buildKey: (key: EdgesCacheKey): string => buildEdgeKey(key),
  parseDBKey: (key: EdgesCacheKey): any => {
    const delVal = key.dbOptions?.isDeleted || false
    return {
      thisEntityId: key.thisEntityId,
      edgeType: key.edgeType,
      isDeleted: delVal,
    }
  },
  pickKey: (edge: Edge): EdgesCacheKey => ({
    thisEntityId: edge.thisEntityId,
    edgeType: edge.edgeType,
  }),
  buildFullKey: buildEdgeFullKey,
  matchingValue: buildEdgeMatchingValue,
  buildValue: buildEdgeValue,
  parseValue: parseEdgeValue,
  fetchFromDB: (filters: any[], dbOptions?: any): Promise<Edge[]> =>
    model.readEdgesBy({ where: filters, ...dbOptions }),
  onSet: (edges: Edge[]): Promise<Edge[]> => primeEdgeCaches(edges),
})

export const edgesByThisThatIdsEdgeTypeCache = new RedisCache<Edge[]>({
  name: 'edgesByThisThatIdsEdgeTypeCache',
  type: CacheType.Set,
  buildKey: (key: EdgesCacheKey): string => buildEdgeKey(key),
  parseDBKey: (key: EdgesCacheKey): any => {
    const delVal = key.dbOptions?.isDeleted || false
    return {
      thisEntityId: key.thisEntityId,
      thatEntityId: key.thatEntityId,
      edgeType: key.edgeType,
      isDeleted: delVal,
    }
  },
  pickKey: (edge: Edge): EdgesCacheKey => ({
    thisEntityId: edge.thisEntityId,
    thatEntityId: edge.thatEntityId,
    edgeType: edge.edgeType,
  }),
  buildFullKey: buildEdgeFullKey,
  matchingValue: buildEdgeMatchingValue,
  buildValue: buildEdgeValue,
  parseValue: parseEdgeValue,
  fetchFromDB: (filters: any[], dbOptions?: any): Promise<Edge[]> =>
    model.readEdgesBy({ where: filters, ...dbOptions }),
  onSet: (edges: Edge[]): Promise<Edge[]> => primeEdgeCaches(edges),
  otherCache: edgesByThisIdEdgeTypeCache,
  otherCacheKey: otherEdgeKey,
})

export const edgeByThisIdCollectionIdCache = new RedisCache<Edge[]>({
  name: 'edgeByThisIdCollectionIdCache',
  type: CacheType.Set,
  buildKey: buildEdgeKey,
  parseDBKey: (key: EdgesCacheKey): any => {
    const delVal = key.dbOptions?.isDeleted || false
    return {
      thisEntityId: key.thisEntityId,
      collectionId: key.collectionId,
      isDeleted: delVal,
    }
  },
  pickKey: (edge: Edge): EdgesCacheKey => ({
    thisEntityId: edge.thisEntityId,
    edgeType: edge.edgeType,
    collectionId: edge.collectionId,
  }),
  buildFullKey: buildEdgeFullKey,
  matchingValue: buildEdgeMatchingValue,
  buildValue: buildEdgeValue,
  parseValue: parseEdgeValue,
  fetchFromDB: (filters: any[], dbOptions?: any): Promise<Edge[]> =>
    model.readEdgesBy({ where: filters, ...dbOptions }),
  onSet: (edges: Edge[]): Promise<Edge[]> =>
    sft.promiseMap(edges, edgeByIdCache.prime),
  otherCache: edgesByThisIdEdgeTypeCache,
  otherCacheKey: otherEdgeKey,
})

export const edgeStatsByIdCache = new RedisCache<EdgeStats>({
  name: 'edgeStatsByIdCache',
  type: CacheType.HashSet,
  buildKey: (): string => 'EdgeStats',
  buildFullKey: (id: string): string => `EdgeStats:${id}`,
  fetchFromDB: (ids: number[]): Promise<EdgeStats[]> =>
    model.readEdgeStatsBy({
      where: { id: safeIn(ids) },
    }),
})

export const edgeStatsByEntityIdEdgeTypeDirectionCache = new RedisCache<any>({
  name: 'edgeStatsByEntityIdEdgeTypeDirectionCache',
  type: CacheType.Set,
  buildKey: (key: EdgeStatsCacheKey): string => `EdgeStats:${key.entityId}`,
  pickKey: (edgeStats: EdgeStats): EdgeStatsCacheKey => ({
    entityId: edgeStats.entityId,
    edgeType: edgeStats.edgeType,
    edgeDirection: edgeStats.edgeDirection,
  }),
  buildFullKey: (key: EdgeStatsCacheKey): string =>
    `EdgeStats:${key.entityId}:${key.edgeType}:${key.edgeDirection}`,
  parseDBKey: (key: EdgeStatsCacheKey): any => ({
    entityId: key.entityId,
    edgeDirection: key.edgeDirection,
    edgeType: key.edgeType,
  }),
  matchingValue: (key: EdgeStatsCacheKey): string =>
    `*:${key.edgeType}:${key.edgeDirection}`,
  buildValue: (es: EdgeStats): string =>
    `${es.id}:${es.edgeType}:${es.edgeDirection}`,
  parseValue: (segments: string): EdgeStats => {
    const [id, edgeType, direction] = segments.split(':')
    const edgeStats = new EdgeStats()
    edgeStats.id = parseInt(id)
    edgeStats.edgeType = EdgeType[edgeType]
    edgeStats.edgeDirection = EdgeDirection[direction]
    return edgeStats
  },
  fetchFromDB: (keys: any, options = {}): Promise<EdgeStats[]> =>
    model.readEdgeStatsBy({ where: keys, ...options }),
  onSet: (edgeStats: EdgeStats[]): Promise<EdgeStats[]> =>
    sft.promiseMap(edgeStats, edgeStatsByIdCache.prime),
})

const buildFieldKey = (key: FieldCacheKey): string => {
  const id = key.collectionId.replace('/field', '')
  return `${EntityType.Field}:${id}`
}

const buildFieldFullKey = (key: FieldCacheKey): string => {
  const id = key.collectionId.replace('/field', '')
  const baseKey = `${EntityType.Field}:${id}`
  if (key.name) {
    return `${baseKey}:${key.name}`
  }
  if (key.type) {
    return `${baseKey}:${key.type}`
  }
  return baseKey
}

const buildFieldMatchingValue = (key: FieldCacheKey): string => {
  if (key.name) {
    return `*:${key.name}`
  }
  if (key.type) {
    return `*:${key.type}:*`
  }
  return '*'
}

const buildFieldValue = (field: Field): string =>
  `${field.id}:${field.type}:${field.name}`

const parseFieldValue = (value: string): Field => {
  const segments = value.split(':')
  const field = new Field()
  field.id = segments[0]
  field.type = FieldType[segments[1]]
  field.name = segments[2]
  return field
}

export const fieldByIdCache = new RedisCache<Field>({
  name: 'fieldByIdCache',
  type: CacheType.HashSet,
  buildKey: (): string => EntityType.Field,
  buildFullKey: (id: string): string => `${EntityType.Field}:${id}`,
  fetchFromDB: (ids: string[]): Promise<Field[]> =>
    model.readFieldsBy({
      id: safeIn(ids),
      isDeleted: false,
    }),
})

export const fieldByCollectionIdNameCache = new RedisCache<any>({
  name: 'fieldByCollectionIdNameCache',
  type: CacheType.Set,
  buildKey: (key: FieldCacheKey): string => buildFieldKey(key),
  parseDBKey: (key: FieldCacheKey): any => ({
    collectionId: key.collectionId,
    name: key.name,
    isDeleted: false,
  }),
  pickKey: (field: Field): FieldCacheKey => ({
    collectionId: field.collectionId,
    name: field.name,
  }),
  buildFullKey: (key: FieldCacheKey): string => buildFieldFullKey(key),
  matchingValue: (key: FieldCacheKey): string => buildFieldMatchingValue(key),
  buildValue: (field: Field): string => buildFieldValue(field),
  parseValue: (value: string): Field => parseFieldValue(value),
  fetchFromDB: (filters: any[], dbOptions?: any): Promise<Field[]> =>
    model.readFieldsBy({ where: filters, ...dbOptions }),
  onSet: (fields: Field[]): Promise<Field[]> =>
    sft.promiseMap(fields, fieldByIdCache.prime),
})

export const fieldsByCollectionIdTypeCache = new RedisCache<Field[]>({
  name: 'fieldsByCollectionIdTypeCache',
  type: CacheType.Set,
  buildKey: (key: FieldCacheKey): string => buildFieldKey(key),
  parseDBKey: (key: FieldCacheKey): any => ({
    collectionId: key.collectionId,
    type: key.type,
    isDeleted: false,
  }),
  pickKey: (field: Field): FieldCacheKey => ({
    collectionId: field.collectionId,
    type: field.type,
  }),
  buildFullKey: (key: FieldCacheKey): string => buildFieldFullKey(key),
  matchingValue: (key: FieldCacheKey): string => buildFieldMatchingValue(key),
  buildValue: (field: Field): string => buildFieldValue(field),
  parseValue: (value: string): Field => parseFieldValue(value),
  fetchFromDB: (filters: any[], dbOptions?: any): Promise<Field[]> =>
    model.readFieldsBy({ where: filters, ...dbOptions }),
  onSet: (fields: Field[]): Promise<Field[]> =>
    sft.promiseMap(fields, fieldByIdCache.prime),
})

export const tileByCollectionIdNameCache = new RedisCache<Tile>({
  name: 'tileByCollectionIdNameCache',
  buildKey: ({ collectionId, name }): string => {
    const id = collectionId.replace('/tile', '')
    return `${EntityType.Tile}:${id}:${name}`
  },
  parseDBKey: ({ collectionId, name }): any => ({
    collectionId,
    name,
    isDeleted: false,
  }),
  pickKey: (tile: Tile): any => ({ collectionId: tile.collectionId, name: tile.name }),
  buildValue: (tile: Tile): string => tile.id,
  parseValue: (value: string): Tile => {
    const tile = new Tile()
    tile.id = value
    return tile
  },
  fetchFromDB: (filters: any[], dbOptions?: any): Promise<Tile[]> =>
    model.readTilesBy({ where: filters, ...dbOptions }),
  onSet: (tile: Tile): Promise<Tile> => tileByIdCache.prime(tile),
})

export const tileByIdCache = new RedisCache<Tile>({
  name: 'tileByIdCache',
  type: CacheType.HashSet,
  buildKey: (): string => EntityType.Tile,
  buildFullKey: (id: string): string => `${EntityType.Tile}:${id}`,
  fetchFromDB: (ids: string[]): Promise<Tile[]> =>
    model.readTilesBy({
      id: safeIn(ids),
      isDeleted: false,
    }),
})

export const newsFeedItemByIdCache = new RedisCache<NewsfeedItem>({
  name: 'newsFeedItemByIdCache',
  type: CacheType.HashSet,
  buildKey: (): string => EntityType.NewsfeedItem,
  buildFullKey: (id: string): string => `${EntityType.NewsfeedItem}:${id}`,
  fetchFromDB: (ids: string[]): Promise<NewsfeedItem[]> =>
    readNewsfeedItemsBy({
      where: {
        id: safeIn(ids),
        isDeleted: false,
      },
    }),
})

const buildNotificationFullKey = (key: NotificationCacheKey): string => {
  const baseKey = `${EntityType.Notification}:${key.userId}`
  if (key.type && !_.isNil(key.isRead)) {
    return `${baseKey}:${key.type}:${key.isRead}`
  }
  if (key.type) {
    return `${baseKey}:${key.type}`
  }
  if (!_.isNil(key.isRead)) {
    return `${baseKey}:${key.isRead}`
  }
  return baseKey
}

const parseNotificationDBKey = (key: NotificationCacheKey): any => {
  const delVal = key.dbOptions?.isDeleted || false
  return {
    isDeleted: delVal,
    ...(!_.isNil(key.isRead) && { isRead: key.isRead }),
    ...(!_.isNil(key.type) && { type: key.type }),
    userId: key.userId,
  }
}

const buildNotificationMatchingValue = (key: NotificationCacheKey): string => {
  if (key.type && !_.isNil(key.isRead)) {
    return `*:${key.type}:${key.isRead}`
  }
  if (key.type) {
    return `*:${key.type}:*`
  }
  if (!_.isNil(key.isRead)) {
    return `*:${key.isRead}`
  }
  return '*'
}

const buildNotificationValue = (notification: Notification): string =>
  `${notification.id}:${notification.type}:${notification.isRead}`

const parseNotificationValue = (value: string): Notification => {
  const [id, notificationType, isRead] = value.split(':')
  const notification = new Notification()
  notification.id = id
  notification.type = notificationType as NotificationType
  notification.isRead = isRead === 'true'
  return notification
}

const otherNotificationKey = (key: NotificationCacheKey): Partial<NotificationCacheKey> => ({ userId: key.userId })

export const notificationByIdCache = new RedisCache<Notification>({
  name: 'activityByIdCache',
  type: CacheType.HashSet,
  buildKey: (): string => EntityType.Notification,
  buildFullKey: (id: string): string => `${EntityType.Notification}:${id}`,
  fetchFromDB: (ids: string[]): Promise<Notification[]> =>
    nofiticationModel.readNotificationsBy({
      id: safeIn(ids),
      isDeleted: false,
    }),
})

export const notificationsByUserIdCache = new RedisCache<any>({
  name: 'notificationsByUserId',
  type: CacheType.Set,
  buildKey: (key: NotificationCacheKey): string => `${EntityType.Notification}:${key.userId}`,
  pickKey: (notification: Notification): NotificationCacheKey => ({ userId: notification.userId }),
  buildFullKey: buildNotificationFullKey,
  parseDBKey: parseNotificationDBKey,
  matchingValue: buildNotificationMatchingValue,
  buildValue: buildNotificationValue,
  parseValue: parseNotificationValue,
  fetchFromDB: (filters: any[], dbOptions?: any): Promise<Notification[]> =>
    nofiticationModel.readNotificationsBy({ where: filters, ...dbOptions }),
  onSet: (notifications: Notification[]): Promise<Notification[]> =>
    sft.promiseMap(notifications, notificationByIdCache.prime),
})

export const notificationsByUserIdIsReadCache = new RedisCache<any>({
  name: 'notificationsByUserIdIsRead',
  type: CacheType.Set,
  buildKey: (key: NotificationCacheKey): string => `${EntityType.Notification}:${key.userId}`,
  pickKey: (notification: Notification): NotificationCacheKey => ({
    userId: notification.userId,
    isRead: notification.isRead,
  }),
  buildFullKey: buildNotificationFullKey,
  parseDBKey: parseNotificationDBKey,
  matchingValue: buildNotificationMatchingValue,
  buildValue: buildNotificationValue,
  parseValue: parseNotificationValue,
  fetchFromDB: (filters: any[], dbOptions?: any): Promise<Notification[]> =>
    nofiticationModel.readNotificationsBy({ where: filters, ...dbOptions }),
  onSet: (notifications: Notification[]): Promise<Notification[]> =>
    sft.promiseMap(notifications, notificationByIdCache.prime),
  otherCache: notificationsByUserIdCache,
  otherCacheKey: otherNotificationKey,
})

export const notificationsByUserIdTypeCache = new RedisCache<any>({
  name: 'notificationsByUserIdType',
  type: CacheType.Set,
  buildKey: (key: NotificationCacheKey): string => `${EntityType.Notification}:${key.userId}`,
  pickKey: (notification: Notification): NotificationCacheKey => ({
    userId: notification.userId,
    type: notification.type,
  }),
  parseDBKey: parseNotificationDBKey,
  buildFullKey: buildNotificationFullKey,
  matchingValue: buildNotificationMatchingValue,
  buildValue: buildNotificationValue,
  parseValue: parseNotificationValue,
  fetchFromDB: (filters: any[], dbOptions?: any): Promise<Notification[]> =>
    nofiticationModel.readNotificationsBy({ where: filters, ...dbOptions }),
  onSet: (notifications: Notification[]): Promise<Notification[]> =>
    sft.promiseMap(notifications, notificationByIdCache.prime),
  otherCache: notificationsByUserIdCache,
  otherCacheKey: otherNotificationKey,
})
