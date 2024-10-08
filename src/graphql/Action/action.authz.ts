/**
 * @rob4lderman
 * sep2019
 */

import _ from 'lodash'
import { MASTER_API_KEY } from 'src/env'
import { UnObject } from '../../db/entity'
import { authService } from '../../services'
import { sf } from '../../utils'
import { Player } from 'src/gql-types'
import * as errors from './action.error'
import { unObjectById } from 'src/graphql/store'

/**
 * @return user 
 * @throws if user does not have role
 */
export const assertRole = (user: any, role: string): any => {
  const roles: string[] = _.result(user, 'roles', [])
  if (!!!_.includes(roles, role)) {
    throw errors.buildAuthzErrorRole(role, roles)
  }
  return user
}

export const authzUserRole = (userId: string, role: string): Promise<any> => {
  return authService.readMasterUser(userId, true)
    .then(user => assertRole(user, role))
}

export const authzUnObjectCreator = (userId: string, unObjectId: string): Promise<UnObject> => {
  return unObjectById(unObjectId)
    .then(sf.thru_if((unObject: UnObject) => unObject.createdByUserId != userId)(
      () => {
        throw errors.buildAuthzErrorCreator('UnObject', unObjectId) 
      }
    ))
}

export const authzUserIdIsUnObjectCreator = (userId: string, unObject: UnObject): Promise<UnObject> => {
  if (_.isEmpty(unObject)) {
    return Promise.resolve(unObject)
  }
  return Promise.resolve(unObject)
    .then(sf.thru_if((unObject: UnObject) => unObject.createdByUserId != userId)(
      () => {
        throw errors.buildAuthzErrorCreator('UnObject', unObject.id) 
      }
    ))
}

export const authzUserIdIsPlayerOrCreator = (userId: string, player: Player): Promise<Player> => {
  if (_.isEmpty(player)) {
    return Promise.resolve(player)
  }
  if (userId == player.id) {
    return Promise.resolve(player)
  }
  if (userId == _.get(player, 'createdByUserId')) {
    return Promise.resolve(player)
  }
  return Promise.reject(errors.buildAuthzErrorCreator('UnObject', player.id))
}

export const authzMasterApiKeyOverride = (err: any, apiKey: string): void => {
  if (_.trim(apiKey) !== MASTER_API_KEY) {
    throw err
  }
}
