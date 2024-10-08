/**
 * @rob4lderman
 * oct2019
 * 
 * a bunch of notification-related functions.
 * 
 */
import _ from 'lodash'
import { LOCAL_DEV_ENV } from '../env'
import {
  Comment,
  User,
  DeviceInfo,
  Notification,
  Player,
  Edge,
  NewsfeedItem,
  CompletedAction,
} from '../db/entity'
import {
  EdgeType,
  NodeType,
  NotificationType,
  NotificationDataType,
  CompletedActionType,
  CreateNotificationOutput,
  CreateNotificationInput,
  PlayerEidUser,
  EntityType,
} from '../gql-types'
import {
  sf,
  sft,
  misc,
} from '../utils'
import {
  Not,
  IsNull,
} from 'typeorm'
import Bluebird from 'bluebird'
import * as fcm from '../services/fcm'
import * as models from './models'
import * as chatModel from './Chat/chat.model'
import * as activityModel from './Activity/activity.model'
import * as notifModel from './Activity/notification.model'
import * as userModel from './User/user.model'
import * as joi from './joi'
import * as store from './store'
import removeMd from 'remove-markdown'
import * as pubsub from './pubsub'

// TODO: temporarily replaced by buildFcmMessagesForDeviceInfo
// const buildFcmMessageForDeviceInfo = (fcmMessageInput: fcm.MessageInput, deviceInfo: DeviceInfo): fcm.FcmMessage => {
//   const fcmMessageInputWithToken: fcm.MessageInput = _.extend(_.cloneDeep(fcmMessageInput), { token: deviceInfo.deviceToken });
//   switch (_.toLower(deviceInfo.os)) {
//     case 'ios':
//       return fcm.mapMessageInputToApnMessage(fcmMessageInputWithToken);
//     case 'android':
//       return fcm.mapMessageInputToAndroidMessage(fcmMessageInputWithToken);
//     default:
//       throw new Error(`ERROR: buildFcmMessageForDeviceInfo:: Unrecognized deviceInfo.os: ${deviceInfo.os}`);
//   }
// };

const buildFcmMessagesForDeviceInfo = (fcmMessageInput: fcm.MessageInput, deviceInfo: DeviceInfo): fcm.FcmMessage[] => {
  const fcmMessageInputWithToken: fcm.MessageInput = _.extend(_.cloneDeep(fcmMessageInput), { token: deviceInfo.deviceToken })
  switch (_.toLower(deviceInfo.os)) {
    case 'ios':
      return [
        fcm.mapMessageInputToApnMessage(fcmMessageInputWithToken),
        fcm.mapMessageInputToSilentApnMessage(fcmMessageInputWithToken),
      ]
    case 'android':
      return [
        fcm.mapMessageInputToAndroidMessage(fcmMessageInputWithToken),
        fcm.mapMessageInputToSilentAndroidMessage(fcmMessageInputWithToken),
      ]
    default:
      throw new Error(`ERROR: buildFcmMessagesForDeviceInfo: Unrecognized deviceInfo.os: ${deviceInfo.os}`)
  }
}

const buildSilentFcmMessageForDeviceInfo = (fcmMessageInput: fcm.MessageInput, deviceInfo: DeviceInfo): fcm.FcmMessage => {
  const fcmMessageInputWithToken: fcm.MessageInput = _.extend(_.cloneDeep(fcmMessageInput), { token: deviceInfo.deviceToken })
  switch (_.toLower(deviceInfo.os)) {
    case 'ios':
      return fcm.mapMessageInputToSilentApnMessage(fcmMessageInputWithToken)
    case 'android':
      return fcm.mapMessageInputToSilentAndroidMessage(fcmMessageInputWithToken)
    default:
      throw new Error(`ERROR: buildSilentFcmMessageForDeviceInfo: Unrecognized deviceInfo.os: ${deviceInfo.os}`)
  }
}

/**
 * First you create the notifications in the db (this method).
 * Then later the notifications are pushed via sendPushNotification
 * 
 * @param comment 
 */
export const createCommentNotifications = (comment: Comment): Promise<any[]> => {
  switch (comment.type) {
    case NodeType.ChatRoomComment: return createChatRoomCommentNotifications(comment)
    case NodeType.ChatRoomSystemComment: return createChatRoomSystemCommentNotifications(comment)
    case NodeType.NewsfeedItemComment: return createNewsfeedItemCommentNotifications(comment)
    default: return Promise.resolve([])
  }
}

