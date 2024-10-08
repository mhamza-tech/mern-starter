import {
  ActionResolver,
  ChatRoomActionContextApi,
  SaveTileInputInContext,

} from '../types'
import { TileType, Tile } from '../../gql-types'
import _ from 'lodash'
import { registerReactionFnMap, ReactionFnMap, composeReactionFns, SkipReactionsError } from '../../enginev3'
import { hasVisited, setHasVisited } from '../playerHelpers'
import { setGameState, getGameState, RootGameState, applyBackground } from '../chatRoomHelpers'

import { lotties } from '../helpers'
import { LoggerFactory } from 'src/utils/logger'
import { items } from 'src/domain/items'
import { moves } from 'src/domain/moves'

const logger = LoggerFactory('monkeybutt', 'NPC')

interface GameState extends RootGameState {
  actions: {
    look: number
    kick: number
    smell: number
    cage: number
  }
  monkey: {
    isCaged: boolean
  }
}

const log = logger.info
const unObjectId = 'monkey_butt_1640'
const initialGameState: GameState = {
  version: 1.2,
  lastVisit: Date.now(),
  actions: {
    look: 0,
    kick: 0,
    smell: 0,
    cage: 0,
  },
  monkey: {
    isCaged: false,
  },
}

const localActions = {
  // Hug: 'Action.MonkeyButt.Hug',
  // GiveBeer: 'Action.MonkeyButt.GiveBeer',
  // Kick: 'Action.MonkeyButt.Kick',
  // Smell: 'Action.MonkeyButt.Smell',
  Cage: 'Action.MonkeyButt.Cage',
}

// TODO: remove entry id
const cageTile: SaveTileInputInContext = {
  name: 'cageTile',
  type: TileType.ImageTile,
  image: {
    uri: 'http://unrealfun.imgix.net/tile/cage.png',
  },
  metadata: {
    containerStyle: {
      backgroundColor: 'transparent',
      top: 0,
      left: 0,
      height: 100,
      width: 100,
      zIndex: 100,
    },
  },
}

const tilePoopSplatter: SaveTileInputInContext = {
  name: 'monkeybutt.tilePoopSplatter',
  type: TileType.ImageTile,
  metadata: {
    image: {
      uri: `http://unrealfun.imgix.net/overlay/blood_bath_2.png?w=${750}`,
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 0,
      left: 0,
      height: 100,
      width: 100,
      zIndex: 3,
      borderWidth: 0,
      borderColor: 'red',
    },
  },
}

const skipIf = (contextApi: ChatRoomActionContextApi, gameState: GameState): Promise<any> => {
  if (gameState.monkey.isCaged) {
    const npcName = contextApi.getUnObject().getName()
    // await contextApi.getActor().sendSystemMessage(`You can't kick a Monkey behind bars.`)

    return contextApi.getActor().sendSystemMessage(
      _.sample([
        `You can't do that when ${npcName} is behind bars.`
        , `${npcName} is in a cage and can't be reached.`,
      ])
    ).then(() => {
      return Promise.reject(SkipReactionsError)
    })
  } else {
    return Promise.resolve(null)
  }
}

const onPlayerActionLook = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  let gameState: GameState

  gameState = await getGameState(contextApi) as GameState
  // const systemSentences: string[] =
  //     ['Very hairy', 'There are pimples and poop remnants', 'Still hairy!', 'Very very hairy']

  const npcName = contextApi.getUnObject().getName()

  const objectSentences: string[] = [
    `${npcName} glares at you... "why are you looking at my butt?"`,
    `${npcName} turns and looks at you... "are you a proctologist or something?"`,
    `${npcName} angrily says, "want to pick off some of my dried poop remnants?"`,
    `${npcName} giggles, "hairy, isn't it?!"`,
    `${npcName} jumps up and down, "still hairy!"`,
    `"Want to pop my butt pimples", asks ${npcName}.`,
  ]

  ++gameState.actions.look

  // const systemSentence = systemSentences[Math.min(gameState.actions.look, systemSentences.length) - 1]

  // await contextApi.getUser().sendSystemMessage(systemSentence)

  // setTimeout(
  //     () => simulateTypingReplyComment(contextApi, objectSentences[Math.min(gameState.actions.look, objectSentences.length) - 1]),
  //     500,
  // )

  setTimeout(
    () => contextApi.getActor().sendSystemMessage(objectSentences[Math.min(gameState.actions.look, objectSentences.length) - 1]),
    500
  )

  gameState = await setGameState(contextApi, gameState) as GameState

  return Promise.resolve(null)
}

