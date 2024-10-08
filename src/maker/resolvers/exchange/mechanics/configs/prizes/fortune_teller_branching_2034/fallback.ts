import { lotties } from 'src/maker/helpers'
import { PrizeConfig } from '../../../engine/types'

export const fallback : PrizeConfig[] = [
  {
    id: 'no_affliction.job.injured',
    prizeType: 'futureJob',
    prizes: ['cursedInjured'],
    lottieEffect: {
      id: lotties.hit_explosion,
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
        value: 'no_afflictions',
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
  {
    id: 'no_affliction.coachella.dust',
    prizeType: 'item',
    prizes: ['coachella_dust_23'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'no_afflictions',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'no'],
          ['yes', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'no_affliction.job.desired',
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
        value: 'no_afflictions',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['yes', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'no_affliction.tiger.milk',
    prizeType: 'item',
    prizes: ['tiger_milk_110'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'no_afflictions',
      },
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
