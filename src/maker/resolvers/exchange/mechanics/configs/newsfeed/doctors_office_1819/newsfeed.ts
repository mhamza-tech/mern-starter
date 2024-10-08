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
        ],
        test: 'equalTo',
      },
    ],
    context: 'item',
    contextId: 'lollipop_2037',
    debug: 'Broadcasting Lollipop Suppository',
    stringTags: ['news', 'doctors_office_1819', 'target_actor', 'lollipop_2037', 'put_in_butt_1966'],
    backgroundImageS3Key: 'mp4/in_love_with_me.mp4',
  },
]
