import {
  ActionResolver,
  ChatRoomActionContextApi,
  ActionStubSetMap,
} from '../types'
import {
  sf, misc,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import { Gender } from '../../gql-types'
import _ from 'lodash'
import { registerReactionFnMap, ReactionFnMap, composeReactionFns, SkipReactionsError } from '../../enginev3'
import { getUserState} from '../userStates'
import * as fxChitChat from '../fx/animation.chitchat'
import * as fxAddToInventory from '../fx/animation.addtoinventory'
import { UserAttributeKey, getUserAttribute, hasVisited, setHasVisited, incrementUserAttribute, incrementPositionOnMap } from '../playerHelpers'

import * as DebugResetHandler from '../reactions/action.debug.reset'

import { getGameState, setGameState, RootGameState, applyBackground } from '../chatRoomHelpers'
import { lotties, diff_mins, imageS3Key } from '../helpers'
import { items } from 'src/domain/items'
import { moves } from 'src/domain/moves'

interface GameState extends RootGameState {
  smallTalkCount: number
  kissCount: number
  examCoupons: number
  dietPillCount: number
  firstAidBuyCount: number
}

const INITIAL_GAME_STATE: GameState = {
  version: 1.4,
  lastVisit: Date.now(),
  smallTalkCount: 0,
  kissCount: 0,
  examCoupons: 0,
  dietPillCount: 0,
  firstAidBuyCount: 0,
}

const logger = LoggerFactory('doctor', 'NPC')
const unObjectId = 'dr_spaceman_465'

const wealthSummary = (wealth: number): string => wealth == 0 ? 'You don\'t have any money, why don\'t you try your luck at the casino.' : `You only have ${wealth} dollar${wealth == 1 ? '' : 's'}.`

const onPlayerActionRequestPills = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const cost = 5
  const wealth: number = await getUserAttribute(UserAttributeKey.Wealth, contextApi.getActor(), 0)

  if (wealth < cost) {
    contextApi.getActor().sendSystemMessage(`The diet pills cost ${cost} dollars. ${wealthSummary(wealth)}`)
  } else {
    getGameState(contextApi).then((gameState: GameState) => {
      const npcName = contextApi.getUnObject().getName()

      if (gameState.dietPillCount < 4) {
        gameState.dietPillCount++

        setGameState(contextApi, gameState)

        contextApi.getActor().createActionInstance({
          actionName: items.diet_pill_2036.name,
          trxDescription: 'Rewarded by the good doctor!',
        })

        incrementUserAttribute(contextApi.getActor(), UserAttributeKey.Wealth, -1 * cost)

        fxAddToInventory.animate(contextApi, imageS3Key.InventoryDietPills)

        const says = [
          `${npcName} warns, "diet pills should be taken in moderation."`,
          `${npcName} looks at you with concern, "that's a lot of diet pills!"`,
          `Hesitating, ${npcName} says, "this is how addictions begin."`,
          `"That's all I'm willing to sell to you.", says ${npcName}.`,
        ]

        contextApi.getActor().sendSystemMessage(says[Math.min(gameState.dietPillCount - 1, says.length - 1)])
      } else {
        contextApi.getActor().sendSystemMessage(`${npcName} says, "no more diet pills for you."`)
      }
    })
  }

  return Promise.resolve(null)
}

// TODO: JT - after exam present 2 buttons.  Thanks and now what?
// also, have him give you an apple if you've paid for an exam.
const onPlayerActionRequestExam = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  getGameState(contextApi).then(async (gameState: GameState) => {
    const allPromises = []
    const diagnosis = 'you are in great health'

    // console.log(`\n\n\ndiagnosis=${JSON.stringify(diagnosis)}`)

    if (gameState.examCoupons >= 1) {
      _.merge(gameState, { examCoupons: gameState.examCoupons - 1 })

      allPromises.push(setGameState(contextApi, gameState))

      allPromises.push(contextApi.getActor().sendSystemMessage(`Smiling, he gives you a free exam and discovers, "${diagnosis}."`))
    } else {
      const cost = 5
      const wealth = await getUserAttribute(UserAttributeKey.Wealth, contextApi.getActor(), 0)

      wealth < cost && allPromises.push(contextApi.getActor().sendSystemMessage(`The exam costs ${cost} dollars.  ${wealthSummary(wealth)}`))

      wealth >= cost && allPromises.push(incrementUserAttribute(contextApi.getActor(), UserAttributeKey.Wealth, -1 * cost))

      wealth >= cost && allPromises.push(contextApi.doSourcedAnimation(lotties.magnify1))

      wealth >= cost && allPromises.push(contextApi.getActor().sendSystemMessage(`You pay the Doctor ${cost} dollars, he gives you an exam and discovers, "${diagnosis}."`))
    }

    return Promise.all(allPromises)
  })
}

