import { IPartiallyQueueable } from 'src/queue/core'
import { EntityType } from 'src/gql-types'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IJob extends IPartiallyQueueable {
}

export interface DeleteExpiredJob extends IPartiallyQueueable {
  id: string
  type: EntityType
}
