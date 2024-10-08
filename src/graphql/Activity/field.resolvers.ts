/**
 * @rob4lderman
 * jan2020
 * 
 * 
 */
import _ from 'lodash'
import { combineResolvers } from 'graphql-resolvers'
import {
  sft,
  jwt,
} from '../../utils'
import {
  Edge,
  Tile,
  User,
  Player,
  Field,
} from '../../db/entity'
import * as fieldModel from './field.model'
import * as edgeModel from './edge.model'
import {
  EntityType,
  FieldType,
  EntityRef,
  HashStatus,
  HashtributeField,
  EdgeType,
  AnimationEffectMetadata,
  AnimationEffect,
  ActionXStub,
  ActionX,
} from 'src/gql-types'
import * as core from '../core'
import * as store from '../store'
import * as models from '../models'
import { safeIn } from 'src/db/utils'
import { mapEntityRefToEid } from '../models'

export const animationEffectTile = (parent: AnimationEffect): Promise<Tile> => {
  const tileId = _.get(parent, 'metadata.tileId')
  return store.entityByEntityRef({ id: tileId, entityType: EntityType.Tile })
}

export const animationEffectMetadataTile = (parent: AnimationEffectMetadata): Promise<Tile> => {
  const tileId = _.get(parent, 'tileId')
  return store.entityByEntityRef({ id: tileId, entityType: EntityType.Tile })
}

const fieldThisEid = (field): string => {
  return mapEntityRefToEid({
    id: field.thisEntityId,
    entityType: field.thisEntityType,
  })
}

const fieldIsMyField = (field, args, ctx): Promise<boolean> => {
  const sessionUser: User = ctx.user
  const thisEntityRef: EntityRef = {
    id: field.thisEntityId,
    entityType: field.thisEntityType,
  }
  return core.isPlayerEntityHandledByThisUser(thisEntityRef, sessionUser)
}

const fieldAsJSONObjectField = (field): Promise<any> => {
  return _.get(field, 'type') == FieldType.JsonObjectField
    ? _.get(field, 'metadata')
    : null
}

/**
 * @return array of edges ID'd by field.metadata.edgeIds
 */
const edgesFieldEdges = (field: Field): Promise<Edge[]> => {
  const edgeIds = _.get(field, 'metadata.edgeIds')
  // TODO: return store.mapEdgeIdsToEdges( edgeIds, ctx )
  // TODO:     .then( (edges:Edge[]) => _.reject( edges, (edge:Edge) => edge.isDeleted ))
  // TODO: cache
  return edgeModel.readEdgesBy({
    where: {
      id: safeIn(edgeIds),
      isDeleted: false,
    },
    order: {
      order: 'ASC',
    },
  })
}

/**
 * 
 * @return array of Edges w/ EdgeType.ActionX, resolved via either...
 *          1) field.metadata.actionEdges (denormalized)
 *          2) field.metadata.edgeIds -> ActionXEdges
 *          3) field.metadata.actionXIds -> (+ field.thisEntityId) -> ActionXEdges
 */
const actionXEdgesFieldActionEdges = (field: Field): any => {
  const thisEntityId = field.thisEntityId
  const actionEdges = _.get(field, 'metadata.actionEdges')
  if (!!!_.isEmpty(actionEdges)) {
    return actionEdges
  }
  const actionXIds = _.get(field, 'metadata.actionXIds')
  if (!actionXIds.length) {
    return edgesFieldEdges(field)
  }
  return sft.promiseMap(actionXIds, (id: string) => store.edgeByThisThatIdsEdgeType({
    thisEntityId,
    thatEntityId: id,
    edgeType: EdgeType.ActionX,
  }))
}

const resolveFieldThisEntity = <T>(field): Promise<T> => {
  return store.thisEntityOfField<T>(field)
}

const resolveHashStatusPlayer = (field): Promise<Player> => {
  return store.thisEntityOfField<any>(field)
    .then((thisEntity: any) => models.isPlayer(thisEntity) ? thisEntity as Player : null)
}

const resolveFieldIsLocal = (field: Field): boolean => {
  return models.isLocalCollectionId(field.collectionId)
}

const resolveFieldIsPrivate = (field: Field): boolean => {
  return _.includes(field.collectionId, 'privatefield')
}

const actionXStubAction = (actionStub: ActionXStub): Promise<ActionX> => {
  return actionStub.action
    ? Promise.resolve(actionStub.action)
    : store.actionByName(actionStub.actionName)
}

const actionXStubActionInstances = (actionStub: ActionXStub, args, ctx: any): Promise<any> => {
  const user: User = ctx.user
  return actionStub.actionInstances
    ? Promise.resolve(actionStub.actionInstances)
    : store.actionXInstancesByPlayer(user.eid)
      .then(instances => instances.filter(instance => instance.actionName === actionStub.actionName))
}

