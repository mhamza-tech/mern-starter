/**
 * Notes from jeff
 * redundant to have `deposited` and `withdrawn`.  prefer added, removed, transfered, destroyed
 *    added to user
 *    added to npc
 *    removed from user
 *    removed from npc
 *    transferred between users
 *    transferred from user to npc
 *    transferred from npc to user
 *    destroyed, is well, just destroyed
 * 
 *    helper text needed for room events, entered, entering, restarted
 *    what does room.resetting mean?  Is it upon an interbnal reseting trigger or when a fresh new room is presented to the user?
 * 
 *    Jeff's function actorStateInRange will seriously slow down the system, due to promise chain, unless `.and() events are evaluated in cascading order and dismissed is condition fails early in chain
 *    ARIEL: ^ as I mentioned, I'd move the actorIsInRange to the do()'s
 */

import { on } from 'src/maker/events'
import { SYSTEM_USER_EID } from 'src/env'
import { isM2M, isP2P, nodeIsUser, isBedroom } from './helpers'
import { promiseMap } from 'src/utils/sf.typed'
import { NodeApi } from 'src/types'
import { getActiveUserStates } from '../userStates'
import _ from 'lodash'
import * as debugRules from './debug'
import * as itemsExpirationRules from './items/expiration'
import * as itemsModalRules from './items/modal'
import * as npcsMessagesRules from './npcs/messages'
import * as userStatesRules from './userStates'
import * as userStatesToVStatesRules from './userStates/toVStates'
import * as userStatesNewsfeedRules from './userStates/newsfeed'
import * as gameLogicRules from './gameLogic'
import { LoggerFactory } from 'src/utils/logger'
import { items, Item, ItemName } from 'src/domain/items'
import { hasModifiers } from 'src/utils/gameLogic'

const setup = (): void => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const logger = LoggerFactory('jeff', 'Rules')

  // Configuration

  const STARTING_ITEMS: Item[] = [
    items.coconut_25,
    items.belgian_beer_359,
    items.freeze_ray_gun_2061,
    items.glitter_bomb_520,
    items.water_balloon_1358,
    items.vegan_smoothie_82,
  ]

  const giveItems = (node: NodeApi, items: Item[]): Promise<any> => {
    return promiseMap(items, (item) => (
      node.createActionInstance({ creatorEid: SYSTEM_USER_EID, actionName: item.name })
    ))
  }

  on.user.created.do(({ node }) => {
    return giveItems(node, STARTING_ITEMS)
  })

  on.state.increased.and(nodeIsUser)
    .and(({ input, state }) => input.delta > 0 && input.numberValue === state.maxValue)
    .do(({ node, state }) => {
      // Optionally show a status message when a user state reaches its max value
      return node.sendMessage({
        tags: [state.id, 'target_actor', '100', 'onstateincreased'],
        optional: [], values: { userState: state },
      })
    })

  on.room.entered.and(isP2P).do(async ({ api }) => {
    const actor = api.getActor()
    const partner = api.getPartner()
    if (!await actor.isFriendedBy(partner)) {
      return null
    }
    const states = await getActiveUserStates(partner)
    if (states.length) {
      // Show a message based on the partner's active user states
      return actor.sendMessage({
        tags: ['target_actor', 'warning', 'p2p', 'onroomentered'],
        optional: states.map(s => s.id),
      })
    }
  })

  on.room.entered.and(isM2M).and(isBedroom).do(async ({ api }) => {
    const actor = api.getActor()
    return actor.readAllActionInstances().then((inventory) => {
      // Pick an item name for an item that has modifiers (appears in bedroom) and is in inventory
      const itemName = _(inventory).map(instance => instance.actionName as ItemName).filter(hasModifiers).sample()
      return itemName && actor.sendMessage({
        tags: ['target_actor', 'inventory_mention', 'm2m', 'onroomentered'],
        optional: [itemName], values: { itemName },
      })
    })
  })

  interface Epic { setup: () => void }

  const epics: Epic[] = [
    debugRules,
    itemsExpirationRules,
    itemsModalRules,
    npcsMessagesRules,
    userStatesRules,
    userStatesToVStatesRules,
    userStatesNewsfeedRules,
    gameLogicRules,
  ]
  epics.forEach(epic => epic.setup())
}

export default { setup }
