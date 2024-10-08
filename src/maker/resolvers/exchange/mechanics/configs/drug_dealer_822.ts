import { GeneratorConfig, counterDefaults, FinishedCondition, RequiredNodeApi, EngineStatus, CounterState } from '../engine/types'
import { misc } from 'src/utils'
import { duration } from 'moment'
import { Actions } from '../../common/types'
import { prizes } from './prizes/drug_dealer_822/prizes'
import { newsfeed } from './newsfeed/drug_dealer_822/newsfeed'
import { ReactNativeAnimations } from 'src/maker/animations'

const lick = 'lick_54'
const poke = 'poke_75'
const hug = 'hug_50'
const tickle = 'fake_tickle_torture_1684'

export const config : GeneratorConfig = misc.deepFreeze<GeneratorConfig>({
  id: 'drug_dealer_822',
  debug: {
    enabled: false, // SET THIS TO TRUE TO TEST SPECIFIC INTERACTIONS WITH STATES
    states: [
      {id: 'wasted_304', value: 0, api: RequiredNodeApi.Room },
    ],
  },
  counters: {
    [lick]: misc.defaultsDeep({
      tags: [lick],
      max: 3,
    }, counterDefaults),
    [poke]: misc.defaultsDeep({
      tags: [poke],
      max: 3,
    }, counterDefaults),
    [hug]: misc.defaultsDeep({
      tags: [hug],
      max: 3,
    }, counterDefaults),
  },
  interaction: {
    [tickle]: {
      intent: [
        { type: 'counter', name: tickle, priority: 'main' },
        { type: 'moveMessage', priority: 'main' },
      ],
      initiallyDisabled: true,
    },
    [lick]: {
      intent: [
        { type: 'counter', name: lick, priority: 'main' },
        { type: 'moveMessage', priority: 'main' },
        { type: 'animateNpc', priority: 'main' },
      ],
      disableAtCounterMax: false,
    },
    [poke]: {
      intent: [
        { type: 'counter', name: poke, priority: 'main' },
        { type: 'moveMessage', priority: 'main' },
        { type: 'animateNpc', priority: 'main' },
      ],
      disableAtCounterMax: false,
    },
    [hug]: {
      intent: [
        { type: 'counter', name: hug, priority: 'main' },
        { type: 'moveMessage', priority: 'main' },
        { type: 'animateNpc', priority: 'main' },
      ],
      disableAtCounterMax: false,
    },
  },
  finishedCondition: FinishedCondition.AllCountersMax,
  prizes,
  newsfeed,
  newsfeedRateLimit: { days: 1 },
  narrative: {
    welcome: [
      {
        debugId: 'welcome',
        tags: ['target_actor', 'onroomentered'],
        referenceState: {
          referenceType: 'namedState',
          referenceName: true,
          referenceValue: true,
          userStateId: 'wasted_304',
          api: RequiredNodeApi.Room,
          granularity: 20,
        },
        conditions: [
          {
            type: 'userState',
            name: 'wasted_304', // wildcard means insert reference
            value: 100,
            test: 'lessThan',
          },
        ],
      },
    ],
    interact: [
      {
        debugId: 'interact',
        tags: ['target_actor', 'onmovetriggered'],
        referenceMove: true,  // lick, counter condition not met
        referenceCounterByInteraction: true,
        conditions: [
          {
            type: 'counterValue',
            name: '*', // wildcard means insert reference
            value: 3,
            test: 'lessThan',
          },
        ],
      },
    ],
    reward: [
      {
        debugId: 'reward',
        tags: ['target_actor', 'rewarded'],
        referenceMove: true,  // lick, counter condition not met
        conditions: [
          {
            type: 'counterState',
            name: '*',
            value: CounterState.Active,
            test: 'equalTo',
          },
          {
            type: 'counterValue',
            name: '*', // wildcard means insert reference
            value: 3,
            test: 'equalTo',
          },
        ],
      },
    ],
    outOfStock: [
      {
        debugId: 'outOfStock',
        tags: ['target_actor', 'onmovetriggered'], // Jose is out of stock of that item
        referenceMove: true,
        referenceCounterByInteraction: true,
        conditions: [
          {
            type: 'counterState',
            name: '*', // wildcard means insert reference
            value: CounterState.AtMaximum,
            test: 'equalTo',
          },
        ],
      },
    ],
    sessionOver: [
      {
        debugId: 'sessionOver',
        tags: ['target_actor', 'onnpcsessioncompleted'], // 'end game' all counters met
        conditions: [
          {
            type: 'session',
            value: EngineStatus.SessionFinished,
            test: 'equalTo',
          },
        ],
      },
    ],
    roomStateMaximum: [
      {
        debugId: 'roomStateMaximum',
        tags: ['target_actor', 'warning'], // 'end game - wasted
        conditions: [
          {
            type: 'userState',
            name: 'wasted_304',
            value: 100,
            test: 'equalTo',
            api: RequiredNodeApi.Room,
          },
        ],
      },
    ],
    smoking: [
      {
        debugId: 'Job: smoking',
        tags: ['target_actor', 'good_vibes'], // jose is smoking
      },
    ],
  },
  jobConfig: {
    smoking: {
      delay: duration({ seconds: 30 }),
      startOnEnter: true,
      conditions: [
        {
          type: 'userState',
          name: 'wasted_304',
          value: 100,
          test: 'lessThan',
          api: RequiredNodeApi.Room,
        },
      ],
      action: Actions.Smoking,
      cancelOnInteraction: true,
      restartAfterInteraction: true,
    },
  },
  npcAnimationMap: {
    [lick]: {
      animation: ReactNativeAnimations.Bounce,
      duration: 2000,
    },
    [poke]: {
      animation: ReactNativeAnimations.Tada,
      duration: 2000,
    },
    [hug]: {
      animation: ReactNativeAnimations.Pulse,
      duration: 2000,
    },
  },
  globalCooldown: false,
  offerSessionRestart: false,
})
