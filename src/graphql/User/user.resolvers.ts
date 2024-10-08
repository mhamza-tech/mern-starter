/**
 * @rob4lderman
 * aug2019
 *
 */
import _ from 'lodash'
import {
  combineResolvers,
  skip,
} from 'graphql-resolvers'
import {
  sf,
  jwt as jwtutil,
  Jwt,
  misc,
  sft,
} from 'src/utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  SECRET,
  USERS_TO_AUTO_FRIEND,
  DEFAULT_NPC_ID,
} from 'src/env'
import jwt from 'jsonwebtoken'
import {
  User,
  UserRole,
  EmailRegistry,
  Player,
  Edge,
  UnObject,
  DeviceInfo,
  EdgeStats,
  FriendRequest,
  ChatRoom,
} from '../../db/entity'
import { sendgrid } from 'src/services/'
import {
  Redis,
  USER_PRESENCE_CACHE_KEY,
} from 'src/services/redis'
import {
  UpdateUserInput,
  UpdateEmailInput,
  UpdatePasswordInput,
  UpdateUserFields,
  UserRoleInput,
  MasterSessionInput,
  SaveDeviceInfoOutput,
  SendPushNotificationInput,
  EdgeType,
  EntityType,
  SendRawPushNotificationInput,
  SignOutOutput,
  SignOutInput,
  EdgeDirection,
  SaveFieldOutput,
  PresenceType,
  SavePresenceInput,
  SaveFieldInput,
  FieldType,
  EntityRef,
  FieldOutput,
  EdgesInput,
  SaveAvataaarInput,
  Avataaar,
  SaveAvataaarOutput,
  SaveUserProfileImageOutput,
  SaveUserProfileImageInput,
  RegisterEmailInput,
  RegisterEmailOutput,
  ReportPlayerInput,
  SaveEdgeInput,
  EntityScope,
  FollowPlayerInput,
  FollowPlayerOutput,
  FollowsOutput,
  SaveEdgeOutput,
  SendFriendRequestInput,
  FriendRequest as FriendRequestOutput,
  FriendRequestStatus,
  NotificationType,
  UpdateFriendRequestInput,
  FriendRequestsInput,
  FriendRequestsOutput,
  PageInput,
  Player as GqlPlayer,
  ActionXStub,
  MutationUnblockPlayerArgs,
  MutationBlockPlayerArgs,
  UserChatRoomsArgs,
  ChatRoom as GqlChatRoom,
  ChatRoomsOutput,
  ChatRoomType,
  MutationUpdateUserArgs,
  QueryUserArgs,
  MutationSaveDeviceInfoArgs,
  MutualFriendsOutput,
  UserMutualFriendsArgs,
  MutationInstantFriendArgs,
  Role,
  MutationUpdateUserRoleArgs,
  UserNotificationsCountArgs,
  QueryNotificationsArgs,
  NotificationsOutput,
} from '../../gql-types'
import {
  defaultPageInput,
  pageResult,
} from '../pageInput'
import { MoreThan } from 'typeorm'
import Bluebird from 'bluebird'
import Joi, { Schema } from '@hapi/joi'
import * as joi from '../joi'
import * as errors from './user.error'
import * as model from './user.model'
import * as authz from './user.authz'
import * as unObjectModel from '../Action/unobject.model'
import { readUnObjectByUsername } from '../Action/unobject.model'
import * as activityModel from '../Activity/activity.model'
import * as friendRequestModel from '../Activity/friend.request.model'
import * as core from '../core'
import * as models from '../models'
import * as store from '../store'
import * as notifs from '../notifs'
import * as fcm from '../../services/fcm'
import * as pubsub from '../pubsub'
import { FIELD_NAME as xpFieldName } from 'src/maker/experiencePoints'
import { createChatRoom } from 'src/graphql/Chat/chat.resolvers'
import { events } from 'src/events'
import { hasPermission } from 'src/graphql/User/user.permission'
import { fakeUsers } from 'src/domain/fakeUsers'

type UserResponse = Promise<{
  user: User
  token: string
}>

const logger = LoggerFactory('user.resolvers', 'UserResolvers')

const cleanSignUpInput = (signUpInput: any): any => {
  return _.extend(signUpInput, {
    displayName: model.cleanDisplayName(signUpInput.displayName),
    email: model.cleanEmail(signUpInput.email),
  })
}

/**
 * @return promise w/ token
 */
const signJwt = (payload: Jwt): Promise<string> => {
  return new Promise(
    (resolve, reject) => jwt.sign(
      payload,
      SECRET,
      {},
      (err, token) => {
        if (err) {
          reject(err)
        } else {
          resolve(token)
        }
      },
    ),
  )
}

const buildJwt = (user: User): Jwt => ({
  id: user.id,
  authTokenVersion: user.authTokenVersion,
})

/**
 *
 * @param user
 * @return Promise w/ { user, token }
 */
const buildSignInResult = (user: User): UserResponse => {
  return Promise.resolve(signJwt(buildJwt(user)))
    .then((token: string) => ({ user, token }))
}

/**
 * @param input
 * @return input
 * @throws if invalid
 */
const validateSignUpInput = (input: any): any => {
  const schema = Joi.object().keys({
    displayName: Joi.string().max(256).required(),
    email: Joi.string().email({ minDomainSegments: 2 }),
    password: [buildJoiEmptyOrNullStringValidator(), buildJoiPasswordValidator()],
  })
  const result = joi.validate(input, schema)
  logger.log('validateSignUpInput', { result })
  parseAndThrowJoiError(result)
  return input
}

const parseAndThrowJoiError = (result: any): void => {
  if (!!!result.error) {
    return
  }
  if (_.includes(result.error.message, 'password')) {
    throw errors.buildInvalidPasswordError()
  }
  if (_.includes(result.error.message, 'email')) {
    throw errors.buildInvalidEmailError()
  }
  if (_.includes(result.error.message, 'displayName')) {
    throw errors.buildDisplayNameRequiredError()
  }
  throw result.error
}

/**
 * 1. check for unique email
 * 2. convert input dispayName to a unique username
 * 3. bcrypt password
 * 4. insert user / update anon user
 * 5. generate jwt
 * 6. return { user, jwt }
 *
 * @return Promise w/ { user, token }
 */
const signUp = (root, args, ctx): UserResponse => {
  const input: any = validateSignUpInput(cleanSignUpInput(args.input))

  if (model.isInvalidUsername(input.displayName)) throw errors.buildUsernameProhibitedError(input.displayName)

  return model
    .readUserByEmail(input.email)
    .then(user => {
      if (user) throw errors.buildEmailAlreadyExistsError(input.email)
    })
    .then(() => core.buildUniqueUsername(input.displayName))
    .then(username => model.buildNewUser(ctx.user, input, username))
    .then(user => store.saveUser(user, model.saveUser))
    .then(sf.tap(buildCoreActionEdgesForUserCached))
    .then(sft.tap_wait(user => events.user.created.notify({ user })))
    .then(sf.tap_catch(
      user => _.isNil(USERS_TO_AUTO_FRIEND) || _.isEmpty(USERS_TO_AUTO_FRIEND)
        ? null
        : sft.promiseMap(
          USERS_TO_AUTO_FRIEND.split(','),
          uId => autoFriendUser({ user: user }, uId, true))
    ))
    .then(user => buildSignInResult(user))
}

const isEmail = (str: string): boolean => {
  // const result = validate( str, string().email({ minDomainSegments: 2 }) );
  const result = Joi.string().regex(/^[^@]+@[^@]+$/).validate(str)
  return (!!!result.error)
}

const parseEmailOrUsernameInput = (input: any): any => {
  if (_.isEmpty(misc.stripWhitespace(input.emailOrUsername))) {
    return input
  }
  return isEmail(model.cleanEmail(input.emailOrUsername))
    ? _.extend(input, { email: input.emailOrUsername })
    : _.extend(input, { username: input.emailOrUsername })
}

const cleanSignInInput = (input: any): any => {
  input = parseEmailOrUsernameInput(input)
  return _.extend(input, {
    username: model.cleanUsername(input.username),
    email: model.cleanEmail(input.email),
  })
}

const validateEmailOrUsername = (input: any): any => {
  if (!!!input.username && !!!input.email) {
    throw errors.buildEmailOrUsernameRequiredError()
  }
  return input
}

const validateSignInInput = (input: any): any => {
  validateEmailOrUsername(input)
  if (_.isEmpty(input.password)) {
    throw errors.buildPasswordRequiredError()
  }
  return input
}

/**
 * @return Promise w/ { user, token }
 */
const signIn = (root, args): UserResponse => {
  const input: any = validateSignInInput(cleanSignInInput(args.input))
  return Promise.resolve(model.readUserByEmailOrUsername(input.email, input.username, true))
    .then(sf.thru_if(user => !!!user)(
      () => {
        throw errors.buildEmailOrUsernameNotFoundError(input.email, input.username)
      },
    ))
    .then(user => model.comparePassword(user, input.password))
    .then(user => model.readUserById(user.id))
    .then(user => buildSignInResult(user))
}

const buildSignOutInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    deviceToken: Joi.string().allow(null, ''),
  })
}

