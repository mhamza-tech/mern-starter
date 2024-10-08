/**
 * @rob4lderman
 * mar2020
 *
 */

import _ from 'lodash'
import { deepFreeze, defaultsDeep } from 'src/utils/misc'
import {
  CreateEffectOutput,
  CreateEffectInput,
  EntityScope,
  EffectType,
  Field,
  FieldType,
  EntityType,
  AnimationType,
  Image,
} from 'src/gql-types'
import {
  ActionX,
  ActionXInstance,
} from 'src/db/entity'
import { sf, sft } from 'src/utils'
import * as joi from 'src/graphql/joi'
import {
  ActionXInstanceTemplate,
  ActionXInstanceTransferTemplate,
} from 'src/types'
import { SimpleOrmObject } from 'src/db/entity/SimpleOrmObject'
import * as models from 'src/graphql/models'
import * as actionXModel from './actionx.model'
import * as store from 'src/graphql/store'
import * as core from 'src/graphql/core'
import * as pubsub from 'src/graphql/pubsub'

const actionTags = (action: ActionX): string[] => {
  return actionXModel.parseActionXRawTags(action)
}

export const createActionXInstance = (input: ActionXInstanceTemplate): Promise<ActionXInstance> => {
  return Promise.resolve(input)
    .then((input) => joi.validate(input, joi.buildActionXInstanceTemplateSchema()))
    .then(actionXModel.buildActionXInstance)
    .then(store.saveActionInstance)
    .then(sf.tap_catch(pubsub.publishActionXInstance))
    .then(sf.tap_catch(_.partial(createCreateActionEffect, input)))
}

const createCreateActionEffect = (input: ActionXInstanceTemplate, actionInstance: ActionXInstance): Promise<CreateEffectOutput> => {
  if (_.isEmpty(actionInstance)) {
    return Promise.resolve(null)
  }
  const effectInput: CreateEffectInput = {
    collectionId: models.buildCollectionId(models.mapEntityToEid(actionInstance), 'effect'),
    scope: EntityScope.GlobalPrivateScope,
    thisEid: models.mapEntityToEid(actionInstance),
    type: EffectType.CreateActionEffect,
    metadata: {
      input,
      actionInstanceSnapshot: actionInstance,
    },
  }
  return core.createEffect(null, { input: effectInput }, null)
}

export const transferActionXInstance = (input: ActionXInstanceTransferTemplate): Promise<ActionXInstance> => {
  return transferActionXInstanceHelper(input)
    .then(sf.tap_catch(_.partial(createTransferActionEffect, input)))
}

export const readActionXInstance = (input: ActionXInstanceTransferTemplate): Promise<SimpleOrmObject<ActionXInstance> | undefined> => {
  return actionXModel.readActionXInstanceBy(input)
}

export const readActionXInstances = (input: ActionXInstanceTransferTemplate): Promise<SimpleOrmObject<ActionXInstance>[]> => {
  return actionXModel.readActionXInstancesBy(input)
}

const transferActionXInstanceHelper = (input: ActionXInstanceTransferTemplate): Promise<ActionXInstance> => {
  return Promise.resolve(input)
    .then(template => !template.id
      ? actionXModel.transferLastUpdatedActionXInstance(input)
      : actionXModel.transferActionXInstance(input),
    )
    .then(sft.tap_wait(() => Promise.all([
      store.invalidateActionInstancesByPlayerCache({ playerEid: input.playerEid }, true),
      store.invalidateActionInstancesByPlayerCache({ playerEid: input.transferToPlayerEid }, true),
    ])))
}

const createTransferActionEffect = (input: ActionXInstanceTransferTemplate, actionInstance: ActionXInstance): Promise<CreateEffectOutput> => {
  if (_.isEmpty(actionInstance)) {
    return Promise.resolve(null)
  }
  const effectInput: CreateEffectInput = {
    collectionId: models.buildCollectionId(models.mapEntityToEid(actionInstance), 'effect'),
    scope: EntityScope.GlobalPrivateScope,
    thisEid: models.mapEntityToEid(actionInstance),
    type: EffectType.TransferActionEffect,
    metadata: {
      input,
      actionInstanceSnapshot: actionInstance,
    },
  }
  return core.createEffect(null, { input: effectInput }, null)
}

export const deleteActionXInstance = (input: ActionXInstanceTemplate): Promise<ActionXInstance> => {
  return deleteActionXInstanceHelper(input)
    .then(sf.tap_catch(_.partial(createDeleteActionEffect, input)))
}

const deleteActionXInstanceHelper = (input: ActionXInstanceTemplate): Promise<ActionXInstance> => {
  return Promise.resolve(input)
    .then(template => !template.id
      ? actionXModel.deleteLastUpdatedActionXInstance(input)
      : actionXModel.deleteActionXInstance(input),
    )
    .then(sf.tap_wait(
      instance => _.isNil(instance)
        ? null
        : store.invalidateActionInstancesByPlayerCache({ playerEid: instance.playerEid }, true)
    ))
}

const createDeleteActionEffect = (input: ActionXInstanceTemplate, actionInstance: ActionXInstance): Promise<CreateEffectOutput> => {
  if (_.isEmpty(actionInstance)) {
    return Promise.resolve(null)
  }
  const effectInput: CreateEffectInput = {
    collectionId: models.buildCollectionId(models.mapEntityToEid(actionInstance), 'effect'),
    scope: EntityScope.GlobalPrivateScope,
    thisEid: models.mapEntityToEid(actionInstance),
    type: EffectType.DeleteActionEffect,
    metadata: {
      input,
      actionInstanceSnapshot: actionInstance,
    },
  }
  return core.createEffect(null, { input: effectInput }, null)
}

const actionXInstanceAction = (actionInstance: ActionXInstance): Promise<ActionX> => {
  return store.actionByName(actionInstance.actionName)
}

const resolveImageUri = (image: Image): string => {
  return image?.uri || models.mapS3KeyToImgixImageUrl(image?.s3Key)
}

const DEFAULT_DROP_ANIMATION = 'gif/puff.gif'

const defaultDropAnimationField = deepFreeze<Field>({
  entityType: EntityType.Field,
  type: FieldType.AnimationField,
  scope: EntityScope.GlobalScope,
  name: 'dropAnimation',
  thisEntityType: EntityType.ActionX,
  recordVersion: 1,
  // Must be set per action
  id: null, collectionId: null, thisEntityId: null, thisEid: null,
  metadata: { animationType: AnimationType.SourcedAnimation, s3Key: DEFAULT_DROP_ANIMATION },
})

const resolveDropAnimation = (action: ActionX): Promise<Field> => {
  return core.resolveField(defaultDropAnimationField.name)(action).then((field) => {
    if (field) {
      return field
    }
    // If no dropAnimation was set in the configuration for the action, send the default one
    const thisEid = models.mapEntityToEid(action)
    return defaultsDeep({
      id: action.id, thisEntityId: action.id, thisEid,
      collectionId: models.buildCollectionId(thisEid, 'field'),
    }, defaultDropAnimationField)
  })
}

//
// The resolvers.
//
export default {
  ActionX: {
    image: core.resolveImageNoDefault,
    tags: actionTags,
    /** @deprecated use ActionXStub isDisabled */
    isEnabled: (action: ActionX): boolean => _.get(action, 'isEnabled', true),
    dropAnimationField: resolveDropAnimation,
    backgroundColor: core.resolveColor('backgroundColor'),
  },
  ActionXInstance: {
    action: actionXInstanceAction,
  },
  Image: {
    uri: resolveImageUri,
    backgroundColor: core.resolveColor('backgroundColor'),
  },
}
