/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @rob4lderman
 * sep2019
 *
 */
import _ from 'lodash'
import {
  combineResolvers,
  skip,
} from 'graphql-resolvers'
import {
  sf,
  sft,
  jwt,
  misc,
} from 'src/utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  User,
  ChatRoom,
  Player,
  Edge,
  UnObject,
  Comment,
  ActionX,
  Effect,
  Tile,
} from '../../db/entity'
import { safeIn } from 'src/db/utils'
import {
  CreateCommentInput,
  EdgeType,
  CreateEdgeInput,
  EntityType,
  CreateChatRoomInput,
  CreateChatRoomOutput,
  CommentsOutput,
  CreateChatRoomCommentInput,
  CreateChatRoomCommentOutput,
  Channel,
  ChannelType,
  SaveFieldOutput,
  SaveFieldInput,
  SaveMyChatRoomLocalFieldInput,
  NodeType,
  FieldType,
  SubmitActionInput,
  SubmitActionOutput,
  SubmitChatRoomActionInput,
  ChatRoomInput,
  EnterChatRoomInput,
  EnterChatRoomOutput,
  ActionsOutput,
  EntityRef,
  EffectsOutput,
  EffectsInput,
  CompletedActionType,
  CompletedActionsOutput,
  CompletedAction,
  SaveIsTypingFieldInput,
  CreateNewsfeedItemCommentInput,
  CreateNewsfeedItemCommentOutput,
  TilesOutput,
  SaveEdgeInput,
  EdgesInput,
  ActionXEdgesField,
  ChatRoomStatus,
  EntityScope,
  BeforeEnterChatRoomOutput,
  FieldsOutput,
  ChatRoomType,
  MutationCreateChatRoomArgs,
} from 'src/gql-types'
import * as authz from './chat.authz'
import * as userAuthz from '../User/user.authz'
import * as model from './chat.model'
import * as core from '../core'
import * as store from '../store'
import * as activityModel from '../Activity/activity.model'
import * as eventModel from '../Activity/event.model'
import * as joi from '../joi'
import * as chatActions from './chat.actions'
import {
  ChatRoomActionContext,
  ChatRoomActionContextApi,
} from 'src/types'
import * as models from 'src/graphql/models'
import Bluebird from 'bluebird' // for Promise.props
import moment from 'moment'
import * as actionRouter from '../../enginev3/router'
import { RouteInput } from 'src/enginev3/types'
import { ChatRoomActionContextApiFactory } from 'src/maker/api/ChatRoomActionContextApi'
import Joi from '@hapi/joi'
import {
  mapAndAuthzCallerToPlayer,
  mapAndAuthzSessionUserToPlayer,
} from './chat.authz'
import {
  buildCompletedAction,
  saveCompletedAction,
  readCompletedActionsBy,
  readMostRecentCompletedAction,
} from 'src/graphql/Action/actionx.model'
import { events } from 'src/events'
import { DEFAULT_NPC_ID } from 'src/env'

const logger = LoggerFactory('chat.resolvers', 'ChatResolvers')

const buildCreateChatRoomInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    playerEids: Joi.array().items(joi.buildEidSchema()).min(1).max(32).required(),
  })
}

export const chatRoomSaveEdgeInput = (chatRoom: ChatRoom, edge: models.EdgeConnection): SaveEdgeInput => ({
  thisEntityId: edge.this.id,
  thisEntityType: edge.this.entityType,
  thatEntityId: edge.that.id,
  thatEntityType: edge.that.entityType,
  edgeType: EdgeType.ChatRoom,
  collectionId: chatRoom.id,
  collectionName: chatRoom.type,
  order: chatRoom.updatedAt.toISOString(),
  updatedAt: chatRoom.updatedAt,
})

const createChatRoomEdges = (chatRoom: ChatRoom, playerEids: string[]): Promise<ChatRoom> => {
  if (chatRoom.type === ChatRoomType.PersonalPlayRoom) {
    return Promise.resolve(chatRoom)
  }

  return Promise.resolve(models.mapPlayerEidsToEdgeConnections(playerEids))
    .then(edges => edges.map(edge => chatRoomSaveEdgeInput(chatRoom, edge)))
    .then(core.saveEdges)
    .then(() => chatRoom)
}

const assertChatRoomPlayersExist = (playerEids: string[]): Promise<any> => {
  return Promise.resolve(playerEids)
    .then(sf.list_fmap_wait(
      (playerEid: string) => store.entityByEid(playerEid)
        .then(sf.thru_if(_.isNil)(
          () => {
            throw new Error(`Player with eid ${playerEid} does not exist`)
          }
        ))
    ))
}

export const createChatRoom = (root, args: MutationCreateChatRoomArgs, ctx): Promise<CreateChatRoomOutput> => {
  const sessionUser: User = ctx.user
  const input = joi.validate(args.input, buildCreateChatRoomInputSchema()) as CreateChatRoomInput
  input.playerEids = _.uniq([...input.playerEids, sessionUser.eid])

  let unObjectEid = input.playerEids.find(models.isUnObjectEid)
  if (!unObjectEid) {
    unObjectEid = models.buildEid(EntityType.UnObject, DEFAULT_NPC_ID)
    input.playerEids.push(unObjectEid)
  }

  return store.entityByEid<UnObject>(unObjectEid)
    .then(unObject => _.isNil(unObject)
      ? Promise.reject(new Error(`NPC with eid, ${unObjectEid}, not found`))
      : unObject
    )
    .then(unObject => {
      const numUsers = input.playerEids.filter(models.isUserEid).length
      if (numUsers < unObject.minOccupancy || numUsers > unObject.maxOccupancy) {
        return Promise.reject(`${numUsers} is less or more than the allowed users in this room.`)
      }
      return model.mapCreateChatRoomInputToChatRoom(input)
    })
    // check if chat room exists, by playerEids
    // if does not exist then create a new one
    .then(chatRoom => model.readChatRoomBy({ playerEids: chatRoom.playerEids, isDeleted: false })
      .then(existingChatRoom => !_.isNil(existingChatRoom)
        ? existingChatRoom
        : assertChatRoomPlayersExist(input.playerEids)
          .then(() => store.saveChatRoom(chatRoom))
      )
    )
    .then(chatRoom => createChatRoomEdges(chatRoom, input.playerEids))
    .then(chatRoom => ({ chatRoom }))
    .catch(sf.tap_throw(err => logger.error('ERROR: createChatRoom', { userId: sessionUser.id, input, err })))
}

