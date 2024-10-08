import { metadataImageS3KeyLens } from '../fxHelpers'
import { ReactNativeAnimations } from 'src/maker/animations'
import { sf, misc } from '../../utils'
import { EffectTemplate, ChatRoomActionContextApi, AnimationEffectMetadata, TileMetadata, SequenceEffectItemTemplate } from '../types'
import { AnimationType, EffectType, EntityScope, SequenceEffectMetadata } from '../../gql-types'

const tileEffect = misc.deepFreeze<SequenceEffectItemTemplate<TileMetadata>>({
  type: EffectType.TileEffect,
  waitForTap: false,
  isDeletedOnFinish: false,
  metadata: {
    name: 'effect.removefrominventory.tile',
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

const flashEffect = misc.deepFreeze<SequenceEffectItemTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  waitForTap: false,
  isDeletedOnFinish: false,
  metadata: {
    tileName: 'effect.removefrominventory.tile',
    animationType: AnimationType.NativeAnimatableAnimation,
    animation: ReactNativeAnimations.Flash,
    duration: 1000,
    iterationCount: 3,
    delay: 500,
  },
})

const poofEffect = misc.deepFreeze<SequenceEffectItemTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  waitForTap: false,
  isDeletedOnFinish: true,
  metadata: {
    tileName: 'effect.removefrominventory.tile',
    animationType: AnimationType.SourcedAnimation,
    sourceUri: 'https://66.media.tumblr.com/528473c7d56b8d0011753747b9b42576/tumblr_o6bmi8bfyN1u8yw5ao1_500.gif',
  },
})

// const fadeOutDownEffect = misc.deepFreeze<SequenceEffectItem>({
//   type: EffectType.AnimationEffect,
//   waitForTap: false,
//   isDeletedOnFinish: true,
//   metadata: {
//     tileName: 'effect.removefrominventory.tile',
//     animationType: AnimationType.NativeAnimatableAnimation,
//     animation: rnAnimations.fadeOutDown,
//     duration: 500,
//   },
// })

const animationSequenceEffectTemplate = misc.deepFreeze<EffectTemplate<SequenceEffectMetadata>>({
  type: EffectType.SequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    sequenceEffectItems: [
      tileEffect,
      flashEffect,
      poofEffect,
    ],
  },
})

const metadataSequenceEffectItemsLens = sf.lens('metadata.sequenceEffectItems')

export const animate = (contextApi: ChatRoomActionContextApi, imageS3Key: string): Promise<any> => {
  return contextApi.getChatRoom().saveEffect(
    metadataSequenceEffectItemsLens.set([
      metadataImageS3KeyLens.set(imageS3Key)(tileEffect),
      flashEffect,
      poofEffect,
    ])(animationSequenceEffectTemplate)
  )
}