const onPlayerActionHug = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return getGameState(contextApi)
    .then((gameState: GameState) => skipIf(contextApi, gameState))
    .then(() => {
      // if (gameState.monkey.isCaged) return await contextApi.getActor().sendSystemMessage(`You can't hug the Monkey because he is behind bars.`)

      const systemMessage = 'You hugged a little too hard and got a Monkey Butt fart!'

      return Promise.all([

        contextApi.doSourcedAnimation(lotties.buttcoin)
        , contextApi.getUser().sendSystemMessage(`${systemMessage}`)

        // , setGameState(contextApi, gameState)

        , contextApi.createNewsfeedItemUnObjectCard(`${contextApi.getUnObject().getName()} farted on {{ name actor }} 💨`),

        // , incHashtributeRaw(contextApi.getActor(), 'animal_lover_1685', 1),

      ])
    })
}

const onPlayerActionKick = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return getGameState(contextApi)
    .then((gameState: GameState) => {
      return skipIf(contextApi, gameState)
        .then(() => {
          ++gameState.actions.kick

          // const actionCount = await actionApi.increment(contextApi, args)
          const systemMessages: string[] = [
            'Oh, that\'s not a good idea.',
            'That will upset the monkey.',
            'It\'s not nice to kick a monkey.',
          ]

          const systemSentence = systemMessages[Math.min(gameState.actions.kick, systemMessages.length) - 1]

          // setTimeout(
          //     () =>
          //         simulateTypingReplyComment(contextApi, `Can you stop kicking my butt, please?`),
          //     500
          // )
          contextApi.getActor().sendSystemMessage(`"Can you stop kicking my butt, please?, requests ${contextApi.getUnObject().getName()}"`)

          setTimeout(
            () => {
              // contextApi.getChatRoom().saveLocalTile(tilePoopSplatter)
              contextApi.getActor().sendSystemMessage(`${contextApi.getUnObject().getName()} seems mad. He threw poop at you.`)

              contextApi.getPartner().createActionInstance({
                actionName: items.poop_678.name,
                trxDescription: `Given to you by ${contextApi.getUnObject().getName()}`,
              })
            },
            1000 * 60
          )

          return Promise.all([

            contextApi.getActor().sendSystemMessage(`${systemSentence}`)

            , contextApi.getChatRoom().getTile(tilePoopSplatter.name, tilePoopSplatter)
              .then((tile: Tile) => contextApi.getChatRoom().applyTile(tilePoopSplatter.name, _.extend({}, tilePoopSplatter, { isDeleted: !!!tile.isDeleted })))

            // , incHashtributeRaw(contextApi.getActor(), 'piece_of_shit_1701', 3)

            // , incHashtributeRaw(contextApi.getActor(), 'sociopath_266', 3)

            , setGameState(contextApi, gameState),

          ])
        })
    })
}

// const onPlayerActionSmell = async (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {

//     const gameState: GameState = await getGameState(contextApi) as GameState

//     ++gameState.actions.smell

//     await contextApi.getActor().sendSystemMessage(`The power of the flatulence is gaining strength.`)

//     await setGameState(contextApi, gameState)

//     return Promise.resolve(null)
// }

// This is when monkey pooped a diamond and i kind liked this.
// const onPlayerActionGiveBeer = async (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
//     contextApi.selectByUniformDist([
//         {
//             // 50% probability of seeing this (random number fell between 0 and 0.5)
//             percentile: 0.5,
//             do: async () => {
//                 await contextApi.doSourcedAnimation(lotties.bluediamond)
//                 // setTimeout(() => simulateTypingReplyComment(contextApi, 'Beer makes diamonds 😘'), 1 * 3000)
//                 await contextApi
//                     .getUser()
//                     .sendSystemComment(`The beer caused ${contextApi.getUnObject().getName()} to poop a diamond.`)
//                 await contextApi.createNewsfeedItemUnObjectCard(
//                     `${contextApi.getUnObject().getName()} gifted {{ name actor }} a diamond 💎. Do you want one too?`,
//                 )
//                 await Player.addToInventory(contextApi.getUser(), VirtualGoods.Item.Diamond)
//             },
//         },
//         {
//             // 50% probability of seeing this (random number fell between 0.5 and 1.00)
//             percentile: 1.0,
//             do: async () => await contextApi.doSourcedAnimation(lotties.dancingmonkey),
//         },
//     ])