const signOut = (root, args, ctx): Promise<SignOutOutput> => {
  const sessionUser: User = ctx.user
  const input: SignOutInput = joi.validate(args.input, buildSignOutInputSchema())

  if (!sessionUser) {
    return Promise.resolve({ result: true })
      .then(sf.tap_throw(
        () => logger.warn('attempted to signOut without a user session')
      ))
  }

  // 1. mark deviceToken "logged out"
  // 2. disable token
  return model.readDeviceInfoBy({
    userId: sessionUser.id,
    deviceToken: input.deviceToken,
  })
    .then(sf.maybe_fmap(
      (deviceInfo: DeviceInfo) => model.saveDeviceInfo(_.extend(deviceInfo, { isSignedIn: false }) as any),
    ))
    .then(() => ({ result: true }))
}

const validateForgotPasswordInput = validateEmailOrUsername
const cleanForgotPasswordInput = cleanSignInInput

/**
 * 1. find user
 * 2. check if resetPasswordToken is already set
 * 2. if not, generate random resetPasswordToken, set into User db
 * 3. email link w/ resetPasswordToken
 *
 * @return nothing
 */
const forgotPassword = (root, args): Promise<any> => {
  const input: any = validateForgotPasswordInput(cleanForgotPasswordInput(args.input))
  return model.readUserByEmailOrUsername(input.email, input.username, true)
    .then(sf.thru_if(user => !!!user)(
      () => {
        throw errors.buildEmailOrUsernameNotFoundError(input.email, input.username)
      },
    ))
    .then(
      user => model.isResetPasswordTokenValid(user)
        ? user
        : model.generateResetPasswordToken(user),
    )
    .then(sf.tap(user => logger.log('forgotPassword: resetPasswordToken', { user })))
    .then(sf.tap(user => sendgrid.sendResetPasswordEmail(user)))
    .then(() => true) // the api returns boolean (meaningless)
}

/**
 * @param input
 * @return input
 * @throws if invalid
 */
const validateResetPasswordInput = (input: any): any => {
  const schema = Joi.object().keys({
    resetPasswordToken: Joi.string().required(),
    password: buildJoiPasswordValidator(),
  })
  const result = joi.validate(input, schema)
  parseAndThrowJoiError(result)
  return input
}

/**
 * 1. find user by resetPasswordToken
 * 3. bcrypt password
 * 4. update user
 * 5. sign jwt
 *
 * @param args.input
 *   input ResetPasswordInput {
 *       resetPasswordToken: String!
 *       password: String!
 *   }
 *
 * @return Promise w { user, token }
 */
const resetPassword = (root, args): UserResponse => {
  const input: any = validateResetPasswordInput(args.input)
  return Promise.resolve(model.readUserByResetPasswordToken(input.resetPasswordToken))
    .then(sf.thru_if(user => !!!user)(
      () => {
        throw errors.buildInvalidResetPasswordTokenError(input.resetPasswordToken)
      },
    ))
    .then(sf.thru_if(user => !!!model.isResetPasswordTokenValid(user))(
      () => {
        throw errors.buildInvalidResetPasswordTokenError(input.resetPasswordToken)
      },
    ))
    .then(user => model.updatePassword(user, input.password))
    .then(user => model.updateUser(user, {
      isConfirmed: true,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
      authTokenVersion: user.authTokenVersion + 1,    // invalidate old JWTs
    }))
    .then(store.refetchUser)
    .then(buildSignInResult)
}

const buildJoiPasswordValidator = (): Joi.StringSchema => Joi.string().regex(/^\S{1,100}$/)

const buildJoiEmptyOrNullStringValidator = (): Joi.StringSchema => Joi.string().valid('').allow(null)

/**
 * @param input
 * @return input
 * @throws if invalid
 */
const validateConfirmEmailInput = (input: any): any => {
  const schema = Joi.object().keys({
    confirmEmailToken: Joi.string().required(),
    password: [buildJoiEmptyOrNullStringValidator(), buildJoiPasswordValidator()],
  })
  const result = joi.validate(input, schema)
  parseAndThrowJoiError(result)
  return input
}

/**
 *
 * 1. find user by ID
 * 2. verify confirmEmailToken
 * 3. set isConfirmed = true
 * 4. return true
 *
 * @param args.input
 *   input ConfirmEmailInput {
 *       confirmEmailToken: String!
 *       password: String!
 *       userId: ID!
 *   }
 *
 * @return Promise w { user, token }
 */
const confirmEmail = (root, args): UserResponse => {
  const input: any = validateConfirmEmailInput(args.input)
  return Promise.resolve(model.readUserByConfirmEmailToken(input.confirmEmailToken))
    .then(sf.thru_if(user => !!!model.isConfirmEmailTokenValid(user))(
      () => {
        throw errors.buildInvalidConfirmEmailTokenError(input.confirmEmailToken)
      },
    ))
    .then(sf.thru_if(user => !!!user.isPasswordSet && _.isEmpty(input.password))(
      () => {
        throw errors.buildPasswordRequiredError()
      },
    ))
    .then(sf.thru_if(() => !!!_.isEmpty(input.password))(
      user => model.updatePassword(user, input.password),
    ))
    .then(user => model.updateUser(user, {
      isConfirmed: true,
      confirmEmailToken: null,
      confirmEmailTokenExpiresAt: null,
    }))
    .then(store.refetchUser)
    .then(user => buildSignInResult(user))
}

const validateConfirmEmailToken = (root, args): Promise<User> => {
  const confirmEmailToken: any = validateStringInput(cleanStringInput(args.input), 'input:{confirmEmailToken}')
  return model.readUserByConfirmEmailToken(confirmEmailToken)
    .then(sf.thru_if(user => !!!model.isConfirmEmailTokenValid(user))(
      () => {
        throw errors.buildInvalidConfirmEmailTokenError(confirmEmailToken)
      },
    ))
    .then(user => model.readUserById(user.id))    // clear out hidden fields
}

/**
 * @return Promise w/ User
 */
const me = (root, args, ctx): Promise<User> => {
  return store.userById(ctx.user.id)
}

/**
 * Called from session(), which is called every time the user opens the app.
 * TODO: good place for pre-fetching / pre-caching of the user's stuff
 * @param sessionUser
 */
const onSession = (sessionUser: User): Promise<User> => {
  logger.info('onSession', { sessionUser })
  return Promise.resolve(sessionUser)
    .then(sf.tap(
      (sessionUser: User) => store.unreadCommentsCount(sessionUser.id)
        .then((badge: number) => notifs.sendSilentPushBadgeUpdate(sessionUser.id, badge)),
    ))
    .then(sf.tap(buildCoreActionEdgesForUserCached))
}

/**
 * if ctx.user already exists, return it.
 * else return null
 *
 * 1. at startup, front-end web + mobile apps make an "initSession" req to the backend
 * 2. front-end passes a JWT token (if they already have one),
 *    as read from browser/app local storage
 * 3. on the backend, if the JWT token is NOT null (existing user), then we'll resolve
 *    it to the existing user and we're done.
 * 4. if the JWT token is null, we return null
 *
 * @return Promise w { user, token }
 */
const session = (root, args, ctx): UserResponse => {
  return Promise.resolve(me(root, args, ctx))
    .then(sf.tap_catch(onSession))
    .then(user => buildSignInResult(user))
}

const sendConfirmEmail = (root, args, ctx): Promise<boolean> => {
  return model.readUserById(ctx.user.id, true)
    .then(
      user => model.isConfirmEmailTokenValid(user)
        ? user
        : model.generateConfirmEmailToken(user),
    )
    .then(user => sendgrid.sendConfirmEmail(user))
    .then(() => true)
}

export const masterUser = (root, args): Promise<User> => {
  const input = args.input
  return model.readUserByIdOrEmailOrUsername(input.userId, input.email, input.username, true)
}

const buildUserInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    userId: Joi.string().required(),
  })
}

export const user = (root, args: QueryUserArgs): Promise<User> => {
  const input = joi.validate(args.input, buildUserInputSchema())
  return store.userById(input.userId)
}

const joiValidate = (input: any, schema: Schema): any => {
  const result = joi.validate(input, schema)
  parseAndThrowJoiError(result)
  return input
}

export const updateUser = (root, args: MutationUpdateUserArgs): Promise<User> => {
  const input = joiValidate(args.input, joi.buildUpdateUserInputSchema()) as UpdateUserInput
  logger.debug('updateUser', { input })
  return store.userById(input.userId)
    .then(sf.thru_if(user => !!!user)(
      () => {
        throw errors.buildUserIdNotFoundError(input.userId)
      },
    ))
    .then(user => store.saveUser(user, user => model.updateUserFields(user, input.updatedFields)))
  // TODO: record update event.
}

const updateMe = (root, args, ctx): Promise<User> => {
  const input: UpdateUserFields = joiValidate(args.input, joi.buildUpdateUserFieldsSchema()) as UpdateUserFields
  const sessionUser: User = ctx.user
  logger.debug('updateMe', { input, ctx })
  return store.saveUser(sessionUser, user => model.updateUserFields(user, input))
    .then((user) => {
      if (!_.isEqual(user.birthday, model.DEFAULT_BIRTHDAY) && _.isEqual(user.hasCompletedSignup, false)) {
        return model.generateConfirmEmailToken(user)
          .then(sf.tap(user => logger.log('signUp: confirmEmailToken', { user })))
          .then(sf.tap(user => sendgrid.sendConfirmEmail(user)))
      }
      return user
    })
  // TODO: record update event.
}

const cleanIsUsernameAvailableInput = (input: string): string => {
  return model.cleanUsername(input)
}

