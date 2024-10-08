/**
 * @rob4lderman
 * aug2019
 * 
 * API for the Auth Service.
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
  GqlError,
} from './types'
import {
  UpdateUserInput,
  UpdateUserFields,
  UserInput,
  SignUpInput,
  SignInInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ConfirmEmailInput,
  UpdateEmailInput,
  UpdatePasswordInput,
  UserRoleInput,
  MasterUserInput,
} from '../gql-types'

export const userFragment = gql`
    fragment userFragment on User {
        id
        displayName
        username
        isAnonymous
    }
`

export const userFragmentAll = gql`
    fragment userFragment on User {
        id
        displayName
        username
        email
        tempEmail
        isAnonymous
        isConfirmed
        isVerifiedAccount
        isPasswordSet
        resetPasswordToken
        confirmEmailToken
        roles
    }
`

export const signInResultFragment = gql`
    ${userFragmentAll}
    fragment signInResultFragment on SignInResult {
        token
        user {
            ...userFragment
        }
    }
`

const assertServiceUrl = (): string => {
  if (_.isEmpty(SERVICE_URL)) {
    throw new Error('SERVICE_URL is undefined')
  }
  return SERVICE_URL
}

const buildUserInput = (userId: string): UserInput => {
  return {
    userId,
  }
}

const buildUserPayload = (userInput: UserInput, withAllFields = false): any => {
  const query = gql`
        ${ withAllFields ? userFragmentAll : userFragment}
        query user($userInput: UserInput!) {
            user(input: $userInput) {
                ...userFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { userInput },
  }
}

/**
 * 
 * @param userId 
 * @return Promise w/ User
 */
export const readUser_gql = (userId: string, withAllFields = false, headers: object = {}): Promise<GqlResponse> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => buildUserInput(userId))
    .then((userInput: UserInput) => buildUserPayload(userInput, withAllFields))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

/**
 * 
 * @param userId 
 * @return Promise w/ User
 */
export const readUser = (userId: string, withAllFields = false): Promise<any> => {
  return readUser_gql(userId, withAllFields)
    .then(axios.throwGqlError)
    .then(data => _.result(data, 'data.user'))
}

const buildMasterUserPayload = (input: UserInput, withAllFields = false): any => {
  const query = gql`
        ${ withAllFields ? userFragmentAll : userFragment}
        query masterUser($input: MasterUserInput!) {
            masterUser(input: $input) {
                ...userFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

/**
 * @param userId 
 * @return Promise w/ User
 */
export const readMasterUser_gql = (userId: string, withAllFields = false): Promise<GqlResponse> => {
  return Promise.resolve({ userId })
    .then((input: MasterUserInput) => buildMasterUserPayload(input, withAllFields))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders()))
}

/**
 * 
 * @param userId 
 * @return Promise w/ User
 */
export const readMasterUser = (userId: string, withAllFields = false): Promise<any> => {
  return readMasterUser_gql(userId, withAllFields)
    .then(axios.throwGqlError)
    .then(data => _.result(data, 'data.masterUser'))
}

const buildUpdateUserPayload = (input: UpdateUserInput, withAllFields = false): any => {
  const query = gql`
        ${ withAllFields ? userFragmentAll : userFragment}
        mutation updateUser($input: UpdateUserInput!) {
            updateUser(input: $input) {
                ...userFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const updateUser_gql = (userId: string, updatedFields: UpdateUserFields): Promise<GqlResponse> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => ({ userId, updatedFields }))
    .then((input: UpdateUserInput) => buildUpdateUserPayload(input, true))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders()))
}

export const updateUser = (userId: string, updatedFields: UpdateUserFields): Promise<any> => {
  return updateUser_gql(userId, updatedFields)
    .then(data => _.result(data, 'data.updateUser'))
    .catch(() => null) // TODO: handle errors!  the 12 microservice fallacies or whatever
}

const buildUpdateMePayload = (input: UpdateUserFields, withAllFields = false): any => {
  const query = gql`
        ${ withAllFields ? userFragmentAll : userFragment}
        mutation updateMe($input: UpdateUserFields!) {
            updateMe(input: $input) {
                ...userFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const updateMe_gql = (updatedFields: UpdateUserFields, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(updatedFields)
    .then((input: UpdateUserFields) => buildUpdateMePayload(input, true))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
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
    .catch(() => null) // TODO: handle errors
}

const buildSessionPayload = (): object => {
  const query = gql`
        ${signInResultFragment}
        mutation session {
            session {
                ...signInResultFragment
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
export const session_gql = (xtoken = ''): Promise<GqlResponse> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => buildSessionPayload())
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders({ 'x-token': xtoken })))
}

/**
 * @return Promise w/ ready
 */
export const session = (xtoken = ''): Promise<any> => {
  return session_gql(xtoken)
    .then((res: GqlResponse) => _.result(res, 'data.session'))
    .catch(() => null) // TODO: handle errors!  the 12 microservice fallacies or whatever
}

