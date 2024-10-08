/**
 * @rob4lderman
 * jan2020
 *  
 */

import {
  FieldTemplate,
  NumberFieldMetadata,
} from './types'
import {
  sf,
  misc,
} from '../utils'
import {
  FieldType,
  EntityScope,
} from '../gql-types'

export const harvestedStrawberriesCounterFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'global.reserved.user.strawberriesharvested',
  scope: EntityScope.GlobalPrivateScope,
  metadata: {
    numberValue: 0,
  },
})

//
// Lenses (FP for attribute getter/setter access)
//

export const numberValueLens = sf.lens<number>('metadata.numberValue')
