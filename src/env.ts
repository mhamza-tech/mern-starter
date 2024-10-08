import _ from 'lodash'

export const parseBoolean = (str: string): boolean => {
  return _.isString(str)
    ? str === 'true' || str === '1'
    : !!str
}

const lookupEnvKeyOrThrow = (key: string): string => {
  const value = process.env[key]
  if (_.isString(value)) return value
  throw new Error(`Environment variable ${key} is required`)
}

export const {
  SECRET,
  PORT,
  NODE_ENV,

  TYPEORM_CONNECTION,
  TYPEORM_USERNAME,
  TYPEORM_PASSWORD,
  TYPEORM_HOST,
  TYPEORM_PORT,
  TYPEORM_DATABASE,
  TYPEORM_MIGRATIONS_RUN,
  TYPEORM_MIGRATIONS_DIR,
  TYPEORM_DROP_SCHEMA,
  TYPEORM_SYNCHRONIZE,
  TYPEORM_LOGGING,

  ROOT_URL,

  BRANCH_KEY,
  BRANCH_SECRET,
  BRANCH_APP_ID,

  APN_KEY,
  APN_KEYID,
  APN_TEAMID,
  APN_TOPIC,

  STORY_SERVICE_URL,
  GOOGLE_APPLICATION_CREDENTIALS,
  SERVICE_URL,
  MASTER_API_KEY,
  SENDGRID_API_KEY,
  CONFIRM_EMAIL_URL,
  RESET_PASSWORD_URL,

  CONTENTFUL_SPACE_ID,
  CONTENTFUL_DELIVERY_API_KEY,
  CONTENTFUL_PREVIEW_API_KEY,
  FIREBASE_SERVICE_ACCOUNT_FILE,

  UNREAL_AWS_ACCESS_KEY,
  UNREAL_AWS_SECRET_ACCESS_KEY,

  REDIS_HOST,
  REDIS_PORT,

  MIXPANEL_TOKEN,

  WELCOME_BOT_EID,

  LOCAL_DEV_ENV = false,
  SYSTEM_USER_EID = 'user/unreal-system-user',
  USERS_TO_AUTO_FRIEND,
  DEFAULT_NPC_ID = 'bedroom_357',

  npm_package_version: PACKAGE_VERSION,
} = process.env

export const APOLLO_DEBUG_ENABLED = parseBoolean(process.env.APOLLO_DEBUG_ENABLED)
export const APOLLO_TRACING_ENABLED = parseBoolean(process.env.APOLLO_TRACING_ENABLED)
export const FAST_BOOT = parseBoolean(process.env.FAST_BOOT)

export const APP_URL = lookupEnvKeyOrThrow('APP_URL')
export const WWW_SHORT_DOMAIN = lookupEnvKeyOrThrow('WWW_SHORT_DOMAIN')
export const WWW_DOMAIN = lookupEnvKeyOrThrow('WWW_DOMAIN')
export const IOS_BUNDLE_ID = lookupEnvKeyOrThrow('IOS_BUNDLE_ID')
export const FB_SHORTLINK_API_KEY = lookupEnvKeyOrThrow('FB_SHORTLINK_API_KEY')

export const UNREAL_AWS_S3_BUCKET = lookupEnvKeyOrThrow('UNREAL_AWS_S3_BUCKET')
export const IMGIX_CDN_ROOT_URL = lookupEnvKeyOrThrow('IMGIX_CDN_ROOT_URL')
export const IMGIX_API_KEY = lookupEnvKeyOrThrow('IMGIX_API_KEY')
