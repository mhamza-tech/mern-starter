import { BaseHashtribute } from '../../src/domain/hashtributes/types'
import * as util from './util'

const TABLE = 'Entities'
const VIEW = 'Exportable: Hashtributes'
const OUTPUT_FILE = 'src/domain/hashtributes/index.ts'

type Hashtribute = BaseHashtribute<string>
type Row = Pick<Hashtribute, 'id' | 'displayName' | 'description' | 'silent' | 'thumbImageS3Key'>

const defaults: Omit<Hashtribute, keyof Row> = {}

const cols: Record<keyof Row, string> = {
  id: 'Id',
  displayName: 'Display Name',
  description: 'Product: Short Text',
  silent: 'Hashtribute: isSilent',
  thumbImageS3Key: 'imageId',
}

util.select<Row>(TABLE, VIEW, cols).then(util.defaults).then((rows) => {
  const data = util.indexBy(rows, 'id', row => {
    if (row.displayName.includes(' ')) {
      throw new Error(`Invalid Hashtribute, displayName has space: ${util.stringify(row)}`)
    }

    const hashtribute: Hashtribute = {
      ...row,
      ...defaults,
      thumbImageS3Key: util.ref('assets', row.thumbImageS3Key, 's3Key'),
    }
    return hashtribute
  })

  const code = `import { BaseHashtribute } from './types'

const data = ${util.stringify(data)} as const

export type HashtributeId = keyof typeof data
export type Hashtribute = Readonly<BaseHashtribute<HashtributeId>>
export const hashtributes: (Record<HashtributeId, Hashtribute> & typeof data) = data`

  util.updateFile(OUTPUT_FILE, code)
})
