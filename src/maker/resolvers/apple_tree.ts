import {
  ActionResolver,
  ChatRoomActionContextApi,
  HashStatusFieldMetadata,
  ActionStubSet,
  NewsfeedItemTemplate,
} from '../types'
import { sf } from '../../utils'
import _ from 'lodash'
import {
  registerReactionFnMap,
  ReactionFnMap,
} from '../../enginev3'
import Bluebird from 'bluebird'
import moment, {
  utc,
  duration,
} from 'moment'
import {
  ChatRoomStates,
  currentStateFieldTemplate,
  pickedTimeFieldTemplate,
  regrowTimeFieldTemplate,
  intervalTimerIdFieldTemplate,
  jsonValueLens,
  numberValueLens,
  isDeletedLens,
  appleTileTemplateFive,
  appleTileTemplateFour,
  appleTileTemplateThree,
  appleTileTemplateTwo,
  appleTileTemplateOne,
  animalAppleTemplate,
  bounceInEffectTemplate,
  appleConfettiTemplate,
  appleNewsFeedTemplate,
} from './apple_tree.assets'
import { imageS3Key } from '../helpers'
import * as fxAddToInventory from '../fx/animation.addtoinventory'
import * as fxRemoveFromInventory from '../fx/animation.removefrominventory'
import * as DebugResetHandler from '../reactions/action.debug.reset'
import * as news from '../news'
import {
  RootGameState,
  getGameState,
  setGameState,
} from '../chatRoomHelpers'
import {
  incUserState,
  getUserState,
} from '../userStates'
import { items } from 'src/domain/items'

const log = console.log
const HOURSTILLREGROWMINS = 240
const INJURYCOUNT = 2
const ENERGYCOUNT = 5

interface GameState extends RootGameState {
  mockCount: number
}
/**
 * State Router
 */

const doStateTransition = (
  nextState: ChatRoomStates,
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  log('doStateTransition')
  return contextApi
    .getChatRoom()
    .saveField(numberValueLens.set(nextState)(currentStateFieldTemplate))
    .then(() => stateActionGroups[nextState].onEnter(contextApi))
    .then(() =>
      contextApi
        .getActor()
        .saveCurrentActionStubs(stateActionGroups[nextState].actionButtons)
    )
}

const getAllStateFields = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  log('getAllStateFields')
  return Bluebird.Promise.props({
    currentState: contextApi
      .getChatRoom()
      .field(currentStateFieldTemplate)
      .then(numberValueLens.get),
    hrsPickedTime: contextApi
      .getChatRoom()
      .field(pickedTimeFieldTemplate)
      .then(numberValueLens.get),
    hrsRegrowTime: contextApi
      .getChatRoom()
      .field(regrowTimeFieldTemplate)
      .then(numberValueLens.get),
    intervalTimer: contextApi
      .getChatRoom()
      .field(intervalTimerIdFieldTemplate)
      .then(jsonValueLens.get),
  })
}

const onActionPickApple = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  return getAllStateFields(contextApi)
    .then(sf.tap(({ currentState }) => log({ currentState })))
    .then(({ currentState }) =>
      doStateTransition(stateActionGroups[currentState].nextState, contextApi)
    )
    .then(() =>
      Promise.all([
        contextApi.getActor().createActionInstance({
          actionName: items.poop_678.name,
          trxDescription: `${contextApi
            .getActor()
            .getName()} picked an apple at the ${contextApi.getUnObject().getName()}`,
        }),

        fxAddToInventory.animate(contextApi, imageS3Key.Apple),
      ])
    )
}

const onEnterStart = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onEnterStart')
  return Promise.resolve(null).then(() =>
    contextApi
      .getChatRoom()
      .saveTiles([
        appleTileTemplateFive,
        appleTileTemplateFour,
        appleTileTemplateThree,
        appleTileTemplateTwo,
        appleTileTemplateOne,
      ])
  )
}

const onEnterInstructions = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  log('onEnterInstructions')
  return Promise.resolve(
    `Welcome to the ${contextApi
      .getUnObject()
      .getName()}! You may pick one apple at a time!`
  )
    .then((message: string) => contextApi.getActor().sendSystemMessage(message))
    .then(() => doStateTransition(ChatRoomStates.Start, contextApi))
}

const onEnterPickFirst = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  return Promise.resolve(
    contextApi
      .getChatRoom()
      .saveTile(isDeletedLens.set(true)(appleTileTemplateFive))
  )
}

