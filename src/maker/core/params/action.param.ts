import { UnrealArrayParamDecoratorMixin, UnrealArrayParamDecoratorMixinUnwrap } from '../mixins'
import { MAKER_API_ACTION_ARGS } from '../metadata'
import _ from 'lodash'

export const UnrealActionArgs = UnrealArrayParamDecoratorMixin(MAKER_API_ACTION_ARGS)

export function mappedActionArgsConstructor(target: any, propertyKey: string | symbol, args: any): Record<string, string> {
  return UnrealArrayParamDecoratorMixinUnwrap(MAKER_API_ACTION_ARGS, target, propertyKey, _.get(args, 'actionArgs', {}))
}