//     await Player.removeFromInventory(contextApi.getUser(), VirtualGoods.Item.SoloCupOfBeer)
//     //   ;(await Player.hasInventoryItem(contextApi, 'solocupofbeer'))
//     //     ? null
//     //     : await contextApi.getUser().removeFromActionSheet(actionApi.PlayerActions.GiveBeer)
//     return Promise.resolve(null)
// }

// TODO: finish implementing skipIf without async all throughout
const onPlayerActionGiveBeer = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return getGameState(contextApi)
    .then((gameState: GameState) => skipIf(contextApi, gameState))
    .then(() => {
      contextApi.selectByUniformDist([
        {
          // 50% probability of seeing this (random number fell between 0 and 0.5)
          percentile: 0.5,
          do: (): any => {
            // Promise.all([

            // incrementActionButtonInventoryWait(contextApi.getActor(), RewardedHugeFartHandler.NAME, 3)
            //   .then(() => contextApi.getActor().setCurrentActionEdges(_.union(localActionNames, globalActionNames)))

            // , contextApi.doSourcedAnimation(lotties.giftbox1)

            // contextApi.getActor().sendSystemMessage(`${contextApi.getUnObject().getName()} is very grateful for the beer. ${contextApi.getUnObject().getName()} gave you the gift of a super powerful fart that you can use on anyone you want.`)

            // ])
          },
        },
        {
          // 50% probability of seeing this (random number fell between 0.5 and 1.00)
          percentile: 1.0,
          do: (): Promise<any> => contextApi.doSourcedAnimation(lotties.dancingmonkey),
        },
      ])
    }).then(() => {
      return Promise.all([
        // incHashtributeRaw(contextApi.getActor(), 'animal_lover_1685', 1),
        // incHashtributeRaw(contextApi.getActor(), 'altruistic_125', 1),
      ])
    })
}

const pushPlayerActionSheet = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const gameState: GameState = await getGameState(contextApi, initialGameState) as GameState
  // const hasBeer: boolean = await Player.hasInventoryItem(contextApi.getActor(), VirtualGoods.Item.SoloCupOfBeer)
  // -rx- const allPromises = []
  // -rx- allPromises.push(
  // -rx-     contextApi.getActor().setLocalAction({
  // -rx-         name: localActions.GiveBeer,
  // -rx-         isDeleted: !hasBeer,
  // -rx-         isDisabled: false,
  // -rx-     }))
  await contextApi.getActor().setLocalActions([
    // {
    //     name: localActions.Kick,
    //     isDeleted: false,
    //     isDisabled: false,
    // },
    // {
    //     name: localActions.Hug,
    //     isDeleted: false,
    //     isDisabled: false,
    // },
    // {
    //     name: localActions.Smell,
    //     isDeleted: false,
    //     isDisabled: false
    // },
    {
      name: localActions.Cage,
      isDeleted: false,
      isDisabled: gameState.monkey.isCaged,
    },
  ])

  await contextApi.getActor().setCurrentActionEdges(_.union(localActionNames, globalActionNames))
  return null
}

// TODO:
/*
- welcome back it's been a while - add property for last visit to this chatroom
*/
const _onEnter = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const allPromises = []

  const npcName = contextApi.getUnObject().getName()

  !await hasVisited(contextApi) && await contextApi.getActor().sendSystemMessage(`${npcName} says, "Hi!"`)

  await setHasVisited(contextApi, true)

  await applyBackground(contextApi, lotties.clouds_2)

  // TODO: remove string table system.  bloated useless for now
  // hasBeer && await displayCommentJustOnceToPlayer(
  //     contextApi,
  //     StringTable.Item.MonkeyToPlayerLikesBeer,
  //     StringTable.AllTemplates[StringTable.Item.MonkeyToPlayerLikesBeer].value,
  // )

  await contextApi.getActor().readOrCreateLocalActionEdges(localActionNames)

  allPromises.push(pushPlayerActionSheet(contextApi))

  return Promise.all(allPromises)
}

const onPlayerActionAddCage = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const allPromises = []

  const gameState: GameState = await getGameState(contextApi) as GameState

  ++gameState.actions.cage

  gameState.monkey.isCaged = true

  allPromises.push(contextApi.getChatRoom().applyTile(cageTile.name, cageTile))

  allPromises.push(setGameState(contextApi, gameState))

  return Promise.all(allPromises)
}

