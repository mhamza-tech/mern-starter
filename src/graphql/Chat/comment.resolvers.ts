/**
 * @rob4lderman
 * mar2020
 * 
 */
import _ from 'lodash'
import { combineResolvers } from 'graphql-resolvers'
import {
  sf,
  jwt,
  misc,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  User,
  CommentReceipt,
  Player,
  Comment,
  Receipt,
} from '../../db/entity'
import {
  NodeType,
  SaveCommentReceiptOutput,
  SaveCommentReceiptsOutput,
  SaveCommentReceiptInput,
  ReceiptType,
  SaveCommentReceiptsInput,
  CommentReceiptsOutput,
  EntityRef,
  SaveReceiptOutput,
  SaveReceiptInput,
  SaveReceiptsOutput,
  SaveReceiptsInput,
  QueryCommentsReceiptsArgs,
  EntityType,
} from '../../gql-types'
import * as pubsub from '../pubsub'
import { publishUnreadMessagesCount } from '../pubsub'
import * as model from './chat.model'
import * as core from '../core'
import * as store from '../store'
import * as notifs from '../notifs'
import * as models from '../models'
import {
  buildEnumSchema,
  validate,
  buildSaveReceiptInputSchema,
  buildSaveReceiptsInputSchema,
} from '../joi'
import Joi from '@hapi/joi'
import {
  defaultPageInput,
  mapToPageInfo,
} from 'src/graphql/pageInput'
import { mapAndAuthzSessionUserToPlayer } from 'src/graphql/Chat/chat.authz'

const logger = LoggerFactory('chat.resolvers')

const commentAuthor = (comment: Comment): Promise<unknown> => {
  return store.entityByEid(comment.authorEid)
    .catch(sf.tap_throw(err => logger.error('commentAuthor', { err, comment })))
}

const buildSaveCommentReceiptInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    collectionId: Joi.string().required(),
    commentId: Joi.string().required(),
    receiptType: buildEnumSchema(ReceiptType).required(),
    asUnObjectId: Joi.string().allow('', null),
  })
}

const buildSaveCommentReceiptsInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    receipts: Joi.array().items(buildSaveCommentReceiptInputSchema()).min(1),
  })
}

const updateNotification = (userId: string, receipt: CommentReceipt, type: ReceiptType): Promise<any> => {
  if (![ReceiptType.Read, ReceiptType.Dismissed].includes(type)) {
    return Promise.resolve(null)
  }

  const eventEid = models.buildEid(EntityType.Comment, receipt.commentId)
  return store.notificationByUserEventEid({ userId, eventEid })
    .then(notif => {
      if (_.isNil(notif)) {
        return null
      }
      notif.isRead = true
      return store.saveNotification(notif)
        .then(() => publishUnreadMessagesCount(userId, notif.type))
    })
}

const saveCommentReceipt = (root, args, ctx): Promise<SaveCommentReceiptOutput> => {
  const sessionUser: User = ctx.user
  const input: SaveCommentReceiptInput = validate(args.input, buildSaveCommentReceiptInputSchema())
  return mapAndAuthzSessionUserToPlayer(sessionUser, _.get(args, 'input.asUnObjectId'))
    .then((player: Player) => model.mapSaveCommentReceiptInputToCommentReceipt(input, sessionUser.id, player))
    .then(model.createOrUpdateCommentReceipt)
    .then(sf.tap_catch(
      receipt => Promise.all([
        pubsub.publishCommentReceipt(receipt),
        updateBadgeCount(sessionUser.id),
        updateNotification(sessionUser.id, receipt, input.receiptType),
      ])
    ))
    .then((commentReceipt: CommentReceipt) => ({ commentReceipt }))
}

// TODO do we need to cache this?
const saveCommentReceipts = (root, args, ctx): Promise<SaveCommentReceiptsOutput> => {
  const input: SaveCommentReceiptsInput = validate(args.input, buildSaveCommentReceiptsInputSchema())
  return Promise.all(
    _.map(input.receipts, (input: SaveCommentReceiptInput) => saveCommentReceipt(root, { input }, ctx))
  )
    .then(sf.list_fmap((output: SaveCommentReceiptOutput) => output.commentReceipt))
    .then((commentReceipts: CommentReceipt[]) => ({ commentReceipts }))
}

export interface UserIdToPromiseMap {
  [userId: string]: Promise<any>
}

/**
 * For queueing up a bunch of calls to updateBadgeCount.
 * updateBadgeCount is called for every saveCommentReceipt.
 * saveCommentReceipt calls come in bunches.
 * This code queues up all the calls so we send only one 
 * silent push notif to update the badge count.
 */
const cachedUpdateBadgePromises: UserIdToPromiseMap = {}

/**
 * @param userId 
 */
const updateBadgeCount = (userId: string): Promise<any> => {
  if (!!!_.isNil(cachedUpdateBadgePromises[userId])) {
    logger.log('updateBadgeCount: defering to cached promise')
    return cachedUpdateBadgePromises[userId]
  }
  cachedUpdateBadgePromises[userId] = Promise.resolve(userId)
    .then(sf.pause(6 * 1000))
    .then(sf.tap(() => {
      cachedUpdateBadgePromises[userId] = null
    })) // clear the cache
    .then(() => store.unreadCommentsCount(userId))
    .then((badge: number) => notifs.sendSilentPushBadgeUpdate(userId, badge))

  return cachedUpdateBadgePromises[userId]
}

