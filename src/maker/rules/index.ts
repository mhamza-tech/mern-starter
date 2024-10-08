import * as models from 'src/graphql/models'
import { on } from 'src/maker/events'
import testRules from './test'
import mixpanel from './mixpanel'
import { isP2P, ownerIsNotCreator, isUserRoom, notBeatNPC, hasNoModifier } from './helpers'
import { StringTags } from 'src/domain/strings'
import jeff from './jeff'
import { LoggerFactory, LoggerContext } from 'src/utils/logger'
import { VState, setVState } from '../vstate'
import vstates from '../vstate/states'
import { HandlebarsValues } from '../types'
import { DynamicFeedItemLayout, FeedItemActionEntityType, FeedItemActionType } from 'src/gql-types'
import { lookupString } from '../strings'

const setup = (): void => {
  const logger = LoggerFactory('index', 'Rules')
  // Not technically needed since they will be silenced but don't register them pointlessly
  if (logger.enabledContexts().includes(LoggerContext.Rules)) {
    testRules.setup()
  }
  mixpanel.setup()

  // This is the rule that turns transferring -> transferred in P2P
  on.item.transferring.and(isP2P).do(({ api, item }) => (
    api.getActor().transferActionInstance({
      actionName: item.name,
      transferToPlayerEid: api.getPartner().getEid(),
    })
  ))

  // This is the rule that makes item consumable by definition on M2M & P2P when no modifier is used
  on.item.used.and(isUserRoom).and(hasNoModifier).do(({ api, item }) => (
    api.getActor().deleteActionInstance({ actionName: item.name })
  ))

  // When an item is used with a modifier that destroys, the item is destroyed
  on.item.used.and(({ modifier }) => modifier?.operation === 'Destroy').do(({ api, item }) => (
    api.getActor().deleteActionInstance({ actionName: item.name })
  ))

  // JT disabling temprarily until we better figure thisone out.
  // on.item.given.and(ownerIsCreator).and(itemIsCrafted).do(({ node }) => (
  //   // We give an extra authentic here cause they are truly nice for crafting and giving
  //   incHashtribute(node, 'authentic_41')
  // ))

  // Sends the Maker of the item a notification that someone has used their item.Gives them a warm and fuzzy feeling
  on.item.destroyed.and(ownerIsNotCreator).do(async ({ api, instance, node, item }) => {
    const creator = await api.getByEid(instance.creatorEid)
    if (!creator) return

    const isFriended = await node.isFriendedBy(creator)
    if (!isFriended) return

    const tags: StringTags = ['onitemused', 'target_creator', api.isSelfChatRoom() ? 'm2m' : 'p2p']
    return creator.sendTaggedNotification(tags, [item.name], { item })
  })

  // Sends the last giver of an item a notification that someone has used their item. Gives them a warm and fuzzy feeling
  on.item.destroyed.do(async ({ api, instance, item }) => {
    const { lastGiverEid } = instance
    // Don't notify NPCs and skip if giver is creator to avoid double notification
    if (!lastGiverEid || lastGiverEid === instance.creatorEid || !models.isUserEid(lastGiverEid)) {
      return
    }
    const giver = await api.getByEid(lastGiverEid)
    if (giver) {
      const tags: StringTags = ['onitemused', 'target_giver', api.isSelfChatRoom() ? 'm2m' : 'p2p']
      return giver.sendTaggedNotification(tags, [item.name], { item })
    }
  })

  on.item.transferred.and(isP2P).do(({ api, item }) => {
    const tags: StringTags = ['p2p', 'onitemtransferred']
    // We include the item name as an optional tag so we can add custom messages to override the default
    const optional: StringTags = [item.name]
    const values: HandlebarsValues = { item: item }
    const actor = api.getActor()
    return Promise.all([
      actor.sendMessage({ tags: [...tags, 'target_actor'], optional, values }),
      api.getPartner().sendMessage({ tags: [...tags, 'target_partner'], optional, values, from: actor }),
      // incUserState(actor, 'deity_841', 20),
      // incHashtribute(actor, 'authentic_41'),
    ])
  })

  on.item.given.and(isP2P).do(({ api, item }) => {
    const actor = api.getActor()
    const partner = api.getPartner()
    return api.saveNewsfeedItem({
      userId: partner.getId(),
      fromEid: partner.getEid(),
      layout: DynamicFeedItemLayout.Dynamic1,
      rateId: `give.${item.name}.${actor.getId()}.${partner.getId()}`,
      rateLimit: { days: 1 },
      context: { itemName: item.name },
      metadata: {
        statusText: lookupString(['news', 'onitemtransferred', 'target_partner', 'p2p'], [item.name]),
        backgroundColor: item.backgroundColor,
        image: { s3Key: item.s3Key },
        title: item.text,
        description: item.description,
        insetPlayerEid: actor.getEid(),
        action: {
          entityId: item.name,
          entityType: FeedItemActionEntityType.Item,
          type: FeedItemActionType.Backpack,
        },
      },
    })
  })

  // Automatically use Moves' VStates, use the pre event with spy so it runs right away
  on.move.triggering.and(notBeatNPC).and(hasNoModifier).spy(({ api, move }) => {
    const list: VState[] = [move.effectVState]
    if (move.buffVState) {
      list.push(move.buffVState, vstates.clearAction)
    }
    return setVState(api.getActor(), list, true)
  })

  // Automatically use Items' VStates (on P2P and M2M)
  on.item.using.and(isUserRoom)
    .and(({ item }) => !!item.effectVState).and(hasNoModifier)
    .spy(({ api, item }) => setVState(api.getActor(), item.effectVState!, true))

  jeff.setup()
  // Since it's now import async, log to see that they ran
  logger.info('Rules imported and bound')
}

export default { setup }
