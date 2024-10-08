import _ from 'lodash'
import {
  ActionResolver,
  ChatRoomActionContextApi,
  NodeApi,
  ActionXStub,
  EffectTemplate,
  ConcurrentEffectMetadata,
} from '../../types'
import { LoggerFactory } from 'src/utils/logger'
import {
  itemFieldTemplate,
  dropTile,
  animateSpin,
  jsonValueLens,
  gameStateField,
  initialReels,
} from './assets'
import { ActionXInstance } from 'src/gql-types'
import { items, Item } from 'src/domain/items'
import { probability as winProbability, lotties } from '../../helpers'
import { ReactionFnMap, BeforeEnterAsset } from 'src/enginev3/types'
import { WILDCARD_ACTION, registerReactionFnMap } from 'src/enginev3'
import * as ResetAction from '../../reactions/action.debug.reset'
import { Actions, ReelSymbolData, GameState } from './types'
import { incHashtribute } from 'src/maker/hashtributes'
import { StringTag } from 'src/domain/strings'
import { defaultsDeep } from 'src/utils/misc'
import { animate } from 'src/maker/fx/animation.removeFromRoom'

/*
Knife 5%
Dildo 5%
Mosquito 5%
Breath Mint 5%
Used Condom 5%
Water Balloon 10%
Glitter Bomb 10%
Garbage Bag 10%
Spoiled Tiger Milk
Expired Patty
*/

const logger = LoggerFactory('recycle', 'NPC')
const REWARDS: Item[] = [
  ..._.times(5, () => items.knife_585),
  ..._.times(5, () => items.dildo_1649),
  ..._.times(5, () => items.mosquito_625),
  ..._.times(5, () => items.breath_mint_386),
  ..._.times(5, () => items.used_condom_1740),
  ..._.times(10, () => items.water_balloon_1358),
  ..._.times(10, () => items.glitter_bomb_520),
  ..._.times(20, () => items.garbage_bag_1654),
  ..._.times(35, () => items.rotten_patty_1139),
]

const ID = 'recycle_machine_1315'

const config = {
  // chance of a winning spin
  chance: 30, // JMR: TODO: Remember to put this back to whatever the design calls for.
  // chance of populating reels with actual items rather than the 'Thank You' symbol
  itemOnReelChance: 0.5, // JMR: TODO: Tweak this for visuals
}

const reelItemPositions = [
  [
    { left: 20, top: 60.5 },
    { left: 20, top: 67.5 },
    { left: 20, top: 74.5 },
  ],
  [
    { left: 44, top: 60.5 },
    { left: 44, top: 67.5 },
    { left: 44, top: 74.5 },
  ],
  [
    { left: 68, top: 60.5 },
    { left: 68, top: 67.5 },
    { left: 68, top: 74.5 },
  ],
]

const thankyouS3Key = 'npc/recycle_machine_1315/thankyou.png'

const getState = (api: ChatRoomActionContextApi): Promise<GameState> => {
  return api.getChatRoom().field(gameStateField)
    .then((field): GameState => field.metadata.state)
}

const saveState = (api: ChatRoomActionContextApi, state: GameState): Promise<any> => {
  const room = api.getChatRoom()
  return room.saveField(defaultsDeep({ metadata: { state } }, gameStateField))
    .then((field): GameState => field.metadata.state)
}

const showString = (api: ChatRoomActionContextApi, context: string, item?: Item): Promise<any> => {
  const tags: StringTag[] = [ID, 'target_actor']

  if (context === 'welcome') {
    tags.push('onroomentered')
  } else if (context === 'offered') {
    tags.push('onitemused')
  } else if (context === 'spinFinished') {
    if (item) {  // won spin
      tags.push('win')
    } /*else { // lost spin - disabled by request from jeff
      tags.push('loose')
    }*/
  } else if (context === 'continue') {
    tags.push('continue')
  }

  return api.getActor().sendMessage({
    tags, optional: [], values: { item }, from: api.getUnObject(),
  })
}

