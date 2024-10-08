/**
 * @rob4lderman
 * aug2019
 *  
 * 
 */
import _ from 'lodash'
import { TYPEORM_CONNECTION } from 'src/env'
import {
  getConnection,
  Repository,
} from 'typeorm'
import {
  sf,
  sft,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  NewsfeedItem,
  User,
  Notification,
} from '../../db/entity'
import {
  FeedItem,
  FeedItemType,
  EdgeType,
  EntityType,
  DynamicFeedItemLayout,
} from 'src/gql-types'
import { v4 } from 'uuid'
import * as store from 'src/graphql/store'
import {
  NewsfeedItemTemplate,
  NewsfeedItemOut,
} from 'src/types'
import * as pubsub from 'src/graphql/pubsub'
import { saveEdge } from 'src/graphql/core'
import * as models from 'src/graphql/models'
import { mapEidToId } from 'src/graphql/models'
import { readEdgesBy } from 'src/graphql/Activity/activity.model'
import { validate } from 'src/utils/joi'
import { buildCreateNewsfeedItemInputSchema } from 'src/graphql/joi'
import { readUserUsernames } from 'src/graphql/User/user.model'
import {
  createNewsfeedItemNotifications,
  sendPushNotification,
} from 'src/graphql/notifs'
import { UserStateId } from 'src/domain/userStates'
import { safeIn } from 'src/db/utils'

const logger = LoggerFactory('newsfeeditem.model')
const DB_CONN_NAME = TYPEORM_CONNECTION

/**
 * @return Promise w/ repository
 */
let cachedNewsfeedItemRepository: Repository<NewsfeedItem> = null
export const getNewsfeedItemRepository = (): Promise<Repository<NewsfeedItem>> => {
  return !!!_.isNil(cachedNewsfeedItemRepository)
    ? Promise.resolve(cachedNewsfeedItemRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(NewsfeedItem))
      .then(sf.tap(repository => {
        cachedNewsfeedItemRepository = repository 
      }))
}

export const readNewsfeedItemsBy = (options: object): Promise<NewsfeedItem[]> => {
  logger.debug('readNewsfeedItemsBy', { options })
  return getNewsfeedItemRepository()
    .then(repo => repo.find(options))
}

export const readNewsfeedItemBy = (fields: object): Promise<NewsfeedItem> => {
  logger.debug('readNewsfeedItemBy', { fields })
  return getNewsfeedItemRepository()
    .then(repo => repo.findOne(fields))
}

export const newsfeedItemTemplateToNewsfeedItem = (input: NewsfeedItemTemplate): NewsfeedItem => {
  const retMe = new NewsfeedItem()
  retMe.id = v4()

  return _.extend(retMe, _.pick(input, [ 
    'expiresAt',
    'fromEid',
    'userId',
    'context',
    'isDeleted',
    'metadata',
    'optimisticId',
    'rateId',
    'trackingId',
    'layout',
    'isPublic',
    'isLive',
    'stateId',
  ]))
}

/**
 * Save in db via write-thru cache
 */
export const saveNewsfeedItem = (newsfeedItem: NewsfeedItem): Promise<NewsfeedItem> => {
  return getNewsfeedItemRepository()
    .then(repo => repo.save(newsfeedItem))
}

export const newsfeedItemToFeedItem = (newsfeedItem: NewsfeedItem): Promise<FeedItem> => {
  return Promise.resolve({
    type: FeedItemType.NewsfeedItem,
    dynamic: newsfeedItem as NewsfeedItemOut,
  })
}

export const deleteNewsfeedItemEdges = (newsfeedItemsId: string[], userId?: string): Promise<any> => {
  return store.deleteEdgesBy({
    collectionId: safeIn(newsfeedItemsId),
    edgeType: EdgeType.NewsfeedItem,
    isDeleted: false,
    ...(!_.isNil(userId) && { thisEntityId: userId }),
  })
}

// TODO: saveEffect?
export const deleteNewsfeedItem = (id: string): Promise<NewsfeedItem> => {
  return store.newsfeedItemById(id)
    .then(newsfeedItem => {
      if (_.isNil(newsfeedItem)) {
        return null
      }

      newsfeedItem.isDeleted = true
      return Promise.all([
        store.saveNewsfeedItem(newsfeedItem, saveNewsfeedItem),
        deleteNewsfeedItemEdges([newsfeedItem.id]),
      ])
        .then(() => newsfeedItem)
    })
}

export const liveNewsfeedItemBy = (userId: string, stateId: UserStateId): Promise<NewsfeedItem | null> => {
  return readNewsfeedItemBy({
    userId,
    stateId,
    isLive: true,
  })
}

/**
 * Finds an existing live newsfeed item for the given
 * user and state ids. It then set its isLive to false
 * when the item is found.
 */
export const inactivateLiveNewsfeedItemBy = (userId: string, stateId: UserStateId): Promise<NewsfeedItem | null> => {
  return liveNewsfeedItemBy(userId, stateId)
    .then(item => _.isNil(item)
      ? null
      : store.saveNewsfeedItem({ ...item, isLive: false } as NewsfeedItem, saveNewsfeedItem)
    )
}

/**
 * Create newsfeed item edge from one user to another
 * with collectionId being the newsfeed item id
 *
 * @param newsfeedItem
 * @param thisId
 */
const createNewsfeedItemEdgeForUserId = (newsfeedItem: NewsfeedItem, thisId: string): Promise<any> => {
  return saveEdge({
    thisEntityId: thisId,
    thisEntityType: EntityType.User,
    thatEntityId: newsfeedItem.userId,
    thatEntityType: EntityType.User,
    edgeType: EdgeType.NewsfeedItem,
    collectionId: newsfeedItem.id,
    isDeleted: false,
  })
    .then(sft.tap_catch(
      () => newsfeedItemToFeedItem(newsfeedItem)
        .then(feedItem => pubsub.publishFeedItem(thisId, feedItem))
    ))
    .catch((err) => logger.error('ERROR: IGNORE: createNewsfeedItemEdgeForUserId', {
      err,
      newsfeedItem,
      thisId,
      thatId: newsfeedItem.userId,
    }))
}

