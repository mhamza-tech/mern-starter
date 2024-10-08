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
  EntityManager,
  Brackets,
  SelectQueryBuilder,
  FindManyOptions,
} from 'typeorm'
import {
  sf,
  misc,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  Activity,
  Edge,
  EdgeStats,
} from '../../db/entity'
import {
  PageInput,
  CreateUserEdgeInput,
  EdgeType,
  EntityType,
  EdgeDirection,
  EdgesInput,
  CreateEdgeInput,
  EdgeStatsInput,
  SaveEdgeInput,
} from 'src/gql-types'
import {
  cursorToDate,
  resolvePage,
} from '../pageInput'
import moment from 'moment'
import { v4 } from 'uuid'
import * as dbUtils from '../../db/utils'

const logger = LoggerFactory('edge.model')
const DB_CONN_NAME = TYPEORM_CONNECTION
// const SITE_ENTITY_ID = 'site';
const DEFAULT_PAGE_SIZE = 10

/**
 * @return Promise w/ repository
 */
let cachedEdgeRepository: Repository<Edge> = null
export const getEdgeRepository = (): Promise<Repository<Edge>> => {
  return !!!_.isNil(cachedEdgeRepository)
    ? Promise.resolve(cachedEdgeRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Edge))
      .then(sf.tap(repository => {
        cachedEdgeRepository = repository 
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedEdgeStatsRepository: Repository<EdgeStats> = null
export const getEdgeStatsRepository = (): Promise<Repository<EdgeStats>> => {
  return !!!_.isNil(cachedEdgeStatsRepository)
    ? Promise.resolve(cachedEdgeStatsRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(EdgeStats))
      .then(sf.tap(repository => {
        cachedEdgeStatsRepository = repository 
      }))
}

export const buildUserEdge = (userId: string, input: CreateUserEdgeInput): Edge => {
  const edge = new Edge()
  edge.thisEntityId = userId
  edge.thisEntityType = EntityType.User
  edge.thatEntityId = input.thatEntityId
  edge.thatEntityType = EntityType[input.thatEntityType]
  edge.edgeType = EdgeType[input.edgeType]
  edge.metadata = input.metadata
  return edge
}

export const buildUserEdgeLikesViaActivity = (activityEdge: Edge, activity: Activity): Edge => {
  const edge = new Edge()
  edge.thisEntityId = activityEdge.thisEntityId
  edge.thisEntityType = activityEdge.thisEntityType
  edge.thatEntityId = activity.unObjectId
  edge.thatEntityType = EntityType.UnObject
  edge.edgeType = activityEdge.edgeType
  edge.metadata = activityEdge.metadata
  return edge
}

export const storySaveEdgeInput = (input: {
  thisEntityId: string
  thatEntityId: string
  fieldId: string
  edgeType: EdgeType
}): SaveEdgeInput => {
  const date = new Date()
  return {
    thisEntityId: input.thisEntityId,
    thisEntityType: EntityType.User,
    thatEntityId: input.thatEntityId,
    thatEntityType: EntityType.User,
    edgeType: input.edgeType,
    collectionId: input.fieldId,
    isDeleted: false,
    updatedAt: date,
    order: date.toISOString(),
  }
}

export const deleteEdge = (edge: Edge): Promise<any[]> => {
  return getConnection(DB_CONN_NAME)
    .createQueryBuilder()
    .delete()
    .from(Edge)
    .where('thisEntityId = :thisEntityId', edge)
    .andWhere('thatEntityId = :thatEntityId', edge)
    .andWhere('edgeType = :edgeType', edge)
    .returning('id')
    .execute()
    .then(sf.tap(val => logger.log('deleteEdge', { val, edge })))
}

const buildInboundEdgeStatsForEdge = (edge: Edge): EdgeStats => {
  const edgeStats = new EdgeStats()
  edgeStats.entityId = edge.thatEntityId
  edgeStats.edgeDirection = EdgeDirection.Inbound
  edgeStats.count = 0
  edgeStats.edgeType = edge.edgeType
  return edgeStats
}

const buildOutboundEdgeStatsForEdge = (edge: Edge): EdgeStats => {
  const edgeStats = new EdgeStats()
  edgeStats.entityId = edge.thisEntityId
  edgeStats.edgeDirection = EdgeDirection.Outbound
  edgeStats.count = 0
  edgeStats.edgeType = edge.edgeType
  return edgeStats
}

// const buildSiteEdgeStatsForEdge = (edge: Edge) => {
//   const edgeStats = new EdgeStats();
//   edgeStats.entityId = SITE_ENTITY_ID;
//   edgeStats.edgeDirection = EdgeDirection.Inbound;
//   edgeStats.count = 0;
//   edgeStats.edgeType = edge.edgeType;
//   return edgeStats;
// };

export const createOrReadEdge = (edge: Edge): Promise<any> => {
  return getEdgeRepository()
    .then(repo => repo.save(edge))
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err))(
      err => readEdgeBy(_.pick(edge, ['thisEntityId', 'thatEntityId', 'edgeType']))
        .then(sf.thru_if((edge: Edge) => !!!edge)(
          () => {
            throw err 
          }
        ))
    )(
      err => {
        throw err 
      }
    ))
}

