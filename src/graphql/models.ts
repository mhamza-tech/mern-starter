/**
 * @rob4lderman
 * oct2019
 * 
 * a bunch of model-related functions.
 * sits below the store layer.
 * 
 * core -> store -> models
 * 
 */
import _ from 'lodash'
import { IMGIX_CDN_ROOT_URL } from 'src/env'
import {
  stringToArray,
  toArray,
} from 'src/utils/misc'
import {
  EntityType,
  EntityRef,
  EntityScope,
  EdgeType,
  FieldType,
  EdgeDirection,
  NotificationType,
} from 'src/gql-types'
import {
  Comment,
  Player,
  User,
  ChatRoom,
  UnObject,
  Field,
} from 'src/db/entity'

export type EdgeCacheKey = {
  id: string
  dbOptions?: any
}

export type EdgesCacheKey = {
  thisEntityId: string
  edgeType: EdgeType
  thatEntityId?: string
  collectionId?: string
  dbOptions?: any
}

export type FieldCacheKey = {
  collectionId: string
  name?: string
  type?: FieldType
}

export type CommentReceiptCacheKey = {
  collectionId: string
  commentId?: string
}

export type thisThatIds = {
  thisId: string
  thatId: string
}

export type FriendshipGraph = {
  thisUser: {
    isFriend: boolean
    isBlocked: boolean
  }
  thatUser: {
    isFriend: boolean
    isBlocked: boolean
  }
}

export type EdgeStatsCacheKey = {
  entityId: string
  edgeType: EdgeType
  edgeDirection: EdgeDirection
}

export interface NotificationCacheKey {
  eventEid?: string
  dbOptions?: any
  isRead?: boolean
  type?: NotificationType
  userId: string
}

export const mapEidToId = (entityId: string): string => {
  return _.last(_.compact(_.split(entityId, '/')))
}

export const mapEidToEntityType = (entityId: string): EntityType => {
  return mapEntityTypeStringToEntityType(
    _.first(_.compact(_.split(entityId, '/')))
  )
}

/**
 * @param eid - string that encodes the dB entity type w/ uuid
 *                  e.g. user/{id}
 *                       unobject/{id}
 * @return { id, entityType }
 */
export const mapEidToEntityRef = (eid: string): EntityRef => {
  if (_.isEmpty(eid)) {
    return null
  }
  const splitId = _.compact(_.split(eid, '/'))
  return {
    id: _.last(splitId),
    entityType: mapEntityTypeStringToEntityType(_.first(splitId)),
  }
}

export const mapEntityTypeStringToEntityType = (entityTypeString: string): EntityType => {
  const retMe = _.find(
    EntityType,
    (entityType: EntityType) => _.toLower(entityTypeString) === _.toLower(entityType)

  )
  if (_.isNil(retMe)) {
    throw new Error(`mapEntityTypeStringToEntityType: Unrecognized EntityType: ${entityTypeString}`)
  }
  return retMe
}

export const mapEntityToEntityRef = (entity: any): EntityRef => {
  return _.isNil(entity)
    ? null
    : _.pick(entity, ['id', 'entityType'])
}

export const mapEntityRefToEid = (entityRef: EntityRef): string => {
  return _.isEmpty(entityRef)
    ? null
    : _.toLower(`${EntityType[entityRef.entityType]}/${entityRef.id}`)
}

export const mapEntityToEid = (entity: any): string => {
  return _.chain(entity)
    .thru(mapEntityToEntityRef)
    .thru(mapEntityRefToEid)
    .value()
}

export const buildEid = (type: string, id: string): string => {
  return _.toLower(`${type}/${id}`)
}

/**
 * collectionIds generally have the form
 * 
 * global: {eid}/{type}
 * local: {eid}/local/{id}/{type}
 * 
 * @param segments 
 */
export const buildCollectionId = (...segments): string => {
  return _.toLower(_.join(_.compact(segments), '/'))
  // TODO: return _.join( _.map( segments, _.toLower ), '/' );
}

/**
 * 
 * @param collectionId 
 * @return all segments but the last in collectionId
 */
export const chompCollectionId = (collectionId: string): string => {
  return _.join(_.initial(_.split(collectionId, '/')), '/')
}

export const mapCommentToChatRoomId = (comment: Comment): string => {
  return _.nth(_.split(_.get(comment, 'collectionId'), '/'), 1)
}

export const mapCommentToNewsfeedItemId = (comment: Comment): string => {
  return _.nth(_.split(_.get(comment, 'collectionId'), '/'), 1)
}

export const mapCollectionIdToFirstEid = (collectionId: string): string => {
  return _.join(_.take(_.split(collectionId, '/'), 2), '/')
}

/**
 * requires that all collectionIds end in the form: {eid}/{whatever}
 * @return {eid}
 */
export const mapCollectionIdToLastEid = (collectionId: string): string => {
  return _.join(_.takeRight(_.split(chompCollectionId(collectionId), '/'), 2), '/')
}

