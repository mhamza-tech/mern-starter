/**
 * @rob4lderman
 * jan2020
 *  
 */

import {
  TileTemplate,
  FieldTemplate,
  EffectTemplate,
  ChatRoomActionContextApi,
  StringFieldMetadata,
  NumberFieldMetadata,
  AnimationSequenceEffectMetadata,
} from '../types'
import {
  sf,
  misc,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  AnimationType,
  FieldType,
  TileType,
  EntityScope,
  EffectType,
} from '../../gql-types'
import { Field } from '../../db/entity'
// import { imageS3Key } from '../helpers'
import { ReactNativeAnimations } from 'src/maker/animations'

const logger = LoggerFactory('HauntedHouse', 'NPC')

export const entranceTileTemplateAnimation = misc.deepFreeze<TileTemplate>({
  name: 'tile.haunted.house.room.entrance.animation',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/haunted.house.entrance.v2.png',
    },
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FadeIn,
          duration: 2000,
        },
      ],
    },
    containerStyle: {
      top: 0,
      left: 0,
      height: 100,
      width: 100,
      zIndex: 100,
      backgroundColor: 'transparent',
      borderColor: 'red',
      borderWidth: 0,
      borderRadius: 0,
      opacity: 0,
    },
  },
})

export const foyerTileTemplateAnimation = misc.deepFreeze<TileTemplate>({
  name: 'tile.haunted.house.room.foyer.animation',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/haunted.house.foyer.png',
    },
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FadeIn,
          duration: 2000,
        },
      ],
    },
    containerStyle: {
      top: 0,
      left: 0,
      height: 100,
      width: 100,
      zIndex: 100,
      backgroundColor: 'transparent',
      borderColor: 'blue',
      borderWidth: 0,
      borderRadius: 0,
      opacity: 0,
    },
  },
})

export const sideYardTileTemplateAnimation = misc.deepFreeze<TileTemplate>({
  name: 'tile.haunted.house.room.side.yard.animation',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/haunted.house.side.yard.v2.png',
    },
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FadeIn,
          duration: 2000,
        },
      ],
    },
    containerStyle: {
      top: 0,
      left: 0,
      height: 100,
      width: 100,
      zIndex: 100,
      backgroundColor: 'transparent',
      borderColor: 'red',
      borderWidth: 0,
      borderRadius: 0,
      opacity: 0,
    },
  },
})

export const backYardTileTemplateAnimation = misc.deepFreeze<TileTemplate>({
  name: 'tile.haunted.house.room.back.yard.animation',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/haunted.house.back.yard.v2.png',
    },
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FadeIn,
          duration: 2000,
        },
      ],
    },
    containerStyle: {
      top: 0,
      left: 0,
      height: 100,
      width: 100,
      zIndex: 100,
      backgroundColor: 'transparent',
      borderColor: 'red',
      borderWidth: 0,
      borderRadius: 0,
      opacity: 0,
    },
  },
})

export const kitchenTileTemplateAnimation = misc.deepFreeze<TileTemplate>({
  name: 'tile.haunted.house.room.kitchen.animation',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/haunted.house.kitchen.v2.png',
    },
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FadeIn,
          duration: 2000,
        },
      ],
    },
    containerStyle: {
      top: 0,
      left: 0,
      height: 100,
      width: 100,
      zIndex: 100,
      backgroundColor: 'transparent',
      borderColor: 'red',
      borderWidth: 0,
      borderRadius: 0,
      opacity: 0,
    },
  },
})

export const bathroomTileTemplateAnimation = misc.deepFreeze<TileTemplate>({
  name: 'tile.haunted.house.room.bathroom.animation',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/haunted.house.bathroom.png',
    },
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FadeIn,
          duration: 2000,
        },
      ],
    },
    containerStyle: {
      top: 0,
      left: 0,
      height: 100,
      width: 100,
      zIndex: 100,
      backgroundColor: 'transparent',
      borderColor: 'red',
      borderWidth: 0,
      borderRadius: 0,
      opacity: 0,
    },
  },
})

export const monsterTileTemplateAnimation = misc.deepFreeze<TileTemplate>({
  name: 'tile.haunted.house.monster2',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/monster.png',
    },
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.ZoomInUp,
          duration: 1000,
        },
      ],
    },
    containerStyle: {
      bottom: 0,
      right: 10,
      height: 80,
      width: 80,
      zIndex: 1000,
      backgroundColor: 'transparent',
      borderColor: 'red',
      borderWidth: 0,
      borderRadius: 0,
      opacity: 0,
    },
  },
})

export interface Room {
  description: string
  tile: TileTemplate
}

export interface Position {
  x: number
  y: number
}

