import { EntityScope, FieldType } from 'src/gql-types'
import { FieldTemplate, JsonObjectFieldMetadata } from 'src/maker/types'
import { misc } from 'src/utils'

export const gameStateField = misc.deepFreeze<FieldTemplate<JsonObjectFieldMetadata>>({
  type: FieldType.JsonObjectField,
  name: 'gameState',
  scope: EntityScope.GlobalScope,
  metadata: { version: 1.0, state: {} },
})