const persistWin = (api: ChatRoomActionContextApi, item: Item): Promise<any> => {
  // Save the win item name and s3Tag to local storage
  // This is retrieved in the two animation ActionCallbacks [onSpinAnimationFinished, onWinAnimationFinished]
  logger.info(`Given name: ${item.name}, given key: ${item.s3Key}`)
  return api.getChatRoom().saveField(jsonValueLens.set({
    name: item.name,
    text: item.text,
    s3Key: item.s3Key,
  })(itemFieldTemplate))
}

const persistLose = (api: ChatRoomActionContextApi): Promise<any> => {
  return api.getChatRoom().saveField(jsonValueLens.set({
    name: 'Thank You',
    text: 'Thank You',
    s3Key: thankyouS3Key,
  })(itemFieldTemplate))
}

const loadItem = (api: ChatRoomActionContextApi): Promise<any> => {
  return api.getChatRoom().field(itemFieldTemplate)
    .then(jsonValueLens.get)
    .then((givenItem) => {
      return givenItem
    })
}

const randomItemKey = (collection: Item[]): string => {
  if (Math.random() < config.itemOnReelChance)
    return (_.sample(collection) as Item).s3Key
  else
    return thankyouS3Key
}

const renderInitialReels = (): EffectTemplate<ConcurrentEffectMetadata> => {
  const reelItems: ReelSymbolData[] = []
  for (let i = 0; i < 9; i++) {
    const reel = i / 3 << 0
    const position = i % 3 << 0
    let reelItemS3Key = ''
    reelItemS3Key = randomItemKey(REWARDS)

    const symbol: ReelSymbolData = {
      s3Key: reelItemS3Key,
      containerConfig: {
        left: reelItemPositions[reel][position].left,
        top: reelItemS3Key == thankyouS3Key ?
          reelItemPositions[reel][position].top - 6.5 :
          reelItemPositions[reel][position].top,
        width: 12,
        height: reelItemS3Key == thankyouS3Key ? 20 : 7,
      },
    }

    reelItems.push(symbol)
  }

  return initialReels(reelItems)
}

const prepareSpinAnimation = (winLineItem?: string): EffectTemplate<ConcurrentEffectMetadata> => {
  const reelItems: ReelSymbolData[] = []
  for (let i = 0; i < 9; i++) {
    const reel = i / 3 << 0
    const position = i % 3 << 0
    const reelItemS3Key = ((): string => {
      if (position == 1) {
        if (winLineItem !== undefined) {
          return winLineItem
        } else {
          return randomItemKey(REWARDS)
        }
      } else {
        if (winLineItem !== undefined) {
          return randomItemKey(REWARDS.filter((item) => item.s3Key !== winLineItem))
        } else {
          return randomItemKey(REWARDS)
        }
      }
    })()

    const symbol: ReelSymbolData = {
      s3Key: reelItemS3Key,
      containerConfig: {
        left: reelItemPositions[reel][position].left,
        top: reelItemS3Key == thankyouS3Key ? reelItemPositions[reel][position].top - 6.5 : reelItemPositions[reel][position].top,
        width: 12,
        height: reelItemS3Key == thankyouS3Key ? 20 : 7,
      },
    }

    reelItems.push(symbol)
  }

  return animateSpin(reelItems)
}

// On Item Dropped into Recycler
const onItemDropped = async (api: ChatRoomActionContextApi): Promise<any> => {
  const actionName = api.getCurrentActionName()
  const curState = await getState(api)
  if (curState.offeredItem != '') {
    return null
  }
  const newState: GameState = {
    offeredItem: actionName,
  }

  return api.getActor().readAllActionInstances().then((inventory) => {
    const actor = api.getActor()
    const toDeposit = inventory.find(item => item.actionName === actionName)
    if (toDeposit != undefined) {
      return Promise.all([
        showString(api, 'offered'),
        deleteItem(toDeposit, actor).then(() => recalculateItems(api)),
        saveState(api, newState),
      ]).then(() => spin(api))
    } else return Promise.resolve(null)
  })
}

