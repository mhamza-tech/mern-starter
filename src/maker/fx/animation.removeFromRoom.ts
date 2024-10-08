import { EffectType, EntityScope, AnimationType, NativeAnimations, SequenceEffectMetadata } from 'src/gql-types'
import { AnimationSequenceEffectMetadata, EffectTemplate, AnimationSequence, AnimationEffectMetadata, TileMetadata, SequenceEffectItemTemplate } from 'src/maker/types'
import { deepFreeze, cloneDeep } from 'src/utils/misc'
import { animation as addToRoom } from './animation.addToRoom'
import { ReactNativeAnimations } from '../animations'

export const duration = 800

// can be used as TileMetadata.animation
export const animation = deepFreeze<AnimationEffectMetadata>({
  animationType: AnimationType.NativeAnimation,
  animation: NativeAnimations.AddToInventoryFallDownFullScreen,
  duration,
})

// can be used as TileMetadata.animationSequence
export const animationSequence = deepFreeze<AnimationSequence>({
  // Make the FE delete it to ensure it doesn't reappear
  isDeletedOnFinish: true,
  animations: [animation],
})

// Full EffectTemplate, used for saveEffect/saveEffectOnTile
export const effect = deepFreeze<EffectTemplate<AnimationSequenceEffectMetadata>>({
  type: EffectType.AnimationSequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: { animationSequence },
})

// Similar to conventional effects like addtoinventory

const tileEffect = deepFreeze<SequenceEffectItemTemplate<TileMetadata>>({
  type: EffectType.TileEffect,
  metadata: {
    name: 'tile.effect.removeFromRoom',
    // Make entrance slower than the built-in
    animation: { ...addToRoom, duration },
    image: { s3Key: null },
    containerStyle: {
      width: 33,
      height: 33,
      left: 33,
      top: 33,
      zIndex: 50,
    },
  },
})

const waitEffect = deepFreeze<SequenceEffectItemTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  metadata: {
    tileName: tileEffect.metadata.name,
    animationType: AnimationType.NativeAnimatableAnimation,
    animation: ReactNativeAnimations.Pulse,
    duration: 2000,
  },
})

const fallEffect = deepFreeze<SequenceEffectItemTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  isDeletedOnFinish: true,
  metadata: { tileName: tileEffect.metadata.name, ...animation },
})

const sequenceEffect = deepFreeze<EffectTemplate<SequenceEffectMetadata>>({
  type: EffectType.SequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: { sequenceEffectItems: [tileEffect, waitEffect, fallEffect] },
})

export const animate = (imageS3Key?: string): EffectTemplate<SequenceEffectMetadata> => {
  const sequence = cloneDeep(sequenceEffect)
  const metadata = sequence.metadata.sequenceEffectItems[0].metadata as TileMetadata
  metadata.image.s3Key = imageS3Key
  return sequence
}
