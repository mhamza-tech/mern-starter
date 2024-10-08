/**
 * @rob4lderman
 * sep2019
 */
import { User } from '../../db/entity'
import {
  RedisCache,
  CacheType,
} from 'src/utils'
import * as model from './user.model'
import { safeIn } from 'src/db/utils'
import { EntityType } from 'src/gql-types'

export const userByIdCache = new RedisCache<User>({
  name: 'userByIdCache',
  type: CacheType.HashSet,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildKey: (id: any): string => `${EntityType.User}`,
  buildFullKey: (id: any): string => `${EntityType.User}:${id}`,
  fetchFromDB: (ids: string[]): Promise<User[]> =>
    model.readUsersBy({
      id: safeIn(ids),
    }),
})

// TODO add cache for userByUsername -> model.readUserByUsername
