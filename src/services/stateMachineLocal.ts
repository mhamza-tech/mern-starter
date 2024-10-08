/**
 * @rob4lderman
 * oct2019
 */

import { UnObject } from '../db/entity'
import { LoggerFactory } from 'src/utils/logger'
import { unObjectById } from 'src/graphql/store'

const logger = LoggerFactory('stateMachineLocal', 'StateMachineLocal')

export const readUnObject = (unObjectId: string): Promise<UnObject> => {
  logger.log('stateMachineLocal.readUnObject', { unObjectId })
  return unObjectById(unObjectId)
}
