/**
 * @rob4lderman
 * mar2020
 * 
 */

import _ from 'lodash'

import {
  combineResolvers,
  skip,
} from 'graphql-resolvers'
import {
  UnObject,
  Storyboard,
  Action,
  Edge,
  ChatRoom,
  User,
} from '../../db/entity'
import {
  CreateUnObjectInput,
  UpdateUnObjectInput,
  EdgeType,
  CreateHandledUnObjectInput,
  CreateHandledUnObjectOutput,
  EntityType,
  HandlerUnObjectsOutput,
  FieldType,
  UnObjectsOutput,
  Field,
  UnObjectInput,
  QueryFeaturedHandlerUnObjectsArgs,
  UnObjectActivity,
  NewsfeedItem,
  QueryUnObjectsArgs,
  DynamicFeedItemLayout,
  FeedItemActionEntityType,
  FeedItemActionType,
} from 'src/gql-types'
import { activityServiceLocal as activityService } from '../../services'
import {
  jwt,
  sf,
  misc,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import * as store from '../store'
import { userById } from '../store'
import {
  incrementComments,
  autoIncrementNumber,
} from 'src/graphql/Action/unobject.fake.comments'
import { getUnObjectFakeActionsWithImgixUrls } from './unobject.fake.actions'
import { FIELD_NAME as xpFieldName } from 'src/maker/experiencePoints'
import * as model from './unobject.model'
import * as errors from './action.error'
import * as chatActions from '../Chat/chat.actions'
import * as joi from '../joi'
import * as authz from './action.authz'
import * as core from '../core'
import Joi from '@hapi/joi'
import { SYSTEM_USER_EID } from 'src/env'
import { buildCollectionId } from 'src/graphql/models'
import {
  defaultPageInput,
  DEFAULT_CURSOR_VALUE,
  pageResult,
} from 'src/graphql/pageInput'
import { readEdgesBy } from 'src/graphql/Activity/edge.model'
import { NewsfeedItemTemplate } from 'src/types'
import { createNewsfeedItem } from 'src/graphql/Activity/newsfeeditem.model'

const logger = LoggerFactory('unobject.resolvers')

const unObjectMyEdges = (parent, args, ctx): Promise<any> => {
  const userId: string = jwt.getUserId(ctx.token)
  const entityId: string = parent.id || parent.unObjectId // for backwards compatibility w/ old Storyline objects
  return activityService.readUserEdges(userId, entityId)
    .catch(sf.tap_throw(err => logger.error('ERROR: unObjectMyEdges', { userId, entityId, err })))
    .catch(() => null)
}

const unObjectEdgeStats = (parent): Promise<object[]> => {
  const entityId: string = parent.id || parent.unObjectId // fallback to unObjectId for backwards-compatibility with old Sstoryline objects
  return activityService.readEdgeStats(entityId)
    .catch(sf.tap_throw(err => logger.error('ERROR: unObjectEdgeStats', { entityId, err })))
    .catch(() => null)
}

const cleanCreateUnObjectInput = (input: any): any => {
  return _.extend(
    input,
    {
      name: _.trim(input.name),
      description: _.trim(input.description),
    },
    input.emoji
      ? { emoji: _.trim(input.emoji) }
      : {}
    ,
    input.entryId
      ? { entryId: _.trim(input.entryId) }
      : {}

  )
}

const validateCreateUnObjectInput = (input: any): CreateUnObjectInput => {
  return joi.validate(
    input,
    Joi.object().keys({
      name: Joi.string().required(),
      description: joi.buildOptionalStringValidator(),
      emoji: joi.buildOptionalStringValidator(),
      entryId: joi.buildOptionalStringValidator(),
      s3Key: joi.buildOptionalStringValidator(),
    })
  ) as CreateUnObjectInput
}

const authzCreateUnObject = (parent, args, ctx): Promise<UnObject> => {
  const userId: string = jwt.getUserId(ctx.token)
  return authz.authzUserRole(userId, 'MAKER')
    .catch((err) => authz.authzMasterApiKeyOverride(err, ctx.apiKey))
    .then(() => skip)
}

const createUnObject = (parent, args, ctx): Promise<UnObject> => {
  const input: CreateUnObjectInput = validateCreateUnObjectInput(cleanCreateUnObjectInput(args.input))
  const userId: string = jwt.getUserId(ctx.token)
  return core.buildUniqueUsername(input.name)
    .then(username => model.buildUnObject(input, username, userId))
    .then(model.createUnObject)
}

const buildCreateHandledUnObjectInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    handlerUnObjectId: Joi.string().required(),
    name: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    isMakerVisible: Joi.boolean(),
    convoStarter: Joi.string().allow('', null),
  })
}

