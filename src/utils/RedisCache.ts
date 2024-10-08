import _ from 'lodash'
import { IHandyRedis } from 'handy-redis'
import { sft } from 'src/utils'
import { Redis } from 'src/services/redis'
import { LoggerFactory } from 'src/utils/logger'
import { compact } from 'src/utils/misc'

export enum CacheType {
  HashSet = 'HashSet',
  HashSetGetAll = 'HashSetGetAll',
  JSONObject = 'JSONObject',
  Set = 'Set',
  String = 'String'
}

export class RedisCache<T> {

  logger: any
  cache: IHandyRedis
  name: string
  expiresIn: number
  type: CacheType
  buildKey: (key: any) => string
  parseDBKey: (key: any) => any
  pickKey: (val: any) => any
  buildFullKey: (key: any) => string
  buildValue: (val: any) => any
  matchingValue: (val: any) => string
  parseValue: (val: any) => any
  fetchFromDB: (key: any[], dbOptions?: any) => Promise<T[]>
  onSet: (val: any) => any
  otherCache: RedisCache<T>
  otherCacheKey: (key: any) => any

  constructor({
    fetchFromDB,
    name,
    expiresIn = -1,
    type = CacheType.String,
    buildKey = (key: any): string => key,
    parseDBKey = (key: any): any => key,
    pickKey = (val: any): any => val['id'],
    buildFullKey = (key: any): any => this.buildKey(key),
    buildValue = (val: any): any =>
      this.type === CacheType.HashSet ? JSON.stringify(val) : val,
    matchingValue = (val: any): any =>
      this.type === CacheType.Set ? '*' : val,
    parseValue = (val: any): any =>
      this.type === CacheType.HashSet ? JSON.parse(val) : val,
    onSet = (val: any): any => val,
    otherCache = null,
    otherCacheKey = (key: any): any => key,
  }) {
    this.fetchFromDB = fetchFromDB
    this.name = name
    this.expiresIn = expiresIn
    this.type = type
    this.buildKey = buildKey
    this.parseDBKey = parseDBKey
    this.pickKey = pickKey
    this.buildFullKey = buildFullKey
    this.buildValue = buildValue
    this.matchingValue = matchingValue
    this.parseValue = parseValue
    this.onSet = onSet
    this.otherCache = otherCache
    this.otherCacheKey = otherCacheKey
    this.cache = Redis.getInstance().getClient()
    this.logger = LoggerFactory(name, 'Cache')
  }

  private returnsArray = (): boolean => {
    return this.type === CacheType.Set ||
      this.type === CacheType.HashSetGetAll
  }
  
  private validValue = (value: any): boolean => !_.isEmpty(value)

  private mapDBValues = (values: T[], mapKeys: string[]): any => {
    if (!this.returnsArray()) {
      return values.reduce((acc, v) => {
        const key = this.buildFullKey(this.pickKey(v))
        return {
          ...acc,
          [key]: v,
        }
      }, {})
    }

    return mapKeys.reduce((acc, key) => {
      return {
        ...acc,
        [key]: values.filter(v => {
          const k = this.buildFullKey(this.pickKey(v))
          return k === key
        }),
      }
    }, {})
  }

  private scan = (key: string, cursor: number, pattern: string): Promise<T[]> => {
    return this.cache.sscan(key, cursor, ['MATCH', pattern], ['COUNT', 100])
      .then(v => {
        cursor = +v[0]
        const values = v[1].map(this.parseValue)
        if (cursor === 0) {
          return values
        }
        return this.scan(key, cursor, pattern)
          .then(v => values.concat(v))
      })
  }

