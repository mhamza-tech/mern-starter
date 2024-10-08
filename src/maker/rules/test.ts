import { inspect } from 'util'
import { on } from 'src/maker/events'
import { LoggerFactory } from 'src/utils/logger'

/**
 * These are rules to log the output of all events, not normally mapped
 */

const setup = (): void => {
  const logger = LoggerFactory('test', 'Rules')
  const json = (data: any): string => inspect(data, { compact: true, colors: true, depth: null, breakLength: Infinity })
  const keys = (data: any): string => `{ ${Object.keys(data || {}).join(', ')} }`

  on.hashtribute.increased.spy(({ api, node, hashtribute, metadata }) => {
    logger.info('[hashtribute.increased]', node.getName(), hashtribute.displayName, metadata.numberValue, metadata.delta, api.getVersion())
  })

  on.hashtribute.levelUp.spy(({ node, hashtribute, metadata }) => (
    logger.info('[hashtribute.levelUp]', node.getName(), hashtribute.displayName, metadata.level)
  ))

  on.state.changed.spy(({ api, node, state, input }) => {
    logger.info('[state.changed]', node.getName(), state.displayName, json(input), api.getVersion())
  })

  on.state.cleared.spy(({ node, state, input }) => {
    logger.info('[state.cleared]', node.getName(), state.displayName, json(input))
  })

  on.state.increased.spy(({ node, state, input }) => {
    logger.info('[state.increased]', node.getName(), state.displayName, json(input))
  })

  on.state.decreased.spy(({ node, state, input }) => {
    logger.info('[state.decreased]', node.getName(), state.displayName, json(input))
  })

  on.item.created.spy(({ node, instance, item }) => {
    logger.info('[item.created]', node.getName(), instance.actionName, item.text)
  })

  on.item.destroyed.spy(({ node, instance, item }) => {
    logger.info('[item.destroyed]', node.getName(), instance.actionName, item.text)
  })

  on.item.transferring.spy(({ api, npc, item, modifier }) => {
    logger.info('[item.transferring]', api.getActor().getName(), item.name, api.getPartner().getName(), modifier?.id, npc?.id)
  })

  on.item.transferred.spy(({ node, instance, to, npc }) => {
    logger.info('[item.transferred]', node.getName(), instance.actionName, to.getName(), npc?.id)
  })

  on.item.given.spy(({ node, instance, to, item, npc }) => {
    logger.info('[item.given]', node.getName(), instance.actionName, to.getName(), item.text, npc?.id)
  })

  on.item.deposited.spy(({ node, instance, to, item, npc }) => {
    logger.info('[item.deposited]', node.getName(), instance.actionName, to.getName(), item.text, npc?.id)
  })

  on.item.withdrawn.spy(({ node, instance, to, item, npc }) => {
    logger.info('[item.withdrawn]', node.getName(), instance.actionName, to.getName(), item.text, npc?.id)
  })

  on.item.using.spy(({ api, item, npc, modifier }) => {
    logger.info('[item.using]', api.getActor().getName(), item.text, api.getPartner().getName(), npc?.id, modifier?.id)
  })

  on.item.used.spy(({ api, item, npc, modifier }) => {
    logger.info('[item.used]', api.getActor().getName(), item.text, api.getPartner().getName(), npc?.id, modifier?.id)
  })

  on.item.added.spy(({ node, instance, item }) => {
    logger.info('[item.added]', node.getName(), instance.actionName, item.text)
  })

  on.item.removed.spy(({ node, instance, item }) => {
    logger.info('[item.removed]', node.getName(), instance.actionName, item.text)
  })

  on.item.expired.spy(({ node, instance, item }) => {
    logger.info('[item.expired]', node.getName(), instance.actionName, item.text)
  })

  on.room.entered.spy(({ api, npc }) => {
    logger.info('[room.entered]', api.getActor().getName(), api.getPartner().getName(), api.getChatRoom().getId(), npc?.id)
  })

  on.room.entering.spy(({ api, npc }) => {
    logger.info('[room.entering]', api.getActor().getName(), api.getPartner().getName(), api.getChatRoom().getId(), npc?.id)
  })

  on.room.action.receiving.spy(({ api, npc, modifier }) => {
    logger.info('[room.action.receiving]', api.getActor().getName(), api.getCurrentActionName(), api.getPartner().getName(), npc?.id, modifier?.id)
  })

  on.room.resetting.spy(({ api, npc }) => {
    logger.info('[room.resetting]', api.getActor().getName(), api.getPartner().getName(), npc?.id)
  })

  on.move.triggering.spy(({ api, move, npc, modifier }) => {
    logger.info('[move.triggering]', api.getActor().getName(), move.text, api.getPartner().getName(), npc?.id, modifier?.id)
  })

  on.move.triggered.spy(({ api, move, npc, modifier }) => {
    logger.info('[move.triggered]', api.getActor().getName(), move.text, api.getPartner().getName(), npc?.id, modifier?.id)
  })

  on.job.executed.spy(({ api, args, npc }) => {
    logger.info('[job.executed]', api.getActor().getName(), api.getCurrentActionName(), json(args), npc?.id)
  })

  on.job.onNode.executed.spy(({ api, args, node, npc }) => {
    logger.info('[job.onNode.executed]', api.getActor().getName(), api.getCurrentActionName(), node.getName(), json(args), npc?.id)
  })

  on.npc.session.started.spy(({ api, npc }) => {
    logger.info('[npc.session.started]', api.getActor().getName(), api.getUnObject().getName(), npc?.id, npc?.hashtribute?.displayName)
  })

  on.npc.session.reset.spy(({ api, npc }) => {
    logger.info('[npc.session.reset]', api.getActor().getName(), api.getUnObject().getName(), npc?.id, npc?.hashtribute?.displayName)
  })

  on.npc.session.completed.spy(({ api, success, npc, item }) => {
    logger.info('[npc.session.completed]', api.getActor().getName(), api.getUnObject().getName(), success, npc?.id, npc?.hashtribute?.displayName, item?.name)
  })

  on.npc.session.succeeded.spy(({ api, npc, item }) => {
    logger.info('[npc.session.succeeded]', api.getActor().getName(), api.getUnObject().getName(), npc?.id, npc?.hashtribute?.displayName, item?.name)
  })

  on.npc.session.failed.spy(({ api, npc, item }) => {
    logger.info('[npc.session.failed]', api.getActor().getName(), api.getUnObject().getName(), npc?.id, npc?.hashtribute?.displayName, item?.name)
  })

  on.npc.message.sent.spy(({ api, node, from, text, values }) => {
    logger.info('[npc.message.sent]', node.getName(), from.getName(), text, api.getVersion(), keys(values))
  })

  on.npc.tagged.message.sent.spy(({ api, node, from, tags, optional, values, text }) => {
    logger.info('[npc.tagged.message.sent]', node.getName(), from.getName(), json(tags), json(optional), api.getVersion(), keys(values), text)
  })

  on.notification.tagged.sent.spy(({ api, node, tags, optional, values, text }) => {
    logger.info('[notification.tagged.sent]', node.getName(), json(tags), json(optional), api.getVersion(), keys(values), text)
  })

  on.user.connected.spy(({ user, node, api }) => {
    logger.info('[user.connected]', user.id, node.getName(), api.getVersion())
  })
  
  on.user.created.spy(({ user, node, api }) => {
    logger.info('[user.created]', user.id, node.getName(), api.getVersion())
  })

  on.user.disconnected.spy(({ user, node, api }) => {
    logger.info('[user.disconnected]', user.id, node.getName(), api.getVersion())
  })

  on.counter.changed.spy(({ api, node, field }) => {
    logger.info('[counter.changed]', node.getName(), field.name, json(field.metadata), field.scope, api.getVersion())
  })

  on.counter.increased.spy(({ api, node, field }) => {
    logger.info('[counter.increased]', node.getName(), field.name, json(field.metadata), field.scope, api.getVersion())
  })
}

export default { setup }
