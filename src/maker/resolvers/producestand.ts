/**
 * @rob4lderman
 * oct2019
 *  
 * Produce Stand.
 * 
 */

import {
  ActionResolver,
  ChatRoomActionContextApi,
} from '../types'
import {
  sf,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  Field,
} from '../../db/entity'
import _ from 'lodash'
import {
  registerReactionFnMap,
  ReactionFnMap,
} from '../../enginev3'
import * as common from './common'
import Bluebird from 'bluebird'
import {
  UserAttributeKey,
  incrementUserAttribute,
  getUserAttribute,
} from '../playerHelpers'
import {
  standItems,
  sourceUriLens,
  animationEffectTemplate,
  stateActionStubSets,
} from './producestand.assets'
import * as fxAddToInventory from '../fx/animation.addtoinventory'
import { fullScreenTileTemplate } from '../fx/tiles'

const logger = LoggerFactory('handler.producestand', 'NPC')
const unObjectId = 'produce_stand_682'

const onActionCheckWallet = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return getUserAttribute(UserAttributeKey.Wealth, contextApi.getActor(), 5)
    .then((val: number) => contextApi.getActor().sendSystemMessage(`You have $${val} in your wallet`))
}

const onActionBuyItem = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const price = contextApi.getCurrentAction().args.price
  return Bluebird.Promise.props({
    actorsCash: getUserAttribute(UserAttributeKey.Wealth, contextApi.getActor(), 5),
  })
    .then(sf.thru_if_else(({ actorsCash }) => (actorsCash >= price))(
      _.partial(doBuyItemEffects, contextApi)
    )(
      _.partial(doInsufficientFundsEffects, contextApi)
    ))
}

const doBuyItemEffects = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const {
    item,
    price,
  } = contextApi.getCurrentAction().args
  return Promise.all([
    // -rx- contextApi.getActor().incrementLocalState(item, 1),
    contextApi.getChatRoom().saveEffectOnTile(
      sourceUriLens.set(standItems[item].animationSourceUri)(animationEffectTemplate),
      fullScreenTileTemplate
    ),
    incrementUserAttribute(contextApi.getActor(), UserAttributeKey.Wealth, (price * -1))
      .then((actorsCash: number) => contextApi.getActor().sendMessage({
        text: `You bought an **${ item } for ${price}**. It\'s been added to your inventory. You have **${ actorsCash }** left in your wallet.`,
      })),
  ])
}

const doBuyAndRewardActionEffects = (contextApi: ChatRoomActionContextApi, { }): Promise<any> => {
  const {
    rewardedActionName,
    rewardedImageS3Key,
  } = contextApi.getCurrentAction().args
  return Promise.all([
    doBuyItemEffects(contextApi),
    _.isEmpty(rewardedImageS3Key) ? null : fxAddToInventory.animate(contextApi, rewardedImageS3Key),
    contextApi.getActor().createActionInstance({
      actionName: rewardedActionName,
      trxDescription: `${contextApi.getActor().getName()} bought this action from the ${contextApi.getUnObject().getName()}`,
    }),
  ])
}

const doInsufficientFundsEffects = (contextApi: ChatRoomActionContextApi, { actorsCash }): Promise<any> => {
  const {
    item,
    price,
  } = contextApi.getCurrentAction().args
  return contextApi.getActor().sendMessage({
    text: `Sorry, the **${ item } costs ${ price }** and you only have **${ actorsCash }**`,
  })
}

const onActionBuyAndRewardAction = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  logger.log('onActionBuyAndRewardAction', { args: contextApi.getCurrentAction().args })
  const {
    price,
  } = contextApi.getCurrentAction().args
  return Bluebird.Promise.props({
    actorsCash: getUserAttribute(UserAttributeKey.Wealth, contextApi.getActor(), 5),
  })
    .then(sf.thru_if_else(({ actorsCash }) => (actorsCash >= price))(
      _.partial(doBuyAndRewardActionEffects, contextApi)
    )(
      _.partial(doInsufficientFundsEffects, contextApi)
    ))
}

const formatInventoryItem = (field: Field): string => {
  const item = field.name
  const qty = _.get(field, 'metadata.numberValue', 0)
  switch (qty) {
    case 0:
      return null
    case 1:
      return item
    default:
      return `${qty} ${item}s`
  }
}

const onActionCheckInventory = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.resolve(_.keys(standItems))
    .then(sf.list_fmap_wait(contextApi.getActor().getLocalState))
    .then(sf.list_fmap(sf.maybe_fmap(formatInventoryItem)))
    .then(_.compact)
    .then((inventory: string[]) => _.isEmpty(inventory) ? ['nothing'] : inventory)
    .then(
      (inventory: string[]) => contextApi.getActor().sendSystemMessage(
        `In your bag you have...\n${_.join(inventory, '\n')}`
      )
    )
}

const onEnter = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  logger.log('onEnter')
  contextApi.getActor().saveCurrentActionStubs(stateActionStubSets['state.producestand.all'])
  return contextApi.getActor().sendSystemMessage(
    'Welcome to the **UnReal Produce Stand!** Get your healthy fruits and veggies and **beer-brewing materials!**'
  )
}

const onReset = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  logger.log('avocado.onReset')
  return common.resetIsFirstEnter(contextApi.getActor())
}

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {
    'action.producestand.buyapple': onActionBuyAndRewardAction,
    'action.producestand.buyorange': onActionBuyItem,
    'action.producestand.buytomato': onActionBuyItem,
    'action.producestand.buykale': onActionBuyAndRewardAction,
    'action.producestand.buycuttingboard': onActionBuyItem,
    'action.producestand.buyknife': onActionBuyAndRewardAction,
    'action.producestand.buypatchouli': onActionBuyAndRewardAction,
    'action.producestand.buycorn': onActionBuyAndRewardAction,
    'action.producestand.buyhops': onActionBuyAndRewardAction,
    'action.producestand.checkwallet': onActionCheckWallet,
    'action.producestand.checkinventory': onActionCheckInventory,
  } as ReactionFnMap)
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onReset,
  onLoad: registerReactionFns,
}

export default actionResolver
