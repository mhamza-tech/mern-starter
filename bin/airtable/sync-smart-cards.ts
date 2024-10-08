import { SmartCard } from '../../src/domain/smartCards/types'
import * as util from './util'

const TABLE = 'Smart Cards'
const VIEW = 'Exportable'
const OUTPUT_FILE = 'src/domain/smartCards/index.ts'

type Row = Omit<SmartCard, 'foregroundImage' | 'backgroundImage' | 'minUserAge'>
& { foregroundImage: string; backgroundImage?: string; minUserAge?: string }

const defaults: Omit<SmartCard, keyof Row> = {}

const cols: Record<keyof Row, string> = {
  id: 'trackingId',
  title: 'Title',
  description: 'Description',
  foregroundImage: 'Foreground Image Id',
  excludeIfGender: 'Exclude if Gender',
  includeIfInInventory: 'includeIfInInventoryIds',
  excludeIfInInventory: 'excludeIfInInventoryIds',
  actionType: 'Action Type',
  feedItemActionType: 'FeedItemActionType',
  entityId: 'entityId',
  entityType: 'entityType',
  sortBy: 'sortBy',
  groupBy: 'groupBy',
  minFriends: 'Min Friends Required',
  maxFriends: 'Max Friends Required',
  stateId: 'stateId',
  minState: 'State: Min',
  maxState: 'State: Max',
  hashtributeId: 'hashtributeId',
  minHashtribute: 'Hashtribute: Min',
  maxHashtribute: 'Hashtribute: Max',
  infoBlock: 'Info Block',
  counterId: 'counterId',
  minCounter: 'Counter: Min',
  maxCounter: 'Counter: Max',
  backgroundImage: 'backgroundImageId',
  minUserAge: 'User Age: Min',
}

util.select<Row>(TABLE, VIEW, cols).then(util.defaults).then((rows) => {
  const smartCards = rows.map((row): SmartCard => {
    return {
      ...row,
      foregroundImage: util.ref('assets', row.foregroundImage),
      backgroundImage: row.backgroundImage && util.ref('assets', row.backgroundImage),
      excludeIfGender: row.excludeIfGender && util.ref('Gender', row.excludeIfGender),
      entityType: row.entityType && util.ref('FeedItemActionEntityType', row.entityType),
      feedItemActionType: row.feedItemActionType && util.ref('FeedItemActionType', row.feedItemActionType),
      minState: row.minState && row.minState * 100,
      maxState: row.maxState && row.maxState * 100,
      minUserAge: row.minUserAge && parseInt(row.minUserAge) || 0,
      ...defaults,
    }
  })

  const code = `import { SmartCard } from './types'
import { listOf } from 'src/utils/misc'
export * from './types'

export const smartCards = listOf<SmartCard>(${util.stringifyRows(smartCards)})`

  util.updateFile(OUTPUT_FILE, code)
})
