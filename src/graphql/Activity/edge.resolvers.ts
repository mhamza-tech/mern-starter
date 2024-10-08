/**
 * @rob4lderman
 * jan2020
 *
 */
import _ from 'lodash'
import { combineResolvers } from 'graphql-resolvers'
import {
  sf,
  sft,
  jwt,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  Edge,
  EdgeStats,
  User,
} from '../../db/entity'
import {
  EdgeType,
  EntityInput,
  UserEntityInput,
  EdgesInput,
  EdgesOutput,
  SaveEdgeInput,
  CreateUserEdgeInput,
  EntityType,
  SaveEdgeOutput,
  DeleteUserEdgeInput,
  CreateEdgeOutput,
  MutationCreateEdgeArgs,
  MutationSaveEdgeArgs,
  MutationDeleteUserEdgeArgs,
  MutationCreateUserEdgeArgs,
} from 'src/gql-types'
import {
  validate,
  buildEdgesInputSchema,
  validateEntityInput,
  validateUserEntityInput,
  buildEntityTypeSchema,
  buildEdgeTypeSchema,
} from '../joi'
import * as core from '../core'
import * as store from '../store'
import * as model from './edge.model'
import * as notifs from '../notifs'
import Joi from '@hapi/joi'
import {
  mapEntityRefToEid,
  mapEidToId,
} from 'src/graphql/models'
import { readCommentById } from 'src/graphql/Chat/chat.model'
import * as pubsub from '../pubsub'
import { safeIn } from 'src/db/utils'

const logger = LoggerFactory('edge.resolvers')

// TODO does FE use this? If so then implement cache - logged EDISON-3490
export const edgeStats = (root, args): Promise<EdgeStats[]> => {
  logger.debug('edgeStats', { args })
  const input: EntityInput = validateEntityInput(args.input)
  return model.readEdgeStats(input.entityId)
}

/**
 *
 * So... we have filter options and we have pageInput.
 */
const edges = (root, args): Promise<EdgesOutput> => {
  logger.debug('edges', { args })
  const input: EdgesInput = validate(args.input, buildEdgesInputSchema())
  return model.readEdgesPageByCreatedAtDesc(input)
    .then(core.mapEdgesToEdgesOutput)
}

export const myEdges = (root, args, ctx): Promise<Edge[]> => {
  const userId: string = jwt.getUserId(ctx.token)
  const input: EntityInput = validateEntityInput(args.input)
  return userEdges(
    root,
    {
      input: {
        userId,
        entityId: input.entityId,
      },
    }
  )
}

export const userEdges = (root, args): Promise<Edge[]> => {
  logger.debug('userEdges', { args })
  const input: UserEntityInput = validateUserEntityInput(args.input)
  return model.readEdgesBy({
    where: {
      thisEntityId: input.userId,
      thatEntityId: input.entityId,
    },
  })
}

const buildCreateUserEdgeInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    thatEntityId: Joi.string().required(),
    thatEntityType: buildEntityTypeSchema().required(),
    edgeType: buildEdgeTypeSchema().required(),
    metadata: Joi.object().allow(null),
  })
}

const mapCreateUserEdgeInputToSaveEdgeInput = (sessionUser: User, input: CreateUserEdgeInput): SaveEdgeInput => {
  return _.extend({}, input, {
    thisEntityId: _.get(sessionUser, 'id', '0'),
    thisEntityType: _.get(sessionUser, 'entityType', EntityType.User),
  })
}

/**
 * @return input
 * @throws if invalid
 */
const validatCreateUserEdgeInput = (input: any): CreateUserEdgeInput => {
  return validate(input, buildCreateUserEdgeInputSchema()) as CreateUserEdgeInput
}

const createEdgeForAuthor = (user: User, input: CreateUserEdgeInput): Promise<string> => {
  const edge = new Edge()
  edge.thisEntityId = user.id
  edge.thisEntityType = user.entityType
  edge.edgeType = input.edgeType
  edge.thatEntityType = EntityType.User
  edge.collectionId = input.thatEntityId
  edge.collectionName = input.thatEntityType
  edge.isDeleted = false
  
  return Promise.resolve(null)
    .then(() => {
      switch (input.thatEntityType) {
        case EntityType.Comment:
          return readCommentById(input.thatEntityId)
            .then(comment => mapEidToId(comment.authorEid))
        case EntityType.NewsfeedItem:
          return store.newsfeedItemById(input.thatEntityId)
            .then(newsfeedItem => mapEidToId(newsfeedItem.context.actorEid))
        case EntityType.Field:
          return store.fieldById(input.thatEntityId)
            .then(field => field.thisEntityId)
        default:
          return null
      }
    })
    .then(authorId => {
      if (_.isNil(authorId)) {
        return null
      }
      edge.thatEntityId = authorId
      return core.saveEdgeNoPublish(edge, true)
        .then(sft.tap_catch(
          (edge: Edge) => {
            if (_.isEqual(edge.edgeType, EdgeType.Likes)) {
              return store.userById(authorId)
                .then(sft.pause(2 * 1000))
                .then(author => core.likesCount(author)
                  .then(count => pubsub.publishCount(author.id, 'likesCount', count))
                )
            }
            return null
          }
        ))
        .then(() => authorId)
    })
}

