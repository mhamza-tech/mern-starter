import vstates from 'src/maker/vstate/states'
import BeatNPC from './common/npc'
import { Color } from './common/types'
import { easy } from './common/difficulties'
import { PuppyLover } from './common/categories'
import { VState } from 'src/maker/vstate'
import { npcs } from 'src/domain/npcs'

const npc = npcs.francois_40
const ROOT = `npc/${npc.id}`
// The background is an image so it remains there
const clearAction = { underlay: '' } as VState

const resolver = new BeatNPC({
  npc,
  difficulty: easy,
  category: PuppyLover,
  stages: [
    {
      minDamage: 0, // %
      barColor: Color.Green,
      vstate: { ...clearAction, avatar: `${ROOT}/stage_0.png`, animation: 'Tada' },
      phrases: ['Hewwo?', 'Hi dere!', 'Who iz youz?'],
    },
    {
      minDamage: 30, // %
      barColor: Color.Green,
      vstate: { ...clearAction, ...vstates.buffed, avatar: `${ROOT}/stage_1.png`, animation: 'Bounce' },
      phrases: ['I likes pats!', 'I smiles!', 'You not a cat person, right?'],
    },
    {
      minDamage: 80, // %
      barColor: Color.Green,
      vstate: { ...clearAction, ...vstates.inLove, avatar: `${ROOT}/stage_2.png`, animation: 'Bounce' },
      phrases: ['I likes you!', 'You make me happy!', 'Oooh la la!'],
    },
    {
      minDamage: 100, // %
      barColor: Color.Green,
      vstate: { ...clearAction, ...vstates.inLove, avatar: `${ROOT}/stage_3.png` },
      phrases: [],
    },
  ],
  defeatStage: {
    barColor: Color.Green,
    vstate: { ...vstates.clear, ...vstates.defeat, avatar: `${ROOT}/stage_0.png`, animation: 'Tada' },
    phrases: [],
  },
})

export default resolver.createResolver()
