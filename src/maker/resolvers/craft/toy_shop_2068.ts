import CraftNPC from './common/npc'
import { Recipe } from './common/types'
import { items } from 'src/domain/items'
import { npcs } from 'src/domain/npcs'

const recipes: Recipe[] = [
  {
    output: items.freeze_ray_gun_2061,
    ingredients: [items.ice_cube_2065, items.gun_2060],
    tools: [],
    newsfeed: { enabled: true },
  },
  {
    output: items.flame_thrower_2066,
    ingredients: [items.zippo_lighter_2063, items.gun_2060],
    tools: [],
    newsfeed: { enabled: true },
  },
  {
    output: items.snowball_2070,
    ingredients: [items.ice_cube_2065, items.tennis_ball_2064],
    tools: [],
    newsfeed: { enabled: true },
  },
  {
    output: items.fireball_2062,
    ingredients: [items.zippo_lighter_2063, items.tennis_ball_2064],
    tools: [],
    newsfeed: { enabled: true },
  },
  {
    output: items.paintball_marker_2059,
    ingredients: [items.tennis_ball_2064, items.gun_2060],
    tools: [],
    newsfeed: { enabled: true },
  },
  {
    output: items.icy_hot_2091,
    ingredients: [items.ice_cube_2065, items.zippo_lighter_2063],
    tools: [],
    newsfeed: { enabled: true },
  },
]

const npc = new CraftNPC({
  npc: npcs.toy_shop_2068,
  recipes,
})

export default npc.createResolver()
