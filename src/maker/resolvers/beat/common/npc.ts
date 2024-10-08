import moment, { DurationInputObject } from 'moment'
import _ from 'lodash'
import { ProgressField } from 'src/gql-types'
import { ActionResolver, ChatRoomActionContextApi, ActionXStub, ModalEffectTemplate } from 'src/maker/types'
import { LoggerFactory, AppLogger } from 'src/utils/logger'
import { registerReactionFnMap, ReactionFnMap, BeforeEnterAsset } from 'src/enginev3'
import { Config, GameState, GameStatus, NPCStage, JobArgs, Actions, getEfficiency } from './types'
import { gameStateField, progressBarField, countdownField, loseModal } from './assets'
import { incHashtribute, getHashtribute, resetHashtribute } from 'src/maker/hashtributes'
import { tap_wait } from 'src/utils/sf.typed'
import { findLast, defaultsDeep, deepFreeze } from 'src/utils/misc'
import { setVState, vstateToAssets, VState } from 'src/maker/vstate'
import vstates from 'src/maker/vstate/states'
import * as ResetAction from 'src/maker/reactions/action.debug.reset'
import { sendNPCMessage, getMovesAssets } from 'src/maker/playerHelpers'
import { events } from 'src/events'
import { NPCId } from 'src/domain/npcs'
import { delay } from 'src/utils/async_utils'

// Throttle chats to avoid spamming and queuing, shared for all beat NPCs
const PHRASE_THROTTLING: DurationInputObject = { seconds: 10 }

export default class BeatNPC {

  private readonly config: Readonly<Config>
  private readonly id: NPCId
  private readonly logger: AppLogger

  public constructor(config: Config) {
    this.config = deepFreeze(config)
    this.id = this.config.npc.id
    this.logger = LoggerFactory(this.id, 'NPC')
  }

  private get hashtag(): string {
    return `#${this.config.npc.hashtribute.displayName}`
  }

  private getState = (api: ChatRoomActionContextApi): Promise<GameState> => {
    return api.getChatRoom().field(gameStateField).then((field) => field?.metadata?.state)
  }
  
  private getStage = (state: GameState): NPCStage => {
    if (state.status === GameStatus.Defeat) {
      return this.config.defeatStage
    }
    const progress = state.damage / this.config.difficulty.maxHP * 100
    return findLast(this.config.stages, stage => stage.minDamage <= progress)
  }

  private getModal = (state: GameState): ModalEffectTemplate | null => {
    if (state.status === GameStatus.Defeat) {
      const secondary = `#${this.config.npc.hashtribute.displayName}`
      return defaultsDeep({ metadata: { texts: { secondary }}}, loseModal)
    }
    return null
  }

  private sendPhrase = (api: ChatRoomActionContextApi, state: GameState): Promise<any> => {
    const phrase = _.sample(this.getStage(state).phrases)
    return phrase && sendNPCMessage(api, phrase)
  }

  private partialUpdate = (api: ChatRoomActionContextApi, state: GameState): Promise<any> => {
    const progressBar: ProgressField = {
      numberValue: state.damage,
      maxValue: this.config.difficulty.maxHP,
      color: this.getStage(state).barColor,
    }
    if (this.config.category.deplete) {
      progressBar.numberValue = progressBar.maxValue - progressBar.numberValue
    }
    const room = api.getChatRoom()
    return Promise.all([
      // Save the updated game state
      room.saveField(defaultsDeep({ metadata: { state } }, gameStateField)),
      // Show a progress bar
      room.saveField(defaultsDeep({ metadata: progressBar }, progressBarField)),
      // Send the tools as actions
      api.getActor().saveCurrentActionStubs({
        staticActionStubs: this.config.category.tools.map((tool): ActionXStub => ({
          actionName: tool.name,
          // include any cooldowns they might have ongoing
          disabledUntil: state.cooldowns[tool.name],
          // If the game is over, disable all the actions
          isDisabled: state.status !== GameStatus.Playing,
        })),
      }),
    ])
  }

  private updateUI = (api: ChatRoomActionContextApi, state: GameState): Promise<any> => {
    const room = api.getChatRoom()
    const modal = this.getModal(state)
    const vstate:VState = { ...vstates.clearState, ...this.getStage(state).vstate }
    return Promise.all([
      // do some of the changes that are shared
      this.partialUpdate(api, state),
      // Send a field with the defeat time
      room.saveField(defaultsDeep({
        isDeleted: state.status !== GameStatus.Playing,
        metadata: { expiryDateTime: state.defeatTime },
      }, countdownField)),
      // Update all the layers dependent on the NPC stage
      setVState(room, vstate),
      // Show a modal if any
      modal && delay(2000).then(() => room.saveEffect(modal)),
    ])
  }

  private onFinish = (api: ChatRoomActionContextApi, success: boolean): Promise<any> => {
    const { hashtribute, rewards } = this.config.npc
    const reward = success ? _.sample(rewards) : undefined
    return Promise.all([
      incHashtribute(api.getActor(), hashtribute.id, success),
      events.npc.session.completed.notify({ api, success, item: reward }),
    ])
  }

