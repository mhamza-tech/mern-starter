import CraftNPC from './common/npc'
import { Recipe } from './common/types'
import { items } from 'src/domain/items'
import { npcs } from 'src/domain/npcs'

const recipes: Recipe[] = [
  {
    output: items.artisanal_brioche_bun_8,
    ingredients: [items.flour_111],
    tools: [],
  },
  {
    output: items.san_francisco_sourdough_bread_85,
    ingredients: [items.flour_111],
    tools: [],
  },
]

const npc = new CraftNPC({
  npc: npcs.bakery_56,
  recipes,
})

export default npc.createResolver()
