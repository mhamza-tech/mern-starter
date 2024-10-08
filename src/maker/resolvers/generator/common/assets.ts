import { AnimationType, CountdownFieldStyle, EntityScope, FieldType, TileType, NativeAnimations } from 'src/gql-types'
import { CountdownFieldMetadata, FieldTemplate, TileTemplate } from 'src/maker/types'
import { deepFreeze } from 'src/utils/misc'

export const countdownField = deepFreeze<FieldTemplate<CountdownFieldMetadata>>({
  type: FieldType.CountdownField,
  scope: EntityScope.GlobalScope,
  name: 'countdown',
  metadata: {
    text: null,
    style: CountdownFieldStyle.Ticker,
    image: { s3Key: null },
    expiryDateTime: null,
  },
})

export const itemTileTemplate = deepFreeze<TileTemplate>({
  name: 'tile.generator.item',
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
