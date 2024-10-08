/**
 * @rob4lderman
 * may2019 
 *
 */
import _ from 'lodash'
import jwt from 'jsonwebtoken'
import {
  SECRET,
  MASTER_API_KEY,
} from '../env'
import { ErrorType } from '../gql-types'
import { skip } from 'graphql-resolvers'
import { LoggerFactory } from 'src/utils/logger'
import { ApolloError } from 'apollo-server'

const logger = LoggerFactory('jwt', 'Auth')

export interface Jwt {
  id: string
  authTokenVersion: number
}

const TOKEN_HEADER = 'x-token'
const API_KEY_HEADER = 'x-api-key'
const TRACKING_ID_HEADER = 'x-tracking-id'
const ACTING_AS_HEADER = 'x-acting-as'
const buildAuthError = (): ApolloError =>
  new ApolloError('You must be signed in to do that', ErrorType.AuthenticationRequired)
const buildMasterAuthError = (): ApolloError =>
  new ApolloError('MASTER_API_KEY is required', ErrorType.AuthenticationRequired)

export const decodeJwt = (token: string): Jwt => {
  try {
    return token
      ? jwt.verify(token, SECRET) as Jwt
      : null
  } catch (e) {
    logger.error('ERROR: decodeJwt', { e, token })
    return null
  }
}

export const getUserId = (token: Jwt): string => {
  return token
    ? token.id
    : '0'  // TODO:return null?
}

export const decodeJwtFromConn = (connectionParams: any): Jwt => {
  return connectionParams
    ? decodeJwt(connectionParams[TOKEN_HEADER])
    : null
}

export const decodeJwtFromReq = (req: any): Jwt => {
  return req
    ? decodeJwt(req.headers[TOKEN_HEADER])
    : null
}

/**
 * GRAPHQL middleware
 * @param parent 
 * @param args 
 * @param ctx 
 */
export const requireJwtGql = (parent, args, ctx): any => {
  const userId: string = getUserId(ctx.token)
  return userId // && userId !== "0"       // TODO: don't allow userId === "0". set getUserId.
    ? skip
    : buildAuthError()
}

export const requireJwtAuth = (parent, args, ctx): any => {
  const user: string = ctx.user
  return user
    ? skip
    : buildAuthError()
}

/**
 * EXPRESS middleware. 
 *
 * @throws if jwt token not available.
 */
export const requireJwt = (req, res, next): void => {
  const token = req.headers[TOKEN_HEADER]
  if (!!!token) {
    throw buildAuthError()
  }
  req.token = decodeJwt(token)
  next()
}

/**
 * EXPRESS middleware. 
 */
export const parseJwt = (req, res, next): void => {
  const token = req.headers[TOKEN_HEADER]
  if (!!!token || _.isEmpty(_.trim(token)) || _.trim(token) === 'null') {
    req.token = { id: 0, authTokenVersion: 0 } // TODO: set to null instead?
  } else {
    req.token = decodeJwt(token)
  }
  next()
}

export const getApiKeyFromReq = (req: any): string => {
  return req
    ? req.headers[API_KEY_HEADER]
    : null
}

export const getApiKeyFromConn = (connectionParams: any): string => {
  return connectionParams
    ? connectionParams[API_KEY_HEADER]
    : null
}

export const getActingAsFromReq = (req: any): string => {
  return req
    ? req.headers[ACTING_AS_HEADER]
    : null
}

/**
 * GRAPHQL middleware.
 */
export const requireMasterApiKeyGql = (parent, args, ctx): any => {
  const apiKey: string = _.trim(ctx.apiKey)
  return apiKey === MASTER_API_KEY
    ? skip
    : buildMasterAuthError()
}

/**
 * GRAPHQL middleware.
 */
export const requireMasterApiKeyGqlP = (parent, args, ctx): Promise<any> => {
  const apiKey: string = _.trim(ctx.apiKey)
  return apiKey === MASTER_API_KEY
    ? Promise.resolve(skip)
    : Promise.reject(buildMasterAuthError())
}

export const getTrackingIdFromReq = (req: any): string => {
  return req
    ? req.headers[TRACKING_ID_HEADER]
    : null
}
