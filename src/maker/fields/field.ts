import { EntityScope, FieldType } from '../../gql-types'
import { FieldTemplate, FieldTemplateFactory } from '../types'

export type BaseFieldMeta<TMetadata> = Pick<FieldTemplate<TMetadata>, 'type' | 'scope' | 'name' | 'collectionName'>

export abstract class BaseField<TMetadata> implements FieldTemplateFactory<TMetadata> {

  protected abstract _name: string
  protected abstract _scope: EntityScope
  protected abstract _type: FieldType
  protected _collectionName?: string

  get name(): string {
    return this._name
  }

  get scope(): EntityScope {
    return this._scope
  }

  get type(): FieldType {
    return this._type
  }

  get collectionName(): string | undefined {
    return this._collectionName
  }

  withName(name: string): this {
    this._name = name
    return this
  }

  scopedTo(scope: EntityScope): this {
    this._scope = scope
    return this
  }

  protected toBaseFieldTemplate(): BaseFieldMeta<TMetadata> {
    return {
      type: this.type,
      scope: this.scope,
      name: this.name,
      collectionName: this.collectionName,
    }
  }

  abstract toFieldTemplate(): FieldTemplate<TMetadata>

}
