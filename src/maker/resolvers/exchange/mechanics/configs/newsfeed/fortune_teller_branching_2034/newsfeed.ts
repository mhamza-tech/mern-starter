import { NewsfeedConfig } from '../../../engine/types'

export const newsfeed : NewsfeedConfig[] = [
  // Scenario: Fallback, Curse: Injury
  {
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
    context: 'future',
    contextId: 'injured_876',
    debug: 'Broadcasting FortuneTeller Cursed Injury',
    stringTags: ['news', 'fortune_teller_branching_2034', 'target_actor', 'injured_876', 'cursed'],
    backgroundImageS3Key: 'mp4/in_love_with_me.mp4',
  },
  // Scenario: Fallback, Blessing: Desire
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
          ['yes', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'future',
    contextId: 'desired_33',
    debug: 'Broadcasting Scenario: Fallback, Blessing: Desire',
    stringTags: ['news', 'fortune_teller_branching_2034', 'target_actor', 'desired_33', 'blessed'],
    backgroundImageS3Key: 'mp4/in_love_with_me.mp4',
  },
  // Scenario Desired: Cursed: Desire
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'desired_33',
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
    context: 'future',
    contextId: 'desired_33',
    debug: 'Broadcasting Scenario Desired: Cursed: Desire',
    stringTags: ['news', 'fortune_teller_branching_2034', 'target_actor', 'desired_33', 'cursed'],
    backgroundImageS3Key: 'mp4/in_love_with_me.mp4',
  },
  // Scenario Lucky: Cursed: Luck
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'lucky_2121',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'no'],
          ['no', 'yes', 'yes'],
          ['no', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'future',
    contextId: 'lucky_2121',
    debug: 'Scenario Lucky: Cursed: Luck',
    stringTags: ['news', 'fortune_teller_branching_2034', 'target_actor', 'lucky_2121', 'cursed'],
    backgroundImageS3Key: 'mp4/in_love_with_me.mp4',
  },
  // Scenario: Lucky, Blessing: Desire
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'lucky_2121',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'no'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'future',
    contextId: 'desired_33',
    debug: 'Broadcasting Scenario: Lucky, Blessing: Desire',
    stringTags: ['news', 'fortune_teller_branching_2034', 'target_actor', 'desired_33', 'blessed'],
    backgroundImageS3Key: 'mp4/in_love_with_me.mp4',
  },
]
