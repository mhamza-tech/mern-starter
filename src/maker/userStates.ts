import _ from 'lodash'
import moment from 'moment'
import * as sft from 'src/utils/sf.typed'
import { safeAdd, deepFreeze, defaultsDeep, sortByDesc } from 'src/utils/misc'
import { Field, FieldType, EntityScope } from 'src/gql-types'
import { HashStatusFieldMetadata, NodeApi, FieldTemplate } from 'src/maker/types'
import { LoggerFactory } from 'src/utils/logger'
import { events } from 'src/events'
import { UserState, userStates, UserStateId } from 'src/domain/userStates'

// Input is what's stored in the DB
export type UserStateInput = Pick<HashStatusFieldMetadata, 'numberValue' | 'delta' | 'changedAt'>
// Metadata is what we actually expose to the FE and makers
// TODO: We need to refactor this to just be the Input and the immutable UserState
type Metadata = Required<HashStatusFieldMetadata> & { id: UserStateId }

const logger = LoggerFactory('userStates', 'UserStates')
const defaultInput: Required<UserStateInput> = { numberValue: 0, delta: 0, changedAt: null }

const userStateField = deepFreeze<FieldTemplate<HashStatusFieldMetadata>>({
  name: '',
  type: FieldType.HashStatusField,
  scope: EntityScope.GlobalPrivateScope,
  collectionName: 'userStates',
  metadata: defaultInput,
})

export const fieldToMetadata = (field: Field): Metadata | null => {
  const userState = userStates[field.name as UserStateId]
  if (!userState) {
    // Old entry not in the list above, skip it
    return null
  }
  // Ignore any extraneous data from metadata (from old data)
  const values: UserStateInput = _.pick(field?.metadata, Object.keys(defaultInput))
  const defaultChangedAt = field.updatedAt && moment(field.updatedAt).toISOString()
  // TODO: Re-clamp in case the range changes?
  return { ...getDefaultMetadata(userState), changedAt: defaultChangedAt, ...values }
}

// TODO: I want this to return Promise<Metadata> but InteractionEffect will need to be refactored for that
export const incUserState = async (node: NodeApi, id: UserStateId, by: number): Promise<Field> => {
  const state = userStates[id]
  const metadata = await getUserState(node, id)
  const numberValue = _.clamp(safeAdd(metadata.numberValue, by), state.minValue, state.maxValue)
  const delta = numberValue - metadata.numberValue

  return setUserState(node, id, { delta, numberValue, changedAt: new Date().toISOString() })
}

export const getUserState = (node: NodeApi, id: UserStateId): Promise<Metadata> => {
  const field = defaultsDeep({ name: id }, userStateField)
  return node.field(field).then(field => fieldToMetadata(field)!)
}

// TODO: I want this to return Promise<Metadata> but InteractionEffect will need to be refactored for that
export const setUserState = (node: NodeApi, id: UserStateId, input: UserStateInput): Promise<Field> => {
  const state = userStates[id]
  logger.info(`${node.getName()}(${node.getEid()}) is now ${input.numberValue}/${state.maxValue} on ${state.displayName}`)
  
  const isDeleted = input.numberValue === 0
  const field = defaultsDeep({
    // We decided to force user states to be integers
    name: id, isDeleted, metadata: { ...input, numberValue: Math.round(input.numberValue) },
  }, userStateField)
  return node.saveField(field)
    .then(sft.tap_wait(() => events.state.changed.notify({ node, state, input })))
}

export const resetUserState = (node: NodeApi, id: UserStateId): Promise<Field> => {
  return setUserState(node, id, defaultInput)
}

export const resetAllUserStates = (node: NodeApi): Promise<Field[]> => {
  return getActiveUserStates(node).then(metas => (
    sft.promiseMap(metas, metadata => resetUserState(node, metadata.id))
  ))
}

export const getActiveUserStates = (node: NodeApi): Promise<Metadata[]> => {
  return node.fieldsByType(userStateField.type)
    .then(fields => fields
      .map(fieldToMetadata)
      // Ignore fields not in the list or inactive (numberValue=0)
      .filter(metadata => !!(metadata && metadata.numberValue))
      // Sort them so that the most recently updated goes first
      .sort(sortByDesc('changedAt'))
    )
}

const getDefaultMetadata = (state: UserState): Metadata => ({
  ...defaultInput,
  id: state.id,
  minValue: state.minValue,
  maxValue: state.maxValue,
  displayName: state.displayName,
  thumbImage: { s3Key: '' },
  promotedImage: { s3Key: '' },
  description: '',
  color: '',
})
