import { Effect, CreateEffectInput } from '../../../gql-types'
import { EffectTemplate } from '../../types'

export abstract class EffectFactory<TMetadata, TTemplate = EffectTemplate<TMetadata>> {

  constructor(protected readonly applyCtxAndStream?: (template: TTemplate) => Promise<Effect>,
    protected readonly applyCtxFn?: (template: TTemplate) => CreateEffectInput) { }

}
