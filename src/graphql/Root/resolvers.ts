import pubsub, { EVENTS } from '../subscription'

export default {
  Query: {
    ready: async (): Promise<string> => {
      return 'OK'
    },
  },
  Subscription: {
    newHeartbeat: {
      subscribe: (): AsyncIterator<unknown, any, undefined> => pubsub.asyncIterator(EVENTS.ROOT.NEW_HEARTBEAT),
    },
  },
}
