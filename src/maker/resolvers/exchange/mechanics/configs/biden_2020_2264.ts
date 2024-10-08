import { GeneratorConfig, FinishedCondition, counterDefaults, RequiredNodeApi } from '../engine/types'
import { misc } from 'src/utils'
import { MoveName } from 'src/domain/moves'
import { prizes } from './prizes/biden_2020_2264/prizes'
import { newsfeed } from './newsfeed/biden_2020_2264/newsfeed'
import { ReactNativeAnimations } from 'src/maker/animations'

const yes : MoveName = 'yes_word_bubble_1821'
const no : MoveName = 'no_word_bubble_1820'
const restart : MoveName = 'restart_word_bubble_2237'

export const config : GeneratorConfig = misc.deepFreeze<GeneratorConfig>({
  id: 'biden_2020_2264',
  debug: {
    enabled: false, // SET THIS TO TRUE TO TEST SPECIFIC INTERACTIONS WITH STATES
    states: [
    ],
  },
  interaction: {
    [yes]: {
      intent: [
        { type: 'booleanPath', priority: 'main' },
        { type: 'counter', name: 'progress', priority: 'main' },
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
  finishedConditionOptions: { counterName: 'progress', restart: true },
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
    states: ['trump2020_2251', 'biden2020_2271'],
    choice: 'random',
    api: RequiredNodeApi.Actor,
  },
  narrative: {
    welcome: [
      {
        debugId: 'welcome.state',
        tags: ['target_actor', 'onroomentered'],
        referenceState: {
          referenceType: 'contextState',
          referenceName: true,
          referenceValue: true,
          api: RequiredNodeApi.Actor,
          granularity: 100,
        },
        conditions: [
          {
            type: 'userState',
            name: '*', // wildcard means insert reference
            value: 0,
            test: 'greaterThan',
            api: RequiredNodeApi.Actor,
          },
        ],
      },
    ],
    interact: [
      {
        tags: ['target_actor', 'onmovetriggered'],
        referenceMove: false,
        //referenceCounterByName: 'progress',
        referenceBooleanPathHistory: true,
        referenceState: {
          referenceType: 'contextState',
          referenceName: true,
          referenceValue: false,
        },
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
