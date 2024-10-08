/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @rob4lderman
 * nov2019
 * 
 * Functions that ensure consistency in the data.
 * One-off functions to backfill missing data for a new feature can go here.
 */

import {
  sf,
  misc,
  sft,
} from '../utils'
import { LoggerFactory } from 'src/utils/logger'
import { SYSTEM_USER_EID } from '../env'
import { createConnectionsPromise } from '../db/connect'
import _ from 'lodash'
import * as activityModel from './Activity/activity.model'
import * as fieldModel from './Activity/field.model'
import * as chatModel from './Chat/chat.model'
import * as userModel from './User/user.model'
import * as chatResolvers from './Chat/chat.resolvers'
import * as store from './store'
import * as models from './models'
import {
  EntityType,
  EdgeType,
  CreateEdgeInput,
  ReceiptType,
  NodeType,
  PlayerEidUser,
  SaveEdgeInput,
  Gender,
  FieldType,
} from '../gql-types'
import {
  ChatRoom,
  Comment,
  CommentReceipt,
  Edge,
  UnObject,
  NewsfeedItem,
  Tile,
  Effect,
  User,
} from '../db/entity'
import {
  Not,
  IsNull,
  LessThan,
  In,
} from 'typeorm'
import Bluebird from 'bluebird'
import moment from 'moment'
import { userStates } from 'src/domain/userStates'
import { hashtributes } from 'src/domain/hashtributes'
import {
  deleteField,
  saveEdge,
} from 'src/graphql/core'
import { readMostRecentCompletedAction } from 'src/graphql/Action/actionx.model'
import {
  updateUnObject,
  readUnObjectBy,
  readUnObjectsBy,
} from 'src/graphql/Action/unobject.model'
import { readNewsfeedItemsBy } from 'src/graphql/Activity/newsfeeditem.model'
import { fakeUsers } from 'src/domain/fakeUsers'
import { promiseMap } from 'src/utils/sf.typed'

const logger = LoggerFactory('consistency', 'Consistency')

/**
 * 1. read ALL chat rooms
 * 2. read ALL players in those chat rooms
 * 3. create edges.
 */
const backfillChatRoomEdges = (): Promise<any[]> => {
  const calcOrder = (chatRoom, comment, completedAction): string => {
    return _.last(
      _.chain([chatRoom, comment, completedAction])
        .map(entity => misc.toDateISOString(_.get(entity, 'createdAt', '2019-08-01T12:00:00.000Z')))
        .sortBy(_.identity)
        .value()
    )
  }

  return chatModel.readChatRoomsBy({ entityType: EntityType.ChatRoom })
    .then(sf.list_fmap_wait(
      (chatRoom: ChatRoom) => Promise.all([
        chatModel.readMostRecentComment(models.buildCollectionId(models.mapEntityToEid(chatRoom), 'comment')),
        readMostRecentCompletedAction(models.mapEntityToEid(chatRoom)),
        activityModel.readEdgesBy({
          where: {
            collectionId: chatRoom.id,
            edgeType: EdgeType.ChatRoom,
          },
        })
          .then(sf.list_fmap_wait(store.mapEdgeToThatEntityRef))
          .then(sf.list_fmap_wait(models.mapEntityRefToEid))
          .then(sf.list_fmap_wait(store.userByEid)),
      ])
        .then(
          ([comment, completedAction, users]) => _.chain(users)
            .compact()
            .map((user: any) => chatResolvers.chatRoomSaveEdgeInput(chatRoom, user))
            .map(input => _.extend(input, { order: calcOrder(chatRoom, comment, completedAction) }))
            .value()
        )
        .then(sf.list_fmap_wait(
          (input: CreateEdgeInput) => Promise.resolve(input)
            .then(activityModel.mapCreateEdgeInputToEdge)
            .then(sf.tap((edge) => logger.log('backfillChatRoomEdges: adding edge ', { edge })))
            .then(store.saveEdge)
        ))
    ))
}

/**
 * 1. read all comments w/o authorUserId
 * 2. map authorEid to user
 * 3. update comment
 */
const backfillCommentAuthorUserId = (): Promise<any[]> => {
  return chatModel.readCommentsBy({
    authorUserId: '',
  })
    .then(sf.list_fmap_wait(sf.maybe_fmap(
      (comment: Comment) => store.userByEid(_.get(comment, 'authorEid'))
        .then((user: User) => chatModel.updateCommentNoRead(comment.id, { authorUserId: _.get(user, 'id', '') })))
    ))
}

