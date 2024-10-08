/**
 * @rob4lderman
 * oct2019
 *
 * handler modules use the ChatRoomActionContextApi and NodeApi.
 * ChatRoomActionContextApi and NodeApi map most of their functions to makerApi (this file)
 * makerApi talks to the runtime code.
 *
 */

import {
  SaveFieldInput,
  SaveFieldOutput,
  CreateChatRoomSystemCommentInput,
  CreateChatRoomSystemCommentOutput,
  NodeType,
  CreateCommentInput,
  CreateCommentOutput,
  CreateEffectOutput,
  CreateEffectInput,
  FieldType,
  SaveEdgeInput,
  ActionSheetOutput,
  SaveActionInput,
  SaveActionOutput,
  SaveTileInput,
  SaveTileOutput,
  CreateNotificationInput,
  CreateNotificationOutput,
  EdgeType,
  EntityScope,
  TileInput,
  TileOutput,
  EffectType,
  AnimationEffectMetadata,
  UpdateUserFields,
  Field,
  Tile,
  Effect,
  NewsfeedItem,
  EntityType,
} from 'src/gql-types'
import {
  Tile as DbTile,
  ActionX,
  User,
  Comment,
  ActionXInstance,
  Edge,
} from 'src/db/entity'
import { SimpleActionXInstanceObject } from 'src/db/entity/ActionXInstance'
import { validate } from 'src/utils/joi'
import * as models from 'src/graphql/models'
import * as actionXModel from 'src/graphql/Action/actionx.model'
import * as edgeModel from 'src/graphql/Activity/edge.model'
import * as chatModel from 'src/graphql/Chat/chat.model'
import * as userModel from 'src/graphql/User/user.model'
import * as store from 'src/graphql/store'
import * as core from 'src/graphql/core'
import * as newsfeedModel from 'src/graphql/Activity/newsfeeditem.model'
import {
  SetGlobalStateInput,
  SetLocalStateInput,
  ActionContext,
  ChatRoomActionContext,
  PercentileFn,
  ChatRoomActionContextApi,
  SetStateInput,
  SetActionInput,
  SaveTileInputInContext,
  NodeContext,
  FieldTemplate,
  TileTemplate,
  EffectTemplate,
  NewsfeedItemTemplate,
  GameNode,
  ActionXInstanceTemplate,
  ActionXInstanceTransferTemplate,
  ActionStubSet,
  JsonObjectFieldMetadata,
  NewsfeedItemContext,
  NewsfeedItemOut,
} from 'src/types'
import {
  ActionResolverFn,
  ActionResolverMap,
  Action,
  ActionXStub,
} from 'src/maker/types'
import _ from 'lodash'
import { LoggerFactory } from 'src/utils/logger'
import {
  misc,
  sf,
  sft,
} from 'src/utils'
import Bluebird from 'bluebird'
import {
  ActionEdgeApiFactory,
  ActionEdgeApi,
} from './ActionEdgeApi'
import { buildUpdateUserFieldsSchema } from 'src/graphql/joi'
import Joi from '@hapi/joi'
import * as actionXResolvers from 'src/graphql/Action/actionx.resolvers'
import * as notifs from 'src/graphql/notifs'
import {
  MakerJobQueueInstance,
  IMakerJob,
  IMakerImplicit,
} from 'src/queue/maker'
import { Job } from 'bull'
import { QueueJobOptions } from 'src/queue/core'
import {
  SoundEffect,
  VibrationEffect,
  SystemMessageEffect,
  ModalEffectFactory,
} from 'src/maker/effects'
import {
  JobQueueInstance,
  DeleteExpiredJob,
} from 'src/queue/generic'
import { UserStateId } from 'src/domain/userStates'

const logger = LoggerFactory('makerApi')

const buildSetStateInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    type: Joi.string().required(),
    name: Joi.string().required(),
    scope: Joi.string(),
    collectionName: Joi.string().allow('', null),
    metadata: Joi.object().allow(null),
    isDeleted: Joi.boolean(),
    expiresAt: Joi.date().allow(null),
  })
}

const mapSetGlobalStateInputToSaveFieldInput = (node: GameNode, input: SetGlobalStateInput): SaveFieldInput => ({
  collectionId: mapEntityToFieldCollectionId(node),
  thisEntityId: node.id,
  thisEntityType: node.entityType,
  scope: input.scope || EntityScope.GlobalScope,
  type: input.type,
  name: input.name,
  collectionName: input.collectionName,
  metadata: input.metadata,
  isDeleted: input.isDeleted,
  expiresAt: input.expiresAt,
})

const buildSetGlobalStateInputSchema = buildSetStateInputSchema

/**
 * @param node
 * @return SaveFieldOutput
 */
export const setGlobalState = (nodeContext: NodeContext, input: SetGlobalStateInput): Promise<SaveFieldOutput> => {
  return Promise.resolve(input)
    .then(input => validate(input, buildSetGlobalStateInputSchema()))
    .then(input => mapSetGlobalStateInputToSaveFieldInput(nodeContext.node, input))
    .then((input: SaveFieldInput) => core.saveField(null, { input }, _.get(nodeContext.context, 'context')) as SaveFieldOutput)
}

const mapEntityToFieldCollectionId = (node: GameNode): string => `${models.mapEntityToEid(node)}/field`

export const getGlobalState = (nodeContext: NodeContext, name: string): Promise<Field> => {
  return store.fieldByCollectionIdName({
    collectionId: mapEntityToFieldCollectionId(nodeContext.node),
    name,
  })
}

const getOrSetGlobalState = (nodeContext: NodeContext, name: string, defaultInput: SetStateInput): Promise<Field> => {
  return getGlobalState(nodeContext, name)
    .then(sf.thru_if((field: Field) => _.isNil(field) && !!!_.isEmpty(defaultInput))(
      () => setGlobalState(nodeContext, defaultInput)
        .then((saveFieldOutput: SaveFieldOutput) => saveFieldOutput.field),
    ))
}

