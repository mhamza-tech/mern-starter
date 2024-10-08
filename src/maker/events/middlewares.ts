import { ActionXInstance, User } from 'src/db/entity'
import { NodeApi, ChatRoomActionContextApi, ActionContextType } from 'src/types'
import { items, Item } from 'src/domain/items'
import { moves, Move } from 'src/domain/moves'
import { ChatRoomActionContextApiFactory } from 'src/maker/api/ChatRoomActionContextApi'
import { NPC, npcs } from 'src/domain/npcs'
import { Modifier, modifiers } from 'src/domain/modifiers'

export const addContextApi = <T extends { node: NodeApi }>
(data: T): T & { api: ChatRoomActionContextApi } =>
  ({ ...data, api: data.node.getContextApi() })

export const hasSender = <T extends { from?: NodeApi }>({ from }: T): boolean => !!from

// To be used after hasSender to change the data type so that "from" is not optional
export const enforceSender = <T extends { from?: NodeApi }>
(data: T): T & { from: NodeApi } =>
  ({ ...data, from: data.from! })

// To be used after enforceSender so from is not optional
export const fromNPC = <T extends { from: NodeApi }>({ from }: T): boolean => from.isUnObject()

// Checks if the room action is an item (imported from Airtable)
export const actionIsAnItem = <T extends { api: ChatRoomActionContextApi }>({ api }: T): boolean => api.getCurrentActionName() in items
// Adds the Item to the data based on the room action name
export const addItemFromApi = <T extends { api: ChatRoomActionContextApi }>
(data: T): T & { item: Item } =>
  ({ ...data, item: items[data.api.getCurrentActionName()]! })

// Add the item based on an ActionXInstance provided, if this ever gets an unknown item, it will crash
export const addItemFromInstance = <T extends { instance: ActionXInstance }>
(data: T): T & { item: Item } => {
  const item = items[data.instance.actionName]
  if (!item) {
    // Jeff & Ariel talked and decided this shouldn't happen, so if it does, just throw
    throw new Error(`Unknown item received: "${data.instance.actionName}"`)
  }
  return { ...data, item }
}

// Checks if the room action is a move (imported from Airtable)
export const actionIsAMove = <T extends { api: ChatRoomActionContextApi }>({ api }: T): boolean => api.getCurrentActionName() in moves
// Adds the Move to the data based on the room action name
export const addMoveFromApi = <T extends { api: ChatRoomActionContextApi }>
(data: T): T & { move: Move } =>
  ({ ...data, move: moves[data.api.getCurrentActionName()]! })

export const addNodeAndApiForUser = <T extends { user: User }>
(data: T): T & { node: NodeApi; api: ChatRoomActionContextApi } => {
  const { user } = data
  const api = ChatRoomActionContextApiFactory({ sessionUser: user, actor: user, players: [user], context: { user }, contextId: user.eid, type: ActionContextType.ChatRoomActionContext }, {})
  return { ...data, api, node: api.getActor() }
}

export const addNPCFromApi = <T extends { api: ChatRoomActionContextApi }>
(data: T): T & { npc?: NPC } =>
  ({ ...data, npc: npcs[data.api.getUnObject()?.getId()] })

export const addModifierFromTarget = <T extends { api: ChatRoomActionContextApi }>
(data: T): T & { modifier?: Modifier } =>
  ({ ...data, modifier: modifiers[data.api.getCurrentActionTarget()] })

// Defines if a request has an intent to transfer
export const isTransfer = <T extends { api: ChatRoomActionContextApi; item: Item; modifier?: Modifier }>
({ api, item, modifier }: T): boolean => !!item && (api.isGiveTarget() || modifier?.operation === 'Transfer')
