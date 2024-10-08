/**
 * @rob4lderman
 * sep2019
 */

import _ from 'lodash'
import { MASTER_API_KEY } from '../../env'
import { User } from '../../db/entity'
import { sf } from '../../utils'
import * as errors from './user.error'

export const authzSessionUserIsUser = (sessionUser: User, user: User): Promise<any> => {
  const sessionUserId: string = _.result(sessionUser, 'id')
  const userId: string = _.result(user, 'id')
  return Promise.resolve(null)
    .then(sf.thru_if(() => sessionUserId !== userId)(
      () => {
        throw errors.buildAuthzErrorSessionUserIsUser(sessionUserId, userId) 
      }
    ))
}

export const authzMasterApiKeyOverride = (err: any, apiKey: string): void => {
  if (_.trim(apiKey) !== MASTER_API_KEY) {
    throw err
  }
}

export const authzAnonUserOverride = (err: any, user: User): void => {
  if (!!!user.isAnonymous) {
    throw err
  }
}
