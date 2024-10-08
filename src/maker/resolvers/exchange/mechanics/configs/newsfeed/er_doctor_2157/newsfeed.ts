import { NewsfeedConfig } from '../../../engine/types'

export const newsfeed: NewsfeedConfig[] = [
  {
    conditions: [
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['no', 'yes', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'item',
    contextId: 'bandage_2156',
    debug: 'Broadcasting Bandage',
    stringTags: ['news', 'er_doctor_2157', 'target_actor', 'bandage_2156'],
  },
  {
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
    context: 'item',
    contextId: 'probiotic_pill_2122',
    debug: 'Broadcasting Probiotic Pill',
    stringTags: ['news', 'er_doctor_2157', 'target_actor', 'probiotic_pill_2122'],
  },
]