export const navigate = (direction: string, currentPosition: Position): Position => {
  switch (direction) {
    case 'n':
      console.log('> GO NORTH')
      if (currentPosition.y == 0) {
        console.log('You can\'t go north')
        return currentPosition
      } else {
        return { ...currentPosition, y: --currentPosition.y }
      }
      break
    case 's':
      console.log('> GO SOUTH')
      if (currentPosition.y == roomMap.length - 1) {
        console.log('You can\'t go south')
        return currentPosition
      } else {
        return { ...currentPosition, y: ++currentPosition.y }
      }
      break
    case 'w':
      console.log('> GO WEST')
      if (currentPosition.x == 0) {
        console.log('You can\'t go west')
        return currentPosition
      } else {
        return { ...currentPosition, x: --currentPosition.x }
      }
      break
    case 'e':
      console.log('> GO EAST')
      if (currentPosition.x == roomMap[currentPosition.y].length - 1) {
        console.log('You can\'t go east')
        return currentPosition
      } else {
        return { ...currentPosition, x: ++currentPosition.x }
      }
      break
    default:
      console.log('Bad Direction Command')
      return currentPosition
  }
}

export const getPermittedMoves = (currentPosition: Position): string[] => {
  const moves: string[] = []

  currentPosition.y >= 1 ? moves.push('n') : null
  currentPosition.y < roomMap.length - 1 ? moves.push('s') : null
  currentPosition.x > 0 ? moves.push('w') : null
  currentPosition.x < roomMap[currentPosition.y].length - 1 ? moves.push('e') : null
  return moves
}

export const getCurrentRoom = (position: Position): Room => {
  return roomMap[position.y][position.x]
}

const outsideEntrance: Room = {
  tile: entranceTileTemplateAnimation,
  // s3Key: 'tile/haunted.house.entrance.v2.png',
  description:
        'You\'re standing outside the House on Hackman\'s Hill.',
}

const bathroom: Room = {
  tile: bathroomTileTemplateAnimation,
  description:
        'You stand in the bathroom. There is an electric razor sitting on the counter top.',
}

const kitchen: Room = {
  tile: kitchenTileTemplateAnimation,
  description:
        'You are standing in the giant kitchen.',
}

const foyer: Room = {
  tile: foyerTileTemplateAnimation,
  description:
        'There\'s a grand piano standing front of you.',
}

const backyard: Room = {
  tile: backYardTileTemplateAnimation,
  //   description: '[TROLL ROOM] You feel the bones in your skull crush, as a heavy blow is dealt to your head.',
  description: 'You\'re standing in the backyard.',
}

const sideyard: Room = {
  tile: sideYardTileTemplateAnimation,
  description: 'There\'s a bird bath here on the side of the house.  Hmmmmmm.',
}

const roomMap: Room[][] = [

  /*                    N              */
  /*W*/[foyer, kitchen, bathroom], /*E*/
  /*W*/[outsideEntrance, sideyard, backyard], /*E*/
  /*                    S              */
]

export const localActions = {
  East: 'Action.HauntedHouse.East',
  West: 'Action.HauntedHouse.West',
  North: 'Action.HauntedHouse.North',
  South: 'Action.HauntedHouse.South',
}

//
// Haunted House Tiles
// 

// let topMostTileZIndex = 100;

// export const incrementZIndex = (): Number => {
//     return ++topMostTileZIndex
// }

const numberValueLens = sf.lens<number>('metadata.numberValue')

const zIndexField = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'topMostZIndex',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: 100,
  },
})

export const incrementZIndex = (contextApi: ChatRoomActionContextApi): Promise<number> => {
  return contextApi.getChatRoom().incrementField(zIndexField, 1)
    .then(sf.tap((field: Field) => logger.info('zIndex after increment', { field })))
  // .then(numberValueLens.get)
  // .then((n: number) => contextApi.getChatRoom().saveField(numberValueLens.set(n + 1)(zIndexField)))
  // .then(sf.tap((field: Field) => log('zIndex Field after save', { field })))
    .then(numberValueLens.get)
    // .then(sf.tap((n: number) => log('n value', { n })))
}

// export const initZIndex = (contextApi: ChatRoomActionContextApi): Promise<number> => {
//     return contextApi.getChatRoom().field(zIndexField)
//         .then(sf.tap((field: Field) => log('zIndex Field pre-save', { field })))
//         .then(numberValueLens.get)
//         .then((n: number) => contextApi.getChatRoom().saveField(numberValueLens.set(n + 1)(zIndexField)))
//         .then(sf.tap((field: Field) => log('zIndex Field after save', { field })))
//         .then(numberValueLens.get)
//         .then(sf.tap((n: number) => log('n value', { n })))
// }

// export const subwindowFrameTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.haunted.house.sub.window.frame',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         image: {
//             s3Key: 'tile/haunted.house.window.cutout.png'
//         },
//         animationSequence: {
//             animations: [
//                 {
//                     animationType: AnimationType.NativeAnimatableAnimation,
//                     animation: rnAnimations.fadeIn,
//                     duration: 1500,
//                 }
//             ],
//         },
//         containerStyle: {
//             top: 0,
//             left: 0,
//             height: 100,
//             width: 100,
//             zIndex: 100,
//             backgroundColor: 'transparent',
//             borderColor: 'red',
//             borderWidth: 0,
//             borderRadius: 0,
//         },
//     }
// });

