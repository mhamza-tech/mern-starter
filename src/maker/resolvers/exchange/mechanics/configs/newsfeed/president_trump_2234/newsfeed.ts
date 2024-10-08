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
    contextId: 'trump_2020_pin_2235',
    debug: 'Broadcasting Trump Pin News',
    stringTags: ['news', 'president_trump_2234', 'target_actor', 'trump_2020_pin_2235'],
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
    contextId: 'trump_2020_pin_2235',
    debug: 'Broadcasting Trump Pin News',
    stringTags: ['news', 'president_trump_2234', 'target_actor', 'trump_2020_pin_2235'],
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
    contextId: 'trump_2020_pin_2235',
    debug: 'Broadcasting Trump Pin News',
    stringTags: ['news', 'president_trump_2234', 'target_actor', 'trump_2020_pin_2235'],
  },
]