const buildSetLocalStateInputSchema = buildSetStateInputSchema

const mapSetLocalStateInputToSaveFieldInput = (node: GameNode, input: SetLocalStateInput, actionContext: ActionContext): SaveFieldInput => ({
  collectionId: `${actionContext.contextId}/local/${node.id}/field`,
  thisEntityId: node.id,
  thisEntityType: node.entityType,
  type: input.type,
  name: input.name,
  collectionName: input.collectionName,
  metadata: input.metadata,
  isDeleted: input.isDeleted,
  scope: input.scope || EntityScope.ChatRoomScope,
  expiresAt: input.expiresAt,
})

/**
 * @param node
 * @return SaveFieldOutput
 */
export const setLocalState = (nodeContext: NodeContext, input: SetLocalStateInput): Promise<SaveFieldOutput> => {
  return Promise.resolve(input)
    .then(input => validate(input, buildSetLocalStateInputSchema()))
    .then(input => mapSetLocalStateInputToSaveFieldInput(nodeContext.node, input, nodeContext.context))
    .then((input: SaveFieldInput) => core.saveField(null, { input }, _.get(nodeContext.context, 'context')) as SaveFieldOutput)
}

/**
 * TODO: "local" vs "global" is based on the collectionId.  we want it to be based on the scope.
 * @param nodeContext
 * @param name
 */
export const getLocalState = (nodeContext: NodeContext, name: string): Promise<Field> => {
  return store.fieldByCollectionIdName({
    collectionId: `${nodeContext.context.contextId}/local/${nodeContext.node.id}/field`,
    name,
  })
}

const getOrSetLocalState = (nodeContext: NodeContext, name: string, defaultInput: SetStateInput): Promise<Field> => {
  return getLocalState(nodeContext, name)
    .then(sf.thru_if((field: Field) => _.isNil(field) && !!!_.isEmpty(defaultInput))(
      () => setLocalState(nodeContext, defaultInput)
        .then((saveFieldOutput: SaveFieldOutput) => saveFieldOutput.field),
    ))
}

export const incrementLocalState = (nodeContext: NodeContext, name: string, byNumber: number): Promise<SaveFieldOutput> => {
  return getLocalState(nodeContext, name)
    .then(sf.thru_if_else(_.isNil)(
      () => ({
        type: FieldType.NumberField,
        name,
        metadata: {
          numberValue: byNumber,
          delta: byNumber,
        },
      }),
    )(
      (field: Field) => ({
        type: field.type,
        name,
        metadata: _.extend(
          {},
          field.metadata,
          { numberValue: _.get(field, 'metadata.numberValue', 0) + byNumber },
          { delta: byNumber },
        ),
      }),
    ))
    .then((input: SetLocalStateInput) => setLocalState(nodeContext, input))
  // -rx- .then(sf.tap_catch(
  // -rx-     (output: SaveFieldOutput) => core.createIncrementFieldEffect(
  // -rx-         byNumber,
  // -rx-         _.get(nodeContext.context, 'context'),
  // -rx-         _.get(output, 'field')
  // -rx-     )
  // -rx- ))
}

export const incrementGlobalState = (nodeContext: NodeContext, name: string, byNumber: number): Promise<SaveFieldOutput> => {
  return getGlobalState(nodeContext, name)
    .then(sf.thru_if_else(_.isNil)(
      () => ({
        type: FieldType.NumberField,
        name,
        metadata: {
          numberValue: byNumber,
          delta: byNumber,
        },
      }),
    )(
      (field: Field) => ({
        type: field.type,
        name,
        metadata: _.extend(
          {},
          field.metadata,
          { numberValue: _.get(field, 'metadata.numberValue', 0) + byNumber },
          { delta: byNumber },
        ),
      }),
    ))
    .then((input: SetGlobalStateInput) => setGlobalState(nodeContext, input))
  // -rx- .then(sf.tap_catch(
  // -rx-     (output: SaveFieldOutput) => core.createIncrementFieldEffect(
  // -rx-         byNumber,
  // -rx-         _.get(nodeContext.context, 'context'), // gql context
  // -rx-         _.get(output, 'field')
  // -rx-     )
  // -rx- ))
}

const buildCreateChatRoomSystemCommentInput = (visibleToPlayerEids: string[], text: string, actionContext: ChatRoomActionContext): CreateChatRoomSystemCommentInput => ({
  chatRoomId: actionContext.chatRoom.id,
  text,
  visibleToPlayerEids,
})

export const createChatRoomSystemComment = (visibleToPlayerEids: string[], text: string, actionContext: ChatRoomActionContext): Promise<CreateChatRoomSystemCommentOutput> => {
  return Promise.resolve(buildCreateChatRoomSystemCommentInput(visibleToPlayerEids, text, actionContext))
    .then((input: CreateChatRoomSystemCommentInput) => core.createChatRoomSystemComment(
      null,
      { input },
      actionContext.context,
    ) as any as Promise<CreateChatRoomSystemCommentOutput>)
}

const buildCreateCommentInput = (author: GameNode, text: string, actionContext: ChatRoomActionContext): CreateCommentInput => ({
  type: NodeType.ChatRoomComment,
  collectionId: models.buildCollectionId(actionContext.contextId, 'comment'),
  authorEid: models.mapEntityToEid(author),
  text,
})

export const saveComment = (nodeContext: NodeContext, text: string): Promise<Comment> => {
  return createChatRoomComment(nodeContext.node, text, nodeContext.context)
    .then(sf.lens<Comment>('comment').get)
}

/**
 * @deprecated - use saveComment
 */
export const createChatRoomComment = (author: GameNode, text: string, actionContext: ChatRoomActionContext): Promise<any> => {
  return Promise.resolve(buildCreateCommentInput(author, text, actionContext))
    .then((input: CreateCommentInput) => core.createComment(
      null,
      { input },
      actionContext.context,
    ) as any as Promise<CreateCommentOutput>)
    .then(sf.tap_catch(() => core.updateChatRoomOrder(models.mapEidToId(actionContext.contextId))))
}

