import { BaseModifier } from '../../src/domain/modifiers/types'
import * as util from './util'

const TABLE = 'Entities'
const VIEW = 'Exportable: Modifiers'
const OUTPUT_FILE = 'src/domain/modifiers/index.ts'

type Modifier = BaseModifier<string>
type Row = Modifier

const defaults: Omit<Modifier, keyof Row> = {}

const cols: Record<keyof Row, string> = {
  id: 'Id',
  name: 'Display Name',
  operation: 'Modifier: Operation',
  description: 'Modifier: Description',
}

util.select<Row>(TABLE, VIEW, cols).then((rows) => {
  const data = util.indexBy(rows, 'id', (row): Modifier => {
    if (/\W/.test(row.id)) {
      throw new Error(`Invalid Id found: ${util.stringify(row)}`)
    }
    return { ...row, ...defaults }
  })

  const code = `import { BaseModifier } from './types'

const data = ${util.stringify(data)} as const

export type ModifierId = keyof typeof data
export type Modifier = Readonly<BaseModifier<ModifierId>>
export const modifiers: (Record<ModifierId, Modifier> & typeof data) = data`

  util.updateFile(OUTPUT_FILE, code)
})
