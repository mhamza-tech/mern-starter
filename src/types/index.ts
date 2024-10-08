import Bull, { Job } from 'bull'

import { IMakerImplicit, IMakerJob } from 'src/queue/maker'
import { QueueJobOptions } from 'src/queue/core'

import {
  ActionXInstanceTemplate,
  ActionXInstanceTransferTemplate,
  AnimationType,  
  CreateChatRoomSystemCommentOutput,
  CreateCommentOutput,
  CreateEffectOutput,
  EffectType,
  Image,
  NewsfeedItem,
  PushNotificationMessageInput,
  SaveFieldOutput,
  SaveImageInput,
  SaveTileOutput,
  SystemMessageEffectMetadata,
  Notification,
  UpdateUserFields,
  FieldType,
} from 'src/gql-types'

import {
  ActionX,
  ActionXInstance,
  ChatRoom,
  Comment,
  Edge,
  Effect,
  Field,
  Player,
  Tile,
  UnObject,
  User,
} from 'src/db/entity'

import { StringTags } from 'src/domain/strings'
import { SimpleActionXInstanceObject } from 'src/db/entity/ActionXInstance'
import { EffectTemplate, EffectMetadata } from './effect'
import { FieldTemplate } from './field'
import {
  ActionStubSet,
  SetActionInput,
  ActionXInstanceReplaceTemplate,
} from './actionx'
import {
  TileTemplate,
  SaveTileInputInContext,
} from './tile'
import {
  GameNode,
  SetLocalStateInput,
  SetGlobalStateInput,
  PercentileFn,
  NumberFieldMetadata,
  AnimationEffectMetadata,
} from './misc'
import { NewsfeedItemTemplate } from './newsfeed'
import {
  SoundEffect,
  VibrationEffect,
  SystemMessageEffect,
  ModalEffectFactory,
} from 'src/maker/effects'
import { ActionEdgeApi } from 'src/maker/api/ActionEdgeApi'
import { UserStateId } from 'src/domain/userStates'
import { HandlebarsValues, SendMessageInput } from 'src/maker/types'

export enum ActionContextType {
  ActionContext,
  ChatRoomActionContext,
}

export interface ActionContext {
  type: ActionContextType
  contextId: string
  context: any   // graphql context
  actor: Player
  sessionUser: User
}

export interface ChatRoomActionContext extends ActionContext {
  chatRoom?: ChatRoom
  players: Player[]
  unObject?: UnObject
  maker?: User
  currentAction?: ActionX
  isJob?: boolean
}
/**
 * An instance of this type is passed as the first and only argument to 
 * the Reaction function.  
 */
export interface ChatRoomActionContextApi {
  /**
   * @return the API version
   */
  getVersion: () => string

  /**
   * @return the ChatRoomActionContext object this Api is wrapped around.
   */
  getContext: () => ChatRoomActionContext

  /**
   * @return the graphql context object for the current request.
   */
  getGqlContext: () => any

  /**
   * @return a NodeApi wrapped around ChatRoomActionContext.actor (typically the session user)
   */
  getActor: () => NodeApi

  /**
   * @return a NodeApi wrapped around the first object in ChatRoomActionContext.players that is NOT 
   *         the actor.
   */
  getPartner: () => NodeApi

  /**
   * @return a NodeApi wrapped around the first object in ChatRoomActionContext.players w/ entityType=User
   */
  getUser: () => NodeApi

  /**
   * @return a NodeApi wrapped around ChatRoomActionContext.unObject (typically the NPC in the ChatRoom)
   */
  getUnObject: () => NodeApi

  /**
   * @return a NodeApi wrapped around ChatRoomActionContext.maker (the user who created the NPC)
   */
  getMaker: () => NodeApi

  /**
   * @return a NodeApi wrapped around ChatRoomActionContext.sessionUser 
   */
  getSessionUser: () => NodeApi

  /**
   * @return a NodeApi[] wrapped around ChatRoomActionContext.players
   */
  getPlayers: () => NodeApi[]

  /**
   * @return a NodeApi wrapped around ChatRoomActionContext.chatRoom
   */
  getChatRoom: () => NodeApi

  /**
   * @return a NodeApi wrapped around args.jobNodeEid (if any is present)
   */
  getJobNode: () => NodeApi | undefined

