/**
 * @rob4lderman
 * oct2019
 */
import _ from 'lodash'
import {
  getConnection,
  Repository,
  LessThan,
  MoreThan,
  EntityManager,
} from 'typeorm'
import { TYPEORM_CONNECTION, DEFAULT_NPC_ID } from 'src/env'
import { LoggerFactory } from 'src/utils/logger'
import {
  CreateCommentInput,
  PageInput,
  CommentsInput,
  CreateChatRoomInput,
  SaveCommentReceiptInput,
  Player,
  SaveReceiptInput,
  PlayerEidUser,
  ReceiptType,
  NodeType,
  CommentsReceiptsInput,
  ChatRoomType,
} from 'src/gql-types'
import {
  Comment,
  ChatRoom,
  CommentReceipt,
  Receipt,
} from '../../db/entity'
import * as models from '../models'
import {
  sf,
  misc,
} from '../../utils'
import {
  cursorToDate,
  resolvePage,
} from '../pageInput'
import moment from 'moment'
import * as dbUtils from 'src/db/utils'
import { v4 } from 'uuid'

const logger = LoggerFactory('chat.model')
const DB_CONN_NAME = TYPEORM_CONNECTION

/**
 * @return Promise w/ repository
 */
let cachedCommentRepository: Repository<Comment> = null
export const getCommentRepository = (): Promise<Repository<Comment>> => {
  return !!!_.isNil(cachedCommentRepository)
    ? Promise.resolve(cachedCommentRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Comment))
      .then(sf.tap(repository => {
        cachedCommentRepository = repository
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedChatRoomRepository: Repository<ChatRoom> = null
export const getChatRoomRepository = (): Promise<Repository<ChatRoom>> => {
  return !!!_.isNil(cachedChatRoomRepository)
    ? Promise.resolve(cachedChatRoomRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(ChatRoom))
      .then(sf.tap(repository => {
        cachedChatRoomRepository = repository
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedCommentReceiptRepository: Repository<CommentReceipt> = null
export const getCommentReceiptRepository = (): Promise<Repository<CommentReceipt>> => {
  return !!!_.isNil(cachedCommentReceiptRepository)
    ? Promise.resolve(cachedCommentReceiptRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(CommentReceipt))
      .then(sf.tap(repository => {
        cachedCommentReceiptRepository = repository
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedReceiptRepository: Repository<Receipt> = null
export const getReceiptRepository = (): Promise<Repository<Receipt>> => {
  return !!!_.isNil(cachedReceiptRepository)
    ? Promise.resolve(cachedReceiptRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Receipt))
      .then(sf.tap(repository => {
        cachedReceiptRepository = repository
      }))
}

export const mapCreateCommentInputToComment = (ctx: any, input: CreateCommentInput): Comment => {
  const retMe = new Comment()
  retMe.id = v4()
  retMe.trackingId = _.get(ctx, 'trackingId')
  return _.extend(retMe, _.pick(input, [
    'type',
    'collectionId',
    'authorEid',
    'text',
    'replyToCommentId',
    'metadata',
    'optimisticId',
  ]))
}

export const saveComment = (comment: Comment): Promise<Comment> => {
  return getCommentRepository()
    .then(repo => repo.save(comment))
}

export const updateCommentNoRead = (commentId, set: object): Promise<any> => {
  return getCommentRepository()
    .then(sf.tap_wait(repo => repo.update(commentId, set)))
}

export const updateCommentsBy = (options: object, set: object): Promise<any> => {
  return getCommentRepository()
    .then(sf.tap_wait(repo => repo.update(options, set)))
}

export const readCommentById = (id: string): Promise<Comment> => {
  return getCommentRepository()
    .then(repo => repo.findOne(id))
}

export const readCommentBy = (fields: object): Promise<Comment> => {
  return getCommentRepository()
    .then(repo => repo.findOne(fields))
}

export const readCommentsBy = (options: object): Promise<Comment[]> => {
  return getCommentRepository()
    .then(repo => repo.find(options))
}

export const readMostRecentComment = (collectionId: string): Promise<Comment> => {
  return readCommentsBy({
    where: {
      collectionId,
      isDeleted: false,
    },
    order: {
      createdAt: 'DESC',
    },
    take: 1,
    cache: true,
  })
    .then(_.first)
}

export const DEFAULT_PAGE_SIZE = 10

/**
 * feed is in asc order. 
 */
export const readCommentsPageByCreatedAt = (commentsInput: CommentsInput): Promise<Comment[]> => {
  const epoch: Date = moment('2019-01-01T00:00:00.000Z').toDate()
  const pageInput: PageInput = _.get(commentsInput, 'pageInput', { last: DEFAULT_PAGE_SIZE, afterCursor: epoch.toISOString() })
  return resolvePage(pageInput, {
    firstAfter: () => readCommentsBy({
      where: _.extend(
        mapCommentsInputToCommentsWhere(commentsInput),
        { createdAt: MoreThan(misc.addMs(cursorToDate(pageInput.afterCursor, epoch))) },
        { isDeleted: false }
      ),
      order: {
        createdAt: 'ASC',
      },
      take: pageInput.first,
      cache: true,
    })
    ,
    firstBefore: () => readCommentsBy({
      where: _.extend(
        mapCommentsInputToCommentsWhere(commentsInput),
        { createdAt: LessThan(cursorToDate(pageInput.beforeCursor)) },
        { isDeleted: false }
      ),
      order: {
        createdAt: 'ASC',
      },
      take: pageInput.first,
      cache: true,
    })
    ,
    lastAfter: () => readCommentsBy({
      where: _.extend(
        mapCommentsInputToCommentsWhere(commentsInput),
        { createdAt: MoreThan(misc.addMs(cursorToDate(pageInput.afterCursor, epoch))) },
        { isDeleted: false }
      ),
      order: {
        createdAt: 'DESC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse)
    ,
    lastBefore: () => readCommentsBy({
      where: _.extend(
        mapCommentsInputToCommentsWhere(commentsInput),
        { createdAt: LessThan(cursorToDate(pageInput.beforeCursor)) },
        { isDeleted: false }
      ),
      order: {
        createdAt: 'DESC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse),

  })
}

const mapCommentsInputToCommentsWhere = (commentsInput: CommentsInput): any => {
  return _.pick(commentsInput, [
    'collectionId',
  ])
}

const buildChatRoomPlayerEidsCsv = (playerEids: string[]): string => {
  return _.join(_.sortBy(playerEids), ',')
}

export const mapCreateChatRoomInputToChatRoom = (input: CreateChatRoomInput): ChatRoom => {
  const { playerEids } = input
  const retMe = new ChatRoom()
  const [npcEids, userEids] = _.partition(playerEids, models.isUnObjectEid)
  const isDefaultNPC = models.mapEidToId(npcEids[0]) === DEFAULT_NPC_ID
  const isSingleUser = userEids.length === 1
  if (isDefaultNPC) {
    // TODO: other destinations too?
    retMe.type = isSingleUser ? ChatRoomType.PersonalPlayRoom : ChatRoomType.P2PChat
  } else if (isSingleUser) {
    retMe.type = ChatRoomType.SinglePlayRoom
  } else {
    retMe.type = ChatRoomType.MultiPlayRoom
  }
  retMe.playerEids = buildChatRoomPlayerEidsCsv(playerEids)
  return retMe
}

export const saveChatRoom = (chatRoom: ChatRoom): Promise<ChatRoom> => {
  return getChatRoomRepository()
    .then(repo => repo.save(chatRoom))
    .then(cr => readChatRoomBy({ id: cr.id }))
}

export const readChatRoomBy = (fields: object): Promise<ChatRoom> => {
  logger.debug('readChatRoomBy', { fields })
  return getChatRoomRepository()
    .then(repo => repo.findOne(fields))
}

export const readChatRoomsBy = (fields: object): Promise<ChatRoom[]> => {
  logger.debug('readChatRoomsBy', { fields })
  return getChatRoomRepository()
    .then(repo => repo.find(fields))
}

export const mapSaveCommentReceiptInputToCommentReceipt = (input: SaveCommentReceiptInput, sessionUserId: string, player: Player): CommentReceipt => {
  const retMe = new CommentReceipt()
  retMe.sessionUserId = sessionUserId
  retMe.playerEid = models.mapEntityToEid(player)
  retMe.receiptType = ReceiptType.Receipt
  switch (input.receiptType) {
    case ReceiptType.Received: retMe.isReceived = true; break
    case ReceiptType.Read: retMe.isRead = true; break
    case ReceiptType.Dismissed: retMe.isDismissed = true; break
    default: throw new Error(`Invalid receiptType: ${input.receiptType}; Must be Received, Read, or Dismissed`)
  }
  return _.extend(retMe, _.pick(input, [
    // 'receiptType',
    'collectionId',
    'commentId',
  ]))
}

export const isChatRoomSystemCommentVisibleToPlayerEid = (comment: Comment, playerEid: string): boolean => {
  const visibleToPlayerEids = _.get(comment, 'metadata.visibleToPlayerEids', [])
  const visibleToPlayerIds = _.get(comment, 'metadata.visibleToPlayerIds', [])
  if (_.isEmpty(visibleToPlayerEids) && _.isEmpty(visibleToPlayerIds)) {
    return true
  }
  if (!!!_.isEmpty(visibleToPlayerEids)) {
    return _.includes(visibleToPlayerEids, playerEid)
  }
  return _.includes(visibleToPlayerIds, models.mapEidToId(playerEid))
}

export const mapCommentAndPlayerEidUserToCommentReceipt = (comment: Comment, playerEidUser: PlayerEidUser): CommentReceipt => {
  const retMe = new CommentReceipt()
  retMe.sessionUserId = _.get(playerEidUser.user, 'id', '0')
  retMe.playerEid = playerEidUser.playerEid
  retMe.commentId = comment.id
  retMe.collectionId = comment.collectionId
  retMe.receiptType = ReceiptType.Receipt
  // mark player's own comments as read/received but NOT dismissed.
  if (playerEidUser.playerEid == comment.authorEid) {
    retMe.isRead = true
    retMe.isReceived = true
    retMe.isDismissed = false
  }
  // mark system comments that are INVISIBLE to the player as read/received/dismissed (to avoid including them in unread count).
  if (
    comment.type == NodeType.ChatRoomSystemComment
    && !!!isChatRoomSystemCommentVisibleToPlayerEid(comment, playerEidUser.playerEid)
  ) {
    retMe.isRead = true
    retMe.isReceived = true
    retMe.isDismissed = true
  }
  return retMe
}

export const readCommentReceiptBy = (options: object): Promise<CommentReceipt> => {
  return getCommentReceiptRepository()
    .then(repo => repo.findOne(options))
}

export const readCommentReceiptsBy = (options: object): Promise<CommentReceipt[]> => {
  return getCommentReceiptRepository()
    .then(repo => repo.find(options))
}

export const readReceiptsPageByUpdatedAt = (input: CommentsReceiptsInput): Promise<CommentReceipt[]> => {
  const { pageInput } = input
  let filters = { collectionId: input.collectionId }
  if (input.playerEids?.length > 0) {
    filters = Object.assign({}, filters, { playerEid: dbUtils.safeIn(input.playerEids) })
  }
  return resolvePage(pageInput, {
    firstAfter: () => readCommentReceiptsBy({
      where: {
        ...filters,
        updatedAt: MoreThan(misc.addMs(cursorToDate(pageInput.afterCursor))),
      },
      order: {
        updatedAt: 'ASC',
      },
      take: pageInput.first,
      cache: true,
    }),
    firstBefore: () => readCommentReceiptsBy({
      where: {
        ...filters,
        updatedAt: LessThan(cursorToDate(pageInput.beforeCursor)),
      },
      order: {
        updatedAt: 'ASC',
      },
      take: pageInput.first,
      cache: true,
    }),
    lastAfter: () => readCommentReceiptsBy({
      where: {
        ...filters,
        updatedAt: MoreThan(misc.addMs(cursorToDate(pageInput.afterCursor))),
      },
      order: {
        updatedAt: 'DESC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse),
    lastBefore: () => readCommentReceiptsBy({
      where: {
        ...filters,
        updatedAt: LessThan(cursorToDate(pageInput.beforeCursor)),
      },
      order: {
        updatedAt: 'DESC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse),
  })
}

export const createOrReadCommentReceipt = (commentReceipt: CommentReceipt): Promise<any> => {
  return saveCommentReceipt(commentReceipt)
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err))(
      err => readCommentReceiptBy(_.pick(commentReceipt, ['commentId', 'sessionUserId', 'receiptType']))
        .then(sf.thru_if(_.isNil)(
          () => {
            throw err
          }
        ))
    )(
      err => {
        throw err
      }
    ))
}

export const createOrUpdateCommentReceipt = (commentReceipt: CommentReceipt): Promise<any> => {
  return saveCommentReceipt(commentReceipt)
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err))(
      err => readCommentReceiptBy(_.pick(commentReceipt, ['commentId', 'sessionUserId', 'receiptType']))
        .then(sf.thru_if(_.isNil)(
          () => {
            throw err
          }
        ))
        // Note: had to use repo.update instead of repo.save cuz I was
        // getting weird TypeError: cannot convert object to primitive otherwise,
        // on the metadata field.  No clue as to why the initial save w/ metadata 
        // works but a subsequent save does not.
        .then((commentReceiptRecord: CommentReceipt) => updateCommentReceipt(
          commentReceiptRecord.id,
          misc.toPlainObjectRecursive(_.omit(commentReceipt, 'id'))
        ))
    )(
      err => {
        throw err
      }
    ))
}

const updateCommentReceipt = (id: string, set: object): Promise<any> => {
  return getCommentReceiptRepository()
    .then(sf.tap_wait(repo => repo.update(id, set)))
    .then(repo => repo.findOne(id))
}

export const updateCommentReceiptsBy = (options: object, set: object): Promise<any> => {
  return getCommentReceiptRepository()
    .then(sf.tap_wait(repo => repo.update(options, set)))
}

export const saveCommentReceipt = (commentReceipt: CommentReceipt): Promise<CommentReceipt> => {
  return getCommentReceiptRepository()
    .then(repo => repo.save(commentReceipt))
}

export const mapSaveReceiptInputToReceipt = (input: SaveReceiptInput, sessionUserId: string, player: Player): Receipt => {
  const retMe = new Receipt()
  retMe.sessionUserId = sessionUserId
  retMe.playerEid = models.mapEntityToEid(player)
  return _.extend(retMe, _.pick(input, [
    'type',
    'entityCollectionId',
    'entityEid',
  ]))
}

export const readReceiptBy = (options: object): Promise<Receipt> => {
  return getReceiptRepository()
    .then(repo => repo.findOne(options))
}

export const readReceiptsBy = (options: object): Promise<Receipt[]> => {
  return getReceiptRepository()
    .then(repo => repo.find(options))
}

export const createOrReadReceipt = (commentReceipt: Receipt): Promise<any> => {
  return saveReceipt(commentReceipt)
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err))(
      err => readReceiptBy(_.pick(commentReceipt, ['entityEid', 'sessionUserId', 'type']))
        .then(sf.thru_if(_.isNil)(
          () => {
            throw err
          }
        ))
    )(
      err => {
        throw err
      }
    ))
}

export const saveReceipt = (receipt: Receipt): Promise<Receipt> => {
  return getReceiptRepository()
    .then(repo => repo.save(receipt))
}

export const countComments = (collectionId: string): Promise<number> => {
  const manager: EntityManager = getConnection(DB_CONN_NAME).manager
  return manager.query(
    'select count(*) as cnt'
    + ' from "comment"'
    + ` where "comment"."collectionId" = '${collectionId}' `
    + ' and "comment"."isDeleted" = false '
  )
    .then((raw: any) => _.defaultTo(_.get(_.first(raw), 'cnt'), 0))
}

export const countUnReadCommentsForCollection = (collectionId: string, userId: string): Promise<number> => {
  const manager: EntityManager = getConnection(DB_CONN_NAME).manager
  return manager.query(
    'select count(*) as cnt'
    + ' from "comment_receipt"'
    + ' where "comment_receipt"."receiptType" = \'Receipt\' '
    + ` and "comment_receipt"."collectionId" = '${collectionId}' `
    + ` and "comment_receipt"."sessionUserId" = '${userId}'`
    + ' and "comment_receipt"."isRead" = false '
  )
    .then((raw: any) => _.defaultTo(_.get(_.first(raw), 'cnt'), 0))
    .then(_.toNumber)
}
