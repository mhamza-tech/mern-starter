import _ from 'lodash'
import { VState } from '../../src/maker/vstate'
import * as util from './util'

// TODO: Migrate to src/domain. The animations enums tie it to maker, must be worked around

const TABLE = 'vStates'
const VIEW = 'Exportable'
const OUTPUT_FILE = 'src/maker/vstate/db.ts'

type Row = Omit<VState, 'avatar' | 'emoji'> & { id: string }

const defaults: Omit<VState, keyof Row> = {
  avatar: undefined,
  emoji: undefined,
}

const cols: Record<keyof Row, string> = {
  id: 'Id',
  underlay: 'Underlay Id',
  background: 'Background Id',
  foreground: 'Foreground Id',
  overlay: 'Overlay Id',
  animation: 'Native Animation',
  duration: 'Effect Duration (ms)',
  sfx: 'soundEffectAssetId',
  vibration: 'Vibration Duration (ms)',
  loop: 'Loop',
  fullscreen: 'Is Fullscreen',
}

const assetKeys = ['underlay', 'background', 'foreground', 'overlay', 'sfx'] as const

util.select<Row>(TABLE, VIEW, cols).then(util.defaults).then((rows) => {
  const data = util.indexBy(rows, 'id', row => {
    const rest = util.compact({ ...row, id: undefined })

    if (!Object.values(rest).some(_.isString)) {
      throw new Error(`The VState row has no required property: ${util.stringify(row)}`)
    }

    const vstate: VState = { ...rest, ...defaults }
    for (const key of assetKeys) {
      const assetId = vstate[key]
      vstate[key] = assetId && util.ref('assets', assetId, 's3Key')
    }
    // This is not enforced in "vanilla" VStates, but is assumed in AT
    if (vstate.background && !vstate.foreground) {
      vstate.foreground = ''
    } else if (!vstate.background && vstate.foreground) {
      vstate.background = ''
    }
    if (vstate.underlay && !vstate.overlay) {
      vstate.overlay = ''
    } else if (!vstate.underlay && vstate.overlay) {
      vstate.underlay = ''
    }
    return vstate
  })

  const code = `import { VState } from './'

const data = ${util.stringify(data)} as const

type VStateId = keyof typeof data
export const vstates: (Record<VStateId, Readonly<VState>> & typeof data) = data`

  util.updateFile(OUTPUT_FILE, code)
})
