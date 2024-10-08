import * as util from './util'
import { isColor } from '../../src/utils/misc'

const TABLE = 'Brand Color Palette'
const VIEW = 'Exportable'
const OUTPUT_FILE = 'src/domain/colors/index.ts'

type Row = { id: string; hex: string }

const cols: Record<keyof Row, string> = {
  id: 'Id',
  hex: 'Hex',
}

util.select<Row>(TABLE, VIEW, cols).then((rows) => {
  const lines = rows.map(row => {
    if (!isColor(row.hex)) {
      throw new Error(`Invalid color found: ${util.stringify(row)}`)
    }
    return `${row.id} = '${row.hex}',`
  })

  const code = `export enum colors {
${lines.join('\n')}
}`

  util.updateFile(OUTPUT_FILE, code)
})
