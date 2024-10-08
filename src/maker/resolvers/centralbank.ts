/**
 * Central Bank handler module.
 */

import {
  ActionResolver,
  ChatRoomActionContextApi,
  NewsfeedItemTemplate,
} from '../types'
import { LoggerFactory } from 'src/utils/logger'
import _ from 'lodash'
import { registerReactionFnMap, ReactionFnMap, WILDCARD_ACTION, BeforeEnterAsset } from 'src/enginev3'
import {
  statusTileTemplate,
  interestNewsFeedTemplate,
  initialNewsFeedTemplate,
  metadataTextLens,
  noBalanceNewsFeedTemplate,
} from './centralbank.assets'
import Bluebird from 'bluebird'
import moment from 'moment'
import { AnimationType, ActionXStub } from '../../gql-types'
import {
  incrementUserAttribute,
  UserAttributeKey,
  getUserAttribute,
} from '../playerHelpers'
import { incHashtribute, resetHashtribute } from 'src/maker/hashtributes'
import { lotties } from '../helpers'
import { defaultsDeep } from '../../utils/misc'
import * as ResetAction from '../reactions/action.debug.reset'

const ID = 'central_bank_411'
const logger = LoggerFactory(ID, 'NPC')

const ACTIONS = `${ID}.action`
const CREDIT_INTEREST_ACTION = 'interest'
const CHECK_NO_BALANCE_ACTION = 'checkNoBalance'

const INTEREST_RATE = 5 // %
const CHECK_NO_BALANCE_DELAY = 3 // days

// Utils

interface GameState {
  wealth: number
  balance: number
  accum?: number
}

const updateUI = async (api: ChatRoomActionContextApi, { wealth, balance, accum = 0 }: GameState): Promise<any[]> => {
  // This request is cached so it's sync after the first time
  const actionXs = await api.getActionsByPackageName(ID)
  // Show the deposit buttons, disable if user has less money
  const stubs = _(actionXs)
    .filter(action => !!action?.args?.amount)
    .sortBy(action => action.args.amount)
    .map((action): ActionXStub => (
      { actionName: action.name, isDisabled: action.args.amount > wealth, isGivable: true }
    )).value()

  // Show withdraw, disable if nothing can be withdrawn
  stubs.push({ actionName: `${ACTIONS}.withdraw`, isDisabled: balance <= 0 })
  // For now, when there are no actions, show the reset
  if (!stubs.length) {
    stubs.push({ actionName: ResetAction.NAME })
  }

  // Compile a flexible multi-line status with all the data
  const status = [
    'Wallet Balance', `$${wealth}`, '',
    'Bank Balance', `$${balance}`, '',
    'Daily Rate', `${INTEREST_RATE}%`, '',
    'Since last visit', `+$${accum}`, '',
  ].join('\n')

  return Promise.all([
    api.getActor().saveTile(metadataTextLens.set(status)(statusTileTemplate)),
    // Update the available actions
    api.getActor().saveCurrentActionStubs({ staticActionStubs: stubs }),
  ])
}

const getBankBalance = (api: ChatRoomActionContextApi): Promise<number> => {
  return getUserAttribute(UserAttributeKey.BankBalance, api.getActor(), 0)
}

const getState = (api: ChatRoomActionContextApi): Bluebird<any> => {
  return Bluebird.Promise.props({
    wealth: getUserAttribute(UserAttributeKey.Wealth, api.getActor(), 0),
    balance: getBankBalance(api),
    accum: getUserAttribute(UserAttributeKey.AccumulatedInterest, api.getActor(), 0),
  })
}

const scheduleAction = (api: ChatRoomActionContextApi, action: string, days = 1): Promise<any> => {
  const date = moment().add({ days })
  return api.scheduleJob({
    // The id acts as a sort of foreign key, so jobs cannot run +1 in a single day
    id: `${api.getActor().getEid()}.${action}.${date.format('YYYY-MM-DD')}`,
    actionName: `${ACTIONS}.${action}`,
    dispatchAt: date.toDate(),
  })
}

const updateBankBalance = (api: ChatRoomActionContextApi, amount: number): Promise<GameState> => {
  return (
    Bluebird.Promise.props({
      wealth: incrementUserAttribute(api.getActor(), UserAttributeKey.Wealth, -amount),
      balance: incrementUserAttribute(api.getActor(), UserAttributeKey.BankBalance, amount),
    })
      // Update the balances and actions
      .tap((state: GameState) => updateUI(api, state))
      // Show a nice success animation
      .tap(() =>
        api.getChatRoom().applyAnimation(AnimationType.SourcedAnimation, {
          animationType: AnimationType.SourcedAnimation,
          sourceUri: lotties.greenCheck,
        })
      )
  )
}

const showInitialNewsFeed = (api: ChatRoomActionContextApi): Promise<any> => {
  const newsFeed = defaultsDeep({
  }, initialNewsFeedTemplate)
  return api.saveNewsfeedItem(newsFeed)
}

