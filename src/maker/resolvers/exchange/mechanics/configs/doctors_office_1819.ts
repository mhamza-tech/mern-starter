import { GeneratorConfig, FinishedCondition, counterDefaults, RequiredNodeApi } from '../engine/types'
import { misc } from 'src/utils'
import { MoveName } from 'src/domain/moves'
import { prizes } from './prizes/doctors_office_1819/prizes'
import { ReactNativeAnimations } from 'src/maker/animations'
//import { newsfeed } from './newsfeed/doctors_office_1819/newsfeed'

const yes : MoveName = 'yes_word_bubble_1821'
const no : MoveName = 'no_word_bubble_1820'
const restart : MoveName = 'restart_word_bubble_2237'

// const debugIntent = async (api: ChatRoomActionContextApi, actionName: string, intentParams: CustomIntentParams, state: GeneratorEngineState) : Promise<any> => {
//   const promises : Promise<number>[] = []
//   Object.keys(intentParams.counters).map((key) => {
//     const counter = intentParams.counters[key]
//     const counterValue = getCounter(counter.api === RequiredNodeApi.Actor
//       ? api.getActor()
//       : api.getChatRoom(),
//     counter.tags)
//     promises.push(counterValue)
//   })
//   const results = await Promise.all(promises)
//   const counterDebug = Object.keys(intentParams.counters).map((key, index) => `Counter Name: ${key}, value: ${results[index]}`)
//   logger.info('Called DebugIntent')
//   logger.info('api:', api ? 'valid' : 'invalid')
//   logger.info('actionName:', actionName)
//   logger.info('counters:', counterDebug)
//   logger.info('engineState', intentParams.sessionStatus)
//   logger.info('state:', state)
//   return null
// }

export const config : GeneratorConfig = misc.deepFreeze<GeneratorConfig>({
  id: 'doctors_office_1819',
  debug: {
    enabled: false, // SET THIS TO TRUE TO TEST SPECIFIC INTERACTIONS WITH STATES
    states: [
      {id: 'wasted_304', value: 0, api: RequiredNodeApi.Actor },
      {id: 'injured_876', value: 0, api: RequiredNodeApi.Actor },
      {id: 'puking_from_magic_mushrooms_2078', value: 0, api: RequiredNodeApi.Actor },
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
  //newsfeed,
  stateContext: {
    states: ['wasted_304', 'injured_876', 'puking_from_magic_mushrooms_2078'],
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