  /**
   * @return a NodeApi wrapped around the GameNode with the provided eid
   */
  getByEid: (eid: string) => Promise<NodeApi | undefined>

  /**
   * Create a NewsfeedItem using the given template data.
   * @return Promise<NewsfeedItem>
   */
  saveNewsfeedItem: (newsfeedItemTemplate: NewsfeedItemTemplate) => Promise<NewsfeedItem | null>

  /**
   * @return true if the user is in a ChatRoom w/ themselves 
   *         note: in a self chatroom, actor and partner are the same entity, so most
   *         action logic will probably still work, without the need to special-case the 
   *         self chatroom. 
   */
  isSelfChatRoom: () => boolean

  /**
   * @return ActionX - the currently invoked action
   */
  getCurrentAction: () => ActionX

  /**
   * @return the currently invoked action's name
   */
  getCurrentActionName: () => string

  getCurrentActionTarget: () => string

  isGiveTarget: () => boolean

  isJobAction: () => boolean

  /**
   * Schedules a job to run later (sorta like cron).  
   * The job will run at the scheduled time.  It will re-inflate the current ChatRoomActionContext
   * and execute the designated actionName (as if the user had submitted the action from the app).
   * 
   * @param jobTemplate - defines the actionName and dispatchAt time
   * @return Promise<Job> - the Job record
   */
  scheduleJob: <T>(jobTemplate: IMakerImplicit<T>, opts?: QueueJobOptions) => Promise<Bull.Job<IMakerJob>>

  /**
   * Cancels an earlier created job.
   * This functionality is useful only before a job is run
   * because, behind the scenes, the job is marked as deleted
   *
   * @param id
   * @return Promise<Job> - the Job record
   */
  cancelJob: (id: string) => Promise<void>
  /**
   * @deprecated - shouldn't need access to this.  use getCurrentActionName if you want the action name
   * 
   * @return the graphql args object for the current request.
   */
  getArgs: () => any

  /**
   * @deprecated - use getUnObject().saveComment
   * 
   * Post a comment to the ChatRoom as the NPC/UnObject.
   * @param text - the comment text
   * @return Promise<CreateCommentOutput>
   */
  sendUnObjectComment: (text: string) => Promise<CreateCommentOutput>

  /**
   * @deprecated - use something else... this is too convoluted.
   * 
   * A somewhat convoluted way to implement random outcomes. 
   * There are many other ways... e.g. _.sample.
   */
  selectByUniformDist: (fns: PercentileFn[]) => any

  /**
   * @deprecated - use getChatRoom().saveEffect
   * 
   * Apply a GLOBAL AnimationEffect to the ChatRoom. 
   * The AnimationEffect is visible to all Players in the ChatRoom.
   * This calls getChatRoom().applyEffect(...) under the covers.
   * @param animationType 
   * @param metadata - optional Effect metadata
   * @return Promise<CreateEffectOutput>
   */
  doAnimation: (animationType: AnimationType, metadata?: AnimationEffectMetadata) => Promise<CreateEffectOutput>

  /**
   * @deprecated - use getChatRoom().saveEffect
   * 
   * Apply a GLOBAL AnimationEffect to the ChatRoom. 
   * The AnimationEffect is visible to all Players in the ChatRoom.
   * This calls getChatRoom().applyEffect(...) under the covers.
   * @param sourceUri - the url of the animation (supports Lottie and Gif animations - must have either .json or .gif extension)
   * @param metadata - optional Effect metadata
   * @return Promise<CreateEffectOutput>
   */
  doSourcedAnimation: (sourceUri: string, metadata?: AnimationEffectMetadata) => Promise<CreateEffectOutput>

  /**
   * @deprecated - use saveNewsfeedItem
   * 
   * Creates a NewsfeedItem featuring the UnObject, with the given statusText.
   * @return Promise<NewsfeedItem>
   */
  createNewsfeedItemUnObjectCard: (statusText: string) => Promise<NewsfeedItem | null>

  /**
   * @deprecated - use saveNewsfeedItem
   * 
   * Creates a NewsfeedItem featuring the given image, with the given statusText.
   * @return Promise<NewsfeedItem>
   */
  createNewsfeedItemUnObjectImage: (statusText: string, saveImageInput: SaveImageInput) => Promise<NewsfeedItem | null>

  /**
   * This method returns the list of actions for a package
   */
  getActionsByPackageName: (packageName: string) => Promise<ActionX[]>