const authzSessionUserIsChatRoomPlayerOrHandler = (chatRoom: ChatRoom, args, ctx, info): Promise<any> => {
  const sessionUser: User = ctx.user
  return authz.authzUserIdIsChatRoomPlayerOrHandler(sessionUser.id, chatRoom.id)
    .catch((err) => authz.authzMasterApiKeyOverride(err, ctx.apiKey))
    .then(() => skip)
}

const buildChatRoomInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    chatRoomId: Joi.string().required(),
  })
}

const authzChatRoom = (query, args, ctx, info): Promise<any> => {
  const sessionUser: User = ctx.user
  const input: ChatRoomInput = joi.validate(args.input, buildChatRoomInputSchema())
  return authz.authzUserIdIsChatRoomPlayerOrHandler(sessionUser.id, input.chatRoomId)
    .catch((err) => authz.authzMasterApiKeyOverride(err, ctx.apiKey))
    .then(() => skip)
}

const resolveChatRoom = (query, args): Promise<any> => {
  const input: ChatRoomInput = joi.validate(args.input, buildChatRoomInputSchema())
  return store.chatRoomById(input.chatRoomId)
    .then(chatRoom => ({ chatRoom }))
}

const chatRoomComments = (chatRoom: ChatRoom, args, ctx): Promise<CommentsOutput> => {
  return core.comments(
    _.extend(
      {},
      args.input,
      { collectionId: `chatroom/${chatRoom.id}/comment` }
    )
  )
}

const mapCreateChatRoomCommentInputToCreateCommentInput = (input: CreateChatRoomCommentInput, player: any): CreateCommentInput => {
  return {
    type: NodeType.ChatRoomComment,
    collectionId: models.buildCollectionId('chatroom', input.chatRoomId, 'comment'),
    authorEid: models.mapEntityToEid(player),
    text: input.text,
    replyToCommentId: input.replyToCommentId,
    optimisticId: input.optimisticId,
  }
}

const authzCreateNewsfeedItemComment = (root, args, ctx): Promise<any> => {
  return mapAndAuthzCallerToPlayer(root, args, ctx)
    // TODO: .then( (player:Player) => authz.authzPlayerToNewsfeedItem )
    .catch((err) => authz.authzMasterApiKeyOverride(err, ctx.apiKey))
    .then(() => skip)
}

const mapCreateNewsfeedItemCommentInputToCreateCommentInput = (input: CreateNewsfeedItemCommentInput, player: any): CreateCommentInput => {
  return {
    type: NodeType.NewsfeedItemComment,
    collectionId: models.buildCollectionId('newsfeeditem', input.newsfeedItemId, 'comment'),
    authorEid: models.mapEntityToEid(player),
    text: input.text,
    replyToCommentId: input.replyToCommentId,
    optimisticId: input.optimisticId,
  }
}

const mapCommentToNotificationInterestSaveEdgeInput = (sessionUser: User, comment: Comment): SaveEdgeInput => ({
  thisEntityId: sessionUser.id,
  thisEntityType: sessionUser.entityType,
  thatEntityId: models.mapCommentToNewsfeedItemId(comment),
  thatEntityType: EntityType.NewsfeedItem,
  edgeType: EdgeType.Interest,
})

const createNewsfeedItemComment = (root, args, ctx): Promise<CreateNewsfeedItemCommentOutput> => {
  const sessionUser: User = ctx.user
  const input: CreateNewsfeedItemCommentInput = joi.validate(args.input, joi.buildCreateNewsfeedItemCommentInputSchema())
  return mapAndAuthzCallerToPlayer(root, args, ctx)
    .then((player: Player) => mapCreateNewsfeedItemCommentInputToCreateCommentInput(input, player))
    .then((input: CreateCommentInput) => core.createComment(root, { input }, ctx) as any as Promise<CreateNewsfeedItemCommentOutput>)
    .then(sf.tap_catch(
      (output: CreateNewsfeedItemCommentOutput) => Promise.resolve(
        mapCommentToNotificationInterestSaveEdgeInput(sessionUser, output.comment as Comment)
      )
        .then(core.saveEdge)
    ))
    // TODO: invoke onComment handler api ??
    .catch(sf.tap_throw(err => logger.error('createNewsfeedItemComment', { err, input })))
}

const authzSessionUserToChatRoomIdAsUnObjectId = (root, args, ctx): Promise<any> => {
  const chatRoomId = args.id || args.input.chatRoomId
  return mapAndAuthzCallerToPlayer(root, args, ctx)
    .then(player => authz.authzPlayerIdIsChatRoomPlayer(player.id, chatRoomId))
    .catch((err) => authz.authzMasterApiKeyOverride(err, ctx.apiKey))
    .then(() => skip)
}

const authzChatRoomAction = (root, args, ctx): Promise<any> => {
  const chatRoomId = args.id || args.input.chatRoomId
  return mapAndAuthzCallerToPlayer(root, args, ctx)
    .then(player => authz.authzPlayerIdIsChatRoomPlayer(player.id, chatRoomId))
    .then(() => authz.authzChatRoomIsNotDeleted(chatRoomId))
    .catch((err) => authz.authzMasterApiKeyOverride(err, ctx.apiKey))
    .then(() => skip)
}

