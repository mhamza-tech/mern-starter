import { lotties } from 'src/maker/helpers'
import { PrizeConfig } from '../../../engine/types'

export const lucky : PrizeConfig[] = [
  {
    id: 'lucky.job.luck.curse',
    prizeType: 'futureJob',
    prizes: ['cursedLuck'],
    lottieEffect: {
      id: lotties.clouds_2,
      containerStyle: {
        width: 40,
        height: 40,
        left: 30,
        top: 60,
        zIndex: 60,
      },
    },
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'lucky_2121',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'no'],
          ['no', 'yes', 'yes'],
          ['no', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'lucky.rabbitfoot',
    prizeType: 'item',
    prizes: ['rabbit_foot_2038'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'lucky_2121',
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
    id: 'lucky.redstring',
    prizeType: 'item',
    prizes: ['red_string_2040'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'lucky_2121',
      },
      {
        type: 'booleanPath',
        value: [
          ['no', 'yes', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'lucky.job.desired',
    prizeType: 'futureJob',
    prizes: ['blessedDesired'],
    lottieEffect: {
      id: lotties.heart_particles,
      containerStyle: {
        width: 40,
        height: 40,
        left: 30,
        top: 60,
        zIndex: 60,
      },
    },
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'lucky_2121',
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
]
