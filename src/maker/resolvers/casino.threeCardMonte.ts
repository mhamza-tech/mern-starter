/**
 * @rob4lderman
 * jan2020
 *  
 */

import {
  ActionResolver,
  ChatRoomActionContextApi,
} from '../types'
import { LoggerFactory } from 'src/utils/logger'
import _ from 'lodash'
import {
  registerReactionFnMap,
  ReactionFnMap,
} from '../../enginev3'
import * as common from './common'
import {
  UserAttributeKey,
  incrementUserAttribute,
} from '../playerHelpers'
import {
  numberValueLens,
  betAmountFieldTemplate,
  currentStateFieldTemplate,
  stringValueLens,
  numRoundsSinceLastBonusFieldTemplate,
  animGreenCheckEffectTemplate,
  threeCardMonteCards,
} from './casino.assets'
import {
  stateActionGroups,
  stateActionStubSets,
  localActionNames,
} from './casino.threeCardMonte.assets'

const logger = LoggerFactory('handler.casino.threeCardMonte', 'NPC')
const unObjectId = 'three_card_monte_1643'

const placeBetBonusRound = (contextApi: ChatRoomActionContextApi): Promise<any[]> => {
  const currentStateName = 'state.casino.pickacard.bonus'
  const amount = contextApi.getCurrentAction().args.amount
  return Promise.all([
    contextApi.getActor().saveField(numberValueLens.set(amount)(betAmountFieldTemplate)),
    contextApi.getActor().saveField(stringValueLens.set(currentStateName)(currentStateFieldTemplate)),
    contextApi.getActor().saveField(numRoundsSinceLastBonusFieldTemplate),
    contextApi.getActor().saveCurrentActionStubs(stateActionStubSets[currentStateName]),
    contextApi.getActor().setCurrentActionEdges(stateActionGroups[currentStateName]),
    contextApi.getActor().sendSystemMessage(`BONUS ROUND! Get lucky and win 5x your $${amount} bet!`),
  ])
}

const placeBetNormalRound = (contextApi: ChatRoomActionContextApi): Promise<any[]> => {
  const currentStateName = 'state.casino.pickacard'
  const amount = contextApi.getCurrentAction().args.amount
  return Promise.all([
    contextApi.getActor().saveField(numberValueLens.set(amount)(betAmountFieldTemplate)),
    contextApi.getActor().saveField(stringValueLens.set(currentStateName)(currentStateFieldTemplate)),
    contextApi.getActor().incrementField(numRoundsSinceLastBonusFieldTemplate, 1),
    contextApi.getActor().saveCurrentActionStubs(stateActionStubSets[currentStateName]),
    contextApi.getActor().setCurrentActionEdges(stateActionGroups[currentStateName]),
    contextApi.getActor().sendSystemMessage(`$${amount} it is! Pick a card, any card`),
  ])
}

// poisson cdf w/ lambda = 4
const ppoisLambda4 = [
  0.01831564,
  0.09157819,
  0.23810331,
  0.43347012,
  0.62883694,
  0.78513039,
  0.88932602,
  0.94886638,
  0.97863657,
  1,
]

/**
 * @param k 
 * @return the poisson CDF at k=k (for lambda=4)
 */
const ppois = (k: number): number => {
  const retMe: number = _.defaultTo(_.nth(ppoisLambda4, k), 1)
  logger.log('ppois', { k, retMe })
  return retMe
}

/**
 * Randomly does a bonus round.
 * 1. get local field 'numRoundsSinceLastBonus'
 * 2. convert that to a prob based on poisson cdf
 */
const onActionPlaceBet = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return contextApi.getActor().field(numRoundsSinceLastBonusFieldTemplate)
    .then(numberValueLens.get)
    .then(
      (numRounds: number) => _.random(0, 1, true) <= ppois(numRounds)
        ? placeBetBonusRound(contextApi)
        : placeBetNormalRound(contextApi)
    )
}

