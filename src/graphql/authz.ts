/**
 * @rob4lderman
 * dec2019
 */

import _ from 'lodash'
import { MASTER_API_KEY } from '../env'
import { ApolloError } from 'apollo-server'
import { ErrorType } from '../gql-types'

export const authzMasterApiKeyOverride = (err: any, apiKey: string): void => {
  if (_.trim(apiKey) !== MASTER_API_KEY) {
    throw err
  }
}

export const buildNotAuthorizedDeleteNewsfeedItemError = (): ApolloError => new ApolloError(
  'You are not authorized to delete this newsfeed item',
  ErrorType.NotAuthorizedDeleteNewsfeedItem
)

export const buildNotAuthorizedReadNotificationError = (): ApolloError => new ApolloError(
  'You are not authorized to view this Notification',
  ErrorType.NotAuthorizedReadNotification
)