export const selectByUniformDist = (fns: PercentileFn[]): any => {
  const r = _.random(0, 1, true)
  const fn = _.find(fns, (fn: PercentileFn) => r <= fn.percentile)
  logger.log('selectByUniformDist', { r, fn })
  return _.result(fn, 'do')
}

export const useActionResolverMap = (actionResolverMap: ActionResolverMap): ActionResolverFn => {
  actionResolverMap = _.mapKeys(actionResolverMap, (val, key) => _.toLower(key))
  return (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
    const actionName = _.get(args.input, 'name')
    const handlerFn = _.get(actionResolverMap, _.toLower(actionName))
    return handlerFn
      ? handlerFn(contextApi, args)
      : Promise.reject(misc.throwMe(new Error(`ERROR: action name not recognized: ${actionName}`)))
  }
}

export const composeActionResolvers = (...actionResolverFns: ActionResolverFn[]): ActionResolverFn => {
  return (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
    return Bluebird.Promise.mapSeries(
      actionResolverFns,
      (resolverFn: ActionResolverFn) => resolverFn(contextApi, args),
    )
  }
}

export const createEffect = (input: CreateEffectInput, actionContext: ChatRoomActionContext): Promise<CreateEffectOutput> => {
  return core.createEffect(null, { input }, actionContext.context)
}

const mapNewsfeedItemTemplateToCreateNewsfeedItemInput = (input: NewsfeedItemTemplate, actionContext: ChatRoomActionContext): NewsfeedItemTemplate => {
  // We take the values from maker and augment with built-in ones based on the ChatRoomActionContext
  const context: NewsfeedItemContext = { actorEid: models.mapEntityRefToEid(actionContext.actor), ...input.context }
  if (!('partnerEid' in context)) {
    // Re-search in case the consumer overwrote the default actor(Eid)
    const actor = actionContext.players.find(p => models.mapEntityRefToEid(p) === context.actorEid)
    context.partnerEid = models.mapEntityRefToEid(models.getPartner(actionContext.players, actor))
  }
  if (!('unObjectEid' in context)) {
    context.unObjectEid = models.mapEntityRefToEid(actionContext.unObject)
  }
  // Delete needless data from context
  const { statusText } = input.metadata
  if (!/partner ?}}/.test(statusText)) {
    delete context.partnerEid
  }
  if (!/unObject ?}}/.test(statusText)) {
    delete context.unObjectEid
  }
  const fromEid = input.fromEid || input.userId && models.buildEid(EntityType.User, input.userId) || context.actorEid
  return { ...input, fromEid, context }
}

export const saveNewsfeedItem = (actionContext: ChatRoomActionContext, input: NewsfeedItemTemplate): Promise<NewsfeedItem | null> => {
  return newsfeedModel.createNewsfeedItem(
    mapNewsfeedItemTemplateToCreateNewsfeedItemInput(input, actionContext)
  ).then(sft.tap_catch(
    (newsFeedItem: NewsfeedItem) => {
      if (_.isNil(newsFeedItem) || _.isNil(newsFeedItem.expiresAt)) {
        return null
      }
      return JobQueueInstance.add<DeleteExpiredJob>({
        dispatchAt: newsFeedItem.expiresAt,
        id: newsFeedItem.id,
        type: EntityType.NewsfeedItem,
      }, {}, 'DeleteExpired')
    }
  ))
}

export const inactivateLiveNewsfeedItem = (nodeContext: NodeContext, stateId: UserStateId): Promise<NewsfeedItem | null> => {
  return newsfeedModel.inactivateLiveNewsfeedItemBy(nodeContext.node.id, stateId)
    .then((item: NewsfeedItemOut) => item)
}

const saveEdge = (input: SaveEdgeInput): Promise<Edge> => core.saveEdge(input)

const saveEdges = (input: SaveEdgeInput[]): Promise<Edge[]> => core.saveEdges(input)

// -rx- const deleteEdge = (input:SaveEdgeInput, context:ActionContext) => core.saveEdge( 
// -rx-     null,
// -rx-     { input: _.extend( input, { isDeleted: true } ) },
// -rx-     _.get( context, 'context' ),
// -rx- );

export const getActionSheet = (node: GameNode): Promise<ActionSheetOutput> => core.resolveActionSheet(node)

// -rx- export const addActionByName = ( actionName:string, node:GameNode, context:ActionContext): Promise<SaveEdgeOutput> => {
// -rx-     return actionXByNameCache.get( actionName )
// -rx-         .then( sf.thru_if( _.isNil )(
// -rx-             () => { throw new Error( `Action with name ${actionName} doesn't exist`); }
// -rx-         ))
// -rx-         .then( (action:ActionX) => ({
// -rx-             thisEntityId: node.id,
// -rx-             thisEntityType: node.entityType,
// -rx-             thatEntityId: action.id,
// -rx-             thatEntityType: action.entityType,
// -rx-             edgeType: EdgeType.ActionX,
// -rx-             collectionName: 'actionSheet',
// -rx-         }))
// -rx-         .then( (input:SaveEdgeInput) => saveEdge( input, context )) 
// -rx-         ;
// -rx- };
// -rx- 
// -rx- export const removeActionByName = ( actionName:string, node:GameNode, context:ActionContext): Promise<SaveEdgeOutput> => {
// -rx-     return actionXByNameCache.get( actionName )
// -rx-         .then( sf.thru_if( _.isNil )(
// -rx-             () => { throw new Error( `Action with name ${actionName} doesn't exist`); }
// -rx-         ))
// -rx-         .then( (action:ActionX) => ({
// -rx-             thisEntityId: node.id,
// -rx-             thisEntityType: node.entityType,
// -rx-             thatEntityId: action.id,
// -rx-             thatEntityType: action.entityType,
// -rx-             edgeType: EdgeType.ActionX,
// -rx-             collectionName: 'actionSheet',
// -rx-         }))
// -rx-         .then( (input:SaveEdgeInput) => deleteEdge( input, context )) 
// -rx-         ;
// -rx- };

