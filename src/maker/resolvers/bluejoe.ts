
import {
  ActionResolver,
  ChatRoomActionContextApi,
  NewsfeedItemTemplate,
} from '../types'
import * as makerApi from '../api/MakerApi'
import Bluebird from 'bluebird'
import {
  sf, misc,
} from '../../utils'
import {
  NewsfeedItem,
  SaveImageInput,
  DynamicFeedItemLayout,
} from 'src/gql-types'
import _ from 'lodash'
import { registerReactionFnMap, ReactionFnMap, composeReactionFns } from '../../enginev3'
import { lotties, imageS3Key } from '../helpers'
import { incrementPositionOnMap, readPositionOnMap } from '../playerHelpers'
import { setGameState, getGameState, RootGameState, applyBackground } from '../chatRoomHelpers'
import { StaticNewsCards } from '../fxHelpers'
import * as messageBox from '../fx/animation.messagebox'
import * as DebugResetHandler from '../reactions/action.debug.reset'
import * as fxAddToInventory from '../fx/animation.addtoinventory'
import { SYSTEM_USER_EID } from 'src/env'
import { items } from 'src/domain/items'
import { moves } from 'src/domain/moves'

const numberValueLens = sf.lens('metadata.numberValue')

interface GameState extends RootGameState {
  sessionCount: number
  currentState: string
  chitChatIndex: number
}

const log = console.log
const unObjectId = 'blue_joe_1638'

const allStates = {
  notStarted: 'notStarted',
  chitchatting: 'chitchatting',
  chitChatComplete: 'chitChatComplete',
  hasBeenTraded: 'hasBeenTraded',
  questcomplete: 'questcomplete',

}

const INITIAL_GAME_STATE: GameState = {
  version: 1.0,
  lastVisit: Date.now(),
  sessionCount: 0,
  currentState: allStates.notStarted,
  chitChatIndex: 0,
}

const transitionState = (newState: string, contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.resolve(null)
    .then(() => getGameState(contextApi))
    .then((gameState: GameState) => {
      _.merge(gameState, { currentState: newState })
      return setGameState(contextApi, gameState)
    })
}

const onPlayerActionChitChat = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const says = [
    'Unreal is a new type of exclusive virtual world.',
    'The people are real but all your interactions are imaginary.',
    'You can go on quests, interact with objects and become anything you want.',
    'You can make your own objects and quests for your friends to interact with.',
    'Yeah, it\'s pretty fantastic.',
  ]

  return Promise.resolve(null)
    .then(() => Bluebird.Promise.props({
      avatarImage: contextApi.getUnObject().getImage(),
      gameState: getGameState(contextApi),
    }))
    .then(({ avatarImage, gameState }) => {
      const { s3Key } = avatarImage
      const avatarThumbBackgroundColor = contextApi.getUnObject().getKey('backgroundColor')
      return Promise.resolve(null)
        .then(() => says[Math.min(gameState.chitChatIndex, says.length - 1)])
        .then(sf.tap((message: string) => messageBox.changeMessageBox(message, s3Key, avatarThumbBackgroundColor, contextApi)))
        .then(() => setGameState(contextApi, { ...gameState, chitChatIndex: ++gameState.chitChatIndex }))
        .then(() => _.isEqual(gameState.chitChatIndex, says.length))
        .then(sf.thru_if(misc.isTrue)(
          () => {
            return transitionState(allStates.chitChatComplete, contextApi)
              .then(sf.pause(1000 * 4))
              .then(() => Promise.resolve('I see that you\'ve collected the magical jelly bean poop. If you are willing to trade it, I will give you what you are seeking...')
                .then((message: string) => messageBox.changeMessageBox(message, s3Key, avatarThumbBackgroundColor, contextApi))
              )
              .then(() => createLoreNewsPost(contextApi))
          }
        )
        )
        .then(() => updateActions(contextApi))
    })
}

const onPlayerActionTrade = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.resolve(null)
    .then(() => transitionState(allStates.hasBeenTraded, contextApi))
    .then(() => _.partial(contextApi.getActor().setCurrentActionEdges, []))
    .then(() => Bluebird.Promise.props({
      avatarImage: contextApi.getUnObject().getImage(),
    }))
    .then(({ avatarImage }) => {
      const { s3Key } = avatarImage
      const avatarThumbBackgroundColor = contextApi.getUnObject().getKey('backgroundColor')
      return Promise.resolve(null)
        .then(() => transitionState(allStates.questcomplete, contextApi))
        .then(() => updateActions(contextApi))
        .then(() => 'Congratulations, here is the Rainbow Brick. Now go meet my next friend on the map...')
        .then((message: string) => messageBox.changeMessageBox(message, s3Key, avatarThumbBackgroundColor, contextApi))
        .then(sf.pause(1000 * 4))
        .then(() => incrementPositionOnMap(contextApi.getActor()))
        .then(() => contextApi.getActor().createActionInstance({
          actionName: items.breath_mint_386.name,
          trxDescription: `Given to you by ${contextApi.getUnObject().getName()}`,
        }))
        .then(() => contextApi.getActor().deleteActionInstance({
          actionName: items.rainbow_poop_1619.name,
        }))
        .then(() => fxAddToInventory.animate(contextApi, imageS3Key.RainbowBrick))
        .then(() => 'Enjoy your journies...')
        .then((message: string) => messageBox.changeMessageBox(message, s3Key, avatarThumbBackgroundColor, contextApi))
        .then(() => giftBrickNews(contextApi))
    })
}

