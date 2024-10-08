/**
 * @rob4lderman
 * may2019
 *
 * functor/monad-like helper functions.
 *
 */

import _ from 'lodash'
import { LoggerFactory } from 'src/utils/logger'
import Bluebird from 'bluebird'
const logger = LoggerFactory('sf')

/**
 * @param fn 
 *
 * @return a function that takes a value and calls fn(value), then returns value.
 *         similar to _.tap.
 *          
 */
export const tap = fn => (value): any => {
  fn(value)
  return value
}

/**
 * @return value => Promise w/ value
 */
export const tap_wait = fn => (value): Promise<any> => {
  return Promise.resolve(fn(value))
    .then(() => value)
}

/**
 * @return value => value
 */
export const tap_catch = fn => (value): Promise<any> => {
  Bluebird.Promise.try(() => fn(value))
    .catch((err) => logger.error('ERROR: tap_catch:', { value, err }))

  return value
}

/**
 * @return value => 
 */
export const thru_catch = fn => (value): Bluebird<any> => {
  return Bluebird.Promise.try(() => fn(value))
    .catch((err) => {
      logger.error('ERROR: thru_catch:', { value, err })
      return null
    })
}

export const tap_wait_if = if_fn => fn => {
  return (value): any => if_fn(value)
    ? tap_wait(fn)(value)
    : value
}

export const tap_if = if_fn => then_fn => {
  return (value): any => if_fn(value)
    ? tap(then_fn)(value)
    : value
}

export const tap_if_else = if_fn => then_fn => else_fn => {
  return (value): any => if_fn(value)
    ? tap(then_fn)(value)
    : tap(else_fn)(value)
}

export const tap_maybe = fn => (value): any => {
  return _.isNil(value)
    ? value
    : tap(fn)(value)
}

export const tap_throw = fn => (value): any => {
  fn(value)
  throw value
}

/**
 * @return fn
 */
export const tap_wait_throw = fn => (value): Promise<any> => {
  return Promise.resolve(fn(value))
    .then(() => {
      throw value
    })
}

export const thru_throw = fn => (value): any => {
  throw fn(value)
}

export const thru_wait_throw = fn => (value): Promise<any> => {
  return Promise.resolve(fn(value))
    .then(val => {
      throw val
    })
}

export const tap_wait_throw_if = if_fn => fn => {
  return (value): Promise<any> => {
    if (if_fn(value)) {
      return tap_wait_throw(fn)(value)
    } else {
      throw value
    }
  }
}

/**
 * @return fn
 */
export const pause = pause_ms => (value): Promise<any> => {
  return new Promise(resolve => setTimeout(() => resolve(value), pause_ms))
}

/**
 * @example sf.thru_if( value => value.check_something )( value => { ...do this if true... } )
 *
 * @param if_fn - returns bool
 *
 * @return a function that takes a value, 
 *          calls if_fn(value) on it, 
 *          if true, returns another function that takes a function and calls it passing the value
 *          if fale, returns another function that takes a function but DOESN'T call it, just returns the value
 */
export const thru_if = if_fn => fn => {
  return (value): any => if_fn(value)
    ? fn(value)
    : value
}

export const thru_if_else = if_fn => then_fn => else_fn => {
  return (value): any => if_fn(value)
    ? then_fn(value)
    : else_fn(value)
}

export const thru_ternary = thru_if_else

export const thru_async_if = async_if_fn => then_fn => {
  return (value): Promise<any> => Promise.resolve(async_if_fn(value))
    .then(boolValue => !!boolValue ? then_fn(value) : value)
}

// a => (a => s) => M a s  
export const state_lift = fn => (value): any[] => [value, fn(value)]

// M a s => ( a => b ) => M b s
export const state_fmap = fn => ([value, state]): any[] => [fn(value, state), state]
export const state_thru = state_fmap

// M a s => ( a => M b s ) => M b s
export const state_bind = fn => ([value, state]): any => fn(value, state)

// M a s => ( a => s' ) => M a (s + s')
export const state_merge = fn => ([value, state]): any[] => [value, { ...state, ...fn(value, state) }]

// M a s => ( a => s' ) => M a s'
export const state_reduce = fn => ([value, state]): any[] => [value, fn(value, state)]

// async state_fmap
export const state_fmap_wait = fn => ([value, state]): Promise<any[]> => Promise.resolve(fn(value, state)).then(result => [result, state])
export const state_fmap_wait_all = fn => ([value, state]): Promise<any[]> => Promise.all(fn(value, state)).then(results => [results, state])

export const state_unlift = fn => ([value, state]): any => fn(value, state)

//
// fmap :: (a -> b) -> f a -> f b
//
// fmap is written above in curried form. Un-curried it is technically
// a method that takes two parms: 
// 1. a functor (f a) 
// 2. a function (a -> b)
// fmap "maps" the function a->b over the functor's value.
//
// @param fn - the function to fmap over the list.
//
// @return a function that takes a list, fmaps fn over the list, and returns the new list
//
export const list_fmap = fn => (list): any[] => {
  return _.map(list, fn)
}

export const list_fmap_wait = fn => (list): Promise<unknown[]> => {
  return Promise.all(_.map(list, fn))
}

export const maybe_fmap = fn => (value): any => _.isNil(value) ? value : fn(value)

export const on_error = (code, fn) => (err): any => {
  if (err.code == code) {
    return fn(err)
  } else {
    throw err
  }
}

export const lens = <T>(path: string, dflt: any = undefined): {
  get: (obj: object) => T
  set: (value: any) => any
  merge: (value: any) => any
  apply: <U>(obj: U) => (value: any) => U
} => ({
  /**
     * get is a function that takes an obj and returns the value stored at the lens path.
     * get: (obj) => obj.path
     */
  get: (obj: object): T => _.get(obj, path, dflt),

  /**
     * set is a function that takes a value 
     * and returns a FUNCTION 
     * that takes an obj and stores the given value in the obj at the lens path, 
     * then returns the object
     * set: (value) => (obj) => obj'   (where obj' is a COPY of obj with the value set at the lens path)
     */
  set: (value: any): any => (obj: object): any => _.set(_.cloneDeep(obj), path, value),

  /**
     * merge is a function that takes a value 
     * and returns a FUNCTION 
     * that takes an obj and MERGES the given value with the existing value in the obj at the lens path, 
     * then returns the object
     * merge: (value) => (obj) => obj'   (where obj' is a COPY of obj with the value merged at the lens path)
     */
  merge: (value: any): any => (obj: object): any => {
    const cloneObj = _.cloneDeep(obj)
    return _.set(
      cloneObj,       // new obj
      path,           // path to merge
      _.merge(
        _.get(cloneObj, path),    // existing value 
        value                       // merged value
      )
    )
  },

  /**
     * apply flips the lens application around.
     * apply is a function that takes an obj
     * and returns a FUNCTION
     * that takes a value and sets the value into the given obj at the lens path,
     * then returns the obj.
     * merge: (obj) => (value) => obj'
     */
  apply: <U>(obj: U): (value: any) => U =>
    (value: any): U => _.extend({}, obj, { [path]: value }),
})
