/**
 * @rob4lderman
 * feb2020
 * 
 * @startup: load actions and unobjects from yaml, load reaction functions, load actions resolvers.
 * 
 * this file is executed from onServerStarted in server.ts.
 */

import coretest from '../maker/reactions/coretest'
import { sf } from '../utils'
import { Redis } from 'src/services/redis'
import { LoggerFactory } from 'src/utils/logger'
import { createConnectionsPromise } from '../db/connect'
import { FAST_BOOT } from '../env'
import * as chatActions from './Chat/chat.actions'
import * as parser from '../enginev3/parser'
import { JobQueueInstance } from 'src/queue/generic'
import { IJob } from 'src/queue/generic/generic-job.models'

const logger = LoggerFactory('actionstartup')

const NEWSFEED_JOB_ID = 'generateNewsfeedsForUsers'
// one hour
const NEWSFEED_JOB_REPEAT = 60 * 60 * 1000

export const load = (): Promise<any> => {
  logger.info('load: entry')
  return createConnectionsPromise
    .then(() => {
      // We need to getInstance() regardless of FAST_BOOT to force it to connect
      const redis = Redis.getInstance()
      if (FAST_BOOT) {
        return null
      }
      return redis.flush()
    })
    .then(() => Promise.all([
      !FAST_BOOT && parser.readAndParseYamlActions(),
      !FAST_BOOT && parser.readAndParsedYamlUnObjects(),
    ]))
    .then(() => Promise.all([
      !FAST_BOOT && coretest.load(),
      chatActions.getActionResolvers(),
    ]))
    .then(sf.tap(
      () => JobQueueInstance.add<IJob>(
        { id: NEWSFEED_JOB_ID },
        { repeat: { every: NEWSFEED_JOB_REPEAT } },
        'GenerateNewsfeedItems'
      )
    ))
    .catch(sf.tap_throw((err) => logger.error('ERROR: load: ', { err })))
}
