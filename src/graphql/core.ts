/**
 * @rob4lderman
 * oct2019
 *
 * a bunch of GQL-resolver-related functions.
 *
 */
import _ from 'lodash'
import moment from 'moment'
import {
  misc,
  sf,
  sft,
} from '../utils'
import { ApolloError } from 'apollo-server'
import {
  ActionSheetOutput,
  CommentsInput,
  CommentsOutput,
  CreateAnimationEffectInput,
  CreateChatRoomSystemCommentInput,
  CreateChatRoomSystemCommentOutput,
  CreateCommentInput,
  CreateCommentOutput,
  CreateEffectInput,
  CreateEffectOutput,
  EdgeDirection,
  EdgesInput,
  EdgesOutput,
  EdgeStatsInput,
  EdgeStatsOutput,
  EdgeType,
  EffectType,
  EntityRef,
  EntityScope,
  EntityType,
  Field as GqlField,
  FieldInput,
  FieldOutput,
  FieldsInput,
  FieldsOutput,
  FieldType,
  HashStatus,
  HashtributeField,
  HashtributesOutput,
  Location,
  ModalEffect,
  ModalType,
  NodeType,
  PresenceType,
  ReceiptsOutput,
  SaveActionInput,
  SaveActionOutput,
  SaveEdgeInput,
  SaveFieldInput,
  SaveFieldOutput,
  SaveTileInput,
  SaveTileOutput,
  TileInput,
  TileOutput,
  TilesOutput,
  TileType,
  SourceType,
  Image,
  ContentfulEntry,
  PageInput,
  NotificationType,
  NotificationsOutput,
} from 'src/gql-types'
import {
  ActionX,
  ChatRoom,
  Comment,
  Edge,
  EdgeStats,
  Effect,
  Entity,
  Field,
  NewsfeedItem,
  Player,
  Receipt,
  Tile,
  UnObject,
  User,
  ActionXInstance,
  Notification,
} from 'src/db/entity'
import { LoggerFactory } from 'src/utils/logger'
import * as joi from './joi'
import * as models from './models'
import * as chatModel from './Chat/chat.model'
import * as activityModel from './Activity/activity.model'
import * as locationModel from './Activity/location.model'
import {
  readActionXsBy,
  mapSaveActionInputToActionX,
} from 'src/graphql/Action/actionx.model'
import { readUserByUsername } from './User/user.model'
import { readUnObjectByUsername } from 'src/graphql/Action/unobject.model'
import * as store from './store'
import * as pubsub from './pubsub'
import * as notifs from './notifs'
import Joi from '@hapi/joi'
import * as aws from 'src/services/aws'
import * as contentful from 'src/services/contentful'
import { isNotNullViolation } from 'src/db/utils'
import Showdown from 'showdown'
import {
  defaultPageInput,
  pageResult,
} from 'src/graphql/pageInput'
import {
  SmartCard,
  smartCards,
} from 'src/domain/smartCards'

const converter = new Showdown.Converter()
const logger = LoggerFactory('core', 'GraphQL')

/**
 * @return checks for parent.s3Key or parent.sourceUri
 */
export const resolveSourceUri = (parent): string => {
  const s3Key: string = _.get(parent, 's3Key')
  // const s3Url = aws.mapS3KeyToSignedUrl( s3Key );
  const s3Url = aws.mapS3KeyToPublicUrl(s3Key)
  return !!!_.isEmpty(s3Url)
    ? s3Url
    : _.get(parent, 'sourceUri')
}

/**
 * @return checks for parent.s3Key or parent.sourceUri
 */
export const resolveSourceType = (parent): SourceType => {
  const sourceUri: string = resolveSourceUri(parent)
  if (_.includes(_.toLower(sourceUri), '.gif')) {
    return SourceType.Gif
  }
  if (_.includes(_.toLower(sourceUri), '.json')) {
    return SourceType.Lottie
  }
  return null
}

/**
 * @return checks for parent.metadata.s3Key or parent.metadata.sourceUri
 */
export const resolveSourceUriFromMetadata = (parent): string => {
  const s3Key: string = resolveFromMetadata('s3Key')(parent)
  // const s3Url = aws.mapS3KeyToSignedUrl( s3Key );
  const s3Url = aws.mapS3KeyToPublicUrl(s3Key)
  return !!!_.isEmpty(s3Url)
    ? s3Url
    : resolveFromMetadata('sourceUri')(parent)
}

/**
 * @return checks for parent.metadata.s3Key or parent.metadata.sourceUri
 */
export const resolveSourceTypeFromMetadata = (parent): SourceType => {
  const sourceUri: string = resolveSourceUriFromMetadata(parent)
  if (_.includes(_.toLower(sourceUri), '.gif')) {
    return SourceType.Gif
  }
  if (_.includes(_.toLower(sourceUri), '.json')) {
    return SourceType.Lottie
  }
  return null
}

/**
 * @param parent - checks for parent.metadata.image, parent.metadata.s3Key, parent.metadata.imageUrl, parent.metadata.entryId
 * @return an Image, or null if no image found
 */
export const resolveImageFromMetadata = (parent): Promise<Image> => {
  return Promise.resolve(null)
    .then(
      () => _.get(parent, 'metadata.image')
    )
    .then(sf.thru_if(_.isNil)(
      () => mapS3KeyToImage(parent, _.get(parent, 'metadata.s3Key'))
    ))
    .then(sf.thru_if(_.isNil)(
      () => mapImageUrlToImage(_.get(parent, 'metadata.imageUrl'))
    ))
    .then(sf.thru_if(_.isNil)(
      () => mapEntryIdToImage(_.get(parent, 'metadata.entryId'))
    ))
}

const mapImageUrlToImage = (imageUrl: string): Image | null => {
  return imageUrl ? { uri: imageUrl } : null
}

export const mapS3KeyToImage = (parent: any, s3Key: string): Image | null => {
  if (_.isEmpty(s3Key)) {
    return null
  }
  return {
    uri: models.mapS3KeyToImgixImageUrl(s3Key),
    s3Key,
    ..._.pick(parent, 'backgroundColor'),
  }
}

export const resolveS3KeyPropToImage = <T>(key: keyof T) => (parent: T): Image | null => {
  const s3Key = (parent?.[key] || '').toString()
  return mapS3KeyToImage(parent, s3Key)
}

/**
 * @param parent - checks for parent.s3Key, parent.imageUrl, parent.entryId
 * @return an Image.  falls back to getDefaultImage
 */