export const createActionNotifications = (completedAction: CompletedAction): Promise<any[]> => {
  switch (completedAction.type) {
    case CompletedActionType.ChatRoomAction: return createChatRoomActionNotifications(completedAction)
    default: return Promise.resolve<Notification[]>([])
  }
}

/**
 * A reaction (e.g. "LIKES") to a NewsfeedItem or Comment.
 * Create Notifications for
 *      - the actor in the NewsfeedItem     title: "so-and-so liked your post", body: the post text
 *      - the author of the Comment         title: "so-and-so liked your comment", body: the comment text
 * 
 * @param edge - represents the reaction
 */
export const createReactionNotifications = (edge: Edge): Promise<Notification> => {
  switch (edge.thatEntityType) {
    case EntityType.NewsfeedItem: return createNewsfeedItemReactionNotifications(edge)
    case EntityType.Comment: return createCommentReactionNotifications(edge)
    default: return Promise.resolve(null)
  }
}

export const createNotification = (root, args, ctx): Promise<CreateNotificationOutput> => {
  const input: CreateNotificationInput = joi.validate(args.input, joi.buildCreateNotificationInputSchema())
  return store.userByEid(input.playerEid)
    .then(sf.maybe_fmap(
      (user: User) => Promise.resolve(
        notifModel.mapCreateNotificationInputToNotification(user.id, input, ctx)
      )
        .then(store.saveNotification)
    ))
    .then((notification: Notification) => ({ notification }))
}

/**
 * 
 * switch-case polymorphism FTW!
 * This is the most flexible way to do polymorphism.  OO polymorphism is unnecessary and 
 * involves way too much boilerplate and isn't all that flexible when you have to deal
 * with inheritance hierarchies.  (imagine you want to run one method for *some* of your
 * subtypes and another method for the others... easy to group the subtypes together in a switch-case,
 * impossible in OO w/o mangling your inheritance hierarchy)  plus the OO type is not transparent 
 * thereby making data xfer difficult.  all y'all writing OO - you need to stop now and embrace 
 * functional/procedural (btw this coming from me who wrote Java/C++ OO for 15+ years). 
 * 
 * @param notification 
 */
export const mapNotificationToFcmMessageInput = (notification: Notification): Promise<any> => {
  switch (_.get(notification, 'type')) {
    case NotificationType.ChatRoomCommentNotification:
      return mapChatRoomCommentNotificationToFcmMessageInput(notification)
    case NotificationType.ChatRoomActionNotification:
      return mapChatRoomActionNotificationToFcmMessageInput(notification)
    case NotificationType.NewsfeedItemCommentNotification:
      return mapNewsfeedItemCommentNotificationToFcmMessageInput(notification)
    case NotificationType.NewsfeedItemNotification:
      return mapNewsfeedItemNotificationToFcmMessageInput(notification)
    case NotificationType.HandlerNotification:
      return mapHandlerNotificationToFcmMessageInput(notification)
    case NotificationType.NewsfeedItemReactionNotification:
      return mapNewsfeedItemReactionNotificationToFcmMessageInput(notification)
    case NotificationType.CommentReactionNotification:
      return mapCommentReactionNotificationToFcmMessageInput(notification)
    case NotificationType.NewFollowerNotification:
      return mapNewFollowerNotificationToFcmMessageInput(notification)
    case NotificationType.NewFriendRequestNotification:
      return mapNewFriendRequestNotificationToFcmMessageInput(notification)
    case NotificationType.FriendRequestAcceptedNotification:
      return mapFriendRequestAcceptedNotificationToFcmMessageInput(notification)
    default:
      return Promise.resolve(null)
  }
}

/**
 * First you create the notification (via create*Notification methods)
 * Then later you push the notification via this method.
 * 
 * 1. takes a notification
 * 2. maps it to a fcm.MessageInput
 * 3. fetches user's device tokens
 * 4. maps fcm.MessageInput to each device token
 * 5. sends messages
 * 
 * @param notification 
 * @return strings w/ fcm message IDs.
 */
