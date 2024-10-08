/**
 * @rob4lderman
 * jan2020
 *  
 */

import {
  TileTemplate,
  FieldTemplate,
  EffectTemplate,
  NumberFieldMetadata,
  JsonObjectFieldMetadata,
} from '../types'
import {
  sf,
  misc,
} from '../../utils'
import {
  AnimationType,
  FieldType,
  TileType,
  EntityScope,
  EffectType,
  SequenceEffectMetadata,
} from '../../gql-types'

export enum ChatRoomStates {
  Start,
  Grow,
  Harvest,
  Spoil,
  Pick,
  Instructions
}

export const currentStateFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'currentState',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: ChatRoomStates.Instructions,
  },
})

// EPOCH timestamp
export const plantedTimeFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'plantedTimestamp',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: 0, // set dynamically
  },
})

// EPOCH timestamp
export const harvestTimeFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'harvestTimestamp',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: 0, // set dynamically
  },
})

// EPOCH timestamp
export const spoiledTimeFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'spoilTimestamp',
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

export const harvestedSequenceEffectTemplate = misc.deepFreeze<EffectTemplate<SequenceEffectMetadata>>({
  type: EffectType.SequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    sequenceEffectItems: [
      {
        type: EffectType.SystemMessageEffect,
        waitForTap: true,
        isDeletedOnFinish: true,
        metadata: {
          text: 'You have harvested your crops and they have been added to your inventory.\n\nTap to Continue',
        },
      },
      {
        type: EffectType.SystemMessageEffect,
        waitForTap: false,
        isDeletedOnFinish: true,
        metadata: {
          text: 'You can plant more seeds now',
        },
      },
    ],
  },
})

export const spoilSequenceEffectTemplate = misc.deepFreeze<EffectTemplate<SequenceEffectMetadata>>({
  type: EffectType.SequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    sequenceEffectItems: [
      {
        type: EffectType.SystemMessageEffect,
        waitForTap: false,
        isDeletedOnFinish: true,
        metadata: {
          text: 'Your crops have spoiled. Crops typically spoil about 10 minutes after they bloom.\n\nTap to Try Again',
        },
      },
      {
        type: EffectType.AnimationEffect,
        waitForTap: false,
        isDeletedOnFinish: true,
        metadata: {
          animationType: AnimationType.SourcedAnimation,
          sourceUri: 'https://assets8.lottiefiles.com/datafiles/tawau8o8xa7TTxx/data.json',
          // duration: 1000,
        },
      },
    ],
  },
})

export const bloomTextTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.npc.strawberrypatch.bloom.text',
  type: TileType.TextTile,
  scope: EntityScope.ChatRoomPrivateScope,
  metadata: {
    // image: {
    //     s3Key: 'tile/ace.spades.png',
    // },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 60,
      left: 40,
      height: 20,
      width: 20,
      zIndex: 3,
      borderColor: 'blue',
      borderWidth: 2,
    },
    text: 'HI!',
    textStyle: {
      color: 'blue',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  },
})

export const bloomImageTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.npc.strawberrypatch.bloom.imagetile',
  type: TileType.ImageTile,
  scope: EntityScope.ChatRoomPrivateScope,
  metadata: {
    // image: {
    //     s3Key: 'tile/ace.spades.png',
    // },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 10,
      left: 40,
      height: 20,
      width: 20,
      zIndex: 3,
      borderColor: 'green',
      borderWidth: 2,
    },
    // text: "HI!",
    textStyle: {
      color: 'green',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  },
})

//
// Lenses (FP for attribute getter/setter access)
//

export const jsonValueLens = sf.lens<object>('metadata.json')
export const numberValueLens = sf.lens<number>('metadata.numberValue')
export const textValueLens = sf.lens<string>('metadata.text')
export const isDeletedLens = sf.lens<boolean>('isDeleted')
// export const stringValueLens = sf.lens('metadata.stringValue');