export const resolveImage = (parent): Promise<Image> => {
  return resolveImageNoDefault(parent)
    .then(sf.thru_if(_.isNil)(
      () => getDefaultImage()
    ))
}

/**
 * @param parent - checks for parent.s3Key, parent.imageUrl, parent.entryId
 * @return an Image, or null if no image found.
 */
export const resolveImageNoDefault = (parent): Promise<Image> => {
  return Promise.resolve(null)
    .then(
      () => mapS3KeyToImage(parent, _.get(parent, 's3Key'))
    )
    .then(sf.thru_if(_.isNil)(
      () => mapImageUrlToImage(_.get(parent, 'imageUrl'))
    ))
    .then(sf.thru_if(_.isNil)(
      () => mapEntryIdToImage(_.get(parent, 'entryId'))
    ))
    .then(sf.thru_if(_.isNil)(
      () => resolveImageFromMetadata(parent)
    ))
}

const mapEntryIdToImage = (entryId: string): Promise<Image | null> => {
  if (_.isEmpty(entryId)) {
    return Promise.resolve(null)
  }
  return contentful.getEntry(entryId)
    .then(mapContentfulEntryToImage)
}

const DEFAULT_S3_KEY = 'avatar/default-avatar-v2.png'
const getDefaultImage = (): Image & { isDefault: boolean } => {
  return _.extend(mapS3KeyToImage(null, DEFAULT_S3_KEY), { isDefault: true })
}

/**
 * @param parent object w/ entryId
 * @return Promise w/ EntryAsset from contentful
 */
export const resolveContentfulEntry = (parent): Promise<ContentfulEntry> => {
  return contentful.getEntry(_.get(parent, 'entryId'))
}

export const mapContentfulEntryToImage = (entry: ContentfulEntry): Image => ({
  uri: misc.prefixHttps(_.get(entry, 'fields.image.fields.file.url')),
  width: _.get(entry, 'fields.image.fields.file.details.image.width'),
  height: _.get(entry, 'fields.image.fields.file.details.image.height'),
  size: _.get(entry, 'fields.image.fields.file.details.size'),
  isDefault: false,
  backgroundColor: _.get(entry, 'fields.backgroundColor'),
})

export const mapEntityToImage = (entity: any): Promise<Image> => {
  switch (_.get(entity, 'entityType')) {
    case EntityType.UnObject:
      return resolveImageNoDefault(entity)
    case EntityType.User:
      return resolveImage(entity)
    case EntityType.Comment:
      return store.entityByEid(_.get(entity, 'authorEid'))
        .then(resolveImageNoDefault)

    case EntityType.Edge:
      // show the image for the "this" side
      return Promise.resolve(entity as Edge)
        .then(store.thisEntityOfEdge)
        .then(resolveImageNoDefault) // TODO: recurse? mapEntityToImage

    default:
      return Promise.resolve(null)
  }
}

// FIXME: models.mapEntityToEid is ok in TS but undefined in JS. I suspect a circular dependency
export const resolveEid = models.mapEntityToEid

export const resolveEidToEntity = <T>(key: string) => (parent): Promise<T> => {
  return store.entityByEid(parent?.[key])
}

export const resolveEidToEntityType = <T>(key: string, type: EntityType) => (parent): Promise<T> => {
  if (!models.isEidEntityType(parent?.[key], type)) {
    return null
  }
  return store.entityByEid(parent?.[key])
}

export const resolveIdToEntity = <T>(key: string, type: EntityType) => (parent): Promise<T> => {
  return store.entityById(parent?.[key], type)
}

export const resolveFromEntity = <T>(key: string) => (parent: T): T[keyof T] | undefined => {
  return parent?.[key]
}

/**
 * @return resolves parent.metadata.{metadataKey}
 */
export const resolveFromMetadata = (metadataKey: string) => (parent): any => {
  return _.result(parent, `metadata.${metadataKey}`)
}

/**
 * @return resolves parent.metadata.{metadataKey}. returns defaultValue if undefined.
 */
export const resolveFromMetadataWithDefault = (metadataKey: string, defaultValue: any) => (parent): any => {
  return _.result(parent, `metadata.${metadataKey}`, defaultValue)
}

export const resolveFromMetadata3 = (metadataKey: string) => (parent): any => {
  return misc.indexedObjectToArrayRecursive(_.result(parent, `metadata.${metadataKey}`))
}

/**
 * @return resolves parent.metadata.{metadataKey}. special handling for arrays (that
 *          may have been converted to indexed objects, i.e.. obj.1: value, obj.2: value, etc)
 *
 */
export const resolveArrayFromMetadata = (metadataKey: string) => (parent): any => {
  const retMe = _.result(parent, `metadata.${metadataKey}`)
  return _.isArray(retMe)
    ? retMe
    : _.values(retMe)  // might be an object w/ keys: "0", "1", ...
}

export const resolveFromMetadata2 = (metadataKey: string, backupKey: string = null) => (parent): any => {
  return _.defaultTo(
    _.get(parent, `metadata.${metadataKey}`),
    _.isEmpty(backupKey) ? null : _.get(parent, `metadata.${backupKey}`),
  )
}

/**
 * @param edgeType
 * @return outbound edges from the parent node of the given edgeType
 */
export const mapParentEdgeTypeToThatEntitys = <T>(edgeType: EdgeType) => (parent): Promise<T[]> => {
  return store.thatEntitiesOfEdgesByThisIdEdgeType<T>(parent.id, edgeType)
}

export const mapParentEdgeTypeToEntitys = mapParentEdgeTypeToThatEntitys

/**
 * @param edgeType
 * @return inbound edges to the parent node of the given edgeType
 */
export const mapParentEdgeTypeToThisEntitys = <T>(edgeType: EdgeType) => (parent: Entity): Promise<T[]> => {
  return store.readThisEntitiesOfEdgesByThatIdEdgeType<T>(parent.id, edgeType)
}

export const mapParentEdgeTypeToUnObjects = (edgeType: EdgeType): (parent: any) => Promise<UnObject[]> => mapParentEdgeTypeToEntitys<UnObject>(edgeType)

export type Function<T> = (...args: any[]) => T;

export const mapParentToKey = <T>(key: string, defaultValue: any = null): Function<T> => (parent: object): T => _.defaultTo(_.get(parent, key), defaultValue)