const validateIsUsernameAvailableInput = (input: string): string => {
  if (_.isEmpty(input)) {
    throw errors.buildInputRequiredError('input:{username}')
  }
  return input
}

const isUsernameAvailable = (root, args, ctx): Promise<boolean> => {
  const username: string = validateIsUsernameAvailableInput(cleanIsUsernameAvailableInput(args.input))
  const sessionUser: User = ctx.user
  return usernameAvailable(sessionUser, username)
}

const usernameAvailable = (sessionUser: User, username: string): Promise<boolean> => {
  return readUnObjectByUsername(username)
    .then(unObject => unObject
      ? Promise.resolve(false)
      : model.readUserByUsername(username)
        .then(user => !user || user.id == sessionUser.id),
    )
}

const cleanStringInput = (input: string): string => {
  return _.trim(input)
}

const validateStringInput = (input: any, errMsg = 'input:{string}'): string => {
  if (_.isEmpty(input)) {
    throw errors.buildInputRequiredError(errMsg)
  }
  return input
}

const cleanIsResetPasswordTokenValidInput = cleanStringInput

const validateIsResetPasswordTokenValidInput = (input: string): string => {
  return validateStringInput(input, 'input:{resetPasswordToken}')
}

const isResetPasswordTokenValid = (root, args): Promise<boolean> => {
  const resetPasswordToken: any = validateIsResetPasswordTokenValidInput(cleanIsResetPasswordTokenValidInput(args.input))
  return model.readUserByResetPasswordToken(resetPasswordToken)
    .then(user => model.isResetPasswordTokenValid(user))
}

const validateResetPasswordToken = (root, args): Promise<User> => {
  const resetPasswordToken: any = validateStringInput(cleanStringInput(args.input), 'input:{resetPasswordToken}')
  return model.readUserByResetPasswordToken(resetPasswordToken)
    .then(sf.thru_if(user => !!!model.isResetPasswordTokenValid(user))(
      () => {
        throw errors.buildInvalidResetPasswordTokenError(resetPasswordToken)
      },
    ))
    .then(user => model.readUserById(user.id))    // clear out hidden fields
}

const cleanUpdateUsernameInput = (input: string): string => {
  return model.cleanUsername(input)
}

const validateUpdateUsernameInput = (input: string): string => {
  if (_.isEmpty(input)) {
    throw errors.buildInputRequiredError('input:{username}')
  }
  return input
}

const updateUsername = (root, args, ctx): Promise<User> => {
  const username: string = validateUpdateUsernameInput(cleanUpdateUsernameInput(args.input))
  const sessionUser: User = ctx.user
  return usernameAvailable(sessionUser, username)
    .then(available => !available
      ? Promise.reject(errors.buildUsernameAlreadyExistsError(username))
      : Promise.resolve(available),
    )
    .then(() => store.saveUser(sessionUser, user => model.updateUser(user, { username })))
    .then(user => {
      if (_.isEqual(user.hasCompletedSignup, false)) {
        return user
      }
      return sendgrid.sendUsernameChangedEmail(user.email, user.username)
        .then(() => user)
    })
}

const cleanUpdateEmailInput = (input: any): any => {
  return _.extend(input, {
    email: model.cleanEmail(input.email),
  })
}

const validateUpdateEmailInput = (input: any): UpdateEmailInput => {
  return joiValidate(
    input,
    Joi.object().keys({
      email: Joi.string().email({ minDomainSegments: 2 }),
      password: [buildJoiEmptyOrNullStringValidator(), buildJoiPasswordValidator()],
    }),
  )
}

const emailCanBeRegistered = (_root, args): Promise<boolean> => {
  const cleanedEmailInput = cleanUpdateEmailInput(args.input)

  const validInput = Joi.object().keys({
    email: Joi.string().email({ minDomainSegments: 2 }),
  }).validate(cleanedEmailInput)

  if (validInput.error) {
    return Promise.resolve(false)
  } else {
    return model
      .readUserByEmail(validInput.value.email)
      .then(a => typeof a === 'undefined')
      .catch(() => false)
  }
}

/**
 *
 */
const updateEmail = (root, args, ctx): Promise<User> => {
  const input: UpdateEmailInput = validateUpdateEmailInput(cleanUpdateEmailInput(args.input))
  const sessionUser: User = ctx.user
  return model.readUserById(sessionUser.id, true)
    .then(sf.thru_if(user => user.email != input.email)(
      user => Promise.resolve(user)
        // .then( user => model.comparePassword( user, input.password ) )
        .then(() => model.readUserByEmail(input.email))
        .then(sf.thru_if(user => !!!_.isNil(user) && user.id !== sessionUser.id)(
          () => {
            throw errors.buildEmailAlreadyExistsError(input.email)
          },
        ))
        .then(() => model.updateUser(sessionUser, {
          email: input.email,
          isConfirmed: false,
        }))
        .then(user => model.generateConfirmEmailToken(user))
        .then(sf.tap(user => sendgrid.sendConfirmEmail(user))),
    ))
    .then(() => store.refetchUser(sessionUser))
}

const cleanUpdatePasswordInput = (input: any): any => {
  return _.extend(input, {
    oldPassword: _.trim(input.oldPassword),
    newPassword: _.trim(input.newPassword),
  })
}

const validateUpdatePasswordInput = (input: any): any => {
  return joiValidate(
    input,
    Joi.object().keys({
      oldPassword: [Joi.string().allow('', null), buildJoiPasswordValidator()],
      newPassword: buildJoiPasswordValidator(),
    }),
  )
}

const updatePassword = (root, args, ctx): Promise<User> => {
  const input: UpdatePasswordInput = validateUpdatePasswordInput(cleanUpdatePasswordInput(args.input))
  const sessionUser: User = ctx.user
  return model.readUserById(sessionUser.id, true)
    .then(() => model.updatePassword(sessionUser, input.newPassword))
    .then(sf.tap(user => sendgrid.sendPasswordChangedEmail(user.email, user.username)))
}

/**
 *
 */
const authzUserRoles = (): Promise<any> => {
  return Promise.resolve(skip) // because the frontend is fukt.
  // return authz.authzUserIsSessionUser( sessionUser, user )
  //     .catch( (err) => authz.authzMasterApiKeyOverride( err, ctx.apiKey ) )
  //     // .catch( (err) => authz.authzAnonUserOverride( err, user ) )
  //     .then( () => skip )
  //     ;
}

const authzUserIsSessionUser = (user: User, args, ctx): Promise<any> => {
  const sessionUser: User = ctx.user
  return authz.authzSessionUserIsUser(sessionUser, user)
    .catch((err) => authz.authzMasterApiKeyOverride(err, ctx.apiKey))
    .then(() => skip)
}

const userRoles = (user: User): Promise<any[]> => {
  return model.readUserRoles(user.id)
    .then(sf.list_fmap((userRole: UserRole) => userRole.role))
}

const validateUserRoleInput = (input: any): UserRoleInput => {
  input = joiValidate(
    input,
    Joi.object().keys({
      userId: joi.buildOptionalStringValidator(),
      email: joi.buildOptionalStringValidator(),
      username: joi.buildOptionalStringValidator(),
      role: Joi.string().valid(...Object.values(Role)).required(),
    }),
  )
  return _.isEmpty(input.userId)
    ? validateEmailOrUsername(input)
    : input
}

const updateUserRole = (root, args: MutationUpdateUserRoleArgs): Promise<User> => {
  const input = validateUserRoleInput(args.input)
  return model.readUserByIdOrEmailOrUsername(input.userId, input.email, input.username)
    .then(sf.thru_if(user => !!!user)(
      () => {
        throw errors.buildIdOrEmailOrUsernameNotFoundError(input)
      },
    ))
    .then(user => store.saveUser(
      user,
      user => model.updateUser(user, { role: input.role })
    ))
}

const deleteUserRole = (root, args): Promise<UserRole> => {
  const input: UserRoleInput = validateUserRoleInput(args.input)
  return model.readUserByIdOrEmailOrUsername(input.userId, input.email, input.username)
    .then(sf.thru_if(user => !!!user)(
      () => {
        throw errors.buildIdOrEmailOrUsernameNotFoundError(input)
      },
    ))
    .then(
      user => Promise.resolve(model.buildUserRole(user.id, input.role as Role))
        .then((role: UserRole) => model.deleteUserRole(role))
    )
}

const validateMasterSessionInput = (input: any): MasterSessionInput => {
  input = joiValidate(
    input,
    Joi.object().keys({
      userId: joi.buildOptionalStringValidator(),
      email: joi.buildOptionalStringValidator(),
      username: joi.buildOptionalStringValidator(),
    }),
  )
  return _.isEmpty(input.userId)
    ? validateEmailOrUsername(input)
    : input
}

const masterSession = (root, args): UserResponse => {
  const input: MasterSessionInput = validateMasterSessionInput(args.input)
  return model.readUserByIdOrEmailOrUsername(input.userId, input.email, input.username)
    .then(sf.thru_if(user => !!!user)(
      () => {
        throw errors.buildIdOrEmailOrUsernameNotFoundError(input)
      },
    ))
    .then(user => buildSignInResult(user))
}

