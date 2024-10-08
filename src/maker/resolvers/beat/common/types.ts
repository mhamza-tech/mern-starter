import { VState } from 'src/maker/vstate'
import { DurationInputObject } from 'moment'
import { Move } from 'src/domain/moves'
import { NPC } from 'src/domain/npcs'
import { requireKeys } from 'src/utils/misc'

// Defined here so it can be easily tweaked
export const getEfficiency = (level: number): number =>
  Math.log10(level * 10)

export enum GameStatus {
  Playing,
  Victory,
  Defeat,
}

export interface Difficulty {
  maxHP: number
  killTime: DurationInputObject
}

export enum Color {
  Red = '#FF423C',
  Orange = '#FF9E3C',
  Yellow = '#FFDB12',
  Green = '#3CD72B',
}

export interface NPCStage {
  minDamage?: number // %
  phrases: string[]
  barColor: Color
  vstate: VState
}

export interface Category {
  deplete: boolean
  tools: Move[]
}

export interface Config {
  npc: requireKeys<NPC, 'hashtribute'>
  difficulty: Difficulty
  category: Category
  stages: NPCStage[]
  defeatStage: Omit<NPCStage, 'minDamage'>
}

export interface GameState {
  matchId: number
  status: GameStatus
  damage: number // [0, config.difficulty.maxHP]
  mutedUntil?: string // timestamp in ISO string format
  defeatTime?: string // timestamp in ISO string format
  cooldowns: { [tool: string]: string } // map of tool ids to ISO strings
  efficiency: number // derived from the hashstribute level and toolEfficiency
}

export interface JobArgs {
  matchId: number
}

export enum Actions {
  Defeat = 'action.beat.defeat',
}
