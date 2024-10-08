import _ from 'lodash'
import moment from 'moment'
import { NodeApi, FieldTemplate, NumberFieldMetadata } from './types'
import { FieldType, EntityScope } from '../gql-types'
import { Field, ActionX, ActionXInstance } from 'src/db/entity'
import { defaultsDeep, cloneDeep } from 'src/utils/misc'
import { DurationInputObject } from 'moment'
import { LoggerFactory } from 'src/utils/logger'
import { Item } from 'src/domain/items'
import { Move } from 'src/domain/moves'

export const FTUE = 'ftue'

/**
 * Multi-purpose counters attached to a NodeApi
 * The field name is derived from a list of Serializables
 * You can easily add more types as long as you convert them to string
 * Also, this module has some workarounds for bugs in the engine that we should export
 */

const fieldTemplate: FieldTemplate<NumberFieldMetadata> = {
  name: '',
  type: FieldType.NumberField,
  scope: EntityScope.GlobalPrivateScope,
  collectionName: 'counters',
  metadata: { numberValue: 0, delta: 0 },
}

// So it won't conflict with other Fields by accident
const PREFIX = 'cnt_'

type Serializable = string | ActionXInstance | NodeApi | ActionX | Item | Move
type Input = Serializable | Readonly<Serializable[]>

const logger = LoggerFactory('counters', 'Counters')

// Each call will refresh the expiration of the Field
export const incCounter = (node: NodeApi, input: Input, delta = 1, resetIn?: DurationInputObject, local = false): Promise<number> => {
  return getCounterField(node, input, local).then((field) => {
    field.metadata.delta = delta
    field.metadata.numberValue += delta
    // Set an expiration, only if the Field didn't have one already
    if (!field.expiresAt && resetIn) {
      field.expiresAt = moment().add(resetIn).toDate()
    }
    return saveField(node, field)
  })
}

export const getCounterField = (node: NodeApi, input: Input, local = false): Promise<Field> => {
  return node.field(getTemplate(input, local)).then((field) => {
    if (field.expiresAt) {
      // When read, expiresAt is an ISO string when it should be a Date
      field.expiresAt = moment(field.expiresAt).toDate()
      // expiresAt is not 100% reliable, since it's enforced at boot, emulate it
      if (moment().isAfter(field.expiresAt)) {
        field.metadata = cloneDeep(fieldTemplate.metadata)
        field.expiresAt = null
      }
    }
    return field
  })
}

export const getCounter = (node: NodeApi, input: Input, local = false): Promise<number> => {
  return getCounterField(node, input, local).then(field => field.metadata.numberValue)
}

export const resetCounter = (node: NodeApi, input: Input, local = false): Promise<number> => {
  return saveField(node, getTemplate(input, local))
}

export const parseCounterInput = (input: Input): string => {
  const keys = _.isArray(input) ? input : [input]
  return PREFIX + keys.map(serialize).join('_')
}

const saveField = (node: NodeApi, field: Field | FieldTemplate<NumberFieldMetadata>): Promise<number> => {
  const display = node.isChatRoom() ? node.getEid() : `${node.getName()}(${node.getEid()})`
  const value = field.metadata.numberValue
  logger.info(`${display}'s counter "${field.name}" is now at ${value}`)
  if (!('isDeleted' in field)) {
    // Delete the Field, by default, when it's 0
    field.isDeleted = !value
  }
  return node.saveField(field).then(({ metadata }) => metadata.numberValue)
}

const getTemplate = (input: Input, local: boolean): FieldTemplate<NumberFieldMetadata> => {
  return defaultsDeep({
    name: parseCounterInput(input),
    scope: local ? EntityScope.ChatRoomPrivateScope : EntityScope.GlobalPrivateScope,
  }, fieldTemplate)
}

const serialize = (key: Serializable): string => {
  if (_.isString(key)) {
    return key
  }
  if ('actionName' in key) {
    return key.actionName
  }
  if ('getEid' in key) {
    return key.getEid()
  }
  if ('name' in key) {
    return key.name
  }

  logger.warn('Unknown counter Serializable provided:', logger.inspect(key))
  return '?'
}
