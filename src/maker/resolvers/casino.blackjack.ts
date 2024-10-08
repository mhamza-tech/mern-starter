/**
 * @rob4lderman
 * jan2020
 *  
 * what does it take to make blackjack?
 * 
 * - deal the player's first card
 * - deal the dealer's face-down card
 * - deal the player's second card
 * - deal the dealer's face-up card
 * - TILES: 
 *      - up to say 8 cards per hand
 *      - overlapping positions
 *      - could use lenses to increment the left position of each successive card
 *          - well not quite.. unless i also change the NAME of the tile
 * - FIELDS:
 *      - playerHand - array of cards
 *          - split produces a second hand? playerHands - array of array of cards
 *      - dealerHand - array of cards
 *      - playerBet - per hand
 *          - can double-down the bet
 * - UTILS:
 *      - compute score given array of cards
 *      - detect blackjack/bust/splits given array of cards
 *      - deal a card 
 *          - take into account the cards already dealt
 *      - translate playerHand -> visible tiles
 *      - initial dealing (after first action bet)
 * - ACTIONS: 
 *      - bet (start)
 *      - hit
 *      - stay
 *      - double-down   // phase2
 *      - split         // phase2
 *      - surrender?    // nobody does this
 * 
 * - calculate hand score
 * - detect blackjack
 * - handle bust
 * 
 * - show the dealer's face-down card
 * - deal the dealer's hand until at least soft 17
 * - calculate winner
 */

import {
  ActionResolver,
  ChatRoomActionContextApi,
  TileTemplate,
  FieldTemplate,
  JsonObjectFieldMetadata,
} from '../types'
import { LoggerFactory } from 'src/utils/logger'
import {
  sf,
} from '../../utils'
import _ from 'lodash'
import {
  registerReactionFnMap,
  ReactionFnMap,
} from '../../enginev3'
import {
  UserAttributeKey,
  incrementUserAttribute,
} from '../playerHelpers'
import {
  isDeletedLens,
  numberValueLens,
  betAmountFieldTemplate,
  tableTileTemplate,
  cardDeck,
  Card,
} from './casino.assets'
import {
  stateActionGroups,
  stateActionStubSets,
  localActionNames,
  actorHandFieldTemplate,
  metadataLens,
  PlayerHand,
  nameLens,
  metadataImageS3KeyLens,
  metadataContainerStyleLeftLens,
  dealerHandFieldTemplate,
  GameState,
  PlayerHandType,
  actorCardAnimatingTileTemplate,
  dealerCardAnimatingTileTemplate,
  metadataContainerStyleBottomLens,
  metadataContainerStyleZIndexLens,
  dealerCardTileBottomOffset,
  actorCardTileBottomOffset,
  greenCheckEffectTemplate,
  aboveTableTileTemplate,
} from './casino.blackjack.assets'
import { Tile } from '../../db/entity'
import Bluebird from 'bluebird'

const logger = LoggerFactory('handler.casino.blackjack', 'NPC')
const unObjectId = 'casino_blackjack_404'

const resetTable = (contextApi: ChatRoomActionContextApi): Promise<Tile[]> => {
  return Promise.all([
    contextApi.getChatRoom().saveTiles([
      isDeletedLens.set(true)(tableTileTemplate),
    ]),
  ])
}

const reInitHand = (fieldTemplate: FieldTemplate<JsonObjectFieldMetadata>, playerHand: PlayerHand): PlayerHand => {
  return {
    ...playerHand,
    ...fieldTemplate.metadata,
  }
}

const resetHands = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.all([
    resetPlayerHand(contextApi, dealerHandFieldTemplate),
    resetPlayerHand(contextApi, actorHandFieldTemplate),
  ])
}

const hardReset = (): Promise<any> => {
  // TODO const dealerCardTiles:TileTemplate[] = _.map( 
  // TODO     _.map( _.sampleSize( cardDeckArray, 10 ), mapDealerCardToTileTemplate ),
  // TODO     isDeletedLens.set(true)
  // TODO );
  // TODO const playerCardTiles:TileTemplate[] = _.map( 
  // TODO     _.map( _.sampleSize( cardDeckArray, 10 ), mapPlayerCardToTileTemplate ),
  // TODO     isDeletedLens.set(true)
  // TODO );
  // TODO return Promise.all([
  // TODO     contextApi.getChatRoom().saveTiles( dealerCardTiles ),
  // TODO     contextApi.getChatRoom().saveTiles( playerCardTiles ),
  // TODO ]);
  return Promise.resolve(null)
}

