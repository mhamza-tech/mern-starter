import { NodeApi, FieldTemplate, ChatRoomActionContextApi } from './types'
import { FieldType, EntityScope, Field, NumberField } from '../gql-types'

export const FIELD_NAME = 'xp'

const fieldTemplate: FieldTemplate<NumberField> = {
  name: FIELD_NAME,
  type: FieldType.NumberField,
  scope: EntityScope.GlobalPrivateScope,
  metadata: { numberValue: 0, delta: 0 },
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const incrementUserXP = (node: NodeApi, by: number): Promise<Field> => {
  // NOTE: XP is disabled for now, we might fully unimplement it in the future
  // const delta = Math.max(0, by)
  // return node.incrementField(fieldTemplate, delta)
  return getUserXP(node)
}

export const getUserXP = (node: NodeApi): Promise<Field> => {
  return node.field(fieldTemplate)
}

export const incrementXPFromAction = (api: ChatRoomActionContextApi): Promise<Field> => {
  return incrementUserXP(api.getActor(), api.getCurrentAction().xp)
}
