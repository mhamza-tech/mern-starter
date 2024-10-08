import { items, ItemName, Item } from 'src/domain/items'
import ExchangeNPC from './common/npc'
import { ChatRoomActionContextApi } from 'src/types'
import { EffectType, AnimationType, ProgressField, ActionXStub, FieldType, EntityScope, CountdownFieldStyle, ActionXInstance } from 'src/gql-types'
import { defaultsDeep } from 'src/utils/misc'
import { PrizeConfig, Actions, Config } from './common/types'
import { TILE_NAME_UNOBJECT, progressBarField } from './common/assets'
import { NPCId } from 'src/domain/npcs'
import { misc } from 'src/utils'
import { ReactNativeAnimations } from 'src/maker/animations'
import { getCounter, incCounter, resetCounter } from 'src/maker/counters'
import { colors } from 'src/domain/colors'
import { ActionResolver, FieldTemplate, CountdownFieldMetadata, NodeApi } from 'src/maker/types'
import { registerReactionFnMap, ReactionFnMap, WILDCARD_ACTION, BeforeEnterAsset } from 'src/enginev3'
import moment from 'moment'
import * as ResetAction from '../../reactions/action.debug.reset'
import { assets } from 'src/domain/assets'
import { lookupString } from 'src/maker/strings'
import { events } from 'src/events'
import { delay } from 'src/utils/async_utils'
import { vstates } from 'src/maker/vstate/db'
import { setVState, vstateToAssets } from 'src/maker/vstate'
import _ from 'lodash'

const ID: NPCId = 'angry_toilet_330'
const PRIZE_ANIMATION_DELAY = 4000
const SPLASH_DELAY = 1400 

const prizes : PrizeConfig[] = [
  {
    inItems: [],
    outItem: items.rainbow_poop_1619,
    chance: 20,
  },
  {
    inItems: [],
    outItem: items.poop_678,
    chance: 100,
  },
]

class AngryToiletNPC extends ExchangeNPC {

  public constructor(config: Config) {
    super(config)
  }

  private readonly countdownField = misc.deepFreeze<FieldTemplate<CountdownFieldMetadata>>({
    type: FieldType.CountdownField,
    scope: EntityScope.GlobalScope,
    name: 'countdown',
    metadata: {
      text: null,
      style: CountdownFieldStyle.Ticker,
      image: { s3Key: null },
      expiryDateTime: null,
    },
  })  

  private animateNPC = (api: ChatRoomActionContextApi) : Promise<any> => {
    const effect = misc.deepFreeze({
      type: EffectType.AnimationEffect,
      scope: EntityScope.GlobalScope,
      waitForTap: false,
      isDeletedOnFinish: false,
      metadata: {
        tileName: TILE_NAME_UNOBJECT,
        animationType: AnimationType.NativeAnimatableAnimation,
        // This can be "" to cancel a previous animation
        animation: ReactNativeAnimations.Tada,
        duration: 2000,
      },
    })

    return api.getChatRoom().saveEffect(effect)
  }
    
  private getLockTime = (api: ChatRoomActionContextApi) : Promise<string> => {
    return api.getChatRoom().field(this.countdownField)
      .then(field => field.metadata.expiryDateTime)
  }
  
  private deleteItem = (api: ChatRoomActionContextApi, item: ActionXInstance, from: NodeApi): Promise<ActionXInstance> => {
    return from.deleteActionInstance({ id: item.id })
  }

  private incFlushCounter = (api: ChatRoomActionContextApi) : Promise<any> => {
    const room = api.getChatRoom()
    const keys = ['sessionActionCounter']
    return incCounter(room, keys, 1)
  }

  private getFlushCounter = (api: ChatRoomActionContextApi) : Promise<any> => {
    const room = api.getChatRoom()
    const keys = ['sessionActionCounter']
    return getCounter(room, keys)
  }

  private resetFlushCounter = (api: ChatRoomActionContextApi) : Promise<any> => {
    const room = api.getChatRoom()
    const keys = ['sessionActionCounter']
    return resetCounter(room, keys)
  }

  protected onBeforeEnter = async (): Promise<BeforeEnterAsset[]> => {
    this.logger.log('onBeforeEnter')
    const assets = _.flatMap([vstates.water_splashes_on_user_130], vstateToAssets)

    return assets
  }

  private onEnter = async (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onEnter')
    
    return Promise.all([
      this.resetFlushCounter(api)    
        .then(() => this.resetRoom(api)),
      this.shouldLockRoom(api),
    ])
  }

  private resetRoom = async (api: ChatRoomActionContextApi) : Promise<any> => {
    this.logger.info('resetRoom')
    const lockTime = await this.getLockTime(api)
    const actor = api.getActor()
    const isAvailable = !lockTime || moment().isSameOrAfter(lockTime)
    return Promise.all([
      isAvailable && actor.readAllActionInstances().then((inventory) => {
        if(inventory.length > 0) {
          return this.getFlushCounter(api).then((count) => this.showString(api, count === 0 ? 'welcome' : 'welcomeBack'))
        } else {
          return this.showString(api, 'noInventory')
        }
      }),
      events.npc.session.started.notify({ api }),      
      this.updateProgress(api),
      this.updateActions(api),
    ])
  }

