import { JobOptions } from 'bull'

export interface IQueueIdentifiable {
  readonly id: string
}

export interface IQueueDispatchable {
  readonly dispatchAt: Date
}

export interface IQueueable extends IQueueIdentifiable, IQueueDispatchable { }
export type IPartiallyQueueable = Partial<IQueueable>

export type QueueJobOptions = Omit<JobOptions, 'jobId' | 'delay' | 'backoff' | 'lifo' | 'timeout' | 'stackTraceLimit' | 'priority'>
export type UnnamedJob = '__default__'
