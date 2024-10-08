/**
 * @rob4lderman
 * aug2019
 *
 * A place for misc utils.
 */

import randomstring from 'randomstring'
import moment, { DurationInputObject } from 'moment'
import _ from 'lodash'

export const compressWhitespace = (str: string): string => {
  return !!!str
    ? str
    : str.replace(/\s+/g, ' ')
}

export const stripWhitespace = (str: string): string => {
  return !!!str
    ? str
    : str.replace(/\s+/g, '')
}

export const stripNonWordChars = (str: string): string => {
  return !!!str
    ? str
    : str.replace(/[^\w]/g, '')
}

export const stripNonWordDotChars = (str: string): string => {
  return !!!str
    ? str
    : str.replace(/[^\w.]/g, '')
}

export const stripUnderscore = (str: string): string => {
  return !!!str
    ? str
    : str.replace(/[_]/g, '')
}

export const stripDots = (str: string): string => {
  return !!!str
    ? str
    : str.replace(/[.]/g, '')
}

export const trimDots = (str: string): string => {
  return !!!str
    ? str
    : _.trim(str, '.')
}

export const prefixHttps = (str: string): string => {
  return _.isString(str) && str.startsWith('//')
    ? 'https:' + str
    : str
}

/**
 * TODO: this is used for confirm-email and reset-password so we
 *       need to ensure the token is unique across users
 *       eg. prefix the token with the user_id.
 * @return randomly generated token
 */
export const generateRandomToken = (): string => {
  return randomstring.generate({
    length: 40,
    charset: 'alphanumeric',
    // capitalization: 'lowercase',
  })
}

export const strlen = (str: string): number => _.isString(str) ? str.length : 0

export const prependHashToColor = (color: string): string => {
  return (strlen(color) == 6 || strlen(color) == 8) && !!!_.startsWith(color, '#')
    ? `#${color}`
    : color
}

export const omitNils = (obj: object): object => _.omitBy(obj, value => _.isNil(value))

export const toDateISOString = (value: any): string => _.isDate(value) ? value.toISOString() : value

export const isoToDate = (iso: string): Date => moment(iso).toDate()

// Postgres will return records that **equal** the timestamp, despite
// the strictly-greater-than filter in the SQL.  This ends up returning
// dup records to the frontend.  Workaround: add 1 ms to the timestamp.
export const addMs = (d: Date, add_ms = 1): Date => {
  d.setMilliseconds(d.getMilliseconds() + add_ms)
  return d
}

export const toPlainObjectRecursive = (obj: any, depth = 0, maxDepth = 5): object => {
  if (depth > maxDepth) {
    return obj
  }
  if (!!!_.isObject(obj)) {
    return obj
  }
  if (_.isArray(obj)) {
    return _.map(obj, o => toPlainObjectRecursive(o, depth))
  }
  return _.chain(obj)
    .omitBy(_.isFunction)
    .omitBy(_.isUndefined)
    .mapValues(value => _.isDate(value) ? (value as Date).toISOString() : value)
    .mapValues(value => _.isObject(value) ? toPlainObjectRecursive(value, depth + 1) : value)
    .value()
}

const nonNumericRegex = /^D+$/
export const isIndexedObject = (obj: any): boolean => {
  return _.isPlainObject(obj)
    && _.isNil(
      _.find(
        _.keys(obj),
        (key: string) => key.match(nonNumericRegex),
      ),
    )
}

export const indexedObjectToArrayRecursive = (obj: any, depth = 0, maxDepth = 5): object => {
  if (depth > maxDepth) {
    return obj
  }
  return _.chain(obj)
    .mapValues(value => isIndexedObject(value) ? _.values(value) : value)
    .mapValues(value => _.isPlainObject(value) ? indexedObjectToArrayRecursive(value, depth + 1) : value)
    .value()
}

export type AsyncFunction = (...args: any[]) => Promise<any>;

export const catchAndReturnNull = (fn: AsyncFunction): AsyncFunction => (...args): Promise<any> => {
  return fn(...args)
    .catch(() => null)
}

export const convertArrayToObject = (result: any): Record<string, any> => {
  return _.isArray(result)
    ? { arr: result }
    : result
}

export const convertToPlainObject = (result: any): Record<string, any> => {
  return _.isPlainObject(result)
    ? result
    : { result }
}

export const isNot = fn => (value): boolean => !!!fn(value)

export const isTrue = (value): boolean => !!value

export const isFalse = (value): boolean => !!!value

export const firstNotEmpty = <T>(...args: T[]): T => _.find(args, isNot(_.isEmpty))

export const throwMe = (err: any): void => {
  throw err
}

export const throwMeFn = (err: any) => (): void => throwMe(err)

export const replaceCollectionIdComponent = (collectionId: string, replaceThis: string, withThis: string): string => {
  if (_.isEmpty(collectionId)) {
    return collectionId
  }
  const comps = _.map(
    _.split(collectionId, '/'),
    (comp: string) => comp === replaceThis ? withThis : comp,
  )
  return _.join(_.compact(comps), '/')
}

export const appendIfNecessary = (str: string, appendme: string): string => {
  if (_.isNil(str)) {
    return str
  }
  return str.substr(-1 * appendme.length) == appendme
    ? str
    : str + appendme
}

export const mapValuesToStrings = (obj: object): object => _.mapValues(
  obj,
  (value: any) => _.isString(value)
    ? value
    : _.toString(_.defaultTo(value, '')),
)