export const sendPushNotification = (notification: Notification): Promise<any[]> => {
  if (_.isEmpty(notification)) {
    return Promise.resolve([])
  }
  return Promise.all([
    // build FCM message
    mapNotificationToFcmMessageInput(notification),
    // read user's device tokens
    userModel.readDeviceInfosBy({
      userId: notification.userId,
      isSignedIn: true,
      deviceToken: Not(IsNull()),
    }),
    sf.tap_catch(() => pubsub.publishNotification(notification))(null),
  ])
    // build separate fcm messages for each device token
    .then(([fcmMessageInput, deviceInfos]) => Promise.all(
      _.map(
        deviceInfos,
        _.partial(buildFcmMessagesForDeviceInfo, fcmMessageInput)
      )
    ))
    .then(_.flatten)
    .then(sf.thru_if(() => LOCAL_DEV_ENV)(markLocalDev))
    // send the fcm messages
    .then(sf.list_fmap_wait(fcm.trySend))
}

const markLocalDev = (messages: fcm.FcmMessage[]): fcm.FcmMessage[] => {
  return _.map(
    messages,
    (message: fcm.FcmMessage) => !!!_.isEmpty(_.get(message, 'notification.title'))
      ? _.merge(message, { notification: { title: `LOCALDEV: ${message.notification.title}` } })
      : message
  )
}

export const sendSilentPushBadgeUpdate = (userId: string, badge: number): Promise<any[]> => {
  return Promise.all([
    mapBadgeUpdateToFcmMessageInput(badge),
    userModel.readDeviceInfosBy({
      userId: userId,
      isSignedIn: true,
      deviceToken: Not(IsNull()),
    }),
  ]).then(a => Promise.all([
    _.map(
      a[1],
      _.partial(buildSilentFcmMessageForDeviceInfo, a[0])
    ),
  ]))
    .then(_.flatten)
    .then(sf.list_fmap_wait(fcm.trySend))
}

const mapBadgeUpdateToFcmMessageInput = (badge: number): fcm.MessageInput => ({
  token: null,
  data: {},
  badge,
})

const createChatRoomCommentNotifications = (comment: Comment): Promise<any[]> => {
  return store.chatRoomPlayerEids(models.mapCommentToChatRoomId(comment))
    // don't notify the author
    .then((playerEids: string[]) => _.reject(playerEids, playerEid => comment.authorEid === playerEid))
    // don't notify the maker of the unobject. i.e. only notify players who are users.
    .then(filterForUsersEid)
    .then(store.zipPlayerEidsWithUsers)
    .then(sf.list_fmap(
      (playerEidUser: PlayerEidUser) => notifModel.mapChatRoomCommentToNotification(playerEidUser.user.id, playerEidUser.playerEid, comment)
    ))
    .then(sf.list_fmap_wait(store.saveNotification))
}
export const createNewsfeedItemNotifications = (newsFeed: NewsfeedItem, toUsers: User[]): Promise<Notification[]> => {
  const notifications = toUsers.map(user => notifModel.mapNewsfeedItemToNotification(user.id, user.eid, newsFeed))
  return sft.promiseMap(notifications, store.saveNotification)
}

const createChatRoomSystemCommentNotifications = (comment: Comment): Promise<any[]> => {
  return store.chatRoomPlayerEids(models.mapCommentToChatRoomId(comment))
    // only notify those who can see it
    .then(
      (playerEids: string[]) => {
        const visibleToPlayerEids = _.get(comment, 'metadata.visibleToPlayerEids')
        return _.isEmpty(visibleToPlayerEids)
          ? playerEids
          : _.filter(playerEids, playerEid => _.includes(visibleToPlayerEids, playerEid))
      }
    )
    // don't notify the maker of the unobject. i.e. only notify players who are users.
    .then(filterForUsersEid)
    .then(store.zipPlayerEidsWithUsers)
    .then(sf.list_fmap(
      (playerEidUser: PlayerEidUser) => notifModel.mapChatRoomCommentToNotification(playerEidUser.user.id, playerEidUser.playerEid, comment)
    ))
    .then(sf.list_fmap_wait(store.saveNotification))
}

