import CraftNPC from './common/npc'
import { Recipe } from './common/types'
import { items } from 'src/domain/items'
import { npcs } from 'src/domain/npcs'

const recipes: Recipe[] = [
  {
    output: items.chatty_boomer_22,
    ingredients: [items.burner_phone_15],
    tools: [],
  },
]

const npc = new CraftNPC({
  npc: npcs.boomer_home_90,
  recipes,
})

export default npc.createResolver()