  protected updateProgress = async (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('updateProgress')
    const room = api.getChatRoom()
    const numberOfItemsInToilet = await this.getActionPerformedCounter(api)
    const progressBar: ProgressField = {
      numberValue: numberOfItemsInToilet,
      minValue: 0,
      maxValue: 5,
      color: colors.b32_pale_blue_e3eef4,
    }
    const field = defaultsDeep({ metadata: progressBar }, progressBarField)
    return Promise.all([
      room.saveField(field),
    ])
  }

  protected updateActions = async (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('updateActions')
    const actor = api.getActor()
    return Promise.all([
      actor.saveCurrentActionStubs({
        staticActionStubs: [],
        actionInstanceStubs: Object.values(items).map((item): ActionXStub => (
          { actionName: item.name, isGivable : false, isUsable : true, isDisabled: false}
        )),
      }),
    ])
  }

  protected onItemSelected = async (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onItemSelected')

    const actionName : ItemName = api.getCurrentActionName() as ItemName
    const item = items[actionName]
    const actor = api.getActor()

    if(actionName != undefined) {
      return Promise.all([
        this.animateNPC(api),
        this.incFlushCounter(api),
        api.getActor().readActionInstances(item.name)
          .then((instance) => this.deleteItem(api, instance[0], actor)) 
          .then(() => delay(SPLASH_DELAY)).then(() => this.onSessionCompleted(api, item)),
        setVState(api.getChatRoom(), vstates.water_splashes_on_user_130),
        //this.showString(api, 'offered', item),
      ])
    }
    
    return null
  }

  private onSessionCompleted = async (api: ChatRoomActionContextApi, item: Item): Promise<any> => {
    this.logger.info('onSessionCompleted')
    return events.npc.session.completed.notify({ api, success: true, item: this.getPrize([item]) })
      .then(() => this.incActionPerformedCounter(api))
      .then((counter) => {
        return this.updateProgress(api)
          .then(() => delay(PRIZE_ANIMATION_DELAY))
          .then(() => {
            if(counter === 5) {
              this.logger.info('Locking room after timeout')
              return this.lockRoom(api).then(() => this.updateActions(api))
            } else {
              this.logger.info('Resetting room after timeout')
              return this.resetRoom(api)
            }
          })
      })
  }

  protected onReset = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onReset')
    return Promise.all([
      this.resetRoom(api),
    ])
  }

  private shouldLockRoom = (api: ChatRoomActionContextApi): Promise<any> => {
    return this.getLockTime(api).then((lockTime) => {
      console.log('lockTime', lockTime, 'moment', moment(), 'isob', moment().isSameOrBefore(lockTime) ? 'lock' : 'unlock')
      if(moment().isSameOrBefore(lockTime)) {
        return this.lockRoom(api, lockTime)
      } else {
        return this.unlockRoom(api)
      }
    })
  }

  private lockRoom = async (api: ChatRoomActionContextApi, curLockTime?: string): Promise<any> => {
    const unlockedAt = moment().add({ minutes: 5 })
    const jobId = `${api.getActor().getEid()}.${Actions.UnlockRoom}.${unlockedAt}`

    const field = defaultsDeep({
      isDeleted: false,
      metadata: {
        text: lookupString([this.id, 'target_actor', 'onnpcsessioncompleted']),
        image: { s3Key: assets.toilet_npc_396.s3Key },
        expiryDateTime: curLockTime || unlockedAt.toISOString(),
      },
    }, this.countdownField)

    return Promise.all([
      curLockTime == undefined && api.cancelJob(jobId)
        .then(() => api.scheduleJob({
          id: jobId,
          actionName: Actions.UnlockRoom,
          dispatchAt: unlockedAt.toDate(),
        })),
      api.getChatRoom().saveField(field),
    ])
  }

  private unlockRoom = async (api: ChatRoomActionContextApi): Promise<any> => {
    const unlockedAt = moment().add({seconds: -10 }) // paranoid
    const jobId = `${api.getActor().getEid()}.${Actions.UnlockRoom}.${unlockedAt}`

    const field = defaultsDeep({
      isDeleted: true,
      metadata: {
        text: lookupString([this.id, 'target_actor', 'onnpcsessioncompleted']),
        image: { s3Key: assets.toilet_npc_396.s3Key },
        expiryDateTime: unlockedAt,
      },
    }, this.countdownField)

    return Promise.all([
      api.getChatRoom().saveField(field),
      api.cancelJob(jobId),
      this.resetActionPerformedCounter(api),
    ])
  }

  private onUnlockRoom = (api: ChatRoomActionContextApi): Promise<any> => {
    return this.unlockRoom(api).then(() => this.resetRoom(api))
  }

  protected registerReactionFns = (): Promise<any> => {
    const reactions: ReactionFnMap = {
      [ResetAction.NAME]: this.onReset,
      [Actions.MessageOnOffered]: this.onExchangeAnimationFinished,
      [Actions.UnlockRoom]: this.onUnlockRoom,
      [WILDCARD_ACTION]: this.onItemSelected,
    }

    return registerReactionFnMap(this.id, reactions)
  }

  public createResolver = (): ActionResolver => {
    return {
      unObjectId: this.id,
      onEnter: this.onEnter,
      onLoad: this.registerReactionFns,
      onReset: this.onReset,
      onBeforeEnter: this.onBeforeEnter,
    }
  }

}

const npc = new AngryToiletNPC({
  npcId: ID,
  prizes,
})

export default npc.createResolver()
