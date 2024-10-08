import { PrizeConfig } from '../../../engine/types'

export const desired : PrizeConfig[] = [
  {
    id: 'desired.alien_agg',
    prizeType: 'item',
    prizes: ['alien_egg_2044'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'desired_33',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['no', 'yes', 'yes'],
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'desired.alien_mucus',
    prizeType: 'item',
    prizes: ['alien_mucous_2045'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'desired_33',
      },
      {
        type: 'booleanPath',
        value: [
          ['no', 'yes', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'desired.flamethrower',
    prizeType: 'item',
    prizes: ['flame_thrower_2066'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'desired_33',
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
    id: 'desired.hashtribute.friendly',
    prizeType: 'hashtribute',
    prizes: ['friendly_178'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'desired_33',
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
    id: 'desired.hashtribute.dumbass',
    prizeType: 'hashtribute',
    prizes: ['dumbass_1697'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'desired_33',
      },
      {
        type: 'booleanPath',
        value: [
          ['no', 'no', 'no'],
          ['yes', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
]
