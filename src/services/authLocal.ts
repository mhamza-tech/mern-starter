/**
 * @rob4lderman
 * oct2019
 */

import {
  User,
} from '../db/entity'
import * as userModel from '../graphql/User/user.model'
import { userById } from 'src/graphql/store'
import * as store from 'src/graphql/store'
import * as model from 'src/graphql/User/user.model'

export const readUser = (userId: string, withAllFields = false): Promise<User> => {
  return userById(userId)
    .then(
      user => withAllFields
        ? user
        : userModel.pickPublicUserFields(user)
    )
}

export const updateUser = (userId: string, updatedFields: any): Promise<User> => {
  return userById(userId)
    .then(user => store.saveUser(user, user => model.updateUserFields(user, updatedFields)))
}
