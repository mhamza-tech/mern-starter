import { Records } from 'airtable'
import * as util from './util'

/**
 * Example call:
 * npm run replace-airtable -- Strings String '{{ item }}' '{{ name item }}' --update
 */

const [table, field, search, replace, confirm] = process.argv.slice(2)

const filterByFormula = `FIND("${search}", {${field}})`

const base = util.base(table)
base.select({ fields: [field], filterByFormula, maxRecords: Infinity }).all().then(async (records: Records<any>) => {
  const len = records.length
  console.info(`Received ${len} records from Airtable's ${table}`)
  for (let i = 0; i < len; i++) {
    const record = records[i]
    const value = record.fields[field]
    if (!value) {
      continue
    }
    // Convert to JSON so it suports changes to numbers, booleans, arrays and objects
    const updated = JSON.parse(JSON.stringify(value).split(search).join(replace))
    if (updated === value) {
      continue
    }
    console.log(`(${i+1}/${len}) Updating record ${record.id}:\n- ${value}\n+ ${updated}\n`)
    if (confirm) {
      await base.update(record.id, { [field]: updated })
    }
  }
})
