/**
 * @rob4lderman
 * feb2020
 */

import {
  FieldTemplate,
  NumberFieldMetadata,
} from './types'
import {
  FieldType,
  EntityScope,
} from '../gql-types'
import {
  misc,
  sf,
} from '../utils'

export const metadataNumberValueLens = sf.lens('metadata.numberValue')

export const positionOnMapFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'reserved.positionOnMap',
  scope: EntityScope.GlobalScope,
  metadata: {
    numberValue: 0,
  },
})
