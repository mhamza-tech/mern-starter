/**
 * @rob4lderman
 * aug2019
 */

import {
  ApolloError,
} from 'apollo-server'
import {
  ErrorType,
} from '../../gql-types'
import _ from 'lodash'

export const buildAuthzErrorRole = (role: string, yourRoles: string[]): ApolloError => new ApolloError(
  `NOT AUTHORIZED: Required role: ${role}. Your roles: [${_.join(yourRoles, ', ')}]`,
  ErrorType.NotAuthorizedRole
)

export const buildAuthzErrorCreator = (entityType: string, id: string): ApolloError => new ApolloError(
  `NOT AUTHORIZED: You must be the creator of this ${entityType}: ${id}`,
  ErrorType.NotAuthorizedCreator
)

export const buildInvalidStoryboardErrorUnObjectRequired = (): ApolloError => new ApolloError(
  'INVALID STORYBOARD: Your storyboard must be associated with an object',
  ErrorType.InvalidStoryboardUnobjectRequired
)

export const buildInvalidUnObjectErrorNameRequired = (): ApolloError => new ApolloError(
  'INVALID UNOBJECT: Your object must have a name',
  ErrorType.InvalidUnobjectNameRequired
)

export const buildInvalidUnObjectErrorImageRequired = (): ApolloError => new ApolloError(
  'INVALID UNOBJECT: Your object must have an image',
  ErrorType.InvalidUnobjectImageRequired
)

export const buildInvalidStoryboardErrorActionsRequired = (): ApolloError => new ApolloError(
  'INVALID STORYBOARD: Your storyboard must have at least one action',
  ErrorType.InvalidStoryboardActionsRequired
)

export const buildInvalidActionErrorCardRequired = (action): ApolloError => new ApolloError(
  `INVALID ACTION: Your action card must have text or an image. Action: ${action.buttonText}`,
  ErrorType.InvalidActionCardRequired
)

export const buildInternalError = (msg: string): ApolloError => new ApolloError(
  `INTERNAL ERROR: ${msg}`,
  ErrorType.InternalError
)

export const buildInvalidHandlerUnObjectId = (handlerUnObjectId: string): ApolloError => new ApolloError(
  `INVALID HANDLER UNOBJECT: The handlerUnObjectId is not a valid handler unobject: ${handlerUnObjectId}`,
  ErrorType.InvalidHandlerUnObjectIdError
)
