/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @rob4lderman
 * sep2019
 */
import {
  UnObject,
  ActionX,
  ActionXInstance,
} from '../../db/entity'
import {
  RedisCache,
  CacheType,
} from '../../utils'
import { safeIn } from 'src/db/utils'
import * as actionXModel from './actionx.model'
import { EntityType } from 'src/gql-types'
import { readUnObjectsBy } from 'src/graphql/Action/unobject.model'

export const unObjectByIdCache = new RedisCache<UnObject>({
  name: 'unObjectByIdCache',
  type: CacheType.HashSet,
  buildKey: (id: string): string => `${EntityType.UnObject}`,
  buildFullKey: (id: string): string => `${EntityType.UnObject}:${id}`,
  fetchFromDB: (ids: string[]): Promise<UnObject[]> =>
    readUnObjectsBy({
      where: {
        id: safeIn(ids),
        isDeleted: false,
      },
    }),
  onSet: (unObject: UnObject): Promise<UnObject> => unObjectByUsernameCache.prime(unObject),
})

export const unObjectByUsernameCache = new RedisCache<UnObject>({
  name: 'unObjectByUsernameCache',
  type: CacheType.HashSet,
  buildKey: (username: string): string => `${EntityType.UnObject}:Username`,
  pickKey: (unObject: UnObject): string => unObject.username,
  buildFullKey: (username: string): string => `${EntityType.UnObject}:Username:${username}`,
  buildValue: (unObject: UnObject): string => unObject.id,
  parseValue: (id: string): UnObject => {
    const unObject = new UnObject()
    unObject.id = id
    return unObject
  },
  fetchFromDB: (ids: string[]): Promise<UnObject[]> =>
    readUnObjectsBy({
      where: {
        username: safeIn(ids),
        isDeleted: false,
      },
    }),
})

export const actionXByNameCache = new RedisCache<ActionX>({
  name: 'actionXByNameCache',
  type: CacheType.HashSet,
  buildKey: (name: string): string => `${EntityType.ActionX}:Name`,
  pickKey: (actionX: ActionX): string => actionX.name,
  buildFullKey: (name: string): string => `${EntityType.ActionX}:Name:${name}`,
  buildValue: (actionX: ActionX): string => actionX.id,
  parseValue: (value: string): ActionX => {
    const action = new ActionX()
    action.id = value
    return action
  },
  fetchFromDB: (names: string[]): Promise<ActionX[]> =>
    actionXModel.readActionXsBy({
      name: safeIn(names),
      isDeleted: false,
    }),
  onSet: (actionX: ActionX): Promise<ActionX> => actionXByIdCache.prime(actionX),
})

export const actionXByIdCache = new RedisCache<ActionX>({
  name: 'actionXByIdCache',
  type: CacheType.HashSet,
  buildKey: (id: string): string => `${EntityType.ActionX}`,
  buildFullKey: (id: string): string => `${EntityType.ActionX}:${id}`,
  fetchFromDB: (ids: string[]): Promise<ActionX[]> =>
    actionXModel.readActionXsBy({
      id: safeIn(ids),
      isDeleted: false,
    }),
})

export const actionXsByPackageCache = new RedisCache<ActionX[]>({
  name: 'actionXsByPackageCache',
  type: CacheType.Set,
  buildKey: (pkg: string): string => `${EntityType.ActionX}:Package:${pkg}`,
  pickKey: (actionX: ActionX): string => actionX.package,
  buildValue: (action: ActionX): string => action.id,
  parseValue: (value: any): ActionX => {
    const action = new ActionX()
    action.id = value
    return action
  },
  fetchFromDB: (ids: string[]): any =>
    actionXModel.readActionXsBy({
      where: {
        package: safeIn(ids),
        isDeleted: false,
      },
      order: {
        order: 'ASC',
      },
    }),
  onSet: (actions: ActionX[]): Promise<ActionX[]> =>
    Promise.all(actions.map(action => actionXByNameCache.prime(action))),
})

export const actionXInstancesByPlayerCache = new RedisCache<any>({
  name: 'actionXInstancesByPlayerCache',
  type: CacheType.HashSetGetAll,
  buildKey: (eid: any): string => `${EntityType.ActionXInstance}:${eid}`,
  pickKey: (instance: ActionXInstance): string => instance.playerEid,
  matchingValue: (instance: ActionXInstance): string => instance.id,
  parseDBKey: (eid: string): any => eid,
  buildValue: (instance: ActionXInstance): any => JSON.stringify(instance),
  parseValue: (val: any): ActionXInstance => JSON.parse(val),
  fetchFromDB: (eids: string[]): any => actionXModel.readActionXInstancesBy({
    where: {
      playerEid: safeIn(eids),
      isDeleted: false,
    },
    order: {
      updatedAt: 'DESC',
    },
  }),
})
