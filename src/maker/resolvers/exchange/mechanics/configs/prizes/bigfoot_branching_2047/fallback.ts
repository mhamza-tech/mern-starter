import { PrizeConfig } from '../../../engine/types'

export const fallback : PrizeConfig[] = [
  {
    id: 'no_afflictions.hashtribute.dumbass',
    prizeType: 'hashtribute',
    prizes: ['dumbass_1697'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'no_afflictions',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'no_afflictions.hashtribute.friendly',
    prizeType: 'hashtribute',
    prizes: ['friendly_178'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'no_afflictions',
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
    id: 'no_afflictions.magic.mushroom',
    prizeType: 'item',
    prizes: ['magic_mushroom_608'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'no_afflictions',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'yes'],
          ['no', 'yes', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'no_afflictions.used.condom',
    prizeType: 'item',
    prizes: ['used_condom_1740'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'no_afflictions',
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
    id: 'no_afflictions.poop',
    prizeType: 'item',
    prizes: ['poop_678'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'no_afflictions',
      },
      {
        type: 'booleanPath',
        value: [
          ['no', 'yes', 'no'],
          ['no', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
]
