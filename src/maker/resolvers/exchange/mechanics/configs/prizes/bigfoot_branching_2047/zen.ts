import { PrizeConfig } from '../../../engine/types'

export const zen : PrizeConfig[] = [
  {
    id: 'zen.rabbitfoot',
    prizeType: 'item',
    prizes: ['rabbit_foot_2038'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'zen_1182',
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
    id: 'zen.wooden.coaster',
    prizeType: 'item',
    prizes: ['wood_coaster_2050'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'zen_1182',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['yes', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'zen.fur.patch',
    prizeType: 'item',
    prizes: ['fur_patch_2049'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'zen_1182',
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
  {
    id: 'zen.hashtribute.dumbass',
    prizeType: 'hashtribute',
    prizes: ['dumbass_1697'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'zen_1182',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'no'],
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'zen.hashtribute.animallover',
    prizeType: 'hashtribute',
    prizes: ['animal_lover_1685'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'zen_1182',
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
]
