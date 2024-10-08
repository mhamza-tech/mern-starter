import { BaseMove } from '../../src/domain/moves/types'
import * as util from './util'

const TABLE = 'Entities'
const VIEW = 'Exportable: Moves'
const OUTPUT_FILE = 'src/domain/moves/index.ts'

type Move = BaseMove<string>
type Row = Pick<Move, 'name' | 'description' | 'text' | 's3Key' | 'damage' | 'socialTitle' | 'socialDescription' | 'prefix' | 'verb' | 'pastVerb'> &
{ cooldown?: number; effectVState: string; buffVState?: string; minUserAge?: string }

const defaults: Omit<Move, keyof Row> = {
  backgroundColor: '',
  dropAnimationS3Key: '',
  isDeleted: false,
}

const cols: Record<keyof Row, string> = {
  name: 'Id',
  text: 'Display Name',
  description: 'Product: Short Text',
  s3Key: 'imageId',
  damage: 'Move: Damage',
  cooldown: 'Move: Cooldown',
  effectVState: 'Effect vState Id',
  buffVState: '_Move: Buff vState Id',
  socialTitle: 'Social: Title',
  socialDescription: 'Social: Description (150 characters)',
  prefix: 'Display Name Prefix',
  verb: 'Move: Verb Present',
  pastVerb: 'Move: Verb Past',
  minUserAge: 'User Age: Min',
}

util.select<Row>(TABLE, VIEW, cols).then((rows) => {
  const data = util.indexBy(rows, 'name', (row): Move => {
    return util.compact({
      ...row,
      ...defaults,
      cooldown: util.durationToInput(row.cooldown),
      effectVState: util.ref('vstates', row.effectVState),
      buffVState: row.buffVState && util.ref('vstates', row.buffVState),
      s3Key: row.s3Key ? util.ref('assets', row.s3Key, 's3Key') : '',
      backgroundColor: row.s3Key ? util.ref('assets', row.s3Key, 'backgroundColor') : '#F6F6F6',
      minUserAge: row.minUserAge && parseInt(row.minUserAge) || 0,
      prefix: row.prefix || '',
    })
  })

  const code = `import { BaseMove } from './types'

const data = ${util.stringify(data)} as const

export type MoveName = keyof typeof data
export type Move = Readonly<BaseMove<MoveName>>
export const moves: (Record<MoveName, Move> & typeof data) = data`

  util.updateFile(OUTPUT_FILE, code)
})
