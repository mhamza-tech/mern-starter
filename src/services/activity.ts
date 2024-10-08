/**
 * @rob4lderman
 * aug2019
 * 
 * API for the Activity Service.
 * 
 */

import * as axios from './axios'
import { gql } from 'apollo-server'
import { print } from 'graphql/language/printer'
import { SERVICE_URL } from '../env'
import _ from 'lodash'
import {
  ActionResult,
  ActionResultInput,
  GqlResponse,
  UserEntityInput,
  EntityInput,
  NewsfeedTimestampInput,
  CreateUserEdgeInput,
  DeleteUserEdgeInput,
} from './types'
import {
  sf,
} from '../utils'
import { LoggerFactory } from 'src/utils/logger'
import Bluebird from 'bluebird'

const logger = LoggerFactory('activity', 'ActivityModel')

export const edgeStatsFragment = gql`
fragment edgeStatsFragment on EdgeStats {
    entityId
    edgeDirection
    edgeType
    count
}
`

export const edgeFragment = gql`
fragment edgeFragment on Edge {
    id
    thisEntityId
    thisEntityType
    thatEntityId
    thatEntityType
    edgeType
    metadata
  }
`

export const activityFragment = gql`
${edgeStatsFragment}
${edgeFragment}
fragment activityFragment on Activity {
    id
    actionResultId
    userId 
    unObjectId
    trackingId
    activityType
    metadata
    createdAt
    edgeStats {
      ...edgeStatsFragment
    }
    myEdges {
      ...edgeFragment
    }
}
`

const assertServiceUrl = (): string => {
  if (_.isEmpty(SERVICE_URL)) {
    throw new Error('SERVICE_URL is undefined. Failed to send newsfeed activity.')
  }
  return SERVICE_URL
}

const buildHeaders = (trackingId: string = null): {
  timeout: number
  headers: {
    'x-api-key': string
  } & object
} => {
  return axios.buildHeaders(
    _.isEmpty(trackingId)
      ? {}
      : { 'x-tracking-id': trackingId }

  )
}

export const buildActionResultInput = (actionResult: ActionResult): ActionResultInput => {
  return {
    actionResultId: actionResult.id,
    userId: actionResult.userId,
    unObjectId: actionResult.unObjectId,
    trackingId: actionResult.trackingId,
  }
}

const buildNewActionResultPayload = (actionResultInput: ActionResultInput): any => {
  const query = gql`
        ${activityFragment}
        mutation newActionResult($actionResultInput: ActionResultInput!) {
            newActionResult(input: $actionResultInput ) {
                ...activityFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { actionResultInput },
  }
}

export const newActionResult = (actionResult: ActionResult): Promise<any> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => buildActionResultInput(actionResult))
    .then((actionResultInput: ActionResultInput) => buildNewActionResultPayload(actionResultInput))
    .then(payload => axios.post(assertServiceUrl(), payload, buildHeaders(actionResult.trackingId)))
    .then(res => _.result(res, 'data.newActionResult'))
    .catch(sf.tap_throw(err => logger.error('newActionResult', { actionResult, err })))
}

const buildUserEdgesPayload = (input: UserEntityInput): any => {
  const query = gql`
        ${edgeFragment}
        query userEdges($input: UserEntityInput!) {
            userEdges(input: $input) {
                ...edgeFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const readUserEdges = (userId: string, entityId: string): Bluebird<any> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => ({ userId, entityId }))
    .then((input: UserEntityInput) => buildUserEdgesPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders()))
    .then(res => _.result(res, 'data.userEdges'))
    .catch(sf.tap_throw(err => logger.error('readUserEdges', { userId, entityId, err })))
}

