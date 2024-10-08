import { BaseNPC } from '../../src/domain/npcs/types'
import * as util from './util'
import { keysOf } from '../../src/utils/misc'

const TABLE = 'Entities'
const VIEW = 'Exportable: Playrooms'
const OUTPUT_FILE = 'src/domain/npcs/index.ts'

type NPC = BaseNPC<string>
type Row = Omit<NPC, 'eid' | 'socialImageS3Key' | 'backgroundColor' | 'rewards' | 'minUserAge' | 'isFeatured'>
& { rewards: string[]; minUserAge?: string }

const defaults: Omit<NPC, keyof Row> = {
  isFeatured: false,
  backgroundColor: '',
  socialImageS3Key: '',
  eid: '',
}

const cols: Record<keyof Row, string> = {
  id: 'Id',
  name: 'Display Name',
  hashtribute: 'playroomEffectedHashtributeId',
  minOccupancy: 'Playroom: Min Occ.',
  maxOccupancy: 'Playroom: Max Occ.',
  description: 'Product: Short Text',
  bio: 'Product: Biography',
  socialTitle: 'Social: Title',
  socialDescription: 'Social: Description (150 characters)',
  visibleForRole: 'Playroom: Visible For Role',
  showBackpack: 'Playroom: Show Backpack',
  showControlBar: 'Playroom: Show Control Bar',
  showResetButton: 'Playroom: Show Reset Button',
  allowHashtributeNotifications: 'Playroom: Allow Hashtribute Notifications',
  disableButtonsUponAction: 'Playroom: Disable Buttons Upon Action',
  isDestination: 'Playroom: Is Destination',
  featuredSortKey: 'featuredSortKey',
  s3Key: 'imageId',
  backgroundS3Key: 'backgroundImageId',
  coverS3Key: 'coverImageId',
  rewards: 'playroomYieldedItems',
  prefix: 'Display Name Prefix',
  minUserAge: 'User Age: Min',
  isDeleted: 'Is Deleted',
  handler: 'Playroom: Handler',
  gender: 'Playroom: Gender',
}

util.select<Row>(TABLE, VIEW, cols).then(util.defaults).then((rows) => {
  const data = util.indexBy(rows, 'id', row => {
    // We get `false` and `null` as undefined
    for (const prop of keysOf(row)) {
      if (row[prop] === undefined && prop !== 'hashtribute' && prop !== 'featuredSortKey' && prop !== 'handler') {
        row[prop] = null as never
      }
    }
    const npc: NPC = {
      ...row,
      ...defaults,
      visibleForRole: util.ref('Role', row.visibleForRole),
      s3Key: row.s3Key && util.ref('assets', row.s3Key, 's3Key'),
      backgroundS3Key: row.backgroundS3Key && util.ref('assets', row.backgroundS3Key, 's3Key'),
      backgroundColor: util.ref('assets', row.coverS3Key, 'backgroundColor'),
      coverS3Key: util.ref('assets', row.coverS3Key, 's3Key'),
      socialImageS3Key: util.ref('assets', row.coverS3Key, 's3Key'),
      hashtribute: row.hashtribute && util.ref('hashtributes', row.hashtribute),
      eid: `unobject/${row.id}`,
      rewards: row.rewards.map(name => util.ref('items', name)),
      minUserAge: row.minUserAge && parseInt(row.minUserAge) || 0,
      prefix: row.prefix || '',
      isFeatured: !!row.featuredSortKey,
      gender: util.ref('Gender', row.gender),
    }
    return npc
  })

  const code = `import { BaseNPC } from './types'

const data = ${util.stringify(data)} as const

export type NPCId = keyof typeof data
export type NPC = Readonly<BaseNPC<NPCId>>
export const npcs: (Record<NPCId, NPC> & typeof data) = data`

  util.updateFile(OUTPUT_FILE, code)
})