  /**
   * This method returns the list of actions for a unObject
   */
  getActionsByUnObjectId: (unObjectId: string) => Promise<ActionX[]>

  /**
   * This method returns an action by its name
   */
  getActionByName: (actionName: string) => Promise<ActionX>

  /**
   * This method returns actions by their name
   */
  getActionsByName: (actionNames: string[]) => Promise<ActionX[]>

  /**
   * This method returns an action instance, regardless of who owns it
   */
  readActionInstance: (id: string) => Promise<SimpleActionXInstanceObject | undefined>
}

export interface NodeApi {

  /**
     * @return the entity this NodeApi is wrapped around.
     *         This is either a User, UnObject, or ChatRoom.  The types are defined under src/db/entity.
     */
  getNode: () => GameNode

  /**
     * @return the wrapped Node's name (only relevant for User / UnObject Nodes)
     */
  getName: () => string

  /**
     * @return the Image associated w this Node (e.g. the User's avatar, the UnObject image)
     */
  getImage: () => Promise<Image>

  /**
     * @return true if the wrapped Node is a User
     */
  isUser: () => boolean

  /**
     * @return true if the wrapped Node is an UnObject
     */
  isUnObject: () => boolean

  /**
     * @return true if the wrapped Node is a ChatRoom
     */
  isChatRoom: () => boolean

  /**
     * @return true if the wrapped Node is the actor (the user who submitted the action)
     */
  isActor: () => boolean

  /**
     * @return true if the wrapped Node is friended by the provided Node 
     */
  isFriendedBy: (user: NodeApi) => Promise<boolean>

  /**
     * @return the wrapped Node's eid.  
     *         Eid's are in the format "{entityType}/{id}", e.g. "user/351fasdf-asdfa212-1234qwer-4321rewq"
     */
  getEid: () => string

  /**
     * @return the wrapped Node's id.  
     *         Note: the id field does NOT contain type info, whereas the eid does.  
     */
  getId: () => string

  /**
     * @return an arbitrary key-value from the entity object that this NodeApi is wrapped around.
     *         e.g. to retrieve User.username, you can call NodeApi.getKey('username')
     */
  getKey: (name: string, defaultValue?: any) => any

  /**
     * @param other - another NodeApi
     * @return boolean - whether the 2 NodeApi's are wrapping the same Node 
     */
  isSameAs: (other: NodeApi) => boolean

  /**
     * Read or create a Field entity.
     * @param input - a FieldTemplate describing the Field.
     *                If the Field does not yet exist, it is created using this input data.
     * @return Promise<Field> - the Field 
     */
  field: <TMetadata>(input: FieldTemplate<TMetadata> | Field) => Promise<Field>

  /**
     * Fetch a Node's Fields by a certain FieldType.
     * @param type - a FieldType
     * @return Promise<Field[]> - the Fields 
     */
  fieldsByType: (type: FieldType) => Promise<Field[]>

  /**
     * Apply a partial update to a Field entity.
     * @param input - can be a FieldTemplate or a previously retrieved Field entity.
     * @return Promise<Field> - the updated Field entity
     */
  saveField: <TMetadata>(input: FieldTemplate<TMetadata> | Field) => Promise<Field>

  /**
     * Convenience operation that reads, increments, and writes back the Field entity.
     * Increments Field.metadata.numberValue by the given amount.
     * If the Field doesn't exist, it is created.
     * @param input - can be a FieldTemplate or a previously retrieved Field entity.
     * @param delta - amount to increment by (can be negative for decrement)
     * @return Promise<Field> - the updated Field entity
     */
  incrementField: (input: FieldTemplate<NumberFieldMetadata> | Field, delta: number) => Promise<Field>

  /**
     * Read or create a Tile entity.
     * @param input - a TileTemplate describing the Tile.
     *                If the Tile does not yet exist, it is created using this input data.
     * @return Promise<Tile> - the Tile 
     */
  tile: (input: TileTemplate) => Promise<Tile>

  /**
     * Apply a partial update to a Tile entity.
     * @param input - can be a TileTemplate or a previously retrieved Tile entity.
     * @return Promise<Tile> - the updated Tile entity
     */
  saveTile: (input: TileTemplate | Tile) => Promise<Tile>

