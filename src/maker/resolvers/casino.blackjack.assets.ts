/**
 * @rob4lderman
 * feb2020
 *  
 */

import {
  TileTemplate,
  FieldTemplate,
  EffectTemplate,
  ActionStubSetMap,
  JsonObjectFieldMetadata,
  AnimationEffectMetadata,
} from '../types'
import {
  misc,
  sf,
} from '../../utils'
import {
  TileType,
  EntityScope,
  FieldType,
  AnimationType,
  EffectType,
} from '../../gql-types'
import { ReactNativeAnimations } from 'src/maker/animations'
import { Card } from './casino.assets'

export const dealerCardTileBottomOffset = 36
export const actorCardTileBottomOffset = 0
export const cardTileHeight = 32

export interface PlayerHand {
  cards: Card[]
  score: number
  playerHandType: PlayerHandType
}

export interface GameState {
  actorHand: PlayerHand
  dealerHand: PlayerHand
}

export enum PlayerHandType {
  ActorHand,
  DealerHand
}

export const actorHandFieldTemplate = misc.deepFreeze<FieldTemplate<JsonObjectFieldMetadata>>({
  type: FieldType.JsonObjectField,
  name: 'field.casino.blackjack.playerHand',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    cards: [],
    score: 0,
    playerHandType: PlayerHandType.ActorHand,
  },
})

export const dealerHandFieldTemplate = misc.deepFreeze<FieldTemplate<JsonObjectFieldMetadata>>({
  type: FieldType.JsonObjectField,
  name: 'field.casino.blackjack.dealerHand',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    cards: [],
    score: 0,
    playerHandType: PlayerHandType.DealerHand,
  },
})

export const metadataLens = sf.lens<any>('metadata')
export const metadataImageS3KeyLens = sf.lens<string>('metadata.image.s3Key')
export const nameLens = sf.lens<string>('name')
export const metadataContainerStyleLeftLens = sf.lens('metadata.containerStyle.left')
export const metadataContainerStyleRightLens = sf.lens('metadata.containerStyle.right')
export const metadataContainerStyleBottomLens = sf.lens('metadata.containerStyle.bottom')
export const metadataContainerStyleTopLens = sf.lens('metadata.containerStyle.top')
export const metadataContainerStyleZIndexLens = sf.lens('metadata.containerStyle.zIndex')

export const actorCardTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.casino.blackjack.playercard',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    // image set dynamically.
    containerStyle: {
      bottom: 0,
      left: 15,
      height: cardTileHeight,
      width: cardTileHeight,
      zIndex: 10,
      borderColor: 'red',
      borderWidth: 0,
    },
  },
})

export const actorCardAnimatingTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.casino.blackjack.playercard.animating',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FlipInY,
          duration: 50,
        },
      ],
    },
    containerStyle: {
      bottom: actorCardTileBottomOffset,
      left: 15,
      height: cardTileHeight,
      width: cardTileHeight,
      zIndex: 10,
      borderColor: 'red',
      borderWidth: 0,
    },
  },
})
export const dealerCardTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.casino.blackjack.dealercard',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    // image set dynamically.
    containerStyle: {
      bottom: dealerCardTileBottomOffset,
      left: 15,
      height: cardTileHeight,
      width: cardTileHeight,
      zIndex: 10,
      borderColor: 'red',
      borderWidth: 0,
    },
  },
})

export const dealerCardAnimatingTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.casino.blackjack.dealercard.animating',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FlipInY,
          duration: 50,
        },
      ],
    },
    containerStyle: {
      bottom: dealerCardTileBottomOffset,
      left: 15,
      height: cardTileHeight,
      width: cardTileHeight,
      zIndex: 10,
      borderColor: 'red',
      borderWidth: 0,
    },
  },
})

// TODO: export const greenCheckAnimatingTileTemplate = misc.deepFreeze<TileTemplate>({
// TODO:     name: 'tile.casino.blackjack.winner.animating',
// TODO:     type: TileType.AnimationTile,
// TODO:     scope: EntityScope.GlobalScope,
// TODO:     metadata: {
// TODO:         animation: {
// TODO:             animationType: AnimationType.SourcedAnimation,
// TODO:             sourceUri: 'https://assets10.lottiefiles.com/packages/lf20_n9uJIY.json',
// TODO:         },
// TODO:         containerStyle: {
// TODO:             zIndex: 50000,
// TODO:             borderColor: 'red',
// TODO:             borderWidth: 0,
// TODO:             bottom: 5,
// TODO:             left: 10,
// TODO:             height: 60,
// TODO:             width: 80,
// TODO:         },
// TODO:     }
// TODO: });

export const greenCheckEffectTemplate = misc.deepFreeze<EffectTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationType: AnimationType.SourcedAnimation,
    sourceUri: 'https://assets10.lottiefiles.com/packages/lf20_n9uJIY.json',
  },
})

export const aboveTableTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.casino.blackjack.abovetable',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    // no image, just a placeholder for animations.
    containerStyle: {
      zIndex: 50000,
      bottom: 5,
      left: 10,
      height: 60,
      width: 80,
    },
  },
})

/** 
 * Mapping from state => action set
 */
export const stateActionGroups = {
  'state.casino.blackjack.deal.player': [
    'action.casino.blackjack.hit',
    'action.casino.blackjack.stay',
    'action.casino.blackjack.doubledown',
  ],
  'state.casino.blackjack.deal.dealer': [
  ],
  'state.casino.start': [
    'action.casino.bet5',
    'action.casino.bet10',
    'action.casino.bet20',
    // 'Action.Debug.Reset',
  ],
}

/** 
 * Mapping from state => action set
 */
export const stateActionStubSets: ActionStubSetMap = {
  'state.casino.blackjack.deal.player': {
    staticActionNames: [
      'action.casino.blackjack.hit',
      'action.casino.blackjack.stay',
      'action.casino.blackjack.doubledown',
    ],
    actionInstanceNames: [],
  },
  'state.casino.blackjack.deal.dealer': {
    staticActionNames: [],
    actionInstanceNames: [],
  },
  'state.casino.start': {
    staticActionNames: [
      'action.casino.bet5',
      'action.casino.bet10',
      'action.casino.bet20',
      // 'Action.Debug.Reset',
    ],
    actionInstanceNames: [],
  },
}

/** 
 * List of local actions ("local" == defined only in this chatroom).
 * You will, at a minimum, need to call contextApi.getActor().readOrCreateLocalActionEdges(localActionNames)
 * AT LEAST ONCE FOR EACH USER, in order to make the local actions available to them.
 */
export const localActionNames = [
  'action.casino.blackjack.hit',
  'action.casino.blackjack.stay',
  'action.casino.blackjack.doubledown',
  'action.casino.bet5',
  'action.casino.bet10',
  'action.casino.bet20',
]