const resetPlayerHand = (contextApi: ChatRoomActionContextApi, fieldTemplate: FieldTemplate<JsonObjectFieldMetadata>): Promise<PlayerHand> => {
  return readPlayerHand(contextApi, fieldTemplate)
    .then(_.partial(unrenderPlayerHand, contextApi))
    .then(_.partial(reInitHand, fieldTemplate))
    .then(sf.tap((playerHand: PlayerHand) => logger.info('resetPlayerHand', { playerHand: logger.inspect(playerHand) })))
    .then(_.partial(savePlayerHand, contextApi, fieldTemplate))
}

const onActionPlaceBet = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const amount = contextApi.getCurrentAction().args.amount
  const nextStateName = 'state.casino.blackjack.deal.player'
  return Promise.all([
    resetHands(contextApi),
    saveBetAmount(contextApi, amount),
    contextApi.getActor().sendSystemMessage(`$${amount} it is! **Let's play!!**`),
    contextApi.getActor().saveCurrentActionStubs(stateActionStubSets[nextStateName]),
    contextApi.getActor().setCurrentActionEdges(stateActionGroups[nextStateName]),
  ])
    .then(sf.pause(500))   // this helps ensure the "delete tiles" event under resetPlayerHand arrives before the next deal
    .then(_.partial(dealInitialBlackjackHands, contextApi))
}

const dealInitialBlackjackHands = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.all([
    dealFirstTwoPlayerCards(contextApi)
      .then(_.partial(dealFirstDealerCard, contextApi)),
    
    // TODO: contextApi.getChatRoom().saveTiles([
    // TODO:     imageS3KeyLens.set(dealerCard.s3Key)(dealerCardTileTemplate),
    // TODO:     imageS3KeyLens.set(faceDownCard.s3Key)(playerCardTileTemplate),
    // TODO:     tableTileTemplate
    // TODO: ]),
  ])
}

const dealFirstTwoPlayerCards = (contextApi: ChatRoomActionContextApi): Promise<PlayerHand> => {
  return readPlayerHand(contextApi, actorHandFieldTemplate)
    .then(_.partial(dealCard, reInitHand(dealerHandFieldTemplate, null)))  // dealerHand is empty, that's why initHand() is OK here
    .then(sf.tap_wait(_.partial(renderLastCard, contextApi)))
    .then(sf.pause(500))
    .then(_.partial(dealCard, reInitHand(dealerHandFieldTemplate, null)))
    .then(sf.tap_wait(_.partial(renderLastCard, contextApi)))
    .then(sf.pause(500))
    .then(calcScore)
    // .then( _.partial( renderPlayerHand, contextApi ) )
    .then(sf.tap((playerHand: PlayerHand) => logger.info('dealFirstTwoPlayerCards', { playerHand: logger.inspect(playerHand) })))
    .then(_.partial(savePlayerHand, contextApi, actorHandFieldTemplate))
}

const dealFirstDealerCard = (contextApi: ChatRoomActionContextApi, actorHand: PlayerHand): Promise<any> => {
  logger.info('dealFirstDealerCard', { actorHand: logger.inspect(actorHand) })
  return readPlayerHand(contextApi, dealerHandFieldTemplate)
    .then(_.partial(dealCard, actorHand))
    .then(sf.tap_wait(_.partial(renderLastCard, contextApi)))
    .then(calcScore)
    .then(sf.tap((dealerHand: PlayerHand) => logger.info('dealFirstDealerCard', { dealerHand: logger.inspect(dealerHand) })))
    .then(_.partial(savePlayerHand, contextApi, dealerHandFieldTemplate))
}

const isPlayerHandBust = (playerHand: PlayerHand): boolean => playerHand.score > 21

const isActorWinner = (actorHand: PlayerHand, dealerHand: PlayerHand): boolean => {
  return !!!isPlayerHandBust(actorHand)
    && (
      isPlayerHandBust(dealerHand)
      || actorHand.score > dealerHand.score
    )
}

const isATie = (actorHand: PlayerHand, dealerHand: PlayerHand): boolean => {
  return !!!isPlayerHandBust(actorHand) && actorHand.score === dealerHand.score
}

const randomCard = (unavailableCards: Card[]): Card => {
  const unavailableCardKeys: string[] = _.map(unavailableCards, (card: Card) => card.name)
  return cardDeck[_.sample(_.without(_.keys(cardDeck), ...unavailableCardKeys))]
}

