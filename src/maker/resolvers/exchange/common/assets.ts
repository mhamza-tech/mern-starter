import { misc, sf } from 'src/utils'
import { TileTemplate, EffectTemplate, FieldTemplate, StringFieldMetadata, CountdownFieldMetadata } from 'src/maker/types'
import { TileType, EntityScope, SequenceEffectMetadata, EffectType, AnimationType, AnimationEffectMetadata, FieldType, CountdownFieldStyle, ProgressField } from 'src/gql-types'
import { ReactNativeAnimations } from 'src/maker/animations/react-native-animations'
import { Actions } from './types'
import { defaultsDeep } from 'src/utils/misc'
import { assets } from 'src/domain/assets'

export const stringValueLens = sf.lens('metadata.stringValue')

export const itemFieldTemplate = misc.deepFreeze<FieldTemplate<StringFieldMetadata>>({
  type: FieldType.StringField,
  name: 'itemName',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    stringValue: '',
  },
})

export const dropTile = misc.deepFreeze<TileTemplate>({
  name: '', //tile.angry_toilet_330.droptile',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    dropTarget : true,
  },
})

export const barSessionStateTile = misc.deepFreeze<TileTemplate>({
  name: 'tile.unicorn.lounge.session.status',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: assets.open_sign_750.s3Key,
    },
    containerStyle: {
      width: 20,
      height: 20,
      left: 40,
      top: 95,
      zIndex: 60,
    },
  },
})

export const TILE_NAME_UNOBJECT = 'layers.avatar'

export const addToRoom = misc.deepFreeze<AnimationEffectMetadata>({
  animationType: AnimationType.NativeAnimatableAnimation,
  animation: ReactNativeAnimations.Tada,
  duration: 2000,
})

export const addToRoomZoomInDown = misc.deepFreeze<AnimationEffectMetadata>({
  animationType: AnimationType.NativeAnimatableAnimation,
  animation: ReactNativeAnimations.ZoomInDown,
  duration: 2000,
})

export const dropAnimation = misc.deepFreeze<AnimationEffectMetadata>({
  animationType: AnimationType.NativeAnimatableAnimation,
  animation: ReactNativeAnimations.SlideOutDown,
  duration: 1000,
})

export const celebrationEffectTemplate = misc.deepFreeze<EffectTemplate<SequenceEffectMetadata>>({
  type: EffectType.SequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    sequenceEffectItems: [
      {
        type: EffectType.TileEffect,
        waitForTap: false,
        isDeletedOnFinish: true,
        metadata: {
          animation: {
            animationType: AnimationType.SourcedAnimation,
            sourceUri: '',
          },
          name: 'tile.exchange.win.effect.lotti',
          containerStyle: {
            width: 60,
            height: 60,
            left: 23,
            top: 22,
            zIndex: 60,
          },
        },
      },
      {
        type: EffectType.ActionEffect,
        actionCallback: {
          actionName: Actions.MessageOnOffered,
        },
      },
    ],
  },
})

export const prizeEffectTemplate = misc.deepFreeze<EffectTemplate<SequenceEffectMetadata>>({
  type: EffectType.SequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    sequenceEffectItems: [
      {
        type: EffectType.TileEffect,
        metadata: {
          name: 'tile.exchange.exchanged.item',
          animation: addToRoom,
          image: { s3Key: null },
          containerStyle: {
            width: 33,
            height: 33,
            left: 33,
            top: 33,
            zIndex: 60,
          },
        },
      },
      {
        type: EffectType.TileEffect,
        waitForTap: false,
        isDeletedOnFinish: true,
        metadata: {
          name: 'tile.exchange.exchanged.item',
          animation: dropAnimation,
          image: { s3Key: null },
          containerStyle: {
            width: 33,
            height: 33,
            left: 33,
            top: 33,
            zIndex: 60,
          },
        },
      },
      {
        type: EffectType.ActionEffect,
        actionCallback: {
          actionName: Actions.PrizeReady,
        },
      },
    ],
  },
})

export const countdownField = misc.deepFreeze<FieldTemplate<CountdownFieldMetadata>>({
  type: FieldType.CountdownField,
  scope: EntityScope.GlobalScope,
  name: 'countdown',
  metadata: {
    style: CountdownFieldStyle.Stopwatch,
    expiryDateTime: null,
  },
})

export const slotTile = misc.deepFreeze<TileTemplate>({
  name: 'tile.exchange.slot',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: { s3Key: undefined },
    containerStyle: {
      width: 20,
      height: 20,
      top: 44,
      zIndex: 1,
      left: undefined,
    },
  },
})

export const inputTile = misc.deepFreeze(defaultsDeep({
  metadata: {
    image: { s3Key: undefined },
    animation: addToRoom,
    containerStyle: { zIndex: 2 },
  },
}, slotTile))

export const progressBarField = misc.deepFreeze<FieldTemplate<ProgressField>>({
  type: FieldType.ProgressField,
  scope: EntityScope.GlobalScope,
  name: 'progress',
  metadata: {
    minValue: 0,
    color: null,
    maxValue: null,
    numberValue: null,
  },
})
