import CraftNPC from './common/npc'
import { Recipe } from './common/types'
import { items } from 'src/domain/items'
import { npcs } from 'src/domain/npcs'

const recipes: Recipe[] = [
  {
    output: items.face_wash_91,
    ingredients: [items.natural_south_sea_sponge_62, items.coconut_25],
    tools: [],
  },
  {
    output: items.skin_mask_83,
    ingredients: [items.coachella_dust_23, items.tiger_milk_110],
    tools: [],
  },
  {
    output: items.hair_mousse_6,
    ingredients: [items.avocado_9, items.tiger_milk_110],
    tools: [],
  },
]

const npc = new CraftNPC({
  npc: npcs.helga_47,
  recipes,
})

export default npc.createResolver()