const mapChatRoomCommentToFcmMessageData = (comment: Comment, notification: Notification): Bluebird<{
  chatRoomId: string
  type: NotificationDataType
  myUnReadMessageCount: string
  chatRoomOrder: string
  collectionId: string
  id: string
  authorEid: string
  text: string
}> => Bluebird.Promise.props({
  ..._.pick(comment, [
    'id',
    'authorEid',
    'text',
    'collectionId',
  ]),
  chatRoomId: models.mapCommentToChatRoomId(comment),
  type: NotificationDataType.ChatRoomCommentNotificationData,
  myUnReadMessageCount: chatModel.countUnReadCommentsForCollection(comment.collectionId, notification.userId)
    .then(_.toString)
  ,
  chatRoomOrder: store.chatRoomById(models.mapCommentToChatRoomId(comment))
    .then(chatRoom => misc.toDateISOString(chatRoom.updatedAt)),

})

const buildChatRoomCommentNotificationTitle = (author: Player, toPlayer: Player): string => {
  return models.isUnObject(toPlayer)
    ? `${models.playerName(author)} to your ${models.playerName(toPlayer)}`
    : models.playerName(author)
}

const mapChatRoomCommentNotificationToFcmMessageInput = (notification: Notification): Promise<{
  token: null
  data: {
    chatRoomId: string
    type: NotificationDataType
    myUnReadMessageCount: string
    chatRoomOrder: string
    collectionId: string
    id: string
    authorEid: string
    text: string
  }
  title: string
  body: string
  badge: number
}> => {
  return store.assertMapEidToEntity<Comment>(notification.eventEid)
    .then(comment => Promise.all([
      comment,
      store.entityByEid<Player>(comment.authorEid),
      store.entityByEid<Player>(notification.playerEid),
      store.unreadCommentsCount(notification.userId),
    ]))
    .then(([comment, author, toPlayer, badge]) => Bluebird.Promise.props({
      token: null,
      data: mapChatRoomCommentToFcmMessageData(comment, notification),
      title: buildChatRoomCommentNotificationTitle(author, toPlayer),
      body: comment.text,
      badge: badge,
    }))
}

export const readNewsfeedItemCommentNewsfeedItemActorsEids = (comment: Comment): Promise<string[]> => {
  const newsfeedItemId = models.mapCommentToNewsfeedItemId(comment)
  return store.entityById<NewsfeedItem>(newsfeedItemId, EntityType.NewsfeedItem)
    .then(newsfeedItem => [newsfeedItem.context.actorEid])
}

export const readNewsfeedItemCommentInterestedPlayerEids = (comment: Comment): Promise<any[]> => {
  return Promise.resolve(models.mapCommentToNewsfeedItemId(comment))
    .then(newsfeedItemId => activityModel.readEdgesBy({
      where: {
        thatEntityId: newsfeedItemId,
        edgeType: EdgeType.Interest,
        isDeleted: false,
      },
    }))
    .then(sf.list_fmap(store.mapEdgeToThisEntityRef))
    .then(sf.list_fmap(models.mapEntityRefToEid))
}

export const mapNewsfeedItemCommentToPlayerEidsToNotify = (comment: Comment): Promise<string[]> => {
  return Promise.all([
    readNewsfeedItemCommentNewsfeedItemActorsEids(comment),
    readNewsfeedItemCommentInterestedPlayerEids(comment),
  ])
    .then(_.flatten)
    // don't notify the comment author
    .then((playerEids: string[]) => _.reject(playerEids, playerEid => comment.authorEid === playerEid))
    // don't notify the maker of the unobject. i.e. only notify players who are users.
    .then(filterForUsersEid)
}

const createNewsfeedItemCommentNotifications = (comment: Comment): Promise<any[]> => {
  return mapNewsfeedItemCommentToPlayerEidsToNotify(comment)
    .then((playerEids: string[]) => Promise.all([
      playerEids,
      Promise.all(_.map(playerEids, store.userByEid)),
    ]))
    .then(([playerEids, users]) => _.zip(playerEids, users))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .then((playerEidUserTuples) => _.uniqBy(playerEidUserTuples, ([playerEid, user]) => user.id))
    // -rx- .then( sf.tap( arr => logger.info( 'createNewsfeedItemCommentNotifications', { arr, arr_1: _.first(arr), arr_1_2: _.last(_.first(arr)) } )) )
    .then(sf.list_fmap_wait(
      ([playerEid, user]: [string, User]) => Promise.resolve(
        notifModel.mapNewsfeedItemCommentToNotification(user.id, playerEid, comment)
      )
        .then(store.saveNotification)
    ))
}

