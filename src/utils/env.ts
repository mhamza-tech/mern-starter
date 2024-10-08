import * as ENV from '../env'
import { LoggerFactory } from 'src/utils/logger'

const logger = LoggerFactory('env')

export const verifyEnvironment = (): void => {
  logger.info('Loading environment...\n', ENV)
}