const isAce = (card: Card): boolean => card.rank === 14

const mapCardToValue = (card: Card): number => {
  if (card.rank <= 10) {
    return card.rank
  } else if (isAce(card)) {
    return 11
  } else {
    return 10
  }
}

const replaceFirst = (cardValues: number[], replaceMe: number, withMe: number): number[] => {
  const idx = cardValues.indexOf(replaceMe)
  if (idx >= 0) {
    const newCardValues = _.clone(cardValues)
    newCardValues[idx] = withMe
    return newCardValues
  } else {
    return cardValues
  }
}

const calcScoreRecursive = (cardValues: number[]): number => {
  const score = _.sum(cardValues)
  if (score <= 21) {
    return score
  } else if (_.includes(cardValues, 11)) { // has ace
    return calcScoreRecursive(replaceFirst(cardValues, 11, 1))
  } else {
    return score
  }
}

/**
 * 1. aces count as 1 or 11
 * 2. each time you encounter an ace, the hand score splits.
 * 3. this feels recursive.
 * NAH... much easier: just always assume the highest score. 
 * if it's a bust, then treat the Ace as a 1 and re-calc.
 * do for every Ace until you get back below 21.
 * 
 * @param playerHand 
 */
const calcScore = (playerHand: PlayerHand): PlayerHand => {
  const cardValues = _.map(playerHand.cards, mapCardToValue)
  const score = calcScoreRecursive(cardValues)
  return {
    ...playerHand,
    score,
  }
}

const dealCard = (opponentHand: PlayerHand, playerHand: PlayerHand): PlayerHand => {
  logger.info('dealCard', { opponentHand, playerHand })
  return {
    ...playerHand,
    cards: [...playerHand.cards, randomCard(_.concat(playerHand.cards, opponentHand.cards))],
  }
}

const mapPlayerHandToCardTileTemplates = (playerHand: PlayerHand): TileTemplate[] => {
  return _.map(
    playerHand.cards,
    _.partial(mapPlayerCardToTileTemplate, mapPlayerHandToCardTileTemplate(playerHand))
  )
}

const mapPlayerHandToCardTileTemplate = (playerHand: PlayerHand): TileTemplate => {
  switch (playerHand.playerHandType) {
    // case PlayerHandType.ActorHand: return actorCardTileTemplate;
    // case PlayerHandType.DealerHand: return dealerCardTileTemplate;
    case PlayerHandType.ActorHand: return actorCardAnimatingTileTemplate
    case PlayerHandType.DealerHand: return dealerCardAnimatingTileTemplate
    default: throw new Error(`ERROR: mapPlayerHandToCardTileTemplate: ${JSON.stringify(playerHand)}`)
  }
}

const isActorTileTemplate = (tileTemplate: TileTemplate): boolean => {
  // return tileTemplate.name === actorCardTileTemplate.name ;
  return tileTemplate.name === actorCardAnimatingTileTemplate.name
}

const bottomPosition = (tileTemplate: TileTemplate, index: number): string => {
  return isActorTileTemplate(tileTemplate)
    ? `${(index % 2) * 2 + actorCardTileBottomOffset}%`
    : `${(index % 2) * 2 + dealerCardTileBottomOffset}%`
}

const mapPlayerCardToTileTemplate = (tileTemplate: TileTemplate, card: Card, index: number): TileTemplate => {
  return _.chain(tileTemplate)
    .thru(nameLens.set(`${tileTemplate.name}.${index}`))
    .thru(metadataImageS3KeyLens.set(card.s3Key))
    .thru(metadataContainerStyleLeftLens.set(`${index * 10 + 15}%`))
    .thru(metadataContainerStyleBottomLens.set(bottomPosition(tileTemplate, index)))
    .thru(metadataContainerStyleZIndexLens.set(10 + index * 500))
    .value() as TileTemplate
}

const unrenderPlayerHand = (contextApi: ChatRoomActionContextApi, playerHand: PlayerHand): Promise<PlayerHand> => {
  const tiles: TileTemplate[] = _.map(
    mapPlayerHandToCardTileTemplates(playerHand),
    isDeletedLens.set(true)
  )
  // -rx- logger.info( 'unrenderPlayerHand', { tiles: logger.inspect( tiles ) });
  return Promise.resolve(tiles)
    .then(contextApi.getChatRoom().saveTiles)
    .then(() => playerHand)
}