const mapNewsfeedItemCommentToFcmMessageData = (comment: Comment): fcm.MessageData => ({
  ..._.pick(comment, [
    'id',
    'authorEid',
    'text',
    'collectionId',
  ]),
  newsfeedItemId: models.mapCommentToNewsfeedItemId(comment),
  type: NotificationDataType.NewsfeedItemCommentNotificationData,
} as any as fcm.MessageData)

const mapNewsfeedItemToFcmMessageData = (item: NewsfeedItem): fcm.MessageData => ({
  contextId: item.id,
  contextEntityType: EntityType.NewsfeedItem,
  type: NotificationDataType.NewsfeedItemNotificationData,
} as any as fcm.MessageData)

// comment -> 
//      notification (actor)    -> {{ name comment.author }} commented on your post
//      notification (interest) -> {{ name comment.author }} also commented on {{ name newsfeedItem.actor }}'s post 
//
const buildNewsfeedItemCommentNotificationTitle = (author: Player, toPlayer: Player, newsfeedItemActor: Player): string => {
  if (toPlayer.id == _.get(newsfeedItemActor, 'id')) {
    return models.isUnObject(toPlayer)
      ? `${models.playerName(author)} commented on your ${models.playerName(toPlayer)} post`
      : `${models.playerName(author)} commented on your post`
  } else {
    return `${models.playerName(author)} also commented on ${models.playerName(newsfeedItemActor)}'s post`
  }
}

const mapNewsfeedItemCommentNotificationToFcmMessageInput = (notification: Notification): Promise<fcm.MessageInput> => {
  return store.entityByEid(notification.eventEid)
    .then((comment: Comment) => Promise.all([
      comment,
      store.entityByEid<Player>(comment.authorEid),
      store.entityByEid<Player>(notification.playerEid),
      store.entityByEid<NewsfeedItem>(models.chompCollectionId(comment.collectionId))
        .then(newsfeedItem => store.entityByEid<Player>(newsfeedItem.context.actorEid))
      ,
      store.unreadCommentsCount(notification.userId),
    ]))
    .then(([comment, author, toPlayer, newsfeedItemActor, badge]) => ({
      token: null,
      data: mapNewsfeedItemCommentToFcmMessageData(comment),
      title: buildNewsfeedItemCommentNotificationTitle(author, toPlayer, newsfeedItemActor),
      body: comment.text,
      badge: badge,
    }) as fcm.MessageInput)
}

const mapNewsfeedItemNotificationToFcmMessageInput = (notification: Notification): Promise<fcm.MessageInput> => {
  const { newsfeedItem } = notification.metadata
  return store.userById(notification.userId)
    .then(user => Promise.all([
      store.unreadCommentsCount(notification.userId),
      store.newsfeedItemStatusText(newsfeedItem, user, false).then(removeMd),
    ]))
    .then(([badge, body]) => ({
      token: null,
      data: mapNewsfeedItemToFcmMessageData(newsfeedItem),
      title: 'There\'s News!',
      body: `${body} Tap Here to Read and Make Public`,
      badge,
    } as fcm.MessageInput))
}

const mapHandlerNotificationToFcmMessageData = (notification: Notification): Promise<fcm.MessageData> => {
  const chatRoomId = models.mapCollectionIdToChatRoomId(notification.collectionId)
  return Bluebird.Promise.props({
    type: NotificationDataType.HandlerNotificationData,
    id: notification.id,
    collectionId: notification.collectionId,
    contextEid: models.chompCollectionId(notification.collectionId),
    contextId: models.mapEidToId(models.chompCollectionId(notification.collectionId)),
    contextEntityType: models.mapEidToEntityType(models.chompCollectionId(notification.collectionId)),
    chatRoomId,
    chatRoomOrder: store.chatRoomById(chatRoomId)
      .then(chatRoom => misc.toDateISOString(chatRoom.updatedAt)),

  } as any as fcm.MessageData)
}