export const fanOutNewsfeedItemToFollowers = (newsfeedItem: NewsfeedItem): Promise<any> => {
  logger.debug('fanOutNewsfeedItemsToFollowers', { newsfeedItem })

  // TODO: scale: batch up the reads in case the entity has millions of followers
  // TODO: figure out a way to cache
  return readEdgesBy({
    where: {
      thisEntityType: EntityType.User,
      thatEntityId: newsfeedItem.userId,
      edgeType: EdgeType.Follows,
    },
  })
    .then(edges => sft.promiseMap(
      edges,
      edge => createNewsfeedItemEdgeForUserId(newsfeedItem, edge.thisEntityId)
    ))
}

export const playersIdFromContext = (newsfeedItem: NewsfeedItem): string[] => {
  return _.compact([
    newsfeedItem.context.actorEid,
    newsfeedItem.context.partnerEid,
  ])
    .map(mapEidToId)
}

/**
 * These edges are created so that the newsfeed item
 * can appears on a user's public/home feed.
 *
 * 1) Don't create edge for the Dynamic2 layout type because
 *    it should appear only on the activity/private feed
 * 2) For the other layout types, always create an edge
 *    for the owner and when it's public create edges for followers
 */
export const fanOutNewsfeedItem = (newsfeedItem: NewsfeedItem): Promise<any> => {
  if (newsfeedItem.layout === DynamicFeedItemLayout.Dynamic2) {
    return null
  }
  return createNewsfeedItemEdgeForUserId(newsfeedItem, newsfeedItem.userId)
    .then(() => !newsfeedItem.isPublic
      ? null
      : fanOutNewsfeedItemToFollowers(newsfeedItem)
    )
}

const createAndSendNotification = (input: {
  item: NewsfeedItem
  fetchUsersFn: (param: string | string[]) => Promise<User | User[]>
  fetchUsersFnParam: string | string[]
  sendNotificationFn: (param: Notification) => Promise<any>
}): Promise<any> => {
  return input.fetchUsersFn(input.fetchUsersFnParam)
    .then(users => Array.isArray(users)
      ? users
      : [users]
    )
    .then(toUsers => createNewsfeedItemNotifications(input.item, toUsers))
    .then(notifications => sft.promiseMap(notifications, input.sendNotificationFn))
}

export const createNewsfeedItem = (args: NewsfeedItemTemplate): Promise<NewsfeedItemOut> => {
  // TODO: joi validation on type-specific metadata and context
  const input = validate(args, buildCreateNewsfeedItemInputSchema())

  return Promise.resolve(null)
    .then(() => newsfeedItemTemplateToNewsfeedItem(input))
    // .then(item => {
    //   if (!isRateLimited(input)) {
    //     return item
    //   }
    //   return readRateLimited(item.rateId, input.rateLimit)
    //     .then(result => _.isNil(result)
    //       ? item
    //       : Promise.reject(result)
    //     )
    // })
    .then(item => {
      if (_.isNil(item.isLive) || _.isEqual(item.isLive, false)) {
        return item
      }
      // make an attempt to inactivate an existing
      // live newsfeed item for this user and state
      return inactivateLiveNewsfeedItemBy(item.userId, item.stateId as UserStateId)
        .then(() => item)
    })
    .then(item => store.saveNewsfeedItem(item, saveNewsfeedItem))
    .then(item => _.isNil(item)
      ? Promise.reject('Failed to save newsfeed item')
      : item,
    )
    .then(sft.tap_catch(
      (item: NewsfeedItem) => fanOutNewsfeedItem(item)
    ))
    .then(sft.tap_catch(
      (item: NewsfeedItem) => {
        switch (item.layout) {
          case DynamicFeedItemLayout.Post1:
            // create and publish notification to all mentioned users
            // in the newsfeed item post
            const mentionedUsers = models.parseMentionedUsers(item.metadata.statusText)
            if (_.isEmpty(mentionedUsers)) {
              return null
            }
            return createAndSendNotification({
              item,
              fetchUsersFn: readUserUsernames,
              fetchUsersFnParam: mentionedUsers,
              sendNotificationFn: sendPushNotification,
            })
          case DynamicFeedItemLayout.Dynamic1:
            // create notification for the owner
            // to be displayed on the activity feed
            // when owner is the partner, we send in-app
            // and APN/push notification
            // when owner is the actor, we send only the in-app notification
            const notificationFn = item.userId === mapEidToId(item.context.partnerEid)
              ? sendPushNotification
              : pubsub.publishNotification
            return createAndSendNotification({
              item,
              fetchUsersFn: store.userById,
              fetchUsersFnParam: item.userId,
              sendNotificationFn: notificationFn,
            })
          case DynamicFeedItemLayout.Dynamic2:
            // create notification for the owner
            // to be displayed on the activity feed
            return createAndSendNotification({
              item,
              fetchUsersFn: store.userById,
              fetchUsersFnParam: item.userId,
              sendNotificationFn: () => Promise.all([
                pubsub.publishUnreadActivityCount(item.userId),
                pubsub.publishUnreadNotificationsCount(item.userId),
              ]),
            })
          default:
            return null
        }
      }
    ))
    .catch(err => {
      if (_.isNil(err.id)) {
        logger.error('Attempted to create newsfeed item', err)
        return null
      }
      return err
    })
}
