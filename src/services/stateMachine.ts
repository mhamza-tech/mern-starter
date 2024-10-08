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
import Bluebird from 'bluebird'
import {
  GqlResponse,
  IdInput,
  DoActionInput,
  ActionStubInput,
  CreateUnObjectInput,
} from './types'
import { sf } from '../utils'
import { LoggerFactory } from 'src/utils/logger'
import { edgeStatsFragment } from './activity'

const logger = LoggerFactory('stateMachine', 'StateMachineLocal')

export const storylineFragment = gql`
    ${edgeStatsFragment}
    fragment storylineFragment on Storyline {
        unObjectId
        name
        text
        imageUrl
        entryId
        entry
        emoji
        edgeStats {
            ...edgeStatsFragment
        }
    }
`

export const cardFragment = gql`
    fragment cardFragment on Card {
        text
        imageUrl
        emoji
        entryId
        entry
    }
`

export const sessionFragment = gql`
    fragment sessionFragment on Session {
        userId
        unObjectId
        prevState
        state
        action
        stateActionHistory
        availableActions
        actionStats {
          action
          count
        }
    }
`

export const actionResultFragment = gql`
    ${sessionFragment}
    ${cardFragment}
    fragment actionResultFragment on ActionResult {
        action
        userAction
        userId 
        unObjectId 
        trackingId
        id
        startState
        endState
        newsfeedText
        emoji
        createdAt
        card {
          ...cardFragment
        }
        session {
            ...sessionFragment
        }
    }
`

export const actionStubFragment = gql`
    fragment actionStubFragment on ActionStub {
        id
        buttonText
    }
`

export const playerContextFragment = gql`
    ${actionStubFragment}
    fragment playerContextFragment on PlayerContext {
        id
        storyboardId
        userId
        currentState
        actionStubs {
            ...actionStubFragment
        }
        metadata
        createdAt
        updatedAt
    }
`

export const actionFragment = gql`
    ${cardFragment}
    fragment actionFragment on Action {
        id
        createdByUserId
        storyboardId
        unObjectId
        startState
        extendState
        buttonText
        card {
            ...cardFragment
        }
        newsfeedText
        endState
        createdAt
        updatedAt
    }
`

export const actionWithContextFragment = gql`
    ${actionFragment}
    ${playerContextFragment}
    fragment actionWithContextFragment on ActionWithContext {
        id
        trackingId
        createdAt
        createdByUserId
        actionId
        action {
            ...actionFragment
        }
        myPlayerContextId
        myPlayerContext {
            ...playerContextFragment
        }
    }
`

export const storyboardFragment = gql`
    fragment storyboardFragment on Storyboard {
        id
        name
        createdByUserId
        unObjectId
        status
        myPlayerContext {
          ...playerContextFragment
        }
        createdAt
        updatedAt
    }
`

export const unObjectFragment = gql`
    fragment unObjectFragment on UnObject {
        id
        name
        text
        emoji
        entryId
        entry
        createdByUserId
        createdAt
        updatedAt
        publishedStoryboard {
            ...storyboardFragment
        }
    }
`

const assertServiceUrl = (): string => {
  if (_.isEmpty(SERVICE_URL)) {
    throw new Error('SERVICE_URL is undefined')
  }
  return SERVICE_URL
}

export const buildIdInput = (id: string): IdInput => {
  return {
    id,
  }
}

const buildStorylinePayload = (input: IdInput): any => {
  const query = gql`
        ${storylineFragment}
        ${sessionFragment}
        query storyline($input: IdInput!) {
            storyline(input: $input) {
                ...storylineFragment
                session {
                  ...sessionFragment
                }
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

/**
 * 
 * @param ID input w/ unObjectId 
 * @return Promise w/ GqlResponse
 */
export const storyline_gql = (input: IdInput, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(buildStorylinePayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

/**
 * 
 * @param unObjectId 
 * @return Promise w/ unObject
 */
export const readUnObject = (unObjectId: string): Promise<any> => {
  return storyline_gql(buildIdInput(unObjectId))
    .then(res => _.result(res, 'data.storyline'))
    .catch(sf.tap_throw(err => logger.error('readUnObject', { unObjectId, err })))
}

const buildActionResultPayload = (input: IdInput): any => {
  const query = gql`
        ${actionResultFragment}
        query actionResult($input: IdInput!) {
            actionResult(input: $input) {
                ...actionResultFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

/**
 * 
 * @param actionResultId
 * @return Promise w/ unObject
 */
export const readActionResult = (actionResultId: string): Promise<any> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => buildIdInput(actionResultId))
    .then((input: IdInput) => buildActionResultPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders()))
    .then(res => _.result(res, 'data.actionResult'))
    .catch(sf.tap_throw(err => logger.error('readActionResult', { actionResultId, err })))
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
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders()))
}

/**
 * @return Promise w/ ready
 */
export const ready = (): Promise<any> => {
  return ready_gql()
    .then((res: GqlResponse) => _.result(res, 'data.ready'))
    .catch(sf.tap_throw(err => logger.error('ready', { err })))
}

export const buildDoActionInput = (unObjectId: string, action: string): DoActionInput => {
  return {
    unObjectId,
    action,
  }
}

