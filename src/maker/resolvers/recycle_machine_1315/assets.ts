import { TileType, EntityScope, SequenceEffectMetadata, EffectType, AnimationType, AnimationEffectMetadata, FieldType, TileEffect } from '../../../gql-types'
import { misc, sf } from '../../../utils'
import { TileTemplate, EffectTemplate, FieldTemplate, StringFieldMetadata, ConcurrentEffectMetadata, TileMetadata, JsonObjectFieldMetadata } from '../../types'
import { ReactNativeAnimations } from 'src/maker/animations'
import { Actions, ReelSymbolData } from './types'
import { cloneDeep } from 'src/utils/misc'
import { LottieLibrary } from 'src/maker/assets'
import _ from 'lodash'

//
// Lenses (FP for attribute getter/setter access)
//

export const jsonValueLens = sf.lens<object>('metadata.json')

export const itemFieldTemplate = misc.deepFreeze<FieldTemplate<StringFieldMetadata>>({
  type: FieldType.StringField,
  name: 'itemName',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    stringValue: '',
  },
})

const dropAnimation = misc.deepFreeze<AnimationEffectMetadata>({
  animationType: AnimationType.NativeAnimatableAnimation,
  animation: ReactNativeAnimations.SlideOutDown,
  duration: 1000,
  delay: 500,
})

export const addToRoom = misc.deepFreeze<AnimationEffectMetadata>({
  animationType: AnimationType.NativeAnimatableAnimation,
  animation: ReactNativeAnimations.ZoomIn,
  duration: 500,
})

const winSequenceEffectTemplate = misc.deepFreeze<EffectTemplate<SequenceEffectMetadata>>({
  type: EffectType.SequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    sequenceEffectItems: [
      {
        type: EffectType.TileEffect,
        metadata: {
          name: 'tile.recycle.given.tile',
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
          name: 'tile.recycle.given.tile',
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

export const animateWin = (imageS3Key?: string): EffectTemplate<SequenceEffectMetadata> => {
  const sequence = cloneDeep(winSequenceEffectTemplate)
  const addMetadata = sequence!.metadata!.sequenceEffectItems![0]!.metadata as TileMetadata
  addMetadata!.image!.s3Key = imageS3Key
  const fallMetadata = sequence!.metadata!.sequenceEffectItems![1]!.metadata as TileMetadata
  fallMetadata!.image!.s3Key = imageS3Key
  return sequence
}

export const animateSpin = (reelData: ReelSymbolData[]): EffectTemplate<ConcurrentEffectMetadata> => {
  const root = cloneDeep(spinReelsAnimation)
  let effectIndex = 0
  //( errorcheck to do, make sure incoming config is 9 long)
  for(const symbolData of reelData) {
    const effect = root.metadata!.groups![0]!.effects![effectIndex++]
    const metadata = effect!.metadata as TileMetadata
    metadata!.image!.s3Key = symbolData.s3Key
    metadata!.containerStyle = cloneDeep(symbolData.containerConfig)
  }

  return root
}

// JMR: This reuses the normal spin Effect template but removes stuff we don't want
// by cloning the original first.
export const initialReels = (reelData: ReelSymbolData[]): EffectTemplate<ConcurrentEffectMetadata> => {
  const root = cloneDeep(spinReelsAnimation)
  // kill all groups except first
  const groups = root.metadata!.groups
  groups!.length = 1
  // kill all effects except items (first 9)
  const effects = groups![0]!.effects
  effects!.length = 9
  // todo, set the duration / delay to 0 for items in initial reels

  let effectIndex = 0
  //( errorcheck to do, make sure incoming config is 9 long)
  for(const symbolData of reelData) {
    const effect = groups![0]!.effects![effectIndex++]
    const metadata = effect!.metadata as TileMetadata
    metadata!.image!.s3Key = symbolData.s3Key
    metadata!.containerStyle = cloneDeep(symbolData.containerConfig)
    metadata!.animation!.delay = 0
    metadata!.animation!.duration = 0
  }

  return root
}

export const dropTile = misc.deepFreeze<TileTemplate>({
  name: 'tile.recycle.droptile',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    dropTarget : true,
    containerStyle: {
      backgroundColor: 'transparent',
      width: 15,
      height: 15,
      left: 58,
      top: 34,
      zIndex: 50,
    },
  },
})

const reelItem = {
  type: EffectType.TileEffect,
  metadata: {
    name: 'tile.recycle.reel.item0',
    image: {
      s3Key: null,
    },
    animation: {
      animationType: AnimationType.NativeAnimatableAnimation,
      animation: 'fadeIn',
      delay: 500,
    },
    containerStyle: {
      width: 0,
      height: 0,
      left: 0,
      top: 0,
      zIndex: 50,
    },
  },
}

const generateReelItems = () : readonly TileEffect[] => {
  const collection = _.times(9, (i) => {
    const template = misc.cloneDeep(reelItem)
    template!.metadata!.name = `tile.recycle.reel.item${i}`
    template!.metadata!.animation!.delay = (1 + (i / 3 << 0)) * 1000
    return template
  })

  return misc.deepFreeze<TileEffect[]>(collection)
}

const reelSpinEffect = {
  type: EffectType.TileEffect,
  metadata: {
    name: 'effect.recycle.reel.spin.one',
    animation: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: LottieLibrary.reel_spin,
      loopForMs: 4000,
      delay: 0,
    },
    containerStyle: {
      width: 19,
      height: 21,
      left: 17,
      top: 60,
      zIndex: 100,
    },
  },
}

const generateReelSpinEffects = () : readonly TileEffect[] => {
  const leftPositions = [17, 40.5, 64.5]
  const collection = _.times(3, (i) => {
    const template = misc.cloneDeep(reelSpinEffect)
    template!.metadata!.name = `teffect.recycle.reel.spin${i}`
    template!.metadata!.containerStyle!.left = leftPositions[i]
    return template
  })

  return misc.deepFreeze<TileEffect[]>(collection)
}

export const spinReelsAnimation = misc.deepFreeze<EffectTemplate<ConcurrentEffectMetadata>>({
  type: EffectType.ConcurrentEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    groups: [
      {
        duration: 1800,
        effects: [
          ...generateReelItems(),
          ...generateReelSpinEffects(),
        ],
      },
      {
        duration: 0,
        effects: [         
          {
            type: EffectType.ActionEffect,
            actionCallback: {
              actionName: Actions.SpinFinished,
            },
          },
        ],
      },
    ],
  },
})

export const gameStateField = misc.deepFreeze<FieldTemplate<JsonObjectFieldMetadata>>({
  type: FieldType.JsonObjectField,
  name: 'gamestate.recycle.machine',
  scope: EntityScope.GlobalScope,
  metadata: { version: 1.2, state: {} },
})
