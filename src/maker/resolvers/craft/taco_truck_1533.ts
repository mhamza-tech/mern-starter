import CraftNPC from './common/npc'
import { Recipe } from './common/types'
import { items } from 'src/domain/items'
import { npcs } from 'src/domain/npcs'

const recipes: Recipe[] = [
  {
    output: items.stinky_shit_taco_1651,
    ingredients: [items.poop_678, items.stinky_old_sock_1657],
    tools: [],
  },
  {
    output: items.spicy_shit_taco_770,
    ingredients: [items.poop_678, items.chilli_pepper_1659],
    tools: [],
  },
  {
    output: items.spicy_chicken_taco_1536,
    ingredients: [items.chicken_1580, items.chilli_pepper_1659],
    tools: [],
  },
  {
    output: items.spicy_beef_taco_1535,
    ingredients: [items.beef_1584, items.chilli_pepper_1659],
    tools: [],
  },
  {
    output: items.stinky_chicken_taco_1625,
    ingredients: [items.chicken_1580, items.stinky_old_sock_1657],
    tools: [],
  },
  {
    output: items.stinky_beef_taco_1624,
    ingredients: [items.beef_1584, items.stinky_old_sock_1657],
    tools: [],
  },
  {
    output: items.beef_chicken_taco_1587,
    ingredients: [items.beef_1584, items.chicken_1580],
    tools: [],
  },
  {
    output: items.beef_shit_taco_1623,
    ingredients: [items.beef_1584, items.poop_678],
    tools: [],
  },
  {
    output: items.chicken_shit_taco_1534,
    ingredients: [items.chicken_1580, items.poop_678],
    tools: [],
  },
  {
    output: items.spicy_stinky_taco_1752,
    ingredients: [items.chilli_pepper_1659, items.stinky_old_sock_1657],
    tools: [],
  },
]

const npc = new CraftNPC({
  npc: npcs.taco_truck_1533,
  recipes,
})

export default npc.createResolver()
