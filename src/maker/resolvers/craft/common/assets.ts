import { FieldType, EntityScope, TileType, CountdownFieldStyle } from 'src/gql-types'
import { misc } from 'src/utils'
import { FieldTemplate, TileTemplate, CountdownFieldMetadata, ButtonFieldMetadata, ButtonFieldNames, JsonObjectFieldMetadata } from 'src/maker/types'
import { animation as addToRoom } from '../../../fx/animation.addToRoom'
import { Actions } from './types'

export const gameStateField = misc.deepFreeze<FieldTemplate<JsonObjectFieldMetadata>>({
  type: FieldType.JsonObjectField,
  name: 'gameState',
  scope: EntityScope.GlobalScope,
  metadata: { version: 1.0, state: {} },
})

export const countdownField = misc.deepFreeze<FieldTemplate<CountdownFieldMetadata>>({
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

export const SLOT_PADDING = 1
export const SLOT_MARGIN = 1

export const slotTile = misc.deepFreeze<TileTemplate>({
  name: 'tile.craft.slot',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: { s3Key: undefined },
    containerStyle: {
      width: 20,
      height: 20,
      top: 63.58,
      zIndex: 1,
      left: undefined,
    },
  },
})

export const inputTile = misc.deepFreeze(misc.defaultsDeep({
  metadata: {
    image: { s3Key: undefined },
    animation: addToRoom,
    containerStyle: { zIndex: 2 },
  },
}, slotTile))

export const cancelField = misc.deepFreeze<FieldTemplate<ButtonFieldMetadata>>({
  type: FieldType.ButtonField,
  scope: EntityScope.GlobalScope,
  name: ButtonFieldNames.Reset,
  metadata: { actionName: Actions.Cancel, isDisabled: false },
})
