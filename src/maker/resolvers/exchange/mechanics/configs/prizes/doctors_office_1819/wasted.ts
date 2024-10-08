import { PrizeConfig } from '../../../engine/types'

export const wasted : PrizeConfig[] = [
  {
    id: 'wasted.lollipop',
    prizeType: 'item',
    prizes: ['lollipop_2037'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'wasted_304',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'no'],
          ['yes', 'no', 'no'],
          ['no', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'wasted.hangover',
    prizeType: 'item',
    prizes: ['hangover_pill_2154'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'wasted_304',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['yes', 'no', 'yes'],
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'wasted.vitamin',
    prizeType: 'item',
    prizes: ['vitamin_pill_2153'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'wasted_304',
      },
      {
        type: 'booleanPath',
        value: [
          ['no', 'yes', 'yes'],
          ['no', 'yes', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
]
