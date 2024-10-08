/**
 * @rob4lderman
 * oct2019
 * 
 * TODO: PROBLEM: can't override behavior that happens within the function.
 *     i.e. can't reroute setLocalState -> setGlobalState within the function.
 *     bc i'm not calling the method via the object, i.e. object.setLocalState
 *     basicallly bc only the data is polymorphic.
 *     the functions are NOT.  
 *     i could add switch-case polymorphism... which indeed is flexible.
 *     but not as elegant as extending classes.
 *     we want to provide IMMUTABLE polymorphic INTERFACES.
 *     or do we?  does it make the code harder to understand?
 */

import moment from 'moment'
import {
  SaveFieldOutput,
  CreateChatRoomSystemCommentOutput,
  AnimationType,
  EffectType,
  SaveTileOutput,
  SaveTileInput,
  CreateEffectOutput,
  CreateEffectInput,
  PushNotificationMessageInput,
  NotificationType,
  Notification,
  CreateNotificationInput,
  Image,
  TileInput,
  TileOutput,
  EntityScope,
  SystemMessageStyle,
} from 'src/gql-types'
import {
  Field,
  Tile,
  ActionXInstance,
} from 'src/db/entity'
import {
  NodeContext,
  SetLocalStateInput,
  SetGlobalStateInput,
  AnimationEffectMetadata,
  SaveTileInputInContext,
  SystemMessageEffectMetadata,
  EffectMetadata,
  GameNode,
  NodeApi,
  ActionXInstanceTemplate,
  ActionXInstanceTransferTemplate,
  ChatRoomActionContextApi,
  ActionXInstanceReplaceTemplate,
  FieldTemplate,
  HandlebarsValues,
  SendMessageInput,
} from 'src/types'
import { registerReactionFnMap } from 'src/enginev3'
import { sf, sft } from 'src/utils'
import * as models from 'src/graphql/models'
import * as core from 'src/graphql/core'
import { compileAndResolve } from 'src/graphql/handlebars'
import * as makerApi from './MakerApi'
import _ from 'lodash'
import { MakerJobQueueInstance, IMakerImplicit, IMakerJob } from 'src/queue/maker'
import { QueueJobOptions } from 'src/queue/core'
import { Job } from 'bull'
import { StringTags } from 'src/domain/strings'
import { lookupString } from 'src/maker/strings'
import { NPCId } from 'src/domain/npcs'
import { events } from 'src/events'
import removeMd from 'remove-markdown'

