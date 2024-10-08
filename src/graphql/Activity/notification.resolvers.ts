/**
 * @rob4lderman
 * mar2020
 * 
 */
import _ from 'lodash'
import {
  combineResolvers,
  skip,
} from 'graphql-resolvers'
import {
  sft,
  jwt,
  misc,
} from '../../utils'
import {
  User,
  Notification,
} from '../../db/entity'
import {
  Image,
  NotificationType,
  MutationUpdateNotificationsArgs,
  EntityType,
  QueryNotificationsArgs,
} from 'src/gql-types'
import * as core from '../core'
import * as authz from '../authz'
import * as notifs from '../notifs'
import * as store from '../store'
import { deleteNewsfeedItemEdges } from 'src/graphql/Activity/newsfeeditem.model'
import {
  mapEidToId,
  isEidEntityType,
} from 'src/graphql/models'
import { DEFAULT_LOOKUP_TYPES } from 'src/graphql/Activity/notification.model'
import { publishUnreadActivityCount } from 'src/graphql/pubsub'

const authzIsNotificationUser = (notification: Notification, args, ctx): Promise<any> => {
  const sessionUser: User = ctx.user
  return Promise.resolve(_.get(notification, 'userId', 'x') == _.get(sessionUser, 'id', 'y'))
    .then(sft.thru_if(misc.isFalse)(
      () => {
        throw authz.buildNotAuthorizedReadNotificationError()
      }
    ))
    .catch((err) => authz.authzMasterApiKeyOverride(err, ctx.apiKey))
    .then(() => skip)
}

const notificationImage = (notification: Notification): Promise<Image> => {
  return store.entityByEid(notification.eventEid)
    .then(core.mapEntityToImage)
}

const resolveAsNotificationType = (notificationType: NotificationType) => (notification: Notification): Promise<any> =>
  _.get(notification, 'type') == notificationType
    ? notifs.mapNotificationToFcmMessageInput(notification)
    : null

const updateNotifications = (root, args: MutationUpdateNotificationsArgs, ctx): Promise<Notification[]> => {
  const user: User = ctx.user
  if (_.isNil(args.input.isRead) && !args.input.isDismissed) {
    return Promise.reject(new Error(`Can't un-dismiss notifications, ${args.input.ids}`))
  }

  const isReadLookup = args.input.isRead === true ? false : args.input.isRead
  return store.notificationsByIdsUser(args.input.ids, user.id, isReadLookup)
    .then(notifications => sft.promiseMap(
      notifications,
      notif => {
        const newNotif = {
          ...notif,
          ...(!_.isNil(args.input.isRead) && { isRead: args.input.isRead }),
          ...(_.isEqual(args.input.isDismissed, true) && { isRead: true, isDeleted: true }),
        }
        return store.removeNotificationFromCache(notif)
          .then(() => store.saveNotification(newNotif as Notification))
      }
    ))
    .then(sft.tap_wait(
      notifs => {
        if (!args.input.isDismissed) {
          return null
        }
        // delete "published" edges for newsfeed items
        const newsfeedItemsId = _.compact(notifs.map(notif =>
          !isEidEntityType(notif.eventEid, EntityType.NewsfeedItem)
            ? null
            : mapEidToId(notif.eventEid)
        ))
        if (_.isEmpty(newsfeedItemsId)) {
          return null
        }
        return deleteNewsfeedItemEdges(newsfeedItemsId)
      }
    ))
    .then(sft.tap_catch(() => publishUnreadActivityCount(user.id)))
}

const notifications = (root, args: QueryNotificationsArgs, ctx): Promise<any> => {
  const user: User = ctx.user
  const types = args.input?.types || DEFAULT_LOOKUP_TYPES
  return core.userNotifications(user, args.input?.pageInput, types)
}

//
// GraphQL schema resolver table.
//

export default {
  Query: {
    notifications,
  },
  Mutation: {
    updateNotifications: combineResolvers(jwt.requireJwtAuth, updateNotifications),
  },
  Notification: {
    fcmMessageInput: combineResolvers(jwt.requireJwtAuth, authzIsNotificationUser, notifs.mapNotificationToFcmMessageInput),
    image: combineResolvers(jwt.requireJwtAuth, authzIsNotificationUser, notificationImage),
    asChatRoomCommentNotification: combineResolvers(jwt.requireJwtAuth, authzIsNotificationUser, resolveAsNotificationType(NotificationType.ChatRoomCommentNotification)),
    asChatRoomActionNotification: combineResolvers(jwt.requireJwtAuth, authzIsNotificationUser, resolveAsNotificationType(NotificationType.ChatRoomActionNotification)),
    asHandlerNotification: combineResolvers(jwt.requireJwtAuth, authzIsNotificationUser, resolveAsNotificationType(NotificationType.HandlerNotification)),
    asNewsfeedItemCommentNotification: combineResolvers(jwt.requireJwtAuth, authzIsNotificationUser, resolveAsNotificationType(NotificationType.NewsfeedItemCommentNotification)),
    asNewsfeedItemReactionNotification: combineResolvers(jwt.requireJwtAuth, authzIsNotificationUser, resolveAsNotificationType(NotificationType.NewsfeedItemReactionNotification)),
    asCommentReactionNotification: combineResolvers(jwt.requireJwtAuth, authzIsNotificationUser, resolveAsNotificationType(NotificationType.CommentReactionNotification)),
    asNewFollowerNotification: combineResolvers(jwt.requireJwtAuth, authzIsNotificationUser, resolveAsNotificationType(NotificationType.NewFollowerNotification)),
    asNewsfeedItem: combineResolvers(authzIsNotificationUser, core.resolveEidToEntityType('eventEid', EntityType.NewsfeedItem)),
    asComment: combineResolvers(authzIsNotificationUser, core.resolveEidToEntityType('eventEid', EntityType.Comment)),
  },
}
