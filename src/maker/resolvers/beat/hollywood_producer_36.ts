import vstates from 'src/maker/vstate/states'
import BeatNPC from './common/npc'
import { Color } from './common/types'
import { easy } from './common/difficulties'
import { CreepSlapper } from './common/categories'
import { npcs } from 'src/domain/npcs'

const npc = npcs.hollywood_producer_36
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
      phrases: ['U up? ', 'Tryna send?', 'But I’m a nice guy!'],
    },
    {
      minDamage: 30, // %
      barColor: Color.Yellow,
      vstate: { ...vstates.confused, avatar: `${ROOT}/stage_1.png` },
      phrases: ['Just one date?', 'Pleeeease?'],
    },
    {
      minDamage: 80, // %
      barColor: Color.Orange,
      vstate: { ...vstates.dizzy, avatar: `${ROOT}/stage_2.png` },
      phrases: ['OK, playing hard-to-get, huh?', 'My Mom said everybody has to be nice to me!', 'But being female in public means you’re available, right?'],
    },
    {
      minDamage: 100, // %
      barColor: Color.Red,
      vstate: { ...vstates.victory, ...vstates.ko, avatar: `${ROOT}/stage_3.png` },
      phrases: ['Nailed him!', 'Got him!', 'You showed him!'],
    },
  ],
  defeatStage: {
    barColor: Color.Green,
    vstate: { ...vstates.clearState, ...vstates.defeat, avatar: `${ROOT}/stage_0.png` },
    phrases: ['Good punch!', 'Solid left hook!', 'Smacked him!'],
  },
})

export default resolver.createResolver()
