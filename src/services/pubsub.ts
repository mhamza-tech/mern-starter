/**
 * @rob4lderman
 * oct2019
 * 
 */
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { Redis } from './redis'

export const redisPubSub = new RedisPubSub({
  publisher: Redis.getInstance().getClient().redis as any,
  subscriber: Redis.createClient().redis as any, // we need a second client for subscriptions
})
