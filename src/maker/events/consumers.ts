import { events } from 'src/events'
import { NAME as reset } from 'src/maker/reactions/action.debug.reset'
import { addContextApi, fromNPC, hasSender, enforceSender, actionIsAnItem, addItemFromApi, addItemFromInstance, actionIsAMove, addMoveFromApi, addNodeAndApiForUser, addNPCFromApi, addModifierFromTarget, isTransfer } from './middlewares'

/**
 * These are all the observables that consumers can subscribe to
 */

const onHashtributeChanged = events.hashtribute.increased.map(addContextApi)
export const hashtribute = {
  // A hashtribute increased in value, fires whether it levelled up or not
  increased: onHashtributeChanged,
  // A hashtribute increased in value and reached a new level
  levelUp: onHashtributeChanged.and(({ metadata }) => metadata.numberValue - metadata.delta < metadata.thisLevelThreshold),
}

const onStateChanged = events.state.changed.map(addContextApi)
export const state = {
  // A user state changed in value, in any direction (also fires for decay)
  changed: onStateChanged,
  // Same as changed but only if the value if 0 (user state deleted)
  cleared: onStateChanged.and(({ input }) => input.numberValue === 0),
  // Same as changed but only if it increased
  increased: onStateChanged.and(({ input }) => input.delta > 0),
  // Same as changed but only if it decreased
  decreased: onStateChanged.and(({ input }) => input.delta < 0),
}

const onItemTransferred = events.item.transferred.map(addItemFromInstance).map(addNPCFromApi)
const onActionReceiving = events.room.action.receiving.map(addNPCFromApi).map(addModifierFromTarget)
const onActionReceived = events.room.action.received.map(addNPCFromApi).map(addModifierFromTarget)
const onItemUsing = onActionReceiving.and(actionIsAnItem).map(addItemFromApi)

export const item = {
  // An item was created into someone's inventory
  created: events.item.created.map(addItemFromInstance),
  // An "intent" to transfer, fired for any room action that uses the "give" drop zone or a modifier with operation=Transfer
  // TODO: Maybe delete this event, use onItemUsing with the filter directly
  transferring: onItemUsing.and(isTransfer),
  // An item was actually transferred from one inventory to another
  transferred: onItemTransferred,
  // An item was destroyed forever from someone's inventory
  destroyed: events.item.destroyed.map(addItemFromInstance),
  // An actual item was transferred and both the giver and recipient are users
  given: onItemTransferred.and(({ node, to }) => node.isUser() && to.isUser()),
  // An actual item was transferred and the recipient is a ChatRoom (so given to an NPC)
  deposited: onItemTransferred.and(({ to }) => to.isChatRoom()),
  // An actual item was transferred back to the user from a ChatRoom
  withdrawn: onItemTransferred.and(({ node }) => node.isChatRoom()),
  // A room action that is an item is being received from a user and not via the "give" drop zone
  // NOTE: This one is used to decide whether the "use" drop zone should be shown for backpack actions (items)
  using: onItemUsing.and(({ api }) => !api.isGiveTarget()),
  // A room action that is an item was sent by the user and not via the "give" drop zone, won't affect the "use" drop zone
  used: onActionReceived.and(({ api }) => !api.isGiveTarget()).and(actionIsAnItem).map(addItemFromApi),
  // TODO: Do we want these 2 to fire for "NPC" inventories? currently they do
  // An item entered an inventory, either via item.created or item.transferred (in)
  added: events.item.transferred.map(({ api, instance, to }) => ({ api, node: to, instance })).or(events.item.created).map(addItemFromInstance),
  // An item exited an inventory, either via item.destroyed or item.transferred (out)
  removed: events.item.destroyed.or(events.item.transferred).map(addItemFromInstance),
  // An item has expired
  expired: events.item.expired.map(addItemFromInstance).map(addContextApi),
}

export const room = {
  // An onEnter is about to be handled
  entering: events.room.entering.map(addNPCFromApi),
  // An onEnter was just handled
  entered: events.room.entered.map(addNPCFromApi),
  // The reset room action is being received
  resetting: onActionReceiving.and(({ api }) => api.getCurrentActionName() === reset),
  // Any room action is being handled (item, move, job or anything)
  action: { receiving: onActionReceiving },
}

export const move = {
  // A move is being triggered, meaning an action that is not an item or a job. If the give drop zone is used, this won't fire
  // NOTE: This one is used to decide whether the "use" drop zone should be shown for static actions (moves)
  triggering: onActionReceiving.and(actionIsAMove).map(addMoveFromApi),
  // A room action that is a move was sent by the user, won't affect the "use" drop zone
  triggered: onActionReceived.and(actionIsAMove).map(addMoveFromApi),
}

const onJobExecuted = onActionReceived.and(({ api }) => api.isJobAction()).map((data) => ({ ...data, args: data.api.getCurrentAction()?.args || {} }))

export const job = {
  // A job of any kind was just executed
  executed: onJobExecuted,
  // A job just executed and it includes a jobNode (which is mapped to `node`)
  onNode: { executed: onJobExecuted.and(({ api }) => !!api.getJobNode()).map((data) => ({ ...data, node: data.api.getJobNode()! }))},
}

const onSessionCompleted = events.npc.session.completed.map(addNPCFromApi)

export const npc = {
  session: {
    // an NPC session is starting, means different situations depending on the NPC
    started: events.npc.session.started.map(addNPCFromApi),
    // an NPC session was reset, meaning it starts over
    reset: events.npc.session.reset.map(addNPCFromApi),
    // an NPC session just completed, either successfully or otherwise
    completed: onSessionCompleted,
    // an NPC session just completed and it was successful
    succeeded: onSessionCompleted.and(({ success }) => success),
    // an NPC session just completed and it was not successful
    failed: onSessionCompleted.and(({ success }) => !success),
  },
  // NodeApi.sendMessage() was used with tags, `from` was an NPC and the tags matched a string
  tagged: { message: { sent: events.message.tagged.sent.and(hasSender).map(enforceSender).and(fromNPC) } },
  // NodeApi.sendMessage() was used, `from` was an NPC and the string is not falsy
  message: { sent: events.message.sent.and(hasSender).map(enforceSender).and(fromNPC) },
}

export const user = {
  // A new account was just created
  created: events.user.created.map(addNodeAndApiForUser),
  // A user just opened the app
  connected: events.user.connected.map(addNodeAndApiForUser),
  // A user just closed the app
  disconnected: events.user.disconnected.map(addNodeAndApiForUser),
}

export const notification = {
  // NodeApi.sendTaggedNotification() was used and the tags matched a string
  tagged: { sent: events.notification.tagged.sent },
}

const onCounterChanged = events.field.saved.and(({ field }) => !field.isDeleted && field.collectionName === 'counters')

export const counter = {
  // A counter Field was saved (created or updated) and not deleted
  changed: onCounterChanged,
  // A counter changed with a positive delta
  increased: onCounterChanged.and(({ field }) => field.metadata.delta > 0),
}
