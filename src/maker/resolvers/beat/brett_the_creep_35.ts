import vstates from 'src/maker/vstate/states'
import BeatNPC from './common/npc'
import { Color } from './common/types'
import { easy } from './common/difficulties'
import { CreepSlapper } from './common/categories'
import { npcs } from 'src/domain/npcs'

const npc = npcs.brett_the_creep_35
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
      phrases: ['Hey baby!', 'Hawt!', 'Can I have your number?'],
    },
    {
      minDamage: 30, // %
      barColor: Color.Yellow,
      vstate: { ...vstates.confused, avatar: `${ROOT}/stage_1.png` },
      phrases: ['Aw c’mon!', 'Don’t be like that!', 'That was a compliment!'],
    },
    {
      minDamage: 80, // %
      barColor: Color.Orange,
      vstate: { ...vstates.dizzy, avatar: `${ROOT}/stage_2.png` },
      phrases: ['But you’re too pretty to be this mean!', 'Why you gotta be so rude?', 'Does this mean maybe?'],
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
