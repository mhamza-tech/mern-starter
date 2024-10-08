import vstates from 'src/maker/vstate/states'
import BeatNPC from './common/npc'
import { Color } from './common/types'
import { easy } from './common/difficulties'
import { PuppyLover } from './common/categories'
import { VState } from 'src/maker/vstate'
import { npcs } from 'src/domain/npcs'

const npc = npcs.bentley_43
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
      phrases: ['I iz good dog.', 'You likes Bentley?', 'Want to play?'],
    },
    {
      minDamage: 30, // %
      barColor: Color.Green,
      vstate: { ...clearAction, ...vstates.buffed, avatar: `${ROOT}/stage_1.png`, animation: 'Bounce' },
      phrases: ['Bentley likes you.', 'Yes I iz good dog!', 'Play with meeee!'],
    },
    {
      minDamage: 80, // %
      barColor: Color.Green,
      vstate: { ...clearAction, ...vstates.inLove, avatar: `${ROOT}/stage_2.png`, animation: 'Bounce' },
      phrases: ['I iz happy puppers!', 'Oh boy oh boy oh boy!', 'Rubs da belly!'],
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
