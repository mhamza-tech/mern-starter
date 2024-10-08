/**
 * @rob4lderman
 * oct2019
 */

import {
  EdgeType,
  EntityType,
  EdgeDirection,
  NodeType,
  FieldType,
  EffectType,
  ReceiptType,
  PresenceType,
  AnimationType,
  TileType,
  NotificationType,
  EntityScope,
  Gender,
  EntityInput,
  UserEntityInput,
  FriendRequestStatus,
  ChatRoomsInput,
  DynamicFeedItemLayout,
} from '../gql-types'
import Joi, {
  string,
  object,
  number,
  boolean,
  date,
  array,
} from '@hapi/joi'
import {
  buildEnumSchema,
  validate,
} from '../utils/joi'

export const buildEdgeTypeSchema = (): Joi.StringSchema => string().valid(...Object.values(EdgeType))
export const buildEntityTypeSchema = (): Joi.StringSchema => string().valid(...Object.values(EntityType))
export const buildEdgeDirectionSchema = (): Joi.StringSchema => string().valid(...Object.values(EdgeDirection))

export const buildEntitySchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    id: string().required(),
    entityType: buildEntityTypeSchema().required(),
  }).unknown()
}

export const buildCreateEdgeInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    thisEntityId: string().required(),
    thisEntityType: buildEntityTypeSchema().required(),
    thatEntityId: string().required(),
    thatEntityType: buildEntityTypeSchema().required(),
    edgeType: buildEdgeTypeSchema().required(),
    name: string().allow('', null),
    collectionName: string().allow('', null),
    collectionId: string().allow('', null),
    metadata: object().allow(null),
    order: string().allow('', null),
    sortKey1: string().allow('', null),
    sortKey2: string().allow('', null),
    updatedAt: date(),
  })
}

export const buildSaveEdgeInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    id: string().allow('', null),
    thisEntityId: string().required(),
    thisEntityType: buildEntityTypeSchema().required(),
    thatEntityId: string().required(),
    thatEntityType: buildEntityTypeSchema().required(),
    edgeType: buildEdgeTypeSchema().required(),
    name: string().allow('', null),
    collectionName: string().allow('', null),
    collectionId: string().allow('', null),
    metadata: object().allow(null),
    isDeleted: boolean(),
    order: string().allow('', null),
    sortKey1: string().allow('', null),
    sortKey2: string().allow('', null),
    updatedAt: date(),
  })
}

export const buildEdgesInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    pageInput: buildPageInputSchema(),
    edgeType: buildEdgeTypeSchema(),
    thisEntityType: buildEntityTypeSchema(),
    thatEntityType: buildEntityTypeSchema(),
    // edgeDirection: buildEdgeDirectionSchema(),
    thisEntityId: string().allow('', null),
    thatEntityId: string().allow('', null),
    name: string().allow('', null),
  })
}

export const buildPageInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    first: number().integer().allow(null),
    last: number().integer().allow(null),
    afterCursor: string().allow('', null),
    beforeCursor: string().allow('', null),
  })
}

export const buildFieldsInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    pageInput: buildPageInputSchema(),
    name: string().allow('', null),
    collectionName: string().allow('', null),
    type: buildEnumSchema(FieldType),
    collectionId: string().allow('', null),
    thisEntityId: string().allow('', null),
    thisEntityType: buildEnumSchema(EntityType),
  })
}

export const buildFieldInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    name: string().required(),
    collectionId: string().allow('', null),
  })
}

export const buildTileInputSchema = buildFieldInputSchema

export const buildNodeInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    eid: string().required(),
  })
}

export const buildCommentsInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    pageInput: buildPageInputSchema(),
    collectionId: string(),
  })
}

export const buildUnObjectsInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    pageInput: buildPageInputSchema(),
    isDestination: boolean().optional(),
    isFeatured: boolean().optional(),
    minOccupancy: Joi.number().optional(),
    maxOccupancy: Joi.number().optional(),
  })
}

