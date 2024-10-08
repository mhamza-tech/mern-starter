import {
  createHandyClient,
  IHandyRedis,
} from 'handy-redis'
import {
  REDIS_HOST,
  REDIS_PORT,
} from '../env'
import { EntityType } from 'src/gql-types'

export const USER_PRESENCE_CACHE_KEY = `${EntityType.User}:online`

export class Redis {

  private static instance: Redis
  private client: IHandyRedis

  private constructor() { }

  static getInstance(): Redis {
    if (!Redis.instance) {
      Redis.instance = new Redis().connect()
    }
    return Redis.instance
  }

  private connect(): Redis {
    this.client = Redis.createClient()
    return this
  }

  static createClient(): IHandyRedis {
    return createHandyClient({
      host: REDIS_HOST,
      port: parseInt(REDIS_PORT),
    })
  }

  getClient(): IHandyRedis {
    return this.client
  }

  // Do not delete Queues
  flush(): Promise<number> {
    return this.client
      .keys('[^Queue:]*')
      .then(keys => keys.length
        ? this.client.del(...keys)
        : Promise.resolve(0)
      )
  }

}