const onPlayerActionKiss = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  // const allPromises = []
  const npcName = contextApi.getUnObject().getName()

  const says = [
    `${npcName} pushes you away, "I'm only into women."`,
    `${npcName} tilts his head, "sorry, I hope I didn't give off the wrong signal."`,
    `${npcName} glares at you, "seriously dude!"`,
  ]

  return Promise.resolve(contextApi.getActor().getKey('gender'))
    .then(gender => {
      if (gender != Gender.Female) {
        getGameState(contextApi)
          .then((gameState: GameState) => {
            _.merge(gameState, { kissCount: gameState.kissCount + 1 })
            setGameState(contextApi, gameState)
            contextApi.getActor().sendSystemMessage(says[Math.min(gameState.kissCount - 1, says.length - 1)])
          })

        return Promise.reject(SkipReactionsError)
      } else if (gender == Gender.Female) {
        // TODO JT have various excalating sayings based on number of kisses
        getGameState(contextApi)
          .then((gameState: GameState) => {
            gameState.examCoupons++
            return (setGameState(contextApi, gameState))
          }).then(() => {
            contextApi.getActor().sendSystemMessage(`${contextApi.getUnObject().getName()} seems to have liked that kiss.\n\n"You're next exam is on the house", he winks.`)
          })

        return Promise.resolve(null)
      } else {
        return Promise.resolve(null)
      }
    })
}

const onPlayerActionPurchaseFirstAidKit = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const allPromises = []
  const cost = 10
  const npcName = contextApi.getUnObject().getName()
  const wealth: number = await getUserAttribute(UserAttributeKey.Wealth, contextApi.getActor(), 0)

  if (wealth < cost) {
    allPromises.push(contextApi.getActor().sendSystemMessage(`The first aid kit costs ${cost} dollars. ${wealthSummary(wealth)}`))
  } else {
    contextApi.getActor().createActionInstance({
      actionName: items.ecstasy_1583.name,
      trxDescription: 'Rewarded by the good doctor!',
    })

    allPromises.push(incrementUserAttribute(contextApi.getActor(), UserAttributeKey.Wealth, -1 * cost))

    allPromises.push(contextApi.getActor().sendSystemMessage(`"Savvy purchase!", says ${npcName}`))

    allPromises.push(
      fxAddToInventory.animate(contextApi, imageS3Key.FirstAidKit)
      // contextApi.getChatRoom().saveTile(firstAidAnimationSequenceTileTemplate)
    )

    allPromises.push(
      getGameState(contextApi)
        .then((gameState: GameState) => {
          const { firstAidBuyCount } = gameState
          if (firstAidBuyCount == 0) {
            incrementPositionOnMap(contextApi.getActor())
          }
          _.merge(gameState, { firstAidBuyCount: firstAidBuyCount + 1 })
          return setGameState(contextApi, gameState)
        })
    )
  }

  return Promise.all(allPromises)
}

const onPlayerActionMakeSmallTalk = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const allPromises = []

  const npcName = contextApi.getUnObject().getName()

  const says = [
    `${npcName} explains, "I'm a general practitioner. I sell diet pills, first aid kits and perform various healing services."`,
    `${npcName} grunts, "uh huh"`,
    `${npcName} mummbles, "yep"`,
    `${npcName} agrees, "totally!"`,
    `${npcName} nods, "yeah, bigfoot definitely doesn't have that baldness gene."`,
    `${npcName} nods again, "i agree"`,
    `${npcName} shrugs, "mmmmm hmmmm"`,
    `Annoyed, ${npcName} looks at you, "leave me alone!"`,
    `Angrily, ${npcName} glares at you, "wtf is your issue?"`,
    `${npcName} seems to be ignoring you now.`,
  ]

  let gameState: GameState

  gameState = await getGameState(contextApi) as GameState

  gameState = await setGameState(contextApi, { ...gameState, smallTalkCount: ++gameState.smallTalkCount }) as GameState

  if (gameState.smallTalkCount < 5 || gameState.smallTalkCount > 5) {
    setTimeout(() => {
      contextApi.getActor().sendSystemMessage(says[Math.min(gameState.smallTalkCount - 1, says.length - 1)])
    }, 1000 * .2)
  }

  if (gameState.smallTalkCount == 5) {
    allPromises.push(contextApi.getActor().sendSystemMessage(`${npcName} grumbles, "Take this bottle of water. Stay hydrated! Oh, and leave me alone."`))

    contextApi.getActor().createActionInstance({
      actionName: items.water_balloon_1358.name,
      trxDescription: 'Rewarded by the good doctor!',
    })

    fxAddToInventory.animate(contextApi, imageS3Key.WaterDropH2O)

    allPromises.push(incrementPositionOnMap(contextApi.getActor()))
  }

  return Promise.all(allPromises)
}