const mapHandlerNotificationToFcmMessageInput = (notification: Notification): Bluebird<{
  token: null
  data: object
  title: any
  body: any
  badge: number
}> => {
  return Bluebird.Promise.props({
    token: null,
    data: mapHandlerNotificationToFcmMessageData(notification)
      .then(misc.mapValuesToStrings)
    ,
    title: _.get(notification.metadata, 'notification.title'),
    body: _.get(notification.metadata, 'notification.body'),
    badge: store.unreadCommentsCount(notification.userId),
  })
}

const mapChatRoomActionToFcmMessageData = (completedAction: CompletedAction): Promise<fcm.MessageData> => Bluebird.Promise.props({
  ..._.pick(completedAction, [
    'id',
    'actorEid',
    'contextId',
  ]),
  chatRoomId: mapCompletedActionToChatRoomId(completedAction),
  type: NotificationDataType.ChatRoomActionNotificationData,
  actionName: _.get(completedAction, 'input.name'),
  chatRoomOrder: store.chatRoomById(mapCompletedActionToChatRoomId(completedAction))
    .then(chatRoom => misc.toDateISOString(chatRoom.updatedAt)),

} as any as fcm.MessageData)

const mapChatRoomActionNotificationToFcmMessageInput = (notification: Notification): Promise<any> => {
  return store.entityByEid<CompletedAction>(notification.eventEid)
    .then(completedAction => Promise.all([
      completedAction,
      store.entityByEid(completedAction.actorEid),
      store.entityByEid(notification.playerEid),
      store.unreadCommentsCount(notification.userId),
    ]))
    .then(([completedAction, actor, toPlayer, badge]) => Bluebird.Promise.props({
      token: null,
      data: mapChatRoomActionToFcmMessageData(completedAction as any),
      title: buildChatRoomCommentNotificationTitle(actor as any, toPlayer as any),
      body: `Played action ${_.get(completedAction, 'input.name')}`,
      badge: badge,
    }))
}

const mapCompletedActionToChatRoomId = (completedAction: CompletedAction): string => {
  return models.mapEidToId(_.get(completedAction, 'contextId'))
}

const createChatRoomActionNotifications = (completedAction: CompletedAction): Promise<any[]> => {
  return store.chatRoomPlayerEids(mapCompletedActionToChatRoomId(completedAction))
    // don't notify the actor
    .then((playerEids: string[]) => _.reject(playerEids, playerEid => completedAction.actorEid == playerEid))
    // don't notify the maker of the unobject. i.e. only notify players who are users.
    .then(filterForUsersEid)
    .then(store.zipPlayerEidsWithUsers)
    .then(sf.list_fmap(
      (playerEidUser: PlayerEidUser) => notifModel.mapChatRoomActionToNotification(_.get(playerEidUser, 'user.id'), playerEidUser.playerEid, completedAction)
    ))
    .then(sf.list_fmap_wait(store.saveNotification))
}

const filterForUsersEid = models.filterPlayersEidForUsersEid

/**
 * "Likes" Edge -> Notification 
 * @return Notification
 */
const createNewsfeedItemReactionNotifications = (edge: Edge): Promise<Notification> => {
  return store.newsfeedItemById(edge.thatEntityId)
    .then(newsfeedItem => notifModel.mapNewsfeedItemReactionToNotification(
      models.mapEidToId(newsfeedItem.context.actorEid),
      edge.thisEntityId,
      edge as any
    ))
    .then(store.saveNotification)
}

/**
 * Notification -> fcm.MessageInput
 * @return fcm.MessageInput
 */
const mapNewsfeedItemReactionNotificationToFcmMessageInput = (notification: Notification): Promise<fcm.MessageInput> => {
  return store.entityByEid(notification.eventEid)
    .then((edge: Edge) => Bluebird.Promise.props({
      edge,
      newsfeedItem: store.thatEntityOfEdge<any>(edge),
      player: store.thisEntityOfEdge<any>(edge),
    }))
    .then(({ newsfeedItem, player }) => Bluebird.Promise.props({
      token: null,
      data: {
        newsfeedItemId: newsfeedItem.id,
        type: NotificationDataType.NewsfeedItemReactionNotificationData,
      } as fcm.MessageData,
      title: `${models.playerName(player)} liked your post`,
      body: store.newsfeedItemStatusText(newsfeedItem, undefined, false).then(removeMd),

    }) as Promise<fcm.MessageInput>)
}

/**
 * "Likes" Edge -> Notification 
 * @return Notification
 */
