import _ from 'lodash'
import {
  getConnection,
  Repository,
  Not,
  IsNull,
  Raw,
  In,
} from 'typeorm'
import { infer } from 'infer-gender'
import { TYPEORM_CONNECTION } from 'src/env'
import {
  UpdateUserFields,
  Gender,
  SaveDeviceInfoInput,
  SearchInput,
  ReportPlayerInput,
  Role,
} from 'src/gql-types'
import {
  User,
  UserRole,
  DeviceInfo,
  EmailRegistry,
  Report,
} from '../../db/entity'
import { v4 } from 'uuid'
import {
  sf,
  buildAnonymousDisplayName,
  misc,
  Jwt,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import * as bcrypt from 'bcryptjs'
import moment from 'moment'
import * as dbUtils from '../../db/utils'
import * as errors from './user.error'

const logger = LoggerFactory('user.model')
const BCRYPT_ROUNDS = 10
const DB_CONN_NAME = TYPEORM_CONNECTION
export const DEFAULT_BIRTHDAY = new Date(1900, 1, 1)

/**
 * @return Promise w/ repository
 */
let cachedUserRepository: Repository<User> = null
export const getUserRepository = (): Promise<Repository<User>> => {
  return !!!_.isNil(cachedUserRepository)
    ? Promise.resolve(cachedUserRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(User))
      .then(sf.tap(repository => {
        cachedUserRepository = repository
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedUserRoleRepository: Repository<UserRole> = null
export const getUserRoleRepository = (): Promise<Repository<UserRole>> => {
  return !!!_.isNil(cachedUserRoleRepository)
    ? Promise.resolve(cachedUserRoleRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(UserRole))
      .then(sf.tap(repository => {
        cachedUserRoleRepository = repository
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedDeviceInfoRepository: Repository<DeviceInfo> = null
export const getDeviceInfoRepository = (): Promise<Repository<DeviceInfo>> => {
  return !!!_.isNil(cachedDeviceInfoRepository)
    ? Promise.resolve(cachedDeviceInfoRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(DeviceInfo))
      .then(sf.tap(repository => {
        cachedDeviceInfoRepository = repository
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedEmailRegistryRepository: Repository<EmailRegistry> = null
export const getEmailRegistryRepository = (): Promise<Repository<EmailRegistry>> => {
  return !!!_.isNil(cachedEmailRegistryRepository)
    ? Promise.resolve(cachedEmailRegistryRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(EmailRegistry))
      .then(sf.tap(repository => {
        cachedEmailRegistryRepository = repository
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedReportRepository: Repository<Report> = null
export const getReportRepository = (): Promise<Repository<Report>> => {
  return !!!_.isNil(cachedReportRepository)
    ? Promise.resolve(cachedReportRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Report))
      .then(sf.tap(repository => {
        cachedReportRepository = repository
      }))
}

/**
 * @param confirmEmailToken
 * @return Promise w/ User.
 */
export const readUserByConfirmEmailToken = (confirmEmailToken: string): Promise<User> => {
  return Promise.resolve(getUserRepository())
    .then(
      repo => repo.createQueryBuilder('user')
        .where('user.confirmEmailToken = :confirmEmailToken', { confirmEmailToken })
        .addSelect('user.password')
        .addSelect('user.resetPasswordToken')
        .addSelect('user.confirmEmailToken')
        .getOne()
    )
}

/**
 * @param resetPasswordToken
 * @return Promise w/ User.
 */
export const readUserByResetPasswordToken = (resetPasswordToken: string): Promise<User> => {
  return Promise.resolve(getUserRepository())
    .then(
      repo => repo.createQueryBuilder('user')
        .where('user.resetPasswordToken = :resetPasswordToken', { resetPasswordToken })
        .addSelect('user.password')
        .addSelect('user.resetPasswordToken')
        .addSelect('user.confirmEmailToken')
        .getOne()
    )
}

export const assertUserById = (id: string, withHidden = false): Promise<User> => {
  return readUserById(id, withHidden)
    .then(sf.thru_if(user => !!!user)(
      () => {
        throw new Error(`ASSERT: userId not found: ${id}`)
      }
    ))
}

/**
 * @param email 
 * @return Promise w/ User.
 */
export const readUserById = (id: string, withHidden = false): Promise<User> => {
  if (_.isEmpty(id)) {
    return Promise.resolve(null)
  }
  return Promise.resolve(getUserRepository())
    .then(sf.thru_if_else(() => withHidden)(
      repo => repo.createQueryBuilder('user')
        .where('user.id = :id', { id: id })
        .addSelect('user.password')
        .addSelect('user.resetPasswordToken')
        .addSelect('user.confirmEmailToken')
        .getOne()
    )(
      repo => repo.findOne(id)
    ))
    .then(sf.tap(user => logger.debug('readUserById', { id, user })))
}

export const readUsersBy = (options: object): Promise<User[]> => {
  return getUserRepository()
    .then(repo => repo.find(options))
}

/**
 * @param email 
 * @return Promise w/ User.
 */
export const readUserByIdWithHidden = (id: string): Promise<User> => {
  if (_.isEmpty(id)) {
    return Promise.resolve(null)
  }
  return getUserRepository()
    .then(
      repo => repo.createQueryBuilder('user')
        .where('user.id = :id', { id: id })
        .addSelect('user.password')
        .addSelect('user.resetPasswordToken')
        .addSelect('user.confirmEmailToken')
        .getOne()
    )
    .then(sf.tap(user => logger.debug('readUserByIdWithHidden', { id, user })))
}

/**
 * @param email 
 * @return Promise w/ User.
 */
export const readUserByEmail = (email: string, withHidden = false): Promise<User | undefined> => {
  if (_.isEmpty(email)) {
    return Promise.resolve(undefined)
  }
  return Promise.resolve(getUserRepository())
    .then(sf.thru_if_else(() => withHidden)(
      repo => repo.createQueryBuilder('user')
        .where('user.email = :email', { email: email })
        .addSelect('user.password')
        .addSelect('user.resetPasswordToken')
        .addSelect('user.confirmEmailToken')
        .getOne()
    )(
      repo => repo.createQueryBuilder('user')
        .where('user.email = :email', { email: email })
        .getOne()

    ))
    .then(sf.tap(user => logger.debug('readUserByEmail', { email, user })))
}

export const ProhibitedUsernames = ['undefined', 'null', '0', 'me']

export const isValidUsername = (username: string): boolean => {
  return !ProhibitedUsernames.includes(username)
}

export const isInvalidUsername = (username: string): boolean => {
  return !isValidUsername(username)
}

/**
 * @param username
 * @return Promise w/ User.
 */
export const readUserByUsername = (username: string, withHidden = false): Promise<User> => {
  if (_.isEmpty(username)) {
    return Promise.resolve(null)
  }
  return Promise.resolve(getUserRepository())
    .then(sf.thru_if_else(() => withHidden)(
      repo => repo.createQueryBuilder('user')
        .where('user.username = :username', { username: username })
        .addSelect('user.password')
        .addSelect('user.resetPasswordToken')
        .addSelect('user.confirmEmailToken')
        .getOne()
    )(
      repo => repo.createQueryBuilder('user')
        .where('user.username = :username', { username: username })
        .getOne()
    ))
    .then(sf.tap(user => logger.debug('readUserByUsername', { username, user })))
}

/**
 * @param jwt (decoded) 
 * @return Promise w/ User.
 */
export const readUserByJwt = (jwt: Jwt): Promise<User> => {
  if (_.isEmpty(jwt)) {
    return Promise.resolve(null)
  }
  return getUserRepository()
    .then(
      repo => repo.createQueryBuilder('user')
        .where('user.id = :id', { id: jwt.id })
        .andWhere('user.authTokenVersion = :authTokenVersion', { authTokenVersion: jwt.authTokenVersion })
        .getOne()
    )
    .then(sf.tap(user => logger.debug('readUserByJwt', { user })))
}

/**
 * @param userId
 * @param email 
 * @param username 
 * @param withHidden 
 * @return Promise w/ User
 */
export const readUserByIdOrEmailOrUsername = (
  userId: string,
  email: string,
  username: string,
  withHidden = false): Promise<User> => {
  return Promise.resolve(readUserById(userId, withHidden))
    .then(sf.thru_if(user => !!!user)(
      () => readUserByEmail(email, withHidden)
    ))
    .then(sf.thru_if(user => !!!user)(
      () => readUserByUsername(username, withHidden)
    ))
}

/**
 * @param email 
 * @param username 
 * @param withHidden 
 * @return Promise w/ User
 */
export const readUserByEmailOrUsername = (
  email: string,
  username: string,
  withHidden = false): Promise<User> => {
  return Promise.resolve(readUserByEmail(email, withHidden))
    .then(sf.thru_if(user => !!!user)(
      () => readUserByUsername(username, withHidden)
    ))
}

/**
 * @param username 
 * @return Promise w/ User[]
 */
export const readUserUsernames = (usernames: string[]): Promise<User[]> => {
  return getUserRepository().then(repo => {
    return repo.find({
      where: {
        username: In(usernames),
      },
    })
  })
}

export const cleanDisplayName = (displayName: string): string => {
  return _.trim(misc.compressWhitespace(displayName))
}

export const cleanEmail = (email: string): string => {
  return _.toLower(misc.stripWhitespace(email))
}

export const cleanUsername = (username: string): string => {
  return _.toLower(misc.stripNonWordChars(username))
}

const isAnonymousUser = (user: User): boolean => {
  return !!user && user.isAnonymous
}

const inferGender = (displayName: string): Gender => {
  switch (infer(displayName)) {
    case 'male': return Gender.Male
    case 'female': return Gender.Female
    // For now we default to female
    default: return Gender.Female
  }
}

/**
 * @param sessionUser  - the anon user we created under session()
 * @param signUpInput
 * @param username
 * @return new user NOT YET SAVED TO DB
 */
export const buildNewUser = (sessionUser: User, signUpInput: any, username: string): Promise<User> => {
  return Promise.resolve(username)
    .then(() => {
      const user = isAnonymousUser(sessionUser) ? sessionUser : new User()
      user.username = username
      user.email = signUpInput.email
      user.gender = inferGender(signUpInput.displayName)
      user.displayName = signUpInput.displayName
      user.isConfirmed = false
      user.isAnonymous = false
      user.isPasswordSet = false
      user.signedUpAt = new Date()
      user.birthday = DEFAULT_BIRTHDAY
      return user
    })
    .then(sf.thru_if(() => !!!_.isEmpty(signUpInput.password))(
      user => setPassword(user, signUpInput.password)
    ))
}

export const buildAnonymousUser = (): Promise<User> => {
  const uuid = v4()  // need something unique.
  const user = new User()
  user.email = `anon-${uuid}@unreal.fun`
  user.username = `anon-${uuid}`
  user.password = `anon-${uuid}`
  user.gender = Gender.Female
  user.displayName = buildAnonymousDisplayName()
  user.isAnonymous = true
  return Promise.resolve(user)
}

/**
 * @return Promise w/ user w/ resetPasswordToken filled in and SAVED
 */
export const generateResetPasswordToken = (user: User): Promise<User> => {
  return Promise.resolve(misc.generateRandomToken())
    .then(resetPasswordToken => updateUser(user, {
      resetPasswordToken,
      resetPasswordTokenExpiresAt: moment().add(1, 'day').toDate(),
    }))
}

/**
 * @return Promise w/ user w/ confirmEmailToken filled in and SAVED
 */
export const generateConfirmEmailToken = (user: User): Promise<User> => {
  return Promise.resolve(misc.generateRandomToken())
    .then(confirmEmailToken => updateUser(user, {
      hasCompletedSignup: true,
      confirmEmailToken,
      confirmEmailTokenExpiresAt: moment().add(3, 'days').toDate(),
    }))
}

/**
 * 
 * @param user 
 * @return true if token is NOT empty or has NOT expired
 */
export const isConfirmEmailTokenValid = (user: User): boolean => {
  return !!!_.isNil(user)
    && !!!_.isEmpty(user.confirmEmailToken)
    && moment().isBefore(moment(user.confirmEmailTokenExpiresAt))
}

/**
 * 
 * @param user 
 * @return true if token is NOT empty or has NOT expired
 */
export const isResetPasswordTokenValid = (user: User): boolean => {
  logger.debug('isResetPasswordTokenValid', {
    now: moment().toISOString(),
    expiresAt: moment(_.result(user, 'resetPasswordTokenExpiresAt')).toISOString(),
    isBefore: moment().isBefore(moment(_.result(user, 'resetPasswordTokenExpiresAt'))),
    resetPasswordToken: _.result(user, 'resetPasswordToken'),
  })
  return !!!_.isNil(user)
    && !!!_.isEmpty(user.resetPasswordToken)
    && moment().isBefore(moment(user.resetPasswordTokenExpiresAt))
}

export const comparePassword = (user: User, password: string): Promise<User> => {
  if (_.isEmpty(user.password)) {
    throw errors.buildInvalidCredentialsError()
  }
  return bcrypt.compare(password, user.password)
    .then(val => {
      if (!!!val) throw errors.buildInvalidCredentialsError()
      return user
    })
}

/**
 * @param user 
 * @param password 
 * @return Promise w/ user w/ hashed password NOT YET SAVED (set* methods are in-mem updates only)
 */
export const setPassword = (user: User, password: string): Promise<User> => {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
    .then(hash => _.extend(user, {
      password: hash,
      isPasswordSet: true,
    }))
}

/**
 * @param user 
 * @param password 
 * @return Promise w/ user w/ hashed password NOT YET SAVED (set* methods are in-mem updates only)
 */
export const updatePassword = (user: User, password: string): Promise<User> => {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
    .then(hash => updateUser(user, {
      password: hash,
      isPasswordSet: true,
    }))
}

const filterUpdateUserFields = (updatedFields: UpdateUserFields): UpdateUserFields => {
  return _.pick(updatedFields, [
    'tempEmail',
    'displayName',
    'instagram',
    'twitter',
    'location',
    'bio',
    'entryId',
    's3Key',
    'gender',
    'birthday',
  ])
}

export const updateUserFields = (user: User, updatedFields: UpdateUserFields): Promise<User> => {
  return updateUser(user, misc.omitNils(filterUpdateUserFields(updatedFields)))
}

export const saveUser = (user: User): Promise<User> => {
  return getUserRepository()
    .then(repo => repo.save(user))
    .then(u => readUserById(u.id))
}

/**
 * 
 * @param user 
 * @param fields 
 * @return Promise w/ user (updated locally w/ fields).
 */
export const updateUser = (user: User, fields: object): Promise<User> => {
  return updateUserByUserId(user.id, fields)
}

export const updateUserByUserId = (userId: string, fields: object): Promise<User> => {
  return getUserRepository()
    .then(repo => repo.update(userId, fields))
    .then(() => readUserById(userId))
    // this adds any hidden fields which were updated
    // but won't be selected by readUserById
    .then(user => Object.assign({}, user, fields))
}

export const readUserRoles = (userId: string): Promise<UserRole[]> => {
  return getUserRoleRepository()
    .then(repo => repo.find({ userId }))
}

export const buildUserRole = (userId: string, role: Role): UserRole => {
  const userRole = new UserRole()
  userRole.userId = userId
  userRole.role = role
  return userRole
}

export const readUserRole = (userId: string, role: Role): Promise<UserRole> => {
  return getUserRoleRepository()
    .then(repo => repo.findOne({ userId, role }))
}

export const createOrReadUserRole = (userRole: UserRole): Promise<any> => {
  return assertUserById(userRole.userId)
    .then(() => getUserRoleRepository())
    .then(repo => repo.save(userRole))
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err))(
      err => readUserRole(userRole.userId, userRole.role)
        .then(sf.thru_if((userRole: UserRole) => !!!userRole)(
          () => {
            throw err
          }
        ))
    )(
      err => {
        throw err
      }
    ))
}

/**
 * @param userId 
 * @param role 
 * @return Promise w/ deleted UserRole (or null if not found)
 */
export const deleteUserRole = (userRole: UserRole): Promise<UserRole> => {
  return readUserRole(userRole.userId, userRole.role)
    .then(sf.maybe_fmap(
      (userRole: UserRole) => getUserRoleRepository()
        .then(repo => repo.delete(userRole.id))
        .then(() => userRole)
    ))
}

export const pickPublicUserFields = (user: User): User => {
  if (_.isEmpty(user)) {
    return user
  }
  return _.pick(user, [
    'id',
    'displayName',
    'gender',
    'username',
    'badge',
    'updatedAt',
    'createdAt',
    'signedUpAt',
    'location',
    'twitter',
    'instagram',
    'isAnonymous',
  ]) as User
}

export const readDeviceInfoBy = (fields: object): Promise<DeviceInfo> => {
  return getDeviceInfoRepository()
    .then(repo => repo.findOne(fields))
}

export const readDeviceInfosBy = (fields: object): Promise<DeviceInfo[]> => {
  return getDeviceInfoRepository()
    .then(repo => repo.find(fields))
}

export const createOrUpdateDeviceInfo = (deviceInfo: DeviceInfo): Promise<DeviceInfo> => {
  return saveDeviceInfo(deviceInfo)
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err))(
      err => readDeviceInfoBy({
        userId: deviceInfo.userId,
        deviceToken: deviceInfo.deviceToken,
      })
        .then(sf.thru_if(_.isNil)(
          () => {
            throw err
          }
        ))
        .then(deviceInfoRecord => _.extend(deviceInfoRecord, _.omit(deviceInfo, 'id')))
        .then(sf.tap(deviceInfo => logger.debug('createOrUpdateDeviceInfo', { deviceInfo })))
        .then(saveDeviceInfo)
    )(
      err => {
        throw err
      }
    ))
}

export const saveDeviceInfo = (deviceInfo: DeviceInfo): Promise<DeviceInfo> => {
  return getDeviceInfoRepository()
    .then(repo => repo.save(deviceInfo))
}

export const mapSaveDeviceInfoInputToDeviceInfo = (input: SaveDeviceInfoInput, userId: string): DeviceInfo => {
  const retMe = new DeviceInfo()
  retMe.userId = userId
  retMe.isSignedIn = true
  return _.extend(retMe, _.pick(input, [
    'os',
    'osVersion',
    'appVersion',
    'deviceToken',
  ]))
}

export const mapUserToDeviceInfoTokens = (user: User): Promise<DeviceInfo[]> => {
  return readDeviceInfosBy({
    userId: user.id,
    deviceToken: Not(IsNull()),
  })
}

export const searchUsers = (input: SearchInput): Promise<User[]> => {
  const query = input.query
  // TODO: pagination
  return getUserRepository()
    .then(repo => repo.find({
      where: [
        // { username: Like(`%${query}%`) },
        // { displayName: Like(`%${query}%`) },
        { username: Raw(alias => `LOWER(${alias}) LIKE '%${_.toLower(query)}%' `) },
        { displayName: Raw(alias => `LOWER(${alias}) LIKE '%${_.toLower(query)}%' `) },
      ],
      take: 30,
    }))
}

export const readSuggestedFriends = (user: User): Promise<User[]> => {
  return getUserRepository()
    .then(repo => repo.query(`
      select * from "user" u  
        where u.id not in (
           select "thatEntityId" from edge
           where "thisEntityId" = $1 and 
           "edgeType" = 'Friend'
        ) and 
        u.birthday >= $2 and
        u.birthday <= $3 and
        u.id != $1
        limit $4
      `,
    [
      user.id,
      moment(user.birthday).subtract(5, 'years').toDate(),
      moment(user.birthday).add(5, 'years').toDate(),
      50,
    ]))
}

export const saveEmailRegistry = (emailRegistry: EmailRegistry): Promise<EmailRegistry> => {
  return getEmailRegistryRepository()
    .then(repo => repo.save(emailRegistry))
}

export const readEmailRegistryBy = (options: object): Promise<EmailRegistry> => {
  return getEmailRegistryRepository()
    .then(repo => repo.findOne(options))
}

export const createOrReadEmailRegistry = (emailRegistry: EmailRegistry): Promise<any> => {
  return saveEmailRegistry(emailRegistry)
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err))(
      err => readEmailRegistryBy(_.pick(emailRegistry, ['email']))
        .then(sf.thru_if(_.isNil)(
          () => {
            throw err
          }
        ))
    )(
      err => {
        throw err
      }
    ))
}

export const mapReportPlayerInputToReport = (input: ReportPlayerInput, sessionUser: User): Report & Pick<ReportPlayerInput, 'reason' | 'playerEid'> => {
  const retMe = new Report()
  retMe.sessionUserId = _.get(sessionUser, 'id')
  retMe.reportedPlayerEid = input.playerEid
  return _.extend(retMe, _.pick(input, [
    'reason',
  ]))
}

export const saveReport = (report: any): Promise<any> => {
  return getReportRepository()
    .then(repo => repo.save(report))
}