export const saveAction = (input: SaveActionInput): Promise<Action> =>
  core.saveAction(null, { input })
    .then((output: SaveActionOutput) => actionXModel.fillActionXTags(output.action as any))

export const createNotification = (input: CreateNotificationInput, actionContext: ActionContext): Promise<CreateNotificationOutput> => {
  return notifs.createNotification(null, { input }, actionContext.context)
    .then(sf.tap(({ notification }) => notifs.sendPushNotification(notification)))
}

const buildSetActionInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    name: Joi.string().required(),
    quantity: Joi.number().integer(),
    isDeleted: Joi.boolean(),
    isDisabled: Joi.boolean(),
    order: Joi.string().allow('', null),
  })
}

const mapSetLocalActionToSaveEdgeInput = (input: SetActionInput, action: ActionX, node: GameNode, actionContext: ActionContext): SaveEdgeInput => ({
  thisEntityId: node.id,
  thisEntityType: node.entityType,
  thatEntityId: action.id,
  thatEntityType: action.entityType,
  edgeType: EdgeType.ActionX,
  order: misc.firstNotEmpty(input.order, action.order, action.name),
  name: action.name,
  collectionName: 'actionSheet',
  collectionId: `${actionContext.contextId}/local/${node.id}/edge`, // TODO: actionxedge ?
  metadata: _.pick(input, [
    'quantity',
    'isDisabled',
  ]),
  ..._.pick(input, [
    'isDeleted',
  ]),
})

/**
 * NOTE: the only diff between setLocalAction and setGlobalAction is the collectionId,
 * but the Edge is uniquely identified by this/that/edgeType.  So if setGlobalAction
 * and setLocalAction w/ the same action, you'll just be updating the collectionId
 * of the same Edge.
 *
 * @param nodeContext
 * @param input
 */
export const setLocalAction = (nodeContext: NodeContext, input: SetActionInput): Promise<Edge> => {
  input = validate(input, buildSetActionInputSchema())
  return store.actionByName(input.name)
    .then(sf.thru_if(_.isNil)(
      () => {
        throw new Error(`Action with name ${input.name} doesn't exist`)
      },
    ))
    .then((action: ActionX) => mapSetLocalActionToSaveEdgeInput(input, action, nodeContext.node, nodeContext.context))
    .then(saveEdge)
}

// ugh: need action refactor.
export const setLocalActionNoPublish = (nodeContext: NodeContext, input: SetActionInput): Promise<Edge> => {
  input = validate(input, buildSetActionInputSchema())
  return store.actionByName(input.name)
    .then(sf.thru_if(_.isNil)(
      () => {
        throw new Error(`Action with name ${input.name} doesn't exist`)
      },
    ))
    .then((action: ActionX) => mapSetLocalActionToSaveEdgeInput(input, action, nodeContext.node, nodeContext.context))
    .then(core.saveEdgeNoPublish)
}

export const setLocalActions = (nodeContext: NodeContext, input: SetActionInput[]): Promise<Edge[]> => {
  input = validate(input, Joi.array().items(buildSetActionInputSchema()))
  return Promise.resolve(input)
    .then(sf.list_fmap_wait(
      (input: SetActionInput) => store.actionByName(input.name)
        .then(sf.thru_if(_.isNil)(
          () => {
            throw new Error(`Action with name ${input.name} doesn't exist`)
          },
        ))
        .then((action: ActionX) => mapSetLocalActionToSaveEdgeInput(input, action, nodeContext.node, nodeContext.context)),
    ))
    .then(saveEdges)
}

export const setLocalActionsNoPublish = (nodeContext: NodeContext, input: SetActionInput[]): Promise<Edge[]> => {
  input = validate(input, Joi.array().items(buildSetActionInputSchema()))
  return Promise.resolve(input)
    .then(sf.list_fmap_wait(
      (input: SetActionInput) => store.actionByName(input.name)
        .then(sf.thru_if(_.isNil)(
          () => {
            throw new Error(`Action with name ${input.name} doesn't exist`)
          },
        ))
        .then((action: ActionX) => mapSetLocalActionToSaveEdgeInput(input, action, nodeContext.node, nodeContext.context)),
    ))
    .then(core.saveEdgesNoPublish)
}

const mapSetGlobalActionToSaveEdgeInput = (input: SetActionInput, action: ActionX, node: GameNode): SaveEdgeInput => ({
  thisEntityId: node.id,
  thisEntityType: node.entityType,
  thatEntityId: action.id,
  thatEntityType: action.entityType,
  edgeType: EdgeType.ActionX,
  name: action.name,
  order: misc.firstNotEmpty(input.order, action.order, action.name),
  collectionName: 'actionSheet',
  collectionId: `${models.mapEntityToEid(node)}/edge`,
  metadata: _.pick(input, [
    'quantity',
    'isDisabled',
  ]),
  ..._.pick(input, [
    'isDeleted',
  ]),
})

export const setGlobalAction = (nodeContext: NodeContext, input: SetActionInput): Promise<Edge> => {
  input = validate(input, buildSetActionInputSchema())
  return store.actionByName(input.name)
    .then(sf.thru_if(_.isNil)(
      () => {
        throw new Error(`Action with name ${input.name} doesn't exist`)
      },
    ))
    .then((action: ActionX) => mapSetGlobalActionToSaveEdgeInput(input, action, nodeContext.node))
    .then(saveEdge)
}

export const setGlobalActions = (nodeContext: NodeContext, input: SetActionInput[]): Promise<Edge[]> => {
  input = validate(input, Joi.array().items(buildSetActionInputSchema()))
  return Promise.resolve(input)
    .then(sf.list_fmap_wait(
      (input: SetActionInput) => store.actionByName(input.name)
        .then(sf.thru_if(_.isNil)(
          () => {
            throw new Error(`Action with name ${input.name} doesn't exist`)
          },
        ))
        .then((action: ActionX) => mapSetGlobalActionToSaveEdgeInput(input, action, nodeContext.node)),
    ))
    .then(saveEdges)
}