const saveDeviceInfo = (root, args: MutationSaveDeviceInfoArgs, ctx): Promise<SaveDeviceInfoOutput> => {
  const input = joi.validate(args.input, joi.buildSaveDeviceInfoInputSchema())
  const sessionUser: User = ctx.user
  return Promise.resolve(input)
    .then(input => model.mapSaveDeviceInfoInputToDeviceInfo(input, sessionUser.id))
    .then(model.createOrUpdateDeviceInfo)
    .then(deviceInfo => {
      if (input.timezoneOffset === null || input.timezoneOffset === undefined) {
        return deviceInfo
      }
      return store.saveUser(
        sessionUser,
        user => model.updateUser(user, { timezoneOffset: input.timezoneOffset }),
      )
        .then(() => deviceInfo)
    })
    .then(deviceInfo => ({ deviceInfo }))
    .catch(sf.tap_throw(err => logger.error('saveDeviceInfo', { input, err })))
}

const parseSendRawPushNotificationPayload = (input: SendRawPushNotificationInput): object => {
  if (input.rawPayload) {
    return input.rawPayload
  }
  if (input.rawPayloadJson) {
    return JSON.parse(input.rawPayloadJson)
  }
  return input.payload
}

const sendRawPushNotification = (root, args): Promise<any> => {
  const input: SendRawPushNotificationInput = joi.validate(args.input, joi.buildSendRawPushNotificationInputSchema())
  const payload: any = parseSendRawPushNotificationPayload(input)
  return Promise.resolve(input)
    .then(input => store.userByEid(input.playerEid))
    .then(sf.maybe_fmap(model.mapUserToDeviceInfoTokens))
    .then(sf.list_fmap(deviceInfo => _.extend(_.cloneDeep(payload), { token: deviceInfo.deviceToken })))
    .then(sf.list_fmap_wait(fcm.trySend))
    .then(_.flatten)
    .then(result => ({ result }))
    .catch(sf.tap_throw(err => logger.error('sendPushNotification', { input, err })))
}

const sendPushNotification = (root, args): Promise<any> => {
  const input: SendPushNotificationInput = joi.validate(args.input, joi.buildSendPushNotificationInputSchema())
  return activityModel.readNotificationsBy({ id: input.notificationId })
    .then(sf.list_fmap_wait(notifs.sendPushNotification))
    .then(sf.tap(result => logger.error('sendPushNotification', { result })))
    .then(_.flatten)
    .then(result => ({ result }))
    .catch(sf.tap_throw(err => logger.error('sendPushNotification', { input, err })))
}

const userDeviceInfos = (user: User): Promise<DeviceInfo[]> => {
  return model.readDeviceInfosBy({ userId: _.get(user, 'id', '0') })
}

const userUnObjects = (user: User): Promise<{
  unObjects: UnObject[]
}> => {
  return unObjectModel.readUnObjectsBy({
    where: {
      createdByUserId: user.id,
      isDeleted: false,
    },
    order: {
      createdAt: 'DESC',
    },
  })
    .then((unObjects: UnObject[]) => ({ unObjects }))
}

type ChatRoomOutput = ChatRoom & GqlChatRoom

/**
 * 1) fetch all chatroom edges for a user
 * 2) filter by
 *  2.1) npc that user has permission to view
 *  2.2) requested type (p2p or single player)
 * 3) generate a new list of edges:
 *    i) add single player room edge as is
 *    ii) when p2p, ignore UnObject edge
 *    iii) get the latest room with another user. Note: we use
 *      thatEntitysIndex to track list index of edge with other user
 * 4) filter new edge list by cursor
 * 5) sort filtered edges by `updatedAt` in ascending order
 * 6) take from the top or bottom of the list depending on
 *    whether requested `first` or `last`
 * 7) fetch all chat rooms
 *
 * @param user
 * @param args
 */
const userChatRooms = (user: User, args: UserChatRoomsArgs): Promise<ChatRoomsOutput> => {
  const input = joi.validate(args.input, joi.buildChatRoomsInputSchema()) || {}
  const defaultInput = {
    p2pOnly: input.p2pOnly,
    pageInput: defaultPageInput(args?.input?.pageInput),
  }

  return store.edgesByThisIdEdgeType({
    thisEntityId: user.id,
    edgeType: EdgeType.ChatRoom,
  })
    .then(edges => sft.promiseMap(edges, edge => {
      if (edge.thatEntityType !== EntityType.UnObject) {
        return Promise.resolve(edge)
      }
      return store.thatEntityOfEdge<UnObject>(edge)
        .then(unObject => {
          if (unObject?.id === DEFAULT_NPC_ID) {
            return null
          }
          const cantViewUnObject = unObject?.isDeleted || !hasPermission({
            userRole: user.role,
            targetRole: unObject?.visibleForRole,
          })
          if (cantViewUnObject) {
            // we do not need to wait on this promise
            core.hideChatRoomForUser(edge.collectionId, user.id)
            return null
          }
          return edge
        })
    }))
    .then(_.compact)
    .then(edges => {
      const thatEntitysIndex = {}
      const filtered = edges
        .filter(edge => !defaultInput.p2pOnly
          ? edge.collectionName === ChatRoomType.SinglePlayRoom.toString()
          : edge.collectionName === ChatRoomType.P2PChat.toString() ||
          edge.collectionName === ChatRoomType.MultiPlayRoom.toString()
        )
        .reduce((acc: Edge[], edge) => {
          if (!defaultInput.p2pOnly) {
            acc.push(edge)
            return acc
          }
          if (edge.thatEntityType === EntityType.UnObject) {
            return acc
          }
          const index = !thatEntitysIndex.hasOwnProperty(edge.thatEntityId)
            ? -1
            : thatEntitysIndex[edge.thatEntityId]
          if (index === -1) {
            acc.push(edge)
            thatEntitysIndex[edge.thatEntityId] = acc.length - 1
          } else if (acc[index].updatedAt < edge.updatedAt) {
            acc[index] = edge
          }
          return acc
        }, [])
      return sft.promiseMap(filtered, edge => store.chatRoomById(edge.collectionId))
        .then(chatRooms => chatRooms.sort(misc.sortByDesc('updatedAt')))
    })
    .then(_.partialRight(pageResult, defaultInput.pageInput))
    .then(result => ({
      chatRooms: result.list as ChatRoomOutput[],
      pageInfo: result.pageInfo,
    }))
}

const userNotifications = (user: User, args: QueryNotificationsArgs): Promise<NotificationsOutput> => {
  return core.userNotifications(user, args.input?.pageInput)
}

const userFollowersStats = (user: User): Promise<EdgeStats> => {
  // TODO: edgeStats cache ?
  return activityModel.readEdgeStatsBy({
    entityId: user.id,
    edgeDirection: EdgeDirection.Inbound,
    edgeType: EdgeType.Follows,
  })
    .then(_.first)
}

const playerIsMe = (player, args, ctx): Promise<boolean> => {
  const sessionUser: User = ctx.user
  return core.isPlayerEntityHandledByThisUser(player, sessionUser)
}

const buildSavePresenceInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    presenceType: joi.buildEnumSchema(PresenceType).required(),
  })
}

const buildSaveFieldInputForEntityRef = (entityRef: EntityRef, presenceType: PresenceType): SaveFieldInput => ({
  collectionId: models.buildCollectionId(models.mapEntityRefToEid(entityRef), 'field'),
  scope: EntityScope.GlobalScope,
  thisEntityId: entityRef.id,
  thisEntityType: entityRef.entityType,
  type: FieldType.PresenceField,
  name: 'presence',
  metadata: {
    presenceType,
  },
})

const savePresence = (root, args, ctx): Promise<SaveFieldOutput> => {
  const sessionUser: User = ctx.user
  const input: SavePresenceInput = joi.validate(args.input, buildSavePresenceInputSchema())
  const presenceType: PresenceType = input.presenceType
  const saveFieldInput: SaveFieldInput = buildSaveFieldInputForEntityRef(sessionUser, presenceType)
  return core.saveField(root, { input: saveFieldInput }, ctx)
    .then(sf.tap_catch(
      () => unObjectModel.readUnObjectsBy({
        where: {
          createdByUserId: sessionUser.id,
          isDeleted: false,
        },
      })
        .then(sf.list_fmap_wait((unObject) => buildSaveFieldInputForEntityRef(unObject, presenceType)))
        .then(sf.list_fmap_wait((input: SaveFieldInput) => core.saveField(root, { input }, ctx))),
    ))
}

const buildSaveAvataaarInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    topType: Joi.string().allow('', null),
    accessoriesType: Joi.string().allow('', null),
    hatColor: Joi.string().allow('', null),
    hairColor: Joi.string().allow('', null),
    facialHairType: Joi.string().allow('', null),
    facialHairColor: Joi.string().allow('', null),
    clotheType: Joi.string().allow('', null),
    clotheColor: Joi.string().allow('', null),
    graphicType: Joi.string().allow('', null),
    eyeType: Joi.string().allow('', null),
    eyebrowType: Joi.string().allow('', null),
    mouthType: Joi.string().allow('', null),
    skinColor: Joi.string().allow('', null),
  })
}

const mapSaveAvataaarInputToSaveFieldInput = (entityRef: EntityRef, input: SaveAvataaarInput): SaveFieldInput => ({
  collectionId: models.buildCollectionId(models.mapEntityRefToEid(entityRef), 'field'),
  scope: EntityScope.GlobalScope,
  thisEntityId: entityRef.id,
  thisEntityType: entityRef.entityType,
  type: FieldType.AvataaarField,
  name: 'avataaar',
  metadata: input,
})