// const onPlayerActionGeneric = async (actionName: string, contextApi: ChatRoomActionContextApi): Promise<any> => {

//     return getGameState(contextApi)
//         .then((gameState: GameState) => skipIf(contextApi, gameState))
//         .then(() => {
//             const allPromises = []

//             _.isEqual(actionName, 'kiss') && allPromises.push(incHashtributeRaw(contextApi.getActor(), 'animal_lover_1685', 1))

//             allPromises.push(makerApi.createChatRoomComment(contextApi.getActor().getNode() as any, `[MOVE: ${actionName}]`, contextApi.getContext()))

//             return Promise.all(allPromises)
//         })
// }

// TODO: reinstate with new hash status system
// const onPlayerActionApplyFirstAid = async (contextApi: ChatRoomActionContextApi, args: any) => {
//     const gameState: GameState = await ChatRoom.getGameState(contextApi) as GameState
//     if (gameState.monkey.isCaged) return contextApi.getActor().sendSystemMessage(`You can't feed beer to a Monkey behind bars.`)

//     const allPromises = []
//     let addendum = { forActor: '', forPartner: '' }
//     const bruisedCount = await Player.getHashStatus(UserAttributes.Item.Bruised, contextApi.getPartner())
//     const actionEdge: ActionEdgeApi = await contextApi.getActor().getActionEdge(contextApi.getCurrentActionName())
//     const newActionQty = Math.max(actionEdge.quantity() - 1, 0)
//     const action: ActionX = await actionEdge.action()

//     bruisedCount > 0 && allPromises.push(Player.decrementHashStatus(UserAttributes.Item.Bruised, contextApi.getPartner(), action.power))
//     bruisedCount > 0 && allPromises.push(contextApi.getActor().doLocalAnimationOnTileId('layers.avatar', AnimationType.SourcedAnimation, { sourceUri: lotties.help1 }))
//     bruisedCount > 0 && allPromises.push(contextApi.getPartner().doLocalAnimationOnTileId('tile-self-view', AnimationType.SourcedAnimation, { sourceUri: lotties.help1 }))
//     bruisedCount > 1 ? addendum = { forActor: ' It seems to be helping.', forPartner: ' It seems to be helping.' } : null
//     bruisedCount == 1 ? addendum = { forActor: ` You've cured them! Monkey is very grateful for the first aid. ${contextApi.getUnObject().getName()} gave you the gift of a super powerful fart that you can use on anyone you want.`, forPartner: ' They\'ve cured you!' } : null
//     bruisedCount == 0 ? addendum = { forActor: ' It doesn\'t seem to be doing aything', forPartner: ' No clue why!' } : null

//     // TODO: celebrate the actor who applied first aid.  increase their "kindness status" of sromwething.  ashow cool animations.
//     // broadcast it in the feed.

//     bruisedCount == 1 && allPromises.push(contextApi.getActor().doLocalSourcedAnimation(lotties.firstplacecup))
//     // bruisedCount == 1 && allPromises.push(contextApi.getPartner().doLocalSourcedAnimation(lotties.fireworks3))

//     allPromises.push(contextApi.getActor().sendSystemMessage(`You applied first aid on ${contextApi.getPartner().getName()}.${addendum.forActor}`))
//     // allPromises.push(contextApi.getPartner().sendSystemMessage(`${contextApi.getActor().getName()} applied first aid on you.${addendum.forPartner}`))
//     allPromises.push(contextApi.getActor().setGlobalAction({
//         name: contextApi.getCurrentActionName(),
//         quantity: newActionQty,
//         isDeleted: false,
//         isDisabled: newActionQty == 0,
//     }))

//     return Promise.all(allPromises)
// }

// const onMakerActionBite = async (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
//     const gameState: GameState = await ChatRoom.getGameState(contextApi) as GameState

//     if (gameState.monkey.isCaged) {
//         await contextApi.getUnObject().sendSystemComment(`you can't bite because you are caged.`)
//         return Promise.resolve(null)
//     }

//     await actionApi.increment(contextApi, args)
//     await contextApi.doSourcedAnimation(lotties.chatterteeth)

//     await Player.decrement(Player.UserStatus.HealthPoints, contextApi.getUser(), 25)
//     //   await setGameState(contextApi, gameState)
//     await contextApi.createNewsfeedItemUnObjectCard(
//         `${contextApi
//             .getUnObject()
//             .getName()} bit {{ name actor }} and {{ name actor }}'s injured. Do you want to help {{ himher actor }}?`,
//     )
//     return Promise.resolve(null)
// }

