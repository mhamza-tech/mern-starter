import { NewsfeedConfig } from '../../../engine/types'

export const newsfeed : NewsfeedConfig[] = [
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'no_afflictions',
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
    context: 'item',
    contextId: 'biden_2020_pin_2265',
    debug: 'Broadcasting Trump Pin News',
    stringTags: ['news', 'biden_2020_2264', 'target_actor', 'biden_2020_pin_2265'],
  },
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'biden2020_2271',
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
    context: 'item',
    contextId: 'biden_2020_pin_2265',
    debug: 'Broadcasting Trump Pin News',
    stringTags: ['news', 'biden_2020_2264', 'target_actor', 'biden_2020_pin_2265'],
  },
  {
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
    context: 'item',
    contextId: 'biden_2020_pin_2265',
    debug: 'Broadcasting Trump Pin News',
    stringTags: ['news', 'biden_2020_2264', 'target_actor', 'biden_2020_pin_2265'],
  },
]
