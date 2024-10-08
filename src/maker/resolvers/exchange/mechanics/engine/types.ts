import { ItemName, Item } from 'src/domain/items'
import { MoveName, Move } from 'src/domain/moves'
import { StringTag } from 'src/domain/strings'
import { UserStateId } from 'src/domain/userStates'
import { misc } from 'src/utils'
import { TileTemplate, EffectTemplate, ConcurrentEffectMetadata, ChatRoomActionContextApi, HandlebarsValues } from 'src/maker/types'
import { HashtributeId } from 'src/domain/hashtributes'
import { ContainerStyleV2, DynamicFeedItemLayout, FeedItemActionEntityType, FeedItemActionType } from 'src/gql-types'
import { DurationInputObject } from 'moment'
import { Engine } from './engine'
import { ReactNativeAnimations } from 'src/maker/animations'

export type Interaction = ItemName | MoveName
export type StubSource = Item | Move
export type ValidTags = MoveName // | ItemName etc
export type InteractionIntentName = 'moveMessage' | 'restart' | 'counter' | 'state' | 'booleanPath' | 'custom' | 'item' | 'animateNpc' | 'rockPaperScissors' | 'animation' | 'slotMachine'
export type InteractionIntent = BaseIntent | ItemIntent | SlotMachineIntent | CustomIntent
export type NarrativeJob = { [key: string]: StringConfig }
export type Narrative = { [key: string]: StringConfig[] }
export type JobCallback = (api: ChatRoomActionContextApi) => Promise<any>
export type Cooldown = { [tool: string]: string }
export type CounterMap = { [id: string]: Counter }
export type InteractionMap = { [id: string]: InteractionConfig }
export type PrizeType = 'item' | 'stateChange' | 'hashtribute' | 'futureJob'
export type PrizeId = UserStateId | ItemName | HashtributeId | string
export type ConditionType = 'counterValue' | 'counterState' | 'userState' | 'roomStateContext' | 'booleanPath' | 'item' | 'rockPaperScissors' | 'session' | 'jobId' | 'prizeStock'
export type ConditionTest = 'equalTo' | 'lessThan' | 'lessThanOrEqualTo' | 'greaterThan' | 'greaterThanOrEqualTo'
export type ConditionResult = { id: number | string; result: boolean }
export type PrizeName = ItemName | UserStateId
export type BooleanChoice = 'yes' | 'no'
export type BooleanPath = BooleanChoice[]
export type BooleanMap = { [key: string]: BooleanPath }
export type TileMap = { [key: string]: TileTemplate }
export type JobMap = { [key: string]: JobConfig }
export type ConcurrentEffectMap = { [key: string]: EffectTemplate<ConcurrentEffectMetadata> }
export type CustomIntentFn = (api: ChatRoomActionContextApi, engine: Engine, actionName: string, intentParams: CustomIntentParams, state: GeneratorEngineState) => Promise<any>
export type IntentPriority = 'before' | 'main' | 'after' | 'cleanup'
export type Conditions = ConditionConfig[]
export type StateChoice = 'random' | 'highest' | 'index'
export type UserStateReferenceType = 'contextState' | 'namedState'
export type NewsfeedContext = 'item' | 'hashtribute' | 'future' | 'future-complete'
export type NewsfeedContextId = ItemName | HashtributeId | UserStateId
export type NPCAnimationMoveMap = { [moveName: string]: NPCAnimation }

export enum RequiredNodeApi {
  Actor = 1,
  Room
}

export enum FinishedCondition {
  AllCountersMax = 1,
  NamedCounterAtMax,
  Grabbed,
  AnyCounterMax,
  NoInventory
}

export enum EngineStatus {
  SessionRunning = 1,
  SessionFinished
}

export enum EngineAction {
  IncCounterAction = 'engine.generator.IncCounterAction',
  PrizeReady = 'engine.generator.PrizeReady',
  IntentSlotMachine_SpinFinished = 'intent.slot.machine.spin.finished'
}

export enum CounterState {
  Inactive = 1,
  Active,
  AtMaximum,
}

export interface StateContext {
  states: UserStateId[]
  choice: StateChoice
  index?: number
  api: RequiredNodeApi
}

export interface StateValueResult {
  userStateId: UserStateId
  numberValue: number
}

export interface ResetConfig {
  id: UserStateId | string[]
  value: number
  api: RequiredNodeApi
}

export interface DebugResetConfig {
  enabled: boolean
  states?: ResetConfig[]
  counters?: ResetConfig[]
}

export interface StringOptions {
  item?: Item
  move?: Move
  jobId?: string
  roomStateContext?: UserStateId
  prizeName?: string
}

