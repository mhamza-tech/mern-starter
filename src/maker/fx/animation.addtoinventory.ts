import { metadataImageS3KeyLens as fxAddToInventory } from '../fxHelpers'
import { sf, misc } from '../../utils'
import { lotties } from '../helpers'
import { EffectTemplate, ChatRoomActionContextApi, AnimationEffectMetadata, TileMetadata, SequenceEffectItemTemplate } from '../types'
import { AnimationType, EffectType, EntityScope, SequenceEffectMetadata } from '../../gql-types'
import { ReactNativeAnimations } from 'src/maker/animations'

const tileEffect = misc.deepFreeze<SequenceEffectItemTemplate<TileMetadata>>({
  type: EffectType.TileEffect,
  waitForTap: false,
  isDeletedOnFinish: false,
  metadata: {
    name: 'effect.addtoinventory.tile',
    animation: {
      animationType: AnimationType.NativeAnimatableAnimation,
      animation: ReactNativeAnimations.BounceInUp,
      duration: 1000,
    },
    image: {
      s3Key: 'tile/beer_1.png', // set dynamically
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 85,
      right: 85,
      height: 15,
      width: 15,
      zIndex: 3,
      borderColor: 'red',
      borderWidth: 0,
    },
  },
})

const tadaEffect = misc.deepFreeze<SequenceEffectItemTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  waitForTap: false,
  isDeletedOnFinish: false,
  metadata: {
    tileName: 'effect.addtoinventory.tile',
    animationType: AnimationType.NativeAnimatableAnimation,
    animation: ReactNativeAnimations.Tada,
    duration: 1000,
    iterationCount: 3,
    delay: 500,
  },
})

const greenCheckEffect = misc.deepFreeze<SequenceEffectItemTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  waitForTap: false,
  isDeletedOnFinish: false,
  metadata: {
    tileName: 'effect.addtoinventory.tile',
    animationType: AnimationType.SourcedAnimation,
    sourceUri: lotties.greencheck2,
  },
})

const fadeOutDownEffect = misc.deepFreeze<SequenceEffectItemTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  waitForTap: false,
  isDeletedOnFinish: true,
  metadata: {
    tileName: 'effect.addtoinventory.tile',
    animationType: AnimationType.NativeAnimatableAnimation,
    animation: ReactNativeAnimations.FadeOutDown,
    duration: 1000,
  },
})

const animationSequenceEffectTemplate = misc.deepFreeze<EffectTemplate<SequenceEffectMetadata>>({
  type: EffectType.SequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    sequenceEffectItems: [
      tileEffect,
      tadaEffect,
      greenCheckEffect,
      fadeOutDownEffect,
    ],
  },
})

const metadataSequenceEffectItemsLens = sf.lens('metadata.sequenceEffectItems')

export const animate = (contextApi: ChatRoomActionContextApi, imageS3Key: string): Promise<any> => {
  return contextApi.getChatRoom().saveEffect(
    metadataSequenceEffectItemsLens.set([
      fxAddToInventory.set(imageS3Key)(tileEffect),
      tadaEffect,
      greenCheckEffect,
      fadeOutDownEffect,
    ])(animationSequenceEffectTemplate)
  )
}
