import CraftNPC from './common/npc'
import { Recipe } from './common/types'
import { items } from 'src/domain/items'
import { npcs } from 'src/domain/npcs'

const recipes: Recipe[] = [
  {
    output: items.potion_stink_2171,
    ingredients: [items.passion_fruit_2187, items.underpants_2188],
    tools: [],
    newsfeed: { enabled: true },
  },
  {
    output: items.potion_sweet_love_2168,
    ingredients: [items.passion_fruit_2187, items.cupcake_2185],
    tools: [],
    newsfeed: { enabled: true },
  },
  {
    output: items.potion_love_hurts_2167,
    ingredients: [items.passion_fruit_2187, items.handcuffs_2186],
    tools: [],
    newsfeed: { enabled: true },
  },
  {
    output: items.potion_sweet_surprise_2170, // naughty
    ingredients: [items.underpants_2188, items.cupcake_2185],
    tools: [],
    newsfeed: { enabled: true },
  },
  {
    output: items.potion_pervert_2169,
    ingredients: [items.underpants_2188, items.handcuffs_2186],
    tools: [],
    newsfeed: { enabled: true },
  },
  {
    output: items.potion_sugardaddy_2172,
    ingredients: [items.cupcake_2185, items.handcuffs_2186],
    tools: [],
    newsfeed: { enabled: true },
  },
]

const npc = new CraftNPC({
  npc: npcs.potion_lab_2174,
  recipes,
})

export default npc.createResolver()
