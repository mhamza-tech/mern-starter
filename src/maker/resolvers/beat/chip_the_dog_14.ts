import vstates from 'src/maker/vstate/states'
import BeatNPC from './common/npc'
import { Color } from './common/types'
import { medium } from './common/difficulties'
import { PuppyLover } from './common/categories'
import { VState } from 'src/maker/vstate'
import { npcs } from 'src/domain/npcs'

const npc = npcs.chip_the_dog_14
const ROOT = `npc/${npc.id}`
const clearAction = { underlay: '' } as VState

const resolver = new BeatNPC({
  npc,
  difficulty: medium,
  category: PuppyLover,
  stages: [
    {
      minDamage: 0, // %
      barColor: Color.Green,
      vstate: { ...clearAction, avatar: `${ROOT}/stage_0.png`, animation: 'Tada' },
      phrases: ['Am good puppers, yes?', 'You haz ball? Want throw?', 'You likes goob boyes?'],
    },
    {
      minDamage: 30, // %
      barColor: Color.Green,
      vstate: { ...clearAction, ...vstates.buffed, avatar: `${ROOT}/stage_1.png`, animation: 'Bounce' },
      phrases: ['You throws ball?', 'Chip iz very goob pupper.', 'Squirrel!'],
    },
    {
      minDamage: 80, // %
      barColor: Color.Green,
      vstate: { ...clearAction, ...vstates.inLove, avatar: `${ROOT}/stage_2.png`, animation: 'Bounce' },
      phrases: ['Haz zoomies!', 'I likes belly rubs!', 'Throw the ball! Throw the ball!!'],
    },
    {
      minDamage: 100, // %
      barColor: Color.Green,
      vstate: { ...clearAction, ...vstates.inLove, avatar: `${ROOT}/stage_3.png` },
      phrases: ['I iz very best doggo!', 'Loving you!', 'Wiggle butt puppopotamus!'],
    },
  ],
  defeatStage: {
    barColor: Color.Green,
    vstate: { ...vstates.clear, ...vstates.defeat, avatar: `${ROOT}/stage_0.png`, animation: 'Tada' },
    phrases: [],
  },
})

export default resolver.createResolver()
