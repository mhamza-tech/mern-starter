/**
 * @rob4lderman
 * mar2020
 */
import { LoggerFactory } from 'src/utils/logger'
const logger = LoggerFactory('gqlcontext', 'GraphQL')

/**
 * This method is shared by server.ts and jobworker.ts.
 * @param user 
 */
export const buildDefaultGqlContext = (): any => {
  const context = {}
  logger.debug('buildDefaultGqlContext', { context })
  return context
}
