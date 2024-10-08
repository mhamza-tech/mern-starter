/**
 * @rob4lderman
 * nov2019
 */

import _ from 'lodash'
import {
  ChatRoom,
  CommentReceipt,
} from '../../db/entity'
import {
  RedisCache,
  CacheType,
} from '../../utils'
import { chompCollectionId, CommentReceiptCacheKey } from 'src/graphql/models'
import * as model from './chat.model'
import { safeIn } from 'src/db/utils'
import { EntityType } from 'src/gql-types'
import { promiseMap } from 'src/utils/sf.typed'

export const chatRoomByIdCache = new RedisCache<ChatRoom>({
  name: 'chatRoomByIdCache',
  type: CacheType.HashSet,
  buildKey: (): string => EntityType.ChatRoom,
  buildFullKey: (id: string): string => `${EntityType.ChatRoom}:${id}`,
  fetchFromDB: (ids: string[]): Promise<ChatRoom[]> =>
    model.readChatRoomsBy({
      id: safeIn(ids),
      isDeleted: false,
    }),
})

export const commentReceiptByIdCache = new RedisCache<CommentReceipt>({
  name: 'commentReceiptByIdCache',
  type: CacheType.HashSet,
  buildKey: (): string => EntityType.CommentReceipt,
  pickKey: (receipt: CommentReceipt): string => receipt.id,
  buildFullKey: (id: string): string => `${EntityType.CommentReceipt}:${id}`,
  fetchFromDB: (ids: string[]): Promise<CommentReceipt[]> =>
    model.readCommentReceiptsBy({
      id: safeIn(ids),
    }),
})

export const commentReceiptByCollectionIdCache = new RedisCache<any>({
  name: 'commentReceiptByCollectionIdCache',
  type: CacheType.Set,
  buildKey: (cr: CommentReceiptCacheKey): string => {
    const id = chompCollectionId(cr.collectionId)
    return `${EntityType.CommentReceipt}:${id}`
  },
  parseDBKey: (key: CommentReceiptCacheKey): any => {
    if (_.isNil(key.commentId)) {
      return { collectionId: key.collectionId, isDeleted: false }
    }
    return {
      collectionId: key.collectionId,
      commentId: key.commentId,
      isDeleted: false,
    }
  },
  buildFullKey: (cr: CommentReceiptCacheKey): string => {
    const id = chompCollectionId(cr.collectionId)
    const baseKey = `${EntityType.CommentReceipt}:${id}`
    if (!_.isNil(cr.commentId)) {
      return `${baseKey}:${cr.commentId}`
    }
    return baseKey
  },
  pickKey: (cr: CommentReceipt): CommentReceiptCacheKey => ({
    collectionId: cr.collectionId,
    commentId: cr.commentId,
  }),
  buildValue: (cr: CommentReceipt): string => `${cr.id}:${cr.commentId}`,
  parseValue: (value: string): CommentReceipt => {
    const [receiptId, commentId] = value.split(':')
    const receipt = new CommentReceipt()
    receipt.commentId = commentId
    receipt.id = receiptId
    return receipt
  },
  matchingValue: (cr: CommentReceiptCacheKey): string => {
    if (cr.commentId) {
      return `*:${cr.commentId}`
    }
    return '*'
  },
  fetchFromDB: (filters: any[], options = {}): Promise<CommentReceipt[]> =>
    model.readCommentReceiptsBy({ filters, ...options }),
  onSet: (receipts: CommentReceipt[]): Promise<CommentReceipt[]> =>
    promiseMap(receipts, cr => commentReceiptByIdCache.prime(cr))
  ,
})