export const resolveMetadataAction = (parent): Promise<ActionX> => {
  const action: ActionX = _.get(parent, 'metadata.action')
  return Promise.resolve(action)
}

export const mapEdgesToEdgesOutput = (edges: Edge[]): EdgesOutput => ({
  edges,
  pageInfo: {
    firstCursor: misc.toDateISOString(_.get(_.first(edges), 'createdAt')),
    lastCursor: misc.toDateISOString(_.get(_.last(edges), 'createdAt')),
  },
})

export const nodeEdges = (parent: Entity, args): Promise<EdgesOutput> => {
  logger.debug('edges', { args })
  return Promise.all([
    nodeOutboundEdges(parent, args),
    nodeInboundEdges(parent, args),
  ])
    .then(sf.tap(all => logger.debug('nodeEdges', { all })))
    .then(sf.list_fmap(edgesOutput => edgesOutput.edges))
    .then(_.flatten)
    .then(edges => _.orderBy(edges, ['createdAt'], ['desc']))
    .then(mapEdgesToEdgesOutput)
    .catch(sf.tap_throw(err => logger.error('nodeEdges', { err, parent })))
}

const nodeOutboundEdges = (parent: Entity, args): Promise<EdgesOutput> => {
  logger.debug('nodeOutboundEdges', { args })
  // clone to avoid conflict w/ nodeInboundEdges
  const input: EdgesInput = _.cloneDeep(_.defaultTo(joi.validate(args.input, joi.buildEdgesInputSchema()), {}))
  input.thisEntityId = parent.id
  input.thisEntityType = parent.entityType
  return activityModel.readEdgesPageByCreatedAtDesc(input)
    .then(mapEdgesToEdgesOutput)
    .catch(sf.tap_throw(err => logger.error('nodeOutboundEdges', { err, input, parent })))
}

const nodeInboundEdges = (parent: Entity, args): Promise<EdgesOutput> => {
  logger.debug('nodeInboundEdges', { args })
  const input: EdgesInput = _.cloneDeep(_.defaultTo(joi.validate(args.input, joi.buildEdgesInputSchema()), {}))
  input.thatEntityId = parent.id
  input.thatEntityType = parent.entityType
  return activityModel.readEdgesPageByCreatedAtDesc(input)
    .then(mapEdgesToEdgesOutput)
    .catch(sf.tap_throw(err => logger.error('nodeInboundEdges', { err, input, parent })))
}

const mapEdgeStatsToEdgeStatsOutput = (edgeStats: EdgeStats[]): EdgeStatsOutput => ({
  edgeStats,
  pageInfo: {
    firstCursor: misc.toDateISOString(_.get(_.first(edgeStats), 'createdAt')),
    lastCursor: misc.toDateISOString(_.get(_.last(edgeStats), 'createdAt')),
  },
})

export const nodeEdgeStats = (parent: Entity, args): Promise<EdgeStatsOutput> => {
  const input: EdgeStatsInput = _.defaultTo(joi.validate(args.input, joi.buildEdgeStatsInputSchema()), {})
  input.entityId = parent.id
  // TODO: edgestats cache
  return activityModel.readEdgeStatsPageByCreatedAtDesc(input)
    .then(mapEdgeStatsToEdgeStatsOutput)
    .catch(sf.tap_throw(err => logger.error('nodeEdgeStats', { err, input, parent })))
}

export const mapFieldsToFieldsOutput = (fields: GqlField[]): FieldsOutput => ({
  fields,
  pageInfo: {
    firstCursor: misc.toDateISOString(_.get(_.first(fields), 'createdAt')),
    lastCursor: misc.toDateISOString(_.get(_.last(fields), 'createdAt')),
  },
})

export const nodeFields = (parent: Entity, args): Promise<FieldsOutput> => {
  logger.debug('nodeFields', { args })
  const input: FieldsInput = _.defaultTo(joi.validate(args.input, joi.buildFieldsInputSchema()), {})
  input.thisEntityId = parent.id
  return activityModel.readFieldsPageByCreatedAtDesc(input)
    .then(mapFieldsToFieldsOutput)
    .catch(sf.tap_throw(err => logger.error('nodeFields', { err, input, parent })))
}

export const nodeFieldsNoPage = (parent: Entity, args): Promise<FieldsOutput> => {
  const input: FieldsInput = _.defaultTo(joi.validate(args.input, joi.buildFieldsInputSchema()), {})
  input.thisEntityId = parent.id
  return Promise.resolve(activityModel.mapFieldsInputToFieldsWhere(input))
    .then((where: any) => _.extend({ isDeleted: false }, where))
    .then(activityModel.readFieldsBy)
    .then(mapFieldsToFieldsOutput)
    .catch(sf.tap_throw(err => logger.error('nodeFields', { err, input, parent })))
}

export const nodeField = (parent: Entity, args): Promise<FieldOutput> => {
  logger.debug('nodeField', { args, parent })
  const input: FieldInput = joi.validate(args.input, joi.buildFieldInputSchema())
  input.collectionId = misc.firstNotEmpty(input.collectionId, `${models.mapEntityToEid(parent)}/field`)
  return store.fieldByCollectionIdName({
    collectionId: input.collectionId,
    name: input.name,
  })
    .then(field => ({ field }))
    .catch(sf.tap_throw(err => logger.error('nodeField', { err, input, parent })))
}

export const nodeTile = (parent: Entity, args): Promise<TileOutput> => {
  logger.debug('nodeTile', { args, parent })
  const input: TileInput = joi.validate(args.input, joi.buildTileInputSchema())
  input.collectionId = misc.firstNotEmpty(input.collectionId, `${models.mapEntityToEid(parent)}/tile`)
  return store.tileByCollectionIdName(input)
    .then((tile: Tile) => ({ tile }))
    .catch(sf.tap_throw(err => logger.error('nodeTile', { err, input, parent })))
}

const mapCommentsToCommentsOutput = (comments: Comment[]): CommentsOutput => ({
  comments,
  pageInfo: {
    firstCursor: misc.toDateISOString(_.get(_.first(comments), 'createdAt')),
    lastCursor: misc.toDateISOString(_.get(_.last(comments), 'createdAt')),
  },
})

export const comments = (input: CommentsInput): Promise<CommentsOutput> => {
  // TODO: comments cache? w/ pagination???
  input = _.defaultTo(joi.validate(input, joi.buildCommentsInputSchema()), {})
  return chatModel.readCommentsPageByCreatedAt(input)
    .then(mapCommentsToCommentsOutput)
    .catch(sf.tap_throw(err => logger.error('ERROR: comments', { err, input })))
}

