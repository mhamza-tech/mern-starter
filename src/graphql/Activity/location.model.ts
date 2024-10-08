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
  EntityManager,
  SelectQueryBuilder,
} from 'typeorm'
import {
  sf,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  Location,
  UnObject,
  Entity,
} from '../../db/entity'
import * as dbUtils from '../../db/utils'
import * as models from '../models'

const logger = LoggerFactory('location.model')
const DB_CONN_NAME = TYPEORM_CONNECTION

/**
 * @return Promise w/ repository
 */
let cachedLocationRepository: Repository<Location> = null
export const getLocationRepository = (): Promise<Repository<Location>> => {
  return !!!_.isNil(cachedLocationRepository)
    ? Promise.resolve(cachedLocationRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Location))
      .then(sf.tap(repository => {
        cachedLocationRepository = repository 
      }))
}

export const mapYamlUnObjectToLocation = (yamlUnObject: any, dbUnObject: UnObject): Location => {
  logger.debug('mapYamlUnObjectToLocation', { yamlUnObject, dbUnObject })
  const retMe = new Location()
  retMe.isDeleted = _.defaultTo(_.get(yamlUnObject, 'isDeleted'), false)
  retMe.x = yamlUnObject.location.x
  retMe.y = yamlUnObject.location.y
  retMe.thisEid = models.mapEntityToEid(dbUnObject)
  return retMe
}

export const buildLocationForEntity = (location: any, entity: Entity): Location => {
  const retMe = new Location()
  retMe.isDeleted = _.defaultTo(_.get(location, 'isDeleted'), false)
  retMe.x = location.x
  retMe.y = location.y
  retMe.thisEid = models.mapEntityToEid(entity)
  return retMe
}

export const saveLocation = (location: Location): Promise<Location> => {
  logger.log('saveLocation', { location })
  return getLocationRepository()
    .then(repo => repo.save(location))
}

export const updateOrCreateLocation = (location: Location, recursionLevel = 0): Promise<Location> => {
  return getConnection(DB_CONN_NAME).transaction(
    'READ UNCOMMITTED',
    (entityManager: EntityManager) => updateOrCreateLocationInTransaction(entityManager, location)
  )
    .catch(sf.tap_throw(err => logger.error('updateOrCreateLocation.RACE', { recursionLevel, err, location })))
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err) && recursionLevel <= 0)(
      () => updateOrCreateLocation(location, recursionLevel + 1)
    )(
      (err) => {
        throw err 
      }
    ))
}

const updateOrCreateLocationInTransaction = (entityManager: EntityManager, location: Location): Promise<Location> => {
  return Promise.resolve(entityManager)
    .then((entityManager: EntityManager) => entityManager.createQueryBuilder(Location, 'location'))
    .then((qb: SelectQueryBuilder<Location>) =>
      qb.where('location.thisEid = :thisEid', _.pick(location, 'thisEid'))
    )
    .then((qb: SelectQueryBuilder<Location>) => qb.setLock('pessimistic_write'))
    .then((qb: SelectQueryBuilder<Location>) => qb.getOne())
    .then(sf.thru_if_else(_.isNil)(
      // Create new record
      () => entityManager.save(location)
    )(
      // Update existing record
      (locationRecord: Location) => entityManager.update(
        Location,
        locationRecord.id,
        dbUtils.safeEntityUpdate(location)
      )
        .then(() => entityManager.findOne(Location, locationRecord.id))
    ))
}

export const readLocationBy = (options: object): Promise<Location> => {
  return getLocationRepository()
    .then(repo => repo.findOne(options))
}
