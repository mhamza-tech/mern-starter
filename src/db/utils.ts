/**
 * @rob4lderman
 * oct2019
 */
import _ from 'lodash'
import { toPlainObjectRecursive } from 'src/utils/misc'
import { In, FindOperator } from 'typeorm'

// https://www.postgresql.org/docs/9.4/errcodes-appendix.html
export const isUniqueViolation = (err): boolean => _.result(err, 'code') === '23505'

export const isNotNullViolation = (err): boolean => _.result(err, 'code') === '23502'

export const safeEntityUpdate = (updatedFields: any): object => {
  return toPlainObjectRecursive(
    _.omit(updatedFields, ['id', 'updatedAt', 'createdAt', 'recordVersion']) 
  )
}

export const safeIn = (arr: any[]): FindOperator<any> => {
  return _.isEmpty(arr)
    ? In([null])
    : In(arr)
}

export const getDeleteResultRowCount = (deleteResult: any): number => {
  const affected = deleteResult.affected
  return _.isNil(affected) || !!! _.isNumber(affected)
    ? 0
    : _.toNumber(affected)
}
