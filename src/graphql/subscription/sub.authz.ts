/**
 * @rob4lderman
 * sep2019
 */

import _ from 'lodash'
import { MASTER_API_KEY } from '../../env'

export const authzMasterApiKeyOverride = (err: any, apiKey: string): void => {
  if (_.trim(apiKey) !== MASTER_API_KEY) {
    throw err
  }
}
