import { NewsfeedConfig } from '../../../engine/types'

export const newsfeed : NewsfeedConfig[] = [
  {
    conditions: [
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
    context: 'item',
    contextId: 'broken_heart_pill_2183',
    debug: 'Broadcasting Broken Heart Pill',
    stringTags: ['news', 'love_doctor_2173', 'target_actor', 'broken_heart_pill_2183'],
  },
]