  /**
     * NOTE: all TileTemplates/Tiles must have the same scope / collectionId.
     * @param inputs - an array of TileTemplates or Tiles
     * @return Promise<Tile[]>
     */
  saveTiles: (inputs: TileTemplate[] | Tile[]) => Promise<Tile>

  /**
     * Apply a partial update to a Tile entity.
     * This method DOES NOT stream the update to the frontend.  Most updates should
     * always be streamed to the frontend, so use this method carefully and deliberately.
     * @param input - can be a TileTemplate or a previously retrieved Tile entity.
     * @return Promise<Tile> - the updated Tile entity
     */
  saveTileNoPublish: (input: TileTemplate | Tile) => Promise<Tile>

  /**
     * Create an Effect entity
     * @param input - the Effect to create
     * @return Promise<Effect> - the created Effect
     */
  saveEffect: <TMeta>(input: EffectTemplate<TMeta>) => Promise<Effect>

  /**
     * Create an Effect entity associated with the given Tile.
     * This is for running AnimationEffects on a given Tile.
     * @param input - the Effect to create
     * @param tileInput - the Tile to run the Effect on.  If the Tile doesn't exist, it is created.
     * @return Promise<Effect> - the created Effect
     */
  saveEffectOnTile: <TMeta>(input: EffectTemplate<TMeta>, tileInput: Tile | TileTemplate) => Promise<Effect>

  /**
     * Send a SystemMessageEffect to the user.
     * @param text - the message text 
     * @param metadata - optional additional effect metadata
     * @return Promise<CreateEffectOutput> 
     */
  sendSystemMessage: (text: string, metadata?: SystemMessageEffectMetadata) => Promise<CreateEffectOutput>

  /**
     * Send a SystemMessageEffect to the user as if another Player said it
     * @param input - the message to send
     * @return Promise<CreateEffectOutput> 
     */
  sendMessage: (input: SendMessageInput) => Promise<CreateEffectOutput>

  /**
     * Send an ActionEffect to the user
     * If the front-end doesn't reply before the timeout
     * the returned promise is rejected
     * @return Promise<void> 
     */
  sendPing: () => Promise<void>

  /**
     * Sends a push notification to the User wrapped by this NodeApi.
     * @return Promise<Notification>
     */
  sendNotification: (input: PushNotificationMessageInput) => Promise<Notification>

  /**
     * Sends a push notification. The title and body are taken from tags
     * @return Promise<Notification[]>
     */
  sendTaggedNotification: (tags: StringTags, optional?: StringTags, values?: HandlebarsValues) => Promise<Notification | null>

  /**
     * Use this method to set the current set of actions available in the action sheet.
     * 
     * It takes an ActionStubSet, which defines two arrays of action names:
     *      1. staticActionNames
     *      2. actionInstanceNames 
     * 
     * The main difference between "static actions" and "action instances" is whether
     * or not an individual "instance" of the action is required in the user's action inventory,
     * before the action will be rendered in the action sheet.
     * 
     * "static actions" do not require an action instance. Any actions included in staticActionNames
     * will always show up in the action sheet.  
     * 
     * "action instances" require an action instance; i.e. the user must have an instance of that 
     * action in their inventory.  Otherwise the action will not be rendered in the action sheet.  
     * 
     * Action instances can be created and added to a user's inventory via NodeApi.createActionInstance.
     * Action instances can also be transferred between users via NodeApi.transferActionInstance.
     * (see examples in kitchesink.ts).
     * 
     * Under the covers this method creates/updates an ActionXStubsField attached to the User w/ 
     * scope:ChatRoomScope and streams it down to the frontend.
     * 
     * @return Promise<Field> - ActionXStubsField
     */
  saveCurrentActionStubs: (actionStubSet: ActionStubSet) => Promise<Field>

  /**
     * USE WITH CAUTION!
     * 
     * This will delete all comments authored by this Node (User/UnObject).
     * If the Node is a ChatRoom, it will delete all comments in the ChatRoom
     * by all authors.
     */
  deleteComments: () => Promise<any>

  /**
     * Perform a partial update of the User record.
     * NOTE: The NodeApi must contain a User node and it must be the current session User.
     * @return Promise<User> - the updated User record.
     */
  updateUserFields: (updatedFields: UpdateUserFields) => Promise<User>

  /**
     * Write a comment as this User / UnObject
     */
  saveComment: (text: string) => Promise<Comment>

