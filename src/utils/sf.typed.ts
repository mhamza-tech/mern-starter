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

const logger = LoggerFactory('SF')

// T => any
type FnT2Any<T> = (value: T) => any;

// T => T
type FnT2T<T> = (value: T) => T;

// T => U
type FnT2U<T, U> = (value: T) => U;

// T => Promise<T>
type FnT2PromiseT<T> = (value: T) => Promise<T>;

// T => Promise<any>
type FnT2PromiseAny<T> = (value: T) => Promise<any>;

// T => Promise<U>
type FnT2PromiseU<T, U> = (value: T) => Promise<U>;

// T => Boolean
type FnPred<T> = (value: T) => boolean;

// T => Boolean
type FnPredPromise<T> = (value: T) => Promise<boolean>;

type nil = null | undefined;

/**
 * runs fn (as a side effect), then returns value.
 * @param fn: T => any
 * @return a function: T => T, 
 *         that takes a value, calls fn(value), then returns value.
 *         similar to _.tap.
 */
export const tap = <T>(fn: FnT2Any<T>): FnT2T<T> => (value: T): T => {
  fn(value)
  return value
}

/**
 * runs fn (as a side effect) and waits for it to complete, then returns value.
 * @param fn: T => Promise<any>
 * @return a function: T => Promise<T> 
 *         value => Promise w/ value
 */
export const tap_wait = <T>(fn: FnT2PromiseAny<T>): FnT2PromiseT<T> => (value: T): Promise<T> => {
  return Promise.resolve(fn(value))
    .then(() => value)
}

/**
 * similar to tap but catches and ignores errors produced by fn.
 * @param fn: T => any
 * @return a function: T => T
 */
export const tap_catch = <T>(fn: FnT2Any<T>): FnT2T<T> => (value: T): T => {
  Bluebird.Promise.try(() => fn(value))
    .catch((err) => logger.error('ERROR: tap_catch:', { value, err }))
  
  return value
}

/**
 * similar to thru but catches and ingores errors produced by fn.
 * returns null if the fn throws an error.
 * @param fn: T => U
 * @return T => Promise<U> | Promise<null>
 */
export const thru_catch = <T, U>(fn: FnT2U<T, U>): FnT2PromiseU<T, U | null> => (value: T): Promise<U> => {
  return Bluebird.Promise.try(() => fn(value))
    .catch((err) => {
      logger.error('ERROR: thru_catch:', { value, err })
      return null
    })
}

/**
 * runs tap_wait(fn) iff the if_fn predicate returns truthy
 * @param if_fn: T => boolean
 * @param fn: T => Promise<any>
 * @return fn: (T => Boolean) => (T => any) => (T => T)
 */
export const tap_wait_if = <T>(if_fn: FnPred<T>) => (fn: FnT2PromiseAny<T>): FnT2PromiseT<T> => {
  return (value: T): Promise<T> => if_fn(value) 
    ? tap_wait(fn)(value) 
    : Promise.resolve(value)
}

/**
 * runs tap(fn) iff the if_fn predicate returns truthy
 * @param if_fn: T => boolean
 * @param then_fn: T => any
 * @return fn: (T => Boolean) => (T => any) => (T => T)
 */
export const tap_if = <T>(if_fn: FnPred<T>) => (then_fn: FnT2Any<T>): FnT2T<T> => {
  return (value: T): T => if_fn(value) 
    ? tap(then_fn)(value) 
    : value
}

/**
 * runs tap(then_fn) iff the if_fn predicate returns truthy.
 * otherwise runs tap(else_fn)
 * @param if_fn: T => boolean
 * @param then_fn: T => any
 * @param else_fn: T => any
 * @return fn: (T => Boolean) => (T => any) => (T => any) => (T => T)
 */
export const tap_if_else = <T>(if_fn: FnPred<T>) => (then_fn: FnT2Any<T>) => (else_fn: FnT2Any<T>): FnT2T<T> => {
  return (value: T): T => if_fn(value)
    ? tap(then_fn)(value)
    : tap(else_fn)(value)
}

/**
 * runs tap(fn) iff value is not null
 * @param fn: T => any
 * @return fn: T => T | nil
 */
export const tap_maybe = <T>(fn: FnT2Any<T>): FnT2T<T | nil> => (value: T): T | nil => {
  return _.isNil(value) 
    ? value
    : tap(fn)(value)
}

