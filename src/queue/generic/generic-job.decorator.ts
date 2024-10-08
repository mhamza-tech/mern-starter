import { Process } from '../core/process.decorator'
import { GenericJob } from './generic-job.enum'

export function ProcessGenericJob(name?: keyof typeof GenericJob): MethodDecorator {
  return Process(name)
}
