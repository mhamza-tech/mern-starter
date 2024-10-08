import { QueueService } from './queue'
import { QUEUE_PROCESSES } from './queue.tokens'
import Bull, { Queue } from 'bull'
import { UnnamedJob } from './queue.models'

export function Processor() {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return function ProcessorFactory<TFunction extends { new(...args: any[]): {} }>(constructor: TFunction) {
    const fnMap = Reflect.getMetadata(QUEUE_PROCESSES, constructor) || {}

    return class extends constructor {

      constructor(...args: any[]) {
        super(...args)

        const queue: Queue | undefined = args.find(a => a instanceof Bull)

        if (queue) {
          Object.keys(fnMap).forEach(key => {
            queue.process(key, this[fnMap[key]].bind(this))
          })
        } else {
          throw new Error('Process classes require a Bull queue property')
        }
      }

    }
  }
}

/**
 * @param jobName Binds to named jobs in reddis
 */
export function Process<T extends string | number | symbol>(jobName: T | UnnamedJob = '__default__') {
  return function processMethod(
    target: QueueService<any>,
    propertyName: string,
    propertyDesciptor: PropertyDescriptor): PropertyDescriptor {
    if (!(target instanceof QueueService)) return propertyDesciptor
    
    Reflect.defineMetadata(QUEUE_PROCESSES, {
      ...Reflect.getMetadata(QUEUE_PROCESSES, target.constructor) || {},
      [jobName]: propertyName,
    }, target.constructor)

    return propertyDesciptor
  }
}
