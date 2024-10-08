/**
 * @rob4lderman
 * mar2020
 * 
 */
import _ from 'lodash'
import { combineResolvers } from 'graphql-resolvers'
import { jwt } from '../../utils'
import {
  Activity,
  NewsfeedItem,
  Effect,
  User,
} from '../../db/entity'
import * as model from './activity.model'
import * as chatModel from '../Chat/chat.model'
import {
  Node,
  EntityType,
  TrackingInput,
  NodeInput,
  NodeOutput,
  SearchInput,
  EdgeType,
  QuerySearchPlayersArgs,
} from '../../gql-types'
import * as joi from '../joi'
import * as core from '../core'
import * as store from '../store'
import * as userModel from '../User/user.model'
import * as chatActions from '../Chat/chat.actions'
import Joi from '@hapi/joi'
import Bluebird from 'bluebird'
import { mapEidToEntityRef } from 'src/graphql/models'
import { readNewsfeedItemsBy } from 'src/graphql/Activity/newsfeeditem.model'

const validateTrackingInput = (input: any): TrackingInput => {
  return joi.validate(
    input,
    Joi.object().keys({
      trackingId: Joi.string().required(),
    })
  ) as TrackingInput
}

const tracking = (parent, args): TrackingInput => {
  return validateTrackingInput(args.input)
}

const trackingActivities = (parent): Promise<Activity[]> => {
  return model.readActivitiesByTrackingId(parent.trackingId)
}

const trackingNewsfeedItems = (parent): Promise<NewsfeedItem[]> => {
  return readNewsfeedItemsBy({ trackingId: parent.trackingId })
}

const trackingEffects = (parent): Promise<Effect[]> => {
  return model.readEffectsBy({ trackingId: parent.trackingId })
}

const trackingComments = (parent): Promise<any> => {
  return chatModel.readCommentsBy({ trackingId: parent.trackingId })
}

const trackingNotifications = (parent): Promise<any> => {
  return model.readNotificationsBy({ trackingId: parent.trackingId })
}

const node = (parent, args): Promise<NodeOutput> => {
  const input: NodeInput = joi.validate(args.input, joi.buildNodeInputSchema()) as NodeInput
  return Promise.resolve(mapEidToEntityRef(input.eid))
    .then(store.entityByEntityRef)
    .then((node: Node) => ({ node }))
}

const searchPlayers = (_parent, args: QuerySearchPlayersArgs, ctx): Promise<any> => {
  const input: SearchInput = joi.validate(args.input, joi.buildSearchInputSchema())
  return Bluebird.Promise.props({
    users: input.friendsOnly
      ? searchFriendsOnly(input, ctx.user)
      : userModel.searchUsers(input),
    unObjects: chatActions.searchActionResolverUnObjects(input, ctx.user),
  })
    .then(({ users, unObjects }) => ({
      players: _.concat(users, unObjects as any),
      pageInfo: {
        firsrCursor: '0',
        lastCursor: '29',
      },
    }))
}

const searchFriendsOnly = (input: SearchInput, user: User): Promise<unknown[]> => {
  return store.edgesByThisIdEdgeType({
    thisEntityId: user.id,
    edgeType: EdgeType.Friend,
  })
    .then(edges => store.thatEntitiesOfEdges<User>(edges))
    .then(users => users.filter(user =>
      user.displayName.includes(input.query) ||
        user.username.includes(input.query)
    ))
}

//
// GraphQL schema resolver table.
//

export default {
  Query: {
    node: combineResolvers(jwt.requireMasterApiKeyGql, node),
    tracking: combineResolvers(jwt.requireMasterApiKeyGql, tracking),
    searchPlayers: searchPlayers,
    errorMessage: (parent, args): any => args.input,
  },
  Mutation: {
    cacheRefetch: combineResolvers(jwt.requireMasterApiKeyGql, store.cacheRefetch),
  },
  Tracking: {
    activities: combineResolvers(jwt.requireMasterApiKeyGql, trackingActivities),
    newsfeedItems: combineResolvers(jwt.requireMasterApiKeyGql, trackingNewsfeedItems),
    effects: combineResolvers(jwt.requireMasterApiKeyGql, trackingEffects),
    comments: combineResolvers(jwt.requireMasterApiKeyGql, trackingComments),
    notifications: combineResolvers(jwt.requireMasterApiKeyGql, trackingNotifications),
  },
  Node: {
    eid: core.resolveEid,
    edges: combineResolvers(jwt.requireMasterApiKeyGql, core.nodeEdges),
    fields: combineResolvers(jwt.requireMasterApiKeyGql, core.nodeFields),
    field: combineResolvers(jwt.requireMasterApiKeyGql, core.nodeField),
    edgeStats: combineResolvers(jwt.requireMasterApiKeyGql, core.nodeEdgeStats),
    asChatRoom: core.resolveAsEntityType(EntityType.ChatRoom),
    asUnObject: core.resolveAsEntityType(EntityType.UnObject),
    asComment: core.resolveAsEntityType(EntityType.Comment),
    asUser: core.resolveAsEntityType(EntityType.User),
    asPlayer: core.resolveAsPlayerType,
    asCommentReceipt: core.resolveAsEntityType(EntityType.CommentReceipt),
    asNotification: core.resolveAsEntityType(EntityType.Notification),
    asReceipt: core.resolveAsEntityType(EntityType.Receipt),
    asEffect: core.resolveAsEntityType(EntityType.Effect),
    asTile: core.resolveAsEntityType(EntityType.Tile),
    asActionX: core.resolveAsEntityType(EntityType.ActionX),
    asActionXInstance: core.resolveAsEntityType(EntityType.ActionXInstance),
    image: core.resolveImageNoDefault,
  },
}