const createCommentReceiptsForComment = (comment: Comment): Promise<any[]> => {
  return store.chatRoomPlayerEids(models.mapCommentToChatRoomId(comment))
    .then(store.zipPlayerEidsWithUsers)
    .then(sf.list_fmap(_.partial(chatModel.mapCommentAndPlayerEidUserToCommentReceipt, comment as any)))
    .then(sf.list_fmap_wait(chatModel.createOrUpdateCommentReceipt))
}

/**
 * 1. read all comments
 * 2. create/update commentreceipts for all members of chat
 * 3. if user is AUTHOR of comment, set isRead/isReceived=true
 * 4. if SYSTEM MESSAGE is INVISIBLE to user, set isRead/isReceived=true
 * 
 * 5. read all comment receipts of type Read / Received
 * 6. update isRead/isReceived on corresponding new Receipt (match on commentId, sessionUserId)
 * 
 */
const backfillCommentReceipts = (): Promise<any[]> => {
  return chatModel.readCommentsBy({})
    .then(sf.list_fmap_wait(createCommentReceiptsForComment))
    .then(() => chatModel.readCommentReceiptsBy({ receiptType: Not(ReceiptType.Receipt) }))
    .then(sf.list_fmap_wait(
      (commentReceipt: CommentReceipt) => chatModel.updateCommentReceiptsBy(
        {
          commentId: commentReceipt.commentId,
          sessionUserId: commentReceipt.sessionUserId,
          receiptType: ReceiptType.Receipt,
        },
        _.extend(
          {},
          commentReceipt.receiptType == ReceiptType.Received
            ? { isReceived: true }
            : {}
          ,
          commentReceipt.receiptType == ReceiptType.Read
            ? { isRead: true }
            : {}

        )
      )
    ))
}

/**
 * POSTGRES: update comment_receipt set "isDismissed" = true where "receiptType" = 'Receipt';
 */
const backfillCommentReceiptsIsDismissed = (): Promise<any> => {
  return chatModel.updateCommentReceiptsBy(
    { receiptType: ReceiptType.Receipt },
    { isDismissed: true }
  )
}

/**
 * 1. read all chat rooms
 * 2. read all players+users in chat room
 * 3. read last non-system comment 
 * 4. update edge sort order
 */
const correctChatRoomEdgeOrder = (): Promise<any[]> => {
  return chatModel.readChatRoomsBy({})
    .then(sf.list_fmap_wait(
      (chatRoom: ChatRoom) => Bluebird.Promise.props({
        playerEidUsers: store.chatRoomPlayerEids(chatRoom.id, chatRoom)
          .then(store.zipPlayerEidsWithUsers)
        ,
        lastComment: chatModel.readCommentsBy({
          where: {
            collectionId: models.buildCollectionId('chatroom', chatRoom.id, 'comment'),
            type: NodeType.ChatRoomComment,
          },
          order: {
            createdAt: 'DESC',
          },
          take: 1,
        })
          .then(_.first),

      })
        .then(sf.thru_if(({ lastComment }) => !!!_.isNil(lastComment))(
          ({ playerEidUsers, lastComment }) => Promise.all(
            _.map(
              playerEidUsers,
              (playerEidUser: PlayerEidUser) => activityModel.readEdgeBy({
                thisEntityId: _.get(playerEidUser, 'user.id'),
                collectionId: chatRoom.id,
                edgeType: EdgeType.ChatRoom,
              })
                .then(sf.maybe_fmap(
                  (edge: Edge) => {
                    const lastCommentCreatedAt = moment(lastComment.createdAt).toISOString()
                    const edgeOrder = edge.order
                    logger.info('CONSISTENCY: correctChatRoomEdgeOrder: ', { chatRoomId: chatRoom.id, lastCommentCreatedAt, edgeOrder })
                    if (edgeOrder < lastCommentCreatedAt) {
                      return activityModel.updateEdge(edge.id, {
                        order: lastCommentCreatedAt,
                      })
                    } else {
                      return Promise.resolve()
                    }
                  }
                ))
            )
          )
        ))
    ))
}

/**
 * 1. read all chat rooms
 * 3. read last non-system comment 
 * 4. update ChatRoomPlayer edge sort order
 */
const backfillChatRoomPlayerEdgeOrder = (): Promise<any[]> => {
  return chatModel.readChatRoomsBy({})
    .then(sf.list_fmap_wait(
      (chatRoom: ChatRoom) => Bluebird.Promise.props({
        lastComment: chatModel.readCommentsBy({
          where: {
            collectionId: models.buildCollectionId('chatroom', chatRoom.id, 'comment'),
            type: NodeType.ChatRoomComment,
          },
          order: {
            createdAt: 'DESC',
          },
          take: 1,
        })
          .then(_.first),

      })
        .then(
          ({ lastComment }) => {
            const lastCommentCreatedAt = moment(_.get(lastComment, 'createdAt', chatRoom.createdAt)).toISOString()
            logger.info('CONSISTENCY: backfillChatRoomPlayerEdgeOrder: ', { chatRoomId: chatRoom.id, lastCommentCreatedAt })
            return activityModel.updateEdgesBy({
              collectionId: chatRoom.id,
              edgeType: EdgeType.ChatRoom,
              order: LessThan(lastCommentCreatedAt),
            }, {
              order: lastCommentCreatedAt,
            })
          }
        )
    ))
}

