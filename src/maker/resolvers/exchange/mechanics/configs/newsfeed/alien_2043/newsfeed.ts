import { assets } from 'src/domain/assets'
import { NewsfeedConfig } from '../../../engine/types'

export const newsfeed : NewsfeedConfig[] = [
  // Scenario: Fallback, Hashtribute: Friendly
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'no_afflictions',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'no'],
          ['yes', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'hashtribute',
    contextId: 'friendly_178',
    debug: 'Broadcasting Scenario: Fallback, Hashtribute Friendly',
    stringTags: ['news', 'alien_2043', 'target_actor', 'friendly_178'],
    backgroundImageS3Key: assets.big_hero_6_hug_947.s3Key,
    title: '#Friendly',
    description: 'Points awarded!',
  },
  // Scenario: Fallback, Hashtribute: Deviant
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
        ],
        test: 'equalTo',
      },
    ],
    context: 'hashtribute',
    contextId: 'deviant_1961',
    debug: 'Broadcasting Scenario: Fallback, Hashtribute: Deviant',
    stringTags: ['news', 'alien_2043', 'target_actor', 'deviant_1961'],
    backgroundImageS3Key: assets.deviant_bed_bouncing_946.s3Key,
    title: '#Deviant',
    description: 'Points awarded!',
  },
  // Scenario: Fallback, Item: Freezeray
  {
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
    context: 'item',
    contextId: 'freeze_ray_gun_2061',
    debug: 'Broadcasting Scenario: Fallback, Item: Freeze Ray',
    stringTags: ['news', 'alien_2043', 'target_actor', 'freeze_ray_gun_2061'],
  },
  // Scenario Fallback: Item: Egg
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'no_afflictions',
      },
      {
        type: 'booleanPath',
        value: [
          ['no', 'yes', 'yes'],
          ['no', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'item',
    contextId: 'alien_egg_2044',
    debug: 'Broadcasting Scenario Fallback: Item: Alien Egg',
    stringTags: ['news', 'alien_2043', 'target_actor', 'alien_egg_2044'],
  },
  // Scenario: Desired, Item: Flamethrower
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'desired_33',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'no'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'item',
    contextId: 'flame_thrower_2066',
    debug: 'Broadcasting Scenario: Desired, Item: Flamethrower',
    stringTags: ['news', 'alien_2043', 'target_actor', 'flame_thrower_2066'],
  },
  // Scenario: Desired, Hashtribute: Friendly
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'desired_33',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'no'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'hashtribute',
    contextId: 'friendly_178',
    debug: 'Broadcasting Scenario: Desired, Hashtribute Friendly',
    stringTags: ['news', 'alien_2043', 'target_actor', 'friendly_178'],
    backgroundImageS3Key: assets.big_hero_6_hug_947.s3Key,
    title: '#Friendly',
    description: 'Points awarded!',
  },
  // Scenario: Desired, Hashtribute: Dumbass
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'desired_33',
      },
      {
        type: 'booleanPath',
        value: [
          ['no', 'no', 'no'],
          ['yes', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'hashtribute',
    contextId: 'dumbass_1697',
    debug: 'Broadcasting Scenario: Desired, Hashtribute: Dumbass',
    stringTags: ['news', 'alien_2043', 'target_actor', 'dumbass_1697'],
    backgroundImageS3Key: assets.trump_confused_948.s3Key,
    title: '#Dumbass',
    description: 'Points awarded!',
  },
  // Scenario Desired: Item: Egg
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'desired_33',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
          ['no', 'yes', 'yes'],
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'item',
    contextId: 'alien_egg_2044',
    debug: 'Broadcasting Scenario Desired: Item: Alien Egg',
    stringTags: ['news', 'alien_2043', 'target_actor', 'alien_egg_2044'],
  },
  // Scenario: Injured, Item: Flamethrower
  {
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
    context: 'item',
    contextId: 'flame_thrower_2066',
    debug: 'Broadcasting Scenario: Injured, Item: Flamethrower',
    stringTags: ['news', 'alien_2043', 'target_actor', 'flame_thrower_2066'],
  },
  // Scenario: Injured, Item: Freezeray
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'item',
    contextId: 'freeze_ray_gun_2061',
    debug: 'Broadcasting Scenario: Injured, Item: Freeze Ray',
    stringTags: ['news', 'alien_2043', 'target_actor', 'freeze_ray_gun_2061'],
  },
  // Scenario: Injured, Hashtribute: Friendly
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
      },
      {
        type: 'booleanPath',
        value: [
          ['no', 'yes', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'hashtribute',
    contextId: 'friendly_178',
    debug: 'Broadcasting Scenario: Injured, Hashtribute Friendly',
    stringTags: ['news', 'alien_2043', 'target_actor', 'friendly_178'],
    backgroundImageS3Key: assets.big_hero_6_hug_947.s3Key,
    title: '#Friendly',
    description: 'Points awarded!',
  },
  // Scenario: Injured, Hashtribute: Deviant
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'yes', 'no'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'hashtribute',
    contextId: 'deviant_1961',
    debug: 'Broadcasting Scenario: Fallback, Hashtribute: Deviant',
    stringTags: ['news', 'alien_2043', 'target_actor', 'deviant_1961'],
    backgroundImageS3Key: assets.deviant_bed_bouncing_946.s3Key,
    title: '#Deviant',
    description: 'Points awarded!',
  },
  // Scenario Injured: Item: Egg
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'injured_876',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'no'],
          ['no', 'yes', 'no'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'item',
    contextId: 'alien_egg_2044',
    debug: 'Broadcasting Scenario Fallback: Item: Alien Egg',
    stringTags: ['news', 'alien_2043', 'target_actor', 'alien_egg_2044'],
  },
]
