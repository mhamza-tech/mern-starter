import { PrizeConfig } from '../../../engine/types'

export const horny : PrizeConfig[] = [
  {
    id: 'horny.hashtribute.dumbass',
    prizeType: 'hashtribute',
    prizes: ['dumbass_1697'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'horny_48',
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
    id: 'horny.hashtribute.animallover',
    prizeType: 'hashtribute',
    prizes: ['animal_lover_1685'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'horny_48',
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
    id: 'horny.fur.patch',
    prizeType: 'item',
    prizes: ['fur_patch_2049'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'horny_48',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['no', 'yes', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'horny.wooden.coaster',
    prizeType: 'item',
    prizes: ['wood_coaster_2050'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'horny_48',
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
    id: 'horny.poop',
    prizeType: 'item',
    prizes: ['poop_678'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'horny_48',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'no'],
          ['no', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
]