export const mapCollectionIdToLocalId = (collectionId: string): string => {
  return _.last(_.split(chompCollectionId(collectionId), '/'))
}

export const isLocalCollectionId = (collectionId: string): boolean => {
  return _.includes(collectionId, 'local')
}

export const mapCollectionIdToNewsfeedItemId = (collectionId: string): string =>
  mapCollectionIdToEntityIdIfType(collectionId, EntityType.NewsfeedItem)

export const mapCollectionIdToChatRoomId = (collectionId: string): string =>
  mapCollectionIdToEntityIdIfType(collectionId, EntityType.ChatRoom)

export const mapCollectionIdToEntityIdIfType = (collectionId: string, entityType: EntityType): string => {
  const eid = mapCollectionIdToFirstEid(collectionId)
  const entityRef = mapEidToEntityRef(eid)
  return isEntityType(entityRef, entityType)
    ? entityRef.id
    : null
}

export const isCollectionIdFirstEidEntityType = (collectionId: string, entityType: EntityType): boolean => {
  const eid = mapCollectionIdToFirstEid(collectionId)
  return isEidEntityType(eid, entityType)
}

export const isEidEntityType = (eid: string, entityType: EntityType): boolean => {
  const entityRef = mapEidToEntityRef(eid)
  return isEntityType(entityRef, entityType)
}

export const isEntityType = (entityRef: EntityRef | undefined, entityType: EntityType): boolean => entityRef?.entityType === entityType

export const isField = (entity: any): entity is Field => isEntityType(entity, EntityType.Field)
export const isEdge = (entity: any): boolean => isEntityType(entity, EntityType.Edge)
export const isUnObject = (entity: any): entity is UnObject => isEntityType(entity, EntityType.UnObject)
export const isNode = (entity: any): boolean => !isField(entity) && !isEdge(entity) && _.isNil(entity.dynamic)
export const isUser = (entity: any): entity is User => isEntityType(entity, EntityType.User)
export const isUserEid = (eid: string): boolean => isEidEntityType(eid, EntityType.User)
export const isUnObjectEid = (eid: string): boolean => isEidEntityType(eid, EntityType.UnObject)
export const isPlayer = (entity: any): entity is Player => isUser(entity) || isUnObject(entity)
export const isChatRoom = (entity: any): entity is ChatRoom => isEntityType(entity, EntityType.ChatRoom)

export const getPartner = (players: Player[], actor: Player): Player => {
  // Find the first user or non-destination NPC that is not the actor, or default to the actor
  return players.find(p => p.id !== actor.id && (isUser(p) || !p.isDestination)) || actor
}

export const playerName = (player: Player): string => {
  if (isUser(player)) {
    return player.displayName
  }
  if (isUnObject(player)) {
    return player.name
  }
  return null
}

export const mapS3KeyToImgixImageUrl = (s3Key: string): string | null => {
  return _.isEmpty(s3Key)
    ? null
    : `https://${IMGIX_CDN_ROOT_URL}/${s3Key}`
}

export const mapEntityRefToThatEntityRef = (entityRef: EntityRef): any => ({
  thatEntityId: _.get(entityRef, 'id'),
  thatEntityType: _.get(entityRef, 'entityType'),
})

export const mapEntityRefToThisEntityRef = (entityRef: EntityRef): any => ({
  thisEntityId: _.get(entityRef, 'id'),
  thisEntityType: _.get(entityRef, 'entityType'),
})

export const mapEidToThisEntityRef = (eid: string): any => {
  return _.chain(eid)
    .thru(mapEidToEntityRef)
    .thru(mapEntityRefToThisEntityRef)
    .value()
}

export const isLocalScope = (scope: EntityScope): boolean => (scope == EntityScope.ChatRoomScope || scope == EntityScope.ChatRoomPrivateScope)

export const filterPlayersEidForUsersEid = (playersEid: string[]|string): string[] =>
  toArray(playersEid, stringToArray).filter(isUserEid)

export const filterPlayersEidForUnObjectsEid = (playersEid: string[]|string): string[] =>
  toArray(playersEid, stringToArray).filter(isUnObjectEid)

export type EdgeConnection = {
  this: EntityRef
  that: EntityRef
}

export const mapPlayerEidsToEdgeConnections = (playerEids: string[]): EdgeConnection[] => {
  const connections: EdgeConnection[] = []
  const players = playerEids.map(mapEidToEntityRef)
  for (let i = 0; i < players.length; i++) {
    const v1 = players[i]
    if (v1.entityType !== EntityType.UnObject) {
      for (let j = 0; j < players.length; j++) {
        const v2 = players[j]
        if (v1.id !== v2.id) {
          connections.push({ this: v1, that: v2 })
        }
      }
    }
  }
  return connections
}

export const parseMentionedUsers = (message: string): string[] => (message
  .match(/(^|\s)@(\w+)/gim) || [])
  .map(a => a.trim())
  .map(a => a.substring(1))
