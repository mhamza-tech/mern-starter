import CraftNPC from './common/npc'
import { Recipe } from './common/types'
import { items } from 'src/domain/items'
import { npcs } from 'src/domain/npcs'

const recipes: Recipe[] = [
  {
    output: items.flour_111,
    ingredients: [items.wheat_112],
    tools: [],
  },
]

const npc = new CraftNPC({
  npc: npcs.flour_mill_63,
  recipes,
})

export default npc.createResolver()