const createChatRoomComment = (root, args, ctx): Promise<CreateChatRoomCommentOutput> => {
  const input: CreateChatRoomCommentInput = joi.validate(args.input, joi.buildCreateChatRoomCommentInputSchema()) as CreateChatRoomCommentInput
  const chatRoomId = input.chatRoomId
  return mapAndAuthzCallerToPlayer(root, args, ctx)
    .then((player: Player) => mapCreateChatRoomCommentInputToCreateCommentInput(input, player))
    .then((input: CreateCommentInput) => core.createComment(root, { input }, ctx) as any as Promise<CreateChatRoomCommentOutput>)
    .then(sf.tap_catch(() => core.updateChatRoomOrder(chatRoomId)))
    // invoke chat room onComment handler api.
    .then(sf.tap_catch(
      () => chatActions.invokeOnComment(input, ctx)
        .then(sf.tap_catch(() => buildAndSaveChatRoomStatus(chatRoomId, ctx)))
    ))
    .catch(sf.tap_throw(err => logger.error('createChatRoomComment', { err, input })))
}

const buildEnterChatRoomInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    chatRoomId: Joi.string().required(),
    asUnObjectId: Joi.string().allow('', null),
  })
}

const beforeEnterChatRoom = (root, args, ctx): Promise<BeforeEnterChatRoomOutput> => {
  const input: EnterChatRoomInput = joi.validate(args.input, buildEnterChatRoomInputSchema())
  return chatActions.invokeOnBeforeEnter(input, ctx)
}

const enterChatRoom = (root, args, ctx): Promise<EnterChatRoomOutput> => {
  const input: EnterChatRoomInput = joi.validate(args.input, buildEnterChatRoomInputSchema())
  return chatActions.invokeOnEnter(input, ctx)
    .then(sf.tap(
      () => {
        return store.chatRoomById(input.chatRoomId)
          .then(chatRoom => chatRoom.type !== ChatRoomType.SinglePlayRoom
            ? chatRoom
            : core.updateChatRoomOrder(chatRoom.id, chatRoom)
          )
      }
    ))
    .then(result => ({ result }))
}

const exitChatRoom = (root, args, ctx): Promise<EnterChatRoomOutput> => {
  const input: EnterChatRoomInput = joi.validate(args.input, buildEnterChatRoomInputSchema())
  return chatActions.invokeOnExit(input, ctx)
    .then(result => ({ result }))
}

const buildChatRoomChannels = (chatRoomId: string): Channel[] => {
  return [
    // NEW
    {
      name: 'chatRoomPublicChannel',
      entityType: null,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'public'),
      channelType: ChannelType.Collection,
    },
    {
      // local fields attached to the player
      name: 'chatRoomScopeChatRoomPrivateChannel',
      entityType: null,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'chatroom', chatRoomId, 'private'),
      channelType: ChannelType.Collection,
    },

    {
      name: 'comments',
      entityType: EntityType.Comment,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'comment'),
      channelType: ChannelType.Collection,
    },
    {
      name: 'commentReceipts',
      entityType: EntityType.CommentReceipt,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'commentreceipt'),
      channelType: ChannelType.Collection,
    },
    {
      name: 'receipts',
      entityType: EntityType.Receipt,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'receipt'),
      channelType: ChannelType.Collection,
    },
    {
      // public, global effects on the chatroom
      name: 'effects',
      entityType: EntityType.Effect,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'effect'),
      channelType: ChannelType.Collection,
    },
    {
      // public, global fields on the chatroom
      name: 'fields',
      entityType: EntityType.Field,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'field'),
      channelType: ChannelType.Collection,
    },
    {
      // public, global edges on the chatroom
      name: 'edges',
      entityType: EntityType.Edge,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'edge'),
      channelType: ChannelType.Collection,
    },
    {
      // public, global edges on the chatroom
      name: 'tiles',
      entityType: EntityType.Tile,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'tile'),
      channelType: ChannelType.Collection,
    },
  ]
}

const mapPlayerToChatRoomPlayerChannels = (chatRoomId: string, sessionUser: User, player: Player): Promise<Channel[]> => {
  return core.isPlayerEntityHandledByThisUser(player as any as EntityRef, sessionUser)
    .then((isMe: boolean) => isMe
      ? mapPlayerToMyChatRoomPlayerChannels(chatRoomId, player)
      : mapPlayerToPartnerChatRoomPlayerChannels(chatRoomId, player)
    )
}

const mapPlayerToMyChatRoomPlayerChannels = (chatRoomId: string, player: Player): Channel[] => {
  if (_.isEmpty(player)) {
    return []
  }
  return [
    {
      // local fields attached to the player
      name: 'chatRoomScopeMyPrivateChannel',
      entityType: null,
      channelId: models.buildCollectionId('chatroom', chatRoomId, player.entityType, player.id, 'private'),
      channelType: ChannelType.Collection,
    },
    {
      // local fields attached to the player
      name: 'playerFieldsLocal',
      entityType: EntityType.Field,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'local', player.id, 'field'),
      channelType: ChannelType.Collection,
    },
    {
      // global fields attached to the player
      name: 'playerFieldsGlobal',
      entityType: EntityType.Field,
      channelId: models.buildCollectionId(models.mapEntityToEid(player), 'field'),
      channelType: ChannelType.Collection,
    },
    {
      // local edges (actions) attached to the player
      name: 'playerEdgesLocal',
      entityType: EntityType.Edge,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'local', player.id, 'edge'),
      channelType: ChannelType.Collection,
    },
    {
      // global edges (actions) attached to the player
      name: 'playerEdgesGlobal',
      entityType: EntityType.Edge,
      channelId: models.buildCollectionId(models.mapEntityToEid(player), 'edge'),
      channelType: ChannelType.Collection,
    },
    {
      // public, local effects attached to the player
      // public: visible to other players
      // local: visible in only this chat room
      // TODO: the sessionUser doesn't need to subscribe to this channel
      //       UNLESS we decide to show the effects on their own avatar in the chatroom
      name: 'playerEffectsLocal',
      entityType: EntityType.Effect,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'local', player.id, 'effect'),
      channelType: ChannelType.Collection,
    },
    {
      // public, global effects attached to the player
      // public: visible to other players
      // global: visible in every chat room
      // TODO: the sessionUser doesn't need to subscribe to this channel
      //       UNLESS we decide to show the effects on their own avatar in the chatroom
      name: 'playerEffectsGlobal',
      entityType: EntityType.Effect,
      channelId: models.buildCollectionId(models.mapEntityToEid(player), 'effect'),
      channelType: ChannelType.Collection,
    },
    {
      // private, local effects attached to the player
      // private: visible to only this player
      // local: visible in only this chat room
      name: 'playerEffectsPrivateLocal',
      entityType: EntityType.Effect,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'local', player.id, 'privateeffect'),
      channelType: ChannelType.Collection,
    },
    {
      // private, global effects attached to the player
      // private: visible to only this player
      // global: visible in every chat room
      name: 'playerEffectsPrivateGlobal',
      entityType: EntityType.Effect,
      channelId: models.buildCollectionId(models.mapEntityToEid(player), 'privateeffect'),
      channelType: ChannelType.Collection,
    },
    {
      name: 'playerTilesLocal',
      entityType: EntityType.Tile,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'local', player.id, 'tile'),
      channelType: ChannelType.Collection,
    },
    {
      name: 'playerTilesGlobal',
      entityType: EntityType.Tile,
      channelId: models.buildCollectionId(models.mapEntityToEid(player), 'tile'),
      channelType: ChannelType.Collection,
    },
  ]
}