const saveReceipt = (root, args, ctx): Promise<SaveReceiptOutput> => {
  const sessionUser: User = ctx.user
  const input: SaveReceiptInput = validate(args.input, buildSaveReceiptInputSchema())
  return mapAndAuthzSessionUserToPlayer(sessionUser, _.get(args, 'input.asUnObjectId'))
    .then((player: Player) => model.mapSaveReceiptInputToReceipt(input, sessionUser.id, player))
    .then(model.createOrReadReceipt)
    .then(sf.tap_catch(pubsub.publishReceipt))
    .then((receipt: Receipt) => ({ receipt }))
}

// TODO do we need to cache this?
const saveReceipts = (root, args, ctx): Promise<SaveReceiptsOutput> => {
  const input: SaveReceiptsInput = validate(args.input, buildSaveReceiptsInputSchema())
  return Promise.all(
    _.map(input.receipts, (input: SaveReceiptInput) => saveReceipt(root, { input }, ctx))
  )
    .then(sf.list_fmap((output: SaveReceiptOutput) => output.receipt))
    .then((receipts: Receipt[]) => ({ receipts }))
}

// TODO do we need to fetch this from cache?
const commentCommentReceipts = (comment: Comment): Promise<CommentReceiptsOutput> => {
  return model.readCommentReceiptsBy({
    commentId: comment.id,
  })
    .then((commentReceipts: CommentReceipt[]) => ({ commentReceipts }))
}

const chatRoomSystemCommentVisibleToPlayerIds = (comment: Comment): Promise<any> => {
  const visibleToPlayerIds = _.get(comment, 'metadata.visibleToPlayerIds', [])
  if (!!!_.isEmpty(visibleToPlayerIds)) {
    return Promise.resolve(visibleToPlayerIds)
  }
  const visibleToPlayerEids = _.get(comment, 'metadata.visibleToPlayerEids', [])
  return Promise.resolve(visibleToPlayerEids)
    .then(sf.list_fmap((eid: string) => _.last(_.split(eid, '/'))))
}

const chatRoomSystemCommentIsVisibleToMe = (comment: Comment, args, ctx): Promise<boolean> => {
  const sessionUser: User = ctx.user
  const visibleToPlayerEids = _.get(comment, 'metadata.visibleToPlayerEids', [])
  if (_.isEmpty(visibleToPlayerEids)) {
    return Promise.resolve(true)
  }
  return Promise.resolve(visibleToPlayerEids)
    .then(sf.list_fmap(models.mapEidToEntityRef))
    .then(sf.list_fmap_wait((entityRef: EntityRef) => core.isPlayerEntityHandledByThisUser(entityRef, sessionUser)))
    .then(booleans => _.find(booleans, _.identity))
    .then(misc.isNot(_.isNil))
}

const commentReceiptIsMyReceipt = (commentReceipt: CommentReceipt, args, ctx): boolean => {
  const sessionUser: User = ctx.user
  return _.get(commentReceipt, 'sessionUserId', '0') == _.get(sessionUser, 'id', '1')
}

const commentReceiptChatRoomId = (commentReceipt: CommentReceipt): string => {
  return models.mapCollectionIdToChatRoomId(commentReceipt.collectionId)
}

const commentReceiptNewsFeedItemId = (commentReceipt: CommentReceipt): string =>{
  return models.mapCollectionIdToNewsfeedItemId(commentReceipt.collectionId)
}

// TODO do we need to fetch this from cache?
// Not validating the input via joi because GQL server
// should take care of it based on schema
const commentsReceipts = (root, args: QueryCommentsReceiptsArgs): Promise<CommentReceiptsOutput> => {
  const defaultInput = {
    collectionId: args.input.collectionId,
    playerEids: args.input.playerEids,
    pageInput: defaultPageInput(args.input.pageInput),
  }
  return model.readReceiptsPageByUpdatedAt(defaultInput)
    .then(receipts => ({
      commentReceipts: receipts,
      pageInfo: mapToPageInfo(receipts, defaultInput.pageInput),
    }))
}

//
// GraphQL schema resolver table.
//

export default {
  Query: {
    commentsReceipts: combineResolvers(jwt.requireJwtAuth, commentsReceipts),
  },
  Mutation: {
    saveCommentReceipt: combineResolvers(jwt.requireJwtAuth, saveCommentReceipt),
    saveCommentReceipts: combineResolvers(jwt.requireJwtAuth, saveCommentReceipts),
    saveReceipt: combineResolvers(jwt.requireJwtAuth, saveReceipt),
    saveReceipts: combineResolvers(jwt.requireJwtAuth, saveReceipts),
  },
  Comment: {
    asNode: _.identity,
    eid: core.resolveEid,
    author: commentAuthor,
    asChatRoomSystemComment: core.resolveAsNodeType(NodeType.ChatRoomSystemComment),
    asChatRoomComment: core.resolveAsNodeType(NodeType.ChatRoomComment),
    commentReceipts: commentCommentReceipts,
    likesCount: core.likesCount,
    myLikesCount: core.myLikesCountFor,
  },
  ChatRoomSystemComment: {
    visibleToPlayerIds: chatRoomSystemCommentVisibleToPlayerIds,
    visibleToPlayerEids: core.resolveArrayFromMetadata('visibleToPlayerEids'),
    isVisibleToMe: chatRoomSystemCommentIsVisibleToMe,
    chatRoomId: models.mapCommentToChatRoomId,
  },
  ChatRoomComment: {
    chatRoomId: models.mapCommentToChatRoomId,
  },
  NewsfeedItemComment: {
    newsfeedItemId: models.mapCommentToNewsfeedItemId,
  },
  CommentReceipt: {
    isMyReceipt: combineResolvers(jwt.requireJwtAuth, commentReceiptIsMyReceipt),
    chatRoomId: commentReceiptChatRoomId,
    newsFeedItemId: commentReceiptNewsFeedItemId,
  },
}
