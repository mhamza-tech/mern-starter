import { UnrealArrayParamDecoratorMixin, UnrealArrayParamDecoratorMixinUnwrap } from '../mixins'
import { MAKER_API_PARAMS_JOB_ID, MAKER_API_PARAMS_JOB_NODE, MAKER_API_PARAMS_JOB } from '../metadata'
import _ from 'lodash'

export const UnrealJob = UnrealArrayParamDecoratorMixin(MAKER_API_PARAMS_JOB)
export const UnrealJobId = UnrealArrayParamDecoratorMixin(MAKER_API_PARAMS_JOB_ID)
export const UnrealJobNodeEid = UnrealArrayParamDecoratorMixin(MAKER_API_PARAMS_JOB_NODE)

export function mappedUnrealJobConstructor(target: any, propertyKey: string | symbol, args: any): Record<string, string> {
  return UnrealArrayParamDecoratorMixinUnwrap(MAKER_API_PARAMS_JOB, target, propertyKey, _.get(args, 'actionArgs', {}))
}

export function mappedUnrealJobIdConstructor(target: any, propertyKey: string | symbol, args: any): Record<string, string> {
  return UnrealArrayParamDecoratorMixinUnwrap(MAKER_API_PARAMS_JOB_ID, target, propertyKey, _.get(args, 'jobId', undefined))
}

export function mappedUnrealJobNodeEidConstructor(target: any, propertyKey: string | symbol, args: any): Record<string, string> {
  return UnrealArrayParamDecoratorMixinUnwrap(MAKER_API_PARAMS_JOB_NODE, target, propertyKey, _.get(args, 'jobNodeEid', {}))
}