const buildMePayload = (): object => {
  const query = gql`
        ${userFragmentAll}
        query me {
            me {
                ...userFragment
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
export const me_gql = (xtoken: string): Promise<GqlResponse> => {
  return Bluebird.Promise.try(assertServiceUrl)
    .then(() => buildMePayload())
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders({ 'x-token': xtoken })))
}

/**
 * @return Promise w/ ready
 */
export const me = (xtoken: string): Promise<any> => {
  return me_gql(xtoken)
    .then((res: GqlResponse) => _.result(res, 'data.me'))
    .catch(() => null) // TODO: handle errors!  the 12 microservice fallacies or whatever
}

const buildSignUpPayload = (input: SignUpInput): any => {
  const query = gql`
        ${signInResultFragment}
        mutation signUp($input: SignUpInput!) {
            signUp(input: $input) {
                ...signInResultFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const signUp_gql = (input: SignUpInput, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(buildSignUpPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

export const signUp = (email: string, password: string, displayName: string): Promise<any> => {
  return Promise.resolve({ email, password, displayName })
    .then((input: SignUpInput) => signUp_gql(input))
    .then(axios.throwGqlError)
    .then(data => _.result(data, 'data.signUp'))
}

const buildSignInPayload = (input: SignInInput): any => {
  const query = gql`
        ${signInResultFragment}
        mutation signIn($input: SignInInput!) {
            signIn(input: $input) {
                ...signInResultFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const assertIsEmailNotFoundGqlError = (error: GqlError): GqlError => {
  const isEmailNotFoundError = _.result(error, 'extensions.code') === 'EMAIL_OR_USERNAME_NOT_FOUND'
        || _.result(error, 'extensions.code') === 'EMAIL_NOT_FOUND'
        || _.result(error, 'extensions.code') === 'USERNAME_NOT_FOUND'
        
  if (!!! isEmailNotFoundError) {
    throw error
  }
  return error
}

export const signIn_gql = (input: SignInInput): Promise<GqlResponse> => {
  return Promise.resolve(buildSignInPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders()))
}

export const signIn = (email: string, password: string, username = ''): Promise<any> => {
  return Promise.resolve({ email, password, username })
    .then((input: SignInInput) => signIn_gql(input))
    .then(axios.throwGqlError)
    .then(res => _.result(res, 'data.signIn'))
}

const buildForgotPasswordPayload = (input: ForgotPasswordInput): any => {
  const query = gql`
        mutation forgotPassword($input: ForgotPasswordInput!) {
            forgotPassword(input: $input)         
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const forgotPassword_gql = (input: ForgotPasswordInput): Promise<GqlResponse> => {
  return Promise.resolve(buildForgotPasswordPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders()))
}

const buildResetPasswordPayload = (input: ResetPasswordInput): any => {
  const query = gql`
        ${signInResultFragment}
        mutation resetPassword($input: ResetPasswordInput!) {
            resetPassword(input: $input) {
                ...signInResultFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const resetPassword_gql = (input: ResetPasswordInput): Promise<GqlResponse> => {
  return Promise.resolve(buildResetPasswordPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders()))
}

const buildConfirmEmailPayload = (input: ConfirmEmailInput): any => {
  const query = gql`
        ${signInResultFragment}
        mutation confirmEmail($input: ConfirmEmailInput!) {
            confirmEmail(input: $input) {
                ...signInResultFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const confirmEmail_gql = (input: ConfirmEmailInput): Promise<GqlResponse> => {
  return Promise.resolve(buildConfirmEmailPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders()))
}

const buildUpdateEmailPayload = (input: UpdateEmailInput): any => {
  const query = gql`
        ${userFragmentAll}
        mutation updateEmail($input: UpdateEmailInput!) {
            updateEmail(input: $input) {
                ...userFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const updateEmail_gql = (input: UpdateEmailInput, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(buildUpdateEmailPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

const buildUpdatePasswordPayload = (input: UpdatePasswordInput): any => {
  const query = gql`
        ${userFragmentAll}
        mutation updatePassword($input: UpdatePasswordInput!) {
            updatePassword(input: $input) {
                ...userFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const updatePassword_gql = (input: UpdatePasswordInput, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(buildUpdatePasswordPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

const buildIsUsernameAvailablePayload = (input: string): any => {
  const query = gql`
        query isUsernameAvailable($input: String!) {
            isUsernameAvailable(input: $input) 
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const isUsernameAvailable_gql = (input: string, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(buildIsUsernameAvailablePayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

const buildValidateConfirmEmailTokenPayload = (input: string): any => {
  const query = gql`
        ${ userFragment}
        query validateConfirmEmailToken($input: String!) {
            validateConfirmEmailToken(input: $input) {
                ...userFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const validateConfirmEmailToken_gql = (input: string, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(buildValidateConfirmEmailTokenPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

const buildValidateResetPasswordTokenPayload = (input: string): any => {
  const query = gql`
        ${ userFragment}
        query validateResetPasswordToken($input: String!) {
            validateResetPasswordToken(input: $input) {
                ...userFragment
            }
        }
    `
  return {
    query: print(query),
    variables: { input },
  }
}

export const validateResetPasswordToken_gql = (input: string, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(buildValidateResetPasswordTokenPayload(input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

export const createUserRoleMutation = gql`
    mutation createUserRole($input: UserRoleInput!) {
        createUserRole(input: $input) {
            id
            userId
            role
            createdAt
        }
    }
`

/**
 * 
 * @param input 
 * @return Promise w/ GqlResponse
 */
export const createUserRole_gql = (input: UserRoleInput, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(axios.buildGqlPayload(createUserRoleMutation, input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}

export const deleteUserRoleMutation = gql`
    mutation deleteUserRole($input: UserRoleInput!) {
        deleteUserRole(input: $input) {
            id
            userId
            role
            createdAt
        }
    }
`

/**
 * 
 * @param input 
 * @return Promise w/ GqlResponse
 */
export const deleteUserRole_gql = (input: UserRoleInput, headers: object = {}): Promise<GqlResponse> => {
  return Promise.resolve(axios.buildGqlPayload(deleteUserRoleMutation, input))
    .then(payload => axios.post(assertServiceUrl(), payload, axios.buildHeaders(headers)))
}
