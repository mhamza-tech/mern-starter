import { GeneratorConfig, FinishedCondition, counterDefaults, RequiredNodeApi } from '../engine/types'
import { misc } from 'src/utils'
import { MoveName } from 'src/domain/moves'
import { duration } from 'moment'
import { Actions } from '../../common/types'
import { prizes } from './prizes/fortune_teller_branching_2034/prizes'
import { newsfeed } from './newsfeed/fortune_teller_branching_2034/newsfeed'
import { Engine } from '../engine/engine'
import { ChatRoomActionContextApi } from 'src/types'
import _ from 'lodash'
import { ReactNativeAnimations } from 'src/maker/animations'

//const logger = LoggerFactory('FortuneTellerB', 'NPC')

const yes : MoveName = 'yes_word_bubble_1821'
const no : MoveName = 'no_word_bubble_1820'
const restart : MoveName = 'restart_word_bubble_2237'

const stopLottieIntent = async (api: ChatRoomActionContextApi, engine: Engine) : Promise<any> => {
  return engine.stopLottie(api)
}

export const config : GeneratorConfig = misc.deepFreeze<GeneratorConfig>({
  id: 'fortune_teller_branching_2034',
  debug: {
    enabled: false, // SET THIS TO TRUE TO TEST SPECIFIC INTERACTIONS WITH STATES
    states: [
      {id: 'lucky_2121', value: 0, api: RequiredNodeApi.Actor },
      {id: 'injured_876', value: 0, api: RequiredNodeApi.Actor },
      {id: 'desired_33', value: 0, api: RequiredNodeApi.Actor },
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
        { type: 'custom', callback: stopLottieIntent, priority: 'cleanup' },
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
  //   states: ['lucky_2121', 'desired_33'],
  //   choice: 'random',
  //   // index: 1,
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
  jobConfig: {
    cursedInjured: {
      delay: duration({ hours: _.random(1, 24) }),
      startOnEnter: false,
      action: Actions.CursedInjured,
      cancelOnInteraction: false,
      restartAfterInteraction: false,
    },
    cursedLuck: {
      delay: duration({ hours: _.random(1, 24) }),
      startOnEnter: false,
      conditions: [
        {
          type: 'userState',
          name: 'lucky_2121',
          value: 0,
          test: 'greaterThan',
          api: RequiredNodeApi.Actor,
        },
      ],
      action: Actions.CursedLuck,
      cancelOnInteraction: false,
      restartAfterInteraction: false,
    },
    cursedDesire: {
      delay: duration({ hours: _.random(1, 24) }),
      startOnEnter: false,
      conditions: [
        {
          type: 'userState',
          name: 'desired_33',
          value: 0,
          test: 'greaterThan',
          api: RequiredNodeApi.Actor,
        },
      ],
      action: Actions.CursedDesire,
      cancelOnInteraction: false,
      restartAfterInteraction: false,
    },
    blessedDesired: {
      delay: duration({ hours: _.random(1, 24) }),
      startOnEnter: false,
      conditions: [
        {
          type: 'userState',
          name: 'desired_33',
          value: 100,
          test: 'lessThan',
          api: RequiredNodeApi.Actor,
        },
      ],
      action: Actions.BlessedDesired,
      cancelOnInteraction: false,
      restartAfterInteraction: false,
    },
    blessedLuck: {
      delay: duration({ hours: _.random(1, 24) }),
      startOnEnter: false,
      conditions: [
        {
          type: 'userState',
          name: 'lucky_2121',
          value: 100,
          test: 'lessThan',
          api: RequiredNodeApi.Actor,
        },
      ],
      action: Actions.BlessedLuck,
      cancelOnInteraction: false,
      restartAfterInteraction: false,
    },
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
