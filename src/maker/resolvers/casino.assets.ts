/**
 * @rob4lderman
 * jan2020
 *  
 */

import {
  TileTemplate,
  FieldTemplate,
  EffectTemplate,
  ActionStubSetMap,
  NumberFieldMetadata,
  StringFieldMetadata,
  AnimationEffectMetadata,
} from '../types'
import {
  sf,
  misc,
} from '../../utils'
import _ from 'lodash'
import {
  AnimationType,
  FieldType,
  TileType,
  EntityScope,
  EffectType,
} from '../../gql-types'

//
// 3-CARD MONTE Fields
//

export const betAmountFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'betAmount',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: 5,
  },
})

export const currentStateFieldTemplate = misc.deepFreeze<FieldTemplate<StringFieldMetadata>>({
  type: FieldType.StringField,
  name: 'currentState',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    stringValue: 'state.casino.start',
  },
})

export const numRoundsSinceLastBonusFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'numRoundsSinceLastBonus',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: 0,
  },
})

//
// HI-LO TILES
// 

export const tableTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.casino.table',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    // no image, just a backgroundColor
    containerStyle: {
      bottom: 5,
      left: 10,
      height: 60,
      width: 80,
      zIndex: 5,
      backgroundColor: '#000000dd',
      borderColor: 'red',
      borderWidth: 2,
      borderRadius: 8,
    },
  },
})

export const aboveTableTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.casino.abovetable',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    // no image, just a placeholder for animations.
    containerStyle: {
      bottom: 5,
      left: 10,
      height: 60,
      width: 80,
      zIndex: 15,
    },
  },
})

export const dealerCardTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.casino.dealerCard',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    // image set dynamically.
    containerStyle: {
      bottom: 15,
      left: 15,
      height: 40,
      width: 40,
      zIndex: 10,
      borderColor: 'red',
      borderWidth: 0,
    },
  },
})

export const playerCardTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.casino.playerCard',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    // image set dynamically.
    containerStyle: {
      bottom: 15,
      left: null,
      right: 15,
      height: 40,
      width: 40,
      zIndex: 10,
      borderColor: 'red',
      borderWidth: 0,
    },
  },
})

export const animGreenCheckEffectTemplate = misc.deepFreeze<EffectTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationType: AnimationType.SourcedAnimation,
    sourceUri: 'https://assets10.lottiefiles.com/packages/lf20_n9uJIY.json',
  },
})

//
// HI-LO Fields
//

export const dealerCardFieldTemplate: FieldTemplate<StringFieldMetadata> = {
  type: FieldType.StringField,
  name: 'dealerCard',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    stringValue: 'two.spades',
  },
}

//
// Lenses (FP for attribute getter/setter access)
//

export const numberValueLens = sf.lens<number>('metadata.numberValue')
export const stringValueLens = sf.lens<string>('metadata.stringValue')
export const imageS3KeyLens = sf.lens<string>('metadata.image.s3Key')
export const isDeletedLens = sf.lens<boolean>('isDeleted')

//
// Card Deck (static data)
//

export interface Card {
  s3Key: string
  name: string
  rank: number
}

export interface CardDeck {
  [key: string]: Card
}

