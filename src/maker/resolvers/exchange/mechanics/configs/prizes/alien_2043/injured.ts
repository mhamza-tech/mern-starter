import { PrizeConfig } from '../../../engine/types'

export const injured : PrizeConfig[] = [
  {
    id: 'injured.alien_agg',
    prizeType: 'item',
    prizes: ['alien_egg_2044'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'no'],
          ['no', 'yes', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'injured.alien_mucus',
    prizeType: 'item',
    prizes: ['alien_mucous_2045'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'injured.poop',
    prizeType: 'item',
    prizes: ['poop_678'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
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
    id: 'injured.flamethrower',
    prizeType: 'item',
    prizes: ['flame_thrower_2066'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
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
  {
    id: 'injured.freezeray',
    prizeType: 'item',
    prizes: ['freeze_ray_gun_2061'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'injured.hashtribute.friendly',
    prizeType: 'hashtribute',
    prizes: ['friendly_178'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
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
    id: 'injured.hashtribute.deviant',
    prizeType: 'hashtribute',
    prizes: ['deviant_1961'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
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
]