const onEnterPickSecond = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  return Promise.resolve(
    contextApi
      .getChatRoom()
      .saveTile(isDeletedLens.set(true)(appleTileTemplateFour))
  )
}

const onEnterPickThird = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  return Promise.resolve(
    contextApi
      .getChatRoom()
      .saveTile(isDeletedLens.set(true)(appleTileTemplateThree))
  )
}

const onEnterPickFourth = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  return Promise.resolve(
    contextApi
      .getChatRoom()
      .saveTile(isDeletedLens.set(true)(appleTileTemplateTwo))
  )
}

const onEnterPickFifth = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  return (
    Promise.resolve(
      contextApi
        .getChatRoom()
        .saveTile(isDeletedLens.set(true)(appleTileTemplateOne))
    )
      .then(() => contextApi.getChatRoom().saveEffect(appleConfettiTemplate))
      .then(() => doNewsfeedEffects(contextApi))
      .then(() =>
        contextApi.scheduleJob({
          id: `appletree-${moment().unix()}`,
          actionName: 'scheduler.regrowalert',
          dispatchAt: moment().add({ minutes: HOURSTILLREGROWMINS }).toDate(),
        })
      )
      .then(() =>
        Bluebird.Promise.props({
          hrsRegrowTime: moment()
            .add({ minutes: HOURSTILLREGROWMINS })
            .toDate()
            .valueOf(), // epoch ms
        })
      )
      .then(({ hrsRegrowTime }) =>
        Promise.all([
          contextApi
            .getChatRoom()
            .saveField(
              numberValueLens.set(hrsRegrowTime)(regrowTimeFieldTemplate)
            ),
          log(moment(hrsRegrowTime).format('hh:mm a'), 'hrsRegrowTime'),
        ])
      )
      .then(() => doStateTransition(ChatRoomStates.Regrow, contextApi))
  )
}

const onEnterRegrow = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onEnterRegrowing')
  return Promise.resolve(null).then(() => adjustForElaspedTime(contextApi))
}
const adjustForElaspedTime = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  log('adjustForElaspedTime')
  return Promise.resolve(null)
    .then(() => getAllStateFields(contextApi))
    .then(({ currentState, hrsRegrowTime }) => {
      if (_.isEqual(currentState, ChatRoomStates.Regrow)) {
        log(currentState, 'currentState in adjustforElapsed')
        log(moment(new Date()).valueOf(), 'today')
        log(hrsRegrowTime, 'regrowTime in elapsed func')
        if (moment(new Date()).valueOf() >= hrsRegrowTime) {
          return doStateTransition(ChatRoomStates.Start, contextApi)
        } else {
          return doTimerEffects(contextApi, hrsRegrowTime)
        }
      } else {
        return Promise.resolve(null)
      }
    })
}

const doTimerEffects = (
  contextApi: ChatRoomActionContextApi,
  hrsRegrowTime
): Promise<any> => {
  log('timer')
  const now = moment(new Date()).valueOf()
  log(hrsRegrowTime, 'hrsregrow in timer fx')
  const timeRemaining = moment
    .duration(moment(hrsRegrowTime).diff(now))
    .as('minutes')
  log(timeRemaining, 'timeRemaining')
  const formatTimeRemaining = utc(
    duration(timeRemaining, 'minutes').asMilliseconds()
  ).format('H[h]m[m]')

  return contextApi
    .getActor()
    .sendSystemMessage(
      `Apples will be ripe for picking in ${formatTimeRemaining}`
    )
}

const doNewsfeedEffects = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  log('inside news card rendering')
  return contextApi.saveNewsfeedItem(
    _.chain(appleNewsFeedTemplate)
      .thru(news.rateIdLens.set(contextApi.getActor().getEid()))
      .thru(
        news.metadataStatusTextLens.set(
          '**[{{ name actor }}]({{ rawProfileLink actor }})** picked all the **apples** from **[{{ name unObject }}]({{ rawProfileLink unObject }})**!'
        )
      )
      .thru(news.metadataImageLens.set({ s3Key: 'action/color/apple.png' }))
      .thru(news.metadataActorEidLens.set(contextApi.getActor().getEid()))
      .thru(news.metadataUnObjectEidLens.set('unobject/npc.appletree'))
      .thru(news.metadataIsNewLens.set(true))
      .value() as NewsfeedItemTemplate
  )
}

