import { PrizeConfig } from '../../../engine/types'

export const fallback : PrizeConfig[] = [
  {
    id: 'prize.bouquet.passion',
    prizeType: 'item',
    prizes: ['bouquet_of_passion_2192'],  // change
    stock: 1,
    sessionCompleted: true,
    conditions: [
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
    id: 'prize.bouquet.broken.hearts',
    prizeType: 'item',
    prizes: ['bouquet_of_broken_hearts_2194'],  // change
    stock: 1,
    sessionCompleted: true,
    conditions: [
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
    id: 'prize.bouquet.friendship',
    prizeType: 'item',
    prizes: ['bouquet_of_friendship_2193'],  // change
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
  {
    id: 'prize.bouquet.celebration',
    prizeType: 'item',
    prizes: ['bouquet_of_surprise_2195'],  // change
    stock: 1,
    sessionCompleted: true,
    conditions: [
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
