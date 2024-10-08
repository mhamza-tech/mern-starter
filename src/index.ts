/* eslint-disable @typescript-eslint/no-namespace */

// This allows TypeScript to detect our global value for Sentry stack tracing
declare global {
  namespace NodeJS {
    interface Global {
      __rootdir__: string
    }
  }
}

global.__rootdir__ = __dirname || process.cwd()

import './alias'
import { startApolloSever, closeApolloServer, killPort } from './graphql/server'
import { verifyEnvironment } from './utils/env'

function logGoodbye(): void {
  console.log('Cya! Thanks for stopping by.')
}

function bootstrap(): Promise<void> {
  verifyEnvironment()
  return startApolloSever()
}

function cleanExit(): Promise<void> {
  return closeApolloServer()
    .then(killPort)
    .finally(() => {
      logGoodbye()
      process.exit()
    })
}

function handleError(err: Error): void {
  console.error(err)
  throw err
}

process.on('SIGINT', cleanExit)
process.on('SIGTERM', cleanExit)

bootstrap().catch(handleError)