export const deleteField = (fieldId: string, field?: Field): Promise<Field> => {
  return store.fieldById(fieldId, field)
    .then(f => {
      if (_.isNil(f)) {
        return null
      }

      f.isDeleted = true
      return store.saveField(f)
        .then(sft.tap_catch(pubsub.publishField))
    })
}

/**
 * ALL saving of Fields comes thru here.
 * @return Promise w/ SaveFieldOutput
 */
export const saveField = (root, args, ctx = null): Promise<SaveFieldOutput> => {
  const input: SaveFieldInput = joi.validate(args.input, joi.buildSaveFieldInputSchema()) as SaveFieldInput
  joi.validate(input.metadata, joi.buildFieldMetadataSchemaForType(input.type))
  const field = activityModel.mapSaveFieldInputToField(input)
  
  if (field.isDeleted) {
    return deleteField(field.id, field)
      .then(field => ({ field }))
  }
  
  return Promise.resolve(field)
    .then(activityModel.assertFieldHasNameOrCollectionName)
    .then(store.saveField)
    .then(sft.tap_catch(pubsub.publishField))
    .then(sft.tap_catch(_.partial(createSaveFieldEffect, input, ctx)))
    .then(field => ({ field }))
    .catch(sf.tap_throw(err => logger.error('saveField', { err, input, code: err.code })))
}

export const createSaveFieldEffect = (saveFieldInput: SaveFieldInput, ctx: any, field: GqlField): Promise<CreateEffectOutput> => {
  const input: CreateEffectInput = {
    collectionId: models.buildCollectionId(models.chompCollectionId(field.collectionId), 'effect'),
    type: EffectType.SaveFieldEffect,
    scope: field.scope,
    thisEid: models.buildEid(field.thisEntityType, field.thisEntityId),
    metadata: {
      saveFieldInput,
      fieldSnapshot: field,
    },
  }
  return createEffect(null, { input }, ctx)
}

export const createIncrementFieldEffect = (incrementBy: number, ctx: any, field: GqlField): Promise<CreateEffectOutput> => {
  const input: CreateEffectInput = {
    collectionId: models.buildCollectionId(models.chompCollectionId(field.collectionId), 'effect'),
    scope: field.scope,
    thisEid: models.buildEid(field.thisEntityType, field.thisEntityId),
    type: EffectType.IncrementFieldEffect,
    metadata: {
      incrementBy,
      fieldSnapshot: field,
    },
  }
  return createEffect(null, { input }, ctx)
}

const mapCreateAnimationEffectInputToCreateEffectInput = (input: CreateAnimationEffectInput): CreateEffectInput => ({
  type: EffectType.AnimationEffect,
  collectionId: input.collectionId,
  scope: input.scope,
  thisEid: input.thisEid,
  metadata: _.pick(input, [
    'animationType',
    'sourceUri',
    'tileId',
    'startFrame',
    'endFrame',
    'loop',
    'speed',
  ]),
})

/**
 * 0. builds it
 * 1. stores it
 * 2. publishes it
 */
export const createAnimationEffect = (root, args, ctx): Promise<CreateEffectOutput> => {
  const input: CreateAnimationEffectInput = joi.validate(args.input, joi.buildCreateAnimationEffectInputSchema())
  return Promise.resolve(input)
    .then(mapCreateAnimationEffectInputToCreateEffectInput)
    .then((input: CreateEffectInput) => createEffect(root, { input }, ctx))
}

/**
 * 0. builds it
 * 1. stores it
 * 2. publishes it
 */
export const createEffect = (root, args, ctx): Promise<CreateEffectOutput> => {
  const input: CreateEffectInput = joi.validate(args.input, joi.buildCreateEffectInputSchema())
  // TODO: joi.validate( input.metadata, joi.buildEffectMetadataSchemaForType( input.type ) );
  return Promise.resolve(activityModel.buildEffect(input, ctx))
    .then(sf.tap_catch(activityModel.saveEffect))
    .then(sf.tap_catch(pubsub.publishEffect))
    .then(effect => ({ effect }))
    .catch(sf.tap_throw(err => logger.error('createEffect', { err, input, code: err.code })))
}

export const resolveTypeByType = (obj: any): any => {
  return _.get(obj, 'type')
}

export const resolveAsPlayerType = (parent: Entity): Entity => {
  switch (_.get(parent, 'entityType')) {
    case EntityType.User:
    case EntityType.UnObject:
      return parent
    default:
      return null
  }
}

export const resolveAsEntityType = (entityType: EntityType) => (parent: Entity): Entity =>
  _.get(parent, 'entityType') == entityType
    ? parent
    : null

export const resolveAsNodeType = (nodeType: NodeType) => (parent: Entity): Entity =>
  _.get(parent, 'type') == nodeType
    ? parent
    : null

export const resolveAsFieldType = (fieldType: FieldType) => (parent: GqlField): GqlField =>
  _.get(parent, 'type') == fieldType
    ? parent
    : null

export const resolveAsFieldTypeWithTransform = <T>(fieldType: FieldType, transformFn: Function<T>) => (parent: GqlField): T =>
  _.get(parent, 'type') == fieldType
    ? transformFn(parent)
    : null

export const resolveAsTileType = (tileType: TileType) => (parent: Tile): Tile =>
  _.get(parent, 'type') == tileType
    ? parent
    : null

export const resolveAsType = (anyType: any) => (parent: Entity): Entity =>
  _.get(parent, 'type') == anyType
    ? parent
    : null

export const resolveAsEdgeType = (edgeType: EdgeType) => (parent: Edge): Edge =>
  _.get(parent, 'edgeType') == edgeType
    ? parent
    : null

export const resolveAsEffectType = (effectType: EffectType) => (parent: Effect): Effect =>
  _.get(parent, 'type') == effectType
    ? parent
    : null

export const resolveAsModalType = (effectType: ModalType) => (parent: ModalEffect): ModalEffect =>
  _.get(parent, 'modalType') == effectType
    ? parent
    : null

/**
 * Archetypical createEdge code
 * @return Promise w/ Edge
 */
