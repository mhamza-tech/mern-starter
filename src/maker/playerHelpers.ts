import _ from 'lodash'
import {
  SetLocalStateInput,
  ChatRoomActionContextApi,
  NodeApi,
  FieldTemplate,
  FieldMetadata,
  TileTemplate,
  HandlebarsValues,
  ModalEffectTemplate,
} from '../types'
import {
  SaveFieldOutput,
  FieldType,
  Field,
  EntityScope,
  EffectType,
  SoundType,
  ModalType,
} from '../gql-types'
import { Tile } from 'src/db/entity'
import {
  metadataNumberValueLens,
  positionOnMapFieldTemplate,
} from './playerHelpers.assets'
import { animation as addToRoom } from '../maker/fx/animation.addToRoom'
import { animationSequence as removeFromRoom } from '../maker/fx/animation.removeFromRoom'
import { defaultsDeep, deepFreeze } from 'src/utils/misc'
import { promiseMap } from 'src/utils/sf.typed'
import { toPublicUrl } from 'src/services/aws'
import { vstateToAssets } from './vstate'
import { BeforeEnterAsset } from 'src/enginev3'
import { Move } from 'src/domain/moves'
import { Item } from 'src/domain/items'

export enum UserAttributeKey {
  // HealthPoints,./virtualGoods.ts.jt
  PizzaCount,
  BodyWeight,
  TotalWeightLoss,
  DietPillCount,
  Wealth,
  BankBalance,
  AccumulatedInterest,
}

export interface ProvenanceMetaData {
  timestamp: number
  fromEntityId: string
  toEntityId: string
}

export const hasVisited = (contextApi: ChatRoomActionContextApi): Promise<boolean> => {
  const setLocalStateInput: SetLocalStateInput = {
    type: FieldType.BooleanField,
    name: 'hasVisited',
    metadata: {
      booleanValue: false,
    },
  }

  return contextApi
    .getChatRoom()
    .getLocalState('hasVisited', setLocalStateInput)
    .then((field: Field) => _.get(field, 'metadata.booleanValue') as boolean)
}
export const setHasVisited = (contextApi: ChatRoomActionContextApi, hasVisited: boolean): Promise<SaveFieldOutput> => {
  return contextApi.getChatRoom().setLocalState({
    type: FieldType.BooleanField,
    name: 'hasVisited',
    metadata: {
      booleanValue: hasVisited,
    },
  } as SetLocalStateInput)
}

export const hasPostedThisNewsfeedItem = (contextApi: ChatRoomActionContextApi, key: string): Promise<boolean> => {
  const keyName = `has.posted.this.newsfeed.item.${key}`
  const setLocalStateInput: SetLocalStateInput = {
    type: FieldType.BooleanField,
    name: keyName,
    metadata: {
      booleanValue: false,
    },
  }

  return contextApi
    .getChatRoom()
    .getLocalState(keyName, setLocalStateInput)
    .then((field: Field) => _.get(field, 'metadata.booleanValue') as boolean)
}

export const setHasPostedThisNewsfeedItem = (contextApi: ChatRoomActionContextApi, key: string, hasPosted: boolean): Promise<SaveFieldOutput> => {
  const keyName = `has.posted.this.newsfeed.item.${key}`
  return contextApi.getChatRoom().setLocalState({
    type: FieldType.BooleanField,
    name: keyName,
    metadata: {
      booleanValue: hasPosted,
    },
  } as SetLocalStateInput)
}

// export const getWallet = (node: NodeApi, defaultVal: number = 0): Promise<number> => {
//     const defaultInput: SetGlobalStateInput = {
//         type: FieldType.NumberField,
//         name: 'wallet',
//         metadata: {
//             numberValue: defaultVal
//         }
//     };
//     return node.getGlobalState('wallet', defaultInput)
//         .then((field: Field) => _.get(field, 'metadata.numberValue') as number)
// }

export const getUserAttribute = async (userAttributeKey: UserAttributeKey, node: NodeApi, defaultVal = 0): Promise<number> => {
  const keyName = getKeyName(UserAttributeKey[userAttributeKey])

  const defaultInput: SetLocalStateInput = {
    type: FieldType.NumberField,
    name: keyName,
    metadata: {
      numberValue: defaultVal,
    },
  }

  return node
    .getGlobalState(keyName, defaultInput)
    .then((field: Field) => _.get(field, 'metadata.numberValue') as number)
}

const getKeyName = (key: string): string => {
  return `UserAttribute.${key}`
}

