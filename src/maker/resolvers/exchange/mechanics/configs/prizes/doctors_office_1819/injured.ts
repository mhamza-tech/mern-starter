import { PrizeConfig } from '../../../engine/types'

export const injured : PrizeConfig[] = [
  {
    id: 'injured.lollipop',
    prizeType: 'item',
    prizes: ['lollipop_2037'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'no'],
          ['yes', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
  {
    id: 'injured.bandage',
    prizeType: 'item',
    prizes: ['bandage_2156'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
      },
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
    id: 'injured.vitaminPill',
    prizeType: 'item',
    prizes: ['vitamin_pill_2153'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
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
    id: 'injured.poop',
    prizeType: 'item',
    prizes: ['poop_678'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
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
    id: 'injured.joint',
    prizeType: 'item',
    prizes: ['regular_joint_696'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
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
    id: 'injured.hashtribute.dumbass',
    prizeType: 'hashtribute',
    prizes: ['dumbass_1697'],
    stock: 1,
    sessionCompleted: true,
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
      },
      {
        type: 'booleanPath',
        value: [
          ['no', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
  },
]
