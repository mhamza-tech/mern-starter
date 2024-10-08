/**
 * @rob4lderman
 * aug2019
 * 
 */
import _ from 'lodash'
import axios from 'axios'
import { MASTER_API_KEY } from 'src/env'
import * as sf from 'src/utils/sf'
import { LoggerFactory } from 'src/utils/logger'
import { GqlResponse } from './types'
import { print } from 'graphql/language/printer'
const logger = LoggerFactory('axios')

export const buildHeaders = (headers: object = null): {
  timeout: number
  headers: {
    'x-api-key': string
  } & object
} => ({
  timeout: 15 * 1000,
  headers: _.extend(
    { 'x-api-key': MASTER_API_KEY },
    headers
  ),
})

export const post = (...args): any => {
  // eslint-disable-next-line prefer-spread
  return axios.post.apply(axios, args)
    .then(sf.tap(res => logger.log('post', { res, args })))
    .then(res => res.data)
    .catch(sf.tap_throw(err => debugAxiosError(err)))
}

const debugAxiosError = (error): void => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    logger.error('debugAxiosError', {
      status: error.response.status,
      data: error.response.data,
      gqlError: _.first(_.result(error.response.data, 'errors')),
      headers: error.response.headers,
      config: error.config,
      error,
    })
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    logger.error('debugAxiosError', {
      error,
      request: error.request,
      config: error.config,
    })
  } else {
    // Something happened in setting up the request that triggered an Error
    logger.error('debugAxiosError', {
      error,
      message: error.message,
      config: error.config,
    })
  }
}

// -rx- const buildGqlErrorMessage = (error): string => {
// -rx-     return `${_.result(error, 'extensions.code')}:${error.message}`;
// -rx- };

export const throwGqlError = (res: GqlResponse): GqlResponse => {
  if (!!!_.isEmpty(res.errors)) {
    throw _.first(res.errors)
    // -rx- throw new Error( buildGqlErrorMessage( _.first( res.errors ) ) );
  }
  return res
}

export const buildGqlPayload = (gqlQuery: any, input: any): any => {
  return {
    query: print(gqlQuery),
    variables: { input },
  }
}