/**
 * Propagate UnObject.s3Key update from handlerUnObjects to their derived UnObjects.
 * 1. read all unobjects with handlerUnObjectId != null
 * 2. read handlerUnObjectId
 * 3. update s3Key if necessary
 */
const updateS3KeyForHandledUnObjects = (): Promise<any[]> => {
  return readUnObjectsBy({
    where: {
      handlerUnObjectId: Not(IsNull()),
      s3Key: IsNull(),
    },
  })
    .then(sf.list_fmap_wait(sf.maybe_fmap(
      (unObject: UnObject) => readUnObjectBy({
        id: unObject.handlerUnObjectId,
        s3Key: Not(IsNull()),
      })
        .then(sf.maybe_fmap(
          (handlerUnObject: UnObject) => updateUnObject(
            unObject.id,
            { s3Key: handlerUnObject.s3Key }
          )
        ))
        .catch(err => logger.error('ERROR: updateS3KeyForHandledUnObjects', { err, unObject }))
    )))
}

/**
 * 1. read all unobjects with handlerUnObjectId != null
 * 2. read handlerUnObjectId
 * 3. update backgroundColor if necessary
 */
const updateBackgroundColorForHandledUnObjects = (): Promise<any[]> => {
  return readUnObjectsBy({
    where: {
      handlerUnObjectId: Not(IsNull()),
      backgroundColor: IsNull(),
    },
  })
    .then(sf.list_fmap_wait(sf.maybe_fmap(
      (unObject: UnObject) => readUnObjectBy({
        id: unObject.handlerUnObjectId,
        backgroundColor: Not(IsNull()),
      })
        .then(sf.maybe_fmap(
          (handlerUnObject: UnObject) => updateUnObject(
            unObject.id,
            { backgroundColor: handlerUnObject.backgroundColor }
          )
        ))
        .catch(err => logger.error('ERROR: updateBackgroundColorForHandledUnObjects', { err, unObject }))
    )))
}

const createNewsfeedItemEdgesForUser = (newsfeedItems: NewsfeedItem[], user: User): Promise<any[]> => {
  return Promise.resolve(newsfeedItems)
    .then(sf.list_fmap_wait(
      (newsfeedItem: NewsfeedItem) => {
        const input: SaveEdgeInput = {
          ...models.mapEntityRefToThisEntityRef(user as any),
          ...models.mapEntityRefToThatEntityRef(newsfeedItem as any),
          edgeType: EdgeType.NewsfeedItem,
          order: moment(newsfeedItem.createdAt).toISOString(),
        }
        return Promise.resolve(input)
          .then(activityModel.mapSaveEdgeInputToEdge)
          .then(store.saveEdge)
      }
    ))
}

const createNewsfeedItemEdges = (): Promise<any[]> => {
  return readNewsfeedItemsBy({
    where: {
      metadata: Not(IsNull()),
      isDeleted: false,
    },
    order: {
      createdAt: 'DESC',
    },
    take: 20,
    cache: true,
  })
    .then(
      (newsfeedItems: NewsfeedItem[]) => userModel.readUsersBy({
        id: '3af78ab0-d0cf-4b3d-954d-cfe79b02001a',
      })
        .then(sf.list_fmap_wait(_.partial(createNewsfeedItemEdgesForUser, newsfeedItems)))
    )
}

const backfillTileThisEid = (): Promise<any[]> => {
  return activityModel.readTilesBy({
    thisEid: IsNull(),
  })
    .then(sf.list_fmap_wait(
      (tile: Tile) => store.mapCollectionIdToLastEntity(tile.collectionId)
        .then(sf.maybe_fmap(
          (entity: any) => ({
            thisEid: models.mapEntityToEid(entity),
            thisEntityId: entity.id,
            thisEntityType: entity.entityType,
          })
        ))
        .then(sf.maybe_fmap(_.partial(activityModel.updateTile, tile.id)))
    ))
}

/**
 * TODO: structure as a MONAD.  we are mapping a function over a resultset, 
 *       where the resultset is LARGE and needs to be PAGED thru.
 *       the MONAD handles the PAGING.  You basically define the Monad with
 *       the query it will use, and it adds the order/skip/take fields
 * @param applyFn 
 * @param page 
 */
