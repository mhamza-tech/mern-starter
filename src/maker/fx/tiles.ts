
import {
  misc,
} from '../../utils'
import {
  TileTemplate,
} from '../types'
import {
  AnimationType,
  TileType,
  EntityScope,
} from '../../gql-types'
import { imageS3Key } from '../helpers'
import { ReactNativeAnimations } from 'src/maker/animations'
import { defaultsDeep } from '../../utils/misc'

export const fullScreenTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'fullScreenTile',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    containerStyle: {
      backgroundColor: 'transparent',
      top: 0,
      left: 0,
      height: 100,
      width: 100,
      zIndex: 10,
    },
  },
})

export const bloodBathTile = misc.deepFreeze<TileTemplate>(defaultsDeep({
  name: 'tile.blood.bath.overlay.animation',
  metadata: {
    image: { s3Key: imageS3Key.Overlay.Square.BloodBath1 },
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FadeIn,
          duration: 1500,
        },
      ],
    },
    containerStyle: {
      zIndex: 100,
      borderColor: 'red',
      borderWidth: 0,
      borderRadius: 0,
      opacity: 1,
    },
  },
}, fullScreenTileTemplate))

// Clone of the tile the FE generates, it's possible to override by passing it explicitly
export const unObjectBackgroundTile = misc.deepFreeze<TileTemplate>(defaultsDeep({
  name: 'layers.avatar',
  metadata: {
    containerStyle: { zIndex: 0 },
    // These need to be set to reflect the NPC in question
    image: { s3Key: null, uri: null },
  },
}, fullScreenTileTemplate))