/**
 * runs fn (as a side effect), then throws the given value.
 * @param fn: T => any
 * @return fn: T => T (technically it always throws an exception)
 */
export const tap_throw = <T>(fn: FnT2Any<T>): FnT2T<T> => (value: T): T => {
  fn(value)
  throw value
}

/**
 * runs fn (as a side effect), waits for it to complete, then throws the given value
 * (returns a rejected promise).
 * @param fn: T => any
 * @return fn: T => Promise<T> (the promise will always be rejected)
 */
export const tap_wait_throw = <T>(fn: FnT2Any<T>): FnT2PromiseT<T> => (value: T): Promise<T> => {
  return Promise.resolve(fn(value))
    .then(() => {
      throw value 
    })
}

/**
 * runs fn and throws the value it returns.
 * @param fn: T => U
 * @return fn: T => U (technically it always throws an exception)
 */
export const thru_throw = <T, U>(fn: FnT2U<T, U>): FnT2U<T, U> => (value: T): U => {
  throw fn(value)
}

/**
 * runs fn and throws the value it returns (returns a rejected promise)
 * @param fn: T => Promise<U>
 * @return fn: T => Promise<U> (always rejected)
 */
export const thru_wait_throw = <T, U>(fn: FnT2PromiseU<T, U>): FnT2PromiseU<T, U> => (value: T): Promise<U> => {
  return Promise.resolve(fn(value))
    .then(val => {
      throw val 
    })
}

/**
 * runs tap_wait_throw(fn) iff the if_fn predicate returns truthy
 * otherwise throws the value
 * @param if_fn: T => boolean
 * @param fn: T => Promise<any>
 * @return fn: (T => Boolean) => (T => Promise<any>) => (T => Promise<T>)
 */
export const tap_wait_throw_if = <T>(if_fn: FnPred<T>) => (fn: FnT2PromiseAny<T>): FnT2PromiseT<T> => {
  return (value: T): Promise<T> => {
    if (if_fn(value)) {
      return tap_wait_throw(fn)(value) 
    } else {
      return Promise.reject(value)
    }
  }
}

/**
 * pauses, then returns the value
 * @param pause_ms: milliseconds
 * @return fn: T => Promise<T>
 */
export const pause = <T>(pause_ms: number): FnT2PromiseT<T> => (value: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(value), pause_ms)) 
}

/**
 * @example sf.thru_if( value => value.check_something )( value => { ...do this if true... } )
 *
 * runs fn iff if_fn returns truthy
 * @param if_fn: T => Boolean
 * @param fn: T => T
 *
 * @return fn: (T => Boolean) => (T => T) => (T => T)
 *         a function that takes a value, 
 *         calls if_fn(value) on it, 
 *         if true, returns another function that takes a function and calls it passing the value
 *         if false, returns another function that takes a function but DOESN'T call it, just returns the value
 */
export const thru_if = <T>(if_fn: FnPred<T>) => (fn: FnT2T<T>): FnT2T<T> => {
  return (value: T): T => if_fn(value) 
    ? fn(value) 
    : value
}

/** 
 * runs then_fn iff if_fn returns truthy
 * otherwise runs else_fn.
 * @param if_fn: T => Boolean
 * @param then_fn: T => U
 * @param else_fn: T => U
 * @return fn: (T => Boolean) => (T => U) => (T => U) => (T => U)
 */
export const thru_if_else = <T, U>(if_fn: FnPred<T>) => (then_fn: FnT2U<T, U>) => (else_fn: FnT2U<T, U>): FnT2U<T, U> => {
  return (value: T): U => if_fn(value) 
    ? then_fn(value)
    : else_fn(value)
}

export const thru_ternary = thru_if_else

/**
 * 
 * @param async_if_fn: T => Promise<Boolean>
 * @param then_fn: T => T | Promise<T>
 * @return fn: (T => Promise<Boolean>) => (T => T | Promise<T>) => (T => Promise<T>)
 */
export const thru_async_if = <T>(async_if_fn: FnPredPromise<T>) => (then_fn: FnT2T<T> | FnT2PromiseT<T>): FnT2PromiseT<T> => {
  return (value: T): Promise<T> => Promise.resolve(async_if_fn(value))
    .then(boolValue => !! boolValue ? then_fn(value) : value)
}