  /**
     * Create an ActionXInstance and add it to this Player's inventory.
     * @return Promise<ActionXInstance>
     */
  createActionInstance: (input: ActionXInstanceTemplate) => Promise<ActionXInstance>

  /**
   * Get an instance by id, it must be owned by this node
   * @return Promise<ActionXInstance>
   */
  readActionInstance: (id: string) => Promise<SimpleActionXInstanceObject | undefined>

  /**
   * Get all instances for a specific type of action
   * @return Promise<ActionXInstance[]>
   */
  readActionInstances: (actionName: string) => Promise<SimpleActionXInstanceObject[]>

  /**
   * Count the number of instances for a specific type of action attached to a Node
   * @return Promise<number>
   */
  countActionInstances: (actionName: string) => Promise<number>

  /**
   * Get all action instances
   * @return Promise<ActionXInstance[]>
   */
  readAllActionInstances: () => Promise<SimpleActionXInstanceObject[]>

  /**
     * Delete an ActionXInstance and remove it from this Player's inventory.
     * @return Promise<ActionXInstance>
     */
  deleteActionInstance: (input: ActionXInstanceTemplate) => Promise<ActionXInstance>

  /**
     * Transfer an ActionXInstance from this Player to another.
     * @return Promise<ActionXInstance>
     */
  transferActionInstance: (input: ActionXInstanceTransferTemplate) => Promise<ActionXInstance>

  /**
     * Destroy an item from a type and create one from another type (and return it)
     * @return Promise<ActionXInstance>
     */
  replaceActionInstance: (input: ActionXInstanceReplaceTemplate) => Promise<ActionXInstance>

  //
  // HERE BE DEPRECATED ....
  //

  /**
     * @deprecated use saveField instead w/ scope:ChatRoomScope
     * 
     * Apply a partial update to a LOCAL Field entity. 
     * "Local/Global": https://gitlab.com/unrealfun/docs/-/blob/master/GameState.md
     * @param input - a SetStateInput struct to partially apply 
     * @return Promise<SaveFieldOutput> - the updated Field is at output.field
     */
  setLocalState: (input: SetLocalStateInput) => Promise<SaveFieldOutput>

  /**
     * @deprecated - use saveField instead w/ scope:GlobalScope
     * 
     * Apply a partial update to a GLOBAL Field entity. 
     * "Local/Global": https://gitlab.com/unrealfun/docs/-/blob/master/GameState.md
     * @param input - a SetStateInput struct to partially apply 
     * @return Promise<SaveFieldOutput> - the updated Field is at output.field
     */
  setGlobalState: (input: SetGlobalStateInput) => Promise<SaveFieldOutput>

  /**
     * @deprecated - use incrementField instead w/ scope:ChatRoomScope
     * 
     * Increment the metadata.numberValue of a LOCAL Field identified by name.
     * If the Field doesn't exist, it is created w/ type=FieldType.NumberField and numberValue=byNumber.
     * @param name - name of the Field
     * @param byNumber - amount to increment by (can be negative for decrement)
     * @return Promise<SaveFieldOutput> - the updated Field is at output.field
     */
  incrementLocalState: (name: string, byNumber: number) => Promise<SaveFieldOutput>

  /**
     * @deprecated - use incrementField instead w/ scope:GlobalScope
     * 
     * Increment the metadata.numberValue of a GLOBAL Field identified by name.
     * If the Field doesn't exist, it is created w/ type=FieldType.NumberField and numberValue=byNumber.
     * @param name - name of the Field
     * @param byNumber - amount to increment by (can be negative for decrement)
     * @return Promise<SaveFieldOutput> - the updated Field is at output.field
     */
  incrementGlobalState: (name: string, byNumber: number) => Promise<SaveFieldOutput>

  /**
     * @deprecated - use field() instead w/ scope:ChatRoomScope
     * 
     * Retrieve a LOCAL Field entity.
     * "Local/Global": https://gitlab.com/unrealfun/docs/-/blob/master/GameState.md
     * @param name - name of the Field
     * @param input - a SetStateInput struct to create the Field with, if it doesn't already exist.
     *                If the Field exists, this arg is ignored.
     * @return Promise<Field> - the Field 
     */
  getLocalState: (name: string, input?: SetLocalStateInput) => Promise<Field>

