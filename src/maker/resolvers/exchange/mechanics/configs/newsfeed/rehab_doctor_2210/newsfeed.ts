import { NewsfeedConfig } from '../../../engine/types'

export const newsfeed : NewsfeedConfig[] = [
  {
    conditions: [
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['yes', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'item',
    contextId: 'hangover_pill_2154',
    debug: 'Broadcasting Hangover Pill',
    stringTags: ['news', 'rehab_doctor_2210', 'target_actor', 'hangover_pill_2154'],
  },
  {
    conditions: [
      {
        type: 'booleanPath',
        value: [
          ['no', 'yes', 'yes'],
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'item',
    contextId: 'reality_pill_2212',
    debug: 'Broadcasting Reality Pill',
    stringTags: ['news', 'rehab_doctor_2210', 'target_actor', 'reality_pill_2212'],
  },
]
