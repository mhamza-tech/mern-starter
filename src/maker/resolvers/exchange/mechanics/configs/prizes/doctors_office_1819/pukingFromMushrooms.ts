import { PrizeConfig } from '../../../engine/types'

export const pukingFromMushrooms : PrizeConfig[] = [
  {
    id: 'puking_from_magic_mushrooms.probiotic.pill',
    prizeType: 'item',
    prizes: ['probiotic_pill_2122'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'puking_from_magic_mushrooms_2078',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['yes', 'no', 'yes'],
          ['no', 'yes', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'puking_from_magic_mushrooms.magic.mushroom',
    prizeType: 'item',
    prizes: ['magic_mushroom_608'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'puking_from_magic_mushrooms_2078',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'puking_from_magic_mushrooms.karen.burger',
    prizeType: 'item',
    prizes: ['karen_burger_52'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'puking_from_magic_mushrooms_2078',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'puking_from_magic_mushrooms.vegan.smoothie',
    prizeType: 'item',
    prizes: ['vegan_smoothie_82'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'puking_from_magic_mushrooms_2078',
      },
      {
        type: 'booleanPath',
        value: [
          ['no', 'yes', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'puking_from_magic_mushrooms.poop',
    prizeType: 'item',
    prizes: ['poop_678'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'puking_from_magic_mushrooms_2078',
      },
      {
        type: 'booleanPath',
        value: [
          ['no', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'puking_from_magic_mushrooms.hashtribute.dumbass',
    prizeType: 'hashtribute',
    prizes: ['dumbass_1697'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'puking_from_magic_mushrooms_2078',
      },
      {
        type: 'booleanPath',
        value: [
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
]