  /**
     * @deprecated - use field() instead w/ scope:GlobalScope
     * 
     * Retrieve a GLOBAL Field entity.
     * "Local/Global": https://gitlab.com/unrealfun/docs/-/blob/master/GameState.md
     * @param name - name of the Field
     * @param input - a SetStateInput struct to create the Field with, if it doesn't already exist.
     *                If the Field exists, this arg is ignored.
     * @return Promise<Field> - the Field 
     */
  getGlobalState: (name: string, input?: SetGlobalStateInput) => Promise<Field>

  /**
     * Puts a string thru handlebars with a rich context
     */
  resolveText: (text: string, values?: HandlebarsValues) => Promise<string>

  /**
     * Runs some tags through the lookup and if matched, the string thru handlebars
     */
  resolveTags: (tags: StringTags, optional?: StringTags, values?: HandlebarsValues) => Promise<string | undefined>

  /**
     * @deprecated - use sendSystemMessage instead
     * Post a comment from the system user into the ChatRoom.
     */
  sendSystemComment: (text: string) => Promise<CreateChatRoomSystemCommentOutput>

  /**
     * @deprecated use tile() w/ scope:ChatRoomPrivateScope
     */
  getPrivateLocalTile: (name: string, defaultInput?: SaveTileInputInContext) => Promise<Tile>

  /**
     * @deprecated use saveTile() w/ scope:ChatRoomPrivateScope
     */
  setPrivateLocalTile: (name: string, input1: SaveTileInputInContext) => Promise<SaveTileOutput>

  /**
     * @deprecated use saveTile() w/ scope:ChatRoomPrivateScope, isDeleted:true
     */
  deletePrivateLocalTile: (name: string) => Promise<SaveTileOutput>

  /**
     * @deprecated use tile() w/ scope:GlobalPrivateScope
     */
  getPrivateGlobalTile: (name: string, defaultInput?: SaveTileInputInContext) => Promise<Tile>

  /**
     * @deprecated use saveTile() w/ scope:GlobalPrivateScope
     */
  setPrivateGlobalTile: (name: string, input1: SaveTileInputInContext) => Promise<SaveTileOutput>

  /**
     * @deprecated use saveTile() w/ scope:GlobalPrivateScope, isDeleted:true
     */
  deletePrivateGlobalTile: (name: string) => Promise<SaveTileOutput>

  /**
     * @deprecated use saveTile w/ scope:GlobalScope, isDeleted:true
     */
  removeTile: (name: string) => Promise<SaveTileOutput>

  /**
     * @deprecated use saveTile w/ scope:ChatRoomScope
     */
  saveLocalTile: (input: SaveTileInputInContext) => Promise<SaveTileOutput>

  /**
     * @deprecated use tile() w/ scope:ChatRoomScope
     */
  getLocalTile: (name: string, defaultInput?: SaveTileInputInContext) => Promise<Tile>

  /**
     * @deprecated use saveTile w/ scope:ChatRoomScope, isDeleted:true
     */
  deleteLocalTile: (name: string) => Promise<SaveTileOutput>

  /**
     * @deprecated use saveTile w/ scope:GlobalScope
     */
  setGlobalTile: (name: string, input1: SaveTileInputInContext) => Promise<SaveTileOutput>

  /**
     * @deprecated use saveTile w/ scope:GlobalScope
     */
  applyTile: (name: string, input1: SaveTileInputInContext) => Promise<SaveTileOutput>

  /**
     * @deprecated use saveTile w/ scope:ChatRoomScope 
     */
  setLocalTile: (name: string, input1: SaveTileInputInContext) => Promise<SaveTileOutput>

  /**
     * @deprecated use saveTile w/ scope:GlobalScope
     */
  saveGlobalTile: (input: SaveTileInputInContext) => Promise<SaveTileOutput>

  /**
     * @deprecated use tile() w/ scope:GlobalScope
     */
  getTile: (name: string, defaultInput?: SaveTileInputInContext) => Promise<Tile>

  /**
     * @deprecated use tile() w/ scope:GlobalScope
     */
  getGlobalTile: (name: string, defaultInput?: SaveTileInputInContext) => Promise<Tile>

  /**
     * @deprecated use saveTile w/ scope:GlobalScope, isDeleted:true
     */
  deleteGlobalTile: (name: string) => Promise<SaveTileOutput>

  /**
     * @deprecated use saveEffect w/ scope:GlobalPrivateScope
     */
  doPrivateGlobalEffect: (effectType: EffectType, metadata: EffectMetadata) => Promise<CreateEffectOutput>

