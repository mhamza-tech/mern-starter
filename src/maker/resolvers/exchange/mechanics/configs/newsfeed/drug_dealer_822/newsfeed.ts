import { CounterState, NewsfeedConfig } from '../../../engine/types'

export const newsfeed : NewsfeedConfig[] = [
  // Mushroom
  {
    conditions: [
      {
        type: 'counterValue',
        name: 'lick_54',
        test: 'equalTo',
        value: 3,
      },
      {
        type: 'counterState',
        name: 'lick_54',
        test: 'equalTo',
        value: CounterState.Active,
      },
      {
        type: 'userState',
        name: 'wasted_304',
        test: 'lessThan',
        value: 100,
      },
    ],
    context: 'item',
    contextId: 'magic_mushroom_608',
    debug: 'Broadcasting Jose Mushroom',
    stringTags: ['news', 'drug_dealer_822', 'target_actor', 'magic_mushroom_608'],
  },
  // Ecstasy
  {
    conditions: [
      {
        type: 'counterValue',
        name: 'poke_75',
        test: 'equalTo',
        value: 3,
      },
      {
        type: 'counterState',
        name: 'poke_75',
        test: 'equalTo',
        value: CounterState.Active,
      },
      {
        type: 'userState',
        name: 'wasted_304',
        test: 'lessThan',
        value: 100,
      },
    ],
    context: 'item',
    contextId: 'ecstasy_1583',
    debug: 'Broadcasting Jose Ecstasy',
    stringTags: ['news', 'drug_dealer_822', 'target_actor', 'ecstasy_1583'],
  },
  // Joint
  {
    conditions: [
      {
        type: 'counterValue',
        name: 'hug_50',
        test: 'equalTo',
        value: 3,
      },
      {
        type: 'counterState',
        name: 'hug_50',
        test: 'equalTo',
        value: CounterState.Active,
      },
      {
        type: 'userState',
        name: 'wasted_304',
        test: 'lessThan',
        value: 100,
      },
    ],
    context: 'item',
    contextId: 'regular_joint_696',
    debug: 'Broadcasting Jose Joint',
    stringTags: ['news', 'drug_dealer_822', 'target_actor', 'regular_joint_696'],
  },
]
