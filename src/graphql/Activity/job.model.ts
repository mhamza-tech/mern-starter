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
  FindOneOptions,
  FindManyOptions,
  ObjectID,
  FindConditions,
  UpdateResult,
} from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { sf } from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import { Job } from 'src/db/entity'
import { JobType } from 'src/gql-types'

const logger = LoggerFactory('job.model')
const DB_CONN_NAME = TYPEORM_CONNECTION

/**
 * @return Promise w/ repository
 */
let cachedJobRepository: Repository<Job> = null
export const getJobRepository = (): Promise<Repository<Job>> => {
  return !!!_.isNil(cachedJobRepository)
    ? Promise.resolve(cachedJobRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Job))
      .then(sf.tap(repository => {
        cachedJobRepository = repository
      }))
}

export const buildReactionFnJob = (partial: Partial<Job>): Job => {
  const retMe = new Job()
  retMe.jobType = JobType.ReactionFnJob
  return _.extend(retMe, partial)
}

export const saveJob = (job: Job): Promise<Job> => {
  logger.log('saveJob', { job })
  return getJobRepository()
    .then(repo => repo.save(job))
}

export const readJobsBy = (options: FindManyOptions<Job>): Promise<Job[]> => {
  return getJobRepository()
    .then(repo => repo.find(options))
}

export const readJobBy = (options: FindOneOptions<Job>): Promise<Job> => {
  return getJobRepository()
    .then(repo => repo.findOne(options))
}

export const updateJobsBy = (options: string | number | Date | ObjectID | string[] | number[] | Date[] | ObjectID[] | FindConditions<Job>,
  partialEntity: QueryDeepPartialEntity<Job>): Promise<UpdateResult> => {
  return getJobRepository()
    .then(sf.tap_wait((repo: Repository<Job>) => repo.update(options, partialEntity)))
}