const onActionPickCard = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return contextApi.getActor().field(currentStateFieldTemplate)
    .then(stringValueLens.get)
    .then(
      (currentState: string) => {
        switch (currentState) {
          case 'state.casino.pickacard.bonus':
            return onActionPickCardBonusRound(contextApi)
          case 'state.casino.pickacard':
          default:
            return onActionPickCardNormalRound(contextApi)
        }
      }
    )
}

const onActionPickCardNormalRound = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  contextApi.getActor().saveCurrentActionStubs(stateActionStubSets['state.casino.start'])
  contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.casino.start'])
  const winningCard = _.sample(['leftcard', 'centercard', 'rightcard'])
  const isWinner = contextApi.getCurrentAction().args.card == winningCard
  if (isWinner) {
    return contextApi.getActor().field(betAmountFieldTemplate)
      .then(numberValueLens.get)
      .then(_.partial(doWinnerEffects, contextApi))
  } else {
    return Promise.all([
      contextApi.getActor().sendSystemMessage(`Sorry!  No luck. You shoulda picked the ${threeCardMonteCards[winningCard].text}. Fortunately for you the game is free 🙂`),
    ])
  }
}

const doWinnerEffects = (contextApi: ChatRoomActionContextApi, winningAmount: number): Promise<any> => {
  return Promise.resolve(winningAmount)
    .then((winningAmount: number) => Promise.all([
      incrementUserAttribute(contextApi.getActor(), UserAttributeKey.Wealth, winningAmount)
        .then((walletValue: number) => `Lucky you! You won $${winningAmount}. You now have $${walletValue} in your wallet.`)
        .then(contextApi.getActor().sendSystemMessage)
      ,
      contextApi.getChatRoom().saveEffect(animGreenCheckEffectTemplate),
      winningAmount >= 50
        ? contextApi.createNewsfeedItemUnObjectCard(
          `{{ name actor }} just won $${winningAmount} playing **THREE-CARD MONTE** at the casino!`
        )
        : null,
    ]))
}

const onActionPickCardBonusRound = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  contextApi.getActor().saveCurrentActionStubs(stateActionStubSets['state.casino.start'])
  contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.casino.start'])
  const winningCard = _.sample(['leftcard', 'centercard', 'rightcard', 'bonusleftcard', 'bonusrightcard'])
  const isWinner = contextApi.getCurrentAction().args.card == winningCard
  logger.log('onActionPickCardBonusRound', { winningCard, card: contextApi.getCurrentAction().args.card })
  if (isWinner) {
    return contextApi.getActor().field(betAmountFieldTemplate)
      .then(numberValueLens.get)
      .then((winningAmount: number) => winningAmount * 5)
      .then(_.partial(doWinnerEffects, contextApi))
  } else {
    return Promise.all([
      contextApi.getActor().sendSystemMessage(`Sorry!  No luck. You shoulda picked the ${threeCardMonteCards[winningCard].positionalText}. Fortunately for you the game is free 🙂`),
    ])
  }
}

const onEnter = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  logger.log('onEnter')
  contextApi.getActor().saveCurrentActionStubs(stateActionStubSets['state.casino.start'])
  contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.casino.start'])
  // make sure the local action edges for this user have been created.
  Promise.resolve(null)
    .then(_.partial(contextApi.getActor().readOrCreateLocalActionEdges, localActionNames))
    .then(_.partial(contextApi.getActor().setCurrentActionEdges, stateActionGroups['state.casino.start']))

  return contextApi.getActor().sendSystemMessage(
    'Welcome to the Three-Card Monte! You play it right here. Place your bets!'
  )
}

const onReset = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return common.resetIsFirstEnter(contextApi.getActor())
}

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {
    'action.casino.leftcard': onActionPickCard,
    'action.casino.centercard': onActionPickCard,
    'action.casino.rightcard': onActionPickCard,
    'action.casino.bonusleftcard': onActionPickCard,
    'action.casino.bonusrightcard': onActionPickCard,
    'action.casino.bet5': onActionPlaceBet,
    'action.casino.bet10': onActionPlaceBet,
    'action.casino.bet20': onActionPlaceBet,
  } as ReactionFnMap)
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onReset,
  onLoad: registerReactionFns,
}

export default actionResolver
