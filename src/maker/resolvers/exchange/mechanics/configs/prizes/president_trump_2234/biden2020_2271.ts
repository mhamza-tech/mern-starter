import { PrizeConfig } from '../../../engine/types'

export const biden_2020 : PrizeConfig[] = [
  {
    id: 'prize.trump.2020.pin',
    prizeType: 'item',
    prizes: ['trump_2020_pin_2235'],  // change
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'biden2020_2271',
      },
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
