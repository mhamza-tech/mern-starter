import { PrizeConfig } from '../../../engine/types'

export const trump_2020 : PrizeConfig[] = [
  {
    id: 'prize.biden.2020.pin',
    prizeType: 'item',
    prizes: ['biden_2020_pin_2265'],  // change
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'trump2020_2251',
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
