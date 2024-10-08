import CraftNPC from './common/npc'
import { Recipe } from './common/types'
import { items } from 'src/domain/items'
import { npcs } from 'src/domain/npcs'

const recipes: Recipe[] = [
  {
    output: items.vegan_smoothie_82,
    ingredients: [items.coconut_25, items.avocado_9],
    tools: [],
  },
  {
    output: items.milky_tea_44,
    ingredients: [items.tea_leaves_109, items.tiger_milk_110],
    tools: [],
  },
  {
    output: items.savage_boba_tea_86,
    ingredients: [items.milky_tea_44, items.tapioca_pearls_104],
    tools: [],
  },
]

const npc = new CraftNPC({
  npc: npcs.barista_49,
  recipes,
})

export default npc.createResolver()
