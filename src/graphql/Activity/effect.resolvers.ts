/**
 * @rob4lderman
 * mar2020
 * 
 */
import _ from 'lodash'
import {
  combineResolvers,
} from 'graphql-resolvers'
import {
  sf,
  jwt,
} from '../../utils'
import {
  Effect,
  User,
} from '../../db/entity'
import * as fieldModel from './field.model'
import {
  EffectType,
  HashStatus,
  SequenceEffectItem,
  SequenceEffectItemMetadata,
  ModalEffectMetadata,
  ModalType,
  ModalEffectCustomData,
  AnimationEffectMetadata,
} from '../../gql-types'
import * as core from '../core'
import * as store from '../store'
import * as models from '../models'
import { animationEffectMetadataTile } from './field.resolvers'
import { chompCollectionId } from '../models'
import { nativeAnimations } from 'src/domain/nativeAnimations'
import { isKeyOf } from 'src/utils/misc'

/**
 * @deprecated - is not accurate anymore
 */
const effectIsVisibleToMe = (parent, args, ctx): Promise<boolean> => {
  const sessionUser: User = ctx.user
  const eid: string[] = _.takeRight(
    _.split(chompCollectionId(_.get(parent, 'collectionId')), '/'),
    2
  )
  if (_.first(eid) == 'local') {
    return store.mapLocalIdToPlayer(_.last(eid))
      .then(sf.maybe_fmap(store.mapPlayerToUser))
      .then((user: User) => _.get(user, 'id') == sessionUser.id)
  } else {
    return Promise.resolve(true)
  }
}

const resolveEffectIsLocal = (effect: Effect): boolean => {
  return models.isLocalCollectionId(effect.collectionId)
}

const resolveEffectIsPrivate = (effect: Effect): boolean => {
  return _.includes(effect.collectionId, 'privateeffect')
}

const resolveEffectThisEntity = <T>(effect): Promise<T> => {
  return store.thisEntityOfEffect<T>(effect)
}

const resolveInteractionEffectTargetPlayer = resolveEffectThisEntity

const resolveInteractionEffectHashStatus = (effect: Effect): HashStatus => {
  return sf.maybe_fmap(fieldModel.fieldToHashStatus)(_.get(effect, 'metadata.hashStatus'))
}

const mapEffectTypeToMetadataTypeName = (effectType: EffectType): string | undefined => {
  switch (effectType) {
    case EffectType.AnimationEffect:
      return 'AnimationEffectMetadata'
    case EffectType.SoundEffect:
      return 'SoundEffectMetadata'
    case EffectType.VibrationEffect:
      return 'VibrationEffectMetadata'
    case EffectType.SystemMessageEffect:
      return 'SystemMessageEffectMetadata'
    case EffectType.ModalEffect:
      return 'ModalEffect'
    case EffectType.TileEffect:
      return 'TileMetadata'
    case EffectType.ActionEffect:
      return undefined
    default:
      throw new Error(`ERROR: mapEffectTypeToMetadataTypeName: Unexpected EffectType ${effectType}`)
  }
}

const mapModalTypeToMetadataTypeName = (modalType: ModalType): string | undefined => {
  switch (modalType) {
    case ModalType.SwippableCards:
      return 'SwippableCardsModalCustomData'
    case ModalType.ProgressBar:
      return 'ProgressBarModalCustomData'
    default: return undefined
  }
}

/**
 * @param sequenceEffectItem
 * @return sequenceEffectItem.metadata, extended with { __resolveType: 'xx' }.
 */
const resolveSequenceEffectItemMetadata = (sequenceEffectItem: SequenceEffectItem): SequenceEffectItemMetadata => {
  const typeName = mapEffectTypeToMetadataTypeName(sequenceEffectItem.type)
  return typeName ? _.extend({}, sequenceEffectItem.metadata, { __resolveType: typeName }) : sequenceEffectItem.metadata
}

const sequenceEffectItemMetadataResolveType = (metadata: SequenceEffectItemMetadata): string => {
  return _.get(metadata, '__resolveType')
}

const resolveModalEffectMetadata = (modalEffect: ModalEffectMetadata): ModalEffectCustomData => {
  const typeName = mapModalTypeToMetadataTypeName(modalEffect.modalType)
  return typeName ? _.extend({}, modalEffect.metadata, { __resolveType: typeName }) : modalEffect.metadata
}

const ModalEffectMetadataResolveType = (metadata: ModalEffectMetadata): string => {
  return _.get(metadata, '__resolveType')
}

