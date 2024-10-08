/**
 * @rob4lderman
 * jan2020
 *  
 */

import { ChatRoomActionContextApi } from '../types'
import { sf } from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import { UserAttributeKey, incrementUserAttribute } from '../playerHelpers'
import { UnrealChatroom, UnrealOnEnter, UnrealAction, UnrealOnReset } from 'src/maker/core'
import {
  dealerCardFieldTemplate,
  imageS3KeyLens,
  numberValueLens,
  betAmountFieldTemplate,
  stringValueLens,
  stateActionGroups,
  animGreenCheckEffectTemplate,
  dealerCardTileTemplate,
  playerCardTileTemplate,
  tableTileTemplate,
  cardDeck,
  faceDownCard,
  aboveTableTileTemplate,
  Card,
  localActionNames,
  stateActionStubSets,
} from './casino.assets'
import _ from 'lodash'
import * as common from './common'

// TODO: clear the table at some point.
// const clearHiLo = (contextApi: ChatRoomActionContextApi) => {
//   return Promise.all([
//     contextApi.getChatRoom().saveTiles([
//       isDeletedLens.set(true)(dealerCardTileTemplate),
//       isDeletedLens.set(true)(playerCardTileTemplate),
//       isDeletedLens.set(true)(tableTileTemplate),
//     ])
//   ]);
// };

const resetHiLo = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.all([
    contextApi.getChatRoom().saveTiles([
      imageS3KeyLens.set(faceDownCard.s3Key)(dealerCardTileTemplate),
      imageS3KeyLens.set(faceDownCard.s3Key)(playerCardTileTemplate),
      tableTileTemplate,
    ]),
  ])
}

const onActionPlayHiLo = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const currentStateName = 'state.casino.hilo.hilo'
  const dealerCardKey = _.sample(_.keys(cardDeck))
  const dealerCard = cardDeck[dealerCardKey]
  return Promise.all([
    contextApi.getActor().saveField(stringValueLens.set(dealerCardKey)(dealerCardFieldTemplate)),
    contextApi.getActor().saveCurrentActionStubs(stateActionStubSets[currentStateName]),
    contextApi.getActor().setCurrentActionEdges(stateActionGroups[currentStateName]),
    contextApi.getChatRoom().saveTiles([
      imageS3KeyLens.set(dealerCard.s3Key)(dealerCardTileTemplate),
      imageS3KeyLens.set(faceDownCard.s3Key)(playerCardTileTemplate),
      tableTileTemplate,
    ]),
  ])
}

const isHiLoWinner = (dealerCard: Card, playerCard: Card, higherOrLower: string): boolean => {
  return (higherOrLower == 'higher' && playerCard.rank > dealerCard.rank)
    || (higherOrLower == 'lower' && playerCard.rank < dealerCard.rank)
}

const doHiLoWinnerEffects = (contextApi: ChatRoomActionContextApi, higherOrLower: string): Promise<any> => {
  return contextApi.getActor().field(betAmountFieldTemplate)
    .then(numberValueLens.get)
    .then((winningAmount: number) => Promise.all([
      contextApi.getChatRoom().saveEffectOnTile(animGreenCheckEffectTemplate, aboveTableTileTemplate),
      incrementUserAttribute(contextApi.getActor(), UserAttributeKey.Wealth, winningAmount as number)
        .then((wealthValue: number) => `You played ${higherOrLower}. Lucky you! You won $${winningAmount}! You now have $${wealthValue} in your wallet. `)
        .then(contextApi.getActor().sendSystemMessage),
    ]))
}

const doHiLoLoserEffects = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return contextApi.getActor().sendSystemMessage('Sorry, no luck. This dealer is tough! Try try again!')
}

@UnrealChatroom({
  id: 'casino_hi_lo_1630',
})
export default class Casino implements UnrealOnEnter, UnrealOnReset {

  private readonly logger = LoggerFactory('handler.casino', 'NPC')

  onEnter(contextApi: ChatRoomActionContextApi): Promise<any> {
    this.logger.info('onEnter')
    resetHiLo(contextApi)

    contextApi.getActor().saveCurrentActionStubs(stateActionStubSets['state.casino.start'])
    contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.casino.start'])

    Promise.resolve(null)
      .then(_.partial(contextApi.getActor().readOrCreateLocalActionEdges, localActionNames))
      .then(_.partial(contextApi.getActor().setCurrentActionEdges, stateActionGroups['state.casino.start']))

    return contextApi
      .getActor()
      .sendSystemMessage('Welcome to the UnReal Casino! We got one game. Hi-Lo! Place your bets!')
  }

  onReset(contextApi: ChatRoomActionContextApi): Promise<any> {
    return common.resetIsFirstEnter(contextApi.getActor())
  }

  onExit(contextApi: ChatRoomActionContextApi): Promise<any> {
    this.logger.info('onExit')
    return resetHiLo(contextApi)
  }

  @UnrealAction('action.casino.bet5')
  @UnrealAction('action.casino.bet10')
  @UnrealAction('action.casino.bet20')
  onActionPlaceBet(contextApi: ChatRoomActionContextApi): Promise<any> {
    const amount = contextApi.getCurrentAction().args.amount
    return Promise.all([
      contextApi.getActor().saveField(numberValueLens.set(amount)(betAmountFieldTemplate)),
      contextApi.getActor().sendSystemMessage(`$${amount} it is! Now play - is your card HIGHER or LOWER?`),
      onActionPlayHiLo(contextApi),
    ])
  }

  @UnrealAction('action.casino.hilo.higher')
  @UnrealAction('action.casino.hilo.lower')
  onActionPickHigherOrLower(contextApi: ChatRoomActionContextApi): Promise<any> {
    const higherOrLower = contextApi.getCurrentAction().args.higherOrLower
    return contextApi.getActor().field(dealerCardFieldTemplate)
      .then(stringValueLens.get)
      // pick a random player card
      .then(
        (dealerCardKey: string) => ({
          dealerCard: cardDeck[dealerCardKey],
          playerCard: cardDeck[_.sample(_.without(_.keys(cardDeck), dealerCardKey))],
        })
      )
      // show the player card
      .then(sf.tap(
        ({ playerCard }) => contextApi.getChatRoom().saveTile(imageS3KeyLens.set(playerCard.s3Key)(playerCardTileTemplate))
      ))
      // brief pause 
      .then(sf.pause(350))
      // reset the action sheet
      .then(sf.tap(() => contextApi.getActor().saveCurrentActionStubs(stateActionStubSets['state.casino.start'])))
      .then(sf.tap(() => contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.casino.start'])))
      // show the winner/loser effects
      .then(
        ({ dealerCard, playerCard }) => isHiLoWinner(dealerCard, playerCard, higherOrLower)
          ? doHiLoWinnerEffects(contextApi, higherOrLower)
          : doHiLoLoserEffects(contextApi)
      )
  }

}
