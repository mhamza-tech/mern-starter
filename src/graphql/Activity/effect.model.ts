/**
 * @rob4lderman
 * mar2020
 *  
 * 
 */
import _ from 'lodash'
import { TYPEORM_CONNECTION } from 'src/env'
import {
  getConnection,
  Repository,
  LessThan,
  MoreThan,
} from 'typeorm'
import {
  sf,
  misc,
} from '../../utils'
import { Effect } from '../../db/entity'
import {
  PageInput,
  EntityType,
  CreateEffectInput,
  EffectsInput,
} from 'src/gql-types'
import {
  cursorToDate,
  resolvePage,
} from '../pageInput'
import { v4 } from 'uuid'
import * as models from '../models'

const DB_CONN_NAME = TYPEORM_CONNECTION
const DEFAULT_PAGE_SIZE = 10

/**
 * @return Promise w/ repository
 */
let cachedEffectRepository: Repository<Effect> = null
export const getEffectRepository = (): Promise<Repository<Effect>> => {
  return !!!_.isNil(cachedEffectRepository)
    ? Promise.resolve(cachedEffectRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Effect))
      .then(sf.tap(repository => {
        cachedEffectRepository = repository 
      }))
}

export const buildEffect = (input: CreateEffectInput, ctx: any): Effect => {
  const retMe = new Effect()
  // create the ID right away for perf opt.  Effects are always created
  // new, they are never updated, so there's no worry of an upsert or reassigning the ID.
  retMe.id = v4()
  retMe.entityType = EntityType.Effect
  retMe.sessionUserId = _.get(ctx, 'user.id')
  retMe.trackingId = _.get(ctx, 'trackingId')
  retMe.createdAt = new Date()
  retMe.updatedAt = new Date()
  retMe.recordVersion = 1
  return _.extend(
    retMe,
    _.pick(input, [
      'type',
      'collectionId',
      'metadata',
      'thisEid',
      'scope',
    ]),
    models.mapEidToThisEntityRef(input.thisEid)
  )
}

export const saveEffect = (effect: Effect): Promise<Effect> => {
  return getEffectRepository()
    .then(repo => repo.save(effect))
}

export const updateEffect = (id: string, set: object): Promise<any> => {
  return getEffectRepository()
    .then(sf.tap_wait(repo => repo.update(id, set)))
    .then(repo => repo.findOne(id))
}

export const readEffectsBy = (options: object): Promise<Effect[]> => {
  return getEffectRepository()
    .then(repo => repo.find(options))
}

/**
 * feed is in desc order. 
 * "before" in page terms == "later" in timestamps
 * "after" in page terms == "earlier" in timestamps
 *                                cursor
 *               |<-- last n before | first n after -->|
 * 12pm  11am  10am  9am  8am  7am  6am  5am  4am  3am  2am  1am
 */
export const readEffectsPageByCreatedAtDesc = (input: EffectsInput): Promise<Effect[]> => {
  const pageInput: PageInput = _.get(input, 'pageInput', { first: DEFAULT_PAGE_SIZE })
  return resolvePage(pageInput, {
    firstAfter: () => readEffectsBy({
      where: {
        collectionId: input.collectionId,
        createdAt: LessThan(cursorToDate(pageInput.afterCursor)),
      },
      order: {
        createdAt: 'DESC',
      },
      take: pageInput.first,
      cache: true,
    })
    ,
    firstBefore: () => readEffectsBy({
      where: {
        collectionId: input.collectionId,
        createdAt: MoreThan(misc.addMs(cursorToDate(pageInput.beforeCursor))),
      },
      order: {
        createdAt: 'DESC',
      },
      take: pageInput.first,
      cache: true,
    })
    ,
    lastAfter: () => readEffectsBy({
      where: {
        collectionId: input.collectionId,
        createdAt: LessThan(cursorToDate(pageInput.afterCursor)),
      },
      order: {
        createdAt: 'ASC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse)
    ,
    lastBefore: () => readEffectsBy({
      where: {
        collectionId: input.collectionId,
        createdAt: MoreThan(misc.addMs(cursorToDate(pageInput.beforeCursor))),
      },
      order: {
        createdAt: 'ASC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse),
    
  })
}