const updateOrCreateEdge = (edge: Edge, recursionLevel = 0): Promise<Edge> => {
  return getConnection(DB_CONN_NAME).transaction(
    'READ UNCOMMITTED',
    (entityManager: EntityManager) => updateOrCreateEdgeInTransaction(entityManager, edge)
  )
    // .catch(sf.tap_throw(err => logger.error('updateOrCreateEdge.RACE', { recursionLevel, err, edge })))
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err) && recursionLevel <= 0)(
      () => updateOrCreateEdge(edge, recursionLevel + 1)
    )(
      (err) => {
        throw err 
      }
    ))
}

const updateOrCreateEdgeInTransaction = (entityManager: EntityManager, edge: Edge): Promise<Edge> => {
  return Promise.resolve(entityManager)
    .then((entityManager: EntityManager) => entityManager.createQueryBuilder(Edge, 'edge'))
    .then((qb: SelectQueryBuilder<Edge>) => qb.where(new Brackets(
      qb => qb.where('edge.thisEntityId = :thisEntityId', _.pick(edge, 'thisEntityId'))
        .andWhere('edge.thatEntityId = :thatEntityId', _.pick(edge, 'thatEntityId'))
        .andWhere('edge.edgeType = :edgeType', _.pick(edge, 'edgeType'))
        .andWhere('edge.collectionId = :collectionId', { collectionId: _.defaultTo(_.get(edge, 'collectionId'), '') })
    )))
    .then((qb: SelectQueryBuilder<Edge>) => qb.orWhere(new Brackets(
      qb => qb.where('edge.thisEntityId = :thisEntityId', _.pick(edge, 'thisEntityId'))
        .andWhere('edge.name = :name', { name: _.defaultTo(_.get(edge, 'name'), '') })
    )))
    .then((qb: SelectQueryBuilder<Edge>) => qb.setLock('pessimistic_write'))
    .then((qb: SelectQueryBuilder<Edge>) => qb.getOne())
    .then(sf.thru_if_else(_.isNil)(
      // Create new edge
      () => entityManager.save(edge)
      // -rx- .then( sf.tap( result => logger.log( 'updateOrCreateEdge.save.create', {result})) )
    )(
      // Update existing edge
      (edgeRecord: Edge) => entityManager.update(
        Edge,
        edgeRecord.id,
        _.extend(
          _.omit(dbUtils.safeEntityUpdate(edge), ['thisEid', 'thatEid']),
          { count: edge.isDeleted ? 0 : edgeRecord.count + 1 },
          { metadata: _.extend({}, edgeRecord.metadata, edge.metadata) }
        )
      )
        // -rx- .then( sf.tap( result => logger.log( 'updateOrCreateEdge.save.update', {result})) )
        .then(() => entityManager.findOne(Edge, edgeRecord.id))
    ))
}

export const createOrUpdateEdge = (edge: Edge): Promise<Edge> => {
  return updateOrCreateEdge(edge)
}

export const updateEdgesBy = (options: object, set: object): Promise<any> => {
  return getEdgeRepository()
    .then(sf.tap_wait(repo => repo.update(options, set)))
}

export const updateEdge = (id: string, set: object): Promise<any> => {
  // logger.info( 'updateEdge', { id, set });
  return getEdgeRepository()
    .then(sf.tap_wait(repo => repo.update(id, set)))
    .then(repo => repo.findOne(id))
}

