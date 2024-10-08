import { SequenceEffectMetadata } from 'src/gql-types'
import { Item } from 'src/domain/items'
import { EffectTemplate } from 'src/types'
import { Move, MoveName } from 'src/domain/moves'
import { NPCId } from 'src/domain/npcs'
import { ReactionFn } from 'src/enginev3/types'

export interface Config {
  npcId: NPCId
  moves?: Move[]
  celebrationEffectTemplate?: EffectGenerator
  prizeEffectTemplate?: EffectGenerator
  prizes?: PrizeConfig[]
}

export type ReactionMapping = {[key:string]: ReactionFn}
export type StringConfig = {item?: Item; move?: Move}
export interface PrizeConfig {
  inItems?: Item[] | Move[]
  outItem: Item
  chance?: number
}

export type Cooldown = { [tool: string]: string }

export enum NPCStatus {
  NPCSessionFinished,
  NPCSessionActive,
}

// TODO: make Gamestate Local to each to reduce the amnount stored in the state
export interface GameState {
  storedInput: string[]
  cooldowns: Cooldown
  npcCooldown: boolean
  regeneratedAt: string // in UTC
  defeatTime: string
  matchId: number
  npcState: NPCStatus
  drinkNames: MoveName[]
  drinks: Move[]
}

export interface DrugDealerGameState {
  cooldowns: Cooldown
  npcCooldown: boolean
}

export interface BuildABearGameState {
  npcCooldown: boolean
  storedInput: string[]
}

export interface UnicornLoungeGameState {
  cooldowns: Cooldown
  npcCooldown: boolean
  defeatTime: string
  matchId: number
  npcState: NPCStatus
  drinkNames: string[]
}

export interface AngryToiletGameState {
  npcCooldown: boolean
}

export interface TaqueriaGameState {
  storedInput: string[]
  npcCooldown: boolean
  cooldowns: Cooldown
}

export interface JobArgs {
  matchId: number
}

export enum Actions {
  PrizeReady = 'npc.exchange.action.prize.ready',
  MessageOnOffered = 'npc.exchange.action.offered',
  UnlockRoom = 'npc.exchange.unlockRoom',
  Smoking = 'npc.exchange.smoking',
  CursedInjured = 'npc.exchange.cursed.injured',
  CursedLuck = 'npc.exchange.cursed.luck',
  CursedDesire = 'npc.exchange.cursed.desire',
  BlessedDesired = 'npc.exchange.blessed.desired',
  BlessedLuck = 'npc.exchange.blessed.luck',
  GameOver = 'npc.exchange.game.over',
}

export type InteractiveItem = Item | Move
export type PrizeInput = Item[] | Move[]
type EffectGenerator = (item?: Item) => EffectTemplate<SequenceEffectMetadata> 