export const NodeApiFactory = (node: GameNode, contextApi: ChatRoomActionContextApi): NodeApi => {
  const context = contextApi.getContext()
  const nodeContext: NodeContext = { node, context }

  const setLocalState = _.partial(makerApi.setLocalState, nodeContext)
  const setGlobalState = _.partial(makerApi.setGlobalState, nodeContext)
  const incrementLocalState = _.partial(makerApi.incrementLocalState, nodeContext)
  const incrementGlobalState = _.partial(makerApi.incrementGlobalState, nodeContext)
  const field = _.partial(makerApi.field, nodeContext) as any
  const fieldsByType = _.partial(makerApi.fieldsByType, nodeContext) as any
  const incrementField = _.partial(makerApi.incrementField, nodeContext) as any
  const tile = _.partial(makerApi.tile, nodeContext)
  const saveTile = _.partial(makerApi.saveTile, nodeContext) as any
  const saveTiles = _.partial(makerApi.saveTiles, nodeContext) as any
  const saveTileNoPublish = _.partial(makerApi.saveTileNoPublish, nodeContext) as any
  const deleteComments = _.partial(makerApi.deleteComments, nodeContext)
  const updateUserFields = _.partial(makerApi.updateUserFields, nodeContext)
  const saveComment = _.partial(makerApi.saveComment, nodeContext)
  const readActionInstance = _.partial(makerApi.readActionInstanceByPlayerEidAndId, nodeContext)
  const readActionInstances = _.partial(makerApi.readActionInstances, nodeContext)
  const countActionInstances = _.partial(makerApi.countActionInstances, nodeContext)
  const readAllActionInstances = _.partial(makerApi.readAllActionInstances, nodeContext)
  const inactivateLiveNewsfeedItem = _.partial(makerApi.inactivateLiveNewsfeedItem, nodeContext)

  const saveField = <T>(input: FieldTemplate<T> | Field): Promise<Field> => (
    makerApi.saveField(nodeContext, input).then(
      sft.tap_wait((field: Field) => events.field.saved.notify({ api: contextApi, node: nodeApi, field }))
    )
  )

  const createActionInstance = (input: ActionXInstanceTemplate): Promise<ActionXInstance> => (
    makerApi.createActionInstance(nodeContext, input).then(
      sft.tap_wait(item => events.item.created.notify({ api: contextApi, node: nodeApi, instance: item }))
    )
  )
  const deleteActionInstance = (input: ActionXInstanceTemplate): Promise<ActionXInstance> => (
    makerApi.deleteActionInstance(nodeContext, input).then(
      sft.tap_wait(item => events.item.destroyed.notify({ api: contextApi, node: nodeApi, instance: item }))
    )
  )
  const transferActionInstance = (input: ActionXInstanceTransferTemplate): Promise<ActionXInstance> => (
    makerApi.transferActionInstance(nodeContext, input).then(
      sft.tap_wait(item => {
        const to = NodeApiFactoryByEid(input.transferToPlayerEid, contextApi)
        return to && events.item.transferred.notify({ api: contextApi, node: nodeApi, instance: item, to })
      })
    )
  )
  const replaceActionInstance = (input: ActionXInstanceReplaceTemplate): Promise<ActionXInstance | undefined> => (
    deleteActionInstance({ id: input.id, actionName: input.actionName, trxDescription: `Replaced for a ${input.toActionName}` })
      .then((value) => createActionInstance({
        actionName: input.toActionName, trxDescription: `Replaced a ${value.actionName} with id ${value.id}`,
      }))
  )

  const getLocalState = (name: string, defaultInput: SetLocalStateInput = null): Promise<Field> => {
    return makerApi.getLocalState(nodeContext, name)
      .then(sf.thru_if((field: Field) => _.isNil(field) && !!!_.isEmpty(defaultInput))(
        () => setLocalState(defaultInput)
          .then((saveFieldOutput: SaveFieldOutput) => saveFieldOutput.field)
      ))
  }

  const getGlobalState = (name: string, defaultInput: SetGlobalStateInput = null): Promise<Field> => {
    return makerApi.getGlobalState(nodeContext, name)
      .then(sf.thru_if((field: Field) => _.isNil(field) && !!!_.isEmpty(defaultInput))(
        () => setGlobalState(defaultInput)
          .then((saveFieldOutput: SaveFieldOutput) => saveFieldOutput.field)
      ))
  }

  const getName = (): string => getKey('name') || getKey('displayName') || getEid()
  const getNode = (): GameNode => node
  const getKey = (key: string, defaultValue: any = undefined): any => _.get(node, key, defaultValue)
  const isActor = (): boolean => getId() === context?.actor.id
  const isUser = _.partial(models.isUser, node)
  const isUnObject = _.partial(models.isUnObject, node)
  const isChatRoom = _.partial(models.isChatRoom, node)
  const getEid = (): string => models.mapEntityRefToEid(node)
  const getId = (): string => node?.id
  const isSameAs = (other: NodeApi): boolean => getEid() === other.getEid()

  const isFriendedBy = (user: NodeApi): Promise<boolean> => {
    if (!isUser() || !user.isUser()) {
      return Promise.resolve(false)
    }
    return makerApi.isFriendedBy(nodeContext, user.getId())
  }

  const resolveText = (text: string, values?: HandlebarsValues): Promise<string> => {
    const partner = models.getPartner(context.players, context.actor)
    return compileAndResolve(text, { ...context, ...values, partner, node })
  }

  const resolveTags = (tags: StringTags, optional?: StringTags, values?: HandlebarsValues): Promise<string | null> => {
    const text = lookupString(tags, optional)
    return text ? resolveText(text, values) : Promise.resolve(null)
  }

  const sendSystemComment = (text: string): Promise<CreateChatRoomSystemCommentOutput> => {
    return makerApi.createChatRoomSystemComment([models.mapEntityRefToEid(node)], text, context)
  }

  const sendSystemMessage = (text: string, metadata: SystemMessageEffectMetadata = null): Promise<CreateEffectOutput> => {
    return doPrivateLocalEffect(EffectType.SystemMessageEffect, _.extend({ text }, metadata))
  }

  const sendMessage = async (input: SendMessageInput): Promise<CreateEffectOutput> => {
    let { text, tags } = input
    const { optional, values, from, metadata } = input

    if (text) {
      text = await resolveText(text, values)
    } else if (tags) {
      tags = [...tags, 'system_message']
      text = await resolveTags(tags, optional, values)
    }
    if (!text) {
      return null
    }
    const s3Key = from && (from.getKey('coverS3Key') || from.getKey('s3Key'))
    const sys = await sendSystemMessage(text, { style: SystemMessageStyle.ChatStyle01, image: { s3Key }, ...(metadata || {}) })
    if (tags) {
      await events.message.tagged.sent.notify({ api: contextApi, node: nodeApi, from, tags, optional, values, text })
    }
    await events.message.sent.notify({ api: contextApi, node: nodeApi, from, text, values })
    return sys
  }

  const sendPing = (): Promise<void> => {
    // Listen for a unique action sent to this NPC
    const actionName = `ping.${node.id}.${Date.now()}`
    const promise = new Promise<void>((resolve, reject) => {
      // Have a race between their action and a timeout
      const timeout = setTimeout(reject, 10e3)
      // TODO: When needed, add a way to clean these up
      registerReactionFnMap(context.unObject.id as NPCId, {
        [actionName]: () => {
          clearTimeout(timeout)
          resolve()
          return Promise.resolve()
        },
      })
    })
    // Run a sequence that only has an Action effect with the callback
    return doPrivateLocalEffect(EffectType.SequenceEffect, {
      sequenceEffectItems: [{
        type: EffectType.ActionEffect,
        actionCallback: { actionName },
      }],
    }).then(() => promise)
  }

  const setLocalAction = _.partial(makerApi.setLocalAction, nodeContext)
  const setLocalActions = _.partial(makerApi.setLocalActions, nodeContext)
  const setLocalActionNoPublish = _.partial(makerApi.setLocalActionNoPublish, nodeContext)
  const setLocalActionsNoPublish = _.partial(makerApi.setLocalActionsNoPublish, nodeContext)
  const deleteLocalActions = _.partial(makerApi.deleteLocalActions, nodeContext)
  const setGlobalAction = _.partial(makerApi.setGlobalAction, nodeContext)
  const setGlobalActions = _.partial(makerApi.setGlobalActions, nodeContext)
  const setGlobalActionsNoPublish = _.partial(makerApi.setGlobalActionsNoPublish, nodeContext)
  const getActionEdge = _.partial(makerApi.getActionEdge, nodeContext)
  const setCurrentActionEdges = _.partial(makerApi.setCurrentActionEdges, nodeContext)
  const saveCurrentActionStubs = _.partial(makerApi.saveCurrentActionStubs, nodeContext) as any
  const setCurrentActionEdgesToGlobalActionEdges = _.partial(makerApi.setCurrentActionEdgesToGlobalActionEdges, nodeContext)
  const readOrCreateLocalActionEdges = _.partial(makerApi.readOrCreateLocalActionEdges, nodeContext) as any
  const soundEffects = _.partial(makerApi.soundEffects, nodeContext)
  const vibrationEffects = _.partial(makerApi.vibrationEffects, nodeContext)
  const systemMessages = _.partial(makerApi.systemMessages, nodeContext)
  const modals = _.partial(makerApi.modals, nodeContext)

  // TODO: : currently saveLocal/GlobalTile is being attached to the wrong player (actor instead of partner)
  const saveLocalTile = (input1: SaveTileInputInContext): Promise<SaveTileOutput> => {
    return setLocalTile(input1.name, input1)
  }

  const getLocalTile = (name: string, defaultInput: SaveTileInputInContext = null): Promise<Tile> => {
    const input: TileInput = {
      name,
      collectionId: buildLocalCollectionId('tile'),
    }
    return core.nodeTile(node, { input })
      .then((output: TileOutput) => output.tile)
      .then(sf.thru_if((val) => _.isNil(val) && !!!_.isEmpty(defaultInput))(
        () => setLocalTile(name, defaultInput)
          .then((saveTileOutput: SaveTileOutput) => saveTileOutput.tile)
      ))
  }

  const getPrivateLocalTile = (name: string, defaultInput: SaveTileInputInContext = null): Promise<Tile> => {
    const input: TileInput = {
      name,
      collectionId: buildLocalCollectionId('privatetile'),
    }
    return core.nodeTile(node, { input })
      .then((output: TileOutput) => output.tile)
      .then(sf.thru_if((val) => _.isNil(val) && !!!_.isEmpty(defaultInput))(
        () => setPrivateLocalTile(name, defaultInput)
          .then((saveTileOutput: SaveTileOutput) => saveTileOutput.tile)
      ))
  }

  const getGlobalTile = (name: string, defaultInput: SaveTileInputInContext = null): Promise<Tile> => {
    const input: TileInput = {
      name,
      collectionId: buildGlobalCollectionId('tile'),
    }
    return core.nodeTile(node, { input })
      .then((output: TileOutput) => output.tile)
      .then(sf.thru_if((val) => _.isNil(val) && !!!_.isEmpty(defaultInput))(
        () => setGlobalTile(name, defaultInput)
          .then((saveTileOutput: SaveTileOutput) => saveTileOutput.tile)
      ))
  }

  const getTile = getGlobalTile

  const getPrivateGlobalTile = (name: string, defaultInput: SaveTileInputInContext = null): Promise<Tile> => {
    const input: TileInput = {
      name,
      collectionId: buildGlobalCollectionId('privatetile'),
    }
    return core.nodeTile(node, { input })
      .then((output: TileOutput) => output.tile)
      .then(sf.thru_if((val) => _.isNil(val) && !!!_.isEmpty(defaultInput))(
        () => setPrivateGlobalTile(name, defaultInput)
          .then((saveTileOutput: SaveTileOutput) => saveTileOutput.tile)
      ))
  }

  const saveGlobalTile = (input1: SaveTileInputInContext): Promise<SaveTileOutput> => {
    return setGlobalTile(input1.name, input1)
  }

  const deleteLocalTile = (name: string): Promise<SaveTileOutput> => {
    return getLocalTile(name)
      .then(sf.maybe_fmap(
        (tile: Tile) => Promise.resolve(makerApi.mapTileToSaveTileInputInContext(tile))
          .then((input: SaveTileInputInContext) => _.extend(input, { isDeleted: true }))
          .then(_.partial(setLocalTile, name))
      ))
  }

  const deleteGlobalTile = (name: string): Promise<SaveTileOutput> => {
    return getGlobalTile(name)
      .then(sf.maybe_fmap(
        (tile: Tile) => Promise.resolve(makerApi.mapTileToSaveTileInputInContext(tile))
          .then((input: SaveTileInputInContext) => _.extend(input, { isDeleted: true }))
          .then(_.partial(setGlobalTile, name))
      ))
  }

  const removeTile = deleteGlobalTile

  const deletePrivateLocalTile = (name: string): Promise<SaveTileOutput> => {
    return getPrivateLocalTile(name)
      .then(sf.maybe_fmap(
        (tile: Tile) => Promise.resolve(makerApi.mapTileToSaveTileInputInContext(tile))
          .then((input: SaveTileInputInContext) => _.extend(input, { isDeleted: true }))
          .then(_.partial(setPrivateLocalTile, name))
      ))
  }

  const deletePrivateGlobalTile = (name: string): Promise<SaveTileOutput> => {
    return getPrivateGlobalTile(name)
      .then(sf.maybe_fmap(
        (tile: Tile) => Promise.resolve(makerApi.mapTileToSaveTileInputInContext(tile))
          .then((input: SaveTileInputInContext) => _.extend(input, { isDeleted: true }))
          .then(_.partial(setPrivateGlobalTile, name))
      ))
  }

  /**
     * Global: visible in every PlayRoom
     * Public: visible to other Players
     */
  const setGlobalTile = (name: string, input1: SaveTileInputInContext): Promise<SaveTileOutput> => {
    const input: SaveTileInput = _.extend(
      { name },
      _.omit(input1, 'id'), // TODO
      { thisEid: models.mapEntityRefToEid(node) },
      { collectionId: buildGlobalCollectionId('tile') },
      { scope: EntityScope.GlobalScope }
    )
    return makerApi.coreSaveTile(input, context)
  }

  const applyTile = (name: string, input1: SaveTileInputInContext): Promise<SaveTileOutput> => {
    return setGlobalTile(name, _.extend({ isDeleted: false }, input1))
  }

  /**
     * Global: visible in every PlayRoom
     * Private: visible to only this Player
     */
  const setPrivateGlobalTile = (name: string, input1: SaveTileInputInContext): Promise<SaveTileOutput> => {
    const input: SaveTileInput = _.extend(
      { name },
      _.omit(input1, 'id'), // TODO
      { thisEid: models.mapEntityRefToEid(node) },
      { collectionId: buildGlobalCollectionId('privatetile') },
      { scope: EntityScope.GlobalScope }
    )
    return makerApi.coreSaveTile(input, context)
  }

  /**
     * Local: visible in only this PlayRoom
     * Public: visible to other Players
     */
  const setLocalTile = (name: string, input1: SaveTileInputInContext): Promise<SaveTileOutput> => {
    const input: SaveTileInput = _.extend(
      { name },
      _.omit(input1, 'id'), // TODO
      { thisEid: models.mapEntityRefToEid(node) },
      { collectionId: buildLocalCollectionId('tile') },
      { scope: EntityScope.ChatRoomScope }
    )
    return makerApi.coreSaveTile(input, context)
  }

  /**
     * Local: visible in only this PlayRoom
     * Private: visible to only this Player
     */
  const setPrivateLocalTile = (name: string, input1: SaveTileInputInContext): Promise<SaveTileOutput> => {
    const input: SaveTileInput = _.extend(
      { name },
      _.omit(input1, 'id'), // TODO
      { thisEid: models.mapEntityRefToEid(node) },
      { collectionId: buildLocalCollectionId('privatetile') },
      { scope: EntityScope.ChatRoomScope }
    )
    return makerApi.coreSaveTile(input, context)
  }

  const buildLocalCollectionId = _.partial(makerApi.buildLocalCollectionId, nodeContext)
  const buildGlobalCollectionId = _.partial(makerApi.buildGlobalCollectionId, nodeContext)

  /**
     * Global: visible in every PlayRoom
     * Public: visible to other Players
     */
  const doGlobalEffect = (effectType: EffectType, metadata: EffectMetadata): Promise<CreateEffectOutput> => {
    const input: CreateEffectInput = {
      type: effectType,
      collectionId: buildGlobalCollectionId('effect'),
      scope: EntityScope.GlobalScope,
      thisEid: models.mapEntityRefToEid(node),
      metadata: metadata,
    }
    return makerApi.createEffect(input, context)
  }

  const applyEffect = doGlobalEffect

  const saveEffect = _.partial(makerApi.saveEffect, nodeContext) as any
  const saveEffectOnTile = _.partial(makerApi.saveEffectOnTile, nodeContext) as any

  /**
     * Global: visible in every PlayRoom
     * Private: visible to only this Player
     */
  const doPrivateGlobalEffect = (effectType: EffectType, metadata: EffectMetadata): Promise<CreateEffectOutput> => {
    const input: CreateEffectInput = {
      type: effectType,
      collectionId: buildGlobalCollectionId('privateeffect'),
      scope: EntityScope.GlobalScope,
      thisEid: models.mapEntityRefToEid(node),
      metadata: metadata,
    }
    return makerApi.createEffect(input, context)
  }

  /**
     * Local: visible in only this PlayRoom
     * Public: visible to other Players
     */
  const doLocalEffect = (effectType: EffectType, metadata: EffectMetadata): Promise<CreateEffectOutput> => {
    const input: CreateEffectInput = {
      type: effectType,
      collectionId: buildLocalCollectionId('effect'),
      scope: EntityScope.ChatRoomScope,
      thisEid: models.mapEntityRefToEid(node),
      metadata: metadata,
    }
    return makerApi.createEffect(input, context)
  }

  /**
     * Local: visible in only this PlayRoom
     * Private: visible to only this Player
     */
  const doPrivateLocalEffect = (effectType: EffectType, metadata: EffectMetadata): Promise<CreateEffectOutput> => {
    const input: CreateEffectInput = {
      type: effectType,
      collectionId: buildLocalCollectionId('privateeffect'),
      scope: EntityScope.ChatRoomPrivateScope,
      thisEid: models.mapEntityRefToEid(node),
      metadata: metadata,
    }
    return makerApi.createEffect(input, context)
  }

  const doLocalAnimation = (animationType: AnimationType, metadata: AnimationEffectMetadata): Promise<CreateEffectOutput> => {
    return doLocalEffect(EffectType.AnimationEffect, {
      animationType,
      ...metadata,
    })
  }

  const doLocalSourcedAnimation = (sourceUri: string, metadata: AnimationEffectMetadata): Promise<CreateEffectOutput> => {
    return doLocalEffect(EffectType.AnimationEffect, {
      animationType: AnimationType.SourcedAnimation,
      ..._.extend({}, metadata, { sourceUri }),
    })
  }

  const doLocalAnimationOnTileId = (tileId: string, animationType: AnimationType, metadata: AnimationEffectMetadata): Promise<CreateEffectOutput> => {
    if (_.isEmpty(tileId)) {
      throw new Error('ERROR: doLocalAnimationOnTileId: Tile must have an id')
    }
    return doLocalEffect(EffectType.AnimationEffect, {
      animationType,
      ..._.extend({}, metadata, { tileId }),
    })
  }

  const doLocalAnimationOnLocalTile = (input: SaveTileInputInContext, animationType: AnimationType, metadata: AnimationEffectMetadata): Promise<CreateEffectOutput> => {
    return getLocalTile(_.get(input, 'name'), input)
      .then(sf.maybe_fmap(
        (tile: Tile) => doLocalAnimationOnTileId(tile.id, animationType, metadata)
      ))
  }

  const applyAnimationOnTile = (input: SaveTileInputInContext, animationType: AnimationType, metadata: AnimationEffectMetadata): Promise<CreateEffectOutput> => {
    return getTile(_.get(input, 'name'), input)
      .then(sf.maybe_fmap(
        (tile: Tile) => applyAnimationOnTileId(tile.id, animationType, metadata)
      ))
  }

  const applyAnimationOnTileId = (tileId: string, animationType: AnimationType, metadata: AnimationEffectMetadata): Promise<CreateEffectOutput> => {
    if (_.isEmpty(tileId)) {
      throw new Error('ERROR: applyAnimationOnTileId: Tile must have an id')
    }
    return applyEffect(EffectType.AnimationEffect, {
      animationType,
      ..._.extend({}, metadata, { tileId }),
    })
  }

  const applyAnimation = (animationType: AnimationType, metadata: AnimationEffectMetadata): Promise<CreateEffectOutput> => {
    return applyEffect(EffectType.AnimationEffect, {
      animationType,
      ...metadata,
    })
  }

  const sendNotification = (input: PushNotificationMessageInput): Promise<Notification> => {
    const input1: CreateNotificationInput = {
      type: NotificationType.HandlerNotification,
      playerEid: models.mapEntityRefToEid(node),
      collectionId: models.buildCollectionId(context.contextId, 'notification'),
      eventEid: models.mapEntityRefToEid(context.actor),
      metadata: {
        notification: {
          title: input.title ? removeMd(input.title) : 'Unreal',
          body: input.body && removeMd(input.body),
        },
      },
    }
    return makerApi.createNotification(input1, context).then(({ notification }) => notification)
  }

  const sendTaggedNotification = async (tags: StringTags, optional?: StringTags, values?: HandlebarsValues): Promise<Notification | null> => {
    const bodyTags: StringTags = [...tags, 'push_notification', 'body']
    const body = await resolveTags(bodyTags, optional, values)
    if (!body) {
      return null
    }
    const title = await resolveTags([...tags, 'push_notification', 'title'], optional, values)
    const notif = await sendNotification({ title, body })
    await events.notification.tagged.sent.notify({ api: contextApi, node: nodeApi, tags: bodyTags, optional, values, text: body })
    return notif
  }

  const getImage = (): Promise<Image> => {
    return core.resolveImage(node)
  }

  const scheduleJobD = <T>(nodeContext: NodeContext, input: IMakerImplicit<T>, opts?: QueueJobOptions): Promise<Job<IMakerJob<T>>> => {
    return MakerJobQueueInstance.add<IMakerJob>({
      id: input.id,
      jobNodeEid: getEid(),
      chatRoomId: nodeContext.context.chatRoom.id,
      sessionUserId: nodeContext.context.sessionUser.id,
      trackingId: nodeContext.context.context.trackingId,
      actionName: input.actionName,
      dispatchAt: input.dispatchAt,
      args: input.args || {},
    }, opts)
  }

  const scheduleJob = _.partial(scheduleJobD, nodeContext)
  const cancelJob = (id: string): Promise<void> => {
    return MakerJobQueueInstance.cancel(id)
  }
  // This is not great, but needed until we re-think these APIs relationships
  const getContextApi = (): ChatRoomActionContextApi => contextApi
  const getLocalTime = (): moment.Moment => moment().utcOffset(
    models.isUser(node) && -node.timezoneOffset || 0
  )

  const nodeApi: NodeApi = {
    field,
    fieldsByType,
    saveField,
    incrementField,
    tile,
    saveTile,
    saveTiles,
    saveTileNoPublish,
    saveEffect,
    saveEffectOnTile,

    setLocalState,
    setGlobalState,
    getLocalState,
    getGlobalState,
    getName,
    getEid,
    getId,
    getNode,
    getKey,
    isSameAs,
    resolveText,
    resolveTags,
    sendSystemComment,
    sendSystemMessage,
    sendMessage,
    sendPing,
    incrementLocalState,
    incrementGlobalState,
    isActor,
    isUser,
    isUnObject,
    isChatRoom,
    isFriendedBy,

    applyTile,
    setGlobalTile,
    setPrivateGlobalTile,
    setLocalTile,
    setPrivateLocalTile,
    saveLocalTile,
    getLocalTile,
    getPrivateLocalTile,
    deleteLocalTile,
    deletePrivateLocalTile,
    saveGlobalTile,
    getTile,
    getGlobalTile,
    getPrivateGlobalTile,
    removeTile,
    deleteGlobalTile,
    deletePrivateGlobalTile,

    applyEffect,
    doGlobalEffect,
    doPrivateGlobalEffect,
    doLocalEffect,
    doPrivateLocalEffect,
    doLocalAnimation,
    doLocalSourcedAnimation,
    doLocalAnimationOnLocalTile,
    doLocalAnimationOnTileId,
    applyAnimationOnTile,
    applyAnimationOnTileId,
    applyAnimation,

    sendNotification,
    sendTaggedNotification,

    getImage,

    setLocalAction,
    setLocalActions,
    setLocalActionNoPublish,
    setLocalActionsNoPublish,
    setGlobalAction,
    setGlobalActions,
    setGlobalActionsNoPublish,
    deleteLocalActions,
    getActionEdge,
    setCurrentActionEdges,
    saveCurrentActionStubs,
    setCurrentActionEdgesToGlobalActionEdges,
    readOrCreateLocalActionEdges,
    deleteComments,
    updateUserFields,
    saveComment,
    createActionInstance,
    deleteActionInstance,
    transferActionInstance,
    replaceActionInstance,
    readActionInstance,
    readActionInstances,
    countActionInstances,
    readAllActionInstances,
    inactivateLiveNewsfeedItem,
    soundEffects,
    vibrationEffects,
    systemMessages,
    modals,

    scheduleJob,
    cancelJob,
    getContextApi,
    getLocalTime,
  }
  return nodeApi
}

export const NodeApiFactoryByEid = (eid: string, contextApi: ChatRoomActionContextApi): NodeApi | undefined => {
  const context = contextApi.getContext()
  // TODO: We can switch to fetch via eid, in practice (currently at least) it's always one of these
  const nodes: GameNode[] = [...context.players, context.chatRoom]
  const node = nodes.find(entity => models.mapEntityToEid(entity) === eid)
  return node && NodeApiFactory(node, contextApi)
}
