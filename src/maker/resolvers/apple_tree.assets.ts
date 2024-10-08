import {
  TileTemplate,
  FieldTemplate,
  EffectTemplate,
  NewsfeedItemTemplate,
  NumberFieldMetadata,
  JsonObjectFieldMetadata,
  TileMetadata,
  SequenceEffectItemTemplate,
} from '../types'
import {
  sf,
  misc,
} from '../../utils'
import {
  FieldType,
  TileType,
  EntityScope,
  EffectType,
  Image,
  AnimationType,
  SequenceEffectMetadata,
  DynamicFeedItemLayout,
} from 'src/gql-types'
import {
  imageS3Key,
  lotties,
} from '../helpers'
import { ReactNativeAnimations } from 'src/maker/animations'

export enum ChatRoomStates {
  Start,
  PickFirst,
  PickSecond,
  PickThird,
  PickFourth,
  PickFifth,
  Empty,
  Regrow,
  Instructions,
}

export const appleNewsFeedTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  rateId: null,
  rateLimit: { days: 100 },
  fromEid: '',
  metadata: {
    statusText: null,
  },
})

export const goldenAppleTemplate = misc.deepFreeze<SequenceEffectItemTemplate<TileMetadata>>({
  type: EffectType.TileEffect,
  waitForTap: false,
  isDeletedOnFinish: true,
  metadata: {
    name: 'effect.addtoinventory.tile',
    animation: {
      animationType: AnimationType.NativeAnimatableAnimation,
      animation: ReactNativeAnimations.BounceInUp,
      duration: 1000,
    },
    image: {
      uri: 'http://bonnee.com.au/wp-content/uploads/2018/07/gold-package.png', // set dynamically
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 24,
      right: 5.5,
      height: 15,
      width: 15,
      zIndex: 3,
      borderColor: 'red',
      borderWidth: 0,
    },
  },
})

export const bounceInEffectTemplate = misc.deepFreeze({
  type: EffectType.AnimationEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationType: AnimationType.NativeAnimatableAnimation,
    animation: ReactNativeAnimations.BounceInDown,
    duration: 1000,
  },
})

export const appleConfettiTemplate = misc.deepFreeze({
  type: EffectType.AnimationEffect,
  scope: EntityScope.ChatRoomScope,
  metadata: {
    animationType: AnimationType.SourcedAnimation,
    sourceUri: lotties.confetti_ribbons,
    startFrame: 1,
    endFrame: 50,
    loop: false,
  },
})

export const animalAppleTemplate = misc.deepFreeze({
  name: 'tile.apple.animal',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      uri: 'http://stmarkhamilton.org/wp-content/uploads/2015/06/OR-platypus.png',
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 30,
      right: 10,
      height: 30,
      width: 30,
      zIndex: 5,
    },
  },
})

export const appleTileTemplateFive = misc.deepFreeze<TileTemplate>({
  name: 'tile.apple.tree.five',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: imageS3Key.Apple,
    },
    containerStyle: {
      backgroundColor: 'transparent',
      bottom: 30,
      right: 40,
      height: 12,
      width: 12,
      zIndex: 5,
      borderWidth: 0,
      borderColor: 'red',
    },
  },
})

export const appleTileTemplateFour = misc.deepFreeze<TileTemplate>({
  name: 'tile.apple.tree.four',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: imageS3Key.Apple,
      // uri: 'http://images.clipartpanda.com/green-apple-clipart-October-Apples-Clip-Art-4.png'
    },
    containerStyle: {
      backgroundColor: 'transparent',
      bottom: 55,
      right: 50,
      height: 13,
      width: 13,
      zIndex: 5,
      borderWidth: 0,
      borderColor: 'red',
    },
  },
})

export const appleTileTemplateThree = misc.deepFreeze<TileTemplate>(
  {
    name: 'tile.apple.tree.three',
    type: TileType.ImageTile,
    scope: EntityScope.GlobalScope,
    metadata: {
      image: {
        // s3Key: imageS3Key.Apple,
        uri: 'http://www.clker.com/cliparts/G/C/x/7/z/V/yellow-apple-md.png',
      },
      containerStyle: {
        backgroundColor: 'transparent',
        bottom: 35,
        right: 55,
        height: 14,
        width: 14,
        zIndex: 5,
        borderWidth: 0,
        borderColor: 'red',
      },
    },
  })

export const appleTileTemplateTwo = misc.deepFreeze<TileTemplate>(
  {
    name: 'tile.apple.tree.two',
    type: TileType.ImageTile,
    scope: EntityScope.GlobalScope,
    metadata: {
      image: {
        // s3Key: imageS3Key.Apple,
        uri:
          'http://images.clipartpanda.com/green-apple-clipart-October-Apples-Clip-Art-4.png',
      },
      containerStyle: {
        backgroundColor: 'transparent',
        bottom: 50,
        right: 20,
        height: 15,
        width: 15,
        zIndex: 5,
        borderWidth: 0,
        borderColor: 'red',
      },
    },
  }
)

export const appleTileTemplateOne = misc.deepFreeze<TileTemplate>(
  {
    name: 'tile.apple.tree.one',
    type: TileType.ImageTile,
    scope: EntityScope.GlobalScope,
    metadata: {
      image: {
        // s3Key: imageS3Key.Apple,
        uri:
          'http://images.clipartpanda.com/green-apple-clipart-October-Apples-Clip-Art-4.png',
      },
      containerStyle: {
        backgroundColor: 'transparent',
        bottom: 50,
        right: 60,
        height: 12,
        width: 12,
        zIndex: 5,
        borderWidth: 0,
        borderColor: 'red',
      },
    },
  }
)

export const currentStateFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'currentState',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: ChatRoomStates.Instructions,
  },
})

// EPOCH timestamp
export const pickedTimeFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'pickedTimestamp',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: 0, // set dynamically
  },
})

// EPOCH timestamp
export const regrowTimeFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'regrowTimestamp',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: 0, // set dynamically
  },
})

// interval timer timeout object
export const intervalTimerIdFieldTemplate = misc.deepFreeze<FieldTemplate<JsonObjectFieldMetadata>>({
  type: FieldType.JsonObjectField,
  name: 'intervalTimerReference',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    json: {}, // set dynamically
  },
})

export const pickedSequenceEffectTemplate = misc.deepFreeze<EffectTemplate<SequenceEffectMetadata>>({
  type: EffectType.SequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    sequenceEffectItems: [
      {
        type: EffectType.SystemMessageEffect,
        waitForTap: true,
        isDeletedOnFinish: true,
        metadata: {
          text:
            'You have picked all the apples and they have been added to your inventory.\n\nTap to Continue',
        },
      },
      {
        type: EffectType.SystemMessageEffect,
        waitForTap: false,
        isDeletedOnFinish: true,
        metadata: {
          text: 'You must wait 4 hours for the apples to regrow',
        },
      },
    ],
  },
})

//
// Lenses (FP for attribute getter/setter access)
//

export const jsonValueLens = sf.lens<object>('metadata.json')
export const numberValueLens = sf.lens<number>('metadata.numberValue')
export const textValueLens = sf.lens<string>('metadata.text')
export const isDeletedLens = sf.lens<boolean>('isDeleted')
export const metadataImageLens = sf.lens<Image>('metadata.image')
// export const stringValueLens = sf.lens('metadata.stringValue');
