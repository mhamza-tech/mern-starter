import _ from 'lodash'
import { BaseUserState } from '../../src/domain/userStates/types'
import * as util from './util'

const TABLE = 'Entities'
const VIEW = 'Exportable: States'
const OUTPUT_FILE = 'src/domain/userStates/index.ts'

type UserState = BaseUserState<string, string>
type Row = Omit<UserState, 'decayInterval'> & { decayInterval: number }

const defaults: Omit<UserState, keyof Row> = {}

const cols: Record<keyof Row, string> = {
  id: 'Id',
  displayName: 'Display Name',
  minValue: 'State: Min',
  maxValue: 'State: Max',
  tags: 'Stringified Tags',
  decayRate: 'State: Decay Rate',
  decayInterval: 'State: Decay Interval',
}

util.select<Row>(TABLE, VIEW, cols).then(util.defaults).then((rows) => {
  const data = util.indexBy(rows, 'id', (row): UserState => {
    if (row.decayInterval && !row.decayRate) {
      throw new Error('Invalid UserState has decayInterval but decayRate is 0')
    }

    return {
      ...row,
      decayRate: row.decayRate * 100,
      decayInterval: util.durationToInput(row.decayInterval),
      ...defaults,
    }
  })

  const tags = _.flatMap(rows, row => row.tags)
  const code = `import { BaseUserState } from './types'

const data = ${util.stringify(data)} as const

export type UserStateId = keyof typeof data
export type UserStateTag = ${util.enumerate(tags)}
export type UserState = Readonly<BaseUserState<UserStateId, UserStateTag>>
export const userStates: (Record<UserStateId, UserState> & typeof data) = data`

  util.updateFile(OUTPUT_FILE, code)
})
