import { GameLogicEvent, GameLogicCondition, GameLogicEffect, GameLogicEntry, GameLogicTarget } from '../../src/domain/gameLogic/types'
import * as util from './util'

const OUTPUT_FILE = 'src/domain/gameLogic/index.ts'

const loadEvents = (): Promise<GameLogicEvent[]> => {
  const cols = {
    id: 'Id',
    type: 'Event Type',
    move: 'moveId',
    item: 'itemId',
    target: 'Target',
    modifier: 'modifierId',
    stateId: 'stateId',
    hashtributeId: 'hashtributeId',
    key: 'Counter Key',
    local: 'Is Local',
  }
  return util.select<Record<keyof typeof cols, any>>('Events', 'Exportable', cols).then(rows => rows.map(validateLocal).map(row => ({
    ...row,
    modifier: row.modifier && util.ref('modifiers', row.modifier),
  })))
}

const loadConditions = (): Promise<GameLogicCondition[]> => {
  const cols = {
    id: 'Id',
    type: 'Condition Type',
    not: 'Not',
    target: 'Target',
    gender: 'Gender',
    hashtributeId: 'hashtributeId',
    stateId: 'stateId',
    context: 'contextId',
    key: 'Counter Key',
    local: 'Is Local',
    min: 'Min',
    max: 'Max',
    since: 'Time: Since',
    until: 'Time: Until',
    probability: 'Probability',
    itemName: 'itemId',
    partnerId: 'partnerId',
  }
  return util.select<Record<keyof typeof cols, any>>('Conditions', 'Exportable', cols).then(rows => rows.map(validateLocal).map(row => ({
    ...row,
    gender: row.gender && util.ref('Gender', row.gender),
    since: util.durationToInput(row.since),
    until: util.durationToInput(row.until),
    probability: row.probability && row.probability * 100,
  })))
}

const getTag = (target: GameLogicTarget): string | undefined => {
  // We defer the type checking to the compiler over the synced data
  switch (target) {
    case 'User': return 'target_user'
    case 'Actor': return 'target_actor'
    case 'Partner': return 'target_partner'
  }
}

const loadEffects = (): Promise<GameLogicEffect[]> => {
  const cols = {
    id: 'Id',
    type: 'Effect Type',
    target: 'Target',
    delay: 'Delay',
    hashtributeId: 'hashtributeId',
    value: 'Effect Value',
    stateId: 'State Id',
    itemName: 'itemId',
    tags: 'Stringified Tags',
    key: 'Counter Key',
    local: 'Is Local',
    resetIn: 'Counter TTL',
    vstate: 'vStateId',
    privately: 'Is Private',
    layout: 'News: Layout',
    backgrounds: 'backgroundAssetIds',
    foreground: 'foregroundAssetId',
    rateLimit: 'Rate Limit',
    callToAction: 'Call To Action',
    messageStyle: 'System Message Style',
  }
  return util.select<Record<keyof typeof cols, any>>('Effects', 'Exportable', cols).then(rows => rows.map(validateLocal).map(row => ({
    ...row,
    resetIn: util.durationToInput(row.resetIn),
    tags: row.tags && getTag(row.target) ? [getTag(row.target), ...row.tags] : row.tags,
    vstate: row.vstate && util.ref('vstates', row.vstate),
    delay: util.durationToInput(row.delay),
    layout: row.layout && util.ref('DynamicFeedItemLayout', row.layout),
    backgrounds: row.backgrounds && row.backgrounds.map((bg: string) => util.ref('assets', bg)),
    foreground: row.foreground && util.ref('assets', row.foreground),
    rateLimit: util.durationToInput(row.rateLimit),
    messageStyle: row.messageStyle && util.ref('SystemMessageStyle', row.messageStyle),
  })))
}

const loadEntries = (): Promise<GameLogicEntry[]> => {
  const cols = {
    id: 'Id',
    name: 'Name',
    events: 'eventIds',
    conditions: 'And Conditions Id',
    effects: 'Effects Id',
    unless: 'Unless Ids',
  }
  return util.select<Record<keyof typeof cols, any>>('Logic', 'Exportable', cols).then(rows => rows.map(row => ({
    ...row,
    events: row.events.map((event: string) => util.wrapCode(`events[${event}]`)),
    conditions: row.conditions ? row.conditions.map((cond: string) => util.wrapCode(`conditions[${cond}]`)) : [],
    effects: row.effects ? row.effects.map((effect: string) => util.wrapCode(`effects[${effect}]`)) : [],
  } as any)))
}

const validateLocal = <T extends { local?: boolean; target: string }>(row: T): T => {
  if (row.local && row.target === 'Room') {
    throw new Error(`Counter rows cannot be local and target a Room: ${JSON.stringify(row)}`)
  }
  return row
}

Promise.all([loadEvents(), loadConditions(), loadEffects(), loadEntries()])
  .then(([events, conditions, effects, entries]) => {
    // TODO: maybe do the map'ing here so the order is consistent and util.ref() imports don't change order randomly
    const eventMap = util.indexBy(events, 'id')
    const conditionMap = util.indexBy(conditions, 'id')
    const effectMap = util.indexBy(effects, 'id')

    const code = `import { GameLogicEvent, GameLogicCondition, GameLogicEffect, GameLogicEntry } from './types'
import { listOf, mapOf } from 'src/utils/misc'
export * from './types'

const events = mapOf<GameLogicEvent>()(${util.stringify(eventMap)} as const)

const conditions = mapOf<GameLogicCondition>()(${util.stringify(conditionMap)} as const)

const effects = mapOf<GameLogicEffect>()(${util.stringify(effectMap)} as const)

export const gameLogic = listOf<GameLogicEntry>(${util.stringifyRows(entries)})`

    util.updateFile(OUTPUT_FILE, code)
  })
