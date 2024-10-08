import { PrizeConfig } from '../../../engine/types'

export const fallback : PrizeConfig[] = [
  {
    id: 'prize.broken.heart.pill',
    prizeType: 'item',
    prizes: ['broken_heart_pill_2183'],  // change
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['yes', 'yes', 'no'],
          ['yes', 'no', 'yes'],
          ['yes', 'no', 'no'],
          ['no', 'yes', 'yes'],
          ['no', 'yes', 'no'],
          ['no', 'no', 'yes'],
          ['no', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
]
