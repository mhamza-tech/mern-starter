import axios from 'axios'
import { Attachment } from 'airtable'
import { BaseAsset } from '../../src/domain/assets/types'
import * as util from './util'
import { isColor } from '../../src/utils/misc'
import * as aws from '../../src/services/aws'

const TABLE = 'Assets'
const VIEW = 'Exportable'
const OUTPUT_FILE = 'src/domain/assets/index.ts'
const S3_DIR = 'static'

type Asset = BaseAsset<string>
type Row = Pick<Asset, 'id' | 's3Key' | 'backgroundColor'> & { files?: Attachment[] }

const defaults: Omit<Asset, keyof Row> = {}

const cols: Record<keyof Row, string> = {
  id: 'Id',
  s3Key: 'Source Updated At',
  backgroundColor: 'Background Color Hex',
  files: 'Source File',
}

const syncFiles = async (rows: Row[]): Promise<void> => {
  const existing = await aws.listFiles(S3_DIR)
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const [file] = row.files || []
    if (!row.s3Key || !file) {
      // Colors don't have an s3Key, assign the color
      row.s3Key = row.backgroundColor!
      continue
    }
    // Take the extension from the Attachment
    const ext = file.url.split('.').pop()
    // row.s3Key has only the last modified time
    const s3Key = row.s3Key = `${S3_DIR}/${row.id}_${row.s3Key}.${ext}`
    // TODO: should it compare bytes and the like to make sure the file was uploaded correctly?
    if (existing.includes(s3Key)) {
      continue
    }
    // Uploading in parallel should be a bit faster but it's harder to keep track of progress from the console
    console.log(`(${i + 1}/${rows.length}) Uploading ${file.url} (${file.type}, ${file.size}b) to ${s3Key}...`)
    await upload(file, s3Key)
  }
}

const upload = async (file: Attachment, key: string): Promise<void> => {
  const res = await axios.get(file.url, { responseType: 'stream' })
  await aws.upload(key, res.data, { ContentType: file.type, ContentLength: file.size })
}

util.select<Row>(TABLE, VIEW, cols).then(async (rows) => {
  await syncFiles(rows)
  const data = util.indexBy(rows, 'id', row => {
    delete row.files
    const asset: Asset = { ...row, ...defaults }
    if (!isColor(asset.backgroundColor)) {
      throw new Error(`Invalid color found: ${util.stringify(row)}`)
    }
    return asset
  })

  const code = `import { BaseAsset } from './types'

const data = ${util.stringify(data)} as const

export type AssetId = keyof typeof data
export type Asset = Readonly<BaseAsset<AssetId>>
export const assets: (Record<AssetId, Asset> & typeof data) = data`

  util.updateFile(OUTPUT_FILE, code)
})
