/**
 * @rob4lderman
 * aug2019
 *  
 * 
 */
import _ from 'lodash'
import { TYPEORM_CONNECTION } from 'src/env'
import {
  getConnection,
  Repository,
} from 'typeorm'
import { sf } from '../../utils'
import {
  Activity,
  ActivityType,
} from '../../db/entity'
import {
  PageInput,
  ActionResultInput,
} from 'src/gql-types'
import {
  cursorToDate,
  resolvePage,
} from '../pageInput'
import {
} from 'src/services/types'

const DB_CONN_NAME = TYPEORM_CONNECTION

export const ACTIVITY_PAGE_SIZE = 25
export const DEFAULT_PAGE_SIZE = 10

/**
 * @return Promise w/ repository
 */
let cachedActivityRepository: Repository<Activity> = null
export const getActivityRepository = (): Promise<Repository<Activity>> => {
  return !!!_.isNil(cachedActivityRepository)
    ? Promise.resolve(cachedActivityRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Activity))
      .then(sf.tap(repository => {
        cachedActivityRepository = repository
      }))
}

export const readActivity = (id: string): Promise<Activity> => {
  return getActivityRepository()
    .then(repo => repo.findOne(id))
}

export const createActivity = (activity: Activity): Promise<Activity> => {
  return getActivityRepository()
    .then(repo => repo.save(activity))
}

export const updateActivity = (activity: Activity): Promise<Activity> => createActivity(activity)

export const readActivities = (page = 1): Promise<Activity[]> => {
  return getActivityRepository()
    .then(
      repo => repo.createQueryBuilder('activity')
        .where('activity.metadata is NOT NULL')
        // .andWhere( 'activity.activityType = :activityType', { activityType: ActivityType.ActionResult } )
        .orderBy('activity.createdAt', 'DESC')
        .offset((page - 1) * ACTIVITY_PAGE_SIZE)
        .limit(ACTIVITY_PAGE_SIZE)
        .getMany()
    )
}

export const readActivitiesNewerThan = (timestamp: Date, limit: number = ACTIVITY_PAGE_SIZE): Promise<Activity[]> => {
  // Postgres will return records that **equal** the timestamp, despite
  // the strictly-greater-than filter in the SQL.  This ends up returning
  // dup records to the frontend.  Workaround: add 1 ms to the timestamp.
  timestamp.setMilliseconds(timestamp.getMilliseconds() + 1)
  return getActivityRepository()
    .then(
      repo => repo.createQueryBuilder('activity')
        .where('activity.createdAt > :timestamp', { timestamp })
        // .andWhere( 'activity.activityType = :activityType', { activityType: ActivityType.ActionResult } )
        .andWhere('activity.metadata is NOT NULL')
        .orderBy('activity.createdAt', 'DESC')
        .limit(limit)
        .getMany()
    )
}

export const readActivitiesOlderThan = (timestamp: Date, limit: number = ACTIVITY_PAGE_SIZE): Promise<Activity[]> => {
  return getActivityRepository()
    .then(
      repo => repo.createQueryBuilder('activity')
        .where('activity.createdAt < :timestamp', { timestamp })
        // .andWhere( 'activity.activityType = :activityType', { activityType: ActivityType.ActionResult } )
        .andWhere('activity.metadata is NOT NULL')
        .orderBy('activity.createdAt', 'DESC')
        .limit(limit)
        .getMany()
    )
}

/**
 * feed is in desc order. "before" and "after" in page terms refers to "later"
 * and "earlier" in newsfeed item timestamps, respectively
 * 
 *                                cursor
 *               |<-- last n before | first n after -->|
 * 12pm  11am  10am  9am  8am  7am  6am  5am  4am  3am  2am  1am
 *
 */
export const readActivitiesByCreatedAtDescPage = (pageInput: PageInput): Promise<Activity[]> => {
  return resolvePage(pageInput, {
    firstAfter: () => readActivitiesByCreatedAtDescFirstNAfter(
      _.defaultTo(pageInput.first, ACTIVITY_PAGE_SIZE),
      cursorToDate(pageInput.afterCursor)
    ),
    firstBefore: () => readActivitiesByCreatedAtDescFirstNBefore(
      _.defaultTo(pageInput.first, ACTIVITY_PAGE_SIZE),
      cursorToDate(pageInput.beforeCursor)
    ),
    lastAfter: () => readActivitiesByCreatedAtDescLastNAfter(
      _.defaultTo(pageInput.last, ACTIVITY_PAGE_SIZE),
      cursorToDate(pageInput.afterCursor)
    ),
    lastBefore: () => readActivitiesByCreatedAtDescLastNBefore(
      _.defaultTo(pageInput.last, ACTIVITY_PAGE_SIZE),
      cursorToDate(pageInput.beforeCursor)
    ),
  })
}