const giveItem = (api: ChatRoomActionContextApi, item: Item): Promise<ActionXInstance> => {
  return api.getActor().createActionInstance({ actionName: item.name })
    .then(() => recalculateItems(api))
}

const onSpinAnimationFinished = async (api: ChatRoomActionContextApi): Promise<any> => {
  const state: GameState = {
    offeredItem: '',
  }

  const givenItem = await loadItem(api)

  if (givenItem.s3Key === thankyouS3Key) {
    return Promise.all([
      incHashtribute(api.getActor(), 'gives_a_shit_1699'),
      // removed on request from Jeff
      //showString(api, 'spinFinished'),
      saveState(api, state),
    ])
  } else {
    return Promise.all([
      showString(api, 'spinFinished', givenItem),
      api.getChatRoom().saveEffect(animate(givenItem.s3Key)),
      giveItem(api, givenItem),
      saveState(api, state),
    ])
  }
}
//.then(() => saveState(api, state))
// const onWinAnimationFinished = async (api: ChatRoomActionContextApi): Promise<any> => {
//   const state : GameState = {
//     offeredItem: '',
//   }
//   // Load the win item name and s3Tag to local storage
//   return loadItem(api).then((givenItem) => Promise.all([
//     api.getActor().createActionInstance({ actionName: givenItem.name })
//       .then(() => recalculateItems(api)),
//     showString(api, 'continue'),
//     saveState(api, state),
//   ]))
// }

const itemsToActionXStubs = (items: ActionXInstance[]): ActionXStub[] => {
  return _.uniqBy(items, 'actionName').map((item): ActionXStub => (
    { actionName: item.actionName, isGivable: false, isUsable: false }
  ))
}

const recalculateItems = async (api: ChatRoomActionContextApi): Promise<any> => {
  return api.getActor().readAllActionInstances().then((inventory) => {
    return api.getActor().saveCurrentActionStubs({
      staticActionStubs: [],
      actionInstanceStubs: itemsToActionXStubs(inventory),
    })
  })
}

const deleteItem = (item: ActionXInstance, from: NodeApi): Promise<ActionXInstance> => {
  return from.deleteActionInstance({ id: item.id })
}

// JMR: This preloads all items
const onBeforeEnter = async (): Promise<BeforeEnterAsset[]> => {
  return [...REWARDS, lotties.reel_spin]
}

const onEnter = (api: ChatRoomActionContextApi): Promise<any> => {
  const room = api.getChatRoom()
  const state: GameState = {
    offeredItem: '',
  }
  return Promise.all([
    room.saveTile(dropTile),
    showString(api, 'welcome'),
    recalculateItems(api),
    room.saveEffect(renderInitialReels()),
    saveState(api, state),
  ])
}

const onReset = (api: ChatRoomActionContextApi): Promise<any> => {
  return onEnter(api)
}

const spin = async (api: ChatRoomActionContextApi): Promise<any> => {
  const state = await getState(api)
  // choose the won item before the spin effect
  if (winProbability(config.chance) == true) {
    const givenItem: Item = _.sample(REWARDS.filter((prize) => prize.name !== state.offeredItem)) as Item
    // and save the item to local storage this is so
    // we can have well timed callbacks to get the best visuals
    return Promise.all([
      persistWin(api, givenItem),
      api.getChatRoom().saveEffect(prepareSpinAnimation(givenItem.s3Key)),
    ])
  } else {
    return Promise.all([
      persistLose(api),
      api.getChatRoom().saveEffect(prepareSpinAnimation(thankyouS3Key)),
    ])
  }
}

const registerReactionFns = (): Promise<any> => {
  const reactions: ReactionFnMap = {
    [ResetAction.NAME]: onReset,
    [WILDCARD_ACTION]: onItemDropped,
    // [Actions.PrizeReady]: onWinAnimationFinished,
    [Actions.SpinFinished]: onSpinAnimationFinished,
  }
  return registerReactionFnMap(ID, reactions)
}

const actionResolver: ActionResolver = {
  unObjectId: ID,
  onEnter,
  onBeforeEnter,
  onLoad: registerReactionFns,
  onReset,
}

export default actionResolver
