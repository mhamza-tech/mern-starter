/* eslint-disable @typescript-eslint/no-unused-vars */
import { v4 } from 'uuid'
import { getConnection } from 'typeorm'
import { createConnectionsPromise } from 'src/db/connect'
import { startHeartbeat } from 'src/graphql/subscription'
import {
  ApolloServer,
  ServerInfo,
} from 'apollo-server'
import {
  jwt,
  misc,
  sf,
  sft,
} from 'src/utils'
import {
  Redis,
  USER_PRESENCE_CACHE_KEY,
} from 'src/services/redis'
import { LoggerFactory } from 'src/utils/logger'
import {
  PORT,
  APOLLO_DEBUG_ENABLED,
  APOLLO_TRACING_ENABLED,
  FAST_BOOT,
} from 'src/env'
import { User } from 'src/db/entity/User'
import schema from 'src/graphql/schema'
import kill from 'kill-port'
import _ from 'lodash'
import {
  unObjectById,
  userById,
} from 'src/graphql/store'
import { events } from 'src/events'
import { apolloServerSentryPlugin } from 'src/graphql/sentry'
import { authzUserIdIsUnObjectCreator } from 'src/graphql/Action/action.authz'
import { buildDefaultGqlContext } from 'src/graphql/gqlcontext'
import { load as consistency } from 'src/graphql/consistency'
import { load as actionstartup } from 'src/graphql/actionstartup'
import { load as locations } from 'src/graphql/locations'
import handlebarsHelpers from './handlebars/helpers'
import { createEdgesOfSmartCards } from 'src/graphql/core'

let serverInfo: ServerInfo
export { serverInfo }
const logger = LoggerFactory('Apollo Server', 'GraphQL')

// Done here to keep circular dependencies in check
handlebarsHelpers.register()

const formatError = (error: any): any => {
  logger.error('ERROR: formatError', { code: _.get(error, 'extensions.code'), exception: _.get(error, 'extensions.exception'), error })
  return error
}

const formatResponse = (response: any): any => {
  // logger.debug('formatResponse', { response })
  return response
}

const onConnect = async (connectionParams: any): Promise<{ token: jwt.Jwt; user: User }> => {
  const token = jwt.decodeJwtFromConn(connectionParams)
  const user = !token || !token.id ? null : await userById(token.id)
  const context = { token, user }
  if (user) {
    const redis = Redis.getInstance().getClient()
    const affected = await redis.hset(USER_PRESENCE_CACHE_KEY, user.id, 'true')
    if (affected > 0) {
      // Only fire once, not once per subscription
      await events.user.connected.notify({ user })
      // do not wait on this promise
      // TODO it would be better to listen onConnected event and invoke this
      createEdgesOfSmartCards(user)
    }
  }
  return context
}

const onDisconnect = async (_ws, context): Promise<void> => {
  const initialContext = await context.initPromise
  const user = initialContext && initialContext.user
  if (user) {
    const redis = Redis.getInstance().getClient()
    const affected = await redis.hdel(USER_PRESENCE_CACHE_KEY, user.id)
    if (affected > 0) {
      await events.user.disconnected.notify({ user })
    }
  }
}

const context = async ({ req, res, connection }: any): Promise<any> => {
  // web socket subscriptions will return a connection
  // https://github.com/srtucker22/chatty/blob/master/server/index.js
  if (connection) {
    return connection.context
  }
  const token = jwt.decodeJwtFromReq(req)
  const user = !token || !token.id ? null : await userById(token.id)
  const actingAsUnObject = jwt.getActingAsFromReq(req) ||
    await unObjectById(jwt.getActingAsFromReq(req))
      .then(sf.tap_wait(_.partial(authzUserIdIsUnObjectCreator, _.get(user, 'id'))))

  const context = {
    ...buildDefaultGqlContext(),
    req,
    user,
    token,
    actingAsUnObject,
    apiKey: jwt.getApiKeyFromReq(req),
    trackingId: misc.firstNotEmpty(jwt.getTrackingIdFromReq(req), v4()),
  }
  return context
}

const apollo = new ApolloServer({
  cors: true,
  introspection: true, // required
  debug: APOLLO_DEBUG_ENABLED,
  tracing: APOLLO_TRACING_ENABLED,
  schema,
  formatError,
  formatResponse,
  subscriptions: {
    onConnect,
    onDisconnect,
  },
  extensions: [],
  context,
  plugins: [apolloServerSentryPlugin],
})

export const startApolloSever = async (): Promise<void> => {
  // Sometimes a previous server is not killed properly, make sure it's killed
  await killPort()
  // await databaseInitializer()
  console.time('TIMING: startApolloServer')
  console.time('TIMING: createConnectionsPromise')
  await createConnectionsPromise
  console.timeEnd('TIMING: createConnectionsPromise')
  console.time('TIMING: apollo.listen')
  serverInfo = await apollo.listen(PORT)
  console.timeEnd('TIMING: apollo.listen')
  const { url, subscriptionsUrl } = serverInfo
  logger.info(`🚀 GraphQL Server ready at ${url}`)
  logger.info(`🚀 GraphQL Subscriptions ready at ${subscriptionsUrl}`)
  console.timeEnd('TIMING: startApolloServer')
  console.time('TIMING: onServerStarted')
  await onServerStarted()
  console.timeEnd('TIMING: onServerStarted')
  logger.info(`Server started successfully in ${process.uptime().toFixed(1)}s`)
}

export const closeApolloServer = async (): Promise<void> => {
  await sft.promiseMap(['auth', 'activity', 'state_machine'], async (connectionName) => {
    const connection = getConnection(connectionName)
    if (connection.isConnected) {
      await connection.close()
      logger.info('Closed DB connection', { connectionName })
      // connection.close()
      // logger.debug('Attempted to .close() db connection but did not wait for promise to return')
      // FIXME awaiting db close promise on mocha test teardown does nto seem to work.  not sure what problem is here?
    }
  })
  
  await apollo.stop()
  logger.info('Closed out Apollo Server')
}

export const killPort = async (): Promise<any> => {
  if (process.env.NODE_ENV == 'development') {
    // lsof -i tcp:3334 
    return await kill(PORT)
      // Without this small delay sometimes it's not killed in time
      .then(sft.pause(100))
      .catch(logger.error)
  } else return
}

/**
 * Runs after the GQL server has started.
 */
const onServerStarted = (): Promise<any[]> => {
  return Promise.all([
    startHeartbeat(),
    !FAST_BOOT && logger.traceFn('consistency.load', consistency)(),
    logger.traceFn('actionstartup.load', actionstartup)(),
    !FAST_BOOT && logger.traceFn('locations.load', locations)(),
    // Use this slightly obscure syntax, to delay loading rules
    import('src/maker/rules').then(rules => rules.default.setup()),
  ])
}