const onCheckNoBalance = (api: ChatRoomActionContextApi): Bluebird<any> => {
  return getState(api).then(({ wealth, balance }) => {
    if (wealth >= 0 && balance <= 0) {
      const actor = api.getActor()
      // If the user has liquid wealth and no bank balance, suggest they deposit
      const newsFeed: NewsfeedItemTemplate = defaultsDeep({
        rateId: `${actor.getEid()}.${CHECK_NO_BALANCE_ACTION}`,
      }, noBalanceNewsFeedTemplate)
      // TODO: Re-schedule ad-infinitum?
      return api.saveNewsfeedItem(newsFeed)
    } else {
      return Promise.resolve(undefined)
    }
  })
}

const onDeposit = (api: ChatRoomActionContextApi): Promise<any[]> => {
  const amount = api.getCurrentAction().args.amount
  return (
    updateBankBalance(api, amount)
      // Deposited with a previous balance of 0, schedule the interest job
      .then(({ balance }) => balance === amount && scheduleAction(api, CREDIT_INTEREST_ACTION))
      .then(() => api.getActor().sendSystemMessage(`You deposited $${amount}!`))
      .then(() => incHashtribute(api.getActor(), 'financially_savvy_1687'))
      // TODO: We should use a separate user attribute, but I don't want to pollute with fields just yet
      // Deposited for the first time ever, show a newsfeed
      .then(({ numberValue }) => numberValue === amount && showInitialNewsFeed(api))
  )
}

const onWithdraw = (api: ChatRoomActionContextApi): Promise<any> => {
  return getBankBalance(api).then((balance: number) => {
    if (balance <= 0) return Promise.resolve(undefined)

    // Withdraw all the balance
    return updateBankBalance(api, -balance)
      .then(() => api.getActor().sendSystemMessage(`You have withdrawn $${balance}!`))
      .then(() => scheduleAction(api, CHECK_NO_BALANCE_ACTION, CHECK_NO_BALANCE_DELAY))
  })
}

const onCreditInterest = (api: ChatRoomActionContextApi): Promise<any[]> => {
  return getBankBalance(api).then(balance => {
    if (balance <= 0) return Promise.resolve([])

    const interest = Math.ceil((balance * INTEREST_RATE) / 100)
    const actor = api.getActor()
    const newsFeed: NewsfeedItemTemplate = _.defaultsDeep(
      {
        rateId: `${actor.getEid()}.${CREDIT_INTEREST_ACTION}`,
        playersEid: ['unobject/centralbank', actor.getEid()],
        metadata: {
          statusText: `You just earned $${interest} from your bank deposit!`,
        },
      },
      interestNewsFeedTemplate
    )

    return Promise.all([
      incrementUserAttribute(actor, UserAttributeKey.BankBalance, interest),
      incrementUserAttribute(actor, UserAttributeKey.AccumulatedInterest, interest),
      api.saveNewsfeedItem(newsFeed),
      // Schedule the next one
      scheduleAction(api, CREDIT_INTEREST_ACTION),
    ])
  })
}

// NPC handlers

const onBeforeEnter = (api: ChatRoomActionContextApi): Promise<BeforeEnterAsset[]> => {
  logger.info('onBeforeEnter')
  return api.getActionsByPackageName(ID)
}

const onEnter = (api: ChatRoomActionContextApi): Bluebird<any> => {
  logger.info('onEnter')
  return getState(api)
    // Initialize the UI based on the state
    .tap(state => updateUI(api, state))
    .then(({ accum }) => {
      if (accum <= 0) {
        return `Hi! Welcome to ${api.getUnObject().getName()}!`
      }
      // Show the user how much was earned since their last visit and reset it
      return incrementUserAttribute(api.getActor(), UserAttributeKey.AccumulatedInterest, -accum)
        .then(() => `Welcome back! Since your last visit, you have earned $${accum} from interest!`)
    })
    .then(api.getActor().sendSystemMessage)
}

const onReset = (api: ChatRoomActionContextApi): Bluebird<any> => {
  logger.info('onReset')
  // Bring the 3 values to: wealth=135, balance=0, accumulatedInterest=0, #FinanciallySavvy=0
  const actor = api.getActor()
  return getState(api)
    .then(({ wealth, balance, accum }) =>
      Promise.all([
        incrementUserAttribute(actor, UserAttributeKey.Wealth, 135 - wealth),
        balance && incrementUserAttribute(actor, UserAttributeKey.BankBalance, -balance),
        accum && incrementUserAttribute(actor, UserAttributeKey.AccumulatedInterest, -accum),
        resetHashtribute(api.getActor(), 'financially_savvy_1687'),
      ])
    )
    .then(() => onEnter(api))
}

const registerReactionFns = (): Promise<any> => {
  const reactions: ReactionFnMap = {
    [`${ACTIONS}.withdraw`]: onWithdraw,
    [`${ACTIONS}.${CREDIT_INTEREST_ACTION}`]: onCreditInterest,
    [`${ACTIONS}.${CHECK_NO_BALANCE_ACTION}`]: onCheckNoBalance,
    [ResetAction.NAME]: onReset,
    [WILDCARD_ACTION]: onDeposit,
  }
  return registerReactionFnMap(ID, reactions)
}

const actionResolver: ActionResolver = {
  unObjectId: ID,
  onBeforeEnter,
  onEnter,
  onLoad: registerReactionFns,
  onReset,
}

export default actionResolver
