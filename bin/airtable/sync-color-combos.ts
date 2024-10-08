import { BaseColorCombo } from '../../src/domain/colorCombos/types'
import * as util from './util'

const TABLE = 'Color Combos'
const VIEW = 'Exportable'
const OUTPUT_FILE = 'src/domain/colorCombos/index.ts'

type ColorCombo = BaseColorCombo<string>
type Row = Pick<ColorCombo, 'id' | 'text' | 'background'>

const defaults: Omit<ColorCombo, keyof Row> = {}

const cols: Record<keyof Row, string> = {
  id: 'Id',
  text: 'textColorId',
  background: 'backgroundColorId',
}

util.select<Row>(TABLE, VIEW, cols).then(async (rows) => {
  const data = util.indexBy(rows, 'id', (row): ColorCombo => {
    return {
      ...row,
      text: util.ref('colors', row.text),
      background: util.ref('colors', row.background),
      ...defaults,
    }
  })

  const code = `import { BaseColorCombo } from './types'

const data = ${util.stringify(data)} as const

export type ColorComboId = keyof typeof data
export type ColorCombo = Readonly<BaseColorCombo<ColorComboId>>
export const colorCombos: (Record<ColorComboId, ColorCombo> & typeof data) = data`

  util.updateFile(OUTPUT_FILE, code)
})