export const saveEdge = (saveEdgeInput: SaveEdgeInput): Promise<Edge> => {
  const input = joi.validate(saveEdgeInput, joi.buildSaveEdgeInputSchema())
  return Promise.resolve(input)
    .then(activityModel.mapSaveEdgeInputToEdge)
    .then(store.saveEdge)
    .then(sf.tap_catch(_.partial(createSaveEdgeEffect, input)))
    .then(sf.tap_catch(pubsub.publishEdge))
    .catch(sf.tap_throw(err => logger.error('saveEdge', { err, input, code: err.code })))
}

/**
 * Archetypical createEdge code
 * @return Promise w/ Edge
 */
export const saveEdgeNoPublish = (saveEdgeInput: SaveEdgeInput, updateInboundEdgeStatsOnly = false): Promise<Edge> => {
  const input = joi.validate(saveEdgeInput, joi.buildSaveEdgeInputSchema())
  return Promise.resolve(input)
    .then(activityModel.mapSaveEdgeInputToEdge)
    .then(edge => store.saveEdge(edge, updateInboundEdgeStatsOnly))
    .then(sf.tap_catch(_.partial(createSaveEdgeEffect, input)))
    .catch(sf.tap_throw(err => logger.error('saveEdgeNoPublish', { err, input, code: err.code })))
}

/**
 * Archetypical createEdges code
 * @return Promise w/ Edges
 */
export const saveEdges = (saveEdgesInput: SaveEdgeInput[]): Promise<Edge[]> => {
  const inputs = joi.validate(saveEdgesInput, Joi.array().items(joi.buildSaveEdgeInputSchema()))
  return sft.promiseMap(inputs, saveEdge)
    .catch(sf.tap_throw(err => logger.error('saveEdges', { err, inputs, code: err.code })))
}

/**
 * Archetypical createEdges code
 * @return Promise w/ Edges
 */
export const saveEdgesNoPublish = (saveEdgesInput: SaveEdgeInput[]): Promise<Edge[]> => {
  const inputs = joi.validate(saveEdgesInput, Joi.array().items(joi.buildSaveEdgeInputSchema()))
  return sft.promiseMap(inputs, e => saveEdgeNoPublish(e))
    .catch(sf.tap_throw(err => logger.error('saveEdgesNoPublish', { err, inputs, code: err.code })))
}

export const createSaveEdgeEffect = (saveEdgeInput: SaveEdgeInput, edge: Edge): Promise<CreateEffectOutput> => {
  const input: CreateEffectInput = {
    collectionId: models.buildCollectionId(models.buildCollectionId(edge.thisEntityType, edge.thisEntityId), 'effect'),
    scope: EntityScope.GlobalScope,
    thisEid: models.buildEid(edge.thisEntityType, edge.thisEntityId),
    type: EffectType.SaveEdgeEffect,
    metadata: {
      saveEdgeInput,
      edgeSnapshot: edge,
    },
  }
  return createEffect(null, { input }, null)
}

export const buildCoreActionEdgesForUser = (user: User): Promise<any> => {
  logger.debug('buildCoreActionEdgesForUser', { user })
  // deleted edges are cleared out in parser.
  return store.actionsByPackage('core')
    .then(sf.list_fmap_wait(sf.maybe_fmap(
      (action: ActionX) => Promise.resolve({
        thisEntityId: user.id,
        thisEntityType: user.entityType,
        thatEntityId: action.id,
        thatEntityType: action.entityType,
        edgeType: EdgeType.ActionX,
        name: action.name,
        collectionName: 'actionSheet',
        collectionId: models.buildCollectionId(models.mapEntityToEid(user), 'edge'), // TODO: actionxedge ?
        order: _.defaultTo(action.order, undefined),
        isDeleted: action.isDeleted,
      })
        .then(saveEdge),
    )))
    .catch(sf.tap_throw(err => logger.error('ERROR: buildCoreActionEdgesForUser', { err, user })))
    .catch(() => [])
}

/**
 *
 * @caller gql.createComment
 * @caller gql.createChatRoomComment
 * @caller gql.createChatRoomSystemComment
 * @caller makerApi.createChatRoomComment
 * @caller makerApi.createChatRoomSystemComment -> core.createChatRoomSystemComment
 *
 */
export const createComment = (root, args, ctx): Promise<CreateCommentOutput> => {
  const input: CreateCommentInput = joi.validate(args.input, joi.buildCreateCommentInputSchema())
  return Promise.resolve(input)
    .then(_.partial(chatModel.mapCreateCommentInputToComment, ctx))
    .then(
      (comment: Comment) => store.userByEid(comment.authorEid)
        .then((user: User) => _.extend(comment, { authorUserId: _.get(user, 'id', '') })),
    )
    .then(chatModel.saveComment)
    .then(comment => {
      if (comment.type != NodeType.ChatRoomComment) {
        return comment
      }
      const chatRoomId = models.mapCommentToChatRoomId(comment)
      return updateChatRoomOrder(chatRoomId)
        .then(() => comment)
    })
    .then(sf.tap_wait(createCommentReceiptsForComment))
    .then(sf.tap_catch(pubsub.publishComment))
    .then(sf.tap_catch(
      (comment: Comment) => notifs.createCommentNotifications(comment)
        .then(sf.pause(2 * 1000))
        .then(notifications => sft.promiseMap(
          notifications,
          (notif: Notification) => Promise.all([
            notifs.sendPushNotification(notif),
            pubsub.publishUnreadMessagesCount(notif.userId, notif.type),
          ])
        )))
    )
    // TODO: log entity effect
    .then((comment: Comment) => ({ comment }) as any as CreateCommentOutput)
    .catch(sf.tap_throw(err => logger.error('createComment', { err, input })))
}

// TODO: this is nic cage.
const SYSTEM_PLAYER_EID = 'unobject/3'

const mapCreateChatRoomSystemCommentInputToCreateCommentInput = (input: CreateChatRoomSystemCommentInput): CreateCommentInput => {
  return {
    type: NodeType.ChatRoomSystemComment,
    collectionId: models.buildCollectionId('chatroom', input.chatRoomId, 'comment'),
    authorEid: SYSTEM_PLAYER_EID,
    text: input.text,
    replyToCommentId: input.replyToCommentId,
    metadata: _.pick(input, [
      'visibleToPlayerIds',
      'visibleToPlayerEids',
    ]),
  }
}

// TODO publish newly updated chatroom to FE
//  in case of p2p/multi playroom, figure out oldChatRoomId
export const updateChatRoomOrder = (chatRoomId: string, chatRoom?: ChatRoom): Promise<ChatRoom> => {
  return store.updateChatRoomOrder(chatRoomId, chatRoom)
}

