import { Job } from 'bull'
import { Processor } from '../core/process.decorator'
import { ProcessGenericJob } from './generic-job.decorator'
import { GenericJob } from './generic-job.enum'
import {
  IJob,
  DeleteExpiredJob,
} from './generic-job.models'
import { QueueService } from 'src/queue/core'
import { QueueFactory } from '../core/queue.factory'
import { deleteField } from 'src/graphql/core'
import { EntityType } from 'src/gql-types'
import { deleteNewsfeedItem } from 'src/graphql/Activity/newsfeeditem.model'

@Processor()
export class JobQueue extends QueueService<IJob, keyof typeof GenericJob> {

  @ProcessGenericJob('Test')
  processJobsNamedTest(job: Job<IJob>): void {
    super.logProcessingJob(job)

    console.log(job.data)
  }

  @ProcessGenericJob('DeleteExpired')
  processJobsNamedDeleteExpired(job: Job<DeleteExpiredJob>): void {
    super.logProcessingJob(job)
    switch (job.data.type) {
      case EntityType.Field:
        deleteField(job.data.id)
        break
      case EntityType.NewsfeedItem:
        deleteNewsfeedItem(job.data.id)
        break
    }
  }

  @ProcessGenericJob('GenerateNewsfeedItems')
  processJobNamedGenerateNewsfeedItems(job: Job<IJob>): void {
    // TODO
    //  1) fetch all users from db
    //  2) call function to run newsfeed generation rule
    super.logProcessingJob(job)
  }

  // you can add arbitraty generic jobs here that can do what you want
  // just create a function with @ProcessGenericJob('YOUR_NEW_NAMED_JOB')

}

export const JobQueueInstance = QueueFactory('GenericJobs', JobQueue)