const createHandledUnObject = (parent, args, ctx): Promise<CreateHandledUnObjectOutput> => {
  const input: CreateHandledUnObjectInput = joi.validate(args.input, buildCreateHandledUnObjectInputSchema())
  const userId: string = jwt.getUserId(ctx.token)
  return getHandlerUnObject(input.handlerUnObjectId)
    .then(sf.thru_if(_.isNil)(misc.throwMeFn(errors.buildInvalidHandlerUnObjectId(input.handlerUnObjectId))))
    .then((handlerUnObject: UnObject) =>
      core.buildUniqueUsername(misc.firstNotEmpty(input.name, handlerUnObject.name))
        .then(username => model.buildHandledUnObject(input, username, userId, handlerUnObject))
    )
    .then(model.createUnObject)
    .then(sf.tap_catch(_.partial(createNewsfeedItemUnObjectCard, ctx)))
    .then(sf.tap_catch(_.partial(createIsMakerVisibleField, ctx, input.isMakerVisible)))
    .then(sf.tap_catch(_.partial(createConvoStarterField, ctx, input.convoStarter)))
    .then((unObject: UnObject) => ({ unObject }))
}

const createIsMakerVisibleField = (ctx: any, isMakerVisible: boolean, unObject: UnObject): Promise<Field> => {
  return core.saveField(null, {
    input: {
      collectionId: buildCollectionId('unObject', unObject.id, 'field'),
      thisEntityId: unObject.id,
      thisEntityType: EntityType.UnObject,
      type: FieldType.BooleanField,
      name: 'isMakerVisible',
      metadata: {
        booleanValue: _.isNil(isMakerVisible)
          ? true
          : misc.isTrue(isMakerVisible),
      },
    },
  }, ctx)
    .then(output => output.field)
}

const createConvoStarterField = (ctx: any, convoStarter: string, unObject: UnObject): Promise<Field> => {
  return core.saveField(null, {
    input: {
      collectionId: buildCollectionId('unObject', unObject.id, 'field'),
      thisEntityId: unObject.id,
      thisEntityType: EntityType.UnObject,
      type: FieldType.StringField,
      name: 'convoStarter',
      metadata: {
        stringValue: convoStarter,
      },
    },
  }, ctx)
    .then(output => output.field)
}

const createNewsfeedItemUnObjectCard = (ctx: any, unObject: UnObject): Promise<NewsfeedItem> => {
  const input: NewsfeedItemTemplate = {
    layout: DynamicFeedItemLayout.Dynamic2,
    fromEid: SYSTEM_USER_EID,
    context: {
      actorEid: `user/${unObject.createdByUserId}`,
      unObjectEid: unObject.eid,
    },
    isPublic: false,
    metadata: {
      statusText: '{{ linkName actor }} just made an object!',
      action: {
        entityId: unObject.id,
        entityType: FeedItemActionEntityType.Npc,
        type: FeedItemActionType.Default,
      },
    },
  }
  return createNewsfeedItem(input)
}

const cleanUpdateUnObjectInput = (input: any): any => cleanCreateUnObjectInput(input)

const validateUpdateUnObjectInput = (input: any): UpdateUnObjectInput => {
  return joi.validate(
    input,
    Joi.object().keys({
      id: Joi.string().required(),
      name: joi.buildOptionalStringValidator(),
      description: joi.buildOptionalStringValidator(),
      emoji: joi.buildOptionalStringValidator(),
      entryId: joi.buildOptionalStringValidator(),
      s3Key: joi.buildOptionalStringValidator(),
    })
  ) as UpdateUnObjectInput
}

const authzUpdateUnObject = (parent, args, ctx): Promise<UnObject> => {
  const input: UpdateUnObjectInput = validateUpdateUnObjectInput(cleanUpdateUnObjectInput(args.input))
  const userId: string = jwt.getUserId(ctx.token)
  return authz.authzUnObjectCreator(userId, input.id)
    .catch((err) => authz.authzMasterApiKeyOverride(err, ctx.apiKey))
    .then(() => skip)
}

const updateUnObject = (parent, args): Promise<UnObject> => {
  const input: UpdateUnObjectInput = validateUpdateUnObjectInput(cleanUpdateUnObjectInput(args.input))
  return store.saveUnObject(model.buildUpdateUnObject(input))
}

const validateUnObjectInput = (input: any): UnObjectInput => {
  return joi.validate(
    input,
    Joi.object().keys({
      id: Joi.string(),
      username: Joi.string(),
    })
  ) as UnObjectInput
}

export const unObject = (parent, args): Promise<UnObject> => {
  const input = validateUnObjectInput(args.input)
  if (input.id) {
    return store.unObjectById(input.id)
  }
  if (input.username) {
    return store.unObjectByUsername(input.username)
  }
  return Promise.resolve(null)
}