export const setGlobalActionsNoPublish = (nodeContext: NodeContext, input: SetActionInput[]): Promise<Edge[]> => {
  input = validate(input, Joi.array().items(buildSetActionInputSchema()))
  return Promise.resolve(input)
    .then(sf.list_fmap_wait(
      (input: SetActionInput) => store.actionByName(input.name)
        .then(sf.thru_if(_.isNil)(
          () => {
            throw new Error(`Action with name ${input.name} doesn't exist`)
          },
        ))
        .then((action: ActionX) => mapSetGlobalActionToSaveEdgeInput(input, action, nodeContext.node)),
    ))
    .then(core.saveEdgesNoPublish)
}

export const getActionByName = (name: string): Promise<ActionX> => store.actionByName(name)

export const getActionsByName = (names: string[]): Promise<ActionX[]> => {
  return sft.promiseMap(_.compact(names), getActionByName)
    .then(actions => actions.filter(action => !!action))
}

export const deleteLocalActions = (nodeContext: NodeContext): Promise<Edge[]> => {
  return store.readThatEntitiesOfEdges({
    thisEntityId: nodeContext.node.id,
    collectionName: 'actionSheet',
    collectionId: `${nodeContext.context.contextId}/local/${nodeContext.node.id}/edge`,
    isDeleted: false,
  })
    .then(sf.list_fmap(
      (action: ActionX) => ({
        name: _.get(action, 'name'),
        isDeleted: true,
      }),
    ))
    .then((input: SetActionInput[]) => setLocalActions(nodeContext, input))
}

/**
 * @param nodeContext
 * @param actionName
 * @return the ActionEdge between the given node (user/unObject) and the given actionName.
 *         if the ActionEdge does not exist, it is NOT created by this method.
 */
export const getActionEdge = (nodeContext: NodeContext, actionName: string): Promise<ActionEdgeApi> => {
  return getActionByName(actionName)
    .then((action: ActionX) => readActionEdge(action, nodeContext.node))
    .then(sf.maybe_fmap(
      edge => ActionEdgeApiFactory(edge, _.get(nodeContext.context, 'context')),
    ))
}

const readActionEdge = (action: ActionX, node: GameNode): Promise<Edge> => {
  if (_.isEmpty(action) || _.isEmpty(node)) {
    return Promise.resolve(null)
  }
  return store.edgeByThisThatIdsEdgeType({
    thisEntityId: node.id,
    thatEntityId: action.id,
    edgeType: EdgeType.ActionX,
  })
}

export const mapTileToSaveTileInputInContext = (tile: Tile): SaveTileInputInContext => ({
  name: tile.name,
  type: tile.type,
  metadata: tile.metadata,
})

/**
 * 1. read the user's edges to the given actions (if they exist)
 * 2. createOrUpdate the currentActions EdgeSetField
 *
 * The final set of actions is the intersection between:
 *      1. the given actionNames
 *      2. the user's ActionEdges
 *
 * @return SaveFieldOutput
 */
export const setCurrentActionEdges = (nodeContext: NodeContext, actionNames: string[]): Promise<SaveFieldOutput> => {
  return getActionsByName(actionNames)
    .then(sf.list_fmap_wait(sf.maybe_fmap(
      (action: ActionX) => readActionEdge(action, nodeContext.node),
    )))
    .then(_.compact)
    .then(edges => _.reject(edges, (edge: Edge) => edge.isDeleted))
    .then(
      (edges: Edge[]) => setLocalState(
        nodeContext,
        {
          type: FieldType.ActionXEdgesField,
          name: 'currentActionEdges',
          metadata: {
            edgeIds: _.map(edges, edge => _.get(edge, 'id')),
            actionXIds: _.map(edges, edge => _.get(edge, 'thatEntityId')),
            actionEdges: edges,
          },
        },
      ),
    )
}

export const saveCurrentActionStubs = (nodeContext: NodeContext, actionStubSet: ActionStubSet): Promise<Field> => {
  return actionStubSet.staticActionNames || actionStubSet.actionInstanceNames
    ? saveCurrentActionStubsByName(nodeContext, actionStubSet.staticActionNames, actionStubSet.actionInstanceNames)
    : saveCurrentActionStubsHelper(nodeContext, actionStubSet.staticActionStubs, actionStubSet.actionInstanceStubs)
}

const saveCurrentActionStubsByName = (nodeContext: NodeContext, staticActionNames: string[], actionInstanceNames: string[] = []): Promise<Field> => {
  return saveCurrentActionStubsHelper(
    nodeContext,
    _.map(staticActionNames, actionName => ({ actionName })),  // this is mapping actionNames -> ActionXStubs
    _.map(actionInstanceNames, actionName => ({ actionName })),
  )
}

const augmentActionStub = (action: ActionXStub): ActionXStub => {
  const stub: ActionXStub = { isGivable: action.isUsable === false, isUsable: !action.isGivable, ...action }
  for (const key in stub) {
    // Delete all falses and empty arrays so the payload is less massive
    if (stub[key] === false || stub[key]?.length === 0) {
      delete stub[key]
    }
  }
  return stub
}

const saveCurrentActionStubsHelper = (nodeContext: NodeContext, staticActionStubs: ActionXStub[], actionInstanceStubs: ActionXStub[] = []): Promise<Field> => {
  return saveField(nodeContext, {
    type: FieldType.ActionXStubsField,
    name: 'currentActionStubs',
    scope: EntityScope.ChatRoomPrivateScope,
    metadata: {
      staticActionStubs: staticActionStubs.map(augmentActionStub),
      actionInstanceStubs: actionInstanceStubs.map(augmentActionStub),
    },
  })
}

type ActionXPromiseMap = { [key: string]: Promise<ActionX[]> }

// TODO: should use actionXsByPackageCache in action.cache.ts
const cachedActionsByPackagePromises: ActionXPromiseMap = {}