const saveAvataaar = (root, args, ctx): Promise<SaveAvataaarOutput> => {
  const sessionUser: User = ctx.user
  const input: SaveAvataaarInput = joi.validate(args.input, buildSaveAvataaarInputSchema())
  const saveFieldInput: SaveFieldInput = mapSaveAvataaarInputToSaveFieldInput(sessionUser, input)
  return core.saveField(root, { input: saveFieldInput }, ctx)
    .then((output: SaveFieldOutput) => _.get(output, 'field.metadata'))
    .then((avataaar: any) => ({ avataaar }))
}

const buildSaveUserProfileImageInputSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    image: Joi.object().required(),
  })
}

/**
 *
 *
 {
    id:"2c41ad33-556b-4d45-8333-369aca87a5b4",
    name:"rob.jpg",
    storageService:"S3",
    mimetype:"image/jpeg",
    userId:"3af78ab0-d0cf-4b3d-954d-cfe79b02001a",
    origImageId:"2c41ad33-556b-4d45-8333-369aca87a5b4",
    dimensions:"orig",
    metadata:{
        ETag:"\"17158f7b8c198fb516dc90f4c10a62c0\"",
        Location:"https://s3.us-west-1.amazonaws.com/dev.unreal.fun/avatar/rob_20191213.000318.429.jpg",
        key:"avatar/rob_20191213.000318.429.jpg",
        Key:"avatar/rob_20191213.000318.429.jpg",
        Bucket:"dev.unreal.fun"
    },
    createdAt:"2019-12-13T00:03:23.925Z",
    updatedAt:"2019-12-13T00:03:24.272Z",
    recordVersion:2
 }
 *
 *
 */
const mapImageInputToUpdateFields = (image: any): object => {
  if (_.get(image, 'storageService') == 'S3') {
    const key = _.get(image, 'metadata.Key', _.get(image, 'metadata.key'))
    return _.isEmpty(key)
      ? {}
      : { s3Key: key, imageUrl: models.mapS3KeyToImgixImageUrl(key) }
  } else {
    // TODO: add supprot for entryId .. (why WAGNI)
    return {}
  }
}

const saveUserProfileImage = (root, args, ctx): Promise<SaveUserProfileImageOutput> => {
  const sessionUser: User = ctx.User
  const input: SaveUserProfileImageInput = joi.validate(args.input, buildSaveUserProfileImageInputSchema())
  return Promise.resolve(mapImageInputToUpdateFields(input.image))
    .then((updateFields: object) => Object.assign({}, sessionUser, updateFields))
    .then(user => store.saveUser(user, model.saveUser))
    .then(user => !user.imageUrl
      ? {}
      : { uri: user.imageUrl },
    )
    .then(image => ({ image }))
}

const resolveAvataaar = (user: User): Promise<Avataaar> => {
  return core.nodeField(user, { input: { name: 'avataaar' } })
    .then((output: FieldOutput) => _.get(output, 'field.metadata'))
}

const userUnreadCommentCount = (user: User): Promise<number> => {
  return store.unreadCommentsCount(user.id)
}

const buildRegisterEmailInputSchema = (): Joi.ObjectSchema<any> => Joi.object().keys({
  email: Joi.string().email({ minDomainSegments: 2 }),
})

const validateRegisterEmailInput = (input: any): any => {
  const result = joi.validate(input, buildRegisterEmailInputSchema())
  parseAndThrowJoiError(result)
  return input
}

const registerEmail = (root, args): Promise<RegisterEmailOutput> => {
  const input: RegisterEmailInput = validateRegisterEmailInput(args.input)
  const emailRegistry = new EmailRegistry()
  emailRegistry.email = input.email
  return model.createOrReadEmailRegistry(emailRegistry)
    .then(sf.tap((emailRegistry: EmailRegistry) => sendgrid.sendPreRegisterEmail(emailRegistry.email)))
    .then((emailRegistry: EmailRegistry) => ({ email: emailRegistry.email }))
}

// TODO: dup'ed in chat.resolvers
export interface UserIdToPromiseMap {
  [userId: string]: Promise<any>
}

/**
 * For queueing up a bunch of calls to buildCoreActionEdgesForUserCached
 */
const cachedBuildCoreActionsPromises: UserIdToPromiseMap = {}

/**
 * @param userId
 */
const buildCoreActionEdgesForUserCached = (user: User): Promise<any> => {
  if (!!!_.isNil(cachedBuildCoreActionsPromises[user.id])) {
    logger.info('buildCoreActionEdgesForUserCached: defering to cached promise')
    return cachedBuildCoreActionsPromises[user.id]
  }
  cachedBuildCoreActionsPromises[user.id] = Promise.resolve(user)
    .then(sf.pause(5 * 1000))
    // don't ever clear the cache.  we only want to do this once per user per server instance.
    // if we add/remove core actions it will cause a server restart.
    // .then( sf.tap( () => { cachedBuildCoreActionsPromises[user.id] = null; } ) ) // clear the cache
    .then(logger.traceFn(`core.buildCoreActionEdgesForUser:${user.id}`, core.buildCoreActionEdgesForUser))

  return cachedBuildCoreActionsPromises[user.id]
}

/**
 *
 * @return Promise<ActionsOutput>
 *         contains list of ActionXEdges w/ collectionName="actionSheet", collectionId="user/id/edge".
 *         i.e. the user's "global" actions
 *         It's not necessary to query this as the set of actions is always streamed down from the
 *         handler code in onEnter.
 */
const userActions = (user: User): Promise<{
  edges: Edge[]
  actionEdges: Edge[]
  actions: unknown[]
}> => {
  const edgesInput: EdgesInput = {
    // TODO: pageInput: _.get( input, 'pageInput'), // TODO: need to change buildCoreActionEdgesForUser trigger logic once we have pagination
    pageInput: {
      first: 200,
    },
    thisEntityId: user.id,
    edgeType: EdgeType.ActionX,
    collectionName: 'actionSheet',
    collectionId: models.buildCollectionId(models.mapEntityToEid(user), 'edge'),
  }
  return activityModel.readEdgesPageByOrder(edgesInput)
    // lazily create edges to core actions
    .then(sf.thru_if((edges: Edge[]) => _.get(edges, 'length', 0) < 5)(
      () => core.buildCoreActionEdgesForUser(user)
        .then(() => activityModel.readEdgesPageByOrderDesc(edgesInput)),
    ))
    .then((edges: Edge[]) => Bluebird.Promise.props({
      // TODO: pageInfo: mapEdgesOrderToPageInfo(edges),
      edges,
      actionEdges: edges,
      actions: store.thatEntitiesOfEdges(edges),
    }))
}

const userMostRecentlyUsedActions = (user: User): Promise<{
  edges: Edge[]
  actionEdges: Edge[]
  actions: unknown[]
}> => {
  return activityModel.readEdgesBy({
    where: {
      thisEntityId: user.id,
      collectionName: 'actionSheet',
      collectionId: models.buildCollectionId(models.mapEntityToEid(user), 'edge'),
      edgeType: EdgeType.ActionX,
      isDeleted: false,
      sortKey1: MoreThan(''),
    },
    order: {
      sortKey1: 'DESC',
    },
    take: 5,
    cache: true,
  })
    .then((edges: Edge[]) => Bluebird.Promise.props({
      edges,
      actionEdges: edges,
      actions: store.thatEntitiesOfEdges(edges), // TODO: move into ActionsOutput resolver
    }))
}

const blockPlayer = (root, args: MutationBlockPlayerArgs, ctx): Promise<User> => {
  const sessionUser: User = ctx.user
  const input: SaveEdgeInput = {
    thisEntityType: EntityType.User,
    thisEntityId: sessionUser.id,
    thatEntityType: EntityType.User,
    thatEntityId: args.id,
    edgeType: EdgeType.Block,
  }

  return store.userById(args.id)
    .then(user => _.isNil(user)
      ? Promise.reject(new Error(`No player exists with id ${args.id}`))
      : user,
    )
    .then(sft.tap_wait(() => core.saveEdge(input)))
}

const unblockPlayer = (root, args: MutationUnblockPlayerArgs, ctx): Promise<User> => {
  const sessionUser: User = ctx.user
  return store.userById(args.id)
    .then((user: User) => !user
      ? Promise.reject(new Error(`No player exists with id ${args.id}`))
      : Promise.resolve(user),
    )
    .then(user => store.deleteEdgesByThisThatIdsEdgeType({
      thisEntityIds: [sessionUser.id],
      thatEntityIds: [user.id],
      edgeTypes: [EdgeType.Block],
    })
      .then(() => Promise.resolve(user))
    )
}

const isBlocked = (player: User, args, ctx): Promise<boolean> => {
  const sessionUser: User = ctx.user
  if (sessionUser.id === player.id) {
    return Promise.resolve(false)
  }
  return core.hasThisBlockedThat({
    thisId: sessionUser.id,
    thatId: player.id,
  })
}

const hasBlocked = (player: User, args, ctx): Promise<boolean> => {
  const sessionUser: User = ctx.user
  if (sessionUser.id === player.id) {
    return Promise.resolve(false)
  }
  return core.hasThisBlockedThat({
    thisId: player.id,
    thatId: sessionUser.id,
  })
}

const reportPlayer = (root, args, ctx): Promise<User> => {
  const sessionUser: User = ctx.user
  const input: ReportPlayerInput = joi.validate(args.input, joi.buildReportPlayerInputSchema())
  return store.entityByEid(input.playerEid)
    .then((player: User) => _.isEmpty(player)
      ? Promise.reject(new Error(`No player exists with eid ${input.playerEid}`))
      : Promise.resolve(player),
    )
    .then(player => Promise.resolve(model.mapReportPlayerInputToReport(input, sessionUser))
      .then(model.saveReport)
      .then(() => sendgrid.sendUserReportedEmail(sessionUser.username, player.username, input.reason))
      .then(() => Promise.resolve(player)),
    )
}

