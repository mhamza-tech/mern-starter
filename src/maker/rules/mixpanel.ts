import _ from 'lodash'
import { MIXPANEL_TOKEN } from 'src/env'
import Mixpanel from 'mixpanel'
import { on } from 'src/maker/events'
import { LoggerFactory } from 'src/utils/logger'
import { NodeApi, ChatRoomActionContextApi } from '../types'
import { HashtributeId } from 'src/domain/hashtributes'
import { UserStateId } from 'src/domain/userStates'
import { ItemName } from 'src/domain/items'
import { MoveName } from 'src/domain/moves'
import { NPCId } from 'src/domain/npcs'
import { ModifierId } from 'src/domain/modifiers'

export default { setup(): void {
  if (!MIXPANEL_TOKEN) {
    return
  }

  // This is to ensure consistent names and types across events
  interface TrackProps {
    hashtributeId: HashtributeId
    stateId: UserStateId
    itemId: string
    itemName: ItemName
    moveName: MoveName
    modifierId: ModifierId
    npcId: NPCId
    value: number
    delta: number
    level: number
    partnerId: string
    text: string
  }

  const logger = LoggerFactory('mixpanel', 'Mixpanel')
  const mixpanel = Mixpanel.init(MIXPANEL_TOKEN)

  // Helpers
  type Context = NodeApi | ChatRoomActionContextApi

  const getId = (ctx: Context): string | null => {
    const node = 'getId' in ctx ? ctx : ctx.getActor()
    // Ignore tracks not properly filtered, concerning NPCs/ChatRooms
    return node.isUser() ? node.getId() : null
  }

  const track = (event: string, ctx: Context, input: Partial<TrackProps> = {}): void => {
    const id = getId(ctx)
    if (!id) {
      return
    }
    const props = { ...input, distinct_id: id, System: 'BE' }
    if (props.partnerId === props.npcId || props.partnerId === id) {
      delete props.partnerId
    }
    const eventName = `${props.System}: ${event}`
    logger.info('track', eventName, logger.inspect(props))
    mixpanel.track(eventName, _.omitBy(props, _.isNil))
  }

  const set = (ctx: Context, prop: string, value: number | string): void => {
    const id = getId(ctx)
    if (id) {
      logger.info('set', id, prop, value)
      mixpanel.people.set(id, prop, value)
    }
  }

  const increment = (ctx: Context, prop: string, by = 1): void => {
    const id = getId(ctx)
    if (id) {
      logger.info('increment', id, prop, by)
      mixpanel.people.increment(id, prop, by)
    }
  }

  on.hashtribute.increased.spy(({ node, hashtribute, metadata }) => {
    track('Hashtribute: Increased', node, { hashtributeId: hashtribute.id, value: metadata.numberValue, delta: metadata.delta!, level: metadata.level! })
  })

  on.hashtribute.levelUp.spy(({ node, hashtribute, metadata }) => {
    set(node, `#${hashtribute.displayName}`, metadata.level!)
  })

  on.state.increased.spy(({ node, state, input }) => {
    track('State: Increased', node, { stateId: state.id, value: input.numberValue, delta: input.delta })
  })

  on.state.decreased.spy(({ node, state, input }) => {
    track('State: Decreased', node, { stateId: state.id, value: input.numberValue, delta: input.delta })
  })

  on.item.given.spy(({ node, instance, to, item }) => {
    track('Item: Given', node, { partnerId: to.getId(), itemName: item.name, itemId: instance.id })
  })

  // NOTE: for some we, technically, subscribe to the pre-event so we track without waiting for all the promises
  on.item.using.spy(({ api, item, npc, modifier }) => {
    track('Item: Used', api, { partnerId: api.getPartner().getId(), itemName: item.name, npcId: npc?.id, modifierId: modifier?.id })
    if (modifier) {
      increment(api, `items.${item.name}.${modifier.id}`)
    }
  })

  on.move.triggering.spy(({ api, move, npc, modifier }) => {
    track('Move: Triggered', api, { partnerId: api.getPartner().getId(), moveName: move.name, npcId: npc?.id, modifierId: modifier?.id })
    if (modifier) {
      increment(api, `moves.${move.name}.${modifier.id}`)
    }
  })

  on.room.entered.spy(({ api, npc }) => {
    track('Chat Room: Entered', api, { partnerId: api.getPartner().getId(), npcId: npc?.id })
  })

  on.npc.session.started.spy(({ api, npc }) => {
    track('NPC Session: Started', api, { npcId: npc?.id })
  })

  on.npc.session.reset.spy(({ api, npc }) => {
    track('NPC Session: Reset', api, { npcId: npc?.id })
  })

  on.npc.session.succeeded.spy(({ api, npc, item }) => {
    track('NPC Session: Succeeded', api, { itemName: item?.name, npcId: npc?.id })
    increment(api, `sessions.${npc?.id}.succeeded`)
    if (item) {
      increment(api, `awarded.${item.name}`)
    }
  })

  on.npc.session.failed.spy(({ api, npc, item }) => {
    track('NPC Session: Failed', api, { itemName: item?.name, npcId: npc?.id })
    increment(api, `sessions.${npc?.id}.failed`)
    if (item) {
      increment(api, `awarded.${item.name}`)
    }
  })

  on.npc.message.sent.spy(({ node, from, text }) => {
    track('NPC: Message Sent', node, { npcId: from.getId() as NPCId, text })
  })

  on.notification.tagged.sent.spy(({ node, text }) => {
    track('Notification: Sent', node, { text })
  })

  on.user.created.spy(({ node }) => {
    track('User: Created', node)
    // mixpanel.people.set() is already being called by the FE
  })

  on.user.connected.spy(({ node }) => {
    track('User: Connected', node)
  })

  on.user.disconnected.spy(({ node }) => {
    track('User: Disconnected', node)
  })
}}