export const unObjects = (parent, args: QueryUnObjectsArgs, ctx): Promise<UnObjectsOutput> => {
  const user: User = ctx.user
  const input = joi.validate(args.input, joi.buildUnObjectsInputSchema())
  const cursorValue = !input.isFeatured ? DEFAULT_CURSOR_VALUE : '0'
  const defaultInput = {
    isDestination: input.isDestination,
    isFeatured: input.isFeatured,
    minOccupancy: input.minOccupancy,
    maxOccupancy: input.maxOccupancy,
    pageInput: defaultPageInput(args?.input?.pageInput, cursorValue),
  }

  return chatActions.getActionResolverUnObjects(user)
    .then(unObjects => unObjects
      .filter(uo => !defaultInput.isDestination ? true : uo.isDestination)
      .filter(uo => !defaultInput.isFeatured ? true : uo.isFeatured)
      .filter(uo => !defaultInput.minOccupancy
        ? true
        : uo.minOccupancy >= defaultInput.minOccupancy
      )
      .filter(uo => !defaultInput.maxOccupancy
        ? true
        : uo.maxOccupancy <= defaultInput.maxOccupancy
      )
      .sort(!defaultInput.isFeatured
        ? misc.sortByDesc('createdAt')
        : misc.sortBy('featuredSortKey')
      )
    )
    .then(_.partialRight(pageResult, defaultInput.pageInput))
    .then(result => ({
      unObjects: result.list,
      pageInfo: result.pageInfo,
    }))
}

const unObjectPublishedStoryboard = (): Promise<Storyboard> => {
  return Promise.resolve(null)
}

const unObjectDraftStoryboard = (): Promise<Storyboard> => {
  return Promise.resolve(null)
}

const authzUnObjectStoryboards = (parent, args, ctx): Promise<Storyboard> => {
  const unObject: UnObject = parent
  const userId: string = jwt.getUserId(ctx.token)
  return authz.authzUnObjectCreator(userId, unObject.id)
    .catch((err) => authz.authzMasterApiKeyOverride(err, ctx.apiKey))
    .then(() => skip)
}

const unObjectStoryboards = (): Promise<Storyboard[]> => {
  return Promise.resolve([])
}

const myUnObjects = (parent, args, ctx): Promise<UnObject[]> => {
  const userId: string = jwt.getUserId(ctx.token)
  return model.readUnObjectsByUserId(userId)
}

const authzSessionUserIsUnObjectCreator = (parent, args, ctx): Promise<Action[]> => {
  const userId: string = jwt.getUserId(ctx.token)
  const unObject: UnObject = parent
  return authz.authzUnObjectCreator(userId, unObject.id)
    .catch((err) => authz.authzMasterApiKeyOverride(err, ctx.apiKey))
    .then(() => skip)
}

const unObjectChatRooms = (parent): Promise<{
  chatRooms: ChatRoom[]
}> => {
  return core.mapParentEdgeTypeToThisEntitys<ChatRoom>(EdgeType.ChatRoom)(parent)
    .then(chatRooms => ({ chatRooms }))
}

const unObjectCreatedByUser = (parent: UnObject): Promise<User> => {
  const userId = parent?.createdByUserId
  if (!userId) {
    return Promise.resolve(null)
  }
  return userById(userId)
}

const unObjectIsMyUnObject = (parent, args, ctx): boolean => {
  const sessionUserId: string = jwt.getUserId(ctx.token)
  const createdByUserId: string = _.get(parent, 'createdByUserId', null)
  return sessionUserId === createdByUserId
}

const getHandlerUnObject = (handlerUnObjectId: string): Promise<UnObject> => {
  return chatActions.getActionResolvers()
    .then(actionResolvers => _.find(
      actionResolvers,
      actionResolver => actionResolver.unObjectId == handlerUnObjectId
    ))
    .then(sf.thru_if(misc.isNot(_.isNil))(
      () => store.unObjectById(handlerUnObjectId)
    ))
}

const handlerUnObjects = (root, args, ctx): Promise<HandlerUnObjectsOutput> => {
  return chatActions.getActionResolverUnObjects(ctx.user)
    .then(unObjects => ({ handlerUnObjects: unObjects }))
}

/**
 * @deprecated
 */
export const featuredHandlerUnObjects = (_parent, args: QueryFeaturedHandlerUnObjectsArgs, ctx): Promise<HandlerUnObjectsOutput> => {
  const input = args.input || {}
  joi.validate(input, Joi.object({
    minOccupancy: Joi.number().optional(),
    maxOccupancy: Joi.number().optional(),
  }))

  return chatActions.getActionResolverUnObjects(ctx.user)
    .then(unObjects => unObjects.filter(unObject => unObject.isFeatured))
    .then(unObjects => !input.minOccupancy
      ? unObjects
      : unObjects.filter(a => a.minOccupancy >= input.minOccupancy)
    ).then(unObjects => !input.maxOccupancy
      ? unObjects
      : unObjects.filter(a => !a.maxOccupancy || a.maxOccupancy <= input.maxOccupancy)
    )
    .then(unObjects => unObjects.sort(misc.sortBy('featuredSortKey')))
    .then(handlerUnObjects => ({ handlerUnObjects }))
}