// export const incrementUserAttribute = async (userAttributeKey: UserAttributeKey, node: NodeApi, byNumber: number, ): Promise<number> => {
export const incrementUserAttribute = async (node: NodeApi, userAttributeKey: UserAttributeKey, byNumber: number): Promise<number> => {
  byNumber = _.isUndefined(byNumber) ? 1 : byNumber
  const keyName = getKeyName(UserAttributeKey[userAttributeKey])

  return node
    .incrementGlobalState(keyName, byNumber)
    .then((saveFieldOutput: SaveFieldOutput) => _.get(saveFieldOutput.field, 'metadata.numberValue') as number)
}

// export const decrement = async (
//     status: UserStatus,
//     node: NodeApi,
//     byNumber?: number,
// ): Promise<number> => {
//     byNumber = -1 * (_.isUndefined(byNumber) ? 1 : byNumber)
//     return node
//         .incrementGlobalState(UserStatus[status], byNumber)
//         .then((saveFieldOutput: SaveFieldOutput) => _.get(saveFieldOutput.field, 'metadata.numberValue') as number)
// }

/**
 * @deprecated - use createActionInstance
 */
// export const getInventory = async (node: NodeApi): Promise<VirtualGoods.Item[]> => {
//   const stateVariable = 'userinventory'
//   const defaultInput: SetGlobalStateInput = {
//     type: FieldType.JsonObjectField,
//     name: stateVariable,
//     metadata: {
//       inventory: [],
//     },
//   }
//   const field = await node.getGlobalState(stateVariable, defaultInput)
//   const val = _.get(field, 'metadata.inventory') as VirtualGoods.Item[]
//   return _.isArray(val) ? val : _.values(val)
// }

/**
 * @deprecated - use createActionInstance
 */
// export const addToInventory = async (
//   node: NodeApi,
//   id: VirtualGoods.Item,
// ): Promise<VirtualGoods.Item[]> => {
//   const currentInventory: VirtualGoods.Item[] = await getInventory(node)
//   //   await contextApi.getUser().sendSystemComment(`currentInventory: ${currentInventory.join(',')}`)
//   currentInventory.push(id)
//   return setInventory(node, currentInventory)
// }

/**
 * @deprecated - use createActionInstance
 */
// export const hasInventoryItem = async (
//   node: NodeApi,
//   id: VirtualGoods.Item,
// ): Promise<boolean> => {
//   const inventory: VirtualGoods.Item[] = await getInventory(node)

//   // const allNames: string[] = _.map(inventory, (item: VirtualGoods.Item) => {
//   //     return VirtualGoods.Item[item]
//   // })
//   // await contextApi.getUser().sendSystemComment(`inventory: ${allNames.join(',')}`)

//   return Promise.resolve(_.findIndex(inventory, (itemKey: VirtualGoods.Item) => itemKey == id) > -1)
// }

// export const hasInventoryItemWithTag = async (
//     contextApi: ChatRoomActionContextApi,
//     tag: VirtualGoods.VirtualGoodTags,
//   ): Promise<boolean> => {
//     const inventory: VirtualGoods.Item[] = await getInventory(contextApi)
//     await contextApi.getUser().sendSystemComment(`inventory: ${inventory.join(',')}`)
//     return Promise.resolve(_.findIndex(inventory, (itemKey: VirtualGoods.Item) => itemKey == id) > -1)
//   }

/**
 * @deprecated - use createActionInstance / deleteActionInstance
 */
// export const removeFromInventory = async (
//   node: NodeApi,
//   id: VirtualGoods.Item,
// ): Promise<VirtualGoods.Item[]> => {
//   const currentInventory: VirtualGoods.Item[] = await getInventory(node)
//   const idx = _.findLastIndex(currentInventory, (itemKey: VirtualGoods.Item) => itemKey == id)
//   if (idx > -1) {
//     _.pullAt(currentInventory, idx)
//     return setInventory(node, currentInventory)
//   }
//   return currentInventory
// }

/**
 * @deprecated - use createActionInstance
 */
// const setInventory = async (
//   node: NodeApi,
//   inventory: VirtualGoods.Item[],
// ): Promise<VirtualGoods.Item[]> => {
//   const stateVariable = 'userinventory'
//   const setGlobalStateInput: SetGlobalStateInput = {
//     type: FieldType.JsonObjectField,
//     name: stateVariable,
//     metadata: {
//       inventory,
//     },
//   }
//   const saveFieldOutput = await node.setGlobalState(setGlobalStateInput)
//   const val = _.get(saveFieldOutput.field, 'metadata.inventory') as VirtualGoods.Item[]
//   return _.isArray(val) ? val : _.values(val)
// }

