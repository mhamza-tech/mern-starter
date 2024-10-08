import { Move } from 'src/domain/moves'
import { Item } from 'src/domain/items'
import { NPC } from 'src/domain/npcs'

export interface Config {
  npc: NPC
}

export interface FullConfig extends Config {
  moves: Move[]
  items: Item[]
}

export interface GameState {
  cooldowns: { [move: string]: string } // map of moves to ISO strings
}