const mapPlayerToPartnerChatRoomPlayerChannels = (chatRoomId: string, player: Player): Channel[] => {
  if (_.isEmpty(player)) {
    return []
  }
  return [
    // NEW
    {
      name: 'playerPublicChannel',
      entityType: null,
      channelId: models.buildCollectionId(player.entityType, player.id, 'public'),
      channelType: ChannelType.Collection,
    },
    {
      // local fields attached to the player
      name: 'playerFieldsLocal',
      entityType: EntityType.Field,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'local', player.id, 'field'),
      channelType: ChannelType.Collection,
    },
    {
      // global fields attached to the player
      name: 'playerFieldsGlobal',
      entityType: EntityType.Field,
      channelId: models.buildCollectionId(models.mapEntityToEid(player), 'field'),
      channelType: ChannelType.Collection,
    },
    {
      // public, local effects attached to the player
      // public: visible to other players (including sessionUser)
      // local: visible in this chat room
      name: 'playerEffectsLocal',
      entityType: EntityType.Effect,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'local', player.id, 'effect'),
      channelType: ChannelType.Collection,
    },
    {
      // public, global effects attached to the player
      // public: visible to other players (including sessionUser)
      // global: visible in every chat room
      name: 'playerEffectsGlobal',
      entityType: EntityType.Effect,
      channelId: models.buildCollectionId(models.mapEntityToEid(player), 'effect'),
      channelType: ChannelType.Collection,
    },
    {
      name: 'playerTilesLocal',
      entityType: EntityType.Tile,
      channelId: models.buildCollectionId('chatroom', chatRoomId, 'local', player.id, 'tile'),
      channelType: ChannelType.Collection,
    },
    {
      name: 'playerTilesGlobal',
      entityType: EntityType.Tile,
      channelId: models.buildCollectionId(models.mapEntityToEid(player), 'tile'),
      channelType: ChannelType.Collection,
    },
  ]
}

const channelIsMyChannel = (channel: Channel, args, ctx): Promise<boolean> => {
  const sessionUser: User = ctx.user
  const eid: string[] = _.takeRight(
    _.split(models.chompCollectionId(_.get(channel, 'channelId')), '/'),
    2
  )
  if (_.first(eid) == 'local') {
    return store.mapLocalIdToPlayer(_.last(eid))
      .then(sf.maybe_fmap(store.mapPlayerToUser))
      .then((user: User) => _.get(user, 'id') == sessionUser.id)
  } else {
    return store.userByEid(_.join(eid, '/'))
      .then((user: User) => _.get(user, 'id') == sessionUser.id)
  }
}

/**
 *
 * 1. chat room comments
 * 2. chat room fields
 * 3. chat room animations ?
 * 4. player global fields
 * 5. player local fields (w/in chatroom context)
 *
 * @return list of channels
 */
const chatRoomChannels = (chatRoom: ChatRoom, args, ctx): Promise<Channel[]> => {
  const sessionUser: User = ctx.user
  const chatRoomId: string = chatRoom.id
  return store.chatRoomPlayers(chatRoomId)
    .then(players => Promise.all(players.map(player =>
      mapPlayerToChatRoomPlayerChannels(chatRoomId, sessionUser, player)))
    )
    .then(channels => channels.flat())
    .then(channels => channels.concat(buildChatRoomChannels(chatRoomId)))
}

const buildSaveMyChatRoomLocalFieldInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    chatRoomId: Joi.string().required(),
    type: joi.buildEnumSchema(FieldType).required(),
    name: Joi.string().required(),
    metadata: Joi.object(),
    asUnObjectId: Joi.string().allow('', null),
  })
}

const authzSaveMyChatRoomLocalField = authzSessionUserToChatRoomIdAsUnObjectId

const mapSaveMyChatRoomLocalFieldInputPlayerToSaveFieldInput = (input: SaveMyChatRoomLocalFieldInput, player: Player): SaveFieldInput => ({
  collectionId: models.buildCollectionId('chatroom', input.chatRoomId, 'local', player.id, 'field'),
  scope: EntityScope.ChatRoomScope,
  thisEntityId: player.id,
  thisEntityType: player.entityType,
  type: input.type,
  name: input.name,
  metadata: input.metadata,
})

const saveMyChatRoomLocalField = (root, args, ctx): Promise<SaveFieldOutput> => {
  const input: SaveMyChatRoomLocalFieldInput = joi.validate(args.input, buildSaveMyChatRoomLocalFieldInputSchema())
  return mapAndAuthzCallerToPlayer(root, args, ctx)
    .then(_.partial(mapSaveMyChatRoomLocalFieldInputPlayerToSaveFieldInput, input))
    .then(input => core.saveField(root, { input }, ctx))
}

const authzSaveIsTypingField = authzSessionUserToChatRoomIdAsUnObjectId

const buildSaveIsTypingFieldInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    chatRoomId: Joi.string().required(),
    isTyping: Joi.boolean().required(),
    asUnObjectId: Joi.string().allow('', null),
  })
}

