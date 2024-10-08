import { EntityScope, FieldType } from '../../gql-types'
import { BaseField } from './field'
import { JsonObjectFieldMetadata, FieldTemplate } from '../types'

class DemoOfFieldBuilder extends BaseField<JsonObjectFieldMetadata> {

  protected _name = 'BaseField'
  protected _scope = EntityScope.ChatRoomPrivateScope
  protected _type = FieldType.JsonObjectField

  toFieldTemplate(): FieldTemplate<JsonObjectFieldMetadata> {
    return {
      ...this.toBaseFieldTemplate(),
    }
  }

}

describe(BaseField.name, () => {
  it('should return field template with defaults', done => {
    const sut = new DemoOfFieldBuilder()
    const fieldTemplate = sut.toFieldTemplate()

    expect(fieldTemplate.name).toEqual('BaseField')
    expect(fieldTemplate.scope).toEqual(EntityScope.ChatRoomPrivateScope)
    expect(fieldTemplate.type).toEqual(FieldType.JsonObjectField)

    done()
  })

  it('should allow overwriting name property', done => {
    const sut = new DemoOfFieldBuilder()
    const newValue = 'Primary'

    const fieldTemplate = sut
      .withName(newValue)
      .toFieldTemplate()

    expect(fieldTemplate.name).toEqual(newValue)

    done()
  })

  it('should allow overwriting scope property', done => {
    const sut = new DemoOfFieldBuilder()
    const newValue = EntityScope.GlobalScope

    const fieldTemplate = sut
      .scopedTo(newValue)
      .toFieldTemplate()

    expect(fieldTemplate.scope).toEqual(newValue)

    done()
  })
})
