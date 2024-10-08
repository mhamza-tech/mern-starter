import {
  ActionResolver,
  ChatRoomActionContextApi,
  NewsfeedItemTemplate,
} from '../types'
import Bluebird from 'bluebird'
import moment from 'moment'
import { sf } from '../../utils'
import _ from 'lodash'
import { harvestedStrawberriesCounterFieldTemplate } from '../global.user.states'
import {
  registerReactionFnMap,
  ReactionFnMap,
} from '../../enginev3'
import * as news from '../news'
import { imageS3Key } from '../helpers'
import * as fxAddToInventory from '../fx/animation.addtoinventory'
import * as fxSixtySecondTimer from '../fx/animation.sixtysecondtimer'
// import {  sixtySecondTimerSequenceEffectTemplate } from '../fxHelpers'
import { incrementUserXP } from '../experiencePoints'
import {
  currentStateFieldTemplate,
  plantedTimeFieldTemplate,
  harvestTimeFieldTemplate,
  spoiledTimeFieldTemplate,
  intervalTimerIdFieldTemplate,
  harvestedSequenceEffectTemplate,
  spoilSequenceEffectTemplate,
  bloomImageTileTemplate,
  bloomTextTileTemplate,
  numberValueLens,
  ChatRoomStates,
  isDeletedLens,
  jsonValueLens,
} from './npc.strawberrypatch.assets'

import * as DebugResetHandler from '../reactions/action.debug.reset'
import { items } from 'src/domain/items'

const log = console.log
const unObjectId = 'strawberry_patch_1644'
const secondsTillHarvest = 60 * 1
const secondsTillSpoil = 60 * 10

/**
 * State Router
 */

const doStateTransition = (nextState: ChatRoomStates, contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('doStateTransition')
  return contextApi.getChatRoom().saveField(numberValueLens.set(nextState)(currentStateFieldTemplate))
    // .then(() => doStateRouting(contextApi))
    // .then(() => getAllStateFields(contextApi))
    // .then(sf.tap((allFields: any) => logAllStateFields(allFields)))
    .then(() => stateActionGroups[nextState].onEnter(contextApi))
    .then(() => updateActionsButtons(contextApi))
}

/**
 * Helpers
 */

const getAllStateFields = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('getAllStateFields')
  return Bluebird.Promise
    .props({
      currentState: contextApi.getChatRoom().field(currentStateFieldTemplate).then(numberValueLens.get),
      msPlantedTime: contextApi.getChatRoom().field(plantedTimeFieldTemplate).then(numberValueLens.get),
      msHarvestTime: contextApi.getChatRoom().field(harvestTimeFieldTemplate).then(numberValueLens.get),
      msSpoilTime: contextApi.getChatRoom().field(spoiledTimeFieldTemplate).then(numberValueLens.get),
      intervalTimer: contextApi.getChatRoom().field(intervalTimerIdFieldTemplate).then(jsonValueLens.get),
    })
}

/**
 * Transistional State Handlers
 */

const onEnterInstructions = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onEnterInstructions')
  return Promise
    .resolve(`Welcome to the ${contextApi.getUnObject().getName()}! Plant seeds, grow strawberries and profit from your crops.`)
    // .then(sf.tap((message: string) => log({ message })))
    .then((message: string) => contextApi.getActor().sendSystemMessage(message))
    .then(() => doStateTransition(ChatRoomStates.Start, contextApi))
}

const onEnterStart = (): Promise<any> => {
  log('onEnterStart')
  return Promise
    .resolve(null)
  // .resolve(`You've Entered Start State`)
  // .then(sf.tap((message: string) => log({ message })))
  // .then(sf.tap((message: string) => contextApi.getActor().sendSystemMessage(message)))
  // .then(() => updateActionsButtons(contextApi))
}

const onEnterGrow = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onEnterGrowing')
  return Promise
    .resolve(`You've planted strawberry seeds! Crops will be harvestable in ${secondsTillHarvest} seconds.`)
    .then(sf.tap((message: string) => log({ message })))
    .then(sf.tap((message: string) => contextApi.getActor().sendSystemMessage(message)))
    // .then(() => contextApi.getChatRoom().saveTile(textValueLens.set('Planted')(bloomImageTileTemplate)))
    // .then(() => updateActionsButtons(contextApi))

    .then(() => doTimerEffects(contextApi, 0))
    .then(() => incrementUserXP(contextApi.getActor(), 1))
    .then(() => new Date())
    .then((currentDate: Date) => Bluebird.Promise.props({
      msPlantedTime: moment(currentDate).valueOf(), // epoch ms
      msHarvestTime: moment(currentDate).add({ seconds: secondsTillHarvest }).valueOf(), // epoch ms
      msSpoilTime: moment(currentDate).add({ seconds: secondsTillHarvest + secondsTillSpoil }).valueOf(), // epoch ms
    }))
    .then(({ msPlantedTime, msHarvestTime, msSpoilTime }) => Promise.all([
      contextApi.getChatRoom().saveField(numberValueLens.set(msPlantedTime)(plantedTimeFieldTemplate)),
      contextApi.getChatRoom().saveField(numberValueLens.set(msHarvestTime)(harvestTimeFieldTemplate)),
      contextApi.getChatRoom().saveField(numberValueLens.set(msSpoilTime)(spoiledTimeFieldTemplate)),
    ]))
    .then(() => contextApi.scheduleJob({
      id: `strawberrypatch-${moment().unix()}`,
      actionName: 'scheduler.harvestalert',
      dispatchAt: moment().add({ seconds: secondsTillHarvest }).toDate(),
    }))
  // .then(() => createIntervalTimer(contextApi))
  // .then(() => getAllStateFields(contextApi))
  // .then(sf.tap((allFields: any) => logAllStateFields(allFields)))
}