// const onMakerActionPickLock = async (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
//     const gameState: GameState = await ChatRoom.getGameState(contextApi) as GameState

//     await contextApi.doSourcedAnimation(lotties.lock1)
//     contextApi.selectByUniformDist([
//         {
//             percentile: 0.25,
//             do: async () => {
//                 await contextApi.getChatRoom().deleteGlobalTile(cageTile.name)
//                 gameState.monkey.isCaged = false
//                 await ChatRoom.setGameState(contextApi, gameState)
//             },
//         },
//         {
//             percentile: 1.0,
//             do: async () => await contextApi.getUser().sendSystemComment(`No such luck.`),
//         },
//     ])

//     return Promise.resolve(null)
// }

// const simulateTypingReplyComment = (contextApi: ChatRoomActionContextApi, message: string): Promise<any> => {
//   return Promise.resolve(setIsTyping(contextApi.getUnObject(), true))
//     .then(pause(3 * 1000))
//     .then(() => setIsTyping(contextApi.getUnObject(), false))
//     .then(pause(300))
//     .then(() => contextApi.sendUnObjectComment(message))
//   // .then(pause(1.5 * 1000))
//   // .then(async () => {
//   //   const gameState: GameState = await getGameState(contextApi)
//   //   gameState.monkey.smartass++
//   //   const score = `⭐️⭐️ He's a level ${gameState.monkey.smartass} Smart Ass ⭐️⭐️`
//   //   await setGameState(contextApi, gameState)
//   //   await contextApi
//   //     .getUser()
//   //     .sendSystemComment(`He loves to chat, but you know he just talks out of his butt, right?\n${score}`)
//   //   return null
//   // })
// }

// const onComment = async (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
//     const input: CreateChatRoomCommentInput = args.input
//     const gameState: GameState = await ChatRoom.getGameState(contextApi) as GameState

//     const replies: string[] = gameState.monkey.smartass <= 3 ? ['oo oo ee ee', '8=====D'] : ['Hello!']
//     const systemMessage: string =
//         gameState.monkey.smartass <= 3
//             ? 'He loves to chat, but you know he just talks out of his butt, right?'
//             : 'Monkey Butt is getting better at being social.'
//     //   await contextApi.getUser().sendSystemComment(`He loves to chat, but you know he just talks out of his butt, right?`)
//     setTimeout(
//         () =>
//             simulateTypingReplyComment(contextApi, _.sample(replies))
//                 .then(pause(0.5 * 1000))
//                 .then(async () => {
//                     const gameState: GameState = await ChatRoom.getGameState(contextApi) as GameState
//                     gameState.monkey.smartass <= 3 ? gameState.monkey.smartass++ : (gameState.monkey.smartass += 2)
//                     const score = `⭐️⭐️ He's a level ${gameState.monkey.smartass} Smart Ass ⭐️⭐️`
//                     await ChatRoom.setGameState(contextApi, gameState)
//                     await contextApi.getUser().sendSystemComment(`${systemMessage}\n${score}`)
//                     await Player.increment(Player.UserStatus.XP, contextApi.getUser(), 25)
//                     await Player.increment(Player.UserStatus.Smartass, contextApi.getUser())
//                     return null
//                 }),
//         3 * 1000,
//     )
//     return Promise.resolve(null)
// }

const postAction = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  log('postAction:entry ')
  const allPromises = []

  allPromises.push(pushPlayerActionSheet(contextApi))

  return Promise.all(allPromises)
}

const localActionNames = _.values(localActions)
const globalActionNames = [
  moves.tickle_782.name,
  moves.chug_beer_960.name,
  moves.hug_50.name,
  moves.punch_80.name,
]

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {
    [moves.hug_50.name]: composeReactionFns(
      onPlayerActionHug, postAction)

    , [moves.punch_80.name]: composeReactionFns(
      onPlayerActionKick, postAction
    )

    , [localActions.Cage]: composeReactionFns(onPlayerActionAddCage, postAction)

    , [moves.tickle_782.name]: composeReactionFns(
      onPlayerActionLook, postAction
    )

    , [moves.chug_beer_960.name]: composeReactionFns(
      onPlayerActionGiveBeer, postAction
    ),

  } as ReactionFnMap)
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter: composeReactionFns(
    _onEnter
    , postAction
  ),
  onReset: null,
  onLoad: registerReactionFns,
}

export default actionResolver