  /**
     * @deprecated use saveEffect w/ scope:ChatRoomPrivateScope
     */
  doPrivateLocalEffect: (effectType: EffectType, metadata: EffectMetadata) => Promise<CreateEffectOutput>

  /**
     * @deprecated use saveEffect w/ scope:GlobalScope
     */
  applyEffect: (effectType: EffectType, metadata: EffectMetadata) => Promise<CreateEffectOutput>

  /**
     * @deprecated use saveEffect w/ scope:GlobalScope
     */
  doGlobalEffect: (effectType: EffectType, metadata: EffectMetadata) => Promise<CreateEffectOutput>

  /**
     * @deprecated use saveEffect w/ scope:ChatRoomScope
     */
  doLocalEffect: (effectType: EffectType, metadata: EffectMetadata) => Promise<CreateEffectOutput>

  /**
     * @deprecated use saveEffect w/ scope:ChatRoomScope
     */
  doLocalAnimation: (animationType: AnimationType, metadata?: AnimationEffectMetadata) => Promise<CreateEffectOutput>

  /**
     * @deprecated use saveEffect w/ scope:ChatRoomScope
     */
  doLocalSourcedAnimation: (sourceUri: string, metadata?: AnimationEffectMetadata) => Promise<CreateEffectOutput>

  /**
     * @deprecated use saveEffectOnTile w/ scope:ChatRoomScope
     */
  doLocalAnimationOnLocalTile: (input: SaveTileInputInContext, animationType: AnimationType, metadata?: AnimationEffectMetadata) => Promise<CreateEffectOutput>

  /**
     * @deprecated use saveEffectOnTile w/ scope:ChatRoomScope
     */
  doLocalAnimationOnTileId: (tileId: string, animationType: AnimationType, metadata?: AnimationEffectMetadata) => Promise<CreateEffectOutput>

  /**
     * @deprecated use saveEffectOnTile w/ scope:GlobalScope
     */
  applyAnimationOnTile: (input: SaveTileInputInContext, animationType: AnimationType, metadata?: AnimationEffectMetadata) => Promise<CreateEffectOutput>

  /**
     * @deprecated use saveEffectOnTile w/ scope:GlobalScope
     */
  applyAnimationOnTileId: (tileId: string, animationType: AnimationType, metadata?: AnimationEffectMetadata) => Promise<CreateEffectOutput>

  /**
     * @deprecated use saveEffect w/ scope:GlobalScope
     */
  applyAnimation: (animationType: AnimationType, metadata?: AnimationEffectMetadata) => Promise<CreateEffectOutput>

  soundEffects: () => SoundEffect
  vibrationEffects: () => VibrationEffect
  systemMessages: () => SystemMessageEffect
  modals: () => ModalEffectFactory

  /**
     * @deprecated - use saveCurrentActionStubs / createActionInstance
     */
  setLocalAction: (input: SetActionInput) => Promise<Edge>

  /**
     * @deprecated - use saveCurrentActionStubs / createActionInstance
     */
  setLocalActions: (input: SetActionInput[]) => Promise<Edge[]>

  /**
     * @deprecated - use saveCurrentActionStubs / createActionInstance
     */
  setLocalActionNoPublish: (input: SetActionInput) => Promise<Edge>

  /**
     * @deprecated - use saveCurrentActionStubs / createActionInstance
     */
  setLocalActionsNoPublish: (input: SetActionInput[]) => Promise<Edge[]>

  /**
     * @deprecated use saveCurrentActionStubs / createActionInstance
     * 
     * Creates/Updates an ActionEdge between this Node (User/UnObject) and the action
     * identified by input.name.
     * 
     * "Global/Local" refers to the scope at which the actions are visible.  
     * "Global" actions are (potentially) visible in every chat room (unless the chat room handler code filters them out).
     * "Local" actions are only visible in the chat room in which they were created.
     * 
     * @param input - indicates the action name, quantity, etc.
     * @return Promise<Edge>
     */
  setGlobalAction: (input: SetActionInput) => Promise<Edge>

