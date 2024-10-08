import { PrizeConfig } from '../../../engine/types'

export const fallback : PrizeConfig[] = [
  {
    id: 'prize.hangover.pill',
    prizeType: 'item',
    prizes: ['hangover_pill_2154'],  // change
    stock: 1,
    sessionCompleted: true,
    conditions: [
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
    id: 'prize.lollipop',
    prizeType: 'item',
    prizes: ['lollipop_2037'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'no'],
          ['yes', 'no', 'no'],
          ['no', 'yes', 'no'],
          ['no', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'prize.reality.pill',
    prizeType: 'item',
    prizes: ['reality_pill_2212'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'booleanPath',
        value: [
          ['no', 'yes', 'yes'],
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
]
