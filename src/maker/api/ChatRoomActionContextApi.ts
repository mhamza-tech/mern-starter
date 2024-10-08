import _ from 'lodash'
import { PACKAGE_VERSION } from 'src/env'
import {
  CreateCommentOutput,
  AnimationType,
  CreateEffectOutput,
  SaveImageInput,
  NewsfeedItem,
  EffectType,
  DynamicFeedItemLayout,
} from 'src/gql-types'
import { ActionX } from 'src/db/entity'
import * as models from 'src/graphql/models'
import {
  ChatRoomActionContext,
  AnimationEffectMetadata,
  NewsfeedItemTemplate,
  ChatRoomActionContextApi,
  NodeApi,
} from 'src/types'
import * as makerApi from './MakerApi'
import {
  NodeApiFactory,
  NodeApiFactoryByEid,
} from './NodeApi'

// Sent by the FE in the target when the give drop zone is used
const GIVE_DROP_ZONE = 'give'

export const ChatRoomActionContextApiFactory = (context: ChatRoomActionContext, args: any): ChatRoomActionContextApi => {
  const getVersion = (): string => PACKAGE_VERSION
  const getContext = (): ChatRoomActionContext => context
  const getGqlContext = (): any => _.get(context, 'context')
  const getArgs = (): any => args
  const getActor = (): NodeApi => NodeApiFactory(context.actor, contextApi)
  const getUnObject = (): NodeApi => NodeApiFactory(context.unObject, contextApi)
  const getMaker = (): NodeApi => NodeApiFactory(context.maker, contextApi)
  const getUser = (): NodeApi => NodeApiFactory(context.players.find(models.isUser), contextApi)
  const getPlayers = (): NodeApi[] => context.players.map(player => NodeApiFactory(player, contextApi))
  const getPartner = (): NodeApi => NodeApiFactory(models.getPartner(context.players, context.actor), contextApi)
  const getSessionUser = (): NodeApi => NodeApiFactory(context.sessionUser, contextApi)
  const getChatRoom = (): NodeApi => NodeApiFactory(context.chatRoom, contextApi)
  const getJobNode = (): NodeApi | undefined => NodeApiFactoryByEid(args?.jobNodeEid, contextApi)
  const sendUnObjectComment = (text: string): Promise<CreateCommentOutput> => makerApi.createChatRoomComment(context.unObject, text, context)
  const selectByUniformDist = makerApi.selectByUniformDist

  const getByEid = (eid: string): Promise<NodeApi | undefined> => {
    // First try to find it in the context
    const nodeApi = NodeApiFactoryByEid(eid, contextApi)
    if (nodeApi || !eid) {
      return Promise.resolve(nodeApi)
    }
    return makerApi.getByEid(eid).then(node => node && NodeApiFactory(node, contextApi))
  }

  /**
   * Public, Global Effect on the ChatRoom 
   */
  const doAnimation = (animationType: AnimationType, metadata: AnimationEffectMetadata): Promise<CreateEffectOutput> =>
    getChatRoom().doGlobalEffect(EffectType.AnimationEffect, {
      animationType,
      ...metadata,
    })

  /**
   * Public, Global Effect on the ChatRoom 
   */
  const doSourcedAnimation = (sourceUri: string, metadata: AnimationEffectMetadata): Promise<CreateEffectOutput> =>
    getChatRoom().doGlobalEffect(EffectType.AnimationEffect, {
      animationType: AnimationType.SourcedAnimation,
      ..._.extend({}, metadata, { sourceUri }),
    })

  const isSelfChatRoom = (): boolean => getActor().isSameAs(getPartner())
  const getCurrentAction = (): ActionX => context.currentAction
  const getCurrentActionName = (): string => args?.input?.name
  const getCurrentActionTarget = (): string => args?.input?.target
  const isGiveTarget = (): boolean => getCurrentActionTarget() === GIVE_DROP_ZONE
  const isJobAction = (): boolean => !!context?.isJob

  const createNewsfeedItemUnObjectCard = (statusText: string): Promise<NewsfeedItem | null> => {
    const input: NewsfeedItemTemplate = {
      layout: DynamicFeedItemLayout.Dynamic2,
      fromEid: getActor().getEid(),
      metadata: {
        statusText: statusText,
      },
    }
    return makerApi.saveNewsfeedItem(context, input)
  }

  const createNewsfeedItemUnObjectImage = (statusText: string, saveImageInput: SaveImageInput): Promise<NewsfeedItem | null> => {
    const input: NewsfeedItemTemplate = {
      layout: DynamicFeedItemLayout.Dynamic1,
      fromEid: getActor().getEid(),
      metadata: {
        statusText: statusText,
        image: saveImageInput,
      },
    }
    return makerApi.saveNewsfeedItem(context, input)
  }

  const saveNewsfeedItem = (input: NewsfeedItemTemplate): Promise<NewsfeedItem | null> => {
    return makerApi.saveNewsfeedItem(context, input)
  }

  const scheduleJob = _.partial(makerApi.scheduleJob, context)
  const cancelJob = makerApi.cancelJob

  const contextApi: ChatRoomActionContextApi = {
    getVersion,
    getContext,
    getGqlContext,
    getArgs,
    getActor,
    getPartner,
    getUnObject,
    getMaker,
    getUser,
    getPlayers,
    getSessionUser,
    getChatRoom,
    getJobNode,
    getByEid,
    sendUnObjectComment,
    selectByUniformDist,
    doAnimation,
    doSourcedAnimation,
    createNewsfeedItemUnObjectCard,
    createNewsfeedItemUnObjectImage,
    isSelfChatRoom,
    getCurrentAction,
    getCurrentActionName,
    getCurrentActionTarget,
    isGiveTarget,
    isJobAction,
    saveNewsfeedItem,
    scheduleJob,
    cancelJob,
    getActionsByPackageName: makerApi.getActionsByPackageName,
    getActionsByUnObjectId: makerApi.getActionsByUnObjectId,
    getActionByName: makerApi.getActionByName,
    getActionsByName: makerApi.getActionsByName,
    readActionInstance: makerApi.readActionInstanceById,
  }

  return contextApi
}
