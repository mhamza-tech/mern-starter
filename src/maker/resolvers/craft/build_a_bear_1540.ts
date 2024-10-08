import CraftNPC from './common/npc'
import { Recipe } from './common/types'
import { items } from 'src/domain/items'
import { npcs } from 'src/domain/npcs'

const recipes: Recipe[] = [
  {
    output: items.teddy_bear_with_whip_1554,
    ingredients: [items.whip_1652],
    tools: [],
  },
  {
    output: items.teddy_bear_with_monocle_1556,
    ingredients: [items.monocle_1653],
    tools: [],
  },
  {
    output: items.teddy_bear_with_bow_tie_1555,
    ingredients: [items.bow_tie_1656],
    tools: [],
  },
  {
    output: items.teddy_bear_with_stink_1557,
    ingredients: [items.garbage_bag_1654],
    tools: [],
  },
]

const npc = new CraftNPC({
  npc: npcs.build_a_bear_1540,
  recipes,
})

export default npc.createResolver()
