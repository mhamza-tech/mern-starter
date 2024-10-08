import Airtable, { Records } from 'airtable'
import moment, { DurationInputObject } from 'moment'
import _ from 'lodash'
import open from 'open'
import { spawnSync } from 'child_process'
import { writeFileSync } from 'fs'
import { inspect } from 'util'
import { keysOf } from '../../src/utils/misc'

const { AIRTABLE_API_KEY, AIRTABLE_DB } = process.env
if (!AIRTABLE_DB) {
  throw new Error('No AIRTABLE_DB was provided')
}

const SCRIPT_FILE = process.argv[1].replace(process.cwd(), '')

export const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_DB)

export const select = <T>(table: string, view: string, cols: Record<keyof T, string>, maxRecords = Infinity): Promise<T[]> => {
  console.info(`Fetching the records for ${table} > ${view}`)
  return base(table).select({ view, maxRecords, fields: Object.values(cols) }).all().then((records: Records<any>) => {
    console.info(`Received ${records.length} records from Airtable's ${table} > ${view}`)

    return records.map(record => {
      const row: Partial<T> = {}
      for (const prop in cols) {
        row[prop] = record.fields[cols[prop]]
      }
      return row as T
    })
  }).catch((err: Error) => {
    console.error('Failed to fetch data from Airtable:', err)
    process.exit(1)
  })
}

export const defaults = <T>(rows: T[]): T[] => {
  const defaults: { [K in keyof T]?: any } = {}
  for (const row of rows) {
    for (const prop in row) {
      const val = row[prop]
      if (_.isBoolean(val)) {
        defaults[prop] = false
      } else if (_.isArray(val)) {
        defaults[prop] = []
      }
    }
  }
  for (const row of rows) {
    _.defaults(row, defaults)
  }
  return rows
}

export const indexBy = <T, U>(rows: U[], prop: keyof U, mapper: (row: U) => T = _.identity): Record<string, T> => {
  const map: Record<string, T> = {}
  rows.forEach(row => {
    const key = row[prop] as any
    if (key in map) {
      throw new Error(`Duplicate key while indexing: "${key}"`)
    }
    map[key] = mapper(row)
  })
  return map
}

export const compact = <T>(data: T): T => {
  return _.omitBy(data, _.isUndefined) as T
}

export const deepCompact = <T>(map: T): T => {
  for (const key in map) {
    const data = map[key]
    if (_.isObject(data)) {
      map[key] = deepCompact(data)
    } else if (_.isUndefined(data)) {
      delete map[key]
    }
  }
  return map
}

enum Imports {
  assets = 'src/domain/assets',
  moves = 'src/domain/moves',
  MoveName = 'src/domain/moves',
  items = 'src/domain/items',
  ItemName = 'src/domain/items',
  modifiers = 'src/domain/modifiers',
  ModifierId = 'src/domain/modifiers',
  UserStateId = 'src/domain/userStates',
  hashtributes = 'src/domain/hashtributes',
  HashtributeId = 'src/domain/hashtributes',
  NPCId = 'src/domain/npcs',
  vstates = 'src/maker/vstate/db',
  colors = 'src/domain/colors',
  Gender = 'src/gql-types',
  Role = 'src/gql-types',
  FeedItemActionType = 'src/gql-types',
  FeedItemActionEntityType = 'src/gql-types',
  DynamicFeedItemLayout = 'src/gql-types',
  SystemMessageStyle = 'src/gql-types',
}

type Import = keyof typeof Imports

const imported: { [K in Import]?: boolean } = {}

export const wrapCode = (code: string): string => {
  return `<--${code}-->`
}

export const ref = (from: Import, ...props: string[]): string => {
  imported[from] = true
  return wrapCode([from, ...props].join('.'))
}

export const stringify = (data: any): string => {
  if (!_.isObject(data)) {
    // util.inspect doesn't properly render primitives
    return JSON.stringify(data)
  }

  return inspect(deepCompact(data), { depth: null, breakLength: 120, maxArrayLength: Infinity })
}

export const stringifyRows = (rows: any[]): string => {
  return `[\n  ${rows.map(stringify).join(',\n')}\n]`
}

export const enumerate = (values: string[]): string => {
  return _(values).compact().uniq().map(value => `'${value}'`).sort().join(' | ')
}

const getImport = (from: Import): string => {
  return `import { ${from} } from '${Imports[from]}'`
}

export const updateFile = (path: string, code: string): void => {
  const imports = keysOf(imported).sort().map(getImport).join('\n')
  // peel bits of code that we save as string so we can use inpect() as usual
  const refRegex = new RegExp(`['"]?${wrapCode('(.*?)')}['"]?`, 'g')

  const data = `/* NOTE: This file is auto-generated by ${SCRIPT_FILE}, don't override manually */\n
${imports}
${code.replace(refRegex, '$1')}`

  writeFileSync(path, data)

  console.info('Running eslint --fix on', path)
  spawnSync('eslint', ['--cache', '--fix', path])

  console.info(path, 'has been synced successfully')

  if (process.env.OPEN) {
    console.log('Opening', path, 'with default handler')
    open(path)
  }
}

type DurationKeys = (keyof DurationInputObject & keyof moment.Duration)[]

// Airtable durations (01:20) we get as seconds, convert to a nice object
export const durationToInput = (seconds: number | undefined): DurationInputObject | undefined => {
  if (!seconds) {
    return undefined
  }
  // Returning { seconds } would be enough but I rather adjust to a nicer output
  const duration = moment.duration({ seconds })
  const input: DurationInputObject = {}
  const keys: DurationKeys = ['days', 'hours', 'minutes', 'seconds']
  for (const key of keys) {
    if (duration[key]()) {
      input[key] = duration[key]()
    }
  }
  return _.isEmpty(input) ? undefined : input
}

export const parseDate = (date: string): Date => {
  date = new Date(date).toISOString().replace('.000', '')
  return wrapCode(`new Date('${date}')`) as any
}