const onEnter = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('onEnter')
  return Promise.resolve(null)
    .then(() => getGameState(contextApi, INITIAL_GAME_STATE))
    .then((gameState: GameState) => {
      _.merge(gameState, { lastVisit: Date.now(), sessionCount: gameState.sessionCount + 1 })
      return setGameState(contextApi, gameState)
    })
    .then((gameState: GameState) => {
      return Promise.resolve(null)
        .then(() => applyBackground(contextApi, lotties.clouds_2))
        .then(() => readPositionOnMap(contextApi.getActor()))
        .then(numberValueLens.get)
        .then((positionOnMap: number) => positionOnMap >= 2)
        .then(sf.thru_if_else(misc.isTrue)(
          () => {
            return Promise.resolve(null)
              .then(() => {
                const avatarThumbBackgroundColor = contextApi.getUnObject().getKey('backgroundColor')
                const { currentState } = gameState
                if (_.isEqual(currentState, allStates.notStarted)) {
                  return transitionState(allStates.chitchatting, contextApi)
                    .then(() => Bluebird.Promise.props({
                      avatarImage: contextApi.getUnObject().getImage(),
                    }))
                    .then(({ avatarImage }) => {
                      const { s3Key } = avatarImage
                      return Promise.resolve('Hi! I\'m Joe! I\'m your lucky ticket for early access to Unreal!')
                        .then(sf.tap((message: string) => messageBox.changeMessageBox(message, s3Key, avatarThumbBackgroundColor, contextApi)))
                    })
                } else {
                  return Promise.resolve(null)
                }
              })
          }
        )(
          () => {
            return contextApi.getActor().sendSystemMessage('"Before, we interact, you should visit our friend Jacob, the hairy monster."', {
              image: {
                s3Key: 'action/color/lock.png',
              },
            })
              .then(() => createWanderingNewsPost(contextApi))
          }
        )
        )
    })
    .then(() => updateActions(contextApi))
}

const createWanderingNewsPost = (contextApi: ChatRoomActionContextApi): Promise<NewsfeedItem> => {
  const saveImageInput: SaveImageInput = {
    s3Key: _.sample([StaticNewsCards.WanderingMap]),
  }
  const statusText = _.sample([
    'Wandering the map, making new friends...',
  ])
  const input: NewsfeedItemTemplate = {
    layout: DynamicFeedItemLayout.Dynamic1,
    fromEid: SYSTEM_USER_EID,
    metadata: {
      statusText: statusText,
      image: saveImageInput,
    },
  }
  return makerApi.saveNewsfeedItem(contextApi.getContext(), input)
}

const createLoreNewsPost = (contextApi: ChatRoomActionContextApi): Promise<NewsfeedItem> => {
  const saveImageInput: SaveImageInput = {
    s3Key: _.sample([StaticNewsCards.Lore]),
  }
  const statusText = _.sample([
    '{{ linkName partner }} is being told the story of Unreal!'
    , '{{ linkName actor }} is telling {{ linkName partner }} all about Unreal.',
  ])
  const input: NewsfeedItemTemplate = {
    layout: DynamicFeedItemLayout.Dynamic1,
    fromEid: SYSTEM_USER_EID,
    metadata: {
      statusText: statusText,
      image: saveImageInput,
    },
  }
  return makerApi.saveNewsfeedItem(contextApi.getContext(), input)
}

const giftBrickNews = (contextApi: ChatRoomActionContextApi): Promise<NewsfeedItem> => {
  const saveImageInput: SaveImageInput = {
    s3Key: _.sample([StaticNewsCards.MagicObjectBrick]),
  }
  const statusText = _.sample([
    'Handed {{ linkName partner }} THE magic object.',
  ])
  const input: NewsfeedItemTemplate = {
    layout: DynamicFeedItemLayout.Dynamic1,
    fromEid: SYSTEM_USER_EID,
    metadata: {
      statusText: statusText,
      image: saveImageInput,
    },
  }
  return makerApi.saveNewsfeedItem(contextApi.getContext(), input)
}

const onPlayerActionReset = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.all([

    messageBox.remove(contextApi),

    setGameState(contextApi, {
      ...INITIAL_GAME_STATE,
    } as GameState),
  ])
}

const updateActions = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('update actions')
  return Promise.resolve(null)
    .then(() => getGameState(contextApi))
    .then((gameState: GameState) => {
      const { currentState } = gameState
      return Promise.resolve(null)
        .then(() => log('currentState=', { currentState }))
        .then(_.partial(contextApi.getActor().setCurrentActionEdges, stateActionGroups[currentState]))
    })
}

/** 
 * Mapping from state => action set
 */
export const stateActionGroups = {

  [allStates.notStarted]: [],

  [allStates.chitchatting]: [
    moves.tickle_782.name,
  ],

  [allStates.chitChatComplete]: [
    items.rainbow_poop_1619.name,
  ],
}

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {
    [DebugResetHandler.NAME]: composeReactionFns(
      onPlayerActionReset, onEnter
    ),

    [moves.tickle_782.name]: composeReactionFns(
      onPlayerActionChitChat
    ),

    [items.rainbow_poop_1619.name]: composeReactionFns(
      onPlayerActionTrade
    ),

  } as ReactionFnMap)
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onReset: null,
  onLoad: registerReactionFns,
}

export default actionResolver