const mapSaveIsTypingFieldInputPlayerToSaveFieldInput = (input: SaveIsTypingFieldInput, player: Player): SaveFieldInput => ({
  collectionId: models.buildCollectionId('chatroom', input.chatRoomId, 'local', player.id, 'field'),
  scope: EntityScope.ChatRoomScope,
  thisEntityId: player.id,
  thisEntityType: player.entityType,
  type: FieldType.BooleanField,
  name: 'isTyping',
  metadata: {
    booleanValue: input.isTyping,
  },
})

const saveIsTypingField = (root, args, ctx): Promise<SaveFieldOutput> => {
  const input: SaveIsTypingFieldInput = joi.validate(args.input, buildSaveIsTypingFieldInputSchema())
  return mapAndAuthzCallerToPlayer(root, args, ctx)
    .then(_.partial(mapSaveIsTypingFieldInputPlayerToSaveFieldInput, input))
    .then(input => core.saveField(root, { input }, ctx))
}

const buildRouteInput = (input: SubmitActionInput, unObject: UnObject): RouteInput => ({
  name: input.name,
  tags: input.tags,
  unObjectId: _.get(unObject, 'id'),
  handlerUnObjectId: _.get(unObject, 'handlerUnObjectId'),
})

const buildRouteInput2 = (input: SubmitActionInput, contextApi: ChatRoomActionContextApi): RouteInput => {
  const unObject = contextApi.getUnObject().getNode()
  const partner = contextApi.getPartner().getNode()
  if (models.isUnObject(unObject)) {
    return buildRouteInput(input, unObject)
  } else if (models.isUser(partner)) {
    return {
      name: input.name,
      tags: input.tags,
      unObjectId: DEFAULT_NPC_ID,
      username: partner.username,
    }
  } else {
    throw new Error(`ERROR: buildRouteInput: unknown partner type: ${_.get(partner, 'entityType')}`)
  }
}

export const submitChatRoomAction = (root, args, ctx): Promise<SubmitActionOutput> => {
  const input: SubmitChatRoomActionInput = joi.validate(args.input, joi.buildSubmitChatRoomActionInputSchema())
  const chatRoomId: string = input.chatRoomId
  const sessionUser: User = ctx.user
  const trackingId = _.get(ctx, 'trackingId')
  // Getting it through to the end of the promise chain would be a nightmare
  let contextApi: ChatRoomActionContextApi

  return logger.traceFn('buildChatRoomActionContext', () => chatActions.buildChatRoomActionContextWithAction(input, ctx, args.actionArgs))()
    .then((chatRoomActionContext: ChatRoomActionContext) => {
      contextApi = ChatRoomActionContextApiFactory(chatRoomActionContext, args)
    })
    .then(() => events.room.action.receiving.notify({ api: contextApi }))
    .then(() => actionRouter.route(
      buildRouteInput2(input, contextApi),
      contextApi
    )
      .then(misc.convertToPlainObject)
      .then(result => ({
        result,
        trackingId,
      }))
      .then(sf.tap(() => core.updateChatRoomOrder(chatRoomId)))
      .then(sf.tap_catch(
        (output: any) => Promise.resolve(buildCompletedAction({
          contextId: chatActions.mapChatRoomIdToContextId(chatRoomId),
          sessionUserId: sessionUser.id,
          actorEid: models.mapEntityToEid(contextApi.getContext().actor),
          trackingId,
          type: CompletedActionType.ChatRoomAction,
          input,
          output,
        }))
          .then(saveCompletedAction)
          .then(sft.tap(cAction => console.log('Chat.resolver -> completedACtion: ', cAction)))
          .then(sft.tap(completedAction => {
            const event = eventModel.buildEvent(completedAction)
            return eventModel.saveEvent(event)
              .then(() => completedAction)
          }))
          .then(_.partialRight(updateActionXEdgeStats, ctx))
          .then(sf.tap_catch(() => buildAndSaveChatRoomStatus(chatRoomId, ctx)))
        // .then( notifs.createActionNotifications )
        // .then( sf.list_fmap_wait( sf.tap_catch( notifs.sendPushNotification ) ) )
      ))
    )
    .then(sft.tap_wait(() => events.room.action.received.notify({ api: contextApi })))
}

const createActionXEdge = (user: User, action: ActionX): Promise<Edge> => {
  const edge = {
    thisEntityId: user.id,
    thisEntityType: user.entityType,
    thatEntityId: action.id,
    thatEntityType: action.entityType,
    edgeType: EdgeType.ActionX,
    name: action.name,
    collectionName: 'actionSheet',
    collectionId: models.buildCollectionId(models.mapEntityToEid(user), 'edge'),
    order: action.order,
    isDeleted: action.isDeleted,
  }
  return core.saveEdgeNoPublish(edge)
}

const updateActionXEdgeStats = (completedAction: CompletedAction, ctx: any): Promise<Edge> => {
  return store.actionByName(completedAction.input.name)
    .then(action => {
      if (_.isNil(action)) {
        return Promise.reject(action)
      } 
      
      return store.edgeByThisThatIdsEdgeType({
        thisEntityId: models.mapEidToId(completedAction.actorEid),
        thatEntityId: action.id,
        edgeType: EdgeType.ActionX,
      })
        .then(edge => !_.isNil(edge)
          ? edge
          : createActionXEdge(ctx.user, action)
        )
    })
    .then(edge => {
      const lastPlayedAt = moment().toISOString()
      const playedCount = (edge.metadata?.playedCount || 0) + 1
      return _.merge(edge, {
        sortKey1: lastPlayedAt,
        sortKey2: _.padStart(_.toString(playedCount), 16, '0'),
        metadata: {
          lastPlayedAt,
          playedCount,
        },
      })
    })
    .then(store.saveEdge)
}

/**
 * @deprecated - use chatRoomMyActionSheet
 * @return the session user's ChatRoomScoped "actions" Field, which contains a list of actions.
 */
