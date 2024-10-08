import { Job, Queue } from 'bull'
import { AppLogger } from 'src/utils/logger'
import { IQueueIdentifiable, IPartiallyQueueable, UnnamedJob, QueueJobOptions } from './queue.models'
import { v4 } from 'uuid'
import { sf } from 'src/utils'
import moment from 'moment'

export abstract class QueueService<TJob extends IPartiallyQueueable, TNamedJob extends string | UnnamedJob = UnnamedJob> {

  constructor(protected readonly queue: Queue<TJob>,
    protected readonly logger: AppLogger) {
    queue.on('error', this.onError.bind(this))
    queue.on('failed', this.onError.bind(this))
  }

  protected jobReportForLog(job: Job): any {
    return {
      id: job.id,
      name: job.name,
      attemptsMade: job.attemptsMade,
      data: job.data,
    }
  }

  protected onError(jobError: Job): void {
    this.logger.error(jobError.failedReason, this.jobReportForLog(jobError))
  }

  private logJobMessage(job: Job, message: string): void {
    this.logger.debug(message, this.logger.inspect(this.jobReportForLog(job)))
  }

  private logPreJobMessage(job: TJob, message: string): void {
    this.logger.log(message, this.logger.inspect(job))
  }

  private logAddingToQueue(job: TJob): void {
    this.logPreJobMessage(job, 'Adding Job to queue')
  }

  private logAddedToQueue(job: Job): void {
    this.logJobMessage(job, 'Added Job to queue!')
  }

  protected logProcessingJob(job: Job): void {
    this.logJobMessage(job, 'Processing Job')
  }

  protected computeDelay(date: Date): number {
    const delay = moment(date).diff(moment.now())
    return delay > 0 ? delay : 0
  }

  protected extractId(id: string): string
  protected extractId(item: Partial<IQueueIdentifiable>): string
  protected extractId(idOrItem: string | Partial<IQueueIdentifiable>): string
  protected extractId(idOrItem: string | Partial<IQueueIdentifiable>): string {
    return typeof idOrItem === 'string'
      ? idOrItem
      : typeof idOrItem.id === 'string'
        ? idOrItem.id
        : v4()
  }

  protected getJobIdSafely(id: string): string
  protected getJobIdSafely(job: IQueueIdentifiable): string
  protected getJobIdSafely(idOrJob: string | IQueueIdentifiable): string
  protected getJobIdSafely(idOrJob: string | IQueueIdentifiable): string {
    return typeof idOrJob === 'string'
      ? idOrJob
      : idOrJob.id
  }

  find(id: string): Promise<Job<TJob>>
  find(job: IQueueIdentifiable): Promise<Job<TJob>>
  find(idOrJob: string | IQueueIdentifiable): Promise<Job<TJob>>
  find(idOrJob: string | IQueueIdentifiable): Promise<Job<TJob>> {
    return this.queue.getJob(this.getJobIdSafely(idOrJob))
  }

  cancel(id: string): Promise<void>
  cancel(job: IQueueIdentifiable): Promise<void>
  cancel(idOrJob: string | IQueueIdentifiable): Promise<void>
  cancel(idOrJob: string | IQueueIdentifiable): Promise<void> {
    return this.find(idOrJob).then(a => a && a.remove())
  }

  update(id: string, data: TJob): Promise<void>
  update(job: IQueueIdentifiable, data: TJob): Promise<void>
  update(idOrJob: string | IQueueIdentifiable, data: TJob): Promise<void>
  update(idOrJob: string | IQueueIdentifiable, data: TJob): Promise<void> {
    return this.find(idOrJob).then(a => a && a.update(data))
  }

  add<TExtendedJob extends TJob>(job: TExtendedJob): Promise<Job<TExtendedJob>>
  add<TExtendedJob extends TJob>(job: TExtendedJob, opts?: QueueJobOptions): Promise<Job<TExtendedJob>>
  add<TExtendedJob extends TJob>(job: TExtendedJob, opts?: QueueJobOptions, name?: TNamedJob): Promise<Job<TExtendedJob>>
  add<TExtendedJob extends TJob>(job: TExtendedJob, opts?: QueueJobOptions, name = '__default__'): Promise<Job<TExtendedJob>> {
    this.logAddingToQueue(job)
    const jobId = this.extractId(job)
    const delay = this.computeDelay(job.dispatchAt)
    return this.queue
      .add(name, job, { delay, ...opts, jobId })
      .then(sf.tap((j: Job<TExtendedJob>) => this.logAddedToQueue(j)))
  }

}
