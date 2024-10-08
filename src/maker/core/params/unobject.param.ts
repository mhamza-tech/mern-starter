import { UnrealArrayParamDecoratorMixin, UnrealArrayParamDecoratorMixinUnwrap } from '../mixins'
import { MAKER_API_PARAMS_UNOBJECT_EID } from '../metadata'
import { ChatRoomActionContextApi } from '../../../maker/types'

export const UnrealUnObjectEid = UnrealArrayParamDecoratorMixin(MAKER_API_PARAMS_UNOBJECT_EID)

export function mappedUnObjectEidsConstructor(target: any, propertyKey: string | symbol, contextApi: ChatRoomActionContextApi): Record<string, string> {
  return UnrealArrayParamDecoratorMixinUnwrap(MAKER_API_PARAMS_UNOBJECT_EID, target, propertyKey, contextApi.getUnObject().getEid())
}
