/**
 * @rob4lderman
 * aug2019
 */

import { ApolloError } from 'apollo-server'
import { ErrorType } from '../../gql-types'
import _ from 'lodash'

export const buildInvalidPasswordError = (): ApolloError => new ApolloError(
  'Your password is invalid. It must be at least 8 chars long and have no spaces in it.',
  ErrorType.InvalidPassword
)

export const buildInvalidEmailError = (): ApolloError => new ApolloError(
  'Your email must be a valid email address',
  ErrorType.InvalidEmail
)

export const buildInvalidCredentialsError = (): ApolloError => new ApolloError(
  'Invalid credentials',
  ErrorType.InvalidCredentials
)

export const buildEmailAlreadyExistsError = (email: string): ApolloError => new ApolloError(
  'A user with that email already exists: ' + email,
  ErrorType.EmailAlreadyExists
)

export const buildUsernameAlreadyExistsError = (username: string): ApolloError => new ApolloError(
  'A user with that username already exists: ' + username,
  ErrorType.UsernameAlreadyExists
)

export const buildUsernameProhibitedError = (username: string): ApolloError => new ApolloError(
  'That username is prohibited: ' + username,
  ErrorType.UsernameProhibited
)

export const buildEmailOrUsernameRequiredError = (): ApolloError => new ApolloError(
  'Your email or your username is required',
  ErrorType.EmailOrUsernameRequired
)

export const buildEmailOrUsernameNotFoundError = (email: string, username: string): ApolloError => {
  if (!!!_.isEmpty(email)) {
    return new ApolloError(
      `That email is not found: ${email}`,
      ErrorType.EmailNotFound
    )
  }
  if (!!!_.isEmpty(username)) {
    return new ApolloError(
      `That username is not found: ${username}`,
      ErrorType.UsernameNotFound
    )
  }
  return new ApolloError(
    `That email or username is not found: ${email} ${username}`,
    ErrorType.EmailOrUsernameNotFound
  )
}

export const buildInvalidResetPasswordTokenError = (token: string): ApolloError => new ApolloError(
  `The reset-password token is invalid or has expired: ${token}`,
  ErrorType.InvalidResetPasswordToken
)

export const buildInvalidConfirmEmailTokenError = (token: string): ApolloError => new ApolloError(
  `The confirm-email token is invalid or has expired: ${token}`,
  ErrorType.InvalidConfirmEmailToken
)

export const buildPasswordRequiredError = (): ApolloError => new ApolloError(
  'You must provide a password',
  ErrorType.PasswordRequired
)

export const buildDisplayNameRequiredError = (): ApolloError => new ApolloError(
  'You must provide a name',
  ErrorType.DisplayNameRequired
)

export const buildUserIdNotFoundError = (userId: string): ApolloError => new ApolloError(
  `The user ID was not found: ${userId}`,
  ErrorType.UserIdNotFound
)

export const buildInputRequiredError = (inputField: string): ApolloError => new ApolloError(
  `Missing required input field: ${inputField}`,
  ErrorType.InputRequired
)

export const buildAuthzErrorSessionUserIsUser = (sessionUserId: string, userId: string): ApolloError => new ApolloError(
  `NOT AUTHORIZED: You must be signed in as that user. Your userId: ${sessionUserId}. Target userId: ${userId}.`,
  ErrorType.NotAuthorizedSessionUser
)

export const buildIdOrEmailOrUsernameNotFoundError = ({ userId = '', email = '', username = '' }): ApolloError => {
  if (!!!_.isEmpty(userId)) {
    return new ApolloError(
      `That userId is not found: ${userId}`,
      ErrorType.UserIdNotFound
    )
  }
  return buildEmailOrUsernameNotFoundError(email, username)
}