  /**
     * @deprecated use saveCurrentActionStubs / createActionInstance
     * 
     * Creates/Updates ActionEdges between this Node (User/UnObject) and the actions
     * identified by the inputs.
     * 
     * "Global/Local" refers to the scope at which the actions are visible.  
     * "Global" actions are (potentially) visible in every chat room (unless the chat room handler code filters them out).
     * "Local" actions are only visible in the chat room in which they were created.
 
     * @param inputs - each input indicates the action name, quantity, etc.
     * @return Promise<Edge[]>
     */
  setGlobalActions: (input: SetActionInput[]) => Promise<Edge[]>

  /**
     * @deprecated - use saveCurrentActionStubs / createActionInstance
     */
  setGlobalActionsNoPublish: (input: SetActionInput[]) => Promise<Edge[]>

  /**
     * @deprecated - shouldn't need this anymore.  check w/ rob if you have a use case.
     */
  deleteLocalActions: () => Promise<Edge[]>

  /**
     * @deprecated - we aren't using ActionEdges anymore.  use actionInstance() (for reading 
     *               the user's action instances, a la field() and tile().  not yet implemented).
     * 
     * @param name - the action name 
     * @return the ActionEdge between this Node (User/UnObject) and the given action name.
     *         if the ActionEdge does not exist, it is NOT created by this method.
     */
  getActionEdge: (name: string) => Promise<ActionEdgeApi>

  /**
     * @deprecated - use saveCurrentActionStubs
     * 
     * Use this method to set the current set of actions available in the action sheet.
     * It takes a list of actionNames. Under the covers it intersects that list with 
     * the actions the user has in their inventory.  That intersection is the final result.  
     * 
     * So from the handler’s point of view, he doesn’t have to concern himself with whether 
     * or not the user has any particular action in their inventory yet.  He just sends down 
     * the list of actions that he’s capable of handling, that he wants to make avaialble
     * at this state of the game.  The system automatically filters out the actions that the 
     * user shouldn’t see (cuz it's not yet in their inventory).
     * 
     * @param actionNames - the list of actions to show in the user's action sheet.
     * @return Promise<SaveFieldOutput>
     */
  setCurrentActionEdges: (actionNames: string[]) => Promise<SaveFieldOutput>

  /**
     * @deprecated - use saveCurrentActionStubs
     * 
     * This method is currently used by p2p_default to set the action sheet for
     * user-2-user ChatRooms.
     */
  setCurrentActionEdgesToGlobalActionEdges: () => Promise<SaveFieldOutput>

  /**
     * @deprecated - use saveCurrentActionStubs
     * 
     * Creates EDGEs between this Node/User and the Actions identified by
     * the given actionNames.
     * 
     * This method has to be called at least once to connect the User to
     * the local Actions so they appear in the ChatRoom's action sheet.
     * It is idempotent so it can be called many times for the same User.
     */
  readOrCreateLocalActionEdges: (actionNames: string[]) => Promise<Edge[]>

  /**
   * Schedules a job to run later (sorta like cron).  
   * The job will run at the scheduled time.  It will re-inflate the current ChatRoomActionContext
   * and execute the designated actionName (as if the user had submitted the action from the app).
   * 
   * @param jobTemplate - defines the actionName and dispatchAt time
   * @return Promise<Job> - the Job record
   */
  scheduleJob: <T>(jobTemplate: IMakerImplicit<T>, opts?: QueueJobOptions) => Promise<Job<IMakerJob>>

  /**
   * Cancels an earlier created job.
   * This functionality is useful only before a job is run
   * because, behind the scenes, the job is marked as deleted
   *
   * @param id
   * @return Promise<Job> - the Job record
   */
  cancelJob: (id: string) => Promise<void>

  /**
   * Returns the ChatRoomActionContextApi that created this NodeApi
   * NOTE: This is a bit hacky and might go away
   * @return ChatRoomContextApi
   */
  getContextApi: () => ChatRoomActionContextApi

  /**
   * Returns a Moment instance adjusted to the User's timezone
   * UnObjects and ChatRooms will always be returned in UTC
   * @return moment.Moment

   */
  getLocalTime: () => moment.Moment

  /**
   * Inactivate live newsfeed item by state id
   * @return Promise<NewsfeedItem>
   */
  inactivateLiveNewsfeedItem: (stateId: UserStateId) => Promise<NewsfeedItem | null>
}

export interface NodeContext {
  node: GameNode
  context: ChatRoomActionContext
}

export * from './actionx'
export * from './field'
export * from './misc'
export * from './newsfeed'
export * from './effect'
export * from './tile'
