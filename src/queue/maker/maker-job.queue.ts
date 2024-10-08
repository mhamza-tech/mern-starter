import { QueueService, IPartiallyQueueable } from 'src/queue/core'
import { SubmitChatRoomActionInput } from 'src/gql-types'
import { userById } from 'src/graphql/store'
import { sf } from 'src/utils'
import { User } from 'src/db/entity'
import { Processor, Process } from '../core/process.decorator'
import { Job } from 'bull'
import { QueueFactory } from '../core/queue.factory'
import * as chatResolvers from 'src/graphql/Chat/chat.resolvers'
import * as gqlcontext from 'src/graphql/gqlcontext'
import _ from 'lodash'
import { QueryFailedError } from 'typeorm'

export interface IMakerJob<TArgs = any> extends IPartiallyQueueable {
  readonly chatRoomId: string
  readonly sessionUserId: string
  readonly actionName: string
  readonly trackingId: string
  readonly jobNodeEid?: string
  readonly args?: TArgs
}

export type IMakerImplicit<T> = Omit<IMakerJob<T>, 'trackingId' | 'sessionUserId' | 'chatRoomId' | 'jobNodeId'>

@Processor()
export class MakerJobQueue extends QueueService<IMakerJob> {

  @Process()
  private processContextApi(job: Job<IMakerJob>): void {
    this.logProcessingJob(job)

    const { data, id: jobId } = job
    const { args: actionArgs, jobNodeEid, sessionUserId, trackingId, chatRoomId, actionName } = data
    const input: SubmitChatRoomActionInput = { chatRoomId, name: actionName }

    userById(sessionUserId)
      .then(sf.thru_if(_.isNil)(() => Promise.reject(new Error(`ERROR: null sessionUser ${sessionUserId} for jobId ${job.id}`))))
      .then((user: User) => ({ ...gqlcontext.buildDefaultGqlContext(), user, trackingId, isJob: true }))
      .then((ctx: any) => chatResolvers.submitChatRoomAction(null, { input, actionArgs, jobId, jobNodeEid }, ctx))
      .catch((err: QueryFailedError) => {
        this.logger.error(err)
        job.moveToFailed(err)
      })
  }

}

export const MakerJobQueueInstance = QueueFactory('MakerJobs', MakerJobQueue)
