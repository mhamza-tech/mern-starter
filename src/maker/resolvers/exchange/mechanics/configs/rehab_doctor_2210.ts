import { GeneratorConfig, FinishedCondition, counterDefaults, RequiredNodeApi } from '../engine/types'
import { misc } from 'src/utils'
import { MoveName } from 'src/domain/moves'
import { prizes } from './prizes/rehab_doctor_2210/prizes'
import { newsfeed } from './newsfeed/rehab_doctor_2210/newsfeed'
import { ReactNativeAnimations } from 'src/maker/animations'

const yes : MoveName = 'yes_word_bubble_1821'
const no : MoveName = 'no_word_bubble_1820'
const restart : MoveName = 'restart_word_bubble_2237'

export const config : GeneratorConfig = misc.deepFreeze<GeneratorConfig>({
  id: 'rehab_doctor_2210',
  debug: {
    enabled: false, // SET THIS TO TRUE TO TEST SPECIFIC INTERACTIONS WITH STATES
    states: [
    ],
  },
  interaction: {
    [yes]: {
      intent: [
        { type: 'booleanPath', priority: 'main' },
        { type: 'counter', name: 'progress', priority: 'main' }, // TODO progress is not getting used in the showString
        { type: 'moveMessage', priority: 'main' },
        { type: 'animateNpc', priority: 'main' },
      ],
      booleanChoice: 'yes',
    },
    [no]: {
      intent: [
        { type: 'booleanPath', priority: 'main'  },
        { type: 'counter', name: 'progress', priority: 'main'  },
        { type: 'moveMessage', priority: 'main' },
        { type: 'animateNpc', priority: 'main' },
      ],
      booleanChoice: 'no',
    },
    [restart]: {
      intent: [
        { type: 'restart', priority: 'cleanup'  },
      ],
    },
  },
  finishedCondition: FinishedCondition.NamedCounterAtMax,
  finishedConditionOptions: { counterName: 'progress' },
  counters: {
    'progress': misc.defaultsDeep({
      tags: ['progress'],
      max: 3,
    }, counterDefaults),
  },
  prizes,
  newsfeed,
  newsfeedRateLimit: { days: 1 },
  stateContext: {
    states: [],
    choice: 'random',
    api: RequiredNodeApi.Actor,
  },
  narrative: {
    welcome: [
      {
        debugId: 'welcome.default',
        tags: ['target_actor', 'onroomentered'],
      },
    ],
    interact: [
      {
        tags: ['target_actor', 'onmovetriggered'],
        referenceMove: false,
        referenceBooleanPathHistory: true,
      },
    ],
    reward: [ 
      {
        tags: ['target_actor', 'onmovetriggered'],
        referenceCounterByName: 'progress',
        conditions: [
          {
            type: 'counterValue',
            name: 'progress', // wildcard means insert reference
            value: 3,
            test: 'equalTo',
            api: RequiredNodeApi.Room,
          },
        ],
      },
    ],
  },
  npcAnimationMap: {
    [yes]: {
      animation: ReactNativeAnimations.Bounce,
      duration: 2000,
    },
    [no]: {
      animation: ReactNativeAnimations.Tada,
      duration: 2000,
    },
  },
  globalCooldown: false,
  offerSessionRestart: true,
  enableSessionSupport: true,
})
