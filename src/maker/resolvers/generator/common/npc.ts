import _ from 'lodash'
import moment from 'moment'
import { ReactionFnMap, registerReactionFnMap, BeforeEnterAsset } from 'src/enginev3'
import * as ResetAction from 'src/maker/reactions/action.debug.reset'
import { ActionResolver, ChatRoomActionContextApi } from 'src/maker/types'
import { LoggerFactory, AppLogger } from 'src/utils/logger'
import { deepFreeze, defaultsDeep } from 'src/utils/misc'
import { setVState, vstateToAssets } from 'src/maker/vstate'
import vstates from 'src/maker/vstate/states'
import { countdownField, itemTileTemplate } from './assets'
import { Config, GameState, Actions } from './types'
import { delay } from 'src/utils/async_utils'
import { incHashtribute, resetHashtribute } from 'src/maker/hashtributes'
import { events } from 'src/events'
import { sft } from 'src/utils'
import { NPCId } from 'src/domain/npcs'
import { Hashtribute } from 'src/domain/hashtributes'
import { Item } from 'src/domain/items'

export default class {

  private readonly config: Readonly<Config>
  private readonly id: NPCId
  private readonly logger: AppLogger
  private readonly hashtribute: Hashtribute | undefined
  private readonly item: Item

  public constructor(config: Config) {
    this.config = deepFreeze(config)
    this.id = this.config.npc.id
    this.logger = LoggerFactory(this.id, 'NPC')
    this.hashtribute = this.config.npc.hashtribute
    this.item = this.config.npc.rewards[0]
  }

  private getState = (api: ChatRoomActionContextApi): Promise<GameState> => {
    return api.getChatRoom().field(countdownField).then(field => ({
      regeneratedAt: field.metadata.expiryDateTime || moment().toISOString(),
    }))
  }

  private updateUI = (api: ChatRoomActionContextApi, state: GameState): Promise<any> => {
    const isAvailable = moment().isSameOrAfter(state.regeneratedAt)
    const room = api.getChatRoom()
    const vstate = isAvailable ? vstates.pickable : vstates.clear
    const { s3Key } = this.item

    return Promise.all([
      // The item tile
      room.saveTile(defaultsDeep({ isDeleted: !isAvailable, metadata: { image: { s3Key }} }, itemTileTemplate)),
      // VState based on room state
      setVState(room, { ...vstates.clearAction, ...vstate }),
      // Show a timer
      room.saveField(defaultsDeep({
        isDeleted: isAvailable,
        metadata: {
          text: `A new ${this.item.text} will be ready shortly`,
          image: { s3Key: this.item.s3Key },
          expiryDateTime: state.regeneratedAt,
        },
      }, countdownField)),
      // Update the action(s)
      api.getActor().saveCurrentActionStubs({
        staticActionStubs: [{ actionName: Actions.Pick, disabledUntil: state.regeneratedAt, isUsable: false, isGivable: false }],
      }),
    ])
  }

  private onPick = async (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onPick')

    const state = await this.getState(api)
    const room = api.getChatRoom()

    // This could be refactored into a sequence of 2 effects and a callback to "picked" action
    // NOTE: We are using the dropAnimation for the overlay, so remove it
    await setVState(room, { ...vstates.pickup, overlay: '' })
    await Promise.all([
      room.saveTile(defaultsDeep({ isDeleted: true }, itemTileTemplate)),
      // Notify the event system that a session was completed
      events.npc.session.completed.notify({ api, success: true, item: this.item }),
      // TODO: Handle the timing differently
      delay(3500),
    ])

    const { creationTime } = this.item
    const regeneratedAt = moment().add(creationTime)
    return Promise.all([
      // Optionally increase a hashtribute
      this.hashtribute && incHashtribute(api.getActor(), this.hashtribute.id),
      // Update and reflect the state
      creationTime && this.updateUI(api, { ...state, regeneratedAt: regeneratedAt.toISOString() }),
      // Schedule a job to notify the user
      !creationTime ? this.start(api) : api.scheduleJob({
        id: `${api.getActor().getEid()}.${Actions.Regenerate}.${regeneratedAt.toISOString()}`,
        actionName: Actions.Regenerate,
        dispatchAt: regeneratedAt.toDate(),
      }),
    ])
  }

  private onRegenerate = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onRegenerate')
    return api.getActor().sendPing().then(() => this.start(api)).catch(_.noop)
  }

  private onBeforeEnter = async (): Promise<BeforeEnterAsset[]> => {
    this.logger.log('onBeforeEnter')
    const assets = _.flatMap([vstates.pickable, vstates.pickup], vstateToAssets)
    return [...assets, this.item]
  }

  private start = (api: ChatRoomActionContextApi): Promise<any> => {
    return this.getState(api).then(state => {
      return this.updateUI(api, state).then(sft.tap(() => {
        // After an onEnter, if the item is available, emit a session started
        const isAvailable = moment().isSameOrAfter(state.regeneratedAt)
        return isAvailable && events.npc.session.started.notify({ api })
      }))
    })
  }

  private onEnter = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onEnter')
    return this.start(api)
  }

  private onReset = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onReset')
    return Promise.resolve()
      .then(() => {
        if (this.hashtribute) {
          return resetHashtribute(api.getActor(), this.hashtribute.id)
        }
        return null
      })
      .then(() => this.getState(api))
      .then(state => this.updateUI(api, { ...state, regeneratedAt: moment().toISOString() }))
  }

  private registerReactionFns = (): Promise<any> => {
    const reactions: ReactionFnMap = {
      [ResetAction.NAME]: this.onReset,
      [Actions.Pick]: this.onPick,
      [Actions.Regenerate]: this.onRegenerate,
    }
    return registerReactionFnMap(this.id, reactions)
  }

  public createResolver = (): ActionResolver => {
    return {
      unObjectId: this.id,
      onBeforeEnter: this.onBeforeEnter,
      onEnter: this.onEnter,
      onLoad: this.registerReactionFns,
      onReset: this.onReset,
    }
  }

}
