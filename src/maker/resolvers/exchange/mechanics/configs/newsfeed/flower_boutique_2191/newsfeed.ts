import { NewsfeedConfig } from '../../../engine/types'

export const newsfeed : NewsfeedConfig[] = [
  // Bouquet of Passion
  {
    conditions: [
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['no', 'yes', 'no'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'item',
    contextId: 'bouquet_of_passion_2192',
    debug: 'Broadcasting Bouquet of Passion',
    stringTags: ['news', 'flower_boutique_2191', 'target_actor', 'bouquet_of_passion_2192'],
  },
  // Bouquet of Friendship
  {
    conditions: [
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'no'],
          ['no', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'item',
    contextId: 'bouquet_of_friendship_2193',
    debug: 'Broadcasting Bouquet of Friendship',
    stringTags: ['news', 'flower_boutique_2191', 'target_actor', 'bouquet_of_friendship_2193'],
  },
  // Bouquet of Broken Hearts
  {
    conditions: [
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'yes'],
          ['no', 'yes', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'item',
    contextId: 'bouquet_of_broken_hearts_2194',
    debug: 'Broadcasting Bouquet of Broken Hearts',
    stringTags: ['news', 'flower_boutique_2191', 'target_actor', 'bouquet_of_broken_hearts_2194'],
  },
  // Bouquet of Celebration
  {
    conditions: [
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'no'],
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'item',
    contextId: 'bouquet_of_surprise_2195',
    debug: 'Broadcasting Bouquet of Celebration',
    stringTags: ['news', 'flower_boutique_2191', 'target_actor', 'bouquet_of_surprise_2195'],
  },
]