export const buildChatRoomsInputSchema = (): Joi.ObjectSchema<ChatRoomsInput> => {
  return object<ChatRoomsInput>().keys({
    pageInput: buildPageInputSchema(),
    p2pOnly: boolean().optional(),
  })
}

export const buildSaveDeviceInfoInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    os: string().max(256).allow('', null),
    osVersion: string().max(256).allow('', null),
    appVersion: string().max(256).allow('', null),
    deviceToken: string().max(1024).allow('', null),
    timezoneOffset: number().integer().allow(0),
  })
}

export const buildPushNotificationMessageInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    title: string(),
    body: string(),
  })
}

export const buildPushNotificationPayloadInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    token: string(),
    data: object(),
    notification: buildPushNotificationMessageInputSchema(),
  })
}

export const buildSendRawPushNotificationInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    playerEid: string().required(),
    payload: buildPushNotificationPayloadInputSchema(),
    rawPayload: object(),
    rawPayloadJson: string().allow('', null),
  })
}

export const buildSendPushNotificationInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    notificationId: string().required(),
  })
}

export const buildCreateCommentInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    type: buildEnumSchema(NodeType).required(),
    collectionId: string().required(),
    authorEid: string().required(),
    text: string().allow('', null),
    replyToCommentId: string().allow('', null),
    metadata: object(),
    optimisticId: string().allow('', null),
  })
}

export const buildCreateFieldInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    collectionId: string().required(),
    thisEntityId: string().required(),
    thisEntityType: buildEnumSchema(EntityType).required(),
    type: buildEnumSchema(FieldType).required(),
    name: string().allow('', null),
    collectionName: string().allow('', null),
    metadata: object().allow(null),
  })
}

export const buildSaveFieldInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    id: string().allow('', null),
    collectionId: string().required(),
    thisEntityId: string().required(),
    thisEntityType: buildEnumSchema(EntityType).required(),
    type: buildEnumSchema(FieldType).required(),
    name: string().allow('', null),
    collectionName: string().allow('', null),
    metadata: object().allow(null),
    isDeleted: boolean(),
    scope: buildEnumSchema(EntityScope).required(),
    expiresAt: date().allow(null),
  })
}

export const buildCreateEffectInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    collectionId: string().required(),
    thisEid: string().required(),
    type: buildEnumSchema(EffectType).required(),
    metadata: object().allow(null),
    scope: buildEnumSchema(EntityScope).required(),
  })
}

export const buildCreateAnimationEffectInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    collectionId: string().required(),
    thisEid: string().required(),
    animationType: buildEnumSchema(AnimationType).required(),
    sourceUri: string().allow('', null),
    tileId: string().allow('', null),
    startFrame: number().integer().allow(null),
    endFrame: number().integer().allow(null),
    speed: number().integer().allow(null),
    loop: boolean().allow(null),
    scope: buildEnumSchema(EntityScope).required(),
  })
}

export const buildNumberFieldMetadataSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    numberValue: number().required(),
    delta: number(),
  }).unknown()
}

export const buildBooleanFieldMetadataSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    booleanValue: boolean().required(),
  }).unknown()
}

export const buildStringFieldMetadataSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    stringValue: string().allow('', null),
  }).unknown()
}

export const buildPresenceFieldMetadataSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    presenceType: buildEnumSchema(PresenceType).required(),
  }).unknown()
}

const buildActionXSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    unObjectId: string().allow('', null),
    name: string().required(),
    text: string().allow('', null),
    description: string().allow('', null),
    /** @deprecated use ActionXStub isDisabled */
    isEnabled: boolean(),
    backgroundColor: string().allow('', null),
  })
}

export const buildActionsFieldMetadataSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    actions: array().items(buildActionXSchema().unknown()).min(0).max(32),
  }).unknown()
}

export const buildFieldMetadataSchemaForType = (type: FieldType): Joi.ObjectSchema<any> => {
  switch (type) {
    case FieldType.NumberField:
      return buildNumberFieldMetadataSchema()
    case FieldType.BooleanField:
      return buildBooleanFieldMetadataSchema()
    case FieldType.StringField:
      return buildStringFieldMetadataSchema()
    case FieldType.PresenceField:
      return buildPresenceFieldMetadataSchema()
    case FieldType.ActionsField:
      return buildActionsFieldMetadataSchema()
    default:
      return object()
  }
}

export const buildCreateChatRoomSystemCommentInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    chatRoomId: string().required(),
    text: string().max(256).allow('', null),
    replyToCommentId: string().allow('', null),
    visibleToPlayerIds: array().items(string()).min(0).max(32),
    visibleToPlayerEids: array().items(string()).min(0).max(32),
  })
}

export const buildDurationInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    days: number().integer(),
    hours: number().integer(),
    minutes: number().integer(),
    seconds: number().integer(),
  })
}

export const buildCreateNewsfeedItemInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    layout: buildEnumSchema(DynamicFeedItemLayout).required(),
    rateId: string().allow('', null),
    rateLimit: buildDurationInputSchema(),
    userId: string().required(),
    fromEid: string().required(),
    isPublic: boolean(),
    trackingId: string().allow('', null),
    optimisticId: string().allow('', null),
    metadata: object(),
    context: object().required(),
    expiresAt: date().allow(null),
    stateId: string().allow('', null),
    isLive: boolean(),
  })
}

export const buildSaveNewsfeedItemStatusUpdateInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    statusText: string().required(),
    isDeleted: boolean(),
    optimisticId: string().allow('', null),
  })
}

export const buildSubmitActionInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    unObjectId: string().allow('', null),
    name: string().required(),
    tags: array().items(string()).min(0).max(32),
    asUnObjectId: string().allow('', null),
  })
}

export const buildSubmitChatRoomActionInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    chatRoomId: string().required(),
    name: string().required(),
    tags: array().items(string()).min(0).max(32),
    asUnObjectId: string().allow('', null),
    target: string().allow('', null),
    createdAt: date().allow(null),
  })
}

export const buildActionInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    name: string().required(),
    tags: array().items(string()).min(0).max(32),
  })
}

export const buildEdgeStatsInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    pageInput: buildPageInputSchema(),
    entityId: string().allow('', null),
    edgeDirection: buildEnumSchema(EdgeDirection),
    edgeType: buildEnumSchema(EdgeType),
  })
}

export const buildEffectsInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    pageInput: buildPageInputSchema(),
    collectionId: string().allow('', null),
  })
}

export const buildSaveReceiptInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    entityCollectionId: string().required(),
    entityEid: string().required(),
    type: buildEnumSchema(ReceiptType).required(),
    asUnObjectId: string().allow('', null),
  })
}

export const buildSaveReceiptsInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    receipts: array().items(buildSaveReceiptInputSchema()).min(1),
  })
}

export const buildSaveActionInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    name: string().required(),
    text: string().required(),
    description: string().required(),
    package: string().required(),
    collectionId: string().required(),
    s3Key: string().allow('', null),
    xp: number().integer(),
    power: number().integer(),
    order: string().allow('', null),
    backgroundColor: string().allow('', null),
    unObjectId: string().allow('', null),
    tags: array().items(string()).min(0).max(32),
    isEnabled: boolean(),
  })
}

export const buildSaveTileInputMetadataSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    containerStyle: object().allow(null),
    image: buildSaveImageInputSchema().allow(null),
    action: buildActionInputSchema().allow(null),
  }).unknown()
}

export const buildSaveImageInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    uri: string().allow('', null),
    s3Key: string().allow('', null),
  }).unknown()
}

export const buildSaveTileInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    collectionId: string().required(),
    thisEid: string().required(),
    name: string().required(),
    type: buildEnumSchema(TileType).required(),
    entryId: string().allow('', null),
    s3Key: string().allow('', null),
    isDeleted: boolean().allow(null),
    image: buildSaveImageInputSchema().allow(null),
    metadata: buildSaveTileInputMetadataSchema(),
    scope: buildEnumSchema(EntityScope).required(),
  })
}

export const buildCreateChatRoomCommentInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    chatRoomId: string().required(),
    text: string().max(256).allow('', null),
    replyToCommentId: string().allow('', null),
    asUnObjectId: string().allow('', null),
    optimisticId: string().allow('', null),
  })
}

export const buildCreateNewsfeedItemCommentInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    newsfeedItemId: string().required(),
    text: string().max(256).allow('', null),
    replyToCommentId: string().allow('', null),
    asUnObjectId: string().allow('', null),
    optimisticId: string().allow('', null),
  })
}

export const buildCreateNotificationInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    type: buildEnumSchema(NotificationType),
    playerEid: string().required(),
    collectionId: string().required(),
    eventEid: string().allow('', null),
    metadata: object().allow(null),
  })
}

export const buildCreateNewsfeedItemUnObjectImageInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    actor: buildEntitySchema(),
    unObject: buildEntitySchema(),
    statusText: string().required(),
    image: buildSaveImageInputSchema().required(),
  })
}

export const buildSearchInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    query: string().required(),
    friendsOnly: boolean(),
    pageInput: buildPageInputSchema(),
  })
}

export const buildActionsInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    pageInput: buildPageInputSchema(),
  })
}

export const buildUpdateUserFieldsSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    tempEmail: string().max(256).allow(null, ''),
    displayName: string().max(64),
    twitter: string().max(64).allow(null, ''),
    instagram: string().max(64).allow(null, ''),
    location: string().max(128).allow(null, ''),
    bio: string().max(1024).allow(null, ''),
    entryId: string().max(128).allow(null, ''),
    s3Key: string().allow(null, ''),
    gender: buildEnumSchema(Gender),
    birthday: date(),
  })
}

export const buildUpdateUserInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    userId: string().required(),
    updatedFields: buildUpdateUserFieldsSchema(),
  })
}

export const buildEntityInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    entityId: string().required(),
  })
}

export const validateEntityInput = (input: any): EntityInput => {
  return validate(input, buildEntityInputSchema()) as EntityInput
}

export const buildUserEntityInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    userId: string().required(),
    entityId: string().required(),
  })
}

export const validateUserEntityInput = (input: any): UserEntityInput => {
  return validate(input, buildUserEntityInputSchema()) as UserEntityInput
}

export const buildBlockPlayerInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    playerEid: string().required(),
    reason: string().required(),
  })
}

export const buildReportPlayerInputSchema = buildBlockPlayerInputSchema

export const buildFollowPlayerInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    playerEid: string().required(),
  })
}

export const buildSendFriendRequestInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    playerEid: string().required(),
  })
}

export const buildUpdateFriendRequestInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    id: string().required(),
    status: string().valid(FriendRequestStatus.Accepted, FriendRequestStatus.Rejected).required(),
  })
}

export const buildActionXInstanceTemplateSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    id: string(),   // note: typically one of id or actionName is required
    actionName: string(),
    playerEid: string().required(),
    creatorEid: string(),
    isDeleted: boolean(),
    metadata: object().allow(null),
    trxDescription: string(),
  })
}

export const buildActionXInstanceTransferTemplateSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    id: string(),   // note: typically one of id or actionName is required
    actionName: string(),
    playerEid: string().required(),
    transferToPlayerEid: string().required(),
    isDeleted: boolean(),
    metadata: object().allow(null),
    trxDescription: string(),
  })
}

export const buildFriendRequestsInput = (): Joi.ObjectSchema<any> => {
  return object().keys({
    pageInput: buildPageInputSchema(),
  })
}

export const buildFriendsInput = (): Joi.ObjectSchema<any> => {
  return object().keys({
    pageInput: buildPageInputSchema(),
  })
}

export const buildFriendsStoryInput = (): Joi.ObjectSchema<any> => {
  return object().keys({
    pageInput: buildPageInputSchema(),
  })
}

export const homeFeedInput = (): Joi.ObjectSchema<any> => {
  return object().keys({
    pageInput: buildPageInputSchema(),
  })
}

export const buildSavePostInputSchema = (): Joi.ObjectSchema<any> => {
  return object().keys({
    text: string().required(),
    optimisticId: string().allow('', null),
  })
}

export * from '../utils/joi'
