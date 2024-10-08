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
  UpdateResult,
} from 'typeorm'
import { sf } from '../../utils'
import {
  QEdge,
  SDist,
} from '../../db/entity'
import { CreateSDistInput } from 'src/gql-types'
import * as dbUtils from '../../db/utils'
import * as models from '../models'

const DB_CONN_NAME = TYPEORM_CONNECTION

/**
 * @return Promise w/ repository
 */
let cachedQEdgeRepository: Repository<QEdge> = null
export const getQEdgeRepository = (): Promise<Repository<QEdge>> => {
  return !!!_.isNil(cachedQEdgeRepository)
    ? Promise.resolve(cachedQEdgeRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(QEdge))
      .then(sf.tap(repository => {
        cachedQEdgeRepository = repository 
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedSDistRepository: Repository<SDist> = null
export const getSDistRepository = (): Promise<Repository<SDist>> => {
  return !!!_.isNil(cachedSDistRepository)
    ? Promise.resolve(cachedSDistRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(SDist))
      .then(sf.tap(repository => {
        cachedSDistRepository = repository 
      }))
}

export const buildQEdge = (fields: object): QEdge => {
  const retMe = new QEdge()
  return _.extend(retMe, fields)
}

const updateQEdge = (id: string, set: object): Promise<any> => {
  return getQEdgeRepository()
    .then(sf.tap_wait(repo => repo.update(id, set)))
    .then(repo => repo.findOne(id))
}

export const updateQEdgeNoRead = (id: string, set: object): Promise<UpdateResult> => {
  return getQEdgeRepository()
    .then(repo => repo.update(id, set))
}

export const saveQEdge = (qedge: QEdge): Promise<QEdge> => {
  return getQEdgeRepository()
    .then(repo => repo.save(qedge))
}

export const readQEdgeBy = (fields: object): Promise<QEdge> => {
  return getQEdgeRepository()
    .then(repo => repo.findOne(fields))
}

export const queryQEdges = (sql: string): Promise<any> => {
  return getQEdgeRepository()
    .then(repo => repo.query(sql))
}

export const readQEdgesBy = (options: object): Promise<QEdge[]> => {
  return getQEdgeRepository()
    .then(repo => repo.find(options))
}

export const deleteQEdgesBy = (options: object): Promise<any> => {
  return getQEdgeRepository()
    .then(repo => repo.delete(options))
}

export const createOrUpdateQEdge = (qedge: QEdge): Promise<any> => {
  return saveQEdge(qedge)
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err))(
      err => readQEdgeBy(_.pick(qedge, [
        'thisEntityId',
        'thatEntityId',
        'buildPhase',
      ]))
        .then(sf.thru_if(_.isNil)(
          () => {
            throw err 
          }
        ))
        // Note: had to use repo.update instead of repo.save cuz I was
        // getting weird TypeError: cannot convert object to primitive otherwise,
        // on the metadata edge.  No clue as to why the initial save w/ metadata 
        // works but a subsequent save does not.
        .then((qedgeRecord: QEdge) => updateQEdge(
          qedgeRecord.id,
          _.extend(
            dbUtils.safeEntityUpdate(qedge),
            { q: qedgeRecord.q + qedge.q }
          )
        ))
    )(
      err => {
        throw err 
      }
    ))
}

export const mapCreateSDistInputToSDist = (input: CreateSDistInput): SDist => {
  const retMe = new SDist()
  return _.extend(retMe, {
    startingNodeEid: input.startingNodeEid,
    startingNodeEntityType: models.mapEidToEntityType(input.startingNodeEid),
    endingNodeEid: input.endingNodeEid,
    endingNodeEntityType: models.mapEidToEntityType(input.endingNodeEid),
    iterations: input.iterations,
    s: input.s,
  })
}

const updateSDist = (id: string, set: object): Promise<any> => {
  return getSDistRepository()
    .then(sf.tap_wait(repo => repo.update(id, set)))
    .then(repo => repo.findOne(id))
}

export const updateSDistNoRead = (id: string, set: object): Promise<UpdateResult> => {
  return getSDistRepository()
    .then(repo => repo.update(id, set))
}

export const saveSDist = (sdist: SDist): Promise<SDist> => {
  return getSDistRepository()
    .then(repo => repo.save(sdist))
}

export const readSDistBy = (fields: object): Promise<SDist> => {
  return getSDistRepository()
    .then(repo => repo.findOne(fields))
}

export const querySDists = (sql: string): Promise<any> => {
  return getSDistRepository()
    .then(repo => repo.query(sql))
}

export const readSDistsBy = (options: object): Promise<SDist[]> => {
  return getSDistRepository()
    .then(repo => repo.find(options))
}

export const deleteSDistsBy = (options: object): Promise<any> => {
  return getSDistRepository()
    .then(repo => repo.delete(options))
}

export const createOrUpdateSDist = (sdist: SDist): Promise<any> => {
  return saveSDist(sdist)
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err))(
      err => readSDistBy(_.pick(sdist, [
        'startingNodeEid',
        'endingNodeEid',
        'buildPhase',
      ]))
        .then(sf.thru_if(_.isNil)(
          () => {
            throw err 
          }
        ))
        // Note: had to use repo.update instead of repo.save cuz I was
        // getting weird TypeError: cannot convert object to primitive otherwise,
        // on the metadata edge.  No clue as to why the initial save w/ metadata 
        // works but a subsequent save does not.
        .then((sdistRecord: SDist) => updateSDist(
          sdistRecord.id,
          dbUtils.safeEntityUpdate(sdist)
        ))
    )(
      err => {
        throw err 
      }
    ))
}