// export const roomTileTemplateAnimation = misc.deepFreeze<TileTemplate>({
//     name: 'tile.haunted.house.room.animation',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         // image is dynamic
//         animationSequence: {
//             animations: [
//                 {

//                     animationType: AnimationType.NativeAnimatableAnimation,
//                     // animation is dynamic (slideInUp, down, left right)
//                     // animation: rnAnimations.fadeIn,
//                     duration: 1500,
//                 }
//             ],
//         },
//         containerStyle: {
//             top: 0,
//             left: 0,
//             height: 100,
//             width: 100,
//             zIndex: 100,
//             backgroundColor: 'transparent',
//             borderColor: 'red',
//             borderWidth: 0,
//             borderRadius: 0,
//         },
//     }
// });

// export const subwindowBackDropTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.haunted.house.sub.window.backdrop',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         // no image, just a backdrop behind the window frame
//         containerStyle: {
//             top: 0,
//             left: 0,
//             height: 100,
//             width: 100,
//             zIndex: 100,
//             backgroundColor: '#000000dd',
//             borderColor: 'red',
//             borderWidth: 0,
//             borderRadius: 0,
//         },
//     }
// });

// export const currentRoomTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.haunted.house.current.room',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         // image set dynamically.
//         containerStyle: {
//             bottom: 15,
//             right: 15,
//             height: 30,
//             width: 30,
//             zIndex: 99,
//             borderColor: 'red',
//             borderWidth: 0,
//         },
//     }
// });

// export const currentRoomTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.haunted.house.current.room',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         // image set dynamically.
//         containerStyle: {
//             bottom: 0,
//             right: 0,
//             height: 100,
//             width: 100,
//             zIndex: 99,
//             borderColor: 'red',
//             borderWidth: 0,
//         },
//     }
// });

export const fadeOutEffectTemplate = misc.deepFreeze<EffectTemplate<AnimationSequenceEffectMetadata>>({
  type: EffectType.AnimationSequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FadeOut,
          duration: 500,
        },
      ],
    },
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
// Card Deck (static data)
//

export interface Card {
  s3Key: string
  rank: number
}

export interface CardDeck {
  [key: string]: Card
}

export const cardDeck: CardDeck = {
  'ace.spades': {
    s3Key: 'tile/card.ace.spades.png',
    rank: 14,
  },
  'king.spades': {
    s3Key: 'tile/card.king.spades.png',
    rank: 13,
  },
  'queen.spades': {
    s3Key: 'tile/card.queen.spades.png',
    rank: 12,
  },
  'jack.spades': {
    s3Key: 'tile/card.jack.spades.png',
    rank: 11,
  },
  'ten.spades': {
    s3Key: 'tile/card.ten.spades.png',
    rank: 10,
  },
  'nine.spades': {
    s3Key: 'tile/card.nine.spades.png',
    rank: 9,
  },
  'eight.spades': {
    s3Key: 'tile/card.eight.spades.png',
    rank: 8,
  },
  'seven.spades': {
    s3Key: 'tile/card.seven.spades.png',
    rank: 7,
  },
  'six.spades': {
    s3Key: 'tile/card.six.spades.png',
    rank: 6,
  },
  'five.spades': {
    s3Key: 'tile/card.five.spades.png',
    rank: 5,
  },
  'four.spades': {
    s3Key: 'tile/card.four.spades.png',
    rank: 4,
  },
  'three.spades': {
    s3Key: 'tile/card.three.spades.png',
    rank: 3,
  },
  'two.spades': {
    s3Key: 'tile/card.two.spades.png',
    rank: 2,
  },
}

export const faceDownCard: Card = {
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

// var allStates = {
//     start: 'foyer',
//     pizzaHasBeenGiven: 'pizzaHasBeenGiven',
//     yesStory: 'yesStory',
//     noStory: 'noStory'
// }

// /** 
//  * Mapping from state => action set
//  */
// export const stateActionGroups = {

//     [allStates.start]: [
//         localActions.Pizza,
//         // RewardedPizzaHandler.NAME,
//         // DebugResetHandler.NAME,
//     ],

//     [allStates.pizzaHasBeenGiven]: [
//         localActions.Yes,
//         localActions.No,
//         // DebugResetHandler.NAME,
//     ],

//     [allStates.yesStory]: [
//         // DebugResetHandler.NAME,
//     ],

//     [allStates.noStory]: [
//         // DebugResetHandler.NAME,
//     ],
// };

/** 
 * List of local actions ("local" == defined only in this chatroom).
 */
export const localActionNames = [
  'action.hauntedhouse.punch',
  'action.hauntedhouse.kick',
  'action.hauntedhouse.take',
]