// TODO update chatRoom order only when comment is visible to player?
//  use `chatModel.isChatRoomSystemCommentVisibleToPlayerEid`
export const createChatRoomSystemComment = (root, args, ctx): Promise<CreateChatRoomSystemCommentOutput> => {
  const input: CreateChatRoomSystemCommentInput = joi.validate(args.input, joi.buildCreateChatRoomSystemCommentInputSchema())
  return Promise.resolve(mapCreateChatRoomSystemCommentInputToCreateCommentInput(input))
    .then((input: CreateCommentInput) => createComment(root, { input }, ctx) as any as Promise<CreateChatRoomSystemCommentOutput>)
    // .then(sf.tap_catch(
    //   ({ comment }) => updateChatRoomOrder(models.mapCommentToChatRoomId(comment)),
    // ))
    .catch(sf.tap_throw(err => logger.error('createChatRoomSystemComment', { err, input })))
}

export const createCommentReceiptsForComment = (comment: Comment): Promise<any> => {
  return store.chatRoomPlayerEids(models.mapCommentToChatRoomId(comment))
    .then(store.zipPlayerEidsWithUsers)
    .then(sf.list_fmap(_.partial(chatModel.mapCommentAndPlayerEidUserToCommentReceipt, comment as any)))
    .then(sf.list_fmap_wait(chatModel.createOrReadCommentReceipt))
}

export const deprecatedResolver = (deprecatedResolverName: string, newResolverName: string) => (): void => {
  throw new ApolloError(
    `This api (${deprecatedResolverName}) is deprecated.  Use ${newResolverName} instead.`,
    'DEPRECATED_API',
  )
}

export const isPlayerEntityHandledByThisUser = (playerEntityRef: EntityRef, user: User): Promise<boolean> => {
  switch (_.get(playerEntityRef, 'entityType')) {
    case EntityType.User:
      return Promise.resolve(playerEntityRef.id === user.id)
    case EntityType.UnObject:
      return store.unObjectById(playerEntityRef.id)
        .then(unObject => unObject.createdByUserId === user.id)
    default:
      return Promise.resolve(false)
  }
}

export const entityReceipts = (parent: Entity): Promise<ReceiptsOutput> => {
  const entityEid = models.mapEntityToEid(parent)
  // TODO: cache
  return chatModel.readReceiptsBy({ entityEid })
    .then((receipts: Receipt[]) => ({ receipts }))
}

export const resolvePresence = (parent: Entity): Promise<PresenceType> => {
  return nodeField(parent, { input: { name: 'presence' } })
    .then((output: FieldOutput) => _.get(output, 'field.metadata.presenceType'))
}

export const resolveLevel = (parent: Entity): Promise<number> => {
  return resolveIntField('level')(parent)
}

export const resolveBooleanField = (fieldName: string, defaultValue = false) =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (parent, args = null): Promise<boolean> => {
    return nodeField(parent, { input: { name: fieldName } })
      .then((output: FieldOutput) => _.get(output, 'field.metadata.booleanValue', defaultValue))
  }

export const resolveNumberField = (name: string) => (parent: Entity): Promise<number> => {
  return resolveField(name)(parent).then(field => field?.metadata?.numberValue || 0)
}

export const resolveIntField = (name: string) => (parent: Entity): Promise<number> => {
  return resolveNumberField(name)(parent).then(_.round) // ensure int
}

export const resolveField = (fieldName: string) =>
  (parent: Entity): Promise<GqlField> => {
    return nodeField(parent, { input: { name: fieldName } })
      .then(output => output.field)
  }

export const resolveHashStatuses = (parent: Entity): Promise<HashStatus[]> => {
  return store.fieldsByCollectionIdType({ collectionId: `${models.mapEntityToEid(parent)}/field`, type: FieldType.HashStatusField })
    .then(sf.list_fmap(activityModel.fieldToHashStatus))
    .then(_.compact) // ignore user states that are no longer defined
    .then((hashStatuses: HashStatus[]) => _.sortBy(hashStatuses, hashStatus => hashStatus.metadata?.changedAt).reverse())
}

export const resolveHashtributes = (parent: Entity): Promise<HashtributesOutput> => {
  return store.fieldsByCollectionIdType({ collectionId: `${models.mapEntityToEid(parent)}/field`, type: FieldType.HashtributeField })
    .then(sf.list_fmap(activityModel.fieldToHashtributeField))
    .then(_.compact) // ignore hashtributes that are no longer defined
    .then((hashtributes: HashtributeField[]) => _.sortBy(hashtributes, (hashtribute: HashtributeField) => _.get(hashtribute, 'metadata.numberValue', 0) * -1))
    .then((hashtributes: HashtributeField[]) => ({ hashtributes }))
}

export const resolveActionSheet = (entityRef): Promise<ActionSheetOutput> => {
  return Promise.all([
    store.actionsByPackage('core'),
    store.readThatEntitiesOfEdgesByThisIdCollectionName(_.get(entityRef, 'id'), 'actionSheet'),
    models.isEntityType(entityRef, EntityType.UnObject)
      ? readActionXsBy({ unObjectId: _.get(entityRef, 'id'), isDeleted: false })
      : [],
  ])
    .then(_.flatten)
    .then((actions: any[]) => _.uniqBy(actions, action => action.id))
    .then(actions => ({ actions }))
}

export const saveAction = (root, args): Promise<SaveActionOutput> => {
  const input: SaveActionInput = joi.validate(args.input, joi.buildSaveActionInputSchema())
  return Promise.resolve(input)
    .then(mapSaveActionInputToActionX)
    .then(store.saveAction)
    .then(action => ({ action }))
    .catch(sf.tap_throw(err => logger.error('ERROR: saveAction', { err, input, code: err.code })))
}

export const createSaveTileEffect = (saveTileInput: SaveTileInput, ctx: any, tile: Tile): Promise<CreateEffectOutput> => {
  const input: CreateEffectInput = {
    collectionId: models.buildCollectionId(models.chompCollectionId(tile.collectionId), 'effect'),
    thisEid: tile.thisEid,
    scope: tile.scope,
    type: EffectType.SaveTileEffect,
    metadata: {
      saveTileInput,
      tileSnapshot: tile,
    },
  }
  return createEffect(null, { input }, ctx)
}