export const getActionsByPackageName = (packageName: string): Promise<ActionX[]> => {
  if (_.isNil(cachedActionsByPackagePromises[packageName])) {
    cachedActionsByPackagePromises[packageName] = actionXModel.readActionXsBy({
      package: packageName,
      isDeleted: false,
    })
  }
  return cachedActionsByPackagePromises[packageName]
}

// TODO: should use a new cache in action.cache.ts
const cachedActionsByUnObjectIdPromises: ActionXPromiseMap = {}

export const getActionsByUnObjectId = (unObjectId: string): Promise<ActionX[]> => {
  if (_.isNil(cachedActionsByUnObjectIdPromises[unObjectId])) {
    cachedActionsByUnObjectIdPromises[unObjectId] = actionXModel.readActionXsBy({ unObjectId, isDeleted: false })
  }
  return cachedActionsByUnObjectIdPromises[unObjectId]
}

/**
 * @deprecated - use saveCurrentActionStubsByPackageName('core')
 * This function is used in U2U chat rooms.
 * Set the ChatRoom's currentActionEdges Field for this player (node) to
 * the player's set of global action edges
 */
export const setCurrentActionEdgesToGlobalActionEdges = (nodeContext: NodeContext): Promise<SaveFieldOutput> => {
  // TODO: cache
  return edgeModel.readEdgesBy({
    where: {
      thisEntityId: nodeContext.node.id,
      collectionId: models.buildCollectionId(models.mapEntityRefToEid(nodeContext.node), 'edge'),
      edgeType: EdgeType.ActionX,
      isDeleted: false,
    },
    order: {
      order: 'ASC',
    },
  })
    .then(
      (edges: Edge[]) => setLocalState(
        nodeContext,
        {
          type: FieldType.ActionXEdgesField,
          name: 'currentActionEdges',
          metadata: {
            edgeIds: _.map(edges, edge => _.get(edge, 'id')),
            actionXIds: _.map(edges, edge => _.get(edge, 'thatEntityId')),
            actionEdges: edges,
          },
        },
      ),
    )
}

/**
 * @deprecated - ActionXEdges are no longer used; use saveCurrentActionStubs  / createActionInstance
 */
const createLocalActionEdge = (nodeContext: NodeContext, action: ActionX): Promise<Edge> => {
  if (_.isEmpty(action) || _.isEmpty(nodeContext.node)) {
    return Promise.resolve(null)
  }
  return setLocalActionNoPublish(nodeContext, { name: action.name })
}

/**
 * @deprecated - ActionXEdges are no longer used; use saveCurrentActionStubs  / createActionInstance
 */
const readOrCreateLocalActionEdge = (nodeContext: NodeContext, action: ActionX): Promise<Edge> => {
  return readActionEdge(action, nodeContext.node)
    .then(sf.thru_if(_.isNil)(
      () => createLocalActionEdge(nodeContext, action),
    ))
}

/**
 * @deprecated - ActionXEdges are no longer used; use saveCurrentActionStubs  / createActionInstance
 */
export const readOrCreateLocalActionEdges = (nodeContext: NodeContext, actionNames: string[]): Promise<unknown[]> => {
  return getActionsByName(actionNames)
    .then(sf.list_fmap_wait(sf.maybe_fmap(
      (action: ActionX) => readOrCreateLocalActionEdge(nodeContext, action),
    )))
}

const mapFieldToSetStateInput = (input: Field | FieldTemplate<JsonObjectFieldMetadata>): SetStateInput => ({
  type: input.type,
  name: input.name,
  scope: input.scope,
  collectionName: (input as any).collectionName,
  metadata: input.metadata,
  isDeleted: _.defaultTo(_.get(input, 'isDeleted'), false),
  expiresAt: input.expiresAt,
})

/**
 * NOTE: if the field already exists, field.metadata will be merged with input.metadata,
 *       so that new keys added to input.metadata will be set into field.metadata.
 *       Note this does NOT automatically save those new keys to the db, it just merges
 *       them into the returned field.  A subsequent saveField(field) will save the new
 *       keys to the DB.
 *
 * @return Promise<Field>
 */
export const field = <T>(nodeContext: NodeContext, input: FieldTemplate<T>): Promise<Field> => {
  return models.isLocalScope(input.scope)
    ? getOrSetLocalState(nodeContext, input.name, mapFieldToSetStateInput(input))
      .then((field: Field) => _.extend(field, { metadata: _.defaults(field.metadata, input.metadata) }))
    : getOrSetGlobalState(nodeContext, input.name, mapFieldToSetStateInput(input))
      .then((field: Field) => _.extend(field, { metadata: _.defaults(field.metadata, input.metadata) }))
}

export const saveField = <T>(nodeContext: NodeContext, input: FieldTemplate<T> | Field): Promise<Field> => {
  return Promise.resolve(null)
    .then(() => models.isLocalScope(input.scope)
      ? setLocalState(nodeContext, mapFieldToSetStateInput(input))
        .then(output => output.field)
      : setGlobalState(nodeContext, mapFieldToSetStateInput(input))
        .then(output => output.field)
    )
    .then(sft.tap_catch(
      (field: Field) => {
        // queue all fields to be deleted upon expiration
        if (_.isNil(field.expiresAt)) {
          return null
        }
        return JobQueueInstance.add<DeleteExpiredJob>({
          dispatchAt: field.expiresAt,
          id: field.id,
          type: EntityType.Field,
        }, {}, 'DeleteExpired')
      }
    ))
}

export const incrementField = <T>(nodeContext: NodeContext, input: FieldTemplate<T> | Field, delta: number): Promise<Field> => {
  return field(nodeContext, input as FieldTemplate<T>)
    .then(
      (field: Field) => ({
        ...field,
        metadata: _.extend(
          {},
          field.metadata,
          { numberValue: _.get(field, 'metadata.numberValue', 0) + delta },
          { delta },
        ),
      }),
    )
    .then(_.partial(saveField, nodeContext))
}

