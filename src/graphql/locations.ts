/**
 * @rob4lderman
 * mar2020
 * 
 * Set locations for various users.
 * Runs at server startup.
 */

import {
  sf,
} from '../utils'
import { LoggerFactory } from 'src/utils/logger'
import { createConnectionsPromise } from '../db/connect'
import * as userModel from './User/user.model'
import * as locationModel from './Activity/location.model'
import { Location } from '../gql-types'
import {
  User,
} from '../db/entity'
const logger = LoggerFactory('locations')

const saveUserLocation = (username: string, location: any): Promise<Location> => {
  return userModel.readUserByUsername(username)
    .then(sf.maybe_fmap(
      (user: User) => Promise.resolve(locationModel.buildLocationForEntity(location, user))
        .then(locationModel.updateOrCreateLocation)
        .then(sf.tap(() => logger.info('saveUserLocation:', { username })))
    ))
    .catch(err => logger.error('ERROR: saveUserLocation', { err }))
}

export const load = (): Promise<any> => {
  logger.info('load: entry')
  return createConnectionsPromise
    .then(() => saveUserLocation('roba', { x: 60, y: 100 }))
    .then(() => saveUserLocation('jeff', { x: 60, y: 140 }))
    .then(() => saveUserLocation('testingnotexist', { x: 60, y: 180 }))
    .then(sf.tap(() => logger.info('load: exit')))
    .catch(err => logger.error('ERROR: load', { err }))
}
