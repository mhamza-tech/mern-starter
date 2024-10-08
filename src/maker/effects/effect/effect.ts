import { EntityScope, EffectType, Effect, CreateEffectInput } from '../../../gql-types'
import { EffectTemplate } from '../../types'

export type BaseEffectMeta<TMetadata> = Pick<EffectTemplate<TMetadata>, 'type' | 'scope'>

export abstract class BaseEffect<TMetadata, TTemplate = EffectTemplate<TMetadata>> {

  constructor(
    protected readonly applyCtxAndStream?: (template: TTemplate) => Promise<Effect>,
    protected readonly applyCtxFn?: (template: TTemplate) => CreateEffectInput) { }

  protected abstract _scope: EntityScope
  protected abstract _type: EffectType

  protected abstract metadata(): TMetadata

  protected toBaseEffect(): BaseEffectMeta<TMetadata> {
    return {
      type: this._type,
      scope: this._scope,
    }
  }

  /**
   * Compute the effect template
   */
  public abstract toEffect(): TTemplate

  /**
   * Ingests a static effect template for processing or utility purposes.
   * Order matters here. If you are ingesting then plan to work on the object to modify it
   * parse() should be invoked first before any other modifiers.
   * 
   * @param template the effect template associated with the builder
   */
  public abstract parse(template: TTemplate): this

  /**
   * Send to client by applying the context api functions.
   * Context API will overwrite the EntityType value. 
   * This will only work if a stream functioing was provided in constructor otherwise throws an error
   */
  public stream(): Promise<Effect> {
    return typeof this.applyCtxAndStream === 'function'
      ? this.applyCtxAndStream(this.toEffect())
      : Promise.reject('Unable to stream without a context api object')
  }

  /**
   * Sets the entity scope.
   * Caution, this may be overwritten when stream to client if a context is applied.
   * @param scope The desired entity scope
   */
  public scope(scope: keyof typeof EntityScope): this {
    this._scope = EntityScope[scope]
    return this
  }

}
