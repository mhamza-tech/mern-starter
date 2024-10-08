/**
 * @rob4lderman
 * mar2020
 * 
 */

import _ from 'lodash'
import {
  getConnection,
  Repository,
  FindManyOptions,
} from 'typeorm'
import { UnObject } from '../../db/entity'
import {
  CreateUnObjectInput,
  CreateHandledUnObjectInput,
  UnObjectType,
  UpdateUnObjectInput,
  Gender,
} from 'src/gql-types'
import {
  misc,
  sf,
} from '../../utils'
import { TYPEORM_CONNECTION } from 'src/env'

const DB_CONN_NAME = TYPEORM_CONNECTION

/**
 * @return Promise w/ repository
 */
let cachedUnObjectRepository = null
export const getUnObjectRepository = (): Promise<Repository<UnObject>> => {
  return !!!_.isNil(cachedUnObjectRepository)
    ? Promise.resolve(cachedUnObjectRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(UnObject))
      .then(sf.tap(repo => {
        cachedUnObjectRepository = repo
      }))
}

export const buildUnObject = (input: CreateUnObjectInput, username: string, userId: string): UnObject => {
  // FIXME: Needs to use mapInputToUnObject() and validate with joi, no rush since this is not used atm
  const unObject = new UnObject()
  unObject.createdByUserId = userId
  unObject.description = input.description
  unObject.name = input.name
  unObject.username = username
  unObject.emoji = input.emoji
  unObject.entryId = input.entryId
  unObject.s3Key = input.s3Key
  return unObject
}

export const buildUpdateUnObject = (input: UpdateUnObjectInput): UnObject => {
  // FIXME: Needs to use mapInputToUnObject() and validate with joi, no rush since this is not used atm
  const unObject = new UnObject()
  unObject.id = input.id
  unObject.name = input.name
  unObject.description = input.description
  unObject.emoji = input.emoji
  unObject.entryId = input.entryId
  unObject.s3Key = input.s3Key
  return unObject
}

export const buildHandledUnObject = (input: CreateHandledUnObjectInput, username: string, userId: string, handlerUnObject: UnObject): UnObject => {
  // FIXME: Needs to use mapInputToUnObject() and validate with joi, no rush since this is not used atm
  const unObject = new UnObject()
  unObject.createdByUserId = userId
  unObject.description = misc.firstNotEmpty(input.description, handlerUnObject.description)
  unObject.name = misc.firstNotEmpty(input.name, handlerUnObject.name)
  unObject.username = username
  unObject.emoji = handlerUnObject.emoji
  unObject.entryId = handlerUnObject.entryId
  unObject.s3Key = handlerUnObject.s3Key
  unObject.handlerUnObjectId = handlerUnObject.id
  return unObject
}

export const saveUnObject = (unObject: UnObject): Promise<UnObject> => {
  return getUnObjectRepository()
    .then(repo => repo.save(unObject))
    .then(uo => readUnObjectBy({ id: uo.id }))
}

export const createUnObject = saveUnObject

export const readUnObjectsByUserId = (userId: string): Promise<UnObject[]> => {
  return getUnObjectRepository()
    .then(
      repo => repo.createQueryBuilder('unObject')
        .where('unObject.createdByUserId = :userId', { userId })
        .orderBy('unObject.updatedAt', 'DESC')
        .getMany()
    )
}

export const readUnObjectsBy = (options: FindManyOptions<UnObject>): Promise<UnObject[]> => {
  return getUnObjectRepository()
    .then(repo => repo.find(options))
}

export const readUnObjectBy = (options: object): Promise<UnObject> => {
  return getUnObjectRepository()
    .then(repo => repo.findOne(options))
}

const safeUpdateUnObject = (updatedFields: object): object => {
  return _.omit(updatedFields, 'id')
}

export const updateUnObject = (unObjectId: string, updatedFields: object): Promise<UnObject> => {
  return getUnObjectRepository()
    .then(sf.tap_wait(repo => repo.update(unObjectId, safeUpdateUnObject(updatedFields))))
    .then(repo => repo.findOne(unObjectId))
}

export const mapInputToUnObject = (input: Partial<UnObject>): UnObject => {
  const defaults: Partial<UnObject> = {
    unObjectType: UnObjectType.UnObject,
    isDeleted: false,
    isFeatured: false,
    showBackpack: true,
    showControlBar: false,
    showResetButton: false,
    allowHashtributeNotifications: true,
    disableButtonsUponAction: false,
    backgroundColor: '#cc0000',
    minOccupancy: 1,
    maxOccupancy: 1,
    coverS3Key: input.s3Key,
    socialTitle: input.name,
    socialDescription: input.bio,
    socialImageS3Key: input.coverS3Key || input.s3Key,
    createdByUserId: 'a5079bb7-47c5-4052-887c-24b8f74bb4ba',
    featuredSortKey: null,
    isDestination: false,
    minUserAge: 12,
    gender: Gender.NonBinary,
  }
  input.id = (input.id || '').toString()
  if (input.backgroundColor) {
    input.backgroundColor = misc.prependHashToColor(input.backgroundColor)
  }
  // NOTE: If anything in the YAML is wrong (missing, extra, wrong type)
  // It will fail in the next step when ran against a joi schema 
  return _.extend(new UnObject(), defaults, input)
}

export const readUnObjectByUsername = (username: string): Promise<UnObject> => readUnObjectBy({ username })