// https://github.com/jsdf/deep-freeze/blob/master/index.js
export const deepFreeze = <T>(o: T): Readonly<T> => {
  Object.freeze(o)
  const oIsFunction = typeof o === 'function'
  const hasOwnProp = Object.prototype.hasOwnProperty
  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (hasOwnProp.call(o, prop)
      && (oIsFunction ? prop !== 'caller' && prop !== 'callee' && prop !== 'arguments' : true)
      && o[prop] !== null
      && (typeof o[prop] === 'object' || typeof o[prop] === 'function')
      && !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop])
    }
  })
  return o
}

// This function is very magical, it lets you type-check an object while retaining its "as const"
export const mapOf = <T>() => <O extends { [K in keyof O]: T }>(obj: O): Readonly<O> => {
  return deepFreeze(obj)
}

export const listOf = <T>(arr: T[]): readonly Readonly<T>[] => {
  return deepFreeze(arr)
}

// Same as array.find() but returns the last one to match the filter
export const findLast = <T>(list: Readonly<T[]>, filter: (v: T, i: number, l: T[]) => boolean): T => {
  return list.filter(filter).pop()
}

// Similar to lodash defaultsDeep but with stronger typing
type Primitive = string | number | null | undefined | Date | Function | RegExp

type PartialRecursive<T> = {
  [P in keyof T]?: T[P] extends Primitive | Array<any> ? T[P] : PartialRecursive<T[P]>
};

export const defaultsDeep = <T>(data: PartialRecursive<T>, defaults: T): T => {
  for (const prop in defaults) {
    const current = data[prop]
    const src = defaults[prop]
    if (_.isPlainObject(src)) {
      // TODO: This function can still get improved further as far as typing goes
      if (current === undefined || _.isPlainObject(current)) {
        data[prop] = defaultsDeep<any>(current || {}, src)
      }
    } else if (current === undefined) {
      data[prop] = src as any
    }
  }
  return data as T
}

// Similar to lodash cloneDeep but with stronger typing
// Ensure a potential Readonly is removed in the return type
export const cloneDeep = <T>(obj: T | Readonly<T>): T => {
  return JSON.parse(JSON.stringify(obj)) as T
}

/**
 * Appends or updates an element in an array
 * 1) When the value does not exist in the array, we append to it
 * 2) When the value exists, we get the new value from `newValueFn`
 *
 * @param array
 * @param value
 * @param valuesEqFn - determines whether an old and new values are same
 */
export const appendOrInsertToArray = <T>(
  array: T[],
  value: T,
  valuesEqFn = (v1: T, v2: T): boolean => v1 === v2,
): T[] => {
  const index = array.findIndex(val => valuesEqFn(val, value))
  return index === -1
    ? [...array, value]
    : [
      ...array.slice(0, index),
      value,
      ...array.slice(index + 1, array.length),
    ]
}

/**
 * Safe mathematical addition of 2 floating point numbers
 * Why is this needed? Try doing: `0.1 + 0.2`
 */
export const safeAdd = (x: number, y: number): number => {
  const factor = 10 ** 6 // keep at most 6 decimals
  return (Math.floor(x * factor) + Math.floor(y * factor)) / factor
}

/**
 * Object.keys() with more accurate types
 */
export const keysOf = <T>(obj: T): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[]
}

/**
 * The "in" operator with more accurate types
 */
export const isKeyOf = <T>(key: string | number | symbol | null | undefined, obj: T): key is keyof T => {
  return key in obj
}

/**
 * Converts a value to an array
 * @param value
 * @param fn(value)
 */
export const toArray = <T>(
  value: T|T[],
  fn = (v: T): T[] => [v]
): T[] => !Array.isArray(value) ? fn(value) : value

export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const sortBy = <T>(key: keyof T) => {
  return (a: T, b: T): number => {
    // TODO there is an issue with date values
    //  not being iso strings when read from db vs cache
    const v1 = toDateISOString(a[key])
    const v2 = toDateISOString(b[key])
    return (v1 > v2) ? 1 : ((v2 > v1) ? -1 : 0)
  }
}

export const sortByDesc = <T>(key: keyof T) => {
  return (a: T, b: T): number => sortBy(key)(b, a)
}

export const assertNotNil = <T>(value: T | null | undefined): T => {
  if (_.isNil(value)) {
    throw new Error('Undefined or null value received')
  }
  return value
}

/**
 * Converts an array like ['a', 'b', 'c', 'd'] into 'a, b, c or d'
 */
export const displayList = (list: string[], word = 'or'): string => {
  const pref = list.length <= 1 ? [] : [list.slice(0, -1).join(', '), word]
  return [...pref, _.last(list)].join(' ')
}

export const stringToArray = (str: string, separator = ','): string[] => str.split(separator)

export const compact = <T>(array: T[]): T[] => array.filter(Boolean)

export const isColor = (value: string): boolean => {
  return /^(#[0-9a-z]+|rgba?\(.+)$/i.test(value)
}

// Takes a type and some of its keys and returns a type where those keys are required
export type requireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

interface PromiseExtra<T> { resolve: (value: T) => void; reject: (reason?: any) => void }

export const promise = <T>(): Promise<T> & PromiseExtra<T> => {
  let extra: PromiseExtra<T>
  const promise = new Promise<T>((resolve, reject) => {
    extra = { resolve, reject }
  })
  return _.extend(promise, extra)
}

export const toMS = (duration?: DurationInputObject): number => {
  return moment.duration(duration).asMilliseconds()
}