const resolveAnimationString = (parent: AnimationEffectMetadata): string | undefined => {
  const { animationTemplate } = parent
  if (isKeyOf(animationTemplate, nativeAnimations)) {
    // The metadata is augmented based on the animationTemplate string
    _.defaults(parent, nativeAnimations[animationTemplate])
  }
  return parent.animation
}

//
// GraphQL schema resolver table.
//

export default {
  Mutation: {
    createEffect: combineResolvers(jwt.requireMasterApiKeyGql, core.createEffect),
    createAnimationEffect: combineResolvers(jwt.requireMasterApiKeyGql, core.createAnimationEffect),
  },
  AnimationEffectMetadata: {
    sourceUri: core.resolveSourceUri,
    sourceType: core.resolveSourceType,
    tile: animationEffectMetadataTile,
    backgroundColor: core.resolveColor('backgroundColor'),
    animation: resolveAnimationString,
  },
  Effect: {
    asAnimationEffect: core.resolveAsEffectType(EffectType.AnimationEffect),
    asAnimationSequenceEffect: core.resolveAsEffectType(EffectType.AnimationSequenceEffect),
    asSoundEffect: core.resolveAsEffectType(EffectType.SoundEffect),
    asVibrationEffect: core.resolveAsEffectType(EffectType.VibrationEffect),
    asSequenceEffect: core.resolveAsEffectType(EffectType.SequenceEffect),
    asConcurrentEffect: core.resolveAsEffectType(EffectType.ConcurrentEffect),
    asTileEffect: core.resolveAsEffectType(EffectType.TileEffect),
    asSystemMessageEffect: core.resolveAsEffectType(EffectType.SystemMessageEffect),
    asActionEffect: core.resolveAsEffectType(EffectType.ActionEffect),
    asModalEffect: core.resolveAsEffectType(EffectType.ModalEffect),
    asInteractionEffect: core.resolveAsEffectType(EffectType.InteractionEffect),
    asTransferActionEffect: core.resolveAsEffectType(EffectType.TransferActionEffect),
    asCreateActionEffect: core.resolveAsEffectType(EffectType.CreateActionEffect),
    asDeleteActionEffect: core.resolveAsEffectType(EffectType.DeleteActionEffect),
    eid: core.resolveEid,
    receipts: core.entityReceipts,
    isPrivate: resolveEffectIsPrivate,
    isLocal: resolveEffectIsLocal,
  },
  SoundEffect: {
    soundType: core.resolveFromMetadata('soundType'),
    sourceUri: core.resolveSourceUriFromMetadata,
  },
  SoundEffectMetadata: {
    sourceUri: core.resolveSourceUri,
  },
  SystemMessageEffect: {
    text: core.resolveFromMetadata('text'),
    isVisibleToMe: combineResolvers(jwt.requireJwtAuth, effectIsVisibleToMe),
    image: core.resolveImageNoDefault,
  },
  InteractionEffect: {
    asEffect: _.identity,
    actor: core.resolveFromMetadata('actor'),
    action: core.resolveFromMetadata('action'),
    hashStatus: resolveInteractionEffectHashStatus,
    text: core.resolveFromMetadata('text'),
    targetPlayer: resolveInteractionEffectTargetPlayer,
  },
  SequenceEffectItem: {
    metadata: resolveSequenceEffectItemMetadata,
    asAnimationEffect: core.resolveAsEffectType(EffectType.AnimationEffect),
    asSoundEffect: core.resolveAsEffectType(EffectType.SoundEffect),
    asVibrationEffect: core.resolveAsEffectType(EffectType.VibrationEffect),
    asTileEffect: core.resolveAsEffectType(EffectType.TileEffect),
    asSystemMessageEffect: core.resolveAsEffectType(EffectType.SystemMessageEffect),
    asActionEffect: core.resolveAsEffectType(EffectType.ActionEffect),
  },
  SequenceEffectItemMetadata: {
    __resolveType: sequenceEffectItemMetadataResolveType,
  },
  ModalEffectMetadata: {
    __resolveType: ModalEffectMetadataResolveType,
    metadata: resolveModalEffectMetadata,
    asSwippableCardsModal: core.resolveAsModalType(ModalType.SwippableCards),
    asProgressBarModal: core.resolveAsModalType(ModalType.ProgressBar),
  },
  ModalEffectCustomData: {
    __resolveType: ModalEffectMetadataResolveType,
  },
}
