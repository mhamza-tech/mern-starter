import { BaseItem } from '../../src/domain/items/types'
import * as util from './util'

const TABLE = 'Entities'
const VIEW = 'Exportable: Items'
const OUTPUT_FILE = 'src/domain/items/index.ts'

type Item = BaseItem<string>
type Row = Pick<Item, 'name' | 'description' | 'text' | 's3Key' | 'creationSource' | 'socialTitle' | 'socialDescription' | 'prefix'>
& { creationTime: number; expirationTime: number; effectVState?: string; minUserAge?: string }

const defaults: Omit<Item, keyof Row> = {
  backgroundColor: '',
  dropAnimationS3Key: '',
  isDeleted: false,
}

const cols: Record<keyof Row, string> = {
  name: 'Id',
  text: 'Display Name',
  description: 'Product: Short Text',
  s3Key: 'imageId',
  creationTime: 'Craft or Generation Time',
  expirationTime: 'Items: Expiration Time',
  creationSource: 'Items: Creation Source',
  effectVState: 'Effect vState Id',
  socialTitle: 'Social: Title',
  socialDescription: 'Social: Description (150 characters)',
  prefix: 'Display Name Prefix',
  minUserAge: 'User Age: Min',
}

util.select<Row>(TABLE, VIEW, cols).then((rows) => {
  const data = util.indexBy(rows, 'name', (row): Item => {
    return {
      ...row,
      ...defaults,
      creationTime: util.durationToInput(row.creationTime),
      expirationTime: util.durationToInput(row.expirationTime),
      effectVState: row.effectVState && util.ref('vstates', row.effectVState),
      s3Key: util.ref('assets', row.s3Key, 's3Key'),
      backgroundColor: util.ref('assets', row.s3Key, 'backgroundColor'),
      // If it has an effect, disable the default drop animation
      dropAnimationS3Key: row.effectVState ? '' : undefined,
      minUserAge: row.minUserAge && parseInt(row.minUserAge) || 0,
      prefix: row.prefix || '',
    }
  })

  const code = `import { BaseItem } from './types'

const data = ${util.stringify(data)} as const

export type ItemName = keyof typeof data
export type Item = Readonly<BaseItem<ItemName>>
export const items: (Record<ItemName, Item> & typeof data) = data`

  util.updateFile(OUTPUT_FILE, code)
})