  private readValues = (keys: any[]): Promise<any> => {
    const compact = (values: any): any =>
      values.reduce((acc: any, val: any) => Object.assign({}, acc, val), {})

    const loadOtherCache = (v: any, key: any): any => {
      if (!_.isEmpty(v) || _.isNil(this.otherCache)) {
        return null
      }
      const k = this.otherCacheKey(key)
      return this.otherCache.loadMany([k])
    }

    if (this.type === CacheType.HashSet) {
      const strKey = this.buildKey(keys[0])
      const filterKeys = keys.map(this.matchingValue)
      return this.cache.hmget(strKey, ...filterKeys)
        .then(sft.tap_wait(v => loadOtherCache(v, keys[0])))
        .then(values => values.map((v, i) => {
          const sk = this.buildFullKey(keys[i])
          return _.isNil(v)
            ? ({ [sk]: null })
            : ({ [sk]: this.parseValue(v) })
        }))
        .then(values => compact(values))
    }

    return Promise.all(keys.map(key => {
      const strKey = this.buildKey(key)
      switch (this.type) {
        case CacheType.HashSetGetAll:
          return this.cache.hgetall(strKey)
            .then(sft.tap_wait(v => loadOtherCache(v, key)))
            .then(v => _.isNil(v)
              ? []
              : Object.keys(v).map(k => this.parseValue(v[k]))
            )
            .then(v => ({ [strKey]: v }))

        case CacheType.Set:
          const pattern = this.matchingValue(key)
          const mk = this.buildFullKey(key)
          return this.scan(strKey, 0, pattern)
            .then(sft.tap_wait(v => loadOtherCache(v, key)))
            .then(v => ({ [mk]: v }))

        case CacheType.JSONObject:
          return this.cache.get(strKey)
            .then(v => ({ [strKey]: this.parseValue(JSON.parse(v)) }))

        default:
          return this.cache.get(strKey)
            .then(v => _.isNil(v)
              ? ({ [strKey]: null })
              : ({ [strKey]: this.parseValue(v) })
            )
      }
    }))
      .then(values => compact(values))
  }

  private toArray = (value: T): T|T[] =>
    !this.returnsArray() ? value : [value]

  private keyFromValue = (value: T|T[]): { key: any; strKey: string } => {
    const key = !this.returnsArray()
      ? this.pickKey(value)
      : this.pickKey(value[0])
    const strKey = this.buildKey(key)
    return { key, strKey }
  }

  private set = (value: any): Promise<any> => {
    const { key, strKey } = this.keyFromValue(value)
    switch (this.type) {
      case CacheType.HashSet:
        return this.cache.hset(strKey, this.matchingValue(key), this.buildValue(value))
      case CacheType.HashSetGetAll:
        return sft.promiseMap(
          value, 
          v => this.cache.hset(strKey, this.matchingValue(v), this.buildValue(v))
        )
      case CacheType.Set:
        const values = value.map(this.buildValue)
        return this.cache.sadd(strKey, ...values)
      case CacheType.JSONObject:
        const jsonObject = JSON.stringify(this.buildValue(value))
        return this.cache.set(strKey, jsonObject)
      default:
        return this.cache.set(strKey, this.buildValue(value))
    }
  }

  public load = (key: any, dbOptions?: any): Promise<T | T[]> => {
    return this.loadMany([key], dbOptions)
      .then(values => values[0])
  }

  public loadMany = (keys: any[], dbOptions?: any): Promise<T[]> => {
    // additional db options should be same for all keys
    const dbOpts = keys[0].dbOptions || dbOptions
    const uniqueKeys = new Set<string>()
    const cleanKeys = compact(keys.map(k => {
      const fk = this.buildFullKey(k)
      if (!uniqueKeys.has(fk)) {
        uniqueKeys.add(fk)
        return k
      }
    }))
    const mapKeys = compact(keys.map(this.buildFullKey))

    return this.readValues(cleanKeys)
      .then(cachedValuesMap => {
        const undefStrKeys = compact(Object.keys(cachedValuesMap)
          .map(key => this.validValue(cachedValuesMap[key])
            ? null
            : key
          )
        )
        this.logger.debug('loadMany', { cleanKeys, cachedValuesMap, undefStrKeys })
        const parsedUndefKeys = cleanKeys
          .filter(key => undefStrKeys.includes(this.buildFullKey(key)))
          .map(this.parseDBKey)
        return Promise.resolve(_.isEmpty(parsedUndefKeys)
          ? []
          : this.fetchFromDB(parsedUndefKeys, dbOpts)
        )
          .then(compact)
          .then(rows => this.mapDBValues(rows, Array.from(uniqueKeys)))
          .then(valuesMap => sft.promiseMap(Object.values(valuesMap), this.setAndOnSet)
            .then(() => valuesMap)
          )
          .then(valuesMap => !this.returnsArray()
            ? Object.assign({}, cachedValuesMap, valuesMap)
            : Object.keys(valuesMap).reduce((acc, k) => {
              const values = [
                ...valuesMap[k],
                ...cachedValuesMap[k],
              ]
              return {
                ...acc,
                [k]: values,
              }
            }, {}),
          )
          .then(valuesMap => mapKeys.map(k => valuesMap[k]))
      })
  }