const onEnterHarvest = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onEnterHarvest')
  return Promise
    .resolve('You can harvest your crops now.')
    .then(sf.tap((message: string) => log({ message })))
    .then(sf.tap((message: string) => contextApi.getActor().sendSystemMessage(message)))
  // .then(() => contextApi.getChatRoom().saveTile(textValueLens.set('Bloomed!')(bloomImageTileTemplate)))
  // .then(() => updateActionsButtons(contextApi))
  // .then(() => getAllStateFields(contextApi))
  // .then(sf.tap((allFields: any) => logAllStateFields(allFields)))
}

const onEnterSpoil = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onEnterSpoil')
  return Promise
    .resolve(null)
    // .resolve(`Your crops have spoiled`)
    // .then(sf.tap((message: string) => log({ message })))
    // .then(sf.tap((message: string) => contextApi.getActor().sendSystemMessage(message)))
    // .then(() => contextApi.getChatRoom().saveTile(textValueLens.set('Spoiled')(bloomImageTileTemplate)))
    // .then(() => updateActionsButtons(contextApi))
    .then(() => contextApi.getChatRoom().saveEffect(spoilSequenceEffectTemplate))
    .then(() => doStateTransition(ChatRoomStates.Start, contextApi))
}

const onEnterPick = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onEnterPick')
  return Promise
    .resolve(null)
    .then(() => Promise.all([
      // updateActionsButtons(contextApi),
      incrementUserXP(contextApi.getActor(), 10),
      contextApi.getChatRoom().saveEffect(harvestedSequenceEffectTemplate),
      // contextApi.getChatRoom().saveTile(isDeletedLens.set(true)(bloomImageTileTemplate)),
      doRewardActionEffects(contextApi),
      contextApi.getActor().incrementField(harvestedStrawberriesCounterFieldTemplate, 1)
        .then(numberValueLens.get)
        .then(sf.tap((numberValue: number) => log('onEnterPick, harvestedStrawberriesCounterFieldTemplate=', { numberValue }))),
    ]))
    .then(() => doNewsfeedEffects(contextApi))
    .then(() => doStateTransition(ChatRoomStates.Start, contextApi))
}

/** 
 * Local Action Handlers
 */

const onActionPlantSeed = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise
    .resolve(null)
    .then(() => doStateTransition(ChatRoomStates.Grow, contextApi))
}

const onActionHarvest = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise
    .resolve(null)
    .then(() => doStateTransition(ChatRoomStates.Pick, contextApi))
}

const onActionReset = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onPlayerActionReset')
  return Promise
    .all([
      contextApi.getChatRoom().saveField(numberValueLens.set(0)(plantedTimeFieldTemplate)),
      contextApi.getChatRoom().saveField(numberValueLens.set(0)(harvestTimeFieldTemplate)),
      contextApi.getChatRoom().saveField(numberValueLens.set(0)(spoiledTimeFieldTemplate)),
      contextApi.getActor().saveField(numberValueLens.set(0)(harvestedStrawberriesCounterFieldTemplate)),
      // contextApi.getChatRoom().saveTiles([
      //     isDeletedLens.set(true)(bloomImageTileTemplate),
      //     isDeletedLens.set(true)(bloomTextTileTemplate)
      // ])

      contextApi.getChatRoom().saveTiles([
        isDeletedLens.set(true)(bloomImageTileTemplate),
        isDeletedLens.set(true)(bloomTextTileTemplate),
      ]),

      // fxSixtySecondTimer.remove(contextApi)

    ])
    .then(() => doStateTransition(ChatRoomStates.Instructions, contextApi))
}

/**
 * 
 * Scheduler Callback Handlers
 */

const onSchedulerEventHarvestAlert = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise
    .resolve(null)
    .then(() => adjustForElaspedTime(contextApi))

    // .then(() => contextApi.getActor().sendSystemMessage(`Your strawberries are ready for harvesting!`))
    .then(() => contextApi.getActor().sendNotification({
      title: `${contextApi.getUnObject().getName()}`,
      body: 'Your crops are ready for harvesting!',
    }))
}

/**
 * Local Business Logic
 */

