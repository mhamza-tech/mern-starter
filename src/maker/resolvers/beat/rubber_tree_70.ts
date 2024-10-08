import vstates from 'src/maker/vstate/states'
import BeatNPC from './common/npc'
import { Color } from './common/types'
import { easy } from './common/difficulties'
import { PlantParent } from './common/categories'
import { npcs } from 'src/domain/npcs'

const npc = npcs.rubber_tree_70
const ROOT = `npc/${npc.id}`

const resolver = new BeatNPC({
  npc,
  difficulty: easy,
  category: PlantParent,
  stages: [
    {
      minDamage: 0, // %
      barColor: Color.Green,
      vstate: { avatar: `${ROOT}/stage_0.png` },
      phrases: [],
    },
    {
      minDamage: 30, // %
      barColor: Color.Green,
      vstate: { ...vstates.pollenized, avatar: `${ROOT}/stage_1.png` },
      phrases: [],
    },
    {
      minDamage: 80, // %
      barColor: Color.Green,
      vstate: { ...vstates.pollenizedWithButterflies, avatar: `${ROOT}/stage_2.png` },
      phrases: [],
    },
    {
      minDamage: 100, // %
      barColor: Color.Green,
      vstate: { ...vstates.victory, ...vstates.pollenizedWithButterflies, avatar: `${ROOT}/stage_3.png` },
      phrases: [],
    },
  ],
  defeatStage: {
    barColor: Color.Green,
    vstate: { avatar: `${ROOT}/stage_0.png` },
    phrases: [],
  },
})

export default resolver.createResolver()