  private setExpiry = (key: string): Promise<number> => {
    return this.cache.ttl(key)
      .then(ttl => ttl === -1 && this.expiresIn !== -1
        ? this.cache.expire(key, this.expiresIn)
        : this.expiresIn
      )
  }

  public setAndOnSet = (values: any): Promise<any> => {
    let value = values

    // do not add deleted values to cache
    if (_.isArray(values)) {
      value = value.filter(v => !v?.isDeleted)
    }

    // do not add empty and deleted values to cache
    if (!this.validValue(value) || (!_.isArray(values) && value['isDeleted'] === true)) {
      return Promise.resolve(value)
    }

    return Promise.all([
      this.set(value)
        .then(() => this.setExpiry(this.keyFromValue(value).strKey)),
      this.onSet(value),
    ])
  }

  /**
   * Writes to database immediately and then writes to cache
   *
   * @param updateFn - updates source-of-truth and returns a promise w/ updated value
   * @return a function wrapped around the updateFn (like a decorator). it takes the
   *         partial update to pass to updateFn.
   */
  public writeThru = (
    updateFn = (partial: T): Promise<T> => Promise.resolve(partial)
  ): (partial: T) => Promise<T> => {
    return (partial: T): Promise<T> => {
      // 1) do not write to cache when value is marked as deleted
      // 2) remove the existing item from the cache if any
      // 3) call `onSet` to invoke `prime` on other caches
      //    to remove it from there as well if any
      if (partial['isDeleted'] === true) {
        return updateFn(partial)
          .then(value => Promise.all([
            this.remove(value),
            this.onSet(this.toArray(value)),
          ])
            .then(() => value)
          )
      }

      // Here, we are refreshing cache value for
      // type SET to sync latest db data with cache.
      // This data sync issue can happen when there
      // is a write thur call before the db data is read.
      // Because we have one key to many values, a write thru
      // call will add a value to cache and db values
      // won't be read in the subsequent calls to cache
      const updateAndAdd = (): Promise<T> => {
        return updateFn(partial)
          .then(value => {
            const k = this.pickKey(value)
            this.logger.debug('writeThru: not cached', { k, value })
            if (!this.returnsArray()) {
              return this.setAndOnSet(value)
                .then(() => value)
            }
            return this.loadMany([k])
              .then(() => value)
          })
      }

      const key = this.pickKey(partial)
      if (!key) {
        return updateAndAdd()
      }

      const mapKey = this.buildFullKey(key)
      return this.readValues([key])
        .then(cachedValueMap => {
          if (!this.validValue(cachedValueMap[mapKey])) {
            return updateAndAdd()
          }
          return updateFn(partial)
            .then(value => this.setAndOnSet(this.toArray(value))
              .then(() => value)
            )
        })
    }
  }

  /**
   * When type is Set/HashSet, remove existing value.
   * Otherwise remove the key
   *
   * @param value
   */
  public remove = (value: any): Promise<any> => {
    let key = this.pickKey(value)
    const strKey = this.buildKey(key)
    if (this.type === CacheType.JSONObject || this.type === CacheType.String) {
      return this.cache.del(strKey)
    }
    if (this.type === CacheType.HashSet) {
      if (!_.isString(key)) {
        key = this.matchingValue(key)
      }
      return this.cache.hdel(strKey, key)
    }
    if (this.type === CacheType.HashSetGetAll) {
      return this.cache.hdel(strKey, this.matchingValue(value))
    }
    const cacheValue = this.buildValue(value)
    return this.cache.srem(strKey, cacheValue)
  }

  public invalidate = (key: any): Promise<any> => {
    return this.invalidateMany([key])
  }

  public invalidateMany = (keys: any[]): Promise<any> => {
    const strKeys = keys.map(key => this.buildKey(this.pickKey(key)))
    return this.cache.del(...strKeys)
  }

  /**
   * Cache the given value - provided by another cache instance
   * When value is marked as deleted, remove from cache if any
   * and call `onSet` to invoke `prime` on all other dependent
   * cache instances
   *
   * @param value
   */
  public prime = (value: T): Promise<T> => {
    if (value['isDeleted'] === true) {
      return Promise.all([
        this.remove(value),
        this.onSet(this.toArray(value)),
      ])
        .then(() => value)
    }
    return this.setAndOnSet(this.toArray(value))
      .then(() => value)
  }

}
