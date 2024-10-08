import Bluebird from 'bluebird'
import { isDeletedLens, metadataImageLens } from '../fxHelpers'
import { sf, misc } from '../../utils'
import { TileTemplate, EffectTemplate, ChatRoomActionContextApi, FieldTemplate, NumberFieldMetadata, AnimationSequenceEffectMetadata } from '../types'
import { AnimationType, EffectType, EntityScope, TileType, FieldType } from '../../gql-types'
import { textboxStyle2 } from '../imgix'
import { ReactNativeAnimations } from 'src/maker/animations'

const numberValueLens = sf.lens('metadata.numberValue')

const activeMessageBox = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'reserved.chatroom.active.message.box',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: 0,
  },
})

const messageTileTemplate0: TileTemplate = {
  name: 'reserved.tile.message.box',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    // image set dynamically.
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.SlideInUp,
          duration: 500,
        },
      ],
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: null,
      bottom: 0,
      left: 0,
      height: 20,
      width: 100,
      zIndex: 5,
      borderWidth: 0,
      borderColor: 'red',
    },
  },
}

const messageTileTemplate1: TileTemplate = {
  name: 'reserved.tile.message.box.1',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    // image set dynamically.
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.SlideInUp,
          duration: 500,
        },
      ],
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: null,
      bottom: 0,
      left: 0,
      height: 20,
      width: 100,
      zIndex: 6,
      borderWidth: 0,
      borderColor: 'blue',
    },
  },
}

const hideMessageTileAnimation = misc.deepFreeze<EffectTemplate<AnimationSequenceEffectMetadata>>({
  type: EffectType.AnimationSequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationSequence: {
      isDeletedOnFinish: true,
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.SlideOutDown,
          duration: 500,
        },
      ],
    },
  },
})

export const changeMessageBox = async (txt: string, avatarS3Key: string, avatarThumbBackgroundColor: string, contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.resolve(null)
    .then(() => contextApi.getChatRoom().field(activeMessageBox))
    // .then(sf.tap((field: Field) => log('activebox=', { field })))
    .then(numberValueLens.get)
    .then((n: number) => Bluebird.Promise
      .props({
        n,
        newValue: n == 0 ? 1 : 0,
      })
      .then(({ n, newValue }) => Promise.all([
        contextApi.getChatRoom().saveEffectOnTile(hideMessageTileAnimation, n == 0 ? messageTileTemplate0 : messageTileTemplate1),
        contextApi.getChatRoom().saveField(numberValueLens.set(newValue)(activeMessageBox)),
        contextApi.getChatRoom().saveTile(
          metadataImageLens.set({
            uri: textboxStyle2({
              avatarS3Key,
              avatarThumbBackgroundColor,
              txt,
            }),
          })(newValue == 0 ? messageTileTemplate0 : messageTileTemplate1)
        ),
      ]))
    )
}

export const remove = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return contextApi.getChatRoom().saveTiles([
    isDeletedLens.set(true)(messageTileTemplate0),
    isDeletedLens.set(true)(messageTileTemplate1),
  ])
}