const buildFollowsSaveEdgeInput = (fromUser: User, toPlayer: Player): SaveEdgeInput => ({
  ...models.mapEntityRefToThisEntityRef(fromUser),
  ...models.mapEntityRefToThatEntityRef(toPlayer),
  edgeType: EdgeType.Follows,
  sortKey1: models.playerName(fromUser),
  sortKey2: models.playerName(toPlayer),
  order: models.playerName(toPlayer),
})

const followPlayer = (root, args, ctx): Promise<FollowPlayerOutput> => {
  const sessionUser: User = ctx.user
  const input: FollowPlayerInput = joi.validate(args.input, joi.buildFollowPlayerInputSchema())
  return store.entityByEid(input.playerEid)
    .then(sf.thru_if(_.isNil)(
      () => Promise.reject(new Error(`No player exists with eid ${input.playerEid}`)),
    ))
    .then(sf.tap_wait(
      (player: Player) => Promise.resolve(buildFollowsSaveEdgeInput(sessionUser, player))
        .then(core.saveEdge)
        .then(sf.tap_catch(
          (output: SaveEdgeOutput) => notifs.createNewFollowerNotification(player, sessionUser, output.edge as Edge, ctx)
            .then(notifs.sendPushNotification),
        )),
    ))
    .then((player: Player) => ({ player }))
}

const unfollowPlayer = (root, args, ctx): Promise<FollowPlayerOutput> => {
  const sessionUser: User = ctx.user
  const input: FollowPlayerInput = joi.validate(args.input, joi.buildFollowPlayerInputSchema())
  return store.entityByEid(input.playerEid)
    .then(sf.thru_if(_.isNil)(
      () => Promise.reject(new Error(`No player exists with eid ${input.playerEid}`)),
    ))
    .then(sf.tap_wait(
      (player: Player) => Promise.resolve(buildFollowsSaveEdgeInput(sessionUser, player))
        .then(sf.lens('isDeleted').set(true))
        .then(core.saveEdge),
    ))
    .then((player: Player) => ({ player }))
}

const userFollows = (user: User): Promise<FollowsOutput> => {
  return store.edgesByThisIdEdgeType({
    thisEntityId: user.id,
    edgeType: EdgeType.Follows,
  })
    .then(edges => edges.sort(misc.sortBy('sortKey2')))
    .then(edges => store.thatEntitiesOfEdges<Player>(edges))
    .then(players => ({
      players,
      pageInfo: {
        firstCursor: null,
        lastCursor: null,
      },
    }))
}

const userFollowers = (user: User): Promise<FollowsOutput> => {
  return store.readThisEntitiesOfEdges({
    where: {
      ...models.mapEntityRefToThatEntityRef(user),
      edgeType: EdgeType.Follows,
      isDeleted: false,
    },
    order: {
      sortKey1: 'ASC',
    },
  })
    .then((players: Player[]) => ({
      players,
      pageInfo: {
        firstCursor: null,
        lastCursor: null,
      },
    }))
}

const userActionInventoryStaticActionStubs = (): Promise<ActionXStub[]> => {
  return store.actionsByPackage('core')
    .then(actions => actions.map(action => ({
      actionName: action.name,
      action,
    })))
}

const inventory = (root, args: any, ctx: any): Promise<ActionXStub[]> => {
  const user: User = ctx.user
  return core.itemsByPlayer(user)
    .then(items => items.map(group => ({
      actionName: _.first(group).actionName,
      actionInstances: group,
    })))
}

const autoFriendUser = (ctx, playerIdOrUsername: string, sendNotification = false, isSystemUser = true): Promise<FriendRequestOutput> => {
  const user: User = ctx.user
  if (_.isEqual(user.id, playerIdOrUsername) || _.isEqual(user.username, playerIdOrUsername)) {
    return Promise.reject(new Error('Connect with other people instead of friending yourself!'))
  }

  return store.userByIdOrUsername(playerIdOrUsername)
    .then(otherUser => _.isNil(otherUser)
      ? Promise.reject(new Error(`No player exists with id/username ${playerIdOrUsername}`))
      : otherUser,
    )
    .then(otherUser => new Promise<FriendRequest>(resolve => {
      const friendRequest = new FriendRequest()
      friendRequest.status = FriendRequestStatus.Accepted
      friendRequest.senderId = user.id
      friendRequest.receiverId = otherUser.id
      return resolve(friendRequest)
    })
      .then(request => friendRequestModel.saveFriendRequest(request))
      .then(request => core.saveEdge({
        ...models.mapEntityRefToThisEntityRef(user),
        ...models.mapEntityRefToThatEntityRef(otherUser),
        edgeType: EdgeType.FriendRequest,
        collectionId: request.id,
        sortKey1: models.playerName(user),
        sortKey2: models.playerName(otherUser),
        isDeleted: true,
      })
        .then(() => Promise.all([
          friendPlayer(user, otherUser),
          friendPlayer(otherUser, user),
        ]))
        .then(() => createChatRoom(null, { input: { playerEids: [otherUser.eid] } }, ctx))
        .then(chatRoomOutput => {
          if (_.isEqual(sendNotification, false)) {
            return chatRoomOutput.chatRoom
          }
          const fromPlayer = isSystemUser ? otherUser : user
          const toPlayer = isSystemUser ? user : otherUser
          return publishFriendNotifications(ctx, fromPlayer, toPlayer, request, chatRoomOutput.chatRoom)
            .then(() => chatRoomOutput.chatRoom)
        })
        .then(chatRoom => mapToFriendRequestOutput({
          request,
          player: otherUser,
          userId: user.id,
          chatRoom,
        }))
      )
    )
}

const publishFriendsCount = (playerId: string): Promise<any> => {
  return core.friendsCount(playerId)
    .then(count => pubsub.publishCount(playerId, 'friendsCount', count))
}

const publishFriendRequestsCount = (playerId: string): Promise<any> => {
  return core.friendRequestsCount(playerId)
    .then(count => pubsub.publishCount(playerId, 'friendRequestsCount', count))
}

const publishFriendNotifications = (ctx, from: Player, to: Player, request: FriendRequest, chatRoom = null): Promise<any> =>{
  return notifs.createFriendingNotification(
    to,
    from,
    NotificationType.FriendRequestAcceptedNotification,
    { ...ctx, requestId: request.id },
  )
    .then(notification => Promise.all([
      notifs.sendPushNotification(notification),
      pubsub.publishFriendRequest(to.eid, mapToFriendRequestOutput({
        request,
        player: from,
        userId: to.id,
        chatRoom: chatRoom,
      })),
    ]))
    .then(sf.tap_catch(
      () => {
        return Promise.all([
          publishFriendsCount(from.id),
          publishFriendsCount(to.id),
        ])
      }
    ))
}

/**
 * Creates a new friend request:
 *  1) Save friend request
 *  2) Create new `FriendRequest` edge between two user entities
 *  3) Create and push friend request sent notification
 *
 * @param root
 * @param ctx
 * @param args
 * @return {Promise<object>}
 */
const sendFriendRequest = (root, args, ctx): Promise<FriendRequestOutput> => {
  const sessionUser: User = ctx.user
  const input: SendFriendRequestInput = joi.validate(args.input, joi.buildSendFriendRequestInputSchema())
  const playerId = models.mapEidToId(input.playerEid)
  if (playerId in fakeUsers) {
    return autoFriendUser(ctx, playerId, true)
  }
  if (_.isEqual(sessionUser.eid, input.playerEid)) {
    return Promise.reject(new Error('Connect with other people instead of friending yourself!'))
  }

  return store.entityByEid<User>(input.playerEid)
    .then(player => _.isNil(player)
      ? Promise.reject(new Error(`No player exists with eid ${input.playerEid}`))
      : Promise.resolve(player),
    )
    .then(player => new Promise<FriendRequest>(resolve => {
      const friendRequest = new FriendRequest()
      friendRequest.status = FriendRequestStatus.Pending
      friendRequest.senderId = sessionUser.id
      friendRequest.receiverId = player.id
      return resolve(friendRequest)
    })
      .then(request => friendRequestModel.saveFriendRequest(request))
      .then(request => core.saveEdge({
        ...models.mapEntityRefToThisEntityRef(sessionUser),
        ...models.mapEntityRefToThatEntityRef(player),
        edgeType: EdgeType.FriendRequest,
        collectionId: request.id,
        sortKey1: models.playerName(sessionUser),
        sortKey2: models.playerName(player),
      })
        .then(() => notifs.createFriendingNotification(
          player,
          sessionUser,
          NotificationType.NewFriendRequestNotification,
          { ...ctx, requestId: request.id },
        ))
        .then(notification => createChatRoom(root, { input: { playerEids: [input.playerEid] } }, ctx)
          .then(sf.tap_wait(
            output => Promise.all([
              notifs.sendPushNotification(notification),
              pubsub.publishFriendRequest(player.eid, mapToFriendRequestOutput({
                request,
                player: sessionUser,
                userId: player.id,
                chatRoom: output.chatRoom,
              })),
              publishFriendRequestsCount(player.id),
            ])
          ))
        )
        .then(output => Promise.resolve({
          request,
          player,
          userId: sessionUser.id,
          chatRoom: output.chatRoom,
        })),
      ),
    )
    .then(mapToFriendRequestOutput)
}

