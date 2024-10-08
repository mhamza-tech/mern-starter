/**
 * @rob4lderman
 * mar2020
 */
import { gql } from 'apollo-server'

export default gql`
enum NotificationType {
  ChatRoomInviteNotification
  ChatRoomCommentNotification
  ChatRoomActionNotification
  NewsfeedItemNotification
  NewsfeedItemCommentNotification
  NewsfeedItemReactionNotification
  CommentReactionNotification
  HandlerNotification
  NewFollowerNotification
  NewFriendRequestNotification
  FriendRequestAcceptedNotification
}

enum NotificationDataType {
  ChatRoomCommentNotificationData
  ChatRoomActionNotificationData
  NewsfeedItemNotificationData
  NewsfeedItemCommentNotificationData
  NewsfeedItemReactionNotificationData
  CommentReactionNotificationData
  HandlerNotificationData
  NewFollowerNotificationData
  NewFriendRequestNotificationData
  FriendRequestAcceptedNotificationData
}

type Notification {
  id: ID!
  entityType: EntityType!
  type: NotificationType!
  userId: String!
  playerEid: String
  collectionId: String!
  eventEid: String
  trackingId: String
  metadata: JSONObject
  createdAt: DateTime!
  updatedAt: DateTime!
  fcmMessageInput: FcmMessageInput
  image: Image
  isRead: Boolean!
  isDeleted: Boolean!
  asChatRoomCommentNotification: ChatRoomCommentNotification
  asChatRoomActionNotification: ChatRoomActionNotification
  asHandlerNotification: HandlerNotification
  asNewsfeedItemCommentNotification: NewsfeedItemCommentNotification
  asNewsfeedItemReactionNotification: NewsfeedItemReactionNotification
  asCommentReactionNotification: CommentReactionNotification
  asNewFollowerNotification: NewFollowerNotification
  asNewsfeedItem: NewsfeedItem
  asComment: Comment
}

type ChatRoomCommentNotification {
  title: String
  body: String
  data: ChatRoomCommentNotificationData
}

type ChatRoomActionNotification {
  title: String
  body: String
  data: ChatRoomActionNotificationData
}

type HandlerNotification {
  title: String
  body: String
  data: HandlerNotificationData
}

type NewsfeedItemPostNotification {
  title: String
  body: String
  data: NewsfeedItemPostNotificationData
}

type NewsfeedItemCommentNotification {
  title: String
  body: String
  data: NewsfeedItemCommentNotificationData
}

type NewsfeedItemReactionNotification {
  title: String
  body: String
  data: NewsfeedItemReactionNotificationData
}

type CommentReactionNotification {
  title: String
  body: String
  data: CommentReactionNotificationData
}

type NewFollowerNotification {
  title: String
  body: String
  data: NewFollowerNotificationData
}

type NewFollowerNotificationData {
  type: String!
  id: String!
  notificationType: NotificationType!
  newFollowerEid: String
}

type FcmMessageInput {
  data: JSONObject
  title: String
  body: String
}

type ChatRoomCommentNotificationData {
  type: String!
  id: String! 
  authorEid: String! 
  collectionId: String!
  chatRoomId: String!
  text: String 
  myUnReadCommentCount: String
  chatRoomOrder: String
}

type ChatRoomActionNotificationData {
  type: String!
  id: String! 
  actorEid: String! 
  contextId: String!
  chatRoomId: String!
  actionName: String 
  chatRoomOrder: String
}

type NewsfeedItemPostNotificationData {
  newsfeedItemId: String!
  type: String!
}

type NewsfeedItemCommentNotificationData {
  type: String!
  id: String! 
  authorEid: String! 
  collectionId: String!
  newsfeedItemId: String!
  text: String 
}

type NewsfeedItemReactionNotificationData {
  newsfeedItemId: String!
  type: String!
}

type CommentReactionNotificationData {
  type: String!
  commentId: String!
  commentCollectionId: String!
  newsfeedItemId: String
}

type HandlerNotificationData {
  type: String!
  id: String! 
  collectionId: String!
  contextEid: String! 
  contextId: String!
  contextEntityType: String!
  chatRoomId: String
  chatRoomOrder: String
}

input NotificationsInput {
  types: [NotificationType!]
  pageInput: PageInput
}

type NotificationsOutput {
  notifications: [Notification!]!
  pageInfo: PageInfo!
  unreadCount: Int!
}

input CreateNotificationInput {
  type: NotificationType!
  playerEid: String!
  collectionId: String!
  eventEid: String
  metadata: JSONObject
}

type CreateNotificationOutput {
  notification: Notification
}

input UpdateNotificationsInput {
  ids: [ID!]!
  isRead: Boolean
  isDismissed: Boolean
}

type Query {
  notifications(input: NotificationsInput): NotificationsOutput!
}

type Mutation {
  updateNotifications(input: UpdateNotificationsInput!): [Notification!]!
}
`
