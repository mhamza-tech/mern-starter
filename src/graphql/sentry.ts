import { ApolloServerPlugin } from 'apollo-server-plugin-base'
import { IncomingMessage } from 'http'
import { decode } from 'jsonwebtoken'
import { RewriteFrames } from '@sentry/integrations'
import * as Sentry from '@sentry/node'

Sentry.init({
  environment: process.env.NODE_ENV,
  dsn: process.env.SENTRY_DSN,
  release: process.env.BUILD_NUMBER,
  integrations: [new RewriteFrames({
    root: global.__rootdir__,
  })],
})

export const apolloServerSentryPlugin = {
  // For plugin definition see the docs: https://www.apollographql.com/docs/apollo-server/integrations/plugins/
  requestDidStart() {
    return {
      didEncounterErrors(rc): any {
        Sentry.withScope((scope) => {
          scope.addEventProcessor((event) =>
            Sentry.Handlers.parseRequest(event, (rc.context as any).req)
          )

          const request = rc.context.req as IncomingMessage
          const authToken = request.headers['x-token']
          const deocdedToken = authToken
            ? Array.isArray(authToken)
              ? decode(authToken[0]) as { id?: string }
              : decode(authToken) as { id?: string }
            : {}

          if (deocdedToken.id) {
            scope.setUser({
              id: deocdedToken.id,
              ip_address: request.headers.host,
            })
          }

          scope.setTags({
            graphql: rc.operation?.operation || 'parse_err',
            graphqlName: (rc.operationName as any) || (rc.request.operationName as any),
          })

          rc.errors.forEach((error) => {
            if (error.path || error.name !== 'GraphQLError') {
              scope.setExtras({
                path: error.path,
              })
              Sentry.captureException(error)
            } else {
              scope.setExtras({})
              Sentry.captureMessage(`GraphQLWrongQuery: ${error.message}`)
            }
          })
        })
      },
    }
  },
} as ApolloServerPlugin
