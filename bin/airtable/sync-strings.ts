import _ from 'lodash'
import { StringRow } from '../../src/domain/strings/types'
import * as util from './util'

const TABLE = 'Strings'
const VIEW = 'Exportable'
const OUTPUT_FILE = 'src/domain/strings/index.ts'

type Row = StringRow<string>

const cols: Record<keyof Row, string> = {
  id: 'Id',
  string: 'String',
  tags: 'Stringified Tags',
}

util.select<Row>(TABLE, VIEW, cols).then((rows) => {
  const tags = _.flatMap(rows, row => row.tags)
  const code = `import { StringRow } from './types'
import { deepFreeze } from 'src/utils/misc'

export type StringTag = ${util.ref('MoveName')} | ${util.ref('ItemName')} | ${util.ref('UserStateId')} | ${util.ref('NPCId')} | ${util.ref('HashtributeId')} | ${util.ref('ModifierId')} | number |
${util.enumerate(tags)}

export type StringTags = Readonly<StringTag[]>

export const strings = deepFreeze<StringRow<string>[]>(${util.stringifyRows(rows)})`

  util.updateFile(OUTPUT_FILE, code)
})