const buildEdgeStatsPayload = (input: EntityInput): any => {
  const query = gql`
        ${edgeStatsFragment}
        query edgeStats($input: EntityInput!) {
            edgeStats(input: $input) {
                ...edgeStatsFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const readEdgeStats = (entityId: string): Bluebird<any> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => ({ entityId }))
    .then((input: EntityInput) => buildEdgeStatsPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders()))
    .then(res => _.result(res, 'data.edgeStats'))
    .catch(sf.tap_throw(err => logger.error('readEdgeStats', { entityId, err })))
}

const buildReadyPayload = (): object => {
  const query = gql`
        query ready {
            ready
        }
    `
  return {
    query: print(query),
    variables: {},
  }
}

/**
 * @return Promise w/ gql response
 */
export const ready_gql = (): Promise<GqlResponse> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => buildReadyPayload())
    .then(payload => axios.post(assertServiceUrl(), payload, buildHeaders()))
}

/**
 * @return Promise w/ ready
 */
export const ready = (): Promise<any> => {
  return ready_gql()
    .then((res: GqlResponse) => _.result(res, 'data.ready'))
    .catch(sf.tap_throw(err => logger.error('ready', { err })))
}

export const buildNewsfeedTimestampInput = (timestamp: Date, limit: number): NewsfeedTimestampInput => {
  return _.extend(
    {},
    _.isNil(timestamp)
      ? {}
      : { timestamp }
    ,
    _.isNil(limit)
      ? {}
      : { limit }

  )
}

const buildNewsfeedOlderThanPayload = (input: NewsfeedTimestampInput): object => {
  const query = gql`
        ${activityFragment}
        query newsfeedOlderThan($input: NewsfeedTimestampInput ) {
            newsfeedOlderThan(input:$input) {
                ...activityFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

/**
 * @return Promise w/ gql response
 */
export const newsfeedOlderThan_gql = (input: NewsfeedTimestampInput = {}, headers: object = {}): Promise<GqlResponse> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => buildNewsfeedOlderThanPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

/**
 * @return Promise w/ ready
 */
export const newsfeedOlderThan = (timestamp: Date = null, limit: number = null): Promise<any> => {
  return Promise.resolve(buildNewsfeedTimestampInput(timestamp, limit))
    .then((input: NewsfeedTimestampInput) => newsfeedOlderThan_gql(input))
    .then((res: GqlResponse) => _.result(res, 'data.newsfeedOlderThan'))
    .catch(sf.tap_throw(err => logger.error('newsfeedOlderThan', { timestamp, limit, err })))
}

const buildCreateUserEdgePayload = (input: CreateUserEdgeInput): object => {
  const query = gql`
        ${edgeFragment}
        mutation createUserEdge($input: CreateUserEdgeInput!) {
            createUserEdge(input:$input) {
              ...edgeFragment
            }  
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

/**
 * @return Promise w/ gql response
 */
export const createUserEdge_gql = (input: CreateUserEdgeInput, headers: object = {}): Promise<GqlResponse> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => buildCreateUserEdgePayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

/**
 * @return Promise w/ ready
 */
export const createUserEdge = (
  thatEntityId: string,
  thatEntityType: string,
  edgeType: string,
  metadata: object = null,
  headers: object = {}
): Promise<any> => {
  return Promise.resolve({ thatEntityId, thatEntityType, edgeType, metadata })
    .then((input: CreateUserEdgeInput) => createUserEdge_gql(input, headers))
    .then((res: GqlResponse) => _.result(res, 'data.createUserEdge'))
    .catch(sf.tap_throw(err => logger.error('createUserEdge', { thatEntityId, edgeType, err })))
}

const buildDeleteUserEdgePayload = (input: DeleteUserEdgeInput): object => {
  const query = gql`
        mutation deleteUserEdge($input: DeleteUserEdgeInput!) {
            deleteUserEdge(input:$input)        
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

/**
 * @return Promise w/ gql response
 */
export const deleteUserEdge_gql = (input: DeleteUserEdgeInput, headers: object = {}): Promise<GqlResponse> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => buildDeleteUserEdgePayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

/**
 * @return Promise w/ ready
 */
export const deleteUserEdge = (
  thatEntityId: string,
  edgeType: string,
  headers: object = {}
): Promise<any> => {
  return Promise.resolve({ thatEntityId, edgeType })
    .then((input: DeleteUserEdgeInput) => deleteUserEdge_gql(input, headers))
    .then((res: GqlResponse) => _.result(res, 'data.deleteUserEdge'))
    .catch(sf.tap_throw(err => logger.error('deleteUserEdge', { thatEntityId, edgeType, err })))
}