/**
 * @return Promise<SaveTileOutput> - the Tile is guaranteed to be written to cache
 *         and sent to the pubsub service by the time the promise resolves.
 *         NOTE however there is NO GUARANTEE on the ORDERING of streamed pubsub events
 *         after they've been sent to the pubsub service.
 */
export const saveTile = (root, args, ctx = null): Promise<SaveTileOutput> => {
  const input: SaveTileInput = joi.validate(args.input, joi.buildSaveTileInputSchema())
  return Promise.resolve(input)
    .then(activityModel.mapSaveTileInputToTile)
    .then(store.saveTile)
    .then(sf.tap_catch(pubsub.publishTile))
    .then(sf.tap_catch(_.partial(createSaveTileEffect, input, ctx)))
    .then(tile => ({ tile }))
    .catch(sf.tap_throw(err => logger.error('saveTile', { err, input, code: err.code })))
}

/**
 * Save as saveTile, but DOES NOT send the event to the pubsub service.
 * @return Promise<SaveTileOutput> - the Tile is guaranteed to be written to cache
 *         by the time the promise resolves.
 */
export const saveTileNoPublish = (root, args, ctx = null): Promise<SaveTileOutput> => {
  const input: SaveTileInput = joi.validate(args.input, joi.buildSaveTileInputSchema())
  return Promise.resolve(input)
    .then(activityModel.mapSaveTileInputToTile)
    .then(store.saveTile)
    // -rx- .then(sf.tap_catch(pubsub.publishTile))
    .then(sf.tap_catch(_.partial(createSaveTileEffect, input, ctx)))
    .then(tile => ({ tile }))
    .catch(sf.tap_throw(err => logger.error('saveTileNoPublish', { err, input, code: err.code })))
}

/**
 * @return Promise w/ SaveTileOutput[]
 */
export const saveTiles = (root, args, ctx): Promise<SaveTileOutput[]> => {
  const input: SaveTileInput[] = joi.validate(args.input, Joi.array().items(joi.buildSaveTileInputSchema()))
  return Promise.resolve(input)
    .then(sf.list_fmap_wait(
      (input: SaveTileInput) => Promise.resolve(input)
        .then(activityModel.mapSaveTileInputToTile)
        .then(store.saveTile)
        .then(sf.tap_catch(_.partial(createSaveTileEffect, input, ctx))),
    ))
    .then(sf.tap_catch(pubsub.publishTiles))
    .then(sf.list_fmap(tile => ({ tile })))
    .catch(sf.tap_throw(err => logger.error('saveTiles', { err, input, code: err.code })))
}

/**
 * TODO: query on scope:GlobalScope
 * @param parent
 * @return the set of global public tiles for the given parent
 */
export const resolveTiles = (parent: Entity): Promise<TilesOutput> => {
  return activityModel.readTilesBy({
    collectionId: models.buildCollectionId(models.mapEntityToEid(parent), 'tile'),
    isDeleted: false,
  })
    .then((tiles: Tile[]) => ({ tiles }))
}

/**
 * TODO: query on scope:GlobalPrivateScope
 * @param parent
 * @return the set of global private tiles for the given parent
 */
export const resolvePrivateTiles = (parent: Entity): Promise<TilesOutput> => {
  return activityModel.readTilesBy({
    collectionId: models.buildCollectionId(models.mapEntityToEid(parent), 'privatetile'),
    isDeleted: false,
  })
    .then((tiles: Tile[]) => ({ tiles }))
}

const inboundEdgeStatsCount = (entityId: string, edgeType: EdgeType): Promise<number> => {
  return store.edgeStatsCountByEntityIdEdgeTypeDirection({
    entityId,
    edgeDirection: EdgeDirection.Inbound,
    edgeType: edgeType,
  })
}

export const likesCount = (parent: Entity): Promise<number> => {
  return inboundEdgeStatsCount(parent.id, EdgeType.Likes)
}

export const myLikesCountFor = (parent: Entity, args, ctx): Promise<number> => {
  const sessionUser: User = ctx.user
  // we are fetching from the db instead of the cache
  // because we can get all records
  return activityModel.readEdgeCountBy({
    thisEntityId: sessionUser.id,
    thatEntityId: parent.id,
    edgeType: EdgeType.Likes,
  })
}

export const resolveColor = (key: string) => (parent): string => {
  return misc.prependHashToColor(_.get(parent, key))
}

export const resolveLocation = (parent: Entity): Promise<Location> => {
  // TODO: caching
  return locationModel.readLocationBy({ thisEid: models.mapEntityToEid(parent) })
}

export const isFollowed = (player: Player, args, ctx): Promise<boolean> => {
  const sessionUser: User = ctx.user
  return store.edgeByThisThatIdsEdgeType({
    thisEntityId: sessionUser.id,
    thatEntityId: player.id,
    edgeType: EdgeType.Follows,
  })
    .then(edge => !!(edge && !edge.isDeleted))
}

export const isFollowing = (player: Player, args, ctx): Promise<boolean> => {
  const sessionUser: User = ctx.user
  return store.edgeByThisThatIdsEdgeType({
    thisEntityId: player.id,
    thatEntityId: sessionUser.id,
    edgeType: EdgeType.Follows,
  })
    .then(edge => !!(edge && !edge.isDeleted))
}

/**
 *
 * @param displayName
 * @param skipId
 * @param iteration
 *
 * @return Promise<string> unique username for the given displayName
 * @throws after 100 attempts to avoid infinite recursion
 */
export const buildUniqueUsername = async (displayName: string, skipId: string = null, iteration = 0): Promise<string> => {
  const username = _.chain(displayName)
    .thru(name => misc.stripWhitespace(name))
    .thru(name => misc.stripNonWordChars(name))
    .thru(name => _.toLower(name))
    // .thru( name => `@${name}` )
    .thru(name => iteration > 0 ? `${name}${iteration}` : name)
    .value()

  if (iteration > 100) {
    throw new Error('Cannot build unique username after 100 tries: ' + username)
  }

  const player = await readUserByUsername(username) || await readUnObjectByUsername(username)
  if (player && player.id !== skipId) {
    return buildUniqueUsername(displayName, skipId, iteration + 1)
  }
  return username
}

