import _ from 'lodash'
import {
  sf,
  sft,
  misc,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import * as models from '../models'
import * as store from '../store'
import {
  ChatRoomActionContext,
  ActionContextType,
  ChatRoomActionContextApi,
} from 'src/types'
import {
  ActionResolver,
  ActionResolverFn,
} from 'src/maker/types'
import { events } from 'src/events'
import { ChatRoomActionContextApiFactory } from 'src/maker/api/ChatRoomActionContextApi'
import {
  EntityType,
  SearchInput,
  SubmitChatRoomActionInput,
  EnterChatRoomInput,
  CreateChatRoomCommentInput,
} from 'src/gql-types'
import {
  UnObject,
  User,
} from '../../db/entity'
import Bluebird from 'bluebird'
import { BeforeEnterAsset } from 'src/enginev3/types'
import { searchNpcsByName } from './chat.actions.util'
import { toPublicUrl } from 'src/services/aws'
import {
  resolveImageNoDefault,
  hasValidAge,
} from 'src/graphql/core'

import GeneratorNPC from 'src/maker/resolvers/generator/common/npc'
import AirtableNPC from 'src/maker/resolvers/airtable/common/npc'

import KitchenSink from 'src/maker/resolvers/kitchensink'
import bigfootShave from 'src/maker/resolvers/bigfoot_shave'
import bigfootAgain from 'src/maker/resolvers/bigfoot_again'
import theCave from 'src/maker/resolvers/thecave'
import hauntedhouse from 'src/maker/resolvers/hauntedhouse'
import monkeybutt from 'src/maker/resolvers/monkeybutt'
import coldkegbeer from 'src/maker/resolvers/coldkegbeer'
import sexworker from 'src/maker/resolvers/sexworker'
import brewery from 'src/maker/resolvers/brewery'
import doctor from 'src/maker/resolvers/doctor'
import Casino from 'src/maker/resolvers/casino'
import casinoBlackjack from 'src/maker/resolvers/casino.blackjack'
import casinoThreeCardMonte from 'src/maker/resolvers/casino.threeCardMonte'
import producestand from 'src/maker/resolvers/producestand'
import coldbrewcoffee from 'src/maker/resolvers/coldbrewcoffee'
import gnome from 'src/maker/resolvers/gnome'
import hairymonster from 'src/maker/resolvers/hairymonster'
import bluejoe from 'src/maker/resolvers/bluejoe'
import RedJoe from 'src/maker/resolvers/redjoe'
import hammock from 'src/maker/resolvers/hammock'
import strawberrypatch from 'src/maker/resolvers/npc.strawberrypatch'
import appletree from 'src/maker/resolvers/apple_tree'
import FortuneTeller from 'src/maker/resolvers/fortuneteller'
import centralbank from 'src/maker/resolvers/centralbank'
import hollywood_producer_36 from 'src/maker/resolvers/beat/hollywood_producer_36'
import safe from 'src/maker/resolvers/safe/npc'
import brett_the_creep_35 from 'src/maker/resolvers/beat/brett_the_creep_35'
import gourmet_table_45 from 'src/maker/resolvers/craft/gourmet_table_45'
import francois_40 from 'src/maker/resolvers/beat/francois_40'
import bentley_43 from 'src/maker/resolvers/beat/bentley_43'
import chip_the_dog_14 from 'src/maker/resolvers/beat/chip_the_dog_14'
import flour_mill_63 from 'src/maker/resolvers/craft/flour_mill_63'
import barista_49 from 'src/maker/resolvers/craft/barista_49'
import bakery_56 from 'src/maker/resolvers/craft/bakery_56'
import boomer_home_90 from 'src/maker/resolvers/craft/boomer_home_90'
import helga_47 from 'src/maker/resolvers/craft/helga_47'
import toy_shop_2068 from 'src/maker/resolvers/craft/toy_shop_2068'
import ethan_the_creep_30 from 'src/maker/resolvers/beat/ethan_the_creep_30'
import recycle_machine_1315 from 'src/maker/resolvers/recycle_machine_1315/npc'
import { mapEntityRefToEid } from '../models'
import rubber_tree_70 from 'src/maker/resolvers/beat/rubber_tree_70'
import fire_lanterns_72 from 'src/maker/resolvers/beat/fire_lanterns_72'
import gobi_dahlia_71 from 'src/maker/resolvers/beat/gobi_dahlia_71'
import { hasPermission } from 'src/graphql/User/user.permission'
import angry_toilet_330 from 'src/maker/resolvers/exchange/angry_toilet_330'
import build_a_bear_1540 from 'src/maker/resolvers/craft/build_a_bear_1540'
import stinkys_bar_1547 from 'src/maker/resolvers/exchange/stinkys_bar_1547'
import { mapAndAuthzSessionUserToPlayer } from 'src/graphql/Chat/chat.authz'
import taco_truck_1533 from 'src/maker/resolvers/craft/taco_truck_1533'
import drug_dealer_822 from 'src/maker/resolvers/exchange/drug_dealer_822'
import love_doctor_2173 from 'src/maker/resolvers/exchange/love_doctor_2173'
import er_doctor_2157 from 'src/maker/resolvers/exchange/er_doctor_2157'
import rehab_doctor_2210 from 'src/maker/resolvers/exchange/rehab_doctor_2210'
import potion_lab_2174 from 'src/maker/resolvers/craft/potion_lab_2174'
import doctors_office_1819 from 'src/maker/resolvers/exchange/doctors_office_1819'
import fortune_teller_branching_2034 from 'src/maker/resolvers/exchange/fortune_teller_branching_2034'
import alien_2043 from 'src/maker/resolvers/exchange/alien_2043'
import bigfoot_branching_2047 from 'src/maker/resolvers/exchange/bigfoot_branching_2047'
import classroom_1773 from 'src/maker/resolvers/classroom_1773/npc'
import flower_boutique_2191 from 'src/maker/resolvers/exchange/flower_boutique_2191'
import president_trump_2234 from 'src/maker/resolvers/exchange/president_trump_2234'
import biden_2020_2264 from 'src/maker/resolvers/exchange/biden_2020_2264'
import { DEFAULT_NPC_ID } from 'src/env'
import { NPC, npcs } from 'src/domain/npcs'

const logger = LoggerFactory('chat.actions')

type Handler = new ({ npc: NPC }) => { createResolver: () => ActionResolver }

const handlers: Record<NPC['handler'], Handler> = {
  'Raw Generator': GeneratorNPC,
  'Airtable': AirtableNPC,
}

let loadedActionResolversPromise = null

const getHandledNPCs = (): ActionResolver[] => {
  return Object.values(npcs)
    .filter(npc => !!handlers[npc.handler])
    .map(npc => new handlers[npc.handler]({ npc }).createResolver())
}

/**
 * @return the full set of ActionResolvers i.e. handler modules
 */
export const getActionResolvers = (): Promise<ActionResolver[]> => {
  if (!!!_.isNil(loadedActionResolversPromise)) {
    return loadedActionResolversPromise
  }

  loadedActionResolversPromise = Promise.resolve(null)
    .then(() => logger.info('Loading ActionResolvers'))
    .then(() => ([
      ...getHandledNPCs(),
      new KitchenSink(),
      new Casino(),
      new RedJoe(),
      new FortuneTeller(),
      bigfootShave,
      bigfootAgain,
      theCave,
      hauntedhouse,
      monkeybutt,
      coldkegbeer,
      hairymonster,
      bluejoe,
      sexworker,
      doctor,
      brewery,
      coldbrewcoffee,
      casinoBlackjack,
      casinoThreeCardMonte,
      producestand,
      gnome,
      hammock,
      strawberrypatch,
      appletree,
      centralbank,
      hollywood_producer_36,
      safe,
      recycle_machine_1315,
      brett_the_creep_35,
      gourmet_table_45,
      francois_40,
      bentley_43,
      chip_the_dog_14,
      flour_mill_63,
      barista_49,
      bakery_56,
      boomer_home_90,
      helga_47,
      toy_shop_2068,
      ethan_the_creep_30,
      rubber_tree_70,
      fire_lanterns_72,
      gobi_dahlia_71,
      stinkys_bar_1547,
      angry_toilet_330,
      build_a_bear_1540,
      taco_truck_1533,
      drug_dealer_822,
      doctors_office_1819,
      love_doctor_2173,
      rehab_doctor_2210,
      er_doctor_2157,
      potion_lab_2174,
      fortune_teller_branching_2034,
      alien_2043,
      bigfoot_branching_2047,
      flower_boutique_2191,
      president_trump_2234,
      biden_2020_2264,
      classroom_1773,
    ]))
    .then(sf.tap(sf.list_fmap_wait(
      (actionResolver: ActionResolver) => actionResolver.onLoad
        // ? logger.traceFn( `actionResolver.onLoad(unObjectId=${actionResolver.unObjectId})`, actionResolver.onLoad )()
        ? actionResolver.onLoad()
        : null
    )))
    .then(sf.tap((actionResolvers: ActionResolver[]) => logger.info(`Loaded ${actionResolvers.length} ActionResolvers`)))

  return loadedActionResolversPromise
}

let loadedP2PActionResolversPromise = null

/**
 * @return the full set of P2P ActionResolvers i.e. handler modules for specific Users.
 */
export const getP2PActionResolvers = (): Promise<ActionResolver[]> => {
  if (!!!_.isNil(loadedP2PActionResolversPromise)) {
    return loadedP2PActionResolversPromise
  }
  logger.info('Loading P2P ActionResolvers')
  loadedP2PActionResolversPromise = Promise.resolve([])
    .then(sf.tap(sf.list_fmap_wait(
      (actionResolver: ActionResolver) => actionResolver.onLoad
        ? actionResolver.onLoad()
        : null
    )))
    .then(sf.tap((actionResolvers: ActionResolver[]) => logger.info(`Loaded ${actionResolvers.length} P2P ActionResolvers`)))

  return loadedP2PActionResolversPromise
}

export const getActionResolverUnObjects = (user: User): Promise<UnObject[]> => {
  return getActionResolvers()
    .then(actionResolvers => actionResolvers.map(action => action.unObjectId))
    .then(unObjectIds => sft.promiseMap(unObjectIds, store.unObjectById))
    .then(unObjects => misc.compact<UnObject>(unObjects))
    .then(unObjects => unObjects.filter(unObject =>
      _.isEqual(unObject.isDeleted, false) &&
      hasPermission({ targetRole: unObject.visibleForRole, userRole: user.role})
    ))
    .then(unObjects => unObjects.filter(unObject => 
      _.isNil(unObject.minUserAge)
        ? true
        : hasValidAge(user, unObject)
    ))
}

export const searchActionResolverUnObjects = (input: SearchInput, user: User): Promise<UnObject[]> => {
  return getActionResolverUnObjects(user)
    .then(searchNpcsByName(input.query))
}

/**
 * @param unObjectId 
 * @return the ActionResolver for the given unObjectId (id'ed by unObject.id or unObject.handlerUnObjectId)
 */
const mapUnObjectIdToActionResolver = (unObjectId: string): Promise<ActionResolver> => {
  return store.unObjectById(unObjectId)
    .then(sf.maybe_fmap(
      (unObject: UnObject) => getActionResolvers()
        .then(
          (actionResolvers: ActionResolver[]) => {
            const retMe = _.find(actionResolvers, actionResolver => actionResolver.unObjectId == unObject.id)
            return _.isNil(retMe)
              ? _.find(actionResolvers, actionResolver => actionResolver.unObjectId == unObject.handlerUnObjectId)
              : retMe
          }
        )
    ))
}

const mapUsernameToActionResolver = async (username: string): Promise<ActionResolver> => {
  const resolvers = await getP2PActionResolvers()
  return resolvers.find(r => r.username === username) ||
    resolvers.find(r => r.unObjectId === DEFAULT_NPC_ID)
}

export const mapChatRoomIdToContextId = (chatRoomId: string): string => {
  return mapEntityRefToEid({ entityType: EntityType.ChatRoom, id: chatRoomId })
}

// Filter all the ActionResolver properties that are action handlers
type Method = { [K in keyof ActionResolver]: ActionResolver[K] extends ActionResolverFn ? K : never }[keyof ActionResolver];

const invokeResolver = <T>(contextApi: ChatRoomActionContextApi, methodName: Method, defaultValue?: T): Promise<T> => {
  const unObject = contextApi.getUnObject().getNode()
  const partner = contextApi.getPartner().getNode()
  let loadResolver: Promise<ActionResolver | undefined> | undefined

  if (unObject) {
    loadResolver = mapUnObjectIdToActionResolver(unObject.id)
  } else if (models.isUser(partner)) {
    loadResolver = mapUsernameToActionResolver(partner.username)
  }
  if (loadResolver) {
    return loadResolver.then((resolver) => {
      const method = resolver?.[methodName]
      if (!resolver) {
        logger.error('actionResolver not found', methodName, partner.id)
      } else if (_.isFunction(method)) {
        return method.call(resolver, contextApi, contextApi.getArgs())
      }
      return defaultValue
    })
  }
  return Promise.resolve(defaultValue)
}

// TODO: We have a bunch of polymorphic GQL types that are used as any, we need to refactor
type ChatRoomInput = SubmitChatRoomActionInput | EnterChatRoomInput | CreateChatRoomCommentInput

/**
 * @return the ChatRoomActionContext object that is passed to the handler module.
 */
export const buildChatRoomActionContextWithAction = (
  input: SubmitChatRoomActionInput,
  ctx: any,
  actionArgs: object
): Promise<ChatRoomActionContext> => {
  if (!input.createdAt) {
    // If the FE didn't include it, at least set the server receive time
    input.createdAt = new Date().toISOString()
  }
  return Bluebird.Promise.props({
    chatRoomActionContext: buildChatRoomActionContext(input, ctx),
    currentAction: store.actionByName(input.name),
  })
    .then(({ chatRoomActionContext, currentAction }) => {
      // FIXME: if actionName doesn't exist, the currentAction is undefined
      chatRoomActionContext.currentAction = currentAction
      // Force in the args even if the action is missing (needs to be fixed)
      _.set(chatRoomActionContext, 'currentAction.args', actionArgs || {})
      return chatRoomActionContext
    })
}

/**
 *  TODO: perf: optimize, perhaps w/ lazy loading.  would require changes to ChatRoomActionContextApi and NodeApi.
 * @return the ChatRoomActionContext object that is passed to the handler module.
 */
export const buildChatRoomActionContext = (input: ChatRoomInput, ctx: any): Promise<ChatRoomActionContext> => {
  const sessionUser: User = ctx.user
  const { chatRoomId, asUnObjectId } = input
  return store.chatRoomById(chatRoomId)
    .then(chatRoom => store.chatRoomPlayers(chatRoom.id, chatRoom)
      .then(players => {
        const unObject = players.find(player => player.entityType === EntityType.UnObject)
        return { unObject: unObject as UnObject, players }
      })
      .then(({ unObject, players  }) => Bluebird.Promise.props({
        type: ActionContextType.ChatRoomActionContext,
        actor: mapAndAuthzSessionUserToPlayer(sessionUser, asUnObjectId),
        sessionUser,
        players: players,
        unObject: unObject,
        maker: store.mapUnObjectToUser(unObject),
        chatRoom,
        contextId: mapChatRoomIdToContextId(chatRoomId),
        context: ctx,
        isJob: !!ctx.isJob,
      }))
    )
}

export const buildChatRoomActionContextApi = (input: ChatRoomInput, ctx: any): Promise<ChatRoomActionContextApi> => {
  return buildChatRoomActionContext(input, ctx)
    .then(chatRoomContext => ChatRoomActionContextApiFactory(
      chatRoomContext,
      { input }
    ))
}

export const invokeOnEnter = (input: ChatRoomInput, ctx): Promise<any> => {
  let api: ChatRoomActionContextApi
  return buildChatRoomActionContextApi(input, ctx)
    .then(contextApi => api = contextApi)
    .then(() => events.room.entering.notify({ api }))
    .then(() => invokeResolver(api, 'onEnter'))
    .then(sft.tap_wait(() => events.room.entered.notify({ api })))
    .then(misc.convertToPlainObject)
}

export const invokeOnBeforeEnter = (input: ChatRoomInput, ctx): Promise<any> => {
  return buildChatRoomActionContextApi(input, ctx)
    .then(contextApi => invokeResolver(contextApi, 'onBeforeEnter', []))
    .then(sft.list_fmap_wait(assetToURL))
    .then(urls => _.uniq(_.compact(urls)))
    .then(misc.convertToPlainObject)
}

const assetToURL = async (asset: BeforeEnterAsset): Promise<string> => {
  // Objects with S3Keys need to go through the resolver
  if (_.isObject(asset) && asset.s3Key) {
    return (await resolveImageNoDefault(asset)).uri
  }
  // Keep only the URIs and S3 keys
  if (!_.isString(asset) || !/\.\w{3,4}($|\?)/.test(asset)) {
    return ''
  }
  // Return absolute URLs intact and point relative URLs directly to S3
  return toPublicUrl(asset)
}

export const invokeOnExit = (input: EnterChatRoomInput, ctx): Promise<any> => {
  return buildChatRoomActionContextApi(input, ctx)
    .then(contextApi => invokeResolver(contextApi, 'onExit'))
    .then(misc.convertToPlainObject)
}

export const invokeOnComment = (input: CreateChatRoomCommentInput, ctx): Promise<any> => {
  return buildChatRoomActionContextApi(input, ctx)
    .then(contextApi => invokeResolver(contextApi, 'onComment'))
}
