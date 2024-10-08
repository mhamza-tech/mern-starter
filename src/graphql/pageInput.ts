/**
 * @rob4lderman
 * oct2019
 */

import _ from 'lodash'
import {
  PageInput,
  PageInfo,
  Edge,
} from '../gql-types'
import { misc } from '../utils'
import { LoggerFactory } from 'src/utils/logger'
import moment from 'moment'

const logger = LoggerFactory('pageInput')

export interface PageResolvers {
  firstAfter: (pageInput?: PageInput) => any
  firstBefore: (pageInput?: PageInput) => any
  lastAfter: (pageInput?: PageInput) => any
  lastBefore: (pageInput?: PageInput) => any
}

export interface PageResult<T> {
  list: T[]
  pageInfo: PageInfo
}

export const isPageInputAfterCursor = (pageInput: PageInput): boolean => {
  return !!!_.isEmpty(_.get(pageInput, 'afterCursor'))
    || _.isEmpty(_.get(pageInput, 'beforeCursor'))
}

export const isPageInputFirstN = (pageInput: PageInput): boolean => {
  return !!!_.isNil(_.get(pageInput, 'first'))
    || _.isNil(_.get(pageInput, 'last'))
}

export const cursorToDate = (cursor: string, defaultDate: Date = new Date()): Date => {
  return _.isEmpty(cursor)
    ? defaultDate
    : misc.isoToDate(cursor)
}

/**
 * maps pageInput to the appropriate pageResolver function.
 * @return the result of the pageResolver function 
 */
export const resolvePage = (pageInput: PageInput, pageResolvers: PageResolvers): any => {
  logger.debug('resolvePage', { pageInput })
  if (isPageInputAfterCursor(pageInput)) {
    if (isPageInputFirstN(pageInput)) {
      return pageResolvers.firstAfter(pageInput)
    } else {
      return pageResolvers.lastAfter(pageInput)
    }
  } else {
    if (isPageInputFirstN(pageInput)) {
      return pageResolvers.firstBefore(pageInput)
    } else {
      return pageResolvers.lastBefore(pageInput)
    }
  }
}

export const mapEdgesOrderToPageInfo = (edges: Edge[]): PageInfo => ({
  firstCursor: _.get(_.first(edges), 'order'),
  lastCursor: _.get(_.last(edges), 'order'),
})

export const DEFAULT_CURSOR_VALUE = moment('2020-01-01T00:00:00.000Z').toDate().toISOString()

/**
 * Creates default page input when needed by
 * assigning the given values to `last` and `afterCursor`
 *
 * @param input
 * @param cursor
 * @param numItems
 */
export const defaultPageInput = (
  input: PageInput,
  cursor = DEFAULT_CURSOR_VALUE,
  numItems = 10
): PageInput => {
  if (!input) {
    return {
      first: numItems,
      afterCursor: cursor,
    }
  }
  let newInput = input
  if (!input.first && !input.last) {
    newInput = Object.assign({}, newInput, { first: numItems })
  }
  if (!input.beforeCursor && !input.afterCursor) {
    newInput = Object.assign({}, newInput, { afterCursor: cursor })
  }
  return newInput
}

export const mapToPageInfo = <T>(
  values: T[],
  pageInput: PageInput,
  cursorValueKey = 'updatedAt',
  cursorValueFn = (v: any): string => misc.toDateISOString(v)
): PageInfo => {
  const numRequested = pageInput.last || pageInput.first
  const firstValue = _.first(values)
  const lastValue = values.length < numRequested ? null : values[values.length - 1]
  return {
    firstCursor: cursorValueFn(firstValue?.[cursorValueKey]),
    lastCursor: cursorValueFn(lastValue?.[cursorValueKey]),
  }
}

export const pageResult = <T>(list: T[], pageInput: PageInput): PageResult<T> => {
  let partialList = list
  const cursorValue = pageInput.beforeCursor || pageInput.afterCursor
  const index = partialList.findIndex(v => v['id'] === cursorValue)
  if (index !== -1) {
    partialList = pageInput.afterCursor
      ? partialList.slice(index + 1)
      : partialList.slice(0, index)
  }

  const toTake = pageInput.first || pageInput.last
  const take = partialList.length > toTake ? toTake : partialList.length
  partialList = pageInput.first
    ? partialList.slice(0, take)
    : partialList.slice(partialList.length - take)

  return {
    list: partialList,
    pageInfo: mapToPageInfo(partialList, pageInput, 'id'),
  }
}