const skipIf = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return getUserState(contextApi.getActor(), 'injured_876')
    .then(numberValue => {
      if (numberValue.numberValue === 0) {
        const npcName = contextApi.getUnObject().getName()

        return contextApi.getActor().sendSystemMessage(
          _.sample([
            `${npcName} says, "You don't seem 'injured', 'overweight' or sick. I don't sell drugs to just anyone.  You could be an addict."`
            , `${npcName} says, "Come back when you have an issue that requires medical attention."`
            , `${npcName} says, "You don't seem 'injured' or 'overweight'.  Come back later when you need medical attention."`,
          ]))
          .then(() => {
            return Promise.reject(SkipReactionsError)
          })
      } else {
        return Promise.resolve(null)
      }
    })
}

const checkIfShouldReset = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const currentVisitTime = Date.now()
  const gameState = await getGameState(contextApi, INITIAL_GAME_STATE) as GameState
  if (diff_mins(new Date(gameState.lastVisit), new Date(currentVisitTime)) >= 5) {
    await reset(contextApi)
  }
  return Promise.resolve(null)
}

const enter = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  Promise.resolve(null)
    .then(() => hasVisited(contextApi))
    .then(sf.thru_if_else(misc.isTrue)(
      () => {
        const prefix = _.sample(['Welcome back!', 'Hola!', 'Bonjour!', 'Ciao!', 'Hallo!'])
        return contextApi.getActor().sendSystemMessage(`${contextApi.getUnObject().getName()} says, "${prefix}"`)
      }
    )(
      () => Promise.all([
        contextApi.getActor().sendSystemMessage(`${contextApi.getUnObject().getName()} says, "Welcome to my office!"`),
        setHasVisited(contextApi, true),
      ])
    ))

  applyBackground(contextApi, lotties.blob_1)

  contextApi.getActor().saveCurrentActionStubs(stateActionStubSets.general)

  return Promise.resolve(null)
}

const reset = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  await setGameState(contextApi, INITIAL_GAME_STATE)

  // await contextApi.getActor().sendSystemMessage(`Playroom Has been Reset`)

  await setHasVisited(contextApi, false)

  // HACK deletes all chat comments.  remove eventually
  await contextApi.getChatRoom().deleteComments()

  return Promise.resolve(null)
}

const localActions = {
  RequestDietPill: 'Action.Doctor.RequestDietPill',
  RequestExam: 'Action.Doctor.RequestExam',
  PurchaseFirstAidKit: 'Action.Doctor.PurchaseFirstAidKit',
}

const localActionNames = _.values(localActions)

const globalActionNames = [
  moves.tickle_782.name,
]

const stateActionStubSets: ActionStubSetMap = {
  start: {
    staticActionNames: [],
    actionInstanceNames: [],
  },
  general: {
    staticActionNames: [
      ...localActionNames,
      ...globalActionNames,
    ],
    actionInstanceNames: [
    ],
  },
}

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {
    [localActions.RequestDietPill]: composeReactionFns(
      skipIf
      , onPlayerActionRequestPills
      // , updateActions
    ),

    [localActions.RequestExam]: composeReactionFns(
      onPlayerActionRequestExam
      // , updateActions
    ),

    [localActions.PurchaseFirstAidKit]: composeReactionFns(
      skipIf
      , onPlayerActionPurchaseFirstAidKit
    ),

    [DebugResetHandler.NAME]: composeReactionFns(
      reset,
      enter,
    ),

    [moves.tickle_782.name]: composeReactionFns(
      fxChitChat.animate,
      onPlayerActionMakeSmallTalk
    )

    , [moves.kiss_53.name]: onPlayerActionKiss,

  } as ReactionFnMap)
}

const onLoad = (): Promise<any> => {
  logger.debug('doctor.onLoad')
  return Promise.resolve(registerReactionFns())
}

const actionResolver: ActionResolver = {
  unObjectId,
  onEnter: composeReactionFns(
    checkIfShouldReset, enter
  ),
  onReset: null,
  onLoad,
}

export default actionResolver
