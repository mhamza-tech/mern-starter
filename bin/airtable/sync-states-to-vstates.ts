import { StateToVState } from '../../src/domain/statesToVStates/types'
import * as util from './util'

const TABLE = 'vStates Mappings'
const VIEW = 'Exportable'
const OUTPUT_FILE = 'src/domain/statesToVStates/index.ts'

type Row = Pick<StateToVState, 'id' | 'minValue' | 'maxValue' | 'userState'> & { vstate: string }

const defaults: Omit<StateToVState, keyof Row> = {}

const cols: Record<keyof Row, string> = {
  id: 'Id',
  userState: 'State Id',
  minValue: 'Min',
  maxValue: 'Max',
  vstate: 'vStateId',
}

util.select<Row>(TABLE, VIEW, cols).then((rows) => {
  const statesToVStates = rows.map((row): StateToVState => {
    return {
      ...row,
      minValue: row.minValue * 100,
      maxValue: row.maxValue * 100,
      vstate: util.ref('vstates', row.vstate),
      ...defaults,
    }
  })

  const code = `import { StateToVState } from './types'
import { listOf } from 'src/utils/misc'
export * from './types'

export const statesToVStates = listOf<StateToVState>(${util.stringifyRows(statesToVStates)})`

  util.updateFile(OUTPUT_FILE, code)
})