export const cardDeckArray: Card[] = [
  // spades
  {
    name: 'ace.spades',
    s3Key: 'tile/card.ace.spades.png',
    rank: 14,
  },
  {
    name: 'king.spades',
    s3Key: 'tile/card.king.spades.png',
    rank: 13,
  },
  {
    name: 'queen.spades',
    s3Key: 'tile/card.queen.spades.png',
    rank: 12,
  },
  {
    name: 'jack.spades',
    s3Key: 'tile/card.jack.spades.png',
    rank: 11,
  },
  {
    name: 'ten.spades',
    s3Key: 'tile/card.ten.spades.png',
    rank: 10,
  },
  {
    name: 'nine.spades',
    s3Key: 'tile/card.nine.spades.png',
    rank: 9,
  },
  {
    name: 'eight.spades',
    s3Key: 'tile/card.eight.spades.png',
    rank: 8,
  },
  {
    name: 'seven.spades',
    s3Key: 'tile/card.seven.spades.png',
    rank: 7,
  },
  {
    name: 'six.spades',
    s3Key: 'tile/card.six.spades.png',
    rank: 6,
  },
  {
    name: 'five.spades',
    s3Key: 'tile/card.five.spades.png',
    rank: 5,
  },
  {
    name: 'four.spades',
    s3Key: 'tile/card.four.spades.png',
    rank: 4,
  },
  {
    name: 'three.spades',
    s3Key: 'tile/card.three.spades.png',
    rank: 3,
  },
  {
    name: 'two.spades',
    s3Key: 'tile/card.two.spades.png',
    rank: 2,
  },

  // hearts
  {
    name: 'ace.hearts',
    s3Key: 'tile/card.ace.spades.png',
    rank: 14,
  },
  {
    name: 'king.hearts',
    s3Key: 'tile/card.king.spades.png',
    rank: 13,
  },
  {
    name: 'queen.hearts',
    s3Key: 'tile/card.queen.spades.png',
    rank: 12,
  },
  {
    name: 'jack.hearts',
    s3Key: 'tile/card.jack.spades.png',
    rank: 11,
  },
  {
    name: 'ten.hearts',
    s3Key: 'tile/card.ten.spades.png',
    rank: 10,
  },
  {
    name: 'nine.hearts',
    s3Key: 'tile/card.nine.spades.png',
    rank: 9,
  },
  {
    name: 'eight.hearts',
    s3Key: 'tile/card.eight.spades.png',
    rank: 8,
  },
  {
    name: 'seven.hearts',
    s3Key: 'tile/card.seven.spades.png',
    rank: 7,
  },
  {
    name: 'six.hearts',
    s3Key: 'tile/card.six.spades.png',
    rank: 6,
  },
  {
    name: 'five.hearts',
    s3Key: 'tile/card.five.spades.png',
    rank: 5,
  },
  {
    name: 'four.hearts',
    s3Key: 'tile/card.four.spades.png',
    rank: 4,
  },
  {
    name: 'three.hearts',
    s3Key: 'tile/card.three.spades.png',
    rank: 3,
  },
  {
    name: 'two.hearts',
    s3Key: 'tile/card.two.spades.png',
    rank: 2,
  },
]

export const cardDeck: CardDeck = _.keyBy(cardDeckArray, 'name')

export const faceDownCard: Card = {
  name: 'facedown',
  s3Key: 'tile/card.back.red.png',
  rank: 0,
}

//
// 3-CARD-MONTE static data
//
export const threeCardMonteCards = {
  leftcard: {
    text: 'left card',
    positionalText: 'first card',
  },
  centercard: {
    text: 'middle card',
    positionalText: 'second card',
  },
  rightcard: {
    text: 'right card',
    positionalText: 'third card',
  },
  bonusleftcard: {
    text: 'bonus left card',
    positionalText: 'fourth card',
  },
  bonusrightcard: {
    text: 'bonus right card',
    positionalText: 'fifth card',
  },
}

/** 
 * Mapping from state => action set
 */
export const stateActionGroups = {
  'state.casino.start': [
    'action.casino.bet5',
    'action.casino.bet10',
    'action.casino.bet20',
  ],
  'state.casino.hilo.hilo': [
    'action.casino.hilo.higher',
    'action.casino.hilo.lower',
  ],
}

/** 
 * Mapping from state => action set
 */
export const stateActionStubSets: ActionStubSetMap = {
  'state.casino.start': {
    staticActionNames: [
      'action.casino.bet5',
      'action.casino.bet10',
      'action.casino.bet20',
    ],
    actionInstanceNames: [],
  },
  'state.casino.hilo.hilo': {
    staticActionNames: [
      'action.casino.hilo.higher',
      'action.casino.hilo.lower',
    ],
    actionInstanceNames: [],
  },
}

/** 
 * List of local actions ("local" == defined only in this chatroom).
 */
export const localActionNames = [
  'action.casino.bet5',
  'action.casino.bet10',
  'action.casino.bet20',
  'action.casino.hilo.higher',
  'action.casino.hilo.lower',
]
