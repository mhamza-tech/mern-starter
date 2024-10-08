import { misc } from 'src/utils'
import { FieldTemplate, JsonObjectFieldMetadata, TileTemplate } from 'src/types'
import { FieldType, EntityScope, TileType, AnimationType, NativeAnimations } from 'src/gql-types'
import { deepFreeze } from 'src/utils/misc'

export const defaultStateField = misc.deepFreeze<FieldTemplate<JsonObjectFieldMetadata>>({
  type: FieldType.JsonObjectField,
  name: '',
  scope: EntityScope.GlobalScope,
  metadata: { version: 1.0, state: {} },
})

export const itemTileTemplate = deepFreeze<TileTemplate>({
  name: 'tile.engine.item',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: { s3Key: null },
    animation: {
      animationType: AnimationType.NativeAnimation,
      animation: NativeAnimations.Hover,
      duration: 1600,
      loop: true,
    },
    dropTarget: true,
    animationSequence: null,
    containerStyle: {
      zIndex: 25,
      width: 33.3,
      height: 33.3,
      top: 66.41,
      left: 33.3,
    },
  },
})

export const lottieTile = deepFreeze<TileTemplate>({
  name: 'tile.exchange.effect.lotti',
  type: TileType.AnimationTile, // .ImageTile,
  scope: EntityScope.GlobalScope,
  isDeleted: false,
  metadata: {
    image: { s3Key: null },
    animation: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: '',
      loop: true,
    },
    containerStyle: {
      width: 60,
      height: 60,
      left: 23,
      top: 22,
      zIndex: 60,
    },
  },
})

// WIP Going to replace with a lottie
// export const rockPaperScissorsAnimationEffect = misc.deepFreeze<TileTemplate>({
//   name: 'animation.engine.rockPaperScissors',
//   type: TileType.AnimationTile,
//   scope: EntityScope.GlobalScope,
//   metadata: {
//     animationSequence: {
//       animations: [
//         {
//           animationType: AnimationType.SpriteAnimation,
//           sprite: { s3Key: assets.bow_tie_412.s3Key },
//           duration: 200,
//         },
//         {
//           animationType: AnimationType.SpriteAnimation,
//           sprite: { s3Key: assets.monocle_410.s3Key },
//           duration: 200,
//         },
//         {
//           animationType: AnimationType.SpriteAnimation,
//           sprite: { s3Key: assets.whip_413.s3Key },
//           duration: 200,
//         },
//       ],
//     },
//     containerStyle: {
//       backgroundColor: 'transparent',
//       top: 33,
//       left: 33,
//       height: 33,
//       width: 33,
//       zIndex: 50,
//     },
//   },
// })
