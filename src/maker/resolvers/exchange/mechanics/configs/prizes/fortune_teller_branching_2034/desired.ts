import { lotties } from 'src/maker/helpers'
import { PrizeConfig } from '../../../engine/types'

export const desired : PrizeConfig[] = [
  {
    id: 'desired.rabbitfoot',
    prizeType: 'item',
    prizes: ['rabbit_foot_2038'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'desired_33',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['yes', 'yes', 'no'],
          ['no', 'yes', 'yes'],
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'desired.redstring',
    prizeType: 'item',
    prizes: ['red_string_2040'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'desired_33',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'desired.poop',
    prizeType: 'item',
    prizes: ['poop_678'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'desired_33',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'desired.job.desired.curse',
    prizeType: 'futureJob',
    prizes: ['cursedDesire'],
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
        value: 'desired_33',
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
]
