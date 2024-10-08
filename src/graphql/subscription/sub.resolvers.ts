/**
 * @rob4lderman
 * sep2019
 * 
 * new design:
 * - one db/firebase table for chats 
 * - one db/firebase table to map chat -> chat_members
 * - one firebase collection: chat_messages
 * - each chat message contains its chatId
 * - one firebase listener here on chat_messages
 * - one subscription API, using withFilter( chatId )
 * 
 * new new design:
 * - many firebase collections for chatUsers
 * - many firebase collections for chatMessages
 * - each chat message contains its chatId
 * - many firebase listeners here on all chatMessages/${chatId}
 *       
 * RN client items for friday
 * - CI/CD pipeline
 * - View components for every type of newsfeed card
 * - Newsfeed screen
 * - Object screen
 * - Auth screens: sign up, sign in, forgot password, reset password
 * - Chat screen
 * - apollo subscriptions
 * 
 */
import _ from 'lodash'
import { joi } from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import { redisPubSub } from 'src/services'
import {
  SubscriptionInput,
  ChannelInput,
  ChannelType,
  EntityType,
  ChannelOutput,
  SubscriptionChannelArgs,
  FeedItem,
} from 'src/gql-types'
import Joi from '@hapi/joi'
import { isNode } from 'src/graphql/models'

const logger = LoggerFactory('chat.resolvers')

const cleanSubscriptionInput = (input: any): any => {
  return {
    collectionId: _.trim(input.collectionId),
  }
}

const validateSubscriptionInput = (input: any): SubscriptionInput => {
  return joi.validate(
    input,
    Joi.object().keys({
      collectionId: Joi.string().required(),
    })
  ) as SubscriptionInput
}

const mapPayloadToOldSchoolModel = (payload: any, channel: any): any => {
  const isArray = Array.isArray(payload.pubsubArray)
  const entity = isArray ? payload.pubsubArray[0] : payload
  return {
    isArray,
    channel,
    snapshot: {
      id: entity.id,
      createTime: entity.createdAt,
      updateTime: isArray ? payload.updatedAt : entity.updatedAt,
      data: payload,
    },
    entityType: entity.entityType,
  }
}

const channelSubscription = {
  resolve: mapPayloadToOldSchoolModel,
  subscribe: (model, args: SubscriptionChannelArgs, ctx): any => {
    logger.info('channel_subscribe', { channelId: args.input.channelId, tokenId: ctx?.token?.id })
    const input: ChannelInput = joi.validate(cleanChannelInput(args.input), buildChannelInputSchema())
    return redisPubSub.asyncIterator(input.channelId)
  },
}

const collectionSubscription = {
  resolve: mapPayloadToOldSchoolModel,
  subscribe: (model, args, ctx, info): any => {
    logger.debug('collection_subscribe', { model, args, ctx, info })
    const input: SubscriptionInput = validateSubscriptionInput(cleanSubscriptionInput(args.input))
    return redisPubSub.asyncIterator(input.collectionId, 'collection')
  },
}

const onCreateActivitySubscription = {
  resolve: mapPayloadToOldSchoolModel,
  subscribe: (): any => {
    return redisPubSub.asyncIterator('activity', 'onCreateActivity')
  },
}

const onCreateEdgeSubscription = {
  resolve: mapPayloadToOldSchoolModel,
  subscribe: (): any => {
    return redisPubSub.asyncIterator('edge', 'onCreateEdge')
  },
}

const cleanChannelInput = (input: any): any => {
  return {
    channelId: _.trim(input.channelId),
    channelType: input.channelType,
  }
}

const buildChannelInputSchema = (): any => {
  return Joi.object().keys({
    channelId: Joi.string().required(),
    channelType: joi.buildEnumSchema(ChannelType).required(),
  })
}

/**
 * Authz user to the channelId.
 * e.g.:
 * channelId:"chatroom/495e2ac1-6958-4beb-8899-92153666c576/comment",
 * channelId:"chatroom/495e2ac1-6958-4beb-8899-92153666c576/field",
 * channelId:"chatroom/1495f245-9b63-48c2-b232-dbc7d0279b6e/local/3af78ab0-d0cf-4b3d-954d-cfe79b02001a/field",
 * channelId:"user/3af78ab0-d0cf-4b3d-954d-cfe79b02001a/field",
 * channelId:"me/blah"
 */
// const authzChannel_subscribe = (model, args, ctx): Promise<any> => {
//   return Promise.resolve(true)
//     // TODO: chatAuthz.authzMemberOfChat( userId, chatId )
//     .catch((err) => authz.authzMasterApiKeyOverride(err, ctx.apiKey))
// }

const resolveSnapshotDataAsEntityType = (entityType: EntityType) => (parent: ChannelOutput): any => {
  const entity: any = parent.snapshot.data
  return _.get(entity, 'entityType') == entityType
    ? entity
    : null
}

const resolveSnapshotDataArrayAsEntityType = (entityType: EntityType) => (parent: ChannelOutput): any => {
  if (parent.isArray) {
    const arr = _.get(parent, 'snapshot.data.pubsubArray')
    const entity: any = _.first(arr)
    return _.get(entity, 'entityType') == entityType
      ? arr
      : null
  } else {
    const entity: any = parent.snapshot.data
    return _.get(entity, 'entityType') == entityType
      ? [entity]
      : null
  }
}

const resolveSnapshotDataAsNodeType = (parent: ChannelOutput): any => {
  const entity: any = parent.snapshot.data
  return isNode(entity)
    ? entity
    : null
}

const resolveSnapshotDataArrayAsNodeType = (parent: ChannelOutput): any => {
  if (parent.isArray) {
    const arr = _.get(parent, 'snapshot.data.pubsubArray')
    const entity: any = _.first(arr)
    return isNode(entity)
      ? arr
      : null
  } else {
    const entity: any = parent.snapshot.data
    return isNode(entity)
      ? [entity]
      : null
  }
}

const feedItem = (parent: ChannelOutput): FeedItem => {
  const entity = parent.snapshot.data
  if (_.isNil(entity.dynamic)) {
    return null
  }
  return entity as FeedItem
}

//
// GraphQL schema resolver table.
//
export default {
  Subscription: {
    collection: collectionSubscription,
    onCreateActivity: onCreateActivitySubscription,
    onCreateEdge: onCreateEdgeSubscription,
    channel: channelSubscription,
  },
  ChannelOutput: {
    node: resolveSnapshotDataAsNodeType,
    asNode: resolveSnapshotDataAsNodeType,
    asNodes: resolveSnapshotDataArrayAsNodeType,
    field: resolveSnapshotDataAsEntityType(EntityType.Field),
    asField: resolveSnapshotDataAsEntityType(EntityType.Field),
    asFields: resolveSnapshotDataArrayAsEntityType(EntityType.Field),
    edge: resolveSnapshotDataAsEntityType(EntityType.Edge),
    asEdge: resolveSnapshotDataAsEntityType(EntityType.Edge),
    asEdges: resolveSnapshotDataArrayAsEntityType(EntityType.Edge),
    asFriendRequests: resolveSnapshotDataArrayAsEntityType(EntityType.FriendRequest),
    feedItem,
  },
}
