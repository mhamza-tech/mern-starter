import { MoveName } from 'src/domain/moves'
import { ItemName } from 'src/domain/items'
import { NPCId } from '../npcs'
import { Gender, DynamicFeedItemLayout, SystemMessageStyle } from 'src/gql-types'
import { HashtributeId } from '../hashtributes'
import { UserStateId } from '../userStates'
import { DurationInputObject } from 'moment'
import { Asset } from '../assets'
import { StringTags } from '../strings'
import { Modifier } from '../modifiers'
import { VState } from 'src/maker/vstate'

export type GameLogicTarget = 'Actor' | 'Partner' | 'NPC' | 'Room' | 'User'
export type GameLogicContext = 'm2m' | 'p2p' | 'npc' | NPCId

// Events

interface BaseEvent {
  id: number
}

interface MoveEvent extends BaseEvent {
  type: 'onMoveTriggered'
  move: MoveName
  modifier?: Modifier
}

interface ItemUsedEvent extends BaseEvent {
  type: 'onItemUsed'
  item: ItemName
  modifier?: Modifier
}

interface ItemAddedEvent extends BaseEvent {
  type: 'onItemAdded'
  item: ItemName
}

interface ItemExpiredEvent extends BaseEvent {
  type: 'onItemExpired'
  item: ItemName
}

interface StateIncreasedEvent extends BaseEvent {
  type: 'onStateIncreased'
  target: GameLogicTarget
  stateId: UserStateId
}

interface StateDecreasedEvent extends BaseEvent {
  type: 'onStateDecreased'
  target: GameLogicTarget
  stateId: UserStateId
}

interface HashtributeLevelUpEvent extends BaseEvent {
  type: 'onHashtributeLevelUp'
  hashtributeId: HashtributeId
}

interface SessionSucceededEvent extends BaseEvent {
  type: 'onSessionSucceeded'
}

interface RoomEnteredEvent extends BaseEvent {
  type: 'onRoomEntered'
}

interface CountIncreasedEvent extends BaseEvent {
  type: 'onCountIncreased'
  target: GameLogicTarget
  key: string
  local?: boolean
}

export type GameLogicEvent = MoveEvent | ItemUsedEvent | ItemAddedEvent | ItemExpiredEvent | StateIncreasedEvent | StateDecreasedEvent | HashtributeLevelUpEvent | SessionSucceededEvent | RoomEnteredEvent | CountIncreasedEvent
export type GameLogicEventType = GameLogicEvent['type']

// Conditions

interface BaseCondition {
  id: number
  not?: boolean
}

interface GenderCondition extends BaseCondition {
  type: 'Gender'
  target: GameLogicTarget
  gender: Gender
}

interface HashtributeCondition extends BaseCondition {
  type: 'Hashtribute'
  target: GameLogicTarget
  hashtributeId: HashtributeId
  min?: number
  max?: number
}

interface StateCondition extends BaseCondition {
  type: 'State'
  target: GameLogicTarget
  stateId: UserStateId
  min?: number
  max?: number
}

interface ContextCondition extends BaseCondition {
  type: 'Context'
  context: GameLogicContext
}

interface CountCondition extends BaseCondition {
  type: 'Count'
  target: GameLogicTarget
  key: string
  local?: boolean
  min?: number
  max?: number
}

interface ValueCondition extends BaseCondition {
  type: 'Value'
  min?: number
  max?: number
}

interface TimeCondition extends BaseCondition {
  type: 'Time'
  target: GameLogicTarget
  since: DurationInputObject
  until: DurationInputObject
}

interface ChanceCondition extends BaseCondition {
  type: 'Chance'
  probability: number
}

interface InventoryCondition extends BaseCondition {
  type: 'Inventory'
  itemName: ItemName
  min: number
}

interface PartnerCondition extends BaseCondition {
  type: 'Partner'
  partnerId: string
}

export type GameLogicCondition = GenderCondition | HashtributeCondition | StateCondition | ContextCondition | CountCondition | ValueCondition | TimeCondition | ChanceCondition | InventoryCondition | PartnerCondition

// Effects

interface BaseEffect {
  id: number
  target: GameLogicTarget
  delay?: DurationInputObject
}

interface HashtributeEffect extends BaseEffect {
  type: 'Hashtribute'
  hashtributeId: HashtributeId
  value: number
}

interface StateEffect extends BaseEffect {
  type: 'State'
  stateId: UserStateId
  value: number
}

interface ItemEffect extends BaseEffect {
  type: 'Item'
  itemName: ItemName
  value: number
}

interface SystemMessageEffect extends BaseEffect {
  type: 'System Message'
  messageStyle: SystemMessageStyle
  tags: StringTags
}

interface CountEffect extends BaseEffect {
  type: 'Count'
  key: string
  local?: boolean
  value: number
  resetIn?: DurationInputObject
}

interface VStateEffect extends BaseEffect {
  type: 'vState'
  vstate: VState
  privately?: boolean
}

interface NewsEffect extends BaseEffect {
  type: 'News'
  tags: StringTags
  layout: DynamicFeedItemLayout
  backgrounds?: Readonly<Asset[]>
  foreground?: Asset
  stateId?: UserStateId
  rateLimit?: DurationInputObject
  callToAction?: string
}

export type GameLogicEffect = HashtributeEffect | StateEffect | ItemEffect | SystemMessageEffect | CountEffect | VStateEffect | NewsEffect

// Entries

export interface GameLogicEntry {
  id: number
  name: string
  events: GameLogicEvent[]
  conditions: GameLogicCondition[]
  effects: GameLogicEffect[]
  unless?: number[]
}
