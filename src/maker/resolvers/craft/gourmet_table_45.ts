import CraftNPC from './common/npc'
import { Recipe } from './common/types'
import { items } from 'src/domain/items'
import { npcs } from 'src/domain/npcs'

const recipes: Recipe[] = [
  {
    output: items.avocado_toast_10,
    ingredients: [items.avocado_9, items.san_francisco_sourdough_bread_85],
    tools: [],
  },
  {
    output: items.karen_burger_52,
    ingredients: [items.patty_100, items.artisanal_brioche_bun_8],
    tools: [],
  },
]

const npc = new CraftNPC({
  npc: npcs.gourmet_table_45,
  recipes,
})

export default npc.createResolver()
