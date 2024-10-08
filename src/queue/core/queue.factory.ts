import { QueueService } from './queue'
import { REDIS_HOST, REDIS_PORT } from 'src/env'
import { LoggerFactory, AppLogger } from 'src/utils/logger'
import Bull, { Queue } from 'bull'
import { UnnamedJob } from './queue.models'

export function QueueFactory<K, TNamedJob extends string | UnnamedJob>(name: string, constructorFn: new (
  queue: Queue<K>,
  logger: AppLogger) => QueueService<K, TNamedJob>): QueueService<K, TNamedJob> {
  return new constructorFn(new Bull(name, {
    prefix: 'Queue',
    redis: {
      host: REDIS_HOST,
      port: parseInt(REDIS_PORT),
    },
    defaultJobOptions: {
      attempts: 3,
      removeOnComplete: true,
    },
  }), LoggerFactory(constructorFn.name, 'Jobs'))
}