const onSchedulerEventAlert = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  return Promise.resolve(
    contextApi.getActor().sendNotification({
      title: `${contextApi.getUnObject().getName()}`,
      body: 'The apples have grown back!',
    })
  ).then(() => doStateTransition(ChatRoomStates.Start, contextApi))
}

const onActionKickTree = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  return onActionProbability(contextApi)
}

const getGoldenApple = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('golden apple')
  return Promise.resolve(
    contextApi
      .getActor()
      .createActionInstance({
        actionName: items.rainbow_poop_1619.name,
        trxDescription: `${contextApi
          .getActor()
          .getName()} found a golden apple at the ${contextApi.getUnObject().getName()}`,
      })
      .then(() =>
        contextApi
          .getActor()
          .sendSystemMessage('Lucky you! You just received a golden apple!!')
      )
      .then(() => fxAddToInventory.animate(contextApi, imageS3Key.GoldenApple))
  )
}

const getFallenAnimal = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  return (
    Promise.resolve(null)
      .then(() =>
        contextApi.getActor().readActionInstances(items.poop_678.name)
      )
      .then(instances => {
        if (instances.length < 2) {
          return incUserState(contextApi.getActor(), 'injured_876', INJURYCOUNT)
            .then(() =>
              contextApi
                .getActor()
                .sendSystemMessage(
                  'Oh no! You have no apples. The platypus bit you!'
                )
            )
        } else {
          return Promise.resolve(null)
            .then(() =>
              contextApi
                .getActor()
                .readActionInstances(items.poop_678.name)
            )
            .then(instances => {
              if (instances.length >= 2) {
                return contextApi
                  .getActor()
                  .sendSystemMessage(
                    'Uh oh! You\'ve awakened a hungry platypus! Say goodbye to two of your apples.'
                  )
                  .then(() => Promise.all([
                    contextApi.getActor().deleteActionInstance({
                      actionName: items.poop_678.name,
                      trxDescription: 'your apple was eaten',
                    }),
                    contextApi.getActor().deleteActionInstance({
                      actionName: items.poop_678.name,
                      trxDescription: 'your apple was eaten',
                    }),
                  ]))
                  .then(() => fxRemoveFromInventory.animate(contextApi, imageS3Key.Apple))
                  .then(() => fxRemoveFromInventory.animate(contextApi, imageS3Key.Apple))
              } else {
                return Promise.resolve(undefined)
              }
            })
        }
      })
      .then(() => contextApi.getChatRoom().saveTile(animalAppleTemplate))
      .then(() =>
        contextApi
          .getChatRoom()
          .saveEffectOnTile(bounceInEffectTemplate, animalAppleTemplate)
      )
      .then(sf.pause(3 * 1000))
      .then(() =>
        contextApi
          .getChatRoom()
          .saveTile(isDeletedLens.set(true)(animalAppleTemplate))
      )
  )
}

const onActionMock = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const allPromises = []
  const taunts = [
    'Looks like you just stubbed your toe. Hope you learned your lesson!',
    'Oooh... everyone check out the tough guy, thinking he can beat up a tree!',
    'You just sacrificed your dignity to the tree gods. Tree gods thank you for your sacrifice.',
    'Hmm... looks like nothing happened',
    'You might just be barking up the wrong tree',
    'Good job, maplehead!',
    'Time to make like a leaf and...scram',
    'Kick harder next time?',
    'OW! Trees have feelings, you know!',
    'Maybe try again later',
  ]

  getGameState(contextApi).then(({ mockCount = 0 }: GameState) => {
    if (mockCount <= taunts.length) {
      mockCount++
      setGameState(contextApi, { mockCount: mockCount })
    } else {
      mockCount = 0
      setGameState(contextApi, { mockCount: 0 })
    }

    if (mockCount <= taunts.length) {
      contextApi
        .getActor()
        .sendSystemMessage(taunts[Math.min(mockCount - 1, taunts.length - 1)])
    }
    log(taunts.length, 'taunts length')
    log(mockCount, 'mockCount')
    return Promise.resolve(null)
  })
  return Promise.all(allPromises)
}

const onActionProbability = (
  contextApi: ChatRoomActionContextApi
): Promise<any> => {
  const CHANCE_OF_ANIMAL = 25 / 100
  const rando = Math.random()
  log(rando, 'rando')
  return Promise.resolve(
    getUserState(contextApi.getActor(), 'energized_305').then(
      (metadata: HashStatusFieldMetadata) => {
        if (metadata.numberValue >= ENERGYCOUNT) {
          return getGoldenApple(contextApi)
        } else if (
          metadata.numberValue < ENERGYCOUNT &&
          rando < CHANCE_OF_ANIMAL
        ) {
          return getFallenAnimal(contextApi)
        } else return onActionMock(contextApi)
      }
    )
  )
}

