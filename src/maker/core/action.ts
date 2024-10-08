/* eslint-disable prefer-rest-params */
import { REGISTER_ACTION_FN_MAP } from './metadata'
import { ChatRoomActionContextApi } from 'types'
import { mappedUnObjectEidsConstructor } from './params/unobject.param'
import { mappedUnrealActorEidConstructor } from './params/actor.param'
import { mappedUnrealJobIdConstructor, mappedUnrealJobNodeEidConstructor, mappedUnrealJobConstructor } from './params/job.param'
import { mappedActionArgsConstructor } from './params/action.param'

export function UnrealAction(key: string): MethodDecorator {
  return function UnrealActionDecorator<T>(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void | TypedPropertyDescriptor<T> {
    const method = descriptor.value

    descriptor.value = function (): any {
      const contextApi = arguments[0] as ChatRoomActionContextApi
      const ctxArgs = arguments[1] as any
      const originalArgs = Array.prototype.slice.call(arguments) as any[]

      return method.apply(this, Object.assign(
        originalArgs,
        mappedUnrealActorEidConstructor(target, propertyKey, contextApi),
        mappedUnObjectEidsConstructor(target, propertyKey, contextApi),
        mappedActionArgsConstructor(target, propertyKey, ctxArgs),
        mappedUnrealJobConstructor(target, propertyKey, ctxArgs),
        mappedUnrealJobIdConstructor(target, propertyKey, ctxArgs),
        mappedUnrealJobNodeEidConstructor(target, propertyKey, ctxArgs),
      ))
    }

    Reflect.defineMetadata(REGISTER_ACTION_FN_MAP, {
      ...Reflect.getMetadata(REGISTER_ACTION_FN_MAP, target.constructor) || {},
      [key]: descriptor.value,
    }, target.constructor)
  }
}