const unObjectReactionEdges = (parent): Promise<{
  edges: Edge[]
  reactionEdges: Edge[]
}> => {
  const unObject: UnObject = parent
  return readEdgesBy({
    where: {
      thisEntityId: unObject.id,
      edgeType: EdgeType.ReactionEdge,
    },
    order: {
      order: 'ASC',
    },
  })
    .then((edges: Edge[]) => ({
      edges,
      reactionEdges: edges,
    }))
}

const activity = (unObject: UnObject): Promise<UnObjectActivity> => {
  const likesStorageKey = `web:share:fake:likes:${unObject.id}`
  const commentsStorageKey = `web:share:fake:comments:${unObject.id}`

  return Promise.all([autoIncrementNumber(likesStorageKey), incrementComments(commentsStorageKey)])
    .then(r => {
      return {
        likesCount: r[0],
        comments: r[1],
      }
    })
}

// TODO temporary for website until NPC have the actual data
const fakeData = (unObject: UnObject): Promise<any> => {
  const actions = getUnObjectFakeActionsWithImgixUrls(unObject.id)
  return Promise.resolve({ actions })
}

//
// The resolvers.
//
export default {
  Query: {
    unObject: unObject,
    myUnObjects: combineResolvers(jwt.requireJwtAuth, myUnObjects),
    handlerUnObjects: combineResolvers(handlerUnObjects),
    featuredHandlerUnObjects: featuredHandlerUnObjects,
    unObjects: combineResolvers(jwt.requireJwtAuth, unObjects),
  },
  Mutation: {
    createUnObject: combineResolvers(jwt.requireJwtGql, authzCreateUnObject, createUnObject),
    createHandledUnObject: combineResolvers(jwt.requireJwtGql, createHandledUnObject),
    updateUnObject: combineResolvers(jwt.requireJwtGql, authzUpdateUnObject, updateUnObject),
  },
  UnObject: {
    text: core.resolveFromEntity<UnObject>('description'),
    publishedStoryboard: combineResolvers(jwt.requireJwtGql, unObjectPublishedStoryboard),
    draftStoryboard: combineResolvers(jwt.requireJwtGql, unObjectDraftStoryboard),
    storyboards: combineResolvers(jwt.requireJwtGql, authzUnObjectStoryboards, unObjectStoryboards),
    entry: core.resolveContentfulEntry,
    image: core.resolveImageNoDefault,
    gradientImage: core.resolveS3KeyPropToImage<UnObject>('gradientS3Key'),
    backgroundImage: core.resolveS3KeyPropToImage<UnObject>('backgroundS3Key'),
    coverImage: core.resolveS3KeyPropToImage<UnObject>('coverS3Key'),
    socialImage: core.resolveS3KeyPropToImage<UnObject>('socialImageS3Key'),
    myEdges: combineResolvers(jwt.requireJwtGql, unObjectMyEdges),
    edgeStats: unObjectEdgeStats,
    eid: core.resolveEid,
    asNode: _.identity,
    chatRooms: combineResolvers(authzSessionUserIsUnObjectCreator, unObjectChatRooms),
    field: core.nodeField,
    isMyUnObject: combineResolvers(jwt.requireJwtAuth, unObjectIsMyUnObject),
    // TODO: hide if maker chose to be anonymous
    createdByUser: unObjectCreatedByUser,
    level: core.resolveLevel,
    presence: core.resolvePresence,
    actionSheet: core.resolveActionSheet,
    tiles: core.resolveTiles,
    privateTiles: core.resolvePrivateTiles,
    reactionEdges: unObjectReactionEdges,
    states: core.resolveHashStatuses,
    hashtributes: core.resolveHashtributes,
    xpField: core.resolveField(xpFieldName),
    backgroundColor: core.resolveColor('backgroundColor'),
    actionSheetBackgroundColor: core.resolveColor('actionSheetBackgroundColor'),
    location: core.resolveLocation,
    worldMapLocation: core.resolveLocation,
    isFollowedByMe: combineResolvers(jwt.requireJwtAuth, core.isFollowed),
    following: combineResolvers(jwt.requireJwtAuth, core.isFollowing),
    isFollowed: combineResolvers(jwt.requireJwtAuth, core.isFollowed),
    isFollowing: combineResolvers(jwt.requireJwtAuth, core.isFollowing),
    activity: activity,
    fakeData: fakeData,
  },
}