//
// GraphQL schema resolver table.
//

export default {
  Mutation: {
    createField: combineResolvers(jwt.requireMasterApiKeyGql, core.saveField),
    saveField: combineResolvers(jwt.requireMasterApiKeyGql, core.saveField),
  },
  Field: {
    asBooleanField: core.resolveAsFieldType(FieldType.BooleanField),
    asDateField: core.resolveAsFieldType(FieldType.DateField),
    asNumberField: core.resolveAsFieldType(FieldType.NumberField),
    asChatRoomLastViewedAt: core.resolveAsFieldType(FieldType.ChatRoomLastViewedAt),
    asChatRoomIsTyping: core.resolveAsFieldType(FieldType.ChatRoomIsTyping),
    asActionsField: core.resolveAsFieldType(FieldType.ActionsField),
    asAnimationField: core.resolveAsFieldType(FieldType.AnimationField),
    asPresenceField: core.resolveAsFieldType(FieldType.PresenceField),
    asJSONObjectField: fieldAsJSONObjectField,
    asProgressField: core.resolveAsFieldType(FieldType.ProgressField),
    asCountdownField: core.resolveAsFieldType(FieldType.CountdownField),
    asHashStatusField: core.resolveAsFieldTypeWithTransform<HashStatus>(FieldType.HashStatusField, fieldModel.fieldToHashStatus),
    asHashtributeField: core.resolveAsFieldTypeWithTransform<HashtributeField>(FieldType.HashtributeField, fieldModel.fieldToHashtributeField),
    asEdgesField: core.resolveAsFieldType(FieldType.EdgesField),
    asActionXEdgesField: core.resolveAsFieldType(FieldType.ActionXEdgesField),
    asActionXStubsField: core.resolveAsFieldType(FieldType.ActionXStubsField),
    asXpField: core.resolveAsFieldType(FieldType.NumberField),
    asButtonField: core.resolveAsFieldType(FieldType.ButtonField),
    thisEid: fieldThisEid,
    thisEntity: resolveFieldThisEntity,
    isMyField: fieldIsMyField,
    isLocal: resolveFieldIsLocal,
    isPrivate: resolveFieldIsPrivate,
  },
  BooleanField: {
    booleanValue: core.resolveFromMetadata2('booleanValue', 'value'),
  },
  DateField: {
    dateValue: core.resolveFromMetadata2('dateValue', 'value'),
  },
  NumberField: {
    numberValue: core.resolveFromMetadata('numberValue'),
    delta: core.resolveFromMetadataWithDefault('delta', 0),
  },
  ActionsField: {
    actions: core.resolveArrayFromMetadata('actions'),
  },
  PresenceField: {
    presenceType: core.resolveFromMetadata('presenceType'),
  },
  ProgressField: {
    numberValue: core.resolveFromMetadata('numberValue'),
    minValue: core.resolveFromMetadata('minValue'),
    maxValue: core.resolveFromMetadata('maxValue'),
    color: core.resolveFromMetadata('color'),
  },
  AnimationField: {
    animationType: core.resolveFromMetadata('animationType'),
    sourceUri: core.resolveSourceUriFromMetadata,
    sourceType: core.resolveSourceTypeFromMetadata,
    tileId: core.resolveFromMetadata('tileId'),
    tile: animationEffectTile,
    startFrame: core.resolveFromMetadata('startFrame'),
    endFrame: core.resolveFromMetadata('endFrame'),
    loop: core.resolveFromMetadata('loop'),
    speed: core.resolveFromMetadata('speed'),
  },
  HashStatus: {
    player: resolveHashStatusPlayer,
  },
  EdgesField: {
    edgeIds: core.resolveArrayFromMetadata('edgeIds'),
    edges: edgesFieldEdges,
  },
  ActionXEdgesField: {
    edgeIds: core.resolveArrayFromMetadata('edgeIds'),
    actionXIds: core.resolveArrayFromMetadata('actionXIds'),
    asField: _.identity,
    actionEdges: actionXEdgesFieldActionEdges,
  },
  ActionXStub: {
    action: actionXStubAction,
    actionInstances: combineResolvers(jwt.requireJwtGql, actionXStubActionInstances),
  },
  CountdownField: {
    startDateTime: core.resolveFromMetadata('startDateTime'),
    warnDateTime: core.resolveFromMetadata('warnDateTime'),
    dangerDateTime: core.resolveFromMetadata('dangerDateTime'),
    expiryDateTime: core.resolveFromMetadata('expiryDateTime'),
    image: core.resolveImageFromMetadata,
    style: core.resolveFromMetadata('style'),
    text: core.resolveFromMetadata('text'),
  },
  ButtonField: {
    actionName: core.resolveFromMetadata('actionName'),
    isDisabled: core.resolveFromMetadata('isDisabled'),
  },
}