const batchEffects = (applyFn: (Effect) => Promise<any>, page = 1): Promise<any> => {
  const pageSize = 100
  logger.info('batchEffects', { page })
  return activityModel.readEffectsBy({
    where: {
      thisEid: IsNull(),
    },
    order: {
      id: 'ASC',
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })
    .then(sf.list_fmap_wait(applyFn))
    .then(
      (results: any[]) => _.isEmpty(results)
        ? null
        : batchEffects(applyFn, page + 1)
    )
}

const backfillEffectThisEid = (): Promise<any> => {
  return batchEffects(
    (effect: Effect) => store.mapCollectionIdToLastEntity(effect.collectionId)
      .then(sf.maybe_fmap(
        (entity: any) => ({
          thisEid: models.mapEntityToEid(entity),
          thisEntityId: entity.id,
          thisEntityType: entity.entityType,
        })
      ))
      .then(sf.maybe_fmap(_.partial(activityModel.updateEffect, effect.id)))
  )
}

const deleteUnknownUserStates = (): Promise<any> => {
  const names = Object.keys(userStates)
  return activityModel.deleteFieldsBy({
    name: Not(In(names)),
    type: FieldType.HashStatusField,
  })
}

const deleteUnknownHashtributes = (): Promise<any> => {
  const names = Object.keys(hashtributes)
  return activityModel.deleteFieldsBy({
    name: Not(In(names)),
    type: FieldType.HashtributeField,
  })
}

const markMessagesReceivedAndRead = (): Promise<any> => {
  const beforeDate: Date = moment('2020-01-28T00:00:00.536Z').toDate()
  return chatModel.updateCommentReceiptsBy(
    {
      createdAt: LessThan(beforeDate),
    },
    // {
    //     where: [
    //         {
    //             isRead: false,
    //             createdAt: LessThan( beforeDate ),
    //         },
    //         {
    //             isReceived: false,
    //             createdAt: LessThan( beforeDate ),
    //         }
    //     ]
    // },
    {
      isRead: true,
      isReceived: true,
    }
  )
}

const markOwnCommentsRead = (): void => {
  // update "comment_receipt"
  // set "isRead" = true
  // where "id" in (
  // select "comment_receipt"."id" from "comment_receipt"
  // inner join "comment" on "comment"."id" = "comment_receipt"."commentId"
  // where "comment"."authorEid" = "comment_receipt"."playerEid"
  // and "isRead" = false
  // )
}

const saveSystemUsers = (): Promise<User[]> => {
  return promiseMap(Object.values(fakeUsers), (user) => (
    userModel.setPassword(user as User, user.password)
      .then(userModel.saveUser)
  ))
}

const softDeleteExpiredFields = (): Promise<any> => {
  return fieldModel.readFieldsBy({ expiresAt: LessThan(moment().toDate())})
    .then(fields => sft.promiseMap(fields, f => deleteField(f.id, f)))
}

export const load = (): Promise<any> => {
  logger.info('load: entry')
  return createConnectionsPromise
  // .then( backfillChatRoomEdges )
  // .then( backfillCommentAuthorUserId )
  // .then( backfillCommentReceipts )
  // .then( correctChatRoomEdgeOrder )
  // .then( backfillChatRoomPlayerEdgeOrder )

  // reimplement when we're dup'ing handlerUnObjects again.
  // .then( logger.traceFn( 'CONSISTENCY:updateS3KeyForHandledUnObjects', updateS3KeyForHandledUnObjects ) )
  // .then( logger.traceFn( 'CONSISTENCY:updateBackgroundColorForHandledUnObjects', updateBackgroundColorForHandledUnObjects ) )

    // TODO: .then( createNewsfeedItemEdges )
    // .then( logger.traceFn( 'CONSISTENCY:backfillTileThisEid', backfillTileThisEid ) )
    .then(logger.traceFn('CONSISTENCY:deleteUnknownUserStates', deleteUnknownUserStates))
    .then(logger.traceFn('CONSISTENCY:deleteUnknownHashtributes', deleteUnknownHashtributes))
    // .then(logger.traceFn('CONSISTENCY:deleteTiles', deleteTiles))
    // .then( logger.traceFn( 'CONSISTENCY:markMessagesReceivedAndRead', markMessagesReceivedAndRead ) )
    // .then( backfillEffectThisEid ) // Too many rows to bother with this.
    .then(logger.traceFn('CONSISTENCY:saveSystemUsers', saveSystemUsers))
    .then(logger.traceFn('CONSISTENCY:softDeleteExpiredFields', softDeleteExpiredFields))
    .then(sf.tap(() => logger.info('load: exit')))
    .catch(err => logger.error('ERROR: load', { err }))
}
