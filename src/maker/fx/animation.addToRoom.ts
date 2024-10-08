import { AnimationType, EffectType, EntityScope } from '../../gql-types'
import { ReactNativeAnimations } from 'src/maker/animations'
import { EffectTemplate, AnimationEffectMetadata } from '../../maker/types'
import { misc } from '../../utils'

// can be used as TileMetadata.animation
export const animation = misc.deepFreeze<AnimationEffectMetadata>({
  animationType: AnimationType.NativeAnimatableAnimation,
  animation: ReactNativeAnimations.ZoomIn,
  duration: 300,
})

// Full EffectTemplate, useful for saveEffect/saveEffectOnTile
export const effect = misc.deepFreeze<EffectTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  scope: EntityScope.GlobalScope,
  metadata: animation,
})
