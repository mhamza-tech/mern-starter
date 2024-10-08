import { SimpleActionXInstanceObject } from 'src/db/entity/ActionXInstance'
import { Item, ItemName } from 'src/domain/items'
import { NPC } from 'src/domain/npcs'
import { StringTags } from 'src/domain/strings'
import { HandlebarsValues } from 'src/types'

export interface NewsfeedConfig {
  enabled: boolean
  tags?: StringTags
  optional?: StringTags
  values?: HandlebarsValues
}

export interface Recipe {
  ingredients: Item[]
  tools: Item[]
  output: Item
  newsfeed?: NewsfeedConfig
}

export interface Config {
  npc: NPC
  recipes: Recipe[]
}

// The bits that are stored as JSON
export interface GameStateData {
  outputName?: ItemName
  finishAt?: string
}

export interface GameState {
  inventory: SimpleActionXInstanceObject[]
  stored: SimpleActionXInstanceObject[]
  finishAt: string | undefined // UTC time
  output: Item | undefined
}

export interface JobArgs {
  itemName: string
}

export enum Actions {
  Cancel = 'action.craft.cancel',
  Claim = 'action.craft.claim',
  Ready = 'action.craft.ready',
}
