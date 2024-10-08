/**
 * @rob4lderman
 * sep2019
 */

import _ from 'lodash'
import { MASTER_API_KEY } from 'src/env'
import { ApolloError } from 'apollo-server'
import {
  chatRoomPlayerEids,
  chatRoomById,
  unObjectById,
} from 'src/graphql/store'
import { mapEidToId } from 'src/graphql/models'
import {
  User,
  Player,
} from 'src/db/entity'
import { authzUserIdIsPlayerOrCreator } from 'src/graphql/Action/action.authz'
import { sft } from 'src/utils'

export const authzMasterApiKeyOverride = (err: any, apiKey: string): void => {
  if (_.trim(apiKey) !== MASTER_API_KEY) {
    throw err
  }
}

export const authzPlayerIdIsChatRoomPlayer = (playerId: string, chatRoomId: string): Promise<any> => {
  if (_.isEmpty(playerId)) {
    return Promise.reject(buildNotMemberOfChatError())
  }
  return chatRoomPlayerEids(chatRoomId)
    .then(playerEids => playerEids.map(mapEidToId).includes(playerId)
      ? playerEids
      : Promise.reject(buildNotMemberOfChatError())
    )
}

export const authzUserIdIsChatRoomPlayerOrHandler = (userId: string, chatRoomId: string): Promise<any> => {
  return authzPlayerIdIsChatRoomPlayer(userId, chatRoomId)
}

export const authzChatRoomIsNotDeleted = (chatRoomId: string): Promise<any> => {
  return chatRoomById(chatRoomId)
    .then(chatRoom => !chatRoom || chatRoom.isDeleted
      ? Promise.reject(buildChatRoomIsDeletedError)
      : Promise.resolve(chatRoom)
    )
}

export const buildNotMemberOfChatError = (): ApolloError => new ApolloError(
  'You are not authorized to view this chat',
  'NOT_AUTHORIZED_CHAT'
)

export const buildChatRoomIsDeletedError = (): ApolloError => new ApolloError(
  'You cannot perform this action because the chat room has been deleted.',
  'CHAT_ROOM_DELETED'
)

const mapUserOrAsUnObjectIdToPlayer = (user: User, asUnObjectId: string = null): Promise<Player> => {
  return Promise.all([
    user,
    Promise.resolve(asUnObjectId)
      .then(unObjectId => !unObjectId
        ? Promise.resolve(null)
        : unObjectById(asUnObjectId)
      ),
  ])
    .then(([user, actingAsUnObject]) => _.defaultTo(actingAsUnObject, user))
}

/**
 * @params GQL resolver params
 * @return Player - either the session user (ctx.user) or the UnObject ref'ed by input.asUnObjectId.
 *          if asUnObjectId is defined then it takes precedence
 */
export const mapAndAuthzCallerToPlayer = (root, args, ctx): Promise<Player> => {
  return mapAndAuthzSessionUserToPlayer(ctx.user, _.get(args, 'input.asUnObjectId'))
}

/**
 * @return Player - either the session user (ctx.user) or the UnObject ref'ed by input.asUnObjectId.
 *          if asUnObjectId is defined then it takes precedence
 */
export const mapAndAuthzSessionUserToPlayer = (sessionUser: User, asUnObjectId: string): Promise<Player> => {
  return mapUserOrAsUnObjectIdToPlayer(sessionUser, asUnObjectId)
    .then(sft.tap_wait((player: Player) => authzUserIdIsPlayerOrCreator(sessionUser.id, player)))
}