export const buildLocalCollectionId = (nodeContext: NodeContext, suffix: string = null): string => {
  return models.buildCollectionId(nodeContext.context.contextId, 'local', nodeContext.node.id, suffix)
}

export const buildGlobalCollectionId = (nodeContext: NodeContext, suffix: string = null): string => {
  return models.buildCollectionId(models.mapEntityRefToEid(nodeContext.node), suffix)
}

const mapTileToTileInput = (nodeContext: NodeContext, input: Tile | TileTemplate): TileInput => ({
  name: input.name,
  collectionId: models.isLocalScope(input.scope)
    ? buildLocalCollectionId(nodeContext, 'tile')
    : buildGlobalCollectionId(nodeContext, 'tile'),

})

const mapTileToSaveTileInput = (nodeContext: NodeContext, input: Tile | TileTemplate): SaveTileInput => ({
  type: input.type,
  name: input.name,
  scope: input.scope,
  metadata: input.metadata,
  isDeleted: _.defaultTo(_.get(input, 'isDeleted'), false),
  thisEid: models.mapEntityRefToEid(nodeContext.node),
  collectionId: models.isLocalScope(input.scope)
    ? buildLocalCollectionId(nodeContext, 'tile')
    : buildGlobalCollectionId(nodeContext, 'tile'),

})

export const tile = (nodeContext: NodeContext, input: TileTemplate): Promise<DbTile> => {
  return Promise.resolve(mapTileToTileInput(nodeContext, input))
    .then((tileInput: TileInput) => core.nodeTile(nodeContext.node, { input: tileInput }))
    .then((output: TileOutput) => output.tile)
    .then(sf.thru_if((val) => _.isNil(val) && !!!_.isEmpty(input))(
      () => saveTile(nodeContext, input),
    ))
}

export const coreSaveTile = (input: SaveTileInput, context: ActionContext): Promise<SaveTileOutput> => {
  return core.saveTile(null, { input }, _.get(context, 'context'))
}

export const coreSaveTiles = (input: SaveTileInput[], context: ActionContext): Promise<SaveTileOutput[]> => {
  return core.saveTiles(null, { input }, _.get(context, 'context'))
}

export const coreSaveTileNoPublish = (input: SaveTileInput, context: ActionContext): Promise<SaveTileOutput> => {
  return core.saveTileNoPublish(null, { input }, _.get(context, 'context'))
}

export const saveTile = (nodeContext: NodeContext, input: TileTemplate | Tile): Promise<Tile> => {
  return Promise.resolve(mapTileToSaveTileInput(nodeContext, input))
    .then(stInput => coreSaveTile(stInput, nodeContext.context))
    .then(output => output.tile)
}

export const saveTiles = (nodeContext: NodeContext, inputs: TileTemplate[] | Tile[]): Promise<any[]> => {
  return Promise.resolve(inputs)
    .then(sf.list_fmap(_.partial(mapTileToSaveTileInput, nodeContext)))
    .then((stInputs: SaveTileInput[]) => coreSaveTiles(stInputs, nodeContext.context))
    .then(sf.list_fmap((output: SaveTileOutput) => output.tile))
}

export const saveTileNoPublish = (nodeContext: NodeContext, input: TileTemplate | Tile): Promise<Tile> => {
  return Promise.resolve(mapTileToSaveTileInput(nodeContext, input))
    .then((stInput: SaveTileInput) => coreSaveTileNoPublish(stInput, nodeContext.context))
    .then((output: SaveTileOutput) => output.tile)
}

const mapEffectToCreateEffectInput = <TMeta>(nodeContext: NodeContext, input: EffectTemplate<TMeta>): CreateEffectInput => ({
  type: input.type,
  scope: input.scope,
  metadata: input.metadata,
  thisEid: models.mapEntityRefToEid(nodeContext.node),
  collectionId: models.isLocalScope(input.scope)
    ? buildLocalCollectionId(nodeContext, 'effect')
    : buildGlobalCollectionId(nodeContext, 'effect'),

})

export const saveEffect = <TMeta>(nodeContext: NodeContext, input: EffectTemplate<TMeta>): Promise<Effect> => {
  return Promise.resolve(mapEffectToCreateEffectInput(nodeContext, input))
    .then(ceInput => createEffect(ceInput, nodeContext.context))
    .then(output => output.effect)
}

const metadataTileIdLens = sf.lens('metadata.tileId')
const metadataTileNameLens = sf.lens('metadata.tileName')

const setTileDatantoAnimationSequenceEffectTemplate = <TMeta>(input: EffectTemplate<TMeta>, tile: Tile): EffectTemplate<TMeta> => {
  const animations: AnimationEffectMetadata[] = _.get(input, 'metadata.animationSequence.animations', [])
  const newAnimations = animations.map((meta): AnimationEffectMetadata => ({
    ...meta, tileId: tile.id, tileName: tile.name,
  }))
  return _.merge(input, {
    metadata: {
      animationSequence: {
        animations: newAnimations,
      },
    },
  })
}

const setTileDataIntoEffectTemplate = <TMeta>(input: EffectTemplate<TMeta>, tile: Tile): EffectTemplate<TMeta> => {
  return _.chain(input)
    .thru(metadataTileIdLens.set(tile.id))
    .thru(metadataTileNameLens.set(tile.name))
    .thru(
      (input: EffectTemplate<TMeta>) => _.get(input, 'type') == EffectType.AnimationSequenceEffect
        ? setTileDatantoAnimationSequenceEffectTemplate(input, tile)
        : input
    )
    .value()
}

export const saveEffectOnTile = <TMeta>(nodeContext: NodeContext, input: EffectTemplate<TMeta>, tileInput: TileTemplate | Tile): Promise<Effect> => {
  return Promise.resolve(tileInput)
    .then(sf.thru_if((tileInput) => _.isEmpty(_.get(tileInput, 'id')))(
      (tileInput) => tile(nodeContext, tileInput),
    ))
    .then((tile: Tile) => setTileDataIntoEffectTemplate(input, tile))
    .then((input1: EffectTemplate<TMeta>) => saveEffect(nodeContext, input1))
}