const mapToFriendRequestOutput = (result: any): FriendRequestOutput => {
  const friendRequest: FriendRequest = result.request
  const player: Player = result.player
  const chatRoom: ChatRoomOutput = result.chatRoom
  return {
    id: friendRequest.id,
    entityType: EntityType.FriendRequest,
    status: friendRequest.status,
    received: friendRequest.receiverId === result.userId,
    createdAt: friendRequest.createdAt,
    updatedAt: friendRequest.updatedAt,
    player,
    chatRoom,
  }
}

/**
 * Accepts or rejects a friend request:
 *  1) joi validate incoming request: make sure only REJECT|ACCEPT status is allowed
 *  2) validate additional logic:
 *    a) request exists
 *    b) request has PENDING status
 *    c) user is not accepting request they sent
 *  3) fetch the other player and prepare new object
 *  4) When request is accepted, create `friend` and `follow` edges between players
 *  5) When request is accepted, send a notification to sender
 *  6) When request is accepted/rejected, delete friend request edge
 *
 * @param root
 * @param args
 * @param ctx
 * @return {Promise<FriendRequestOutput>}
 */
const updateFriendRequest = (root, args, ctx): Promise<FriendRequestOutput> => {
  const sessionUser: User = ctx.user
  const input: UpdateFriendRequestInput = joi.validate(args.input, joi.buildUpdateFriendRequestInputSchema())
  return friendRequestModel.readFriendRequestById(input.id)
    .then(request => validateUpdateFriendRequest(sessionUser.id, input, request))
    .then(request => friendRequestModel
      .updateFriendRequest(request.id, { status: input.status })
      .then(() => request),
    )
    .then(request =>
      Promise.resolve(sessionUser.id === request.senderId
        ? request.receiverId
        : request.senderId,
      )
        .then(playerId => store.userById(playerId)
          .then(player => ({
            request: Object.assign({}, request, { status: input.status }),
            player,
            userId: sessionUser.id,
          })),
        ),
    )
    .then(result => input.status === FriendRequestStatus.Rejected
      ? result
      : Promise.all([
        friendPlayer(sessionUser, result.player),
        friendPlayer(result.player, sessionUser),
      ])
        .then(() => publishFriendNotifications(ctx, sessionUser, result.player, result.request))
        .then(() => result),
    )
    .then(sft.tap_catch(
      (result: {
        player: Player
        request: FriendRequest
        userId?: string
      }) => store.deleteEdgesByThisThatIdsEdgeType({
        thisEntityIds: [result.player.id, sessionUser.id],
        thatEntityIds: [result.player.id, sessionUser.id],
        edgeTypes: [EdgeType.FriendRequest],
      })
        .then(() => publishFriendRequestsCount(result.request.receiverId))
    ))
    .then(mapToFriendRequestOutput)
}

const validateUpdateFriendRequest = (userId: string, input: UpdateFriendRequestInput, request: FriendRequest): Promise<FriendRequest> => {
  if (!request) {
    return Promise.reject(new Error(`No friend request exists with this id ${input.id}`))
  }
  if (request.status !== FriendRequestStatus.Pending) {
    return Promise.reject(new Error(`This request has already been ${request.status}`))
  }
  if (request.senderId === userId && input.status == FriendRequestStatus.Accepted) {
    return Promise.reject(new Error('You cannot accept this friend request because you sent it'))
  }
  return Promise.resolve(request)
}

const friendPlayer = (from: User, to: Player): Promise<Edge[]> => {
  const friendEdgeInput = {
    ...models.mapEntityRefToThisEntityRef(from),
    ...models.mapEntityRefToThatEntityRef(to),
    edgeType: EdgeType.Friend,
    sortKey1: models.playerName(from),
    sortKey2: models.playerName(to),
    order: models.playerName(to),
  }
  const followEdgeInput = buildFollowsSaveEdgeInput(from, to)
  return Promise.all([
    core.saveEdge(friendEdgeInput),
    core.saveEdge(followEdgeInput),
  ])
}

const friendRequestPlayer = (request: FriendRequestOutput): Promise<GqlPlayer> => {
  if (request.player.name) {
    return Promise.resolve(request.player)
  }
  return store.entityByEntityRef({
    id: request.player.id,
    entityType: EntityType.User,
  })
}

const friendRequests = (user: User, args, ctx, root): Promise<FriendRequestsOutput> => {
  const input: FriendRequestsInput = joi.validate(args.input, joi.buildFriendRequestsInput())
  const myFriendRequests = _.isEqual(root.fieldName, 'sentFriendRequests') || _.isEqual(root.fieldName, 'myFriendRequests')
  return Promise.resolve(myFriendRequests
    ? { playerIdProp: 'receiverId', filter: { senderId: user.id } }
    : { playerIdProp: 'senderId', filter: { receiverId: user.id } },
  )
    .then(opts => friendRequestModel.readPendingFriendRequestsBy(opts.filter, input)
      .then(requests => requests.map(
        request => mapToFriendRequestOutput({
          request,
          player: { id: request[opts.playerIdProp] },
          userId: user.id,
        }),
      )),
    )
    .then(requests => ({
      requests,
      pageInfo: {
        firstCursor: misc.toDateISOString(_.get(_.first(requests), 'createdAt')),
        lastCursor: misc.toDateISOString(_.get(_.last(requests), 'createdAt')),
      },
    }))
}

// TODO somehow make use of edgesByThisEntityIdEdgeTypeCache
// TODO refactor page input related typing and mapping of page info
const friends = (user: User, args): Promise<{
  players: unknown[]
  pageInfo: {
    firstCursor: string
    lastCursor: string
  }
}> => {
  const input: FriendRequestsInput = joi.validate(args.input, joi.buildFriendsInput())
  const pageInput: PageInput = _.get(input, 'pageInput')
  const edgesInput: EdgesInput = {
    thisEntityId: user.id,
    edgeType: EdgeType.Friend,
    pageInput,
  }
  return store.readThatEntitiesOfEdgesPageByOrder(edgesInput)
    .then(players => ({
      players,
      pageInfo: {
        firstCursor: models.playerName(_.first(players) as any),
        lastCursor: models.playerName(_.last(players) as any),
      },
    }))
}

const recentFriends = (user: User): Promise<GqlPlayer[]> => {
  return store.edgesByThisIdEdgeType({
    thisEntityId: user.id,
    edgeType: EdgeType.Friend,
  })
    .then(edges => edges
      .sort(misc.sortBy('createdAt'))
      .reverse()
      .slice(0, 3)
    )
    .then(edges => store.thatEntitiesOfEdges(edges))
}

const friendRequest = (player: User, args, ctx): Promise<FriendRequestOutput> => {
  const sessionUser: User = ctx.user
  return friendRequestModel.readMutualFriendRequestByStatus(sessionUser.id, player.id, [FriendRequestStatus.Pending])
    .then(request => _.isNil(request)
      ? Promise.resolve(null)
      : Promise.resolve(mapToFriendRequestOutput({
        request,
        player,
        userId: sessionUser.id,
      })))
}

const isFriend = (player: Player, args, ctx): Promise<boolean> => {
  const sessionUser: User = ctx.user
  if (sessionUser.id === player.id) {
    return Promise.resolve(false)
  }
  return core.areFriends({
    thisId: sessionUser.id,
    thatId: player.id,
  })
}

const unfriend = (root, args, ctx): Promise<Player> => {
  const sessionUser: User = ctx.user
  return store.entityByEid(args.playerEid)
    .then((player: Player) => _.isNil(player)
      ? Promise.reject(new Error(`No player exists with eid ${args.playerEid}`))
      : player,
    )
    .then(player => store.deleteEdgesByThisThatIdsEdgeType({
      thisEntityIds: [sessionUser.id, player.id],
      thatEntityIds: [sessionUser.id, player.id],
      edgeTypes: [
        EdgeType.Friend,
        EdgeType.Follows,
        EdgeType.FriendRequest,
        EdgeType.NewsfeedItem,
      ],
    })
      .then(() => friendRequestModel.readMutualFriendRequestByStatus(sessionUser.id, player.id, [FriendRequestStatus.Accepted]))
      .then(friendRequest => !friendRequest
        ? friendRequest
        : friendRequestModel.updateFriendRequest(friendRequest.id, { isDeleted: true }),
      )
      .then(() => player)
    )
}

/**
 * Retrieves mutual friends of logged in and other users
 * 1) Fetch friend edges of both users via data loader cache
 *  where `edge.thisEntity:edge.edgType` is the cache key
 * 2) map retrieved edges by key:array pairs
 * 3) do an intersection of two players' friend edge lists
 *  and find mutual friend edges
 * 4) fetch user entities by `thatEntityId` property
 *  of mutual friend edges
 *
 * @param user
 * @param args
 * @param ctx
 */