/**
 * NOTE: all LIKES in the app come thru here.
 * @return Promise w/ Edge
 */
const createUserEdge = (root, args: MutationCreateUserEdgeArgs, ctx): Promise<Edge> => {
  logger.debug('createUserEdge', { args, ctx })
  const sessionUser: User = ctx.user
  const input = validatCreateUserEdgeInput(args.input)

  return store.edgeByThisThatIdsEdgeType({
    thisEntityId: sessionUser.id,
    thatEntityId: input.thatEntityId,
    edgeType: EdgeType.Likes,
    dbOptions: { isDeleted: safeIn([true, false]) },
  })
    .then(existingEdge => {
      if (!_.isNil(existingEdge) && !existingEdge.isDeleted) {
        return existingEdge
      }

      const newEdge = mapCreateUserEdgeInputToSaveEdgeInput(sessionUser, input)
      return core.saveEdge(newEdge)
        .then(sft.tap_catch(
          (edge: Edge) => {
            return createEdgeForAuthor(sessionUser, input)
              .then(authorId => {
                // do not create & send notification when
                //  1) someone had already liked this before
                //  2) you like your own entity
                if (!_.isNil(existingEdge) || authorId === sessionUser.id) {
                  return null
                }
                return notifs.createReactionNotifications(edge)
                  .then(sf.pause(2 * 1000))
                  .then(sf.tap_catch(notifs.sendPushNotification))
              })
          }))
    })
}

const buildDeleteUserEdgeInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    thatEntityId: Joi.string().required(),
    edgeType: Joi.string().valid(...Object.values(EdgeType)).required(),
  })
}

/**
 * @return input
 * @throws if invalid
 */
const validatDeleteUserEdgeInput = (input: any): DeleteUserEdgeInput => {
  return validate(input, buildDeleteUserEdgeInputSchema()) as DeleteUserEdgeInput
}

/**
 * @return Promise w/ boolean
 */
const deleteUserEdge = (root, args: MutationDeleteUserEdgeArgs, ctx): Promise<boolean> => {
  logger.debug('deleteUserEdge', { args, ctx })
  const input = validatDeleteUserEdgeInput(args.input)
  const user: User = ctx.user
  const authorEdgeQuery = {
    thisEntityId: user.id,
    collectionId: input.thatEntityId,
    edgeType: input.edgeType,
    isDeleted: false,
  }
  return Promise.all([
    store.deleteEdgesBy(authorEdgeQuery, true),
    store.deleteEdgesByThisThatIdsEdgeType({
      thisEntityIds: [user.id],
      thatEntityIds: [input.thatEntityId],
      edgeTypes: [input.edgeType],
    }),
  ])
    .then(result => result[1])
}

const edgeThisEid = (edge): string => {
  return mapEntityRefToEid(store.mapEdgeToThisEntityRef(edge))
}

const edgeThatEid = (edge): string => {
  return mapEntityRefToEid(store.mapEdgeToThatEntityRef(edge))
}

const resolveEdgeThatEntity = <T>(edge): Promise<T> => {
  return store.thatEntityOfEdge<T>(edge)
}

const resolveEdgeThisEntity = <T>(edge): Promise<T> => {
  return store.thisEntityOfEdge<T>(edge)
}

const EdgeResolvers = {
  thisEid: edgeThisEid,
  thatEid: edgeThatEid,
  thisEntity: resolveEdgeThisEntity,
  thatEntity: resolveEdgeThatEntity,
  asActionXEdge: core.resolveAsEdgeType(EdgeType.ActionX),
  asReactionEdge: core.resolveAsEdgeType(EdgeType.ReactionEdge),
}

export const ActionXEdgeResolvers = {
  action: resolveEdgeThatEntity,
  isDisabled: core.resolveFromMetadata('isDisabled'),
  quantity: core.resolveFromMetadata('quantity'),
  lastPlayedAt: core.resolveFromMetadata('lastPlayedAt'),
  playedCount: core.resolveFromMetadata('playedCount'),
}

const ReactionEdgeResolvers = {
  action: resolveEdgeThatEntity,
}

const createEdge = (root, args: MutationCreateEdgeArgs): Promise<CreateEdgeOutput> => {
  return core.saveEdge({ ...args.input })
    .then(edge => ({ edge }))
}

const saveEdge = (root, args: MutationSaveEdgeArgs): Promise<SaveEdgeOutput> => {
  return Promise.resolve(args.input)
    .then(core.saveEdge)
    .then(edge => ({ edge }))
}

export default {
  Query: {
    edgeStats,
    edges: combineResolvers(jwt.requireMasterApiKeyGql, edges),
    myEdges: combineResolvers(jwt.requireJwtAuth, myEdges),
    userEdges: combineResolvers(jwt.requireMasterApiKeyGql, userEdges),
  },
  Mutation: {
    createUserEdge: combineResolvers(jwt.requireJwtGql, createUserEdge),
    deleteUserEdge: combineResolvers(jwt.requireJwtGql, deleteUserEdge),
    createEdge: combineResolvers(jwt.requireMasterApiKeyGql, createEdge),
    saveEdge: combineResolvers(jwt.requireMasterApiKeyGql, saveEdge),
  },
  Edge: EdgeResolvers,
  ActionXEdge: ActionXEdgeResolvers,
  ReactionEdge: ReactionEdgeResolvers,
}