const renderLastCard = (contextApi: ChatRoomActionContextApi, playerHand: PlayerHand): Promise<Tile> => {
  const lastCard: Card = _.last(playerHand.cards)
  const index: number = playerHand.cards.length - 1
  const tileTemplate: TileTemplate = mapPlayerHandToCardTileTemplate(playerHand)
  const cardTileTemplate: TileTemplate = mapPlayerCardToTileTemplate(tileTemplate, lastCard, index)
  return Promise.resolve(cardTileTemplate)
    .then(contextApi.getChatRoom().saveTile)
}

const readPlayerHand = (contextApi: ChatRoomActionContextApi, fieldTemplate: FieldTemplate<JsonObjectFieldMetadata>): Promise<PlayerHand> => {
  return contextApi.getActor().field(fieldTemplate)
    .then(metadataLens.get)
    // this line pushes new props from the template into the live data
    .then((playerHand: PlayerHand) => _.merge({}, fieldTemplate.metadata, playerHand))
}

const savePlayerHand = (contextApi: ChatRoomActionContextApi, fieldTemplate: FieldTemplate<JsonObjectFieldMetadata>, playerHand: PlayerHand): Promise<PlayerHand> => {
  return Promise.resolve(playerHand)
    .then(metadataLens.apply(fieldTemplate))
    .then(contextApi.getActor().saveField)
    .then(metadataLens.get)
}

const readGameState = (contextApi): Promise<GameState> => {
  return Bluebird.Promise.props({
    dealerHand: readPlayerHand(contextApi, dealerHandFieldTemplate),
    actorHand: readPlayerHand(contextApi, actorHandFieldTemplate),
  })
}

const onActionBlackjackHit = (contextApi: ChatRoomActionContextApi): Promise<PlayerHand> => {
  // -rx- contextApi.getActor().sendSystemMessage( 'You played HIT' );
  return readGameState(contextApi)
    .then(
      (gameState: GameState) => Promise.resolve(gameState.actorHand)
        .then(_.partial(dealCard, gameState.dealerHand))
        .then(sf.tap_wait(_.partial(renderLastCard, contextApi)))
        .then(calcScore)
        .then(sf.tap((actorHand: PlayerHand) => logger.info('onActionBlackjackHit', { actorHand: logger.inspect(actorHand) })))
        .then(_.partial(savePlayerHand, contextApi, actorHandFieldTemplate))
        .then(sf.tap(
          (actorHand: PlayerHand) => isPlayerHandBust(actorHand)
            ? Promise.all([
              doBustedEffects(contextApi)
                .then(() => dealOutDealerHand(contextApi, actorHand, gameState.dealerHand))
                .then(_.partial(savePlayerHand, contextApi, dealerHandFieldTemplate)),
            ])
            : null
        ))
    )
}

const shouldDealerHit = (dealerHand: PlayerHand): boolean => dealerHand.score < 17

/**
 * deal a card
 * check hand value. if < 17, deal another card
 * pause in between.
 * show cards one at a time.
 */
const dealOutDealerHand = (contextApi: ChatRoomActionContextApi, actorHand: PlayerHand, dealerHand: PlayerHand): Promise<PlayerHand> => {
  logger.info('dealOutDealerHand', { dealerHand: logger.inspect(dealerHand) })
  return Promise.resolve(dealerHand)
    .then(_.partial(dealCard, actorHand))
    .then(sf.tap_wait(_.partial(renderLastCard, contextApi)))
    .then(calcScore)
    .then(sf.thru_if(shouldDealerHit)(
      (dealerHand: PlayerHand) => Promise.resolve(dealerHand)
        .then(sf.pause(1500))
        .then(_.partial(dealOutDealerHand, contextApi, actorHand))
    ))
}

const setStartingActions = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const nextStateName = 'state.casino.start'
  contextApi.getActor().saveCurrentActionStubs(stateActionStubSets[nextStateName])
  return contextApi.getActor().setCurrentActionEdges(stateActionGroups[nextStateName])
}

const onActionBlackjackStay = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  // -rx- contextApi.getActor().sendSystemMessage( 'You played STAY' );
  return readGameState(contextApi)
    .then(
      (gameState: GameState) => Promise.resolve(gameState.dealerHand)
        .then(_.partial(dealOutDealerHand, contextApi, gameState.actorHand))
        .then(_.partial(savePlayerHand, contextApi, dealerHandFieldTemplate))
        .then(
          (dealerHand: PlayerHand) => {
            if (isActorWinner(gameState.actorHand, dealerHand)) {
              return doWinningEffects(contextApi)
            } else if (isATie(gameState.actorHand, dealerHand)) {
              return doPushEffects(contextApi)
            } else {
              return doLosingEffects(contextApi)
            }
          }
        )
      // -rx- .then( () => contextApi.getActor().sendSystemMessage( 'DONE DEALING') )
    )
}