/**
 * Long-pressing the user's avatar in the upper-right of the Chat Room will
 * execute the 'Action.Debug.Reset' action, which is wired up to this method.
 *
 * @param contextApi
 */
const onActionReset = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onReset')
  return Promise.resolve([
    contextApi.getActor().sendSystemMessage('RESET!'),
  ]).then(() => doStateTransition(ChatRoomStates.Instructions, contextApi))
}

const onEnter = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onEnter')
  getGameState(contextApi).then((gameState: GameState) =>
    log(gameState.mockCount, 'mockCount')
  )

  return Promise.resolve(
    contextApi.getChatRoom().field(currentStateFieldTemplate)
  )
    .then(numberValueLens.get)
    .then((currentState: ChatRoomStates) =>
      doStateTransition(currentState, contextApi)
    )
}
/**
 * The NPC's unObjectId for this handler module.
 * Each handler module is associated with a specific NPC.
 */
const unObjectId = 'apple_tree_338'

/**
 * The ActionStubSet to show in the action sheet in this ChatRoom.
 * You can have multiple ActionStubSets.
 * An ActionStubSet is streamed down to the app via:
 *      contextApi.getActor().saveCurrentActionStubs( actionStubSet )
 */
export const actionStubSet: ActionStubSet = {
  staticActionNames: ['action.appletree.pick', 'action.appletree.kick'],
}

/**
 * Mapping from state => action set
 */
export const stateActionGroups = {
  [ChatRoomStates.Instructions]: {
    onEnter: onEnterInstructions,
    nextState: ChatRoomStates.Start,
    actionButtons: {
      staticActionNames: ['action.appletree.pick', 'action.appletree.kick'],
    } as ActionStubSet,
  },
  [ChatRoomStates.Start]: {
    onEnter: onEnterStart,
    nextState: ChatRoomStates.PickFirst,
    actionButtons: {
      staticActionNames: ['action.appletree.pick', 'action.appletree.kick'],
    } as ActionStubSet,
  },
  [ChatRoomStates.PickFirst]: {
    onEnter: onEnterPickFirst,
    nextState: ChatRoomStates.PickSecond,
    actionButtons: {
      staticActionNames: ['action.appletree.pick', 'action.appletree.kick'],
    } as ActionStubSet,
  },
  [ChatRoomStates.PickSecond]: {
    onEnter: onEnterPickSecond,
    nextState: ChatRoomStates.PickThird,
    actionButtons: {
      staticActionNames: ['action.appletree.pick', 'action.appletree.kick'],
    } as ActionStubSet,
  },
  [ChatRoomStates.PickThird]: {
    onEnter: onEnterPickThird,
    nextState: ChatRoomStates.PickFourth,
    actionButtons: {
      staticActionNames: ['action.appletree.pick', 'action.appletree.kick'],
    } as ActionStubSet,
  },
  [ChatRoomStates.PickFourth]: {
    onEnter: onEnterPickFourth,
    nextState: ChatRoomStates.PickFifth,
    actionButtons: {
      staticActionNames: ['action.appletree.pick', 'action.appletree.kick'],
    } as ActionStubSet,
  },
  [ChatRoomStates.PickFifth]: {
    onEnter: onEnterPickFifth,
    nextState: ChatRoomStates.Regrow,
    actionButtons: {
      staticActionNames: ['action.appletree.pick', 'action.appletree.kick'],
    } as ActionStubSet,
  },
  [ChatRoomStates.Regrow]: {
    onEnter: onEnterRegrow,
    nextState: ChatRoomStates.Start,
    actionButtons: {
      staticActionNames: ['action.appletree.kick'],
    } as ActionStubSet,
  },
}

/**
 * This wires up the reaction functions in this module to the action router.
 * This method should be called from onLoad.
 */
const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {
    [DebugResetHandler.NAME]: onActionReset,
    'action.appletree.pick': onActionPickApple,
    'action.appletree.kick': onActionKickTree,
    'action.appletree.animal': getFallenAnimal,
    'scheduler.regrowalert': onSchedulerEventAlert,
  } as ReactionFnMap)
}

/**
 * All handler modules export an ActionResolver object.
 */
const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onReset: null,
  onLoad: registerReactionFns,
}

export default actionResolver