// 
// these state transformers aren't used.
//
// // a => (a => s) => M a s  
// export const state_lift = fn => value => [ value, fn(value) ];
// 
// // M a s => ( a => b ) => M b s
// export const state_fmap = fn => ( [ value, state ] ) => [ fn(value, state), state ];
// export const state_thru = state_fmap;
// 
// // M a s => ( a => M b s ) => M b s
// export const state_bind = fn => ( [ value, state ] ) => fn(value, state);
// 
// // M a s => ( a => s' ) => M a (s + s')
// export const state_merge = fn => ( [ value, state ] ) => [ value, { ...state, ...fn( value, state ) } ];
// 
// // M a s => ( a => s' ) => M a s'
// export const state_reduce = fn => ( [ value, state ] ) => [ value, fn( value, state ) ];
// 
// // async state_fmap
// export const state_fmap_wait = fn => ( [ value, state ] ) => Promise.resolve( fn(value, state) ).then( result => [ result, state ] );
// export const state_fmap_wait_all = fn => ( [ value, state ] ) => Promise.all( fn(value, state) ).then( results => [ results, state ] );
// 
// export const state_unlift = fn => ( [ value, state ] ) => fn(value, state);
//

/** 
 * fmap :: (a -> b) -> f a -> f b
 *
 * fmap is written above in curried form. Un-curried it is technically
 * a method that takes two parms: 
 * 1. a functor (f a) 
 * 2. a function (a -> b)
 * fmap "maps" the function a->b over the functor's value.
 *
 * @param fn: T => U - the function to fmap over the list.  
 * @return fn: Array<T> => Array<U> - a function that takes a list, fmaps fn over the list, and returns the new list
 */
export const list_fmap = <T, U>(fn: FnT2U<T, U>): FnT2U<Array<T>, Array<U>> => (list: Array<T>): Array<U> => {
  return _.map(list, fn)
}

/**
 * @param fn: T => U 
 * @return fn: Array<T> => Promise<Array<U>>
 */
export const list_fmap_wait = <T, U>(fn: FnT2U<T, U>): FnT2PromiseU<Array<T>, Array<U>> => (list: Array<T>): Promise<Array<U>> => {
  return Promise.all(_.map(list, fn))
}

/**
 * runs fn iff value is not nil
 * @param fn: T => U 
 * @return fn: T => U | nil
 */
// export const maybe_fmap = <T, U>(fn: FnT2U<T, U>): FnT2U<T, U | nil> => (value: T): U | nil => _.isNil(value) ? value : fn(value)

//
// not used
// /**
//  * given a code and a fn, returns another function, that takes an error, compares the code,
//  * and calls the fn if the err matches the given code.  otherwise throws the err.
//  * useful for chaining .catch()'s
//  * @param code 
//  * @param fn 
//  */
// export const on_error = (code, fn) => err => {
//     if ( err.code == code ) {
//         return fn(err);
//     } else {
//         throw err;
//     }
// };
//

type FnObj2Obj = (object: object) => object;

type FnAny2Obj = (value: any) => object;

export const lens = <T>(path: string, dflt: any = undefined): any => ({
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
     * @param value: any
     * @return fn: (obj:object) => object
     */
  set: (value: any): FnObj2Obj => (obj: object): object => _.set(_.cloneDeep(obj), path, value),

  /**
     * merge is a function that takes a value 
     * and returns a FUNCTION 
     * that takes an obj and MERGES the given value with the existing value in the obj at the lens path, 
     * then returns the object
     * merge: (value) => (obj) => obj'   (where obj' is a COPY of obj with the value merged at the lens path)
     * @param value: any
     */
  merge: (value: any): FnObj2Obj => (obj: object): object => {
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
     * apply: (obj) => (value) => obj'
     * @param obj:object
     * @return fn: any => object
     */
  apply: (obj: object): FnAny2Obj => (value: any): object => _.extend({}, obj, { [path]: value }),
})

/**
 * Like Bluebird.map()
 */
export const promiseMap = <T, K>(list: T[], mapper: (v: T, i: number, a: T[]) => Promise<K>): Promise<K[]> => {
  return Promise.all(list.map(mapper))
}

export function promiseFilter<T>(array: T[], filter: (value: T, index: number, array: T[]) => Promise<boolean>, negate = false): Promise<T[]> {
  return promiseMap(array, filter)
    .then(filterMap => array.filter((_, index) => negate ? !filterMap[index]: filterMap[index]))
}
