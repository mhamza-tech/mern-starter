import _ from 'lodash'
import { TYPEORM_CONNECTION } from '../../env'
import {
  getConnection,
  Repository,
} from 'typeorm'
import {
  sf,
  misc,
} from '../../utils'
import {
  Edge,
  Notification,
  Player,
  User,
  NewsfeedItem,
} from '../../db/entity'
import {
  NotificationType,
  Comment,
  CompletedAction,
  CreateNotificationInput,
} from 'src/gql-types'
import * as models from '../models'
import { safeIn } from 'src/db/utils'

const DB_CONN_NAME = TYPEORM_CONNECTION

export const DEFAULT_LOOKUP_TYPES = [
  // NotificationType.ChatRoomCommentNotification,
  NotificationType.NewsfeedItemCommentNotification,
  NotificationType.NewsfeedItemNotification,
]

/**
 * @return Promise w/ repository
 */
let cachedNotificationRepository: Repository<Notification> = null
export const getNotificationRepository = (): Promise<Repository<Notification>> => {
  return !!!_.isNil(cachedNotificationRepository)
    ? Promise.resolve(cachedNotificationRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Notification))
      .then(sf.tap(repository => {
        cachedNotificationRepository = repository
      }))
}

/**
 * @param userId - the user the notification is being sent TO
 * @param playerEid - the player the notification is being sent TO (could be an unobject created by the user)
 * @param comment
 */
export const mapChatRoomCommentToNotification = (userId: string, playerEid: string, comment: Comment): Notification => {
  const retMe = new Notification()
  retMe.type = NotificationType.ChatRoomCommentNotification
  retMe.trackingId = comment.trackingId
  retMe.userId = userId
  retMe.playerEid = playerEid
  retMe.collectionId = misc.replaceCollectionIdComponent(comment.collectionId, 'comment', 'notificaton')
  retMe.eventEid = models.mapEntityToEid(comment)
  retMe.metadata = misc.toPlainObjectRecursive(comment)
  return retMe
}

export const mapNewsfeedItemCommentToNotification = (userId: string, playerEid: string, comment: Comment): Notification => {
  const retMe = new Notification()
  retMe.type = NotificationType.NewsfeedItemCommentNotification
  retMe.trackingId = comment.trackingId
  retMe.userId = userId
  retMe.playerEid = playerEid
  retMe.collectionId = misc.replaceCollectionIdComponent(comment.collectionId, 'comment', 'notificaton')
  retMe.eventEid = models.mapEntityToEid(comment)
  // -rx- retMe.metadata = misc.toPlainObjectRecursive( comment );
  return retMe
}

export const mapNewsfeedItemToNotification = (userId: string, playerEid: string, newsfeed: NewsfeedItem): Notification => {
  const retMe = new Notification()
  retMe.type = NotificationType.NewsfeedItemNotification
  retMe.trackingId = newsfeed.trackingId
  retMe.userId = userId
  retMe.playerEid = playerEid
  retMe.collectionId = models.mapEntityToEid(newsfeed)
  retMe.eventEid = models.mapEntityToEid(newsfeed)
  retMe.metadata = {
    newsfeedItem: misc.toPlainObjectRecursive(newsfeed),
  }
  return retMe
}

export const mapChatRoomActionToNotification = (userId: string, playerEid: string, completedAction: CompletedAction): Notification => {
  const retMe = new Notification()
  retMe.type = NotificationType.ChatRoomActionNotification
  retMe.trackingId = completedAction.trackingId
  retMe.userId = userId
  retMe.playerEid = playerEid
  retMe.collectionId = models.buildCollectionId(completedAction.contextId, 'notification')
  retMe.eventEid = models.mapEntityToEid(completedAction)
  retMe.metadata = misc.toPlainObjectRecursive(completedAction)
  return retMe
}