export const mapCreateEdgeInputToEdge = (input: CreateEdgeInput): Edge => {
  const retMe = new Edge()
  retMe.id = v4()
  retMe.isDeleted = false
  return _.extend(retMe, _.pick(input, [
    'thisEntityId',
    'thisEntityType',
    'thatEntityId',
    'thatEntityType',
    'edgeType',
    'name',
    'collectionId',
    'collectionName',
    'metadata',
    'order',
    'sortKey1',
    'sortKey2',
    'updatedAt',
  ]))
}

export const mapSaveEdgeInputToEdge = (input: SaveEdgeInput): Edge => {
  const retMe = new Edge()
  retMe.isDeleted = _.defaultTo(_.get(input, 'isDeleted'), false)
  retMe.updatedAt = new Date()
  return _.extend(retMe, _.pick(input, [
    'id',
    'thisEntityId',
    'thisEntityType',
    'thatEntityId',
    'thatEntityType',
    'edgeType',
    'name',
    'collectionId',
    'collectionName',
    'metadata',
    'order',
    'sortKey1',
    'sortKey2',
    'updatedAt',
  ]))
}

export const createOrReadEdgeStats = (edgeStats: EdgeStats): Promise<EdgeStats> => {
  return getEdgeStatsRepository()
    .then(repo => repo.save(edgeStats))
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err))(
      err => readOneEdgeStatsBy(_.pick(edgeStats, ['entityId', 'edgeDirection', 'edgeType']))
        .then(sf.thru_if(_.isNil)(
          () => {
            throw err 
          }
        ))
    )(
      err => {
        throw err 
      }
    ))
}

export const readEdgeCountBy = (options: any): Promise<number> => {
  const thisEntityFilter = _.isNil(options.thisEntityId)
    ? ''
    : ` and "edge"."thisEntityId" = '${options.thisEntityId}' `
  const thatEntityFilter = _.isNil(options.thatEntityId)
    ? ''
    : ` and "edge"."thatEntityId" = '${options.thatEntityId}' `
  const manager: EntityManager = getConnection(DB_CONN_NAME).manager
  return manager.query(
    'select SUM(count) as cnt'
    + ' from "edge"'
    + ` where "edge"."edgeType" = '${options.edgeType}'`
    + thisEntityFilter
    + thatEntityFilter
    + ' and "edge"."isDeleted" = false '
  )
    .then((raw: any) => _.defaultTo(_.get(_.first(raw), 'cnt'), 0))
}

const sumInboundEdgeCount = (edge: Edge): Promise<number> => {
  return readEdgeCountBy({
    thatEntityId: edge.thatEntityId,
    edgeType: edge.edgeType,
  })
}

const sumOutboundEdgeCount = (edge: Edge): Promise<number> => {
  return readEdgeCountBy({
    thisEntityId: edge.thisEntityId,
    edgeType: edge.edgeType,
  })
}

export const saveEdgeStats = (edgeStats: EdgeStats): Promise<EdgeStats> => {
  return getEdgeStatsRepository()
    .then(repo => repo.save(edgeStats)
      .then(() => repo.findOne(edgeStats.id))
    )
}

export const updateEdgeStatsForEdge = (edge: Edge): Promise<EdgeStats[]> => {
  return Promise.all([
    updateInboundEdgeStats(edge)
      .then(saveEdgeStats),
    updateOutboundEdgeStats(edge)
      .then(saveEdgeStats),
  ])
}

export const updateInboundEdgeStats = (edge: Edge): Promise<EdgeStats> => {
  return Promise.resolve(buildInboundEdgeStatsForEdge(edge))
    .then(createOrReadEdgeStats)
    .then(edgeStats => sumInboundEdgeCount(edge)
      .then(count => ({ ...edgeStats, count } as EdgeStats))
    )
}

export const updateOutboundEdgeStats = (edge: Edge): Promise<EdgeStats> => {
  return Promise.resolve(buildOutboundEdgeStatsForEdge(edge))
    .then(createOrReadEdgeStats)
    .then(edgeStats => sumOutboundEdgeCount(edge)
      .then(count => ({ ...edgeStats, count } as EdgeStats))
    )
}

