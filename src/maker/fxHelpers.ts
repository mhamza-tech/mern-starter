import { sf, misc } from '../utils'
import { TileTemplate, EffectTemplate, AnimationEffectMetadata, ContainerStyle } from './types'
import { AnimationType, EffectType, EntityScope, TileType } from '../gql-types'
import { ReactNativeAnimations } from './animations/react-native-animations'

export const metadataImageLens = sf.lens('metadata.image')
export const isDeletedLens = sf.lens('isDeleted')
export const metadataAnimationLens = sf.lens('metadata.animation')
export const metadataAnimationLottieURILens = sf.lens('metadata.animation.sourceUri')
export const zIndexLens = sf.lens('metadata.containerStyle.zIndex')
export const opacityLens = sf.lens('metadata.containerStyle.opacity')
export const tileIdLens = sf.lens('metadata.tileId')
export const sourceUriLens = sf.lens('metadata.sourceUri')
export const imageS3KeyLens = sf.lens('metadata.image.s3Key')
export const metadataImageS3KeyLens = sf.lens('metadata.image.s3Key')
export const metadataStartFrameLens = sf.lens('metadata.startFrame')

export const nativeAnimatableEffectTemplate = misc.deepFreeze<EffectTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationType: AnimationType.NativeAnimatableAnimation,
    animation: ReactNativeAnimations.Bounce,
    duration: 1000,
  },
})

export const nativeAnimatableEffectTemplateShort = misc.deepFreeze<EffectTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationType: AnimationType.NativeAnimatableAnimation,
    animation: ReactNativeAnimations.Bounce,
    duration: 200,
  },
})

export enum StaticNewsCards {
  JacobTinderDate = 'tile/jacob_on_tinder.png',
  RainbowPoop = 'tile/rainbow_poop.jpg',
  Shoveling1 = 'tile/shoveling_poop_1.jpg',
  Shoveling2 = 'tile/shoveling_poop_2.jpg',
  Knife1 = 'tile/weapon_1.jpg',
  MagicObjectBrick = 'tile/magic_object.jpg',
  WanderingMap = 'tile/wondering_map.jpg',
  Lore = 'tile/lore_of_unreal.jpg',
}

export const backgroundTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'reserved.tile.background',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: '',
    },
    animation: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: '',
      loop: true,
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 0,
      left: 0,
      height: 100,
      width: 100,
      zIndex: -1,
      borderColor: 'red',
      borderWidth: 0,
    },
  },
})

export const applyPadding = (style: ContainerStyle, vertical: number, horizontal = vertical): ContainerStyle => {
  const { left, right, width, height, top, bottom } = style
  return { ...style,
    left: left && left - horizontal,
    right: right && right - horizontal,
    top: top && top - vertical,
    bottom: bottom && bottom - vertical,
    width: width && width + 2 * horizontal,
    height: height && height + 2 * vertical,
  }
}