const mutualFriends = (user: User, args: UserMutualFriendsArgs, ctx): Promise<MutualFriendsOutput> => {
  const input = joi.validate(args.input, joi.buildFriendsStoryInput()) || {}
  const defaultInput = {
    pageInput: defaultPageInput(input?.pageInput, ''),
  }
  const sessionUser: User = ctx.user

  return Promise.all([
    store.edgesByThisIdEdgeType({
      thisEntityId: sessionUser.id,
      edgeType: EdgeType.Friend,
    }),
    store.edgesByThisIdEdgeType({
      thisEntityId: user.id,
      edgeType: EdgeType.Friend,
    }),
  ])
    .then(edges => _.isEmpty(edges)
      ? edges.flat()
      : edges[0].filter(te => edges[1]
        .some(oe => te.thatEntityId === oe.thatEntityId)
      )
    )
    .then(store.thatEntitiesOfEdges)
    // TODO displayName sort key won't work for UnObject
    .then((players: Player[]) => players.sort(misc.sortBy<User>('displayName')))
    .then(_.partialRight(pageResult, defaultInput.pageInput))
    .then(result => ({
      players: result.list,
      pageInfo: result.pageInfo,
    }))
}

const isOnline = (user: User): Promise<boolean> => {
  const redis = Redis.getInstance().getClient()
  return redis.hget(USER_PRESENCE_CACHE_KEY, user.id)
    .then(result => !!(result))
}

const instantFriend = (root, args: MutationInstantFriendArgs, ctx): Promise<User> =>{
  return autoFriendUser(ctx, args.input.userId, true, false)
    .then(output => output.player as User)
}

const suggestedFriends = (user: User): Promise<User[]> => {
  return model.readSuggestedFriends(user)
}

const notificationsCount = (user: User, args: UserNotificationsCountArgs): Promise<number> => {
  return store.notificationsCountByUser(user.id, args.input?.isRead)
}

const isAuthenticated = jwtutil.requireJwtAuth

//
// GraphQL schema resolver table.
//
export default {
  Query: {
    me: logger.traceFn('me', combineResolvers(isAuthenticated, me)),
    isUsernameAvailable: combineResolvers(isAuthenticated, isUsernameAvailable),
    isResetPasswordTokenValid: isResetPasswordTokenValid,
    validateResetPasswordToken: validateResetPasswordToken,
    validateConfirmEmailToken: validateConfirmEmailToken,
    masterUser: combineResolvers(jwtutil.requireMasterApiKeyGql, masterUser),
    user: combineResolvers(isAuthenticated, user),
  },
  Mutation: {
    session: logger.traceFn('session', combineResolvers(isAuthenticated, session)),
    masterSession: combineResolvers(jwtutil.requireMasterApiKeyGql, masterSession),
    confirmEmail,
    emailCanBeRegistered,
    sendConfirmEmail: combineResolvers(isAuthenticated, sendConfirmEmail),
    updateUsername: combineResolvers(isAuthenticated, updateUsername),
    updateEmail: combineResolvers(isAuthenticated, updateEmail),
    updatePassword: combineResolvers(isAuthenticated, updatePassword),
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    saveDeviceInfo: combineResolvers(isAuthenticated, saveDeviceInfo),
    sendRawPushNotification: combineResolvers(jwtutil.requireMasterApiKeyGql, sendRawPushNotification),
    sendPushNotification: combineResolvers(jwtutil.requireMasterApiKeyGql, sendPushNotification),
    updateUser: combineResolvers(jwtutil.requireMasterApiKeyGql, updateUser),
    updateMe: combineResolvers(isAuthenticated, updateMe),
    updateUserRole: combineResolvers(jwtutil.requireMasterApiKeyGql, updateUserRole),
    deleteUserRole: combineResolvers(jwtutil.requireMasterApiKeyGql, deleteUserRole),
    savePresence: combineResolvers(isAuthenticated, savePresence),
    saveAvataaar: combineResolvers(isAuthenticated, saveAvataaar),
    saveUserProfileImage: combineResolvers(isAuthenticated, saveUserProfileImage),
    registerEmail: registerEmail,
    blockPlayer: combineResolvers(isAuthenticated, blockPlayer),
    unblockPlayer: combineResolvers(isAuthenticated, unblockPlayer),
    reportPlayer: combineResolvers(isAuthenticated, reportPlayer),
    followPlayer: combineResolvers(isAuthenticated, followPlayer),
    unfollowPlayer: combineResolvers(isAuthenticated, unfollowPlayer),
    sendFriendRequest: combineResolvers(isAuthenticated, sendFriendRequest),
    updateFriendRequest: combineResolvers(isAuthenticated, updateFriendRequest),
    unfriend: combineResolvers(isAuthenticated, unfriend),
    instantFriend: combineResolvers(isAuthenticated, instantFriend),
  },
  User: {
    roles: combineResolvers(authzUserRoles, userRoles),
    // -rx- name: core.mapParentToKey<string>('displayName'),
    entry: core.resolveContentfulEntry,
    image: core.resolveImage,
    email: combineResolvers(misc.catchAndReturnNull(authzUserIsSessionUser), core.mapParentToKey<string>('email')),
    phone: combineResolvers(misc.catchAndReturnNull(authzUserIsSessionUser), core.mapParentToKey<string>('phone')),
    password: combineResolvers(misc.catchAndReturnNull(jwtutil.requireMasterApiKeyGqlP), core.mapParentToKey<string>('password')),
    confirmEmailToken: combineResolvers(misc.catchAndReturnNull(jwtutil.requireMasterApiKeyGqlP), core.mapParentToKey<string>('confirmEmailToken')),
    resetPasswordToken: combineResolvers(misc.catchAndReturnNull(jwtutil.requireMasterApiKeyGqlP), core.mapParentToKey<string>('resetPasswordToken')),
    eid: core.resolveEid,
    asNode: _.identity,
    deviceInfos: combineResolvers(authzUserIsSessionUser, userDeviceInfos),
    chatRooms: logger.traceFn('User.chatRooms', combineResolvers(authzUserIsSessionUser, userChatRooms)),
    unObjects: userUnObjects,
    notifications: combineResolvers(authzUserIsSessionUser, userNotifications),
    follows: userFollows,
    followers: userFollowers,
    followersStats: userFollowersStats,
    presence: core.resolvePresence,
    avataaar: resolveAvataaar,
    level: core.resolveLevel,
    signedUpAt: core.mapParentToKey<Date>('signedUpAt', new Date('2019-08-01T00:00:00.000Z')),
    actionSheet: combineResolvers(authzUserIsSessionUser, userActions),
    actions: combineResolvers(authzUserIsSessionUser, userActions),
    mostRecentlyUsedActions: combineResolvers(authzUserIsSessionUser, userMostRecentlyUsedActions),
    tiles: core.resolveTiles,
    privateTiles: core.resolvePrivateTiles,
    hashtributes: core.resolveHashtributes,
    xpField: core.resolveField(xpFieldName),
    positionOnMap: core.resolveIntField('reserved.positionOnMap'),
    unReadCommentCount: combineResolvers(authzUserIsSessionUser, userUnreadCommentCount),
    worldMapLocation: core.resolveLocation,
    isFollowedByMe: combineResolvers(isAuthenticated, core.isFollowed),
    actionInventory: combineResolvers(authzUserIsSessionUser, () => ({})), // handle this via child resolvers
    sentFriendRequests: combineResolvers(authzUserIsSessionUser, friendRequests),
    myFriendRequests: combineResolvers(authzUserIsSessionUser, friendRequests),
    receivedFriendRequests: combineResolvers(authzUserIsSessionUser, friendRequests),
    friendRequests: combineResolvers(authzUserIsSessionUser, friendRequests),
    friends: friends,
    recentFriends: combineResolvers(authzUserIsSessionUser, recentFriends),
    following: combineResolvers(isAuthenticated, core.isFollowing),
    isFollowed: combineResolvers(isAuthenticated, core.isFollowed),
    isFollowing: combineResolvers(isAuthenticated, core.isFollowing),
    friend: combineResolvers(isAuthenticated, isFriend),
    isFriend: combineResolvers(isAuthenticated, isFriend),
    friendRequest: combineResolvers(isAuthenticated, friendRequest),
    mutualFriends: combineResolvers(isAuthenticated, mutualFriends),
    isBlocked: combineResolvers(isAuthenticated, isBlocked),
    isOnline: combineResolvers(isAuthenticated, isOnline),
    hasBlocked: combineResolvers(isAuthenticated, hasBlocked),
    likesCount: core.likesCount,
    friendsCount: (user: User): Promise<number> => core.friendsCount(user.id),
    friendRequestsCount: (user: User): Promise<number> => core.friendRequestsCount(user.id),
    suggestedFriends: combineResolvers(authzUserIsSessionUser, suggestedFriends),
    notificationsCount: combineResolvers(authzUserIsSessionUser, notificationsCount),
    states: core.resolveHashStatuses,
  },
  Player: {
    eid: core.resolveEid,
    image: core.resolveImageNoDefault,
    name: models.playerName,
    displayName: models.playerName,
    asUser: core.resolveAsEntityType(EntityType.User),
    asUnObject: core.resolveAsEntityType(EntityType.UnObject),
    isMe: combineResolvers(isAuthenticated, playerIsMe),
    presence: core.resolvePresence,
    level: core.resolveLevel,
    tiles: core.resolveTiles,
    privateTiles: core.resolvePrivateTiles,
    states: core.resolveHashStatuses,
    hashtributes: core.resolveHashtributes,
    xpField: core.resolveField(xpFieldName),
    worldMapLocation: core.resolveLocation,
  },
  FriendRequest: {
    player: friendRequestPlayer,
  },
  ActionInventory: {
    staticActionStubs: combineResolvers(isAuthenticated, userActionInventoryStaticActionStubs),
    actionInstanceStubs: combineResolvers(isAuthenticated, inventory),
  },
}