export const readEdgeStats = (entityId: string): Promise<EdgeStats[]> => {
  return getEdgeStatsRepository()
    .then(
      repo => repo.createQueryBuilder('edgeStats')
        .where('edgeStats.entityId = :entityId', { entityId })
        .getMany()
    )
}

export const readEdgeStatsBy = (options: object): Promise<EdgeStats[]> => {
  return getEdgeStatsRepository()
    .then(repo => repo.find(options))
}

export const readOneEdgeStatsBy = (options: object): Promise<EdgeStats> => {
  return getEdgeStatsRepository()
    .then(repo => repo.findOne(options))
}

export const readEdgeById = (id: string): Promise<Edge> => {
  return getEdgeRepository()
    .then(repo => repo.findOne(id))
}

export const readEdgeBy = (fields: object): Promise<Edge> => {
  return getEdgeRepository()
    .then(repo => repo.findOne(fields))
}

export const readEdgesBy = (options: FindManyOptions<Edge>): Promise<Edge[]> => {
  return getEdgeRepository()
    .then(repo => repo.find(options))
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
export const readEdgesPageByCreatedAtDesc = (edgesInput: EdgesInput): Promise<Edge[]> => {
  const pageInput: PageInput = _.get(edgesInput, 'pageInput', {
    first: DEFAULT_PAGE_SIZE,
    afterCursor: moment().toISOString(),
  })
  return resolvePage(pageInput, {
    firstAfter: () => readEdgesBy({
      where: _.extend(
        mapEdgesInputToEdgesWhere(edgesInput),
        { createdAt: LessThan(cursorToDate(pageInput.afterCursor)) },
        { isDeleted: false }
      ),
      order: {
        createdAt: 'DESC',
      },
      take: pageInput.first,
      cache: true,
    })
    ,
    firstBefore: () => readEdgesBy({
      where: _.extend(
        mapEdgesInputToEdgesWhere(edgesInput),
        { createdAt: MoreThan(misc.addMs(cursorToDate(pageInput.beforeCursor))) },
        { isDeleted: false }
      ),
      order: {
        createdAt: 'DESC',
      },
      take: pageInput.first,
      cache: true,
    })
    ,
    lastAfter: () => readEdgesBy({
      where: _.extend(
        mapEdgesInputToEdgesWhere(edgesInput),
        { createdAt: LessThan(cursorToDate(pageInput.afterCursor)) },
        { isDeleted: false }
      ),
      order: {
        createdAt: 'ASC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse)
    ,
    lastBefore: () => readEdgesBy({
      where: _.extend(
        mapEdgesInputToEdgesWhere(edgesInput),
        { createdAt: MoreThan(misc.addMs(cursorToDate(pageInput.beforeCursor))) },
        { isDeleted: false }
      ),
      order: {
        createdAt: 'ASC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse),
    
  })
}

const mapEdgesInputToEdgesWhere = (edgesInput: EdgesInput): any => {
  return _.pick(edgesInput, [
    'edgeType',
    'thisEntityId',
    'thatEntityId',
    'name',
    'collectionName',
    'collectionId',
  ])
}

/**
 * feed is in asc order. 
 * 
 */
export const readEdgesPageByOrder = (edgesInput: EdgesInput): Promise<Edge[]> => {
  const defaultAfterCursor = ''
  const defaultFirst = DEFAULT_PAGE_SIZE
  const pageInput: PageInput = _.get(edgesInput, 'pageInput', {})
  return resolvePage(pageInput, {
    firstAfter: () => readEdgesBy({
      where: _.extend(
        mapEdgesInputToEdgesWhere(edgesInput),
        { order: MoreThan(_.defaultTo(pageInput.afterCursor, defaultAfterCursor)) },
        { isDeleted: false }
      ),
      order: {
        order: 'ASC',
      },
      take: _.defaultTo(pageInput.first, defaultFirst),
      cache: true,
    })
    ,
    firstBefore: () => readEdgesBy({
      where: _.extend(
        mapEdgesInputToEdgesWhere(edgesInput),
        { order: LessThan(pageInput.beforeCursor) },
        { isDeleted: false }
      ),
      order: {
        order: 'ASC',
      },
      take: _.defaultTo(pageInput.first, defaultFirst),
      cache: true,
    })
    ,
    lastAfter: () => readEdgesBy({
      where: _.extend(
        mapEdgesInputToEdgesWhere(edgesInput),
        { order: MoreThan(_.defaultTo(pageInput.afterCursor, defaultAfterCursor)) },
        { isDeleted: false }
      ),
      order: {
        order: 'DESC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse)
    ,
    lastBefore: () => readEdgesBy({
      where: _.extend(
        mapEdgesInputToEdgesWhere(edgesInput),
        { order: LessThan(pageInput.beforeCursor) },
        { isDeleted: false }
      ),
      order: {
        order: 'DESC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse),
    
  })
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
export const readEdgesPageByOrderDesc = (edgesInput: EdgesInput): Promise<Edge[]> => {
  const defaultAfterCursor = moment().toISOString()
  const defaultFirst = DEFAULT_PAGE_SIZE
  const pageInput: PageInput = _.get(edgesInput, 'pageInput', {})
  return resolvePage(pageInput, {
    firstAfter: () => readEdgesBy({
      where: _.extend(
        mapEdgesInputToEdgesWhere(edgesInput),
        { order: LessThan(_.defaultTo(pageInput.afterCursor, defaultAfterCursor)) },
        { isDeleted: false }
      ),
      order: {
        order: 'DESC',
      },
      take: _.defaultTo(pageInput.first, defaultFirst),
      cache: true,
    })
    ,
    firstBefore: () => readEdgesBy({
      where: _.extend(
        mapEdgesInputToEdgesWhere(edgesInput),
        { order: MoreThan(pageInput.beforeCursor) },
        { isDeleted: false }
      ),
      order: {
        order: 'DESC',
      },
      take: _.defaultTo(pageInput.first, defaultFirst),
      cache: true,
    })
    ,
    lastAfter: () => readEdgesBy({
      where: _.extend(
        mapEdgesInputToEdgesWhere(edgesInput),
        { order: LessThan(_.defaultTo(pageInput.afterCursor, defaultAfterCursor)) },
        { isDeleted: false }
      ),
      order: {
        order: 'ASC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse)
    ,
    lastBefore: () => readEdgesBy({
      where: _.extend(
        mapEdgesInputToEdgesWhere(edgesInput),
        { order: MoreThan(pageInput.beforeCursor) },
        { isDeleted: false }
      ),
      order: {
        order: 'ASC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse),
    
  })
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
export const readEdgeStatsPageByCreatedAtDesc = (edgeStatsInput: EdgeStatsInput): Promise<EdgeStats[]> => {
  const pageInput: PageInput = _.get(edgeStatsInput, 'pageInput', { first: DEFAULT_PAGE_SIZE })
  return resolvePage(pageInput, {
    firstAfter: () => readEdgeStatsBy({
      where: _.extend(
        mapEdgeStatsInputToEdgeStatsWhere(edgeStatsInput),
        { createdAt: LessThan(cursorToDate(pageInput.afterCursor)) }
      ),
      order: {
        createdAt: 'DESC',
      },
      take: pageInput.first,
      cache: true,
    })
    ,
    firstBefore: () => readEdgeStatsBy({
      where: _.extend(
        mapEdgeStatsInputToEdgeStatsWhere(edgeStatsInput),
        { createdAt: MoreThan(misc.addMs(cursorToDate(pageInput.beforeCursor))) }
      ),
      order: {
        createdAt: 'DESC',
      },
      take: pageInput.first,
      cache: true,
    })
    ,
    lastAfter: () => readEdgeStatsBy({
      where: _.extend(
        mapEdgeStatsInputToEdgeStatsWhere(edgeStatsInput),
        { createdAt: LessThan(cursorToDate(pageInput.afterCursor)) }
      ),
      order: {
        createdAt: 'ASC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse)
    ,
    lastBefore: () => readEdgeStatsBy({
      where: _.extend(
        mapEdgeStatsInputToEdgeStatsWhere(edgeStatsInput),
        { createdAt: MoreThan(misc.addMs(cursorToDate(pageInput.beforeCursor))) }
      ),
      order: {
        createdAt: 'ASC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse),
    
  })
}

const mapEdgeStatsInputToEdgeStatsWhere = (input: EdgeStatsInput): any => {
  return _.pick(input, [
    'entityId',
    'edgeDirection',
    'edgeType',
  ])
}
