import { GeneratorConfig, FinishedCondition, counterDefaults, RequiredNodeApi } from '../engine/types'
import { misc } from 'src/utils'
import { MoveName } from 'src/domain/moves'
import { prizes } from './prizes/bigfoot_branching_2047/prizes'
import { newsfeed } from './newsfeed/bigfoot_branching_2047/newsfeed'
import { ReactNativeAnimations } from 'src/maker/animations'

//const logger = LoggerFactory('BigfootB', 'NPC')

const yes : MoveName = 'yes_word_bubble_1821'
const no : MoveName = 'no_word_bubble_1820'
const restart : MoveName = 'restart_word_bubble_2237'

export const config : GeneratorConfig = misc.deepFreeze<GeneratorConfig>({
  id: 'bigfoot_branching_2047',
  debug: {
    enabled: false, // SET THIS TO TRUE TO TEST SPECIFIC INTERACTIONS WITH STATES
    states: [
      {id: 'zen_1182', value: 0, api: RequiredNodeApi.Actor },
      {id: 'horny_48', value: 20, api: RequiredNodeApi.Actor },
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
  // disabled alt states for now
  // stateContext: {
  //   states: ['zen_1182', 'horny_48'],
  //   choice: 'random',
  //   api: RequiredNodeApi.Actor,
  // },
  narrative: {
    welcome: [
      {
        debugId: 'welcome.wasted',
        tags: ['target_actor', 'onroomentered'],
        referenceState: {
          referenceType: 'contextState',
          referenceName: true,
          referenceValue: true,
          api: RequiredNodeApi.Actor,
          granularity: 20,
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
      { // fallback
        debugId: 'welcome.default',
        tags: ['target_actor', 'onroomentered'],
      },
    ],
    interact: [ // this is where we will have several options all involving state where the narrative makes sense
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
    // disabled for now
    // sessionOver: {
    //   tags: ['target_actor', 'onnpcsessioncompleted'],
    // },
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
