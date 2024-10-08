import _ from 'lodash'
import moment from 'moment'
import { gameLogic, GameLogicEntry, GameLogicEvent, GameLogicTarget, GameLogicCondition, GameLogicEffect, GameLogicContext, GameLogicEventType } from 'src/domain/gameLogic'
import { on } from 'src/maker/events'
import { requireKeys, promise, toMS } from 'src/utils/misc'
import { promiseMap } from 'src/utils/sf.typed'
import { isM2M, isP2P, MasterType, isNPCRoom, jobNames, jobIs } from './helpers'
import { getHashtribute, incHashtributeRaw } from '../hashtributes'
import { NodeApi, HandlebarsValues } from '../types'
import { incUserState, getUserState } from '../userStates'
import { LoggerFactory } from 'src/utils/logger'
import { incCounter, parseCounterInput, getCounter } from '../counters'
import { setVState } from '../vstate'
import { delay } from 'src/utils/async_utils'
import { items } from 'src/domain/items'
import { showItemModal } from '../playerHelpers'
import { lookupString } from '../strings'
import { FeedItemActionEntityType, FeedItemActionType, EntityScope } from 'src/gql-types'
import { probability } from '../helpers'

export const setup = (): void => {
  const logger = LoggerFactory('gameLogic', 'GameLogic')

  const VSTATE_DELAY = toMS({ milliseconds: 300 })
  const MAX_NO_JOB_DELAY = toMS({ seconds: 15 })

  // Helpers

  type DataType = requireKeys<Partial<MasterType>, 'api'>

  interface Range { min?: number; max?: number }
  interface Metadata { numberValue: number }
  interface JobArgs { effectId: number; values: HandlebarsValues }

  interface Resolutions { [id: number]: Promise<boolean> & { resolve: (value: boolean) => void } }

  const getTargetRaw = (target: GameLogicTarget, data: DataType): NodeApi | undefined => {
    const { api, node } = data
    switch (target) {
      case 'Actor':
        return api.getActor()
      case 'Partner':
        return api.getPartner()
      case 'User':
        if (!node) {
          return api.getActor()
        }
        return node.isUser() ? node : undefined
      case 'Room':
        if (!node) {
          return api.getChatRoom()
        }
        return node.isChatRoom() ? node : undefined
      case 'NPC':
        return api.getUnObject()
    }
  }

  const getTarget = (target: GameLogicTarget, data: DataType): NodeApi | undefined => {
    const node = getTargetRaw(target, data)
    return node?.isUnObject() ? data.api.getChatRoom() : node
  }

  const matchesContext = (target: GameLogicContext, data: DataType): boolean => {
    const master = data as MasterType
    switch (target) {
      case 'm2m': return isM2M(master)
      // For now at least, Airtable NPCs also behave like P2P
      case 'p2p': return isP2P(master) || !isM2M(master) && data.npc?.handler === 'Airtable'
      case 'npc': return isNPCRoom(master)
    }
    return data.api.getUnObject()?.getId() === target
  }

  const matchesCounter = (key: string, local: boolean | undefined, { field }: DataType): boolean => {
    const scope = local ? EntityScope.ChatRoomPrivateScope : EntityScope.GlobalPrivateScope
    return !!field && scope === field.scope && field.name === parseCounterInput(key)
  }

  const getValue = (data: DataType): number | undefined => {
    const value = data.metadata?.level ?? data.input?.numberValue ?? data.field?.metadata?.numberValue
    return _.isNil(value) ? undefined : value
  }

  const getValues = (data: DataType): HandlebarsValues => {
    return _.omitBy<HandlebarsValues>({
      hashtributeId: data.hashtribute?.id,
      userStateId: data.state?.id,
      itemName: data.item?.name,
      moveName: data.move?.name,
      value: getValue(data),
    }, _.isNil)
  }
  
  const isBetween = (value: number | undefined | null, range: Range): boolean => {
    value = value || 0
    return (_.isUndefined(range.min) || value >= range.min) &&
      (_.isUndefined(range.max) || value <= range.max)
  }

  const isMetadataBetween = (input: Metadata | undefined, range: Range): boolean => {
    return !!input && isBetween(input.numberValue, range)
  }

  // Events

  const checkEvent = (event: GameLogicEvent, data: DataType): boolean => {
    const modifierId = data.api.getCurrentActionTarget()
    const { node } = data
    const target = 'target' in event ? getTarget(event.target, data) : undefined

    switch (event.type) {
      case 'onItemExpired':
        return event.item === data.item?.name
      case 'onItemUsed':
        return event.item === data.item?.name &&
          (!event.modifier || event.modifier.id === modifierId)
      case 'onMoveTriggered':
        return event.move === data.move?.name &&
          (!event.modifier || event.modifier.id === modifierId)
      case 'onHashtributeLevelUp':
        return event.hashtributeId === data.hashtribute?.id
      case 'onItemAdded':
        return event.item === data.item?.name && !!node && node.isUser()
      case 'onStateIncreased':
      case 'onStateDecreased':
        if (!node || !target || !node.isSameAs(target)) {
          return false
        }
        return event.stateId === data.state?.id
      case 'onCountIncreased':
        if (!node || !target || !node.isSameAs(target)) {
          return false
        }
        return matchesCounter(event.key, event.local, data)
      case 'onSessionSucceeded':
      case 'onRoomEntered':
        return true
    }
  }

  // Entries

  const getEntries = (eventType: GameLogicEventType, data: DataType): GameLogicEntry[] => {
    return gameLogic.filter((entry) => (
      entry.events.some(event => event.type === eventType && checkEvent(event, data)) &&
      // Check only the sync ones, allow unless explicitely false (or negated)
      entry.conditions.every(condition => checkSyncCondition(condition, data) !== !!condition.not)
    ))
  }

  // Conditions

  const checkSyncCondition = (condition: GameLogicCondition, data: DataType): boolean | undefined => {
    switch (condition.type) {
      case 'Context':
        return matchesContext(condition.context, data)
      case 'Gender':
        return getTargetRaw(condition.target, data)?.getKey('gender') === condition.gender
      case 'Value':
        const value = getValue(data)
        return _.isUndefined(value) ? false : isBetween(value, condition)
      case 'Time':
        const node = getTarget(condition.target, data)
        return !!node && node.getLocalTime().isBetween(condition.since, condition.until)
      case 'Partner':
        return condition.partnerId === data.api.getPartner().getId()
    }
  }

  const checkCondition = async (condition: GameLogicCondition, data: DataType): Promise<boolean> => {
    const sync = checkSyncCondition(condition, data)
    if (sync !== undefined) {
      return sync
    }
    // Most conditions have a target but not all, so we need do type-check
    const target = 'target' in condition ? getTarget(condition.target, data) : data.api.getActor()
    if (!target) {
      return false
    }

    switch (condition.type) {
      case 'Hashtribute':
        const { level } = await getHashtribute(target, condition.hashtributeId)
        return isBetween(level, condition)
      case 'State':
        const input = await getUserState(target, condition.stateId)
        return isMetadataBetween(input, condition)
      case 'Count':
        const counter = await getCounter(target, condition.key, condition.local)
        return isBetween(counter, condition)
      case 'Chance':
        return probability(condition.probability)
      case 'Inventory':
        return target.readActionInstances(condition.itemName).then(instances => (
          isBetween(instances.length, condition)
        ))
      // Always handled sync, specify here just for the compiler
      case 'Value': case 'Gender': case 'Context': case 'Time': case 'Partner':
        return false
    }
  }

  // Effects

  const executeEffect = async (effect: GameLogicEffect, data: DataType, extraValues?: HandlebarsValues): Promise<any> => {
    const player = getTarget(effect.target, data)
    if (!player) {
      return
    }
    const isUser = player.isUser()
    // Bring potential values from args when called from a Job
    const values = _.extend(getValues(data), extraValues)
    const { api } = data
    switch (effect.type) {
      case 'Hashtribute':
        return isUser && incHashtributeRaw(player, effect.hashtributeId, effect.value)
      case 'State':
        return incUserState(player, effect.stateId, effect.value)
      case 'Item':
        // Negative removes items
        const create = effect.value > 0
        return Promise.all(<Promise<any>[]>[
          ..._.range(Math.abs(effect.value)).map(() => (
            create ? player.createActionInstance({ actionName: effect.itemName })
              : player.deleteActionInstance({ actionName: effect.itemName })
          )),
          // Show a modal
          create && isUser && showItemModal(player, items[effect.itemName]),
        ])
      case 'System Message':
        return isUser && player.sendMessage({
          tags: effect.tags, optional: [], from: api.getUnObject(), values, metadata: { style: effect.messageStyle },
        })
      case 'Count':
        return incCounter(player, effect.key, effect.value, effect.resetIn, effect.local)
      case 'vState':
        return setVState(player, effect.vstate, effect.privately)
      case 'News':
        if (!isUser) {
          return
        }
        // don't show any inset for node-centric events, NPC for NPC rooms, actor for user rooms
        const inset = data.node ? undefined : (matchesContext('npc', data) ? api.getUnObject() : api.getActor())
        const statusText = lookupString([...effect.tags, 'news'], [])
        const ids = _.uniq([player, api.getActor(), api.getPartner()].map(node => node.getId()))
        const background = _.sample(effect.backgrounds)
        return api.saveNewsfeedItem({
          userId: player.getId(),
          fromEid: player.getEid(),
          layout: effect.layout,
          rateId: ['logic', effect.id, ...ids].join('.'),
          rateLimit: effect.rateLimit,
          context: { ...values, userStateId: effect.stateId },
          stateId: effect.stateId,
          // TODO: This is probably not a perfect assumption
          isLive: effect.stateId ? true : undefined,
          metadata: {
            statusText,
            backgroundColor: (effect.foreground || background)?.backgroundColor,
            backgroundImage: background && { s3Key: background.s3Key },
            image: effect.foreground && { s3Key: effect.foreground.s3Key },
            insetPlayerEid: inset?.getEid(),
            action: {
              text: effect.callToAction,
              // For now just take them always to M2M
              entityId: player.getId(),
              entityType: FeedItemActionEntityType.User,
              type: FeedItemActionType.Backpack,
            },
          },
        })
    }
  }

  const getEffects = (eventType: GameLogicEventType, data: DataType): Promise<GameLogicEffect[]> => {
    const entries = getEntries(eventType, data)
    const resolutions: Resolutions = {}
    for (const entry of entries) {
      resolutions[entry.id] = promise<boolean>()
    }
    return promiseMap(entries, async (entry) => {
      const resolution = resolutions[entry.id]
      for (const entryId of entry.unless || []) {
        // If any of the logic rules in the list is successful, this one aborts
        if (resolutions[entryId] && await resolutions[entryId] === true) {
          resolution.resolve(false)
          return
        }
      }
      for (const condition of entry.conditions) {
        // Run them in sequence so we might save some queries when one fails early
        let result = await checkCondition(condition, data)
        if (condition.not) {
          result = !result
        }
        if (!result) {
          resolution.resolve(false)
          return
        }
      }
      resolution.resolve(true)
      logger.info(`Will execute #${entry.id} ${entry.name}`)
      return entry
      // We must wait for all async conditions, so then effects start together and there aren't race conditions
    }).then(entries => (
      _.flatMap(entries, entry => entry ? entry.effects : [])
    ))
  }

  const executeOrScheduleEffect = (effect: GameLogicEffect, data: DataType): Promise<any> => {
    if (!effect.delay) {
      return executeEffect(effect, data)
    }
    const msDelay = toMS(effect.delay)
    if (msDelay < MAX_NO_JOB_DELAY) {
      // A short delay, we don't queue a job for it
      return delay(msDelay).then(() => executeEffect(effect, data))
    }
    return data.api.scheduleJob<JobArgs>({
      jobNodeEid: data.node?.getEid(),
      actionName: jobNames.ExecuteEffect,
      // Store the values so we can retrieve them when running
      args: { effectId: effect.id, values: getValues(data) },
      dispatchAt: moment().add(effect.delay).toDate(),
    })
  }

  const execute = async (eventType: GameLogicEventType, data: DataType): Promise<any> => {
    const effects = await getEffects(eventType, data)
    const [vstates, other] = _.partition(effects, effect => effect.type === 'vState' && !effect.delay)
    let promises: Promise<any>[] = []
    if (vstates.length) {
      // If there are immediate vstates in the list, run them and delay the rest
      promises = vstates.map(effect => executeOrScheduleEffect(effect, data))
      await delay(VSTATE_DELAY)
    }
    return Promise.all([
      ...promises,
      ...other.map(effect => executeOrScheduleEffect(effect, data)),
    ])
  }

  const createHandler = (eventType: GameLogicEventType) => (data: DataType): Promise<any> => {
    return execute(eventType, data)
  }

  on.item.added.do(createHandler('onItemAdded'))
  on.item.expired.do(createHandler('onItemExpired'))
  on.hashtribute.levelUp.do(createHandler('onHashtributeLevelUp'))
  on.state.increased.do(createHandler('onStateIncreased'))
  on.state.decreased.do(createHandler('onStateDecreased'))
  on.npc.session.succeeded.do(createHandler('onSessionSucceeded'))
  on.room.entered.do(createHandler('onRoomEntered'))
  on.counter.increased.do(createHandler('onCountIncreased'))

  on.move.triggering
    .and(data => getEntries('onMoveTriggered', data).length > 0)
    .do(createHandler('onMoveTriggered'))

  on.item.using
    .and(data => getEntries('onItemUsed', data).length > 0)
    .do(createHandler('onItemUsed'))

  on.job.onNode.executed.and(jobIs('ExecuteEffect')).do((data) => {
    // Run delayed effects
    const { effectId, values }: JobArgs = data.args
    // For now, I want to hide the flat list of effects, to traverse the gameLogic instead
    for (const entry of gameLogic) {
      for (const effect of entry.effects) {
        if (effect.id === effectId) {
          return executeEffect(effect, data, values)
        }
      }
    }
    logger.warn(`Effect #${effectId} not found for delayed execution`)
  })
}
