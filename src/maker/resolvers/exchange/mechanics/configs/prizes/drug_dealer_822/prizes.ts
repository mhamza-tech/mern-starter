import { PrizeConfig } from '../../../engine/types'

export const prizes : PrizeConfig[] = [
  {
    id: 'magic_mushroom_608',
    prizeType: 'item',
    prizes: ['magic_mushroom_608'],
    stock: 1,
    conditions: [
      {
        type: 'counterValue',
        name: 'lick_54',
        test: 'equalTo',
        value: 3,
      },
      {
        type: 'userState',
        name: 'wasted_304',
        test: 'lessThan',
        value: 100,
      },
    ],
  },
  {
    id: 'ecstasy_1583',
    prizeType: 'item',
    prizes: ['ecstasy_1583'],
    stock: 1,
    conditions: [
      {
        type: 'counterValue',
        name: 'poke_75',
        test: 'equalTo',
        value: 3,
      },
      {
        type: 'userState',
        name: 'wasted_304',
        test: 'lessThan',
        value: 100,
      },
    ],
  },
  {
    id: 'regular_joint_696',
    prizeType: 'item',
    prizes: ['regular_joint_696'],
    stock: 1,
    conditions: [
      {
        type: 'counterValue',
        name: 'hug_50',
        test: 'equalTo',
        value: 3,
      },
      {
        type: 'userState',
        name: 'wasted_304',
        test: 'lessThan',
        value: 100,
      },
    ],
  },
]