const chatRoomMyActions = (chatRoom: ChatRoom, args, ctx): Promise<ActionsOutput> => {
  const sessionUser: User = ctx.user
  return mapAndAuthzSessionUserToPlayer(sessionUser, _.get(args, 'input.asUnObjectId'))
    .then(player => store.fieldByCollectionIdName({
      name: 'actions',
      collectionId: models.buildCollectionId('chatroom', chatRoom.id, 'local', player.id, 'field'),
    }))
    .then(field => _.get(field, 'metadata.actions'))
    .then((actions: any) => _.isArray(actions) ? actions : _.values(actions))
    .then((actions: ActionX[]) => ({ actions }))
}

/**
 * @deprecated - use ChatRoom.myCurrentActionStubsField
 * @return the session user's ChatRoomScoped 'actionSheet' edges.
 *         It's redundant to query this info, as the actions are streamed down when
 *         the user enters the ChatRoom.
 */
const chatRoomMyActionSheet = (chatRoom: ChatRoom, args, ctx): Promise<any> => {
  const user: User = ctx.user
  const edgesInput: EdgesInput = {
    // pageInput: _.get( input, 'pageInput'), // TODO: need to change buildCoreActionEdgesForUser trigger logic once we have pagination
    pageInput: {
      first: 100,
    },
    thisEntityId: user.id,
    edgeType: EdgeType.ActionX,
    collectionName: 'actionSheet',
    collectionId: models.buildCollectionId('chatroom', chatRoom.id, 'local', user.id, 'edge'),
  }
  return activityModel.readEdgesPageByOrder(edgesInput)
    .then((edges: Edge[]) => Bluebird.Promise.props({
      // TODO: pageInfo: mapEdgesOrderToPageInfo(edges),
      edges,
      actionEdges: edges,
      actions: store.thatEntitiesOfEdges(edges),
    }))
}

const resolveMyChatRoomLocalField = (fieldName: string) =>
  (chatRoom: ChatRoom, args, ctx): Promise<ActionXEdgesField> => {
    const sessionUser: User = ctx.user
    return mapAndAuthzSessionUserToPlayer(sessionUser, _.get(args, 'input.asUnObjectId'))
      .then(player => store.fieldByCollectionIdName({
        name: fieldName,
        collectionId: models.buildCollectionId('chatroom', chatRoom.id, 'local', player.id, 'field'),
      }))
  }

const chatRoomFields = (chatRoom: ChatRoom, args, ctx): Promise<FieldsOutput> => {
  // These Field's are fetched by the FE when the user enters the room
  // TODO: Add this query to the cache if needed
  return activityModel.readFieldsBy({
    collectionId: models.buildCollectionId('chatroom', chatRoom.id, 'field'),
    // NOTE: Countdown and Progress (and actionStubs) seem like they should be restored, but the outcome is worse
    // type: safeIn([FieldType.ButtonField, FieldType.CountdownField, FieldType.ProgressField]),
    type: safeIn([FieldType.ButtonField]),
    isDeleted: false,
  }).then(fields => ({ fields, pageInfo: {} }))
}

/**
 * TODO: query on scope=ChatRoomScope
 * @return the session user's ChatRoomScope Tiles.
 */
const chatRoomMyTiles = (chatRoom: ChatRoom, args, ctx): Promise<TilesOutput> => {
  const sessionUser: User = ctx.user
  return mapAndAuthzSessionUserToPlayer(sessionUser, _.get(args, 'input.asUnObjectId'))
    .then(
      (player: Player) => activityModel.readTilesBy({
        collectionId: models.buildCollectionId('chatroom', chatRoom.id, 'local', player.id, 'tile'),
        isDeleted: false,
      })
    )
    .then((tiles: Tile[]) => ({ tiles }))
}

/**
 * TODO: query on scope=ChatRoomPrivateScope
 * @return the session user's ChatRoomPrivateScope Tiles.
 */
const chatRoomMyPrivateTiles = (chatRoom: ChatRoom, args, ctx): Promise<TilesOutput> => {
  const sessionUser: User = ctx.user
  return mapAndAuthzSessionUserToPlayer(sessionUser, _.get(args, 'input.asUnObjectId'))
    .then(
      (player: Player) => activityModel.readTilesBy({
        collectionId: models.buildCollectionId('chatroom', chatRoom.id, 'local', player.id, 'privatetile'),
        isDeleted: false,
      })
    )
    .then((tiles: Tile[]) => ({ tiles }))
}

const mapEffectsToEffectsOutput = (effects: Effect[]): EffectsOutput => ({
  effects,
  pageInfo: {
    firstCursor: misc.toDateISOString(_.get(_.first(effects), 'createdAt')),
    lastCursor: misc.toDateISOString(_.get(_.last(effects), 'createdAt')),
  },
})

const chatRoomEffects = (chatRoom: ChatRoom, args): Promise<EffectsOutput> => {
  const input: EffectsInput = _.defaultTo(joi.validate(args.input, joi.buildEffectsInputSchema()), {})
  input.collectionId = models.buildCollectionId('chatroom', chatRoom.id, 'effect')
  return activityModel.readEffectsPageByCreatedAtDesc(input)
    .then(mapEffectsToEffectsOutput)
    .catch(sf.tap_throw(err => logger.error('chatRoomEffects', { err, input, chatRoom })))
}

// TODO cache completed actions
const chatRoomCompletedActions = (chatRoom: ChatRoom): Promise<CompletedActionsOutput> => {
  return readCompletedActionsBy({
    where: {
      contextId: models.mapEntityToEid(chatRoom),
    },
    order: {
      createdAt: 'DESC',
    },
  })
    .then((completedActions: CompletedAction[]) => ({ completedActions }))
}

const chatRoomPlayers = (chatRoom: ChatRoom): Promise<Player[]> => {
  return store.chatRoomPlayers(chatRoom.id, chatRoom)
}

const hideChatRoom = (root, args, ctx): Promise<ChatRoom> => {
  const sessionUser: User = ctx.user
  return core.hideChatRoomForUser(args.id, sessionUser.id)
}