export const hideChatRoomForUser = (chatRoomId: string, userId: string): Promise<ChatRoom> => {
  return store.chatRoomById(chatRoomId)
    .then(chatRoom => store.chatRoomPlayerIds(chatRoom.id, chatRoom)
      .then(playerIds => store.deleteEdgesByThisThatIdsEdgeType({
        thisEntityIds: playerIds.filter(id => id === userId),
        thatEntityIds: playerIds.filter(id => id !== userId),
        edgeTypes: [EdgeType.ChatRoom],
      }))
      .then(() => chatRoom)
    )
}

export const hasThisBlockedThat = (input: models.thisThatIds): Promise<boolean> => {
  return store.edgeByThisThatIdsEdgeType({
    thisEntityId: input.thisId,
    thatEntityId: input.thatId,
    edgeType: EdgeType.Block,
  })
    .then(edge => !!(edge && !edge.isDeleted))
}

export const areFriends = (input: models.thisThatIds): Promise<boolean> => {
  return store.edgeByThisThatIdsEdgeType({
    thisEntityId: input.thisId,
    thatEntityId: input.thatId,
    edgeType: EdgeType.Friend,
  })
    .then(edge => !!(edge && !edge.isDeleted))
}

export const friendshipGraph = (input: models.thisThatIds): Promise<models.FriendshipGraph> => {
  return Promise.all([
    areFriends(input),
    hasThisBlockedThat(input),
    hasThisBlockedThat({ thisId: input.thatId, thatId: input.thisId }),
  ])
    .then(result => {
      const areFriends = result[0]
      const isThatBlocked = result[1]
      const isThisBlocked = result[2]
      return {
        thisUser: {
          isFriend: areFriends,
          isBlocked: isThisBlocked,
        },
        thatUser: {
          isFriend: areFriends,
          isBlocked: isThatBlocked,
        },
      }
    })
}

const createUsername = (unObject: UnObject): Promise<string> => {
  if (unObject.isDeleted) {
    // Free up its username for others
    return Promise.resolve(`deleted${misc.generateRandomToken()}`)
  }
  return buildUniqueUsername(unObject.name, unObject.id)
}

export const saveUnObjectWithDefaultUserId = (unObject: UnObject): Promise<UnObject> => {
  return createUsername(unObject)
    .then(username => Object.assign({}, unObject, { username }))
    .then(store.saveUnObject)
    .catch(err => !isNotNullViolation(err)
      ? Promise.reject(err)
      : store.saveUnObject(Object.assign({}, unObject, { createdByUserId: '0' }))
    )
}

export const itemsByPlayer = (player: Player): Promise<ActionXInstance[][]> => {
  return store.actionXInstancesByPlayer(player.eid)
    .then((actionInstances: ActionXInstance[])  => _.groupBy<ActionXInstance>(
      actionInstances,
      actionInstance => actionInstance.actionName
    ))
    .then(items => _.values(items))
}

export const itemsNameByPlayer = (player: Player): Promise<string[]> => {
  return itemsByPlayer(player)
    .then(items => items.map(group => group[0]?.actionName))
}

const chompP = (html: string): string => {
  return _.startsWith(html, '<p>') && _.endsWith(html, '</p>')
    ? html.substring(3, html.length - 4)
    : html
}

export const xformMarkdownToHtml = (markdown): string => {
  return _.isEmpty(markdown)
    ? markdown
    : chompP(converter.makeHtml(markdown))
}

export const newsfeedItemStatusText = (newsfeedItem: NewsfeedItem, user?: User, withCTA = true): Promise<string> => {
  return store.newsfeedItemStatusText(newsfeedItem, user, withCTA).then(xformMarkdownToHtml)
}

export const fieldMetadataNumberValue = (user: User, name: string): Promise<number | null> => {
  if (_.isNil(name)) {
    return Promise.resolve(null)
  }
  return store.fieldByCollectionIdName({
    collectionId: models.buildCollectionId(models.mapEntityToEid(user), 'field'),
    name,
  })
    .then(field => field?.metadata?.numberValue || 0)
}

export const friendsCount = (playerId: string): Promise<number> => {
  return inboundEdgeStatsCount(playerId, EdgeType.Friend)
}

export const friendRequestsCount = (playerId: string): Promise<number> => {
  return inboundEdgeStatsCount(playerId, EdgeType.FriendRequest)
}

export const hasValidAge = (user: User, entity: any): boolean => {
  return moment(new Date()).diff(user.birthday, 'years') >= entity.minUserAge
}

export const userNotifications = (user: User, pageInput?: PageInput, types?: NotificationType[]): Promise<NotificationsOutput> => {
  const defaultPage = defaultPageInput(pageInput)
  let unreadCount = 0

  return store.notificationsByUser({ userId: user.id })
    .then(notifications => notifications
      .filter(notif => _.isEmpty(types)
        ? true
        : types.includes(notif.type)
      )
      .map(notif => {
        if (!notif.isRead) {
          unreadCount++
        }
        return notif
      })
      .sort(misc.sortByDesc<Notification>('createdAt'))
    )
    .then(_.partialRight(pageResult, defaultPage))
    .then(result => ({
      notifications: result.list,
      unreadCount,
      pageInfo: result.pageInfo,
    }))
}

export const createSmartCardEdge = (user: User, smartCard: SmartCard): Promise<Edge> => {
  const edge = {
    thisEntityId: user.id,
    thisEntityType: user.entityType,
    thatEntityId: user.id,
    thatEntityType: user.entityType,
    edgeType: EdgeType.SmartCard,
    collectionId: smartCard.id.toString(),
    isDeleted: false,
  }
  return saveEdgeNoPublish(edge)
}

export const remainingSmartCards = (edges: Edge[], includes = true): SmartCard[] => {
  return smartCards.filter(card =>
    edges.some(e => e.collectionId === card.id.toString()) === includes
  )
}

export const createEdgesOfSmartCards = (user: User): Promise<Edge[]> => {
  // Not reading from the cache because it won't
  // have the dismissed cards. And when the cache
  // is already loaded, it won't fetch the deleted edges
  return activityModel.readEdgesBy({ 
    where: {
      thisEntityId: user.id,
      edgeType: EdgeType.SmartCard,
    },
  })
    .then(edges => {
      if(_.isEmpty(edges)) {
        return sft.promiseMap(
          smartCards as SmartCard[],
          card => createSmartCardEdge(user, card)
        )
      }

      const cardsMissingEdge = remainingSmartCards(edges, false)
      return sft.promiseMap(cardsMissingEdge, card => createSmartCardEdge(user, card))
    })
}
