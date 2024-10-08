import { NPC } from 'src/domain/npcs'
import { Item } from 'src/domain/items'

export interface Config {
  // Enforce at compile-time that the NPC must have exactly one reward
  npc: NPC & { rewards: Readonly<[Item]> }
}

export interface GameState {
  regeneratedAt: string // in UTC
}

export enum Actions {
  // TODO: Switch to a "pick" Move in airtable
  Pick = 'action.generator.pick',
  Regenerate = 'action.generator.regenerate',
}