/**
 * @deprecated - use NodeApi.createActionInstance
 * @return a fn that maps from ActionEdgeApi to SetActionInput.
 *         which can be squeezed between any getActionEdge / setGlobalAction pair,
 *         like in in/decrementActionButtonInventoryWait.
 */
// const incrementQuantity = (name: string, byNumber: number) => (actionEdge: ActionEdgeApi): Promise<SetActionInput> => {
//   const quantity: number = _.isNil(actionEdge)
//     ? byNumber
//     : Math.max(actionEdge.quantity() + byNumber, 0)

//   return Promise.resolve({
//     name,
//     quantity,
//     isDisabled: quantity == 0
//   })
// }

/**
 * @deprecated - use NodeApi.createActionInstance
 * @return a fn that maps from ActionEdgeApi to SetActionInput.
 *         which can be squeezed between any getActionEdge / setGlobalAction pair
 *         like in in/decrementActionButtonInventoryWait.
 */
// const decrementQuantity = (name: string) => (actionEdge: ActionEdgeApi): Promise<SetActionInput> => {
//   const quantity: number = _.isNil(actionEdge)
//     ? 0
//     : Math.max(actionEdge.quantity() - 1, 0)

//   return Promise.resolve({
//     name,
//     quantity,
//     isDisabled: quantity == 0
//   })
// }

/**
 * @deprecated - use NodeApi.createActionInstance
 * @return the promise so we can wait on it and then resend currentActionEdges
 */
// export const saveActionButtonInventory = (node: NodeApi, name: string, quantity: number): Promise<SaveEdgeOutput> => {
//   return node.getActionEdge(name)
//     .then(() => Promise.resolve({
//       name,
//       quantity,
//       isDisabled: quantity == 0
//     }))
//     .then(node.setGlobalAction)

// }

/**
 * @deprecated - use NodeApi.createActionInstance
 * @return the promise so we can wait on it and then resend currentActionEdges
 */
// export const decrementActionButtonInventory = (node: NodeApi, name: string): Promise<SaveEdgeOutput> => {
//   return node.getActionEdge(name)
//     .then(decrementQuantity(name))
//     .then(node.setGlobalAction)

// }

/**
 * @deprecated - use NodeApi.createActionInstance
 * @return the promise so we can wait on it and then resend currentActionEdges
 */
// export const incrementActionButtonInventory = (node: NodeApi, name: string, byNumber: number): Promise<SaveEdgeOutput> => {
//   return node.getActionEdge(name)
//     .then(incrementQuantity(name, byNumber))
//     .then(node.setGlobalAction)

// }

/**
 * @deprecated - use NodeApi.createActionInstance
 * @return the promise so we can wait on it and then resend currentActionEdges
 */
// export const decrementActionButtonInventoryWait = decrementActionButtonInventory

/**
 * @deprecated - use NodeApi.createActionInstance
 * @return the promise so we can wait on it and then resend currentActionEdges
 */
// export const incrementActionButtonInventoryWait = incrementActionButtonInventory

// export const incrementActionButtonInventoryWithProvenance = (node: NodeApi, name: string, byNumber: number, provenance: ProvenanceMetaData): Promise<SaveEdgeOutput> => {
//     return node.getActionEdge(name)
//         .then(incrementQuantity(name, byNumber))
//         .then(node.setGlobalAction)
//         ;
// };

// export const decrementActionButtonInventory_old = async (node: NodeApi, name: string): Promise<number> => {
//     let actionEdge: ActionEdgeApi
//     let quantity: number

//     actionEdge = await node.getActionEdge(name)

//     quantity = _.isNil(actionEdge) ? 0 : Math.max(actionEdge.quantity() - 1, 0)

//     node.setGlobalAction({
//         name,
//         quantity,
//         isDisabled: quantity == 0
//     })

//     return Promise.resolve(quantity)
// }

// export const incrementActionButtonInventory_old = async (node: NodeApi, name: string, byNumber: number): Promise<number> => {
//     let actionEdge: ActionEdgeApi
//     let quantity: number

//     actionEdge = await node.getActionEdge(name)

//     quantity = _.isNil(actionEdge) ? byNumber : actionEdge.quantity() + byNumber

//     node.setGlobalAction({
//         name,
//         quantity,
//         isDeleted: quantity <= 0,
//         isDisabled: quantity <= 0,
//     })

//     return Promise.resolve(quantity)
// }

/**
 * @deprecated - use action instances; TODO: contextApi.getActor().actionInstances(actionName)  // return list of actions
 */