const buildDoActionPayload = (input: DoActionInput): any => {
  const query = gql`
        ${actionResultFragment}
        mutation doAction($input: DoActionInput!) {
            doAction(input: $input) {
              ...actionResultFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

/**
 * 
 * @param input
 * @return Promise w/ GqlResponse
 */
export const doAction_gql = (input: DoActionInput, headers: object = null): Promise<GqlResponse> => {
  return Promise.resolve(buildDoActionPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

/**
 * 
 * @param unObjectId 
 * @param action 
 * @return Promise w/ unObject
 */
export const doAction = (unObjectId: string, action: string, headers: object = null): Promise<any> => {
  return Promise.resolve(buildDoActionInput(unObjectId, action))
    .then((input: DoActionInput) => doAction_gql(input, headers))
    .then(res => _.result(res, 'data.doAction'))
    .catch(sf.tap_throw(err => logger.error('doAction', { unObjectId, action, err })))
}

const buildResetPayload = (input: string): any => {
  const query = gql`
        ${sessionFragment}
        mutation reset($input: ID!) {
            reset(unObjectId: $input) {
              ...sessionFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

/**
 * 
 * @param input
 * @return Promise w/ GqlResponse
 */
export const reset_gql = (input: string, headers: object = null): Promise<GqlResponse> => {
  return Promise.resolve(buildResetPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

/**
 * 
 * @param unObjectId 
 * @param action 
 * @return Promise w/ unObject
 */
export const reset = (unObjectId: string, headers: object = null): Promise<any> => {
  return reset_gql(unObjectId, headers)
    .then(res => _.result(res, 'data.reset'))
    .catch(sf.tap_throw(err => logger.error('reset', { unObjectId, err })))
}

const buildStorylinesPayload = (): object => {
  const query = gql`
        ${storylineFragment}
        query storylines {
            storylines {
                ...storylineFragment
            }
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
export const storylines_gql = (): Promise<GqlResponse> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => buildStorylinesPayload())
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders()))
}

/**
 * @return Promise w/ storylines
 */
export const storylines = (): Promise<any> => {
  return storylines_gql()
    .then((res: GqlResponse) => _.result(res, 'data.storylines'))
    .catch(sf.tap_throw(err => logger.error('storylines', { err })))
}

const buildSuggestedStorylinesPayload = (input: IdInput): object => {
  const query = gql`
        ${storylineFragment}
        ${sessionFragment}
        query suggestedStorylines($input: IdInput!) {
            suggestedStorylines(input:$input) {
                ...storylineFragment
                session {
                  ...sessionFragment
                }
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
export const suggestedStorylines_gql = (input: IdInput, headers: object = null): Promise<GqlResponse> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => buildSuggestedStorylinesPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

/**
 * @return Promise w/ storylines
 */
export const suggestedStorylines = (unObjectId: string, headers: object = null): Promise<any> => {
  return Promise.resolve(buildIdInput(unObjectId))
    .then((input: IdInput) => suggestedStorylines_gql(input, headers))
    .then((res: GqlResponse) => _.result(res, 'data.suggestedStorylines'))
    .catch(sf.tap_throw(err => logger.error('suggestedStorylines', { unObjectId, err })))
}

const buildActionWithContextPayload = (input: IdInput): any => {
  const query = gql`
        ${actionWithContextFragment}
        query actionWithContext($input: IdInput!) {
            actionWithContext(input: $input) {
                ...actionWithContextFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

/**
 * 
 * @param ID input w/ id
 * @return Promise w/ GqlResponse
 */
export const actionWithContext_gql = (input: IdInput, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(buildActionWithContextPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

/**
 * 
 * @param actionWithContextId
 * @return Promise w/ actionWithContext
 */
export const actionWithContext = (actionWithContextId: string): Promise<any> => {
  return storyline_gql(buildIdInput(actionWithContextId))
    .then(res => _.result(res, 'data.actionWithContext'))
    .catch(sf.tap_throw(err => logger.error('actionWithContext', { actionWithContextId, err })))
}

const buildUnObjectPayload = (input: IdInput): any => {
  const query = gql`
        ${unObjectFragment}
        ${playerContextFragment}
        ${storyboardFragment}
        query unObject($input: IdInput!) {
            unObject(input: $input) {
                ...unObjectFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

/**
 * 
 * @param ID input w/ id
 * @return Promise w/ GqlResponse
 */
export const unObject_gql = (input: IdInput, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(buildUnObjectPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

const buildPlayActionPayload = (input: ActionStubInput): any => {
  const query = gql`
        ${actionWithContextFragment}
        mutation playAction($input: ActionStubInput!) {
            playAction(input: $input) {
                ...actionWithContextFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

/**
 * 
 * @param ID input w/ id
 * @return Promise w/ GqlResponse
 */
export const playAction_gql = (input: IdInput, headers: object): Promise<GqlResponse> => {
  return Promise.resolve(buildPlayActionPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

export const createUnObjectMutation = gql`
    mutation createUnObject($input: CreateUnObjectInput!) {
        createUnObject(input: $input) {
            name
            text
            emoji
            entryId
            entry
            createdByUserId
            createdAt
            updatedAt
        }
    }
`

/**
 * 
 * @param ID input w/ id
 * @return Promise w/ GqlResponse
 */
export const createUnObject_gql = (input: CreateUnObjectInput, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(axios.buildGqlPayload(createUnObjectMutation, input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

export const resetMyPlayerContextMutation = gql`
    ${playerContextFragment}
    mutation resetMyPlayerContext($input: IdInput!) {
        resetMyPlayerContext(input: $input) {
            ...playerContextFragment
        }
    }
`

/**
 * 
 * @param ID input w/ storyboard id
 * @return Promise w/ GqlResponse
 */
export const resetMyPlayerContext_gql = (input: IdInput, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(axios.buildGqlPayload(resetMyPlayerContextMutation, input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}
