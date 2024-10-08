import { PubSub } from 'apollo-server'
import * as ROOT_EVENTS from '../Root/subscription'

export const EVENTS = {
  ROOT: ROOT_EVENTS,
}

const pubsub = new PubSub()
export default pubsub

export const startHeartbeat = (): void => {
  setInterval(() => {
    pubsub.publish(EVENTS.ROOT.NEW_HEARTBEAT, {
      newHeartbeat: `${Date().toString()}`,
    })
  }, 5000)
}

import resolvers from './sub.resolvers'
import types from './sub.type'
export { 
  resolvers, 
  types,
}
