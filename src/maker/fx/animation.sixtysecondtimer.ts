import { metadataImageS3KeyLens, metadataStartFrameLens } from '../fxHelpers'
import { sf, misc } from '../../utils'
import { lotties } from '../helpers'
import { EffectTemplate, ChatRoomActionContextApi, AnimationEffectMetadata, TileMetadata, SequenceEffectItemTemplate } from '../types'
import { AnimationType, EffectType, EntityScope, SequenceEffectMetadata } from '../../gql-types'
import { ReactNativeAnimations } from 'src/maker/animations'

const mainTileName = 'effect.sixtysecondtimer.tile'

const tileEffect = misc.deepFreeze<SequenceEffectItemTemplate<TileMetadata>>({
  type: EffectType.TileEffect,
  waitForTap: false,
  isDeletedOnFinish: false,
  metadata: {
    name: mainTileName,
    animation: {
      animationType: AnimationType.NativeAnimatableAnimation,
      animation: ReactNativeAnimations.FadeIn,
      duration: 1000,
    },
    image: {
      s3Key: 'tile/beer_1.png', // set dynamically
    },
    text: 'hi',
    textStyle: {
      color: 'green',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      alignSelf: null,
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 25,
      right: null,
      left: 5.5,
      height: 10,
      width: 10,
      zIndex: 3,
      borderColor: 'red',
      borderWidth: 0,
    },
  },
})

const fadeInEffect = misc.deepFreeze<SequenceEffectItemTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  waitForTap: false,
  isDeletedOnFinish: false,
  metadata: {
    tileName: mainTileName,
    animationType: AnimationType.NativeAnimatableAnimation,
    animation: ReactNativeAnimations.FadeIn,
    duration: 1000,
    // iterationCount: 3,
    // delay: 500,
  },
})

const timerLottieEffect = misc.deepFreeze<SequenceEffectItemTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  waitForTap: false,
  isDeletedOnFinish: false,
  metadata: {
    tileName: mainTileName,
    animationType: AnimationType.SourcedAnimation,
    sourceUri: lotties.sixtysecondtimer1,
    startFrame: 0,
    endFrame: 300,
  },
})

const fadeOutEffect = misc.deepFreeze<SequenceEffectItemTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  waitForTap: false,
  isDeletedOnFinish: true,
  metadata: {
    tileName: mainTileName,
    animationType: AnimationType.NativeAnimatableAnimation,
    animation: ReactNativeAnimations.FadeIn,
    duration: 1000,
  },
})

const animationSequenceEffectTemplate = misc.deepFreeze<EffectTemplate<SequenceEffectMetadata>>({
  type: EffectType.SequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    sequenceEffectItems: [
      tileEffect,
      fadeInEffect,
      timerLottieEffect,
      fadeOutEffect,
    ],
  },
})

const metadataSequenceEffectItemsLens = sf.lens('metadata.sequenceEffectItems')

/**
 * 
 * @param contextApi 
 * @param startAt accepts a value from 0 to 59.  Represents seocnds in a minute.
 */
export const animate = (contextApi: ChatRoomActionContextApi, startAt: number): Promise<any> => {
  const startFrame = startAt * 5 // 5 frames per second in this specific animation.  300 frames total.

  return contextApi.getChatRoom().saveEffect(
    metadataSequenceEffectItemsLens.set([
      metadataImageS3KeyLens.set('tile/1x1.png')(tileEffect),
      fadeInEffect,
      metadataStartFrameLens.set(startFrame)(timerLottieEffect),
      fadeOutEffect,
    ])(animationSequenceEffectTemplate)
  )
}