/**
 * feed is in desc order, first n after is the next page, going backwards in time.
 * 
 *                                cursor
 *               |<-- last n before | first n after -->|
 * 12pm  11am  10am  9am  8am  7am  6am  5am  4am  3am  2am  1am
 *
 */
export const readActivitiesByCreatedAtDescFirstNAfter = (first: number, after: Date): Promise<Activity[]> => {
  return getActivityRepository()
    .then(
      repo => repo.createQueryBuilder('activity')
        .where('activity.createdAt < :after', { after })
        // .andWhere( 'activity.activityType = :activityType', { activityType: ActivityType.ActionResult } )
        .andWhere('activity.metadata is NOT NULL')
        .orderBy('activity.createdAt', 'DESC')
        .limit(first)
        .getMany()
    )
}

/** 
 * the feed is in desc order, "last N after" is literally the first N records in the db,
 * up to the after date.
 * 
 *                                cursor
 *                                  |         | --> last n after -->|
 * 12pm  11am  10am  9am  8am  7am  6am  5am  4am  3am  2am  1am  12am 
 
 */
export const readActivitiesByCreatedAtDescLastNAfter = (last: number, after: Date): Promise<Activity[]> => {
  return getActivityRepository()
    .then(
      repo => repo.createQueryBuilder('activity')
        .where('activity.createdAt < :after', { after })
        // .andWhere( 'activity.activityType = :activityType', { activityType: ActivityType.ActionResult } )
        .andWhere('activity.metadata is NOT NULL')
        .orderBy('activity.createdAt', 'ASC')
        .limit(last)
        .getMany()
    )
    .then(_.reverse)
}

/**
 * feed is in desc order, first n "before" in the feed is literally the 
 * first n elements in the feed, going backwards in time, down to the before date.
 * 
 *                                cursor
 * | --> first n before -->|         |         
 * 12pm  11am  10am  9am  8am  7am  6am  5am  4am  3am  2am  1am  12am 
 *
 */
export const readActivitiesByCreatedAtDescFirstNBefore = (first: number, before: Date): Promise<Activity[]> => {
  // Postgres will return records that **equal** the timestamp, despite
  // the strictly-greater-than filter in the SQL.  This ends up returning
  // dup records to the frontend.  Workaround: add 1 ms to the timestamp.
  before.setMilliseconds(before.getMilliseconds() + 1)
  return getActivityRepository()
    .then(
      repo => repo.createQueryBuilder('activity')
        .where('activity.createdAt > :before', { before })
        // .andWhere( 'activity.activityType = :activityType', { activityType: ActivityType.ActionResult } )
        .andWhere('activity.metadata is NOT NULL')
        .orderBy('activity.createdAt', 'DESC')
        .limit(first)
        .getMany()
    )
}

/**
 * feed is in desc order, last n "before" in the feed is the 
 * previous page, going forwards in time, from the before date.
 * 
 *                                cursor
 *               |<-- last n before | first n after -->|
 * 12pm  11am  10am  9am  8am  7am  6am  5am  4am  3am  2am  1am
 */
export const readActivitiesByCreatedAtDescLastNBefore = (first: number, before: Date): Promise<Activity[]> => {
  // Postgres will return records that **equal** the timestamp, despite
  // the strictly-greater-than filter in the SQL.  This ends up returning
  // dup records to the frontend.  Workaround: add 1 ms to the timestamp.
  before.setMilliseconds(before.getMilliseconds() + 1)
  return getActivityRepository()
    .then(
      repo => repo.createQueryBuilder('activity')
        .where('activity.createdAt > :before', { before })
        // .andWhere( 'activity.activityType = :activityType', { activityType: ActivityType.ActionResult } )
        .andWhere('activity.metadata is NOT NULL')
        .orderBy('activity.createdAt', 'ASC')
        .limit(first)
        .getMany()
    )
    .then(_.reverse)
}

export const buildActivityFromActionResultInput = (actionResult: ActionResultInput): Activity => {
  const activity = new Activity()
  activity.actionResultId = actionResult.actionResultId
  activity.userId = actionResult.userId
  activity.unObjectId = actionResult.unObjectId
  activity.activityType = ActivityType.ActionResult
  activity.trackingId = actionResult.trackingId
  return activity
}

export const setActivityMetadata = (activity: Activity, metadata: any): Activity => {
  return _.extend(activity, { metadata })
}

export const readActivitiesByTrackingId = (trackingId: string): Promise<Activity[]> => {
  return getActivityRepository()
    .then(repo => repo.find({ trackingId }))
}

export * from './field.model'
export * from './edge.model'
export * from './tile.model'
export * from './effect.model'
export * from './notification.model'
