import { Item } from 'src/domain/items'
import { Move } from 'src/domain/moves'
import { NPC } from 'src/domain/npcs'

export interface Config {
  npc: NPC
}

export interface GameState {
  step: number
}

export interface Step {
  items: Item[]
  moves: Move[]
}