const onActionBlackjackDoubleDown = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Bluebird.Promise.props({
    actorHand: onActionBlackjackHit(contextApi),
    betAmount: doubleBetAmount(contextApi),
  })
    .then(
      ({ actorHand }) => isPlayerHandBust(actorHand)
        ? null
        : onActionBlackjackStay(contextApi)
    )
}

const doubleBetAmount = (contextApi: ChatRoomActionContextApi): Promise<number> => {
  return readBetAmount(contextApi)
    .then((amount: number) => amount * 2)
    .then(_.partial(saveBetAmount, contextApi))
}

const readBetAmount = (contextApi: ChatRoomActionContextApi): Promise<number> => {
  return contextApi.getActor().field(betAmountFieldTemplate)
    .then(numberValueLens.get)
}

const saveBetAmount = (contextApi: ChatRoomActionContextApi, amount: number): Promise<number> => {
  return contextApi.getActor().saveField(numberValueLens.set(amount)(betAmountFieldTemplate))
    .then(numberValueLens.get)
}

const pauseResolve = (pauseMs: number) => (val: any): Promise<any> => {
  return Promise.resolve(null)
    .then(sf.pause(pauseMs))
    .then(() => val)
}

const doWinningEffects = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return pauseResolve(1500)(contextApi)
    .then(readBetAmount)
    .then((winningAmount: number) => Promise.all([
      setStartingActions(contextApi),
      contextApi.getChatRoom().saveEffectOnTile(greenCheckEffectTemplate, aboveTableTileTemplate),
      // TODO: contextApi.getChatRoom().saveTile(greenCheckAnimatingTileTemplate),
      incrementUserAttribute(contextApi.getActor(), UserAttributeKey.Wealth, winningAmount as number)
        .then((wealthValue: number) => `Lucky you! **You won $${winningAmount}!** You now have $${wealthValue} in your wallet.`)
        .then(contextApi.getActor().sendSystemMessage),
    ]))
}

const doBustedEffects = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return pauseResolve(1000)(contextApi)
    .then(() => Promise.all([
      setStartingActions(contextApi),
      contextApi.getActor().sendSystemMessage(`Sorry, **you busted** ${_.sample([':(', ':/', '8-('])}`),
    ]))
}

const doPushEffects = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return pauseResolve(1000)(contextApi)
    .then(() => Promise.all([
      setStartingActions(contextApi),
      contextApi.getActor().sendSystemMessage('It\'s a **push!**'),
    ]))
}

const doLosingEffects = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return pauseResolve(1000)(contextApi)
    .then(() => Promise.all([
      setStartingActions(contextApi),
      contextApi.getActor().sendSystemMessage(`Sorry, no luck ${_.sample([':(', ':/', '8-('])}`),
    ]))
}

const onEnter = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  logger.info('onEnter')
  resetTable(contextApi)
  resetHands(contextApi)
  contextApi.getActor().saveCurrentActionStubs(stateActionStubSets['state.casino.start'])
  contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.casino.start'])
  Promise.resolve(null)
    .then(_.partial(contextApi.getActor().readOrCreateLocalActionEdges, localActionNames))
    .then(_.partial(contextApi.getActor().setCurrentActionEdges, stateActionGroups['state.casino.start']))
  
  return contextApi.getActor().sendSystemMessage(
    'Welcome to the UnReal Casino! We got **BLACKJACK!** Place your bet!'
  )
}

const onExit = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  logger.info('onExit')
  return resetTable(contextApi)
}

const onReset = (): Promise<any> => {
  return hardReset()
}

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {
    'Action.Debug.Reset': onReset,
    'action.casino.bet5': onActionPlaceBet,
    'action.casino.bet10': onActionPlaceBet,
    'action.casino.bet20': onActionPlaceBet,
    'action.casino.blackjack.hit': onActionBlackjackHit,
    'action.casino.blackjack.stay': onActionBlackjackStay,
    'action.casino.blackjack.doubledown': onActionBlackjackDoubleDown,
  } as ReactionFnMap)
}

const onLoad = (): Promise<any> => {
  logger.debug('onLoad')
  return registerReactionFns()
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onExit,
  onReset,
  onLoad,
}

export default actionResolver
