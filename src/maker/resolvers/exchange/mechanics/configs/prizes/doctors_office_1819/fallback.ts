import { PrizeConfig } from '../../../engine/types'

export const fallback : PrizeConfig[] = [
  {
    id: 'no_affliction.lollipop',
    prizeType: 'item',
    prizes: ['lollipop_2037'],
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
          ['no', 'yes', 'yes'],
          ['no', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'no_affliction.dildo',
    prizeType: 'item',
    prizes: ['dildo_1649'],
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
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'no_affliction.vitaminPill',
    prizeType: 'item',
    prizes: ['vitamin_pill_2153'],
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
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'no_affliction.probioticPill',
    prizeType: 'item',
    prizes: ['probiotic_pill_2122'],
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
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'no_affliction.hashtribute.weirdo',
    prizeType: 'hashtribute',
    prizes: ['weirdo_1693'],
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
          ['yes', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
  },
]