const createCommentReactionNotifications = (edge: Edge): Promise<Notification> => {
  return chatModel.readCommentBy({ id: edge.thatEntityId })
    .then(comment => notifModel.mapCommentReactionToNotification(
      models.mapEidToId(comment.authorEid),
      edge.thisEntityId,
      edge as any
    ))
    .then(store.saveNotification)
}

/**
 * Notification -> fcm.MessageInput
 * @return fcm.MessageInput
 */
const mapCommentReactionNotificationToFcmMessageInput = (notification: Notification): Promise<fcm.MessageInput> => {
  return store.entityByEid(notification.eventEid)
    .then((edge: Edge) => Bluebird.Promise.props({
      edge,
      comment: store.thatEntityOfEdge<any>(edge),
      player: store.thisEntityOfEdge<any>(edge),
    }))
    .then(({ comment, player }) => ({
      token: null,
      data: {
        commentId: comment.id,
        commentCollectionId: comment.collectionId,
        newsfeedItemId: models.mapCollectionIdToNewsfeedItemId(comment.collectionId),
        type: NotificationDataType.CommentReactionNotificationData,
      } as fcm.MessageData,
      title: `${models.playerName(player)} liked your comment`,
      body: _.get(comment, 'text'),
    }) as fcm.MessageInput)
}

/**
 * @return Promise<Notification>
 */
export const createNewFollowerNotification = (forPlayer: Player, newFollower: User, followsEdge: Edge, ctx: any = null): Promise<Notification> => {
  if (models.isUnObject(forPlayer)) {
    return Promise.resolve(null)
  }
  return store.mapPlayerToUser(forPlayer)
    .then((forUser: User) => notifModel.buildNewFollowerNotification(forPlayer, forUser, newFollower, followsEdge, ctx))
    .then(store.saveNotification)
}

/**
 * Notification -> fcm.MessageInput
 * @return fcm.MessageInput
 */
const mapNewFollowerNotificationToFcmMessageInput = (notification: Notification): Promise<fcm.MessageInput> => {
  return store.entityByEid(notification.eventEid)
    .then((edge: Edge) => store.thisEntityOfEdge(edge))
    .then((newFollower: Player) => ({
      token: null,
      data: {
        newFollowerEid: models.mapEntityToEid(newFollower),
        id: notification.id,
        notificationType: notification.type,
        type: NotificationDataType.NewFollowerNotificationData,
      } as fcm.MessageData,
      title: null,
      body: `${models.playerName(newFollower)} is following you!`,
    }) as fcm.MessageInput)
}

export const createFriendingNotification = (
  to: Player,
  from: Player,
  type: NotificationType,
  ctx: any = null
): Promise<Notification> => {
  return Promise.resolve(notifModel.buildFriendingNotification(to, from, type, ctx))
    .then(store.saveNotification)
}

const mapNewFriendRequestNotificationToFcmMessageInput = (notification: Notification): Promise<fcm.MessageInput> => {
  return store.entityByEid<User>(notification.eventEid)
    .then(player => mapNotificationToFcmMessage(
      notification,
      'Received friend request',
      `${models.playerName(player)} sent you a friend request!`,
      {
        newFriendEid: models.mapEntityToEid(player),
        type: NotificationDataType.NewFriendRequestNotificationData,
        requestId: notification.metadata['requestId'],
      },
    ))
}

const mapFriendRequestAcceptedNotificationToFcmMessageInput = (notification: Notification): Promise<fcm.MessageInput> => {
  return store.entityByEid<User>(notification.eventEid)
    .then(player => mapNotificationToFcmMessage(
      notification,
      'Friend request got accepted',
      `${models.playerName(player)} accepted your friend request!`,
      {
        newFriendEid: models.mapEntityToEid(player),
        type: NotificationDataType.FriendRequestAcceptedNotificationData,
        requestId: notification.metadata['requestId'],
      }
    ))
}

const mapNotificationToFcmMessage = (notification: Notification, title: string, body: string, extras: object): Promise<fcm.MessageInput> => {
  return Promise.resolve({
    token: null,
    data: {
      ...extras,
      id: notification.id,
      notificationType: notification.type,
    } as fcm.MessageData,
    title,
    body,
  } as fcm.MessageInput)
}