export const getActionButtonInventory = async (node: NodeApi, name: string): Promise<number> => {
  const actionEdge = await node.getActionEdge(name)
  // logger.log( 'getActionButtonInventory: ', { node, name, edge, metadata: _.get(edge, 'metadata'), quantity: _.result( actionEdge, 'quantity' ) } )

  return Promise.resolve(_.isNil(actionEdge) ? 0 : actionEdge.quantity())
}

/**
 * @param node 
 * @param delta 
 * @return Promise<Field> - the updated positionOnMap Field
 */
export const incrementPositionOnMap = (node: NodeApi, delta = 1): Promise<Field> => {
  return node.incrementField(positionOnMapFieldTemplate, delta)
}

/**
 * @param node 
 * @param delta 
 * @return Promise<Field> - the updated positionOnMap Field
 */
export const savePositionOnMap = (node: NodeApi, position: number): Promise<Field> => {
  return node.saveField(
    metadataNumberValueLens.set(position)(positionOnMapFieldTemplate)
  )
}

/**
 * @param node 
 * @return Promise<Field> - the positionOnMap Field
 */
export const readPositionOnMap = (node: NodeApi): Promise<Field> => {
  return node.field(positionOnMapFieldTemplate)
}

/**
 * Save a field if it doesn't exist or it is expired
 * A usual use-case for this are story fields
 */
export const saveThrottledField = (node: NodeApi, template: FieldTemplate<FieldMetadata>): Promise<any> => {
  return node.field(template).then(field => {
    if (field.isDeleted || !field.expiresAt || field.expiresAt < new Date()) {
      return node.saveField(template)
    } else {
      return Promise.resolve(undefined)
    }
  })
}

/**
 * Send a system message to the actor as if it was a chat message by the NPC
 */
export const sendNPCMessage = (contextApi: ChatRoomActionContextApi, text: string, values?: HandlebarsValues): Promise<any> => {
  return contextApi.getActor().sendMessage({ text, from: contextApi.getUnObject(), values })
}

/**
 * Add tiles to a node using the standard animation with an incrementing delay
 * if it's always one or you don't need the delay, just assign addToRoom to
 * the TileTemplate.metadata.animation
 */
const ANIMATION_DELAY = 250

export const addTilesAnimated = (node: NodeApi, tiles: TileTemplate[]): Promise<any> => {
  const animated = tiles.map((tile, index) =>
    defaultsDeep({ metadata: {
      // NOTE: The delay stopped working, seems like the FE broke it
      animation: { ...addToRoom, delay: ANIMATION_DELAY * index },
      animationSequence: null,
    }}, tile)
  )
  return node.saveTiles(animated)
}

/**
 * Delete a tile from a node but showing an animation first
 */
export const deleteTilesAnimated = (node: NodeApi, tiles: (TileTemplate | Tile)[]): Promise<any> => {
  const animated = tiles.map(tile => defaultsDeep({ metadata: {
    animation: null,
    // TODO: Add an inverse delay, seems like the FE is ignoring it
    animationSequence: removeFromRoom,
  }}, tile))
  // Save it with the effect and then immediately delete without notifying the FE
  return node.saveTiles(animated)
    // TODO: Would be nice to have saveTilesNoPublish()
    .then(() => promiseMap(tiles, tile =>
      node.saveTileNoPublish({ ...tile, isDeleted: true })
    ))
}

export const playSound = (api: ChatRoomActionContextApi, path: string): Promise<any> => {
  return api.getChatRoom().saveEffect({
    scope: EntityScope.GlobalScope,
    type: EffectType.SoundEffect,
    metadata: { soundType: SoundType.SourcedSound, sourceUri: toPublicUrl(`sounds/${path}.mp3`) },
  })
}

export const getMovesAssets = (moves: Move[], withIcons = false): BeforeEnterAsset[] => {
  const vstateAssets = _(moves)
    .flatMap(move => [move.buffVState, move.effectVState]).compact()
    .flatMap(vstateToAssets).compact().uniq().value()
  
  return [...(withIcons ? moves : []), ...vstateAssets]
}

const itemModal = deepFreeze<ModalEffectTemplate>({
  type: EffectType.ModalEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    modalType: ModalType.ItemAward,
    texts: { primary: null, secondary: null },
    images: { primary: null },
    buttons: { primary: { text: 'Continue' } },
  },
})

export const showItemModal = (node: NodeApi, item: Item): Promise<any> => {
  return node.saveEffect(defaultsDeep({
    scope: node.isUser() ? EntityScope.ChatRoomPrivateScope : EntityScope.GlobalScope,
    metadata: {
      texts: { primary: item.text, secondary: item.description },
      images: { primary: { s3Key: item.s3Key }},
    },
  }, itemModal))
}