const adjustForElaspedTime = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('adjustForElaspedTime')
  return Promise
    .resolve(null)
    .then(() => getAllStateFields(contextApi))
    // .then(sf.tap((allFields: any) => logAllStateFields(allFields)))
    .then(({ currentState, msHarvestTime, msSpoilTime }) => {
      if (_.isEqual(currentState, ChatRoomStates.Grow)) {
        if (_.inRange(moment(new Date).valueOf(), msHarvestTime, msSpoilTime)) {
          // the crops are harvestable, so change state to Harvest
          return doStateTransition(ChatRoomStates.Harvest, contextApi)
        } else if (moment(new Date).valueOf() > msSpoilTime) {
          return doStateTransition(ChatRoomStates.Spoil, contextApi)
        } else {
          // then it is still growing
          const secondsRemainingInThisMinute = 60 - (moment(msHarvestTime).diff(new Date, 'seconds') % 60)
          return doTimerEffects(contextApi, secondsRemainingInThisMinute)
        }
      }
      return Promise.resolve(null)
    })
}

const doRewardActionEffects = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.all([
    contextApi.getActor().createActionInstance({
      actionName: items.magic_mushroom_608.name,
      trxDescription: `Grown at ${contextApi.getUnObject().getName()}`,
    }),
    // playerHelpers.incrementActionButtonInventoryWait(contextApi.getActor(), RewardedStrawberryHandler.NAME, 1)
    ,
    fxAddToInventory.animate(contextApi, imageS3Key.RainbowBrick),
  ])
}

const doTimerEffects = (contextApi: ChatRoomActionContextApi, startAt: number): Promise<any> => {
  return Promise
    .resolve(null)
    .then(() => fxSixtySecondTimer.animate(contextApi, startAt))
}

const doNewsfeedEffects = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise
    .resolve(null)
    .then(() => contextApi.getActor().field(harvestedStrawberriesCounterFieldTemplate))
    .then(numberValueLens.get)
    // .then(sf.tap((numberValue: number) => log(`doNewsfeedEffects, harvestedStrawberriesCounterFieldTemplate=`, { numberValue })))
    .then(sf.thru_if((numberValue: number) => numberValue == 1)(
      () => {
        log('inside news card rendering')
        return contextApi.saveNewsfeedItem(
          _.chain(news.NewsfeedItemUnObjectImageTemplate)
            .thru(news.metadataStatusTextLens.set('**[{{ name actor }}]({{ rawProfileLink actor }})** harvested {{ hisher actor }} first **Strawberry**!'))
            .thru(news.metadataImageLens.set({ s3Key: 'mp4/strawberryfarmer.mp4' }))
            .thru(news.metadataActorEidLens.set(contextApi.getActor().getEid()))
            .thru(news.metadataUnObjectEidLens.set('unobject/npc.jt.blue.joe'))
            .thru(news.metadataIsNewLens.set(true))
            .value() as NewsfeedItemTemplate
        )
      })
    )
}

const updateActionsButtons = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.resolve(null)
    .then(() => contextApi.getChatRoom().field(currentStateFieldTemplate))
    .then(numberValueLens.get)
    // -rx- .then((currentState: ChatRoomStates) => contextApi.getActor().setCurrentActionEdges(stateActionGroups[currentState].actionButtons))
    .then((currentState: ChatRoomStates) => contextApi.getActor().saveCurrentActionStubs({
      staticActionNames: stateActionGroups[currentState].actionButtons,
    }))
}

/**
 * Global Action Handlers
 */

const onEnter = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onEnter')
  return Promise
    .resolve(null)
    // -rx- .then(() => contextApi.getActor().readOrCreateLocalActionEdges(localActionNames))
    .then(() => doStateTransition(ChatRoomStates.Instructions, contextApi))
    .then(() => adjustForElaspedTime(contextApi))
  // -rx- .then(() => updateActionsButtons(contextApi))
}

const onExit = (): Promise<void> => {
  log('onExit')
  // return resetHiLo(contextApi);
  return Promise.resolve()
}

const localActions = {
  PlantSeed: 'action.npc.strawberrypatch.plantseed',
  Harvest: 'action.npc.strawberrypatch.harvest',
}

/** 
 * Mapping from state => action set
 */
export const stateActionGroups = {
  [ChatRoomStates.Instructions]: {
    onEnter: onEnterInstructions,
    actionButtons: [],
  },
  [ChatRoomStates.Start]: {
    onEnter: onEnterStart,
    actionButtons: [
      localActions.PlantSeed,
    ],
  },
  [ChatRoomStates.Grow]: {
    onEnter: onEnterGrow,
    actionButtons: [],
  },
  [ChatRoomStates.Harvest]: {
    onEnter: onEnterHarvest,
    actionButtons: [
      localActions.Harvest,
    ],
  },
  [ChatRoomStates.Spoil]: {
    onEnter: onEnterSpoil,
    actionButtons: [

    ],
  },
  [ChatRoomStates.Pick]: {
    onEnter: onEnterPick,
    actionButtons: [

    ],
  },

}

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {
    [DebugResetHandler.NAME]: onActionReset,

    [localActions.PlantSeed]: onActionPlantSeed,

    [localActions.Harvest]: onActionHarvest,

    'scheduler.harvestalert': onSchedulerEventHarvestAlert,

  } as ReactionFnMap)
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onExit,
  onReset: null,
  onLoad: registerReactionFns,
}

export default actionResolver
