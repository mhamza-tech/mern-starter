import { UnrealArrayParamDecoratorMixin, UnrealArrayParamDecoratorMixinUnwrap } from '../mixins'
import { MAKER_API_PARAMS_ACTOR_EID } from '../metadata'
import { ChatRoomActionContextApi } from '../../../maker/types'

export const UnrealActorEid = UnrealArrayParamDecoratorMixin(MAKER_API_PARAMS_ACTOR_EID)

export function mappedUnrealActorEidConstructor(target: any, propertyKey: string | symbol, contextApi: ChatRoomActionContextApi): Record<string, string> {
  return UnrealArrayParamDecoratorMixinUnwrap(MAKER_API_PARAMS_ACTOR_EID, target, propertyKey, contextApi.getActor().getEid())
}