export const mapNewsfeedItemReactionToNotification = (userId: string, playerEid: string, edge: Edge): Notification => {
  const retMe = new Notification()
  retMe.type = NotificationType.NewsfeedItemReactionNotification
  // retMe.trackingId = null;
  retMe.userId = userId
  retMe.playerEid = playerEid
  retMe.collectionId = models.buildCollectionId('newsfeeditem', edge.thatEntityId, 'notification')
  retMe.eventEid = models.mapEntityToEid(edge)
  return retMe
}

export const mapCommentReactionToNotification = (userId: string, playerEid: string, edge: Edge): Notification => {
  const retMe = new Notification()
  retMe.type = NotificationType.CommentReactionNotification
  // retMe.trackingId = null;
  retMe.userId = userId
  retMe.playerEid = playerEid
  retMe.collectionId = models.buildCollectionId('comment', edge.thatEntityId, 'notification')
  retMe.eventEid = models.mapEntityToEid(edge)
  return retMe
}

export const mapCreateNotificationInputToNotification = (userId: string, input: CreateNotificationInput, context: any): Notification => {
  const retMe = new Notification()
  retMe.type = input.type
  retMe.trackingId = _.get(context, 'trackingId')
  retMe.userId = userId
  retMe.playerEid = input.playerEid
  retMe.collectionId = input.collectionId
  retMe.eventEid = input.eventEid
  retMe.metadata = input.metadata
  return retMe
}

export const buildNewFollowerNotification = (forPlayer: Player, forUser: User, newFollower: User, followsEdge: Edge, context: any = null): Notification => {
  const retMe = new Notification()
  retMe.type = NotificationType.NewFollowerNotification
  retMe.trackingId = _.get(context, 'trackingId')
  retMe.userId = forUser.id
  retMe.playerEid = models.mapEntityToEid(forPlayer)
  retMe.collectionId = models.buildCollectionId('user', forUser.id, 'notificaton')
  retMe.eventEid = models.mapEntityToEid(followsEdge)
  retMe.metadata = {
    followerEid: models.mapEntityToEid(newFollower),
  }
  return retMe
}

export const buildFriendingNotification = (to: Player, from: Player, type: NotificationType, context): Notification => {
  const retMe = new Notification()
  retMe.type = type
  retMe.trackingId = _.get(context, 'trackingId')
  retMe.userId = to.id
  retMe.playerEid = models.mapEntityToEid(to)
  retMe.collectionId = models.buildCollectionId('user', to.id, 'notificaton')
  retMe.eventEid = models.mapEntityToEid(from)
  retMe.metadata = {
    newFriendEid: models.mapEntityToEid(from),
    requestId: context.requestId,
  }
  return retMe
}

export const saveNotification = (notification: Notification): Promise<Notification> => {
  return getNotificationRepository()
    .then(repo => repo.save(notification))
}

export const readNotificationsBy = (options: object): Promise<Notification[]> => {
  return getNotificationRepository()
    .then(repo => repo.find(options))
}

export const updateNotifications = (options: object, set: object): Promise<Notification[]> => {
  const readOptions = {
    ...options,
    isRead: safeIn([true, false]),
  }
  return getNotificationRepository()
    .then(repo => repo.update(options, set))
    .then(() => readNotificationsBy(readOptions))
}

/* @deprecated */
export const updateUnreadNotificationsByUser = (userId: string, ids: string[]): Promise<Notification[]> => {
  const options = {
    id: safeIn(ids),
    userId,
    isRead: false,
  }
  const set = { isRead: true }
  return updateNotifications(options, set)
}

export const readNotificationsCountByUser = (userId: string, isRead: boolean, types?: NotificationType[]): Promise<number> => {
  return getNotificationRepository()
    .then(repo => repo.count({
      userId,
      isRead,
      isDeleted: false,
      ...(!_.isEmpty(types) && { type: safeIn(types) }),
    }))
}

export const readNotificationById = (notificationId: string): Promise<Notification> => {
  return getNotificationRepository()
    .then(repo => repo.findOne(notificationId))
}
