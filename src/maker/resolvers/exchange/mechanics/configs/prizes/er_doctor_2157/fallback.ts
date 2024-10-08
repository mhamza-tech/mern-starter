import { PrizeConfig } from '../../../engine/types'

export const fallback : PrizeConfig[] = [
  {
    id: 'prize.bandage',
    prizeType: 'item',
    prizes: ['bandage_2156'],  // change
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['no', 'yes', 'yes'],
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
          ['yes', 'no', 'yes'],
          ['yes', 'no', 'no'],
          ['no', 'yes', 'no'],
          ['no', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'prize.probiotic.pill',
    prizeType: 'item',
    prizes: ['probiotic_pill_2122'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'no'],
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
]
