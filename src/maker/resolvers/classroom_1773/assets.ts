import { EntityScope, FieldType } from 'src/gql-types'
import { FieldTemplate, JsonObjectFieldMetadata } from 'src/maker/types'
import { misc } from 'src/utils'
import { Item, items } from 'src/domain/items'
import { moves } from 'src/domain/moves'
import { Step } from './types'

export const gameStateField = misc.deepFreeze<FieldTemplate<JsonObjectFieldMetadata>>({
  type: FieldType.JsonObjectField,
  name: 'gameState',
  scope: EntityScope.GlobalScope,
  // Note: Part of the state should be per-player when it becomes MP
  metadata: { version: 1.0, state: {} },
})

export const STARTING_ITEMS: Item[] = [items.avocado_toast_10]

export const FEMALE_ITEMS: Item[] = [
  items.regular_joint_696,
  items.butt_first_coffee_1335,
  items.vegan_smoothie_82,
  items.skin_mask_83,
  items.glitter_bomb_520,
]

export const MALE_ITEMS: Item[] = [
  items.magic_mushroom_608,
  items.milky_tea_44,
  items.karen_burger_52,
  items.belgian_beer_359,
  items.water_balloon_1358,
]

export const EXTRA_ITEMS: Item[] = [
  items.yellow_flower_1739,
  items.glitter_bomb_520,
  items.water_balloon_1358,
]

export const STEPS: Step[] = [
  { moves: [], items: [] }, // #0
  { moves: [], items: STARTING_ITEMS }, // #1
  { moves: [], items: MALE_ITEMS.concat(FEMALE_ITEMS) }, // #2
  { moves: [moves.slap_92], items: [] }, // #3
  { moves: [], items: Object.values(items) }, // #4
]