  private onHit = async (api: ChatRoomActionContextApi): Promise<any> => {
    const actionName = api.getCurrentActionName()
    this.logger.info('onHit', actionName)

    const state = await this.getState(api)
    // Ignore hits when no longer playing
    if (state.status !== GameStatus.Playing) {
      return null
    }
    // Detect defeat (before the job runs) and trigger it in advance
    if (moment().isAfter(state.defeatTime)) {
      return this.onDefeat(api, state)
    }

    const tool = this.config.category.tools.find(t => t.name === actionName)
    const newState = defaultsDeep({
      // Increase the accumulated damage done to the NPC
      damage: state.damage + Math.ceil(tool.damage * state.efficiency),
      // Disable the action for some time
      cooldowns: { [tool.name]: moment().add(tool.cooldown).toISOString() },
    }, state)

    const hasWon = newState.damage >= this.config.difficulty.maxHP
    if (hasWon) {
      newState.status = GameStatus.Victory
      newState.damage = this.config.difficulty.maxHP
    }

    await Promise.all([
      // We do a partial update here to mitigate race conditions
      this.partialUpdate(api, newState),
      // FIXME: This is very incompatible with the general moves rule
      // Show the tool action animations and wait for them to finish
      setVState(api.getChatRoom(), tool.effectVState),
    ])
    // TODO: Maybe split what's below, move it to the handler of an action sent after the animation
    // FIXME: I suspect a promise in the caching code is not awaited, I can saveState ^ and load an older one v

    // Reload the state in case another action ran and also modified it
    const freshState = await this.getState(api)
    if (freshState.damage > newState.damage) {
      // If another action hit the NPC during this animation, don't override
      return null
    }
    const isMuted = !hasWon && !!state.mutedUntil && moment().isBefore(state.mutedUntil)
    if (!isMuted) {
      // Even if the stage has no phrase, just mute (it's only the final stages that might)
      freshState.mutedUntil = moment().add(PHRASE_THROTTLING).toISOString()
    }

    // After the animation finishes, do a full update of the state in the FE
    return Promise.all([
      this.updateUI(api, freshState),
      !isMuted && this.sendPhrase(api, freshState),
      hasWon && this.onFinish(api, true),
    ])
  }

  private onDefeat = (api: ChatRoomActionContextApi, state: GameState): Promise<any> => {
    this.logger.info('onDefeat', state.matchId)
    const newState = defaultsDeep({ status: GameStatus.Defeat }, state)
    return Promise.all([
      this.sendPhrase(api, newState),
      this.updateUI(api, newState),
      this.onFinish(api, false),
    ])
  }

  private onBeforeEnter = async (): Promise<BeforeEnterAsset[]> => {
    this.logger.info('onBeforeEnter')
    const stages = [...this.config.stages, this.config.defeatStage]
    const stagesAssets = _.flatMap(stages, ({ vstate }) => vstateToAssets(vstate))
    return [...stagesAssets, ...getMovesAssets(this.config.category.tools)]
  }

  private onEnter = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onEnter')
    // Reset the game to the initial state
    // Fetch the current hashtribute level to cache it in the state during a match
    return this.onStart(api)
  }

  private onStart = (api: ChatRoomActionContextApi): Promise<any> => {
    return getHashtribute(api.getActor(), this.config.npc.hashtribute.id)
      .then(trait => {
        const defeatTime = moment().add(this.config.difficulty.killTime)
        const state: GameState = {
          matchId: Date.now(),
          status: GameStatus.Playing,
          efficiency: getEfficiency(trait.level),
          damage: 0,
          cooldowns: {},
          defeatTime: defeatTime.toISOString(),
        }
        this.logger.info('onStart', state.matchId)
        return Promise.all([
        // Schedule the defeat condition handler
          api.scheduleJob({
            id: `job.${Actions.Defeat}.${api.getActor().getEid()}.${state.matchId}`,
            actionName: Actions.Defeat,
            args: { matchId: state.matchId } as JobArgs,
            dispatchAt: defeatTime.toDate(),
          }),
          // Render the game state
          this.updateUI(api, state),
          // Trigger a session start
          events.npc.session.started.notify({ api }),
        ])
      })
  }

  private onJobDefeat = (api: ChatRoomActionContextApi): Promise<any> => {
    const { matchId } = api.getCurrentAction().args as JobArgs
    this.logger.info('onJobDefeat', matchId)
    return this.getState(api)
      .then((state) => {
        // Ignore a defeat for a previous match or one that was already decided
        if (state.matchId !== matchId || state.status !== GameStatus.Playing) {
          throw new Error('Invalid state')
        }
        return state
      })
      .then(tap_wait(() => api.getActor().sendPing()))
      .then(state => this.onDefeat(api, state))
      // If either the match was over or the user is not here, ignore the job
      .catch(() => {})
  }

  private onReset = (api: ChatRoomActionContextApi): Promise<any> => {
    this.logger.info('onReset')
    return resetHashtribute(api.getActor(), this.config.npc.hashtribute.id)
      .then(() => this.onStart(api))
  }

  private registerReactionFns = (): Promise<any> => {
    const reactions: ReactionFnMap = {
      [ResetAction.NAME]: this.onReset,
      [Actions.Defeat]: this.onJobDefeat,
    }
    this.config.category.tools.forEach(action => {
      reactions[action.name] = this.onHit
    })
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