const chatRoomCommentCount = (chatRoom: ChatRoom): Promise<number> => {
  const collectionId = models.buildCollectionId(models.mapEntityToEid(chatRoom), 'comment')
  return model.countComments(collectionId)
}

const chatRoomMyUnReadCommentCount = (chatRoom: ChatRoom, args, ctx): Promise<number> => {
  const sessionUser: User = ctx.user
  const collectionId = models.buildCollectionId(models.mapEntityToEid(chatRoom), 'comment')
  return model.countUnReadCommentsForCollection(collectionId, sessionUser.id)
}

const resolveChatRoomTiles = (chatRoom: ChatRoom): Promise<TilesOutput> => {
  return activityModel.readTilesBy({
    where: [
      {
        collectionId: models.buildCollectionId(models.mapEntityToEid(chatRoom), 'tile'),
        isDeleted: false,
      },
      {
        collectionId: models.buildCollectionId(models.mapEntityToEid(chatRoom), 'local', chatRoom.id, 'tile'),
        isDeleted: false,
      },
    ],
  })
    .then((tiles: Tile[]) => ({ tiles }))
}

/**
 * i've sent the last message
 * i've sent the last action
 * partner sent the last message
 * partner sent the last action
 *
 */
const resolveChatRoomMyChatRoomStatus = (chatRoom: ChatRoom, args: any, ctx: any): Promise<any> => {
  const sessionUser: User = ctx.user
  return store.fieldByCollectionIdName({
    name: 'reserved.chatroom.status',
    collectionId: models.buildCollectionId('chatroom', chatRoom.id, 'local', sessionUser.id, 'field'),
  })
    .then(sf.thru_if(_.isNil)(
      () => buildAndSaveChatRoomStatus(chatRoom.id, ctx)
        .then(sf.lens('field').get)
    ))
    .then(sf.lens('metadata').get)
}

const buildAndSaveChatRoomStatus = (chatRoomId: string, ctx: any): Promise<SaveFieldOutput> => {
  const sessionUser: User = ctx.user
  return Bluebird.Promise.props({
    lastComment: model.readMostRecentComment(models.buildCollectionId('chatroom', chatRoomId, 'comment')),
    lastAction: readMostRecentCompletedAction(models.buildCollectionId('chatroom', chatRoomId)),
  })
    .then(({ lastComment, lastAction }) => buildChatRoomStatus(sessionUser, lastComment, lastAction))
    .then((status: ChatRoomStatus) => ({
      collectionId: models.buildCollectionId('chatroom', chatRoomId, 'local', sessionUser.id, 'field'),
      scope: EntityScope.ChatRoomScope,
      thisEntityId: sessionUser.id,
      thisEntityType: sessionUser.entityType,
      type: FieldType.JsonObjectField,
      name: 'reserved.chatroom.status',
      metadata: status,
    }))
    .then((input: SaveFieldInput) => core.saveField(null, { input }, ctx))
}

const buildChatRoomStatus = (sessionUser: User, lastComment: Comment, lastAction: CompletedAction): Promise<ChatRoomStatus> => {
  const lastActionCreatedAt: Date = _.isNil(lastAction)
    ? null
    : moment(lastAction.createdAt).subtract(2, 'seconds').toDate()

  return _.get(lastComment, 'createdAt') > lastActionCreatedAt
    ? mapLastCommentToChatRoomStatus(lastComment, sessionUser)
    : mapLastActionToChatRoomStatus(lastAction, sessionUser)
}

const mapLastActionToChatRoomStatus = (lastAction: CompletedAction, sessionUser: User): Promise<ChatRoomStatus> => {
  if (_.isNil(lastAction)) {
    return Promise.resolve({
      isLastActivityByMe: false,
      statusText: '',
    })
  }
  const actionName = _.get(lastAction, 'input.name')
  return lastAction.sessionUserId == sessionUser.id
    ?
    store.actionByName(actionName)
      .then(action => _.isNil(action)
        ? 'You played an action'
        : `You played "${action.text}"`
      )
      .then((statusText: string) => ({
        isLastActivityByMe: true,
        statusText,
      }))
    :
    Bluebird.Promise.props({
      action: store.actionByName(actionName),
      actor: store.entityByEid<any>(lastAction.actorEid),
    })
      .then(({ action, actor }) => _.isNil(action)
        ? `${models.playerName(actor)} played an action`
        : `${models.playerName(actor)} played "${action.text}"`
      )
      .then((statusText: string) => ({
        isLastActivityByMe: false,
        statusText,
      }))
}

const mapLastCommentToChatRoomStatus = (lastComment: Comment, sessionUser: User): Promise<ChatRoomStatus> => {
  if (_.isNil(lastComment)) {
    return Promise.resolve({
      isLastActivityByMe: false,
      statusText: '',
    })
  }
  return lastComment.authorUserId == sessionUser.id
    ?
    Promise.resolve({
      isLastActivityByMe: true,
      statusText: `You: ${lastComment.text}`,
    })
    :
    store.entityByEid(lastComment.authorEid)
      .then((player: Player) => ({
        isLastActivityByMe: false,
        statusText: `${models.playerName(player)}: ${lastComment.text}`,
      }))
}

const authzSessionUserIsUser = (user: User, args, ctx): Promise<any> => {
  const sessionUser: User = ctx.user
  return userAuthz.authzSessionUserIsUser(sessionUser, user)
    .catch((err) => authz.authzMasterApiKeyOverride(err, ctx.apiKey))
    .then(() => skip)
}

const resolveUserSelfChatRoom = (user: User, args, ctx: any): Promise<any> => {
  const input: CreateChatRoomInput = { playerEids: [] }
  return createChatRoom(null, { input }, ctx)
    .then((output: CreateChatRoomOutput) => output.chatRoom)
}

/**
 * TODO this code is dormant for now
 *
 * @deprecated
 */
const resolveUserWelcomeBotChatRoom = (user: User, args, ctx: any): Promise<any> => {
  /*const WelcomeBotEid = WELCOME_BOT_EID
  const input: CreateChatRoomInput = {
    playerEids: [WelcomeBotEid],
  }
  return createChatRoom(null, { input }, ctx)
    .then((output: CreateChatRoomOutput) => output.chatRoom)*/
  return null
}