export const deleteComments = (nodeContext: NodeContext): Promise<any> => {
  return chatModel.updateCommentsBy(
    {
      isDeleted: false,
      collectionId: models.buildCollectionId(nodeContext.context.contextId, 'comment'),
      ...(
        models.isChatRoom(nodeContext.node)
          ? {}
          : { authorEid: models.mapEntityToEid(nodeContext.node) }
      ),
    },
    {
      isDeleted: true,
    },
  )
    .then(sf.tap((res) => logger.debug('deleteComments', { res })))
    .then(() => null)  // unsafe to return, causes gql error: TypeError: Converting circular structure to JSON
}

export const updateUserFields = (nodeContext: NodeContext, updatedFields: UpdateUserFields): Promise<User> => {
  if (!!!models.isUser(nodeContext.node)) {
    return Promise.reject(new Error(`ERROR: makerApi.updateUserFields: node is not a User: ${nodeContext.node.entityType}`))
  }
  if (nodeContext.node.id !== _.get(nodeContext, 'context.context.user.id')) {
    return Promise.reject(new Error(`ERROR: makerApi.updateUserFields: node is not the session User: ${nodeContext.node.id} !== ${_.get(nodeContext, 'context.context.user.id')}`))
  }
  return Promise.resolve(updatedFields)
    .then((updatedFields: UpdateUserFields) => validate(updatedFields, buildUpdateUserFieldsSchema()))
    .then(updatedFields => store.saveUser(
      nodeContext.node as User,
      userModel.updateUserFields(nodeContext.node as User, updatedFields)
    ))
}

export const scheduleJob = <T>(actionContext: ChatRoomActionContext, input: IMakerImplicit<T>, opts?: QueueJobOptions): Promise<Job<IMakerJob<T>>> => {
  return MakerJobQueueInstance.add({
    id: input.id,
    chatRoomId: actionContext.chatRoom.id,
    sessionUserId: actionContext.sessionUser.id,
    trackingId: actionContext.context.trackingId,
    actionName: input.actionName,
    dispatchAt: input.dispatchAt,
    args: (input as any).args || {},
  }, opts)
}

export const cancelJob = (id: string): Promise<void> => {
  return MakerJobQueueInstance.cancel(id)
}

export const createActionInstance = (nodeContext: NodeContext, input: ActionXInstanceTemplate): Promise<ActionXInstance> => {
  return Promise.resolve(input)
    .then(sf.lens('playerEid').set(models.mapEntityToEid(nodeContext.node)))
    .then(actionXResolvers.createActionXInstance)
}

export const deleteActionInstance = (nodeContext: NodeContext, input: ActionXInstanceTemplate): Promise<ActionXInstance> => {
  return Promise.resolve(input)
    .then(sf.lens('playerEid').set(models.mapEntityToEid(nodeContext.node)))
    .then(actionXResolvers.deleteActionXInstance)
}

export const transferActionInstance = (nodeContext: NodeContext, input: ActionXInstanceTransferTemplate): Promise<ActionXInstance> => {
  return Promise.resolve(input)
    .then(sf.lens('playerEid').set(models.mapEntityToEid(nodeContext.node)))
    .then(actionXResolvers.transferActionXInstance)
}

export const readActionInstanceById = (id: string): Promise<SimpleActionXInstanceObject | undefined> => {
  return actionXResolvers.readActionXInstance({ id, isDeleted: false })
}

export const readActionInstanceByPlayerEidAndId = (nodeContext: NodeContext, id: string): Promise<SimpleActionXInstanceObject | undefined> => {
  return readAllActionInstances(nodeContext).then(instances => instances.find(instance => instance.id === id))
}

export const readActionInstances = (nodeContext: NodeContext, actionName: string): Promise<SimpleActionXInstanceObject[]> => {
  return readAllActionInstances(nodeContext).then(instances => instances.filter(instance => instance.actionName === actionName))
}

export const countActionInstances = (nodeContext: NodeContext, actionName: string): Promise<number> => {
  return readActionInstances(nodeContext, actionName).then(instances => instances.length)
}

export const readAllActionInstances = (nodeContext: NodeContext): Promise<SimpleActionXInstanceObject[]> => {
  return store.actionXInstancesByPlayer(models.mapEntityToEid(nodeContext.node))
}

export const getByEid = (eid: string): Promise<GameNode | undefined> => {
  return store.entityByEid(eid)
}

/**
 * Returns false if the users aren't friends or thisUser is blocked by thatUser
 */
export const isFriendedBy = (nodeContext: NodeContext, thatId: string): Promise<boolean> => {
  return core.friendshipGraph({ thisId: nodeContext.node.id, thatId })
    .then(({ thisUser }) => thisUser.isFriend && !thisUser.isBlocked)
}

// This method is more "raw" than the usual access, due to circular dependencies I had to expose this via NodeApi
export const fieldsByType = (nodeContext: NodeContext, type: FieldType): Promise<Field[]> => {
  const eid = models.mapEntityToEid(nodeContext.node)
  return store.fieldsByCollectionIdType({ collectionId: `${eid}/field`, type })
}

export const soundEffects = (nodeContext: NodeContext): SoundEffect => new SoundEffect(_.partial(saveEffect, nodeContext), _.partial(mapEffectToCreateEffectInput, nodeContext))
export const vibrationEffects = (nodeContext: NodeContext): VibrationEffect => new VibrationEffect(_.partial(saveEffect, nodeContext), _.partial(mapEffectToCreateEffectInput, nodeContext))
export const systemMessages = (nodeContext: NodeContext): SystemMessageEffect => new SystemMessageEffect(_.partial(saveEffect, nodeContext), _.partial(mapEffectToCreateEffectInput, nodeContext))
export const modals = (nodeContext: NodeContext): ModalEffectFactory => new ModalEffectFactory(_.partial(saveEffect, nodeContext), _.partial(mapEffectToCreateEffectInput, nodeContext))