export interface StringUserStateReference {
  referenceType: UserStateReferenceType
  referenceName: boolean
  referenceValue: boolean
  userStateId?: UserStateId
  api?: RequiredNodeApi
  granularity?: number
}

export interface StringConfig {
  debugId?: string
  tags: StringTag[]
  referenceState?: StringUserStateReference
  referenceCounterByName?: string 
  referenceCounterByInteraction?: boolean
  referenceMove?: boolean
  referenceItem?: boolean
  referenceBooleanPathHistory?: boolean
  conditions?: Conditions
  elseContext?: string
}

export interface Counter {
  api: RequiredNodeApi
  tags?: string[]
  min: number
  max?: number
  repeat: boolean
  state: CounterState
  resetOnStart?: boolean
}

export interface CounterActionPrize {
  prize: ItemName
}

export interface BaseIntent {
  type: InteractionIntentName
  name?: string
  priority: IntentPriority
}

export interface SlotMachineIntent extends BaseIntent {
  winChance: number
  winCounterName: string
  loseCounterName: string
}

export interface ItemIntent extends BaseIntent {
  prize: ItemName
}

export interface CustomIntentParams {
  counters: CounterMap
  sessionStatus: EngineStatus
}

export interface CustomIntent extends BaseIntent {
  callback: CustomIntentFn
}

export interface InteractionConfig {
  intent: InteractionIntent[]
  initiallyDisabled?: boolean
  disableAtCounterMax?: boolean
  disabled?: boolean
  booleanChoice?: BooleanChoice
}

// TODO Unify Counter and state conditions, just have one condition
export interface CounterCondition {
  counterName: string
  counterValue: number
}

export interface ConditionConfig {
  type: ConditionType
  test?: ConditionTest
  name?: string | UserStateId
  value?: number | UserStateId | 'no_afflictions' | string[][]
  api?: RequiredNodeApi
}

export interface ItemPrize {
  item: ItemName
}

export interface LottieConfig {
  id: string
  containerStyle: ContainerStyleV2
}

export interface NewsfeedConfig {
  conditions?: Conditions
  debug?: string
  stringTags: StringTag[]
  stringOptional?: StringTag[]
  stringValues?: HandlebarsValues
  backgroundImageS3Key?: string
  foregroundImageS3Key?: string
  overlayImageS3Key?: string
  context: NewsfeedContext
  contextId: NewsfeedContextId
  backgroundColor?: string
  title?: string
  description?: string
  actionId?: string
  actionType?: FeedItemActionType
  actionEntityType?: FeedItemActionEntityType
  layout?: DynamicFeedItemLayout
  delay?: number
}

export interface PrizeConfig {
  id: string
  prizeType: PrizeType
  prizes: PrizeId[]
  chances?: number[]
  stateModifiers?: number[]
  stock?: number
  conditions?: Conditions
  lottieEffect?: LottieConfig
  sessionCompleted?: boolean
}

export interface JobConfig {
  delay: moment.Duration
  startOnEnter: boolean
  conditions?: Conditions
  action: string
  cancelOnInteraction: boolean
  restartAfterInteraction: boolean
}

// TODO change to use condition type
export interface JobCounterCondition {
  counterName: string
  counterLessThan?: number
  counterLessThanOrEquals?: number
  counterEquals?: number
  counterMoreThanOrEquals?: number
  counterMoreThan?: number
}

export interface JobStateCondition {
  stateName: UserStateId
  stateLessThan?: number
  stateLessThanOrEquals?: number
  stateEquals?: number
  stateMoreThanOrEquals?: number
  stateMoreThan?: number
}

export interface FinishedConditionOptions {
  counterName?: string
  restart?: boolean
}

export interface NPCAnimation {
  animation: ReactNativeAnimations
  duration: number
}

export interface GeneratorConfig {
  id: string
  debug?: DebugResetConfig
  stateContext?: StateContext
  counters?: CounterMap
  interaction?: InteractionMap
  finishedCondition?: FinishedCondition
  finishedConditionOptions?: FinishedConditionOptions
  narrative?: Narrative
  prizes?: PrizeConfig[]
  newsfeed?: NewsfeedConfig[]
  newsfeedRateLimit?: DurationInputObject
  jobConfig?: JobMap
  globalCooldown?: boolean
  tiles?: TileMap
  concurrentEffects?: ConcurrentEffectMap
  offerSessionRestart?: boolean
  enableSessionSupport?: boolean
  npcAnimationMap? : NPCAnimationMoveMap
}

export const counterDefaults = misc.deepFreeze<Counter>({
  api: RequiredNodeApi.Room,
  min: 0,
  repeat: false,
  state: CounterState.Active,
  resetOnStart: true,
})

export interface GeneratorEngineState {
  cooldowns: Cooldown
  npcCooldown: boolean
  booleanPath: BooleanPath 
}