// TODO assumes there are only 2 players in p2p and multiplayer playroom
// In order to fetch the right edges, we
//  - Remove unobject/id from playerEid list when `MultiPlayRoom`
//  - Otherwise reverse that list to have `unobject/id` as `thatEntityId`
const chatRoomEdges = (chatRoom: ChatRoom, userId: string): Promise<Edge[]> => {
  return store.chatRoomPlayerEids(chatRoom.id, chatRoom)
    .then(playerEids => {
      if (chatRoom.type !== ChatRoomType.MultiPlayRoom) {
        return playerEids.reverse()
      }
      const index = playerEids.findIndex(id => id.startsWith('unobject/'))
      playerEids.splice(index, 1)
      return playerEids
    })
    .then(playerEids => playerEids.map(models.mapEidToId))
    .then(playerIds => userId === playerIds[0]
      ? playerIds[1]
      : playerIds[0]
    )
    .then(otherPlayerId => store.edgesByThisThatIdsEdgeType({
      thisEntityId: userId,
      thatEntityId: otherPlayerId,
      edgeType: EdgeType.ChatRoom,
    }))
}

const isLastActive = (chatRoom: ChatRoom, args, ctx): Promise<boolean> => {
  if (chatRoom.type === ChatRoomType.SinglePlayRoom || chatRoom.type === ChatRoomType.PersonalPlayRoom) {
    return Promise.resolve(true)
  }
  const sessionUser: User = ctx.user
  return chatRoomEdges(chatRoom, sessionUser.id)
    .then(edges => edges.sort(misc.sortBy('updatedAt')).reverse()[0])
    .then(edge => !!(edge && edge.collectionId === chatRoom.id))
}

const isHidden = (chatRoom: ChatRoom, args, ctx): Promise<boolean> => {
  if (chatRoom.type === ChatRoomType.SinglePlayRoom || chatRoom.type === ChatRoomType.PersonalPlayRoom) {
    return Promise.resolve(false)
  }
  const sessionUser: User = ctx.user
  return chatRoomEdges(chatRoom, sessionUser.id)
    .then(edges => edges.find(edge => edge.collectionId === chatRoom.id))
    .then(edge => !!(!edge || edge.isDeleted))
}

//
// GraphQL schema resolver table.
//

export default {
  Query: {
    chatRoom: combineResolvers(jwt.requireJwtAuth, authzChatRoom, resolveChatRoom),
  },
  Mutation: {
    createChatRoom: combineResolvers(jwt.requireJwtAuth, createChatRoom),
    createComment: combineResolvers(jwt.requireMasterApiKeyGql, core.createComment),
    createNewsfeedItemComment: combineResolvers(jwt.requireJwtAuth, authzCreateNewsfeedItemComment, createNewsfeedItemComment),
    createChatRoomComment: combineResolvers(jwt.requireJwtAuth, authzChatRoomAction, createChatRoomComment),
    createChatRoomSystemComment: combineResolvers(jwt.requireMasterApiKeyGql, core.createChatRoomSystemComment),
    saveMyChatRoomLocalField: combineResolvers(jwt.requireJwtAuth, authzSaveMyChatRoomLocalField, saveMyChatRoomLocalField),
    saveIsTypingField: combineResolvers(jwt.requireJwtAuth, authzSaveIsTypingField, saveIsTypingField),
    submitChatRoomAction: logger.traceFn2(
      (root, args) => `submitChatRoomAction: action=${_.get(args, 'input.name')};chatRoomId=${_.get(args, 'input.chatRoomId')}`,
      combineResolvers(jwt.requireJwtAuth, authzChatRoomAction, submitChatRoomAction)
    ),
    beforeEnterChatRoom: combineResolvers(jwt.requireJwtAuth, authzChatRoomAction, beforeEnterChatRoom),
    enterChatRoom: combineResolvers(jwt.requireJwtAuth, authzChatRoomAction, enterChatRoom),
    exitChatRoom: combineResolvers(jwt.requireJwtAuth, authzChatRoomAction, exitChatRoom),
    hideChatRoom: combineResolvers(jwt.requireJwtAuth, authzChatRoomAction, hideChatRoom),
    saveAction: combineResolvers(jwt.requireMasterApiKeyGql, core.saveAction),
  },
  ChatRoom: {
    asNode: _.identity,
    players: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomPlayers),
    comments: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomComments),
    channels: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomChannels),
    effects: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomEffects),
    // completedActions: combineResolvers( jwt.requireMasterApiKeyGql, chatRoomCompletedActions ),
    completedActions: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomCompletedActions),
    myActions: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomMyActions),
    myActionSheet: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomMyActionSheet),
    isDestroyed: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, (chatRoom: ChatRoom): boolean => chatRoom.isDeleted),
    tiles: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, resolveChatRoomTiles),
    myTiles: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomMyTiles),
    myLocalTiles: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomMyTiles),
    myPrivateTiles: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomMyPrivateTiles),
    myLocalPrivateTiles: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomMyPrivateTiles),
    commentCount: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomCommentCount),
    myUnReadCommentCount: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomMyUnReadCommentCount),
    myCurrentActionEdges: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, resolveMyChatRoomLocalField('currentActionEdges')),
    myCurrentActionStubsField: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, resolveMyChatRoomLocalField('currentActionStubs')),
    myChatRoomStatus: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, resolveChatRoomMyChatRoomStatus),
    fields: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, chatRoomFields),
    isLastActive: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, isLastActive),
    isHidden: combineResolvers(jwt.requireJwtAuth, authzSessionUserIsChatRoomPlayerOrHandler, isHidden),
  },
  Channel: {
    isMyChannel: combineResolvers(jwt.requireJwtAuth, channelIsMyChannel),
  },
  User: {
    selfChatRoom: combineResolvers(authzSessionUserIsUser, resolveUserSelfChatRoom),
    welcomeBotChatRoom: combineResolvers(authzSessionUserIsUser, resolveUserWelcomeBotChatRoom),
  },
}
