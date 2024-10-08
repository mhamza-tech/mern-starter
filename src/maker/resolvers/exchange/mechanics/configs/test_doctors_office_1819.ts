import { GeneratorConfig, FinishedCondition, counterDefaults, CustomIntentParams, GeneratorEngineState, RequiredNodeApi } from '../engine/types'
import { misc } from 'src/utils'
import { MoveName } from 'src/domain/moves'
import { ChatRoomActionContextApi } from 'src/types'
import { getCounter } from 'src/maker/counters'
import { LoggerFactory } from 'src/utils/logger'
import { Engine } from '../engine/engine'

// THIS CONFIG IS NOT USED. I'm switching it in manually when I want to add
// new features to the engine and then check that the two in production NPCs
// running on this system are unaffected.

const logger = LoggerFactory('Doctor', 'NPC')

const yes : MoveName = 'yes_word_bubble_1821'
const no : MoveName = 'no_word_bubble_1820'

const debugIntent = async (api: ChatRoomActionContextApi, engine: Engine, actionName: string, intentParams: CustomIntentParams, state: GeneratorEngineState) : Promise<any> => {
  const promises : Promise<number>[] = []
  Object.keys(intentParams.counters).map((key) => {
    const counter = intentParams.counters[key]
    const counterValue = getCounter(counter.api === RequiredNodeApi.Actor
      ? api.getActor()
      : api.getChatRoom(),
    counter.tags)
    promises.push(counterValue)
  })
  const results = await Promise.all(promises)
  const counterDebug = Object.keys(intentParams.counters).map((key, index) => `Counter Name: ${key}, value: ${results[index]}`)
  logger.info('Called DebugIntent')
  logger.info('api:', api ? 'valid' : 'invalid')
  logger.info('actionName:', actionName)
  logger.info('counters:', counterDebug)
  logger.info('engineState', intentParams.sessionStatus)
  logger.info('state:', state)
  return null
}

export const config : GeneratorConfig = misc.deepFreeze<GeneratorConfig>({
  id: 'doctors_office_1819',
  interaction: {
    [yes]: {
      intent: [
        { type: 'booleanPath', priority: 'main' },
        { type: 'counter', name: 'progress', priority: 'main' }, // TODO progress is not getting used in the showString
        { type: 'custom', callback: debugIntent, priority: 'cleanup' },
      ],
      booleanChoice: 'yes',
    },
    [no]: {
      intent: [
        { type: 'booleanPath', priority: 'main'  },
        { type: 'counter', name: 'progress', priority: 'main'  },
        { type: 'custom', callback: debugIntent, priority: 'after'  },
      ],
      booleanChoice: 'no',
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
  prizes: [
    {
      id: 'prize.set.1',
      prizeType: 'item',
      prizes: ['savage_boba_tea_86'],
      stock: 1,
      conditions: [
        {
          type: 'booleanPath',
          value: [
            ['yes', 'yes', 'yes'],
          ],
          test: 'equalTo',
        },
      ],
    },
    {
      id: 'prize.set.2',
      prizeType: 'hashtribute',
      prizes: ['gives_a_shit_1699'],
      conditions: [
        {
          type: 'booleanPath',
          value: [
            ['no', 'no', 'no'],
          ],
          test: 'equalTo',
        },
      ],
    },
    {
      id: 'prize.set.3',
      prizeType: 'item',
      prizes: ['artisanal_brioche_bun_8', 'avocado_9'],
      stock: 1,
      conditions: [
        {
          type: 'booleanPath',
          value: [
            ['yes', 'yes', 'no'],
            ['no', 'yes', 'yes'],
          ],
          test: 'equalTo',
        },
      ],
    },
    {
      id: 'prize.set.4',
      prizeType: 'item',
      prizes: ['beef_chicken_taco_1587', 'beef_shit_taco_1623', 'condom_1577', 'dildo_1649'],
      chances: [50, 75, 90, 100], //ex 50% chance of getting beef taco, 25% beef+shit, 15% condom, 10% dildo
      stock: 1,
      conditions: [
        {
          type: 'booleanPath',
          value: [
            ['yes', 'no', 'no'],
            ['no', 'no', 'yes'],
          ],
          test: 'equalTo',
        },
      ],
    },
    {
      id: 'prize.set.5',
      prizeType: 'stateChange',
      prizes: ['wasted_304', 'desired_33'],
      chances: [50, 100],
      stateModifiers: [20, 20],
      stock: 1,
      conditions: [
        {
          type: 'booleanPath',
          value: [
            ['yes', 'no', 'yes'],
            ['no', 'yes', 'no'],
            ['yes', 'yes', 'no'],
          ],
          test: 'equalTo',
        },
      ],
    },
  ],
  narrative: {
    welcome: [
      {
        tags: ['target_actor', 'onroomentered'],
      },
    ],
    interact: [
      {
        tags: ['target_actor', 'onmovetriggered'],
        referenceMove: false,
        referenceCounterByName: 'progress',  
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
          },
        ],  
      },
    ],
    // disabled for now
    // sessionOver: {
    //   tags: ['target_actor', 'onnpcsessioncompleted'],
    // },
  },
  globalCooldown: false,
  offerSessionRestart: false,
})
