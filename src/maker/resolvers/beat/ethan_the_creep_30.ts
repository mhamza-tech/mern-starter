import vstates from 'src/maker/vstate/states'
import BeatNPC from './common/npc'
import { Color } from './common/types'
import { easy } from './common/difficulties'
import { CreepSlapper } from './common/categories'
import { npcs } from 'src/domain/npcs'

const npc = npcs.ethan_the_creep_30
const ROOT = `npc/${npc.id}`

const resolver = new BeatNPC({
  npc,
  difficulty: easy,
  category: CreepSlapper,
  stages: [
    {
      minDamage: 0, // %
      barColor: Color.Green,
      vstate: { avatar: `${ROOT}/stage_0.png` },
      phrases: ['Smile, baby!', 'Shake it! ', 'Whoo hoo!'],
    },
    {
      minDamage: 30, // %
      barColor: Color.Yellow,
      vstate: { ...vstates.confused, avatar: `${ROOT}/stage_1.png` },
      phrases: ['What the…!?', 'Hey, you smiled at me first!'],
    },
    {
      minDamage: 80, // %
      barColor: Color.Orange,
      vstate: { ...vstates.dizzy, avatar: `${ROOT}/stage_2.png` },
      phrases: ['How can you resist me? I play lacrosse!', 'Does this mean you won’t go out with me?'],
    },
    {
      minDamage: 100, // %
      barColor: Color.Red,
      vstate: { ...vstates.victory, ...vstates.ko, avatar: `${ROOT}/stage_3.png` },
      phrases: [],
    },
  ],
  defeatStage: {
    barColor: Color.Green,
    vstate: { ...vstates.clearState, ...vstates.defeat, avatar: `${ROOT}/stage_0.png` },
    phrases: [],
  },
})

export default resolver.createResolver()
