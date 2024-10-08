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
        ],
        test: 'equalTo',
      },
    ],
    context: 'hashtribute',
    contextId: 'friendly_178',
    debug: 'Broadcasting Scenario: Fallback, Hashtribute Friendly',
    stringTags: ['news', 'bigfoot_branching_2047', 'target_actor', 'friendly_178'],
    backgroundImageS3Key: assets.bigfoot_cuddle_950.s3Key,
    title: '#Friendly',
    description: 'Points awarded!',
  },
  // Scenario: Fallback, Hashtribute: Dumbass
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
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'hashtribute',
    contextId: 'dumbass_1697',
    debug: 'Broadcasting Scenario: Horny, Hashtribute: Dumbass',
    stringTags: ['news', 'bigfoot_branching_2047', 'target_actor', 'dumbass_1697'],
    backgroundImageS3Key: assets.ace_ventura_run_951.s3Key,
    title: '#Dumbass',
    description: 'Points awarded!',
  },
  // Scenario: Horny, Hashtribute: Animal Lover
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'horny_48',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'yes'],
          ['no', 'yes', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'hashtribute',
    contextId: 'animal_lover_1685',
    debug: 'Broadcasting Scenario: Horny, Hashtribute Friendly',
    stringTags: ['news', 'bigfoot_branching_2047', 'target_actor', 'animal_lover_1685'],
    backgroundImageS3Key: assets.puppy_love_949.s3Key,
    title: '#AnimalLover',
    description: 'Points awarded!',
  },
  // Scenario: Horny, Hashtribute: Dumbass
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'horny_48',
      },
      {
        type: 'booleanPath',
        value: [
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'hashtribute',
    contextId: 'dumbass_1697',
    debug: 'Broadcasting Scenario: Zen, Hashtribute: Dumbass',
    stringTags: ['news', 'bigfoot_branching_2047', 'target_actor', 'dumbass_1697'],
    backgroundImageS3Key: assets.ace_ventura_run_951.s3Key,
    title: '#Dumbass',
    description: 'Points awarded!',
  },
  // Scenario: Zen, Hashtribute: Animal Lover
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'zen_1182',
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
    contextId: 'animal_lover_1685',
    debug: 'Broadcasting Scenario: Zen, Hashtribute Friendly',
    stringTags: ['news', 'bigfoot_branching_2047', 'target_actor', 'animal_lover_1685'],
    backgroundImageS3Key: assets.puppy_love_949.s3Key,
    title: '#AnimalLover',
    description: 'Points awarded!',
  },
  // Scenario: Zen, Hashtribute: Dumbass
  {
    conditions: [
      {
        type: 'roomStateContext',
        value: 'zen_1182',
      },
      {
        type: 'booleanPath',
        value: [
          ['yes', 'no', 'no'],
          ['no', 'no', 'yes'],
        ],
        test: 'equalTo',
      },
    ],
    context: 'hashtribute',
    contextId: 'dumbass_1697',
    debug: 'Broadcasting Scenario: Fallback, Hashtribute: Dumbass',
    stringTags: ['news', 'bigfoot_branching_2047', 'target_actor', 'dumbass_1697'],
    backgroundImageS3Key: assets.ace_ventura_run_951.s3Key,
    title: '#Dumbass',
    description: 'Points awarded!',
  },
]
