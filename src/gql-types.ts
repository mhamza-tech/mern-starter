export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: any
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: any
};

export enum EntityType {
  Activity = 'Activity',
  UnObject = 'UnObject',
  User = 'User',
  NewsfeedItem = 'NewsfeedItem',
  Edge = 'Edge',
  Field = 'Field',
  Comment = 'Comment',
  DeviceInfo = 'DeviceInfo',
  ChatRoom = 'ChatRoom',
  Notification = 'Notification',
  CommentReceipt = 'CommentReceipt',
  Receipt = 'Receipt',
  Effect = 'Effect',
  CompletedAction = 'CompletedAction',
  ActionX = 'ActionX',
  ActionXInstance = 'ActionXInstance',
  Tile = 'Tile',
  QEdge = 'QEdge',
  SDist = 'SDist',
  Report = 'Report',
  Location = 'Location',
  Job = 'Job',
  UserNewsfeedItemEdge = 'UserNewsfeedItemEdge',
  FriendRequest = 'FriendRequest'
}

export type EntityRef = {
  __typename?: 'EntityRef'
  id: Scalars['ID']
  entityType: EntityType
};

/**
 * EntityScope applies to Fields, Tiles, Effects, and Actions.
 * EntityScope generally governs the "visibility/accessibility" of an Entity.
 * 
 * It breaks down along two dimensions: 
 * 1. "global" vs. "local" ("local" aka "chatroom") scope
 * 2. "public" vs. "private" scope
 * 
 * Global scope: visible/accessible in all ChatRooms
 * Local aka ChatRoom scope: visible/accessible in only one specific ChatRoom.
 * 
 * Public scope: visible/accessible to all users.
 * Private scope: visible/accessible to only one specific user.
 */
export enum EntityScope {
  /**
   * GlobalScope entities are (generally speaking)...
   * (1) "global", i.e. visible/accessible in all ChatRooms
   * (2) "public", i.e. visible/accessible to all users 
   */
  GlobalScope = 'GlobalScope',
  /**
   * GlobalPrivateScope entities are (generally speaking)...
   * (1) "global", i.e. visible/accessible in all ChatRooms
   * (2) "private", i.e. visible/accessible to only one specific user
   */
  GlobalPrivateScope = 'GlobalPrivateScope',
  /**
   * ChatRoomScope entities are (generally speaking)...
   * (1) "local" aka "chatroom-scoped", i.e. visible/accessible in only one specific ChatRoom
   * (2) "public", i.e. visible/accessible to all users
   */
  ChatRoomScope = 'ChatRoomScope',
  /**
   * ChatRoomPrivateScope entities are (generally speaking)...
   * (1) "local" aka "chatroom-scoped", i.e. visible/accessible in only one specific ChatRoom
   * (2) "private", i.e. visible/accessible to only one specific user
   */
  ChatRoomPrivateScope = 'ChatRoomPrivateScope'
}

export enum JobType {
  ReactionFnJob = 'ReactionFnJob'
}

export type TrackingInput = {
  trackingId: Scalars['String']
};

export type Tracking = {
  __typename?: 'Tracking'
  trackingId: Scalars['String']
  events?: Maybe<Array<Maybe<Event>>>
  activities?: Maybe<Array<Maybe<Activity>>>
  effects?: Maybe<Array<Maybe<Effect>>>
  newsfeedItems?: Maybe<Array<Maybe<NewsfeedItem>>>
  comments?: Maybe<Array<Maybe<Comment>>>
  notifications?: Maybe<Array<Maybe<Notification>>>
  actionResults?: Maybe<Array<Maybe<ActionResult>>>
  actionWithContexts?: Maybe<Array<Maybe<ActionWithContext>>>
  playerContexts?: Maybe<Array<Maybe<PlayerContext>>>
  completedActions?: Maybe<Array<Maybe<CompletedAction>>>
};

export type Node = {
  __typename?: 'Node'
  id: Scalars['ID']
  entityType: EntityType
  eid: Scalars['String']
  edges?: Maybe<EdgesOutput>
  edgeStats?: Maybe<EdgeStatsOutput>
  fields?: Maybe<FieldsOutput>
  field?: Maybe<FieldOutput>
  image?: Maybe<Image>
  asChatRoom?: Maybe<ChatRoom>
  asUnObject?: Maybe<UnObject>
  asComment?: Maybe<Comment>
  asNotification?: Maybe<Notification>
  asUser?: Maybe<User>
  asPlayer?: Maybe<Player>
  asCommentReceipt?: Maybe<CommentReceipt>
  asReceipt?: Maybe<Receipt>
  asEffect?: Maybe<Effect>
  asTile?: Maybe<Tile>
  asActionX?: Maybe<ActionX>
  asActionXInstance?: Maybe<ActionXInstance>
};

export type NodeEdgesArgs = {
  input?: Maybe<EdgesInput>
};

export type NodeEdgeStatsArgs = {
  input?: Maybe<EdgeStatsInput>
};

export type NodeFieldsArgs = {
  input?: Maybe<FieldsInput>
};

export type NodeFieldArgs = {
  input: FieldInput
};

export type NodeInput = {
  eid: Scalars['String']
};

export type NodeOutput = {
  __typename?: 'NodeOutput'
  node?: Maybe<Node>
};

export enum NodeType {
  ChatRoomComment = 'ChatRoomComment',
  ChatRoomSystemComment = 'ChatRoomSystemComment',
  NewsfeedItemComment = 'NewsfeedItemComment'
}

export enum ErrorType {
  InvalidPassword = 'INVALID_PASSWORD',
  InvalidEmail = 'INVALID_EMAIL',
  InvalidCredentials = 'INVALID_CREDENTIALS',
  EmailAlreadyExists = 'EMAIL_ALREADY_EXISTS',
  UsernameAlreadyExists = 'USERNAME_ALREADY_EXISTS',
  UsernameProhibited = 'USERNAME_PROHIBITED',
  EmailOrUsernameRequired = 'EMAIL_OR_USERNAME_REQUIRED',
  EmailOrUsernameNotFound = 'EMAIL_OR_USERNAME_NOT_FOUND',
  EmailNotFound = 'EMAIL_NOT_FOUND',
  UsernameNotFound = 'USERNAME_NOT_FOUND',
  InvalidResetPasswordToken = 'INVALID_RESET_PASSWORD_TOKEN',
  InvalidConfirmEmailToken = 'INVALID_CONFIRM_EMAIL_TOKEN',
  PasswordRequired = 'PASSWORD_REQUIRED',
  AuthenticationRequired = 'AUTHENTICATION_REQUIRED',
  DisplayNameRequired = 'DISPLAY_NAME_REQUIRED',
  UserIdNotFound = 'USER_ID_NOT_FOUND',
  InputRequired = 'INPUT_REQUIRED',
  NotAuthorizedSessionUser = 'NOT_AUTHORIZED_SESSION_USER',
  NotAuthorizedRole = 'NOT_AUTHORIZED_ROLE',
  NotAuthorizedCreator = 'NOT_AUTHORIZED_CREATOR',
  InvalidStoryboardUnobjectRequired = 'INVALID_STORYBOARD_UNOBJECT_REQUIRED',
  InvalidUnobjectNameRequired = 'INVALID_UNOBJECT_NAME_REQUIRED',
  InvalidUnobjectImageRequired = 'INVALID_UNOBJECT_IMAGE_REQUIRED',
  InvalidStoryboardActionsRequired = 'INVALID_STORYBOARD_ACTIONS_REQUIRED',
  InvalidActionCardRequired = 'INVALID_ACTION_CARD_REQUIRED',
  NotAuthorizedChat = 'NOT_AUTHORIZED_CHAT',
  ChatRoomDestroyed = 'CHAT_ROOM_DESTROYED',
  InternalError = 'InternalError',
  InvalidHandlerUnObjectIdError = 'InvalidHandlerUnObjectIdError',
  InvalidField = 'InvalidField',
  NotAuthorizedDeleteNewsfeedItem = 'NotAuthorizedDeleteNewsfeedItem',
  NotAuthorizedReadNotification = 'NotAuthorizedReadNotification'
}

export type Location = {
  __typename?: 'Location'
  id: Scalars['ID']
  entityType: EntityType
  thisEid: Scalars['String']
  x: Scalars['Int']
  y: Scalars['Int']
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
  isDeleted: Scalars['Boolean']
};

export type PageInfo = {
  __typename?: 'PageInfo'
  firstCursor?: Maybe<Scalars['String']>
  lastCursor?: Maybe<Scalars['String']>
};

export type PageInput = {
  first?: Maybe<Scalars['Int']>
  last?: Maybe<Scalars['Int']>
  afterCursor?: Maybe<Scalars['String']>
  beforeCursor?: Maybe<Scalars['String']>
};

export type CacheRefetchInput = {
  cacheName: Scalars['String']
  cacheKey?: Maybe<Scalars['String']>
  compositeCacheKey?: Maybe<Scalars['JSONObject']>
};

export type CacheRefetchOutput = {
  __typename?: 'CacheRefetchOutput'
  result?: Maybe<Scalars['JSONObject']>
};

export type SearchInput = {
  query: Scalars['String']
  friendsOnly?: Maybe<Scalars['Boolean']>
  pageInput?: Maybe<PageInput>
};

export type SearchOutput = {
  __typename?: 'SearchOutput'
  players?: Maybe<Array<Maybe<Player>>>
  pageInfo: PageInfo
};

export type Query = {
  __typename?: 'Query'
  tracking: Tracking
  node: NodeOutput
  errorMessage: Scalars['String']
  searchPlayers: SearchOutput
  newsfeed?: Maybe<Array<Maybe<Activity>>>
  newsfeedNewerThan?: Maybe<Array<Maybe<Activity>>>
  newsfeedOlderThan?: Maybe<Array<Maybe<Activity>>>
  newsfeedItem: NewsfeedItem
  unObject?: Maybe<UnObject>
  myUnObjects?: Maybe<Array<Maybe<UnObject>>>
  handlerUnObjects: HandlerUnObjectsOutput
  /** @deprecated Use unObjects */
  featuredHandlerUnObjects: HandlerUnObjectsOutput
  unObjects: UnObjectsOutput
  notifications: NotificationsOutput
  worldMap: WorldMap
  edgeStats: Array<Maybe<EdgeStats>>
  edges: EdgesOutput
  userEdges?: Maybe<Array<Maybe<Edge>>>
  myEdges?: Maybe<Array<Maybe<Edge>>>
  /** Requires Authentication Token */
  me: User
  user?: Maybe<User>
  masterUser?: Maybe<User>
  isUsernameAvailable?: Maybe<Scalars['Boolean']>
  isResetPasswordTokenValid?: Maybe<Scalars['Boolean']>
  validateResetPasswordToken?: Maybe<User>
  validateConfirmEmailToken?: Maybe<User>
  ready?: Maybe<Scalars['String']>
  chatRoom: ChatRoomOutput
  commentsReceipts: CommentReceiptsOutput
  storylines?: Maybe<Array<Maybe<Storyline>>>
  storyline?: Maybe<Storyline>
  actionResult?: Maybe<ActionResult>
  actionWithContext?: Maybe<ActionWithContext>
  suggestedStorylines?: Maybe<Array<Maybe<Storyline>>>
  storyboard?: Maybe<Storyboard>
  smTracking: Tracking
  homeFeed: HomeFeed
};

export type QueryTrackingArgs = {
  input: TrackingInput
};

export type QueryNodeArgs = {
  input: NodeInput
};

export type QueryErrorMessageArgs = {
  input: ErrorType
};

export type QuerySearchPlayersArgs = {
  input: SearchInput
};

export type QueryNewsfeedArgs = {
  input?: Maybe<NewsfeedPageInput>
};

export type QueryNewsfeedNewerThanArgs = {
  input?: Maybe<NewsfeedTimestampInput>
};

export type QueryNewsfeedOlderThanArgs = {
  input?: Maybe<NewsfeedTimestampInput>
};

export type QueryNewsfeedItemArgs = {
  id: Scalars['ID']
};

export type QueryUnObjectArgs = {
  input: UnObjectInput
};

export type QueryFeaturedHandlerUnObjectsArgs = {
  input?: Maybe<FeaturedHandlerUnObjectsInput>
};

export type QueryUnObjectsArgs = {
  input?: Maybe<UnObjectsInput>
};

export type QueryNotificationsArgs = {
  input?: Maybe<NotificationsInput>
};

export type QueryEdgeStatsArgs = {
  input: EntityInput
};

export type QueryEdgesArgs = {
  input?: Maybe<EdgesInput>
};

export type QueryUserEdgesArgs = {
  input: UserEntityInput
};

export type QueryMyEdgesArgs = {
  input: EntityInput
};

export type QueryUserArgs = {
  input: UserInput
};

export type QueryMasterUserArgs = {
  input: MasterUserInput
};

export type QueryIsUsernameAvailableArgs = {
  input: Scalars['String']
};

export type QueryIsResetPasswordTokenValidArgs = {
  input: Scalars['String']
};

export type QueryValidateResetPasswordTokenArgs = {
  input: Scalars['String']
};

export type QueryValidateConfirmEmailTokenArgs = {
  input: Scalars['String']
};

export type QueryChatRoomArgs = {
  input: ChatRoomInput
};

export type QueryCommentsReceiptsArgs = {
  input: CommentsReceiptsInput
};

export type QueryStorylineArgs = {
  input: IdInput
};

export type QueryActionResultArgs = {
  input: IdInput
};

export type QueryActionWithContextArgs = {
  input: IdInput
};

export type QuerySuggestedStorylinesArgs = {
  input?: Maybe<IdInput>
};

export type QueryStoryboardArgs = {
  input?: Maybe<IdInput>
};

export type QuerySmTrackingArgs = {
  input: TrackingInput
};

export type QueryHomeFeedArgs = {
  input?: Maybe<HomeFeedInput>
};

export type Mutation = {
  __typename?: 'Mutation'
  cacheRefetch: CacheRefetchOutput
  newActionResult?: Maybe<Activity>
  publishEvent?: Maybe<Event>
  createField: CreateFieldOutput
  saveField: SaveFieldOutput
  saveTile: SaveTileOutput
  updateNewsfeedItem: NewsfeedItem
  savePost: FeedItem
  createHandledUnObject: CreateHandledUnObjectOutput
  createUnObject: UnObject
  updateUnObject: UnObject
  updateNotifications: Array<Notification>
  createUserEdge?: Maybe<Edge>
  createEdge: CreateEdgeOutput
  saveEdge: SaveEdgeOutput
  deleteUserEdge?: Maybe<Scalars['Boolean']>
  createEffect: CreateEffectOutput
  createAnimationEffect: CreateEffectOutput
  signUp: SignInResult
  signIn: SignInResult
  signOut: SignOutOutput
  forgotPassword?: Maybe<Scalars['Boolean']>
  resetPassword: SignInResult
  confirmEmail: SignInResult
  sendConfirmEmail?: Maybe<Scalars['Boolean']>
  sendRawPushNotification: SendPushNotificationOutput
  sendPushNotification: SendPushNotificationOutput
  session: SignInResult
  masterSession: SignInResult
  updateUser?: Maybe<User>
  updateMe?: Maybe<User>
  updateUsername?: Maybe<User>
  updateEmail?: Maybe<User>
  emailCanBeRegistered?: Maybe<Scalars['Boolean']>
  updatePassword?: Maybe<User>
  updateUserRole: User
  deleteUserRole?: Maybe<UserRole>
  savePresence: SaveFieldOutput
  saveAvataaar: SaveAvataaarOutput
  saveUserProfileImage: SaveUserProfileImageOutput
  registerEmail: RegisterEmailOutput
  reportPlayer: User
  blockPlayer: User
  unblockPlayer: User
  followPlayer: FollowPlayerOutput
  unfollowPlayer: FollowPlayerOutput
  sendFriendRequest: FriendRequest
  updateFriendRequest: FriendRequest
  unfriend: Player
  instantFriend: User
  /** Requires Authentication Token */
  saveDeviceInfo: SaveDeviceInfoOutput
  beforeEnterChatRoom: BeforeEnterChatRoomOutput
  enterChatRoom: EnterChatRoomOutput
  exitChatRoom: ExitChatRoomOutput
  hideChatRoom: ChatRoom
  createChatRoom: CreateChatRoomOutput
  createComment: CreateCommentOutput
  createChatRoomComment: CreateChatRoomCommentOutput
  createNewsfeedItemComment: CreateNewsfeedItemCommentOutput
  createChatRoomSystemComment: CreateChatRoomSystemCommentOutput
  saveMyChatRoomLocalField: SaveFieldOutput
  saveIsTypingField: SaveFieldOutput
  submitChatRoomAction: SubmitChatRoomActionOutput
  saveAction: SaveActionOutput
  saveCommentReceipt: SaveCommentReceiptOutput
  saveCommentReceipts: SaveCommentReceiptsOutput
  saveReceipt: SaveReceiptOutput
  saveReceipts: SaveReceiptsOutput
  doAction: ActionResult
  playAction: ActionWithContext
  reset: Session
  createStoryboard: Storyboard
  createStoryboardEdgePublish: Storyboard
  deleteStoryboardEdgePublish: Storyboard
  createStoryboardEdgeDraft: Storyboard
  updateStoryboardStatus: Storyboard
  resetMyPlayerContext: PlayerContext
  dismissSmartCard: StaticFeedItem
  /** @deprecated use shareMediaLink */
  socialSharingUrl: Scalars['String']
  shareMediaLink: Scalars['String']
  sharePrivateLink: SharePrivateLinkOutput
};

export type MutationCacheRefetchArgs = {
  input: CacheRefetchInput
};

export type MutationNewActionResultArgs = {
  input: ActionResultInput
};

export type MutationPublishEventArgs = {
  input: PublishEventInput
};

export type MutationCreateFieldArgs = {
  input: CreateFieldInput
};

export type MutationSaveFieldArgs = {
  input: SaveFieldInput
};

export type MutationSaveTileArgs = {
  input: SaveTileInput
};

export type MutationUpdateNewsfeedItemArgs = {
  input: UpdateNewsfeedItemInput
};

export type MutationSavePostArgs = {
  input: SavePostInput
};

export type MutationCreateHandledUnObjectArgs = {
  input: CreateHandledUnObjectInput
};

export type MutationCreateUnObjectArgs = {
  input: CreateUnObjectInput
};

export type MutationUpdateUnObjectArgs = {
  input: UpdateUnObjectInput
};

export type MutationUpdateNotificationsArgs = {
  input: UpdateNotificationsInput
};

export type MutationCreateUserEdgeArgs = {
  input: CreateUserEdgeInput
};

export type MutationCreateEdgeArgs = {
  input: CreateEdgeInput
};

export type MutationSaveEdgeArgs = {
  input: SaveEdgeInput
};

export type MutationDeleteUserEdgeArgs = {
  input: DeleteUserEdgeInput
};

export type MutationCreateEffectArgs = {
  input: CreateEffectInput
};

export type MutationCreateAnimationEffectArgs = {
  input: CreateAnimationEffectInput
};

export type MutationSignUpArgs = {
  input: SignUpInput
};

export type MutationSignInArgs = {
  input: SignInInput
};

export type MutationSignOutArgs = {
  input: SignOutInput
};

export type MutationForgotPasswordArgs = {
  input: ForgotPasswordInput
};

export type MutationResetPasswordArgs = {
  input: ResetPasswordInput
};

export type MutationConfirmEmailArgs = {
  input: ConfirmEmailInput
};

export type MutationSendRawPushNotificationArgs = {
  input: SendRawPushNotificationInput
};

export type MutationSendPushNotificationArgs = {
  input: SendPushNotificationInput
};

export type MutationMasterSessionArgs = {
  input: MasterSessionInput
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput
};

export type MutationUpdateMeArgs = {
  input: UpdateUserFields
};

export type MutationUpdateUsernameArgs = {
  input: Scalars['String']
};

export type MutationUpdateEmailArgs = {
  input: UpdateEmailInput
};

export type MutationEmailCanBeRegisteredArgs = {
  input: EmailCanBeRegisteredInput
};

export type MutationUpdatePasswordArgs = {
  input: UpdatePasswordInput
};

export type MutationUpdateUserRoleArgs = {
  input?: Maybe<UserRoleInput>
};

export type MutationDeleteUserRoleArgs = {
  input?: Maybe<UserRoleInput>
};

export type MutationSavePresenceArgs = {
  input: SavePresenceInput
};

export type MutationSaveAvataaarArgs = {
  input: SaveAvataaarInput
};

export type MutationSaveUserProfileImageArgs = {
  input: SaveUserProfileImageInput
};

export type MutationRegisterEmailArgs = {
  input: RegisterEmailInput
};

export type MutationReportPlayerArgs = {
  input: ReportPlayerInput
};

export type MutationBlockPlayerArgs = {
  id: Scalars['ID']
};

export type MutationUnblockPlayerArgs = {
  id: Scalars['ID']
};

export type MutationFollowPlayerArgs = {
  input: FollowPlayerInput
};

export type MutationUnfollowPlayerArgs = {
  input: FollowPlayerInput
};

export type MutationSendFriendRequestArgs = {
  input: SendFriendRequestInput
};

export type MutationUpdateFriendRequestArgs = {
  input: UpdateFriendRequestInput
};

export type MutationUnfriendArgs = {
  playerEid: Scalars['String']
};

export type MutationInstantFriendArgs = {
  input: InstantFriendInput
};

export type MutationSaveDeviceInfoArgs = {
  input: SaveDeviceInfoInput
};

export type MutationBeforeEnterChatRoomArgs = {
  input: EnterChatRoomInput
};

export type MutationEnterChatRoomArgs = {
  input: EnterChatRoomInput
};

export type MutationExitChatRoomArgs = {
  input: ExitChatRoomInput
};

export type MutationHideChatRoomArgs = {
  id: Scalars['ID']
};

export type MutationCreateChatRoomArgs = {
  input: CreateChatRoomInput
};

export type MutationCreateCommentArgs = {
  input: CreateCommentInput
};

export type MutationCreateChatRoomCommentArgs = {
  input: CreateChatRoomCommentInput
};

export type MutationCreateNewsfeedItemCommentArgs = {
  input: CreateNewsfeedItemCommentInput
};

export type MutationCreateChatRoomSystemCommentArgs = {
  input: CreateChatRoomSystemCommentInput
};

export type MutationSaveMyChatRoomLocalFieldArgs = {
  input: SaveMyChatRoomLocalFieldInput
};

export type MutationSaveIsTypingFieldArgs = {
  input: SaveIsTypingFieldInput
};

export type MutationSubmitChatRoomActionArgs = {
  input: SubmitChatRoomActionInput
};

export type MutationSaveActionArgs = {
  input: SaveActionInput
};

export type MutationSaveCommentReceiptArgs = {
  input: SaveCommentReceiptInput
};

export type MutationSaveCommentReceiptsArgs = {
  input: SaveCommentReceiptsInput
};

export type MutationSaveReceiptArgs = {
  input: SaveReceiptInput
};

export type MutationSaveReceiptsArgs = {
  input: SaveReceiptsInput
};

export type MutationDoActionArgs = {
  input: DoActionInput
};

export type MutationPlayActionArgs = {
  input: ActionStubInput
};

export type MutationResetArgs = {
  unObjectId: Scalars['ID']
};

export type MutationCreateStoryboardArgs = {
  input: CreateStoryboardInput
};

export type MutationCreateStoryboardEdgePublishArgs = {
  input: IdInput
};

export type MutationDeleteStoryboardEdgePublishArgs = {
  input: IdInput
};

export type MutationCreateStoryboardEdgeDraftArgs = {
  input: IdInput
};

export type MutationUpdateStoryboardStatusArgs = {
  input: UpdateStoryboardStatusInput
};

export type MutationResetMyPlayerContextArgs = {
  input: IdInput
};

export type MutationDismissSmartCardArgs = {
  id: Scalars['ID']
};

export type MutationSocialSharingUrlArgs = {
  unObjectIdOrUsername: Scalars['String']
};

export type MutationShareMediaLinkArgs = {
  unObjectIdOrUsername: Scalars['String']
};

export type MutationSharePrivateLinkArgs = {
  input?: Maybe<SharePrivateLinkInput>
};

export type ActionResultInput = {
  actionResultId: Scalars['ID']
  userId: Scalars['ID']
  unObjectId: Scalars['ID']
  trackingId?: Maybe<Scalars['String']>
};

export type UserEntityInput = {
  userId: Scalars['ID']
  entityId: Scalars['ID']
};

export type EntityInput = {
  entityId: Scalars['ID']
};

export type NewsfeedPageInput = {
  page?: Maybe<Scalars['Int']>
};

export type NewsfeedTimestampInput = {
  timestamp?: Maybe<Scalars['DateTime']>
  limit?: Maybe<Scalars['Int']>
};

export type ActivityMetadata = ActivityMetadataActionWithContext | ActivityMetadataActionResult;

export type ActivityMetadataActionWithContext = {
  __typename?: 'ActivityMetadataActionWithContext'
  user?: Maybe<User>
  unObject?: Maybe<UnObject>
  actionWithContext?: Maybe<ActionWithContext>
  mustache?: Maybe<Scalars['JSONObject']>
};

export type ActivityMetadataActionResult = {
  __typename?: 'ActivityMetadataActionResult'
  user?: Maybe<User>
  unObject?: Maybe<UnObject>
  actionResult?: Maybe<ActionResult>
  mustache?: Maybe<Scalars['JSONObject']>
};

export type Activity = {
  __typename?: 'Activity'
  id: Scalars['ID']
  actionResultId?: Maybe<Scalars['ID']>
  userId?: Maybe<Scalars['ID']>
  unObjectId?: Maybe<Scalars['ID']>
  trackingId?: Maybe<Scalars['String']>
  activityType: Scalars['String']
  metadata?: Maybe<ActivityMetadata>
  updatedAt: Scalars['DateTime']
  createdAt: Scalars['DateTime']
  edgeStats?: Maybe<Array<Maybe<EdgeStats>>>
  myEdges?: Maybe<Array<Maybe<Edge>>>
};

export type Event = {
  __typename?: 'Event'
  id: Scalars['ID']
  type: Scalars['String']
  source: Scalars['String']
  sessionUserId?: Maybe<Scalars['String']>
  trackingId?: Maybe<Scalars['String']>
  actionWithContextId?: Maybe<Scalars['String']>
  unObjectId?: Maybe<Scalars['String']>
  actionId?: Maybe<Scalars['String']>
  storyboardId?: Maybe<Scalars['String']>
  playerContextId?: Maybe<Scalars['String']>
  edgeId?: Maybe<Scalars['String']>
  activityId?: Maybe<Scalars['String']>
  metadata?: Maybe<Scalars['JSONObject']>
  createdAt?: Maybe<Scalars['DateTime']>
};

export type PublishEventInput = {
  type: Scalars['String']
  event: Scalars['JSONObject']
};

export type FieldsInput = {
  pageInput?: Maybe<PageInput>
  type?: Maybe<FieldType>
  name?: Maybe<Scalars['String']>
  collectionName?: Maybe<Scalars['String']>
  collectionId?: Maybe<Scalars['String']>
  thisEntityId?: Maybe<Scalars['String']>
  thisEntityType?: Maybe<EntityType>
};

export type FieldsOutput = {
  __typename?: 'FieldsOutput'
  fields: Array<Maybe<Field>>
  pageInfo: PageInfo
};

export type FieldInput = {
  name: Scalars['String']
  collectionId?: Maybe<Scalars['String']>
};

export type FieldOutput = {
  __typename?: 'FieldOutput'
  field?: Maybe<Field>
};

export enum FieldType {
  DateField = 'DateField',
  BooleanField = 'BooleanField',
  NumberField = 'NumberField',
  StringField = 'StringField',
  ChatRoomIsTyping = 'ChatRoomIsTyping',
  ChatRoomLastViewedAt = 'ChatRoomLastViewedAt',
  NewsfeedItemCard = 'NewsfeedItemCard',
  ActionsField = 'ActionsField',
  AnimationField = 'AnimationField',
  PresenceField = 'PresenceField',
  JsonObjectField = 'JSONObjectField',
  AvataaarField = 'AvataaarField',
  HashStatusField = 'HashStatusField',
  HashtributeField = 'HashtributeField',
  ProgressField = 'ProgressField',
  CountdownField = 'CountdownField',
  EdgesField = 'EdgesField',
  ActionXEdgesField = 'ActionXEdgesField',
  ActionXStubsField = 'ActionXStubsField',
  ButtonField = 'ButtonField'
}

export type Field = {
  __typename?: 'Field'
  id: Scalars['ID']
  entityType?: Maybe<EntityType>
  collectionId: Scalars['String']
  scope?: Maybe<EntityScope>
  name: Scalars['String']
  type: FieldType
  thisEntityId: Scalars['String']
  thisEntityType: EntityType
  thisEntity?: Maybe<Node>
  thisEid: Scalars['String']
  recordVersion: Scalars['Int']
  isDeleted?: Maybe<Scalars['Boolean']>
  expiresAt?: Maybe<Scalars['DateTime']>
  createdAt?: Maybe<Scalars['DateTime']>
  updatedAt?: Maybe<Scalars['DateTime']>
  metadata?: Maybe<Scalars['JSONObject']>
  asBooleanField?: Maybe<BooleanField>
  asDateField?: Maybe<DateField>
  asNumberField?: Maybe<NumberField>
  asChatRoomLastViewedAt?: Maybe<DateField>
  /** @deprecated use Field.asBooleanField */
  asChatRoomIsTyping?: Maybe<BooleanField>
  asActionsField?: Maybe<ActionsField>
  asPresenceField?: Maybe<PresenceField>
  asJSONObjectField?: Maybe<Scalars['JSONObject']>
  asHashStatusField?: Maybe<HashStatus>
  asHashtributeField?: Maybe<HashtributeField>
  asProgressField?: Maybe<ProgressField>
  asCountdownField?: Maybe<CountdownField>
  asAnimationField?: Maybe<AnimationField>
  asEdgesField?: Maybe<EdgesField>
  asActionXEdgesField?: Maybe<ActionXEdgesField>
  asActionXStubsField?: Maybe<ActionXStubsField>
  /** @deprecated use Field.asNumberField */
  asXpField?: Maybe<NumberField>
  asButtonField?: Maybe<ButtonField>
  isMyField?: Maybe<Scalars['Boolean']>
  isLocal?: Maybe<Scalars['Boolean']>
  isPrivate?: Maybe<Scalars['Boolean']>
  /** @deprecated this was for story which is now gone */
  likesCount?: Maybe<Scalars['Int']>
  /** @deprecated this was for story which is now gone */
  myLikesCount?: Maybe<Scalars['Int']>
};

export type StoryStatusField = {
  __typename?: 'StoryStatusField'
  /** @deprecated going away */
  metadata?: Maybe<StoryStatusFieldMetadata>
};

export type StoryStatusFieldMetadata = {
  __typename?: 'StoryStatusFieldMetadata'
  backgroundColor?: Maybe<Scalars['String']>
  backgroundImage?: Maybe<Image>
  overlayImage: Image
  thumbnailImage?: Maybe<Image>
  text?: Maybe<Scalars['String']>
  title?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
};

export type StoryStatusFieldsOutput = {
  __typename?: 'StoryStatusFieldsOutput'
  storyStatusFields: Array<Maybe<Field>>
};

export type PresenceField = {
  __typename?: 'PresenceField'
  presenceType: PresenceType
};

export type ActionsField = {
  __typename?: 'ActionsField'
  actions: Array<Maybe<ActionX>>
};

export type BooleanField = {
  __typename?: 'BooleanField'
  booleanValue: Scalars['Boolean']
};

export type DateField = {
  __typename?: 'DateField'
  dateValue: Scalars['DateTime']
};

export type NumberField = {
  __typename?: 'NumberField'
  numberValue: Scalars['Int']
  delta?: Maybe<Scalars['Int']>
};

export type ProgressField = {
  __typename?: 'ProgressField'
  numberValue?: Maybe<Scalars['Int']>
  color?: Maybe<Scalars['String']>
  minValue?: Maybe<Scalars['Int']>
  maxValue?: Maybe<Scalars['Int']>
};

export type ButtonField = {
  __typename?: 'ButtonField'
  /** The action to invoke after the button is clicked. */
  actionName?: Maybe<Scalars['String']>
  isDisabled?: Maybe<Scalars['Boolean']>
};

export enum CountdownFieldStyle {
  Stopwatch = 'Stopwatch',
  Ticker = 'Ticker'
}

export type CountdownField = {
  __typename?: 'CountdownField'
  startDateTime?: Maybe<Scalars['DateTime']>
  warnDateTime?: Maybe<Scalars['DateTime']>
  dangerDateTime?: Maybe<Scalars['DateTime']>
  expiryDateTime?: Maybe<Scalars['DateTime']>
  style?: Maybe<CountdownFieldStyle>
  image?: Maybe<Image>
  text?: Maybe<Scalars['String']>
};

export type AnimationField = {
  __typename?: 'AnimationField'
  animationType?: Maybe<AnimationType>
  sourceType?: Maybe<SourceType>
  sourceUri?: Maybe<Scalars['String']>
  startFrame?: Maybe<Scalars['Int']>
  endFrame?: Maybe<Scalars['Int']>
  loop?: Maybe<Scalars['Boolean']>
  speed?: Maybe<Scalars['Float']>
  tileId?: Maybe<Scalars['String']>
  tile?: Maybe<Tile>
};

export type HashStatus = {
  __typename?: 'HashStatus'
  id: Scalars['ID']
  name: Scalars['String']
  player?: Maybe<Player>
  isDeleted?: Maybe<Scalars['Boolean']>
  metadata?: Maybe<HashStatusMetadata>
};

export type HashStatusMetadata = {
  __typename?: 'HashStatusMetadata'
  numberValue: Scalars['Float']
  delta: Scalars['Float']
  /** This one is only incremented when manually changed (not due to decay) */
  changedAt?: Maybe<Scalars['DateTime']>
  /** All the following fields are calculated on read (and required). */
  color?: Maybe<Scalars['String']>
  minValue?: Maybe<Scalars['Int']>
  maxValue?: Maybe<Scalars['Int']>
  displayName?: Maybe<Scalars['String']>
  thumbImage?: Maybe<Image>
  promotedImage?: Maybe<Image>
  description?: Maybe<Scalars['String']>
};

export type HashtributeField = {
  __typename?: 'HashtributeField'
  id: Scalars['ID']
  name: Scalars['String']
  /** @deprecated use HashtributeField.metadata */
  numberValue: Scalars['Int']
  /** @deprecated not used */
  color?: Maybe<Scalars['String']>
  /** @deprecated use HashtributeField.metadata */
  level: Scalars['Int']
  /** @deprecated use HashtributeField.metadata */
  nextLevelThreshold: Scalars['Int']
  /** @deprecated use HashtributeField.metadata */
  delta: Scalars['Int']
  /** @deprecated use HashtributeField.metadata */
  displayName: Scalars['String']
  /** @deprecated use HashtributeField.metadata */
  description?: Maybe<Scalars['String']>
  /** @deprecated not used */
  image?: Maybe<Image>
  /** @deprecated use HashtributeField.metadata */
  thumbImage?: Maybe<Image>
  /** @deprecated use HashtributeField.metadata */
  promotedImage?: Maybe<Image>
  /** @deprecated not used */
  isPromoted?: Maybe<Scalars['Boolean']>
  isDeleted?: Maybe<Scalars['Boolean']>
  metadata?: Maybe<HashtributeFieldMetadata>
};

export type HashtributeFieldMetadata = {
  __typename?: 'HashtributeFieldMetadata'
  numberValue: Scalars['Int']
  delta?: Maybe<Scalars['Int']>
  /** All the following fields are calculated on read (and required). */
  level?: Maybe<Scalars['Int']>
  prevLevelThreshold?: Maybe<Scalars['Int']>
  thisLevelThreshold?: Maybe<Scalars['Int']>
  nextLevelThreshold?: Maybe<Scalars['Int']>
  displayName?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  thumbImage?: Maybe<Image>
  promotedImage?: Maybe<Image>
  silent?: Maybe<Scalars['Boolean']>
  /** @deprecated about to be deleted */
  lastStarsDelta?: Maybe<Scalars['Int']>
};

export type EdgesField = {
  __typename?: 'EdgesField'
  id: Scalars['ID']
  edgeIds?: Maybe<Array<Maybe<Scalars['String']>>>
  edges?: Maybe<Array<Maybe<Edge>>>
};

export type ActionXEdgesField = {
  __typename?: 'ActionXEdgesField'
  id: Scalars['ID']
  edgeIds?: Maybe<Array<Maybe<Scalars['String']>>>
  actionXIds?: Maybe<Array<Maybe<Scalars['String']>>>
  actionEdges?: Maybe<Array<Maybe<ActionXEdge>>>
  asField?: Maybe<Field>
};

export type ActionXStubsField = {
  __typename?: 'ActionXStubsField'
  metadata?: Maybe<ActionXStubsFieldMetadata>
};

/**
 * This is the format of the "currentActionStubs" Field used by ChatRooms 
 * to configure a User's action sheet.
 */
export type ActionXStubsFieldMetadata = {
  __typename?: 'ActionXStubsFieldMetadata'
  staticActionStubs?: Maybe<Array<Maybe<ActionXStub>>>
  actionInstanceStubs?: Maybe<Array<Maybe<ActionXStub>>>
};

export type ActionXModifier = {
  __typename?: 'ActionXModifier'
  id: Scalars['String']
  name: Scalars['String']
  description?: Maybe<Scalars['String']>
};

/**
 * ActionXStubs collect together an actionName along with the corresponding ActionX entity,
 * plus a list of ActionXInstances for that action, owned by a particular Player (typically 
 * the session User).  The frontend mostly deals with ActionXStubs via User.actionInventory
 * and the "currentActionStubs" ActionXStubsField.
 * "action" and "actionInstances" shouldn't be passed, they are filled by the resolver
 */
export type ActionXStub = {
  __typename?: 'ActionXStub'
  actionName: Scalars['String']
  isDisabled?: Maybe<Scalars['Boolean']>
  action?: Maybe<ActionX>
  actionInstances?: Maybe<Array<Maybe<ActionXInstance>>>
  disabledUntil?: Maybe<Scalars['DateTime']>
  isGivable?: Maybe<Scalars['Boolean']>
  isUsable?: Maybe<Scalars['Boolean']>
  modifiers?: Maybe<Array<ActionXModifier>>
};

export type HashtributesOutput = {
  __typename?: 'HashtributesOutput'
  hashtributes?: Maybe<Array<Maybe<HashtributeField>>>
};

export type CreateFieldInput = {
  collectionId: Scalars['String']
  thisEntityId: Scalars['ID']
  thisEntityType: EntityType
  type: FieldType
  name?: Maybe<Scalars['String']>
  collectionName?: Maybe<Scalars['String']>
  metadata?: Maybe<Scalars['JSONObject']>
};

export type CreateFieldOutput = {
  __typename?: 'CreateFieldOutput'
  field?: Maybe<Field>
};

export type SaveFieldInput = {
  id?: Maybe<Scalars['String']>
  collectionId: Scalars['String']
  scope: EntityScope
  thisEntityId: Scalars['ID']
  thisEntityType: EntityType
  type: FieldType
  name?: Maybe<Scalars['String']>
  collectionName?: Maybe<Scalars['String']>
  metadata?: Maybe<Scalars['JSONObject']>
  isDeleted?: Maybe<Scalars['Boolean']>
  expiresAt?: Maybe<Scalars['DateTime']>
};

export type SaveFieldOutput = {
  __typename?: 'SaveFieldOutput'
  field?: Maybe<Field>
};

export type ContainerStyleV2 = {
  __typename?: 'ContainerStyleV2'
  top?: Maybe<Scalars['Float']>
  right?: Maybe<Scalars['Float']>
  bottom?: Maybe<Scalars['Float']>
  left?: Maybe<Scalars['Float']>
  width?: Maybe<Scalars['Float']>
  height?: Maybe<Scalars['Float']>
  zIndex?: Maybe<Scalars['Int']>
  backgroundColor?: Maybe<Scalars['String']>
  borderRadius?: Maybe<Scalars['Int']>
  borderWidth?: Maybe<Scalars['Int']>
  borderColor?: Maybe<Scalars['String']>
  opacity?: Maybe<Scalars['Float']>
  fullscreen?: Maybe<Scalars['Boolean']>
};

export enum TileType {
  ImageTile = 'ImageTile',
  AnimationTile = 'AnimationTile',
  ActionTile = 'ActionTile',
  TextTile = 'TextTile',
  WorldMapTile = 'WorldMapTile'
}

export type Tile = {
  __typename?: 'Tile'
  id: Scalars['ID']
  entityType: EntityType
  type: TileType
  collectionId: Scalars['String']
  scope?: Maybe<EntityScope>
  name: Scalars['String']
  thisEid?: Maybe<Scalars['String']>
  thisEntityId?: Maybe<Scalars['String']>
  thisEntityType?: Maybe<EntityType>
  entryId?: Maybe<Scalars['String']>
  metadata?: Maybe<TileMetadata>
  isDeleted: Scalars['Boolean']
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
  recordVersion: Scalars['Int']
  asActionTile?: Maybe<ActionTile>
  /** @deprecated invalid: https://gitlab.com/unrealfun/docs/blob/master/GameState.md */
  isVisibleToMe?: Maybe<Scalars['Boolean']>
  isPrivate?: Maybe<Scalars['Boolean']>
  isLocal?: Maybe<Scalars['Boolean']>
};

export type TileMetadata = {
  __typename?: 'TileMetadata'
  /**
   * Optional name for the Tile.
   * This is useful for multiple TileEffects within a SequenceEffect to
   * reference the same Tile.
   */
  name?: Maybe<Scalars['String']>
  /**
   * Optional Image to place in the Tile.
   * The Image will have resizeMode='contain' when it is rendered.
   */
  image?: Maybe<Image>
  /**
   * This is a straight-up React Native style object that is applied to the
   * <View> component wrapping the Tile. Use absolute numeric positioning and
   * sizing to configure the object.
   */
  containerStyle?: Maybe<ContainerStyleV2>
  /**
   * An optional animation to run in the Tile.  
   * The animation will run as soon as the Tile is rendered on the screen.
   */
  animation?: Maybe<AnimationEffectMetadata>
  /**
   * An optional animation sequence to run in the Tile.  
   * The animation seqeunce willrun as soon as the Tile is rendered on the screen.
   */
  animationSequence?: Maybe<AnimationSequence>
  /**
   * For use with TileType.TextTiles.  This is the text that will appear in the
   * <Text> component.
   */
  text?: Maybe<Scalars['String']>
  /**
   * This is a straight-up React Native style object that is applied to the
   * <Text> component for TileType.TextTiles.  
   */
  textStyle?: Maybe<Scalars['JSONObject']>
  /** Only used by WorldMapTiles. */
  playerEid?: Maybe<Scalars['String']>
  /** Only used by WorldMapTiles. */
  playerUsername?: Maybe<Scalars['String']>
  /**
   * Resolves to the Player identified by playerEid.
   * Only used by WorldMapTiles.
   */
  player?: Maybe<Player>
  /** The action to invoke after the tile has been tapped or clicked. */
  clickCallback?: Maybe<ActionCallback>
  /** Indicates if a tile should allow something to be dropped on it. */
  dropTarget?: Maybe<Scalars['Boolean']>
};

export type TileInput = {
  name: Scalars['String']
  collectionId?: Maybe<Scalars['String']>
};

export type TileOutput = {
  __typename?: 'TileOutput'
  tile?: Maybe<Tile>
};

export type ActionTile = {
  __typename?: 'ActionTile'
  image?: Maybe<Image>
  action?: Maybe<ActionX>
};

export type SaveTileInput = {
  type: TileType
  collectionId: Scalars['String']
  scope: EntityScope
  thisEid: Scalars['String']
  name: Scalars['String']
  entryId?: Maybe<Scalars['String']>
  s3Key?: Maybe<Scalars['String']>
  metadata?: Maybe<Scalars['JSONObject']>
  isDeleted?: Maybe<Scalars['Boolean']>
  image?: Maybe<SaveImageInput>
};

export type SaveTileOutput = {
  __typename?: 'SaveTileOutput'
  tile?: Maybe<Tile>
};

export type SaveImageInput = {
  uri?: Maybe<Scalars['String']>
  s3Key?: Maybe<Scalars['String']>
};

export enum QEdgeType {
  StagingQEdge = 'StagingQEdge',
  QEdge = 'QEdge',
  ActorToReactions = 'ActorToReactions',
  PlayerToFollowing = 'PlayerToFollowing',
  PlayerToFollowers = 'PlayerToFollowers',
  PlayerToNewsfeedItems = 'PlayerToNewsfeedItems',
  UserToUnObjects = 'UserToUnObjects',
  AuthorToComments = 'AuthorToComments',
  ActorToCompletedActions = 'ActorToCompletedActions',
  NewsfeedItemToReactions = 'NewsfeedItemToReactions',
  NewsfeedItemToComments = 'NewsfeedItemToComments',
  NewsfeedItemToPlayers = 'NewsfeedItemToPlayers',
  ChatRoomToPlayers = 'ChatRoomToPlayers',
  ChatRoomToUnObject = 'ChatRoomToUnObject',
  ChatRoomToComments = 'ChatRoomToComments',
  UnObjectToMaker = 'UnObjectToMaker',
  CommentToAuthor = 'CommentToAuthor',
  CompletedActionToActor = 'CompletedActionToActor',
  CommentToReactions = 'CommentToReactions',
  CommentToCollection = 'CommentToCollection',
  CompletedActionToCollection = 'CompletedActionToCollection'
}

export type CreateSDistInput = {
  startingNodeEid: Scalars['String']
  endingNodeEid: Scalars['String']
  iterations: Scalars['Int']
  s: Scalars['Float']
  buildPhase?: Maybe<Scalars['String']>
};

export type NewsfeedItemMetadata = {
  __typename?: 'NewsfeedItemMetadata'
  statusText?: Maybe<Scalars['String']>
  title?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  backgroundColor?: Maybe<Scalars['String']>
  textColor?: Maybe<Scalars['String']>
  backgroundImage?: Maybe<Image>
  image?: Maybe<Image>
  overlayImage?: Maybe<Image>
  featuredImage?: Maybe<Image>
  overlayText?: Maybe<Scalars['String']>
  imageText?: Maybe<Scalars['String']>
  isNew?: Maybe<Scalars['Boolean']>
  insetPlayerEid?: Maybe<Scalars['String']>
  insetPlayer?: Maybe<Player>
  action?: Maybe<FeedItemAction>
};

export type NewsfeedItemContext = {
  __typename?: 'NewsfeedItemContext'
  actorEid: Scalars['String']
  actor: Player
  partnerEid?: Maybe<Scalars['String']>
  partner?: Maybe<Player>
  unObjectEid?: Maybe<Scalars['String']>
  unObject?: Maybe<UnObject>
  hashtributeId?: Maybe<Scalars['String']>
  value?: Maybe<Scalars['Int']>
  userStateId?: Maybe<Scalars['String']>
  itemName?: Maybe<Scalars['String']>
  moveName?: Maybe<Scalars['String']>
};

export type NewsfeedItem = {
  __typename?: 'NewsfeedItem'
  id: Scalars['ID']
  entityType?: Maybe<EntityType>
  layout: DynamicFeedItemLayout
  userId: Scalars['String']
  player: Player
  fromEid: Scalars['String']
  fromPlayer: Player
  createdAt?: Maybe<Scalars['DateTime']>
  expiresAt?: Maybe<Scalars['DateTime']>
  trackingId?: Maybe<Scalars['String']>
  metadata?: Maybe<NewsfeedItemMetadata>
  channels?: Maybe<Scalars['JSONObject']>
  comments?: Maybe<CommentsOutput>
  commentCount?: Maybe<Scalars['Int']>
  likesCount?: Maybe<Scalars['Int']>
  myLikesCount?: Maybe<Scalars['Int']>
  isMyNewsfeedItem?: Maybe<Scalars['Boolean']>
  isDeleted?: Maybe<Scalars['Boolean']>
  optimisticId?: Maybe<Scalars['String']>
  context: NewsfeedItemContext
  isPublic: Scalars['Boolean']
  isLive?: Maybe<Scalars['Boolean']>
  isLiveText?: Maybe<Scalars['String']>
};

export type NewsfeedItemCommentsArgs = {
  input?: Maybe<CommentsInput>
};

export type SavePostInput = {
  text: Scalars['String']
  optimisticId?: Maybe<Scalars['String']>
};

export type UpdateNewsfeedItemInput = {
  id: Scalars['ID']
  isPublic?: Maybe<Scalars['Boolean']>
  isDismissed?: Maybe<Scalars['Boolean']>
};

export type UnObject = {
  __typename?: 'UnObject'
  id: Scalars['ID']
  eid: Scalars['String']
  name?: Maybe<Scalars['String']>
  username: Scalars['String']
  /** @deprecated use UnObject.description */
  text?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  emoji?: Maybe<Scalars['String']>
  entryId?: Maybe<Scalars['String']>
  s3Key?: Maybe<Scalars['String']>
  gradientS3Key?: Maybe<Scalars['String']>
  backgroundS3Key?: Maybe<Scalars['String']>
  coverS3Key?: Maybe<Scalars['String']>
  handlerUnObjectId?: Maybe<Scalars['String']>
  entry?: Maybe<ContentfulEntry>
  image?: Maybe<Image>
  gradientImage?: Maybe<Image>
  backgroundImage?: Maybe<Image>
  coverImage?: Maybe<Image>
  entityType: EntityType
  createdByUserId: Scalars['ID']
  createdByUser?: Maybe<User>
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
  publishedStoryboard?: Maybe<Storyboard>
  draftStoryboard?: Maybe<Storyboard>
  storyboards?: Maybe<Array<Maybe<Storyboard>>>
  myEdges?: Maybe<Array<Maybe<Edge>>>
  edgeStats?: Maybe<Array<Maybe<EdgeStats>>>
  asNode?: Maybe<Node>
  field?: Maybe<FieldOutput>
  chatRooms?: Maybe<ChatRoomsOutput>
  level?: Maybe<Scalars['Int']>
  presence?: Maybe<PresenceType>
  isMyUnObject?: Maybe<Scalars['Boolean']>
  actionSheet?: Maybe<ActionSheetOutput>
  tiles?: Maybe<TilesOutput>
  privateTiles?: Maybe<TilesOutput>
  backgroundColor?: Maybe<Scalars['String']>
  hashtribute?: Maybe<Scalars['String']>
  actionSheetBackgroundColor?: Maybe<Scalars['String']>
  showBackpack: Scalars['Boolean']
  /** @deprecated to be deleted soon */
  showControlBar: Scalars['Boolean']
  showResetButton: Scalars['Boolean']
  allowHashtributeNotifications: Scalars['Boolean']
  disableButtonsUponAction: Scalars['Boolean']
  minOccupancy: Scalars['Int']
  maxOccupancy?: Maybe<Scalars['Int']>
  reactionEdges?: Maybe<ReactionEdgesOutput>
  xpField?: Maybe<NumberField>
  bio?: Maybe<Scalars['String']>
  unObjectType: UnObjectType
  isFeatured: Scalars['Boolean']
  featuredSortKey?: Maybe<Scalars['String']>
  isDeleted: Scalars['Boolean']
  hashtributes?: Maybe<HashtributesOutput>
  /** @deprecated use UnObject.worldMapLocation */
  location?: Maybe<Location>
  worldMapLocation?: Maybe<Location>
  /** @deprecated Use `isFollowed` */
  isFollowedByMe?: Maybe<Scalars['Boolean']>
  /** @deprecated Use `isFollowing` */
  following?: Maybe<Scalars['Boolean']>
  isFollowed?: Maybe<Scalars['Boolean']>
  isFollowing?: Maybe<Scalars['Boolean']>
  socialTitle?: Maybe<Scalars['String']>
  socialDescription?: Maybe<Scalars['String']>
  socialImageS3Key?: Maybe<Scalars['String']>
  socialImage?: Maybe<Image>
  activity?: Maybe<UnObjectActivity>
  fakeData?: Maybe<Scalars['JSONObject']>
  showAvatarDropZone?: Maybe<Scalars['Boolean']>
  isDestination: Scalars['Boolean']
  states?: Maybe<Array<HashStatus>>
};

export type UnObjectImageArgs = {
  input?: Maybe<ImageInput>
};

export type UnObjectGradientImageArgs = {
  input?: Maybe<ImageInput>
};

export type UnObjectFieldArgs = {
  input: FieldInput
};

export enum UnObjectType {
  UnObject = 'UnObject',
  Place = 'Place'
}

export type UnObjectsOutput = {
  __typename?: 'UnObjectsOutput'
  unObjects?: Maybe<Array<Maybe<UnObject>>>
  pageInfo: PageInfo
};

export type ReactionEdgesOutput = {
  __typename?: 'ReactionEdgesOutput'
  reactionEdges?: Maybe<Array<Maybe<ReactionEdge>>>
  edges?: Maybe<Array<Maybe<Edge>>>
};

export type CreateUnObjectInput = {
  name: Scalars['String']
  description?: Maybe<Scalars['String']>
  emoji?: Maybe<Scalars['String']>
  entryId?: Maybe<Scalars['String']>
  s3Key?: Maybe<Scalars['String']>
};

export type UpdateUnObjectInput = {
  id: Scalars['ID']
  name?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  emoji?: Maybe<Scalars['String']>
  entryId?: Maybe<Scalars['String']>
  s3Key?: Maybe<Scalars['String']>
};

export type CreateHandledUnObjectInput = {
  handlerUnObjectId: Scalars['String']
  name?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  isMakerVisible?: Maybe<Scalars['Boolean']>
  convoStarter?: Maybe<Scalars['String']>
};

export type CreateHandledUnObjectOutput = {
  __typename?: 'CreateHandledUnObjectOutput'
  unObject?: Maybe<UnObject>
};

export type HandlerUnObjectsOutput = {
  __typename?: 'HandlerUnObjectsOutput'
  handlerUnObjects?: Maybe<Array<Maybe<UnObject>>>
};

export type UnObjectsInput = {
  minOccupancy?: Maybe<Scalars['Int']>
  maxOccupancy?: Maybe<Scalars['Int']>
  isDestination?: Maybe<Scalars['Boolean']>
  isFeatured?: Maybe<Scalars['Boolean']>
  pageInput?: Maybe<PageInput>
};

export type FeaturedHandlerUnObjectsInput = {
  minOccupancy?: Maybe<Scalars['Int']>
  maxOccupancy?: Maybe<Scalars['Int']>
};

export type UnObjectInput = {
  id?: Maybe<Scalars['ID']>
  username?: Maybe<Scalars['String']>
};

export type UnObjectActivity = {
  __typename?: 'UnObjectActivity'
  likesCount: Scalars['Int']
  comments: Array<UnObjectActivityComment>
};

export type UnObjectActivityComment = {
  __typename?: 'UnObjectActivityComment'
  id: Scalars['ID']
  text: Scalars['String']
  author: UnObjectActivityAuthor
};

export type UnObjectActivityAuthor = {
  __typename?: 'UnObjectActivityAuthor'
  id: Scalars['ID']
  displayName: Scalars['String']
  avatarURL: Scalars['String']
};

export enum NotificationType {
  ChatRoomInviteNotification = 'ChatRoomInviteNotification',
  ChatRoomCommentNotification = 'ChatRoomCommentNotification',
  ChatRoomActionNotification = 'ChatRoomActionNotification',
  NewsfeedItemNotification = 'NewsfeedItemNotification',
  NewsfeedItemCommentNotification = 'NewsfeedItemCommentNotification',
  NewsfeedItemReactionNotification = 'NewsfeedItemReactionNotification',
  CommentReactionNotification = 'CommentReactionNotification',
  HandlerNotification = 'HandlerNotification',
  NewFollowerNotification = 'NewFollowerNotification',
  NewFriendRequestNotification = 'NewFriendRequestNotification',
  FriendRequestAcceptedNotification = 'FriendRequestAcceptedNotification'
}

export enum NotificationDataType {
  ChatRoomCommentNotificationData = 'ChatRoomCommentNotificationData',
  ChatRoomActionNotificationData = 'ChatRoomActionNotificationData',
  NewsfeedItemNotificationData = 'NewsfeedItemNotificationData',
  NewsfeedItemCommentNotificationData = 'NewsfeedItemCommentNotificationData',
  NewsfeedItemReactionNotificationData = 'NewsfeedItemReactionNotificationData',
  CommentReactionNotificationData = 'CommentReactionNotificationData',
  HandlerNotificationData = 'HandlerNotificationData',
  NewFollowerNotificationData = 'NewFollowerNotificationData',
  NewFriendRequestNotificationData = 'NewFriendRequestNotificationData',
  FriendRequestAcceptedNotificationData = 'FriendRequestAcceptedNotificationData'
}

export type Notification = {
  __typename?: 'Notification'
  id: Scalars['ID']
  entityType: EntityType
  type: NotificationType
  userId: Scalars['String']
  playerEid?: Maybe<Scalars['String']>
  collectionId: Scalars['String']
  eventEid?: Maybe<Scalars['String']>
  trackingId?: Maybe<Scalars['String']>
  metadata?: Maybe<Scalars['JSONObject']>
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
  fcmMessageInput?: Maybe<FcmMessageInput>
  image?: Maybe<Image>
  isRead: Scalars['Boolean']
  isDeleted: Scalars['Boolean']
  asChatRoomCommentNotification?: Maybe<ChatRoomCommentNotification>
  asChatRoomActionNotification?: Maybe<ChatRoomActionNotification>
  asHandlerNotification?: Maybe<HandlerNotification>
  asNewsfeedItemCommentNotification?: Maybe<NewsfeedItemCommentNotification>
  asNewsfeedItemReactionNotification?: Maybe<NewsfeedItemReactionNotification>
  asCommentReactionNotification?: Maybe<CommentReactionNotification>
  asNewFollowerNotification?: Maybe<NewFollowerNotification>
  asNewsfeedItem?: Maybe<NewsfeedItem>
  asComment?: Maybe<Comment>
};

export type ChatRoomCommentNotification = {
  __typename?: 'ChatRoomCommentNotification'
  title?: Maybe<Scalars['String']>
  body?: Maybe<Scalars['String']>
  data?: Maybe<ChatRoomCommentNotificationData>
};

export type ChatRoomActionNotification = {
  __typename?: 'ChatRoomActionNotification'
  title?: Maybe<Scalars['String']>
  body?: Maybe<Scalars['String']>
  data?: Maybe<ChatRoomActionNotificationData>
};

export type HandlerNotification = {
  __typename?: 'HandlerNotification'
  title?: Maybe<Scalars['String']>
  body?: Maybe<Scalars['String']>
  data?: Maybe<HandlerNotificationData>
};

export type NewsfeedItemPostNotification = {
  __typename?: 'NewsfeedItemPostNotification'
  title?: Maybe<Scalars['String']>
  body?: Maybe<Scalars['String']>
  data?: Maybe<NewsfeedItemPostNotificationData>
};

export type NewsfeedItemCommentNotification = {
  __typename?: 'NewsfeedItemCommentNotification'
  title?: Maybe<Scalars['String']>
  body?: Maybe<Scalars['String']>
  data?: Maybe<NewsfeedItemCommentNotificationData>
};

export type NewsfeedItemReactionNotification = {
  __typename?: 'NewsfeedItemReactionNotification'
  title?: Maybe<Scalars['String']>
  body?: Maybe<Scalars['String']>
  data?: Maybe<NewsfeedItemReactionNotificationData>
};

export type CommentReactionNotification = {
  __typename?: 'CommentReactionNotification'
  title?: Maybe<Scalars['String']>
  body?: Maybe<Scalars['String']>
  data?: Maybe<CommentReactionNotificationData>
};

export type NewFollowerNotification = {
  __typename?: 'NewFollowerNotification'
  title?: Maybe<Scalars['String']>
  body?: Maybe<Scalars['String']>
  data?: Maybe<NewFollowerNotificationData>
};

export type NewFollowerNotificationData = {
  __typename?: 'NewFollowerNotificationData'
  type: Scalars['String']
  id: Scalars['String']
  notificationType: NotificationType
  newFollowerEid?: Maybe<Scalars['String']>
};

export type FcmMessageInput = {
  __typename?: 'FcmMessageInput'
  data?: Maybe<Scalars['JSONObject']>
  title?: Maybe<Scalars['String']>
  body?: Maybe<Scalars['String']>
};

export type ChatRoomCommentNotificationData = {
  __typename?: 'ChatRoomCommentNotificationData'
  type: Scalars['String']
  id: Scalars['String']
  authorEid: Scalars['String']
  collectionId: Scalars['String']
  chatRoomId: Scalars['String']
  text?: Maybe<Scalars['String']>
  myUnReadCommentCount?: Maybe<Scalars['String']>
  chatRoomOrder?: Maybe<Scalars['String']>
};

export type ChatRoomActionNotificationData = {
  __typename?: 'ChatRoomActionNotificationData'
  type: Scalars['String']
  id: Scalars['String']
  actorEid: Scalars['String']
  contextId: Scalars['String']
  chatRoomId: Scalars['String']
  actionName?: Maybe<Scalars['String']>
  chatRoomOrder?: Maybe<Scalars['String']>
};

export type NewsfeedItemPostNotificationData = {
  __typename?: 'NewsfeedItemPostNotificationData'
  newsfeedItemId: Scalars['String']
  type: Scalars['String']
};

export type NewsfeedItemCommentNotificationData = {
  __typename?: 'NewsfeedItemCommentNotificationData'
  type: Scalars['String']
  id: Scalars['String']
  authorEid: Scalars['String']
  collectionId: Scalars['String']
  newsfeedItemId: Scalars['String']
  text?: Maybe<Scalars['String']>
};

export type NewsfeedItemReactionNotificationData = {
  __typename?: 'NewsfeedItemReactionNotificationData'
  newsfeedItemId: Scalars['String']
  type: Scalars['String']
};

export type CommentReactionNotificationData = {
  __typename?: 'CommentReactionNotificationData'
  type: Scalars['String']
  commentId: Scalars['String']
  commentCollectionId: Scalars['String']
  newsfeedItemId?: Maybe<Scalars['String']>
};

export type HandlerNotificationData = {
  __typename?: 'HandlerNotificationData'
  type: Scalars['String']
  id: Scalars['String']
  collectionId: Scalars['String']
  contextEid: Scalars['String']
  contextId: Scalars['String']
  contextEntityType: Scalars['String']
  chatRoomId?: Maybe<Scalars['String']>
  chatRoomOrder?: Maybe<Scalars['String']>
};

export type NotificationsInput = {
  types?: Maybe<Array<NotificationType>>
  pageInput?: Maybe<PageInput>
};

export type NotificationsOutput = {
  __typename?: 'NotificationsOutput'
  notifications: Array<Notification>
  pageInfo: PageInfo
  unreadCount: Scalars['Int']
};

export type CreateNotificationInput = {
  type: NotificationType
  playerEid: Scalars['String']
  collectionId: Scalars['String']
  eventEid?: Maybe<Scalars['String']>
  metadata?: Maybe<Scalars['JSONObject']>
};

export type CreateNotificationOutput = {
  __typename?: 'CreateNotificationOutput'
  notification?: Maybe<Notification>
};

export type UpdateNotificationsInput = {
  ids: Array<Scalars['ID']>
  isRead?: Maybe<Scalars['Boolean']>
  isDismissed?: Maybe<Scalars['Boolean']>
};

export type WorldMap = {
  __typename?: 'WorldMap'
  tiles: Array<Maybe<Tile>>
  players: Array<Maybe<Player>>
};

export enum EdgeType {
  Likes = 'Likes',
  FriendRequest = 'FriendRequest',
  Friend = 'Friend',
  Follows = 'Follows',
  Actor = 'Actor',
  UnObject = 'UnObject',
  NamedEdge = 'NamedEdge',
  ChatRoom = 'ChatRoom',
  ActionX = 'ActionX',
  Tile = 'Tile',
  Interest = 'Interest',
  Player = 'Player',
  NewsfeedItem = 'NewsfeedItem',
  Block = 'Block',
  ReactionEdge = 'ReactionEdge',
  SmartCard = 'SmartCard'
}

export type Edge = {
  __typename?: 'Edge'
  id: Scalars['ID']
  entityType: EntityType
  thisEntityId: Scalars['ID']
  thisEntityType: EntityType
  thisEid: Scalars['String']
  thatEntityId: Scalars['ID']
  thatEntityType: EntityType
  thatEid: Scalars['String']
  edgeType: EdgeType
  metadata?: Maybe<Scalars['JSONObject']>
  name?: Maybe<Scalars['String']>
  order?: Maybe<Scalars['String']>
  sortKey1?: Maybe<Scalars['String']>
  sortKey2?: Maybe<Scalars['String']>
  collectionName?: Maybe<Scalars['String']>
  collectionId?: Maybe<Scalars['String']>
  isDeleted?: Maybe<Scalars['Boolean']>
  count?: Maybe<Scalars['Int']>
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
  recordVersion: Scalars['Int']
  thatEntity?: Maybe<Node>
  thisEntity?: Maybe<Node>
  asActionXEdge?: Maybe<ActionXEdge>
  asReactionEdge?: Maybe<ReactionEdge>
};

export type ActionXEdge = {
  __typename?: 'ActionXEdge'
  id: Scalars['ID']
  action?: Maybe<ActionX>
  isDisabled?: Maybe<Scalars['Boolean']>
  name?: Maybe<Scalars['String']>
  quantity?: Maybe<Scalars['Int']>
  order?: Maybe<Scalars['String']>
  sortKey1?: Maybe<Scalars['String']>
  sortKey2?: Maybe<Scalars['String']>
  isDeleted?: Maybe<Scalars['Boolean']>
  playedCount?: Maybe<Scalars['Int']>
  lastPlayedAt?: Maybe<Scalars['DateTime']>
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
  recordVersion: Scalars['Int']
  metadata?: Maybe<ActionXEdgeMetadata>
};

export type ActionXEdgeMetadata = {
  __typename?: 'ActionXEdgeMetadata'
  isDisabled?: Maybe<Scalars['Boolean']>
  quantity?: Maybe<Scalars['Int']>
  lastPlayedAt?: Maybe<Scalars['DateTime']>
  playedCount?: Maybe<Scalars['Int']>
};

export type ReactionEdge = {
  __typename?: 'ReactionEdge'
  action?: Maybe<ActionX>
};

export type CreateEdgeInput = {
  thisEntityId: Scalars['ID']
  thisEntityType: EntityType
  thatEntityId: Scalars['ID']
  thatEntityType: EntityType
  edgeType: EdgeType
  name?: Maybe<Scalars['String']>
  collectionName?: Maybe<Scalars['String']>
  collectionId?: Maybe<Scalars['String']>
  metadata?: Maybe<Scalars['JSONObject']>
  order?: Maybe<Scalars['String']>
  sortKey1?: Maybe<Scalars['String']>
  sortKey2?: Maybe<Scalars['String']>
  updatedAt?: Maybe<Scalars['DateTime']>
};

export type CreateEdgeOutput = {
  __typename?: 'CreateEdgeOutput'
  edge?: Maybe<Edge>
};

export type SaveEdgeInput = {
  id?: Maybe<Scalars['String']>
  thisEntityId: Scalars['ID']
  thisEntityType: EntityType
  thatEntityId: Scalars['ID']
  thatEntityType: EntityType
  edgeType: EdgeType
  name?: Maybe<Scalars['String']>
  collectionName?: Maybe<Scalars['String']>
  collectionId?: Maybe<Scalars['String']>
  metadata?: Maybe<Scalars['JSONObject']>
  isDeleted?: Maybe<Scalars['Boolean']>
  order?: Maybe<Scalars['String']>
  sortKey1?: Maybe<Scalars['String']>
  sortKey2?: Maybe<Scalars['String']>
  updatedAt?: Maybe<Scalars['DateTime']>
};

export type SaveEdgeOutput = {
  __typename?: 'SaveEdgeOutput'
  edge?: Maybe<Edge>
};

export type SaveThatEdgeInput = {
  id?: Maybe<Scalars['String']>
  thatEntityId: Scalars['ID']
  thatEntityType: EntityType
  edgeType: EdgeType
  name?: Maybe<Scalars['String']>
  collectionName?: Maybe<Scalars['String']>
  metadata?: Maybe<Scalars['JSONObject']>
  isDeleted?: Maybe<Scalars['Boolean']>
  order?: Maybe<Scalars['String']>
  sortKey1?: Maybe<Scalars['String']>
  sortKey2?: Maybe<Scalars['String']>
};

export type EdgeInput = {
  thisEntityId: Scalars['String']
  thatEntityId: Scalars['String']
  edgeType: EdgeType
};

export type EdgesInput = {
  pageInput?: Maybe<PageInput>
  edgeType?: Maybe<EdgeType>
  thisEntityId?: Maybe<Scalars['String']>
  thisEntityType?: Maybe<EntityType>
  thatEntityId?: Maybe<Scalars['String']>
  thatEntityType?: Maybe<EntityType>
  name?: Maybe<Scalars['String']>
  collectionId?: Maybe<Scalars['String']>
  collectionName?: Maybe<Scalars['String']>
};

export type EdgesOutput = {
  __typename?: 'EdgesOutput'
  edges: Array<Maybe<Edge>>
  pageInfo: PageInfo
};

export enum EdgeDirection {
  Inbound = 'Inbound',
  Outbound = 'Outbound'
}

export type EdgeStats = {
  __typename?: 'EdgeStats'
  entityId: Scalars['ID']
  edgeDirection: EdgeDirection
  edgeType: EdgeType
  count?: Maybe<Scalars['Int']>
};

export type EdgeStatsInput = {
  pageInput?: Maybe<PageInput>
  entityId?: Maybe<Scalars['ID']>
  edgeDirection?: Maybe<EdgeDirection>
  edgeType?: Maybe<EdgeType>
};

export type EdgeStatsOutput = {
  __typename?: 'EdgeStatsOutput'
  edgeStats: Array<Maybe<EdgeStats>>
  pageInfo: PageInfo
};

export type CreateUserEdgeInput = {
  thatEntityId: Scalars['ID']
  thatEntityType: EntityType
  edgeType: EdgeType
  metadata?: Maybe<Scalars['JSONObject']>
};

export type DeleteUserEdgeInput = {
  thatEntityId: Scalars['ID']
  edgeType: EdgeType
};

export enum EffectType {
  AnimationEffect = 'AnimationEffect',
  SaveFieldEffect = 'SaveFieldEffect',
  SaveTileEffect = 'SaveTileEffect',
  IncrementFieldEffect = 'IncrementFieldEffect',
  SaveEdgeEffect = 'SaveEdgeEffect',
  SoundEffect = 'SoundEffect',
  VibrationEffect = 'VibrationEffect',
  SystemMessageEffect = 'SystemMessageEffect',
  InteractionEffect = 'InteractionEffect',
  AnimationSequenceEffect = 'AnimationSequenceEffect',
  SequenceEffect = 'SequenceEffect',
  ConcurrentEffect = 'ConcurrentEffect',
  TileEffect = 'TileEffect',
  TransferActionEffect = 'TransferActionEffect',
  CreateActionEffect = 'CreateActionEffect',
  DeleteActionEffect = 'DeleteActionEffect',
  ModalEffect = 'ModalEffect',
  ActionEffect = 'ActionEffect'
}

export type Effect = {
  __typename?: 'Effect'
  id: Scalars['ID']
  entityType: EntityType
  type: EffectType
  collectionId: Scalars['String']
  scope?: Maybe<EntityScope>
  sessionUserId?: Maybe<Scalars['String']>
  trackingId?: Maybe<Scalars['String']>
  metadata?: Maybe<Scalars['JSONObject']>
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
  asAnimationEffect?: Maybe<AnimationEffect>
  asAnimationSequenceEffect?: Maybe<AnimationSequenceEffect>
  asSequenceEffect?: Maybe<SequenceEffect>
  asConcurrentEffect?: Maybe<ConcurrentEffect>
  asSoundEffect?: Maybe<SoundEffect>
  asVibrationEffect?: Maybe<VibrationEffect>
  asSystemMessageEffect?: Maybe<SystemMessageEffect>
  asActionEffect?: Maybe<ActionEffect>
  asInteractionEffect?: Maybe<InteractionEffect>
  asTransferActionEffect?: Maybe<TransferActionEffect>
  asCreateActionEffect?: Maybe<CreateActionEffect>
  asDeleteActionEffect?: Maybe<DeleteActionEffect>
  asTileEffect?: Maybe<TileEffect>
  asModalEffect?: Maybe<ModalEffect>
  eid: Scalars['String']
  thisEid?: Maybe<Scalars['String']>
  thisEntityId?: Maybe<Scalars['String']>
  thisEntityType?: Maybe<EntityType>
  isLocal?: Maybe<Scalars['Boolean']>
  isPrivate?: Maybe<Scalars['Boolean']>
  receipts?: Maybe<ReceiptsOutput>
};

export type CreateEffectInput = {
  collectionId: Scalars['String']
  thisEid: Scalars['String']
  scope: EntityScope
  type: EffectType
  metadata?: Maybe<Scalars['JSONObject']>
};

export type CreateAnimationEffectInput = {
  animationType: AnimationType
  collectionId: Scalars['String']
  scope: EntityScope
  thisEid: Scalars['String']
  sourceUri?: Maybe<Scalars['String']>
  tileId?: Maybe<Scalars['String']>
  startFrame?: Maybe<Scalars['Int']>
  endFrame?: Maybe<Scalars['Int']>
  loop?: Maybe<Scalars['Boolean']>
  speed?: Maybe<Scalars['Float']>
};

export type CreateEffectOutput = {
  __typename?: 'CreateEffectOutput'
  effect?: Maybe<Effect>
};

export type EffectsInput = {
  pageInput?: Maybe<PageInput>
  collectionId?: Maybe<Scalars['String']>
};

export type EffectsOutput = {
  __typename?: 'EffectsOutput'
  pageInfo: PageInfo
  effects?: Maybe<Array<Maybe<Effect>>>
};

export enum SourceType {
  Gif = 'Gif',
  Lottie = 'Lottie'
}

/** Generated whenever an ActionXInstance is created. */
export type CreateActionEffect = {
  __typename?: 'CreateActionEffect'
  metadata?: Maybe<CreateActionEffectMetadata>
};

export type CreateActionEffectMetadata = {
  __typename?: 'CreateActionEffectMetadata'
  /** The input to the create operation.  */
  input?: Maybe<ActionXInstanceTemplate>
  /** A snapshot of the created actionInstance. */
  actionInstanceSnapshot?: Maybe<ActionXInstance>
};

/** Generated whenever an ActionXInstance is deleted. */
export type DeleteActionEffect = {
  __typename?: 'DeleteActionEffect'
  metadata?: Maybe<DeleteActionEffectMetadata>
};

export type DeleteActionEffectMetadata = {
  __typename?: 'DeleteActionEffectMetadata'
  /** The input to the delete operation.  */
  input?: Maybe<ActionXInstanceTemplate>
  /** A snapshot of the deleted actionInstance. */
  actionInstanceSnapshot?: Maybe<ActionXInstance>
};

/** Generated whenever an ActionXInstance is transferred from one player to another. */
export type TransferActionEffect = {
  __typename?: 'TransferActionEffect'
  metadata?: Maybe<TransferActionEffectMetadata>
};

export type TransferActionEffectMetadata = {
  __typename?: 'TransferActionEffectMetadata'
  /**
   * The input to the transfer operation. 
   * Identifies the to and from players.
   */
  input?: Maybe<ActionXInstanceTransferTemplate>
  /** A snapshot of the actionInstance, AFTER transferring. */
  actionInstanceSnapshot?: Maybe<ActionXInstance>
};

/**
 * The template is used by the handler code to create or delete an ActionXInstance.
 * Note: one of id or actionName is required.
 */
export type ActionXInstanceTemplate = {
  __typename?: 'ActionXInstanceTemplate'
  id?: Maybe<Scalars['ID']>
  actionName?: Maybe<Scalars['String']>
  playerEid?: Maybe<Scalars['String']>
  creatorEid?: Maybe<Scalars['String']>
  isDeleted?: Maybe<Scalars['Boolean']>
  metadata?: Maybe<Scalars['JSONObject']>
  trxDescription?: Maybe<Scalars['String']>
};

/**
 * The template is used by the handler code to describe the transfer of an ActionXInstance
 * Note: one of id or actionName is required.
 */
export type ActionXInstanceTransferTemplate = {
  __typename?: 'ActionXInstanceTransferTemplate'
  id?: Maybe<Scalars['ID']>
  actionName?: Maybe<Scalars['String']>
  playerEid?: Maybe<Scalars['String']>
  isDeleted?: Maybe<Scalars['Boolean']>
  metadata?: Maybe<Scalars['JSONObject']>
  trxDescription?: Maybe<Scalars['String']>
  transferToPlayerEid?: Maybe<Scalars['String']>
};

export enum NativeAnimations {
  AddToInventoryFallDownFullScreen = 'AddToInventoryFallDownFullScreen',
  Hover = 'Hover',
  Dizzy = 'Dizzy'
}

export type InteractionEffect = {
  __typename?: 'InteractionEffect'
  id: Scalars['ID']
  asEffect: Effect
  actor?: Maybe<Player>
  targetPlayer?: Maybe<Player>
  action?: Maybe<ActionX>
  hashStatus?: Maybe<HashStatus>
  text?: Maybe<Scalars['String']>
};

export enum SpriteAnimations {
  Orbit = 'Orbit',
  Explosion = 'Explosion'
}

export type AnimationEffect = {
  __typename?: 'AnimationEffect'
  metadata?: Maybe<AnimationEffectMetadata>
};

export type AnimationEffectMetadata = {
  __typename?: 'AnimationEffectMetadata'
  animationType?: Maybe<AnimationType>
  sourceType?: Maybe<SourceType>
  /**
   * The URI of the animation to play.
   * This can refer to a lottie file (.json) or a gif (.gif).
   * Must have either a .json or .gif extension.
   */
  sourceUri?: Maybe<Scalars['String']>
  /** maps to lottie-react-native startFrame prop */
  startFrame?: Maybe<Scalars['Int']>
  /** maps to lottie-react-native endFrame prop */
  endFrame?: Maybe<Scalars['Int']>
  /** maps to lottie-react-native loop prop */
  loop?: Maybe<Scalars['Boolean']>
  /** maps to lottie-react-native speed prop */
  speed?: Maybe<Scalars['Float']>
  /** Specifies the tile on which to run the animation. */
  tileId?: Maybe<Scalars['String']>
  /** Specifies the tile on which to run the animation. */
  tileName?: Maybe<Scalars['String']>
  /**
   * Resolves the Tile identified by tileId.
   * For use by the front-end only.
   */
  tile?: Maybe<Tile>
  backgroundColor?: Maybe<Scalars['String']>
  /**
   * Indicates the number of milliseconds the animation should loop
   * before terminating.
   */
  loopForMs?: Maybe<Scalars['Int']>
  /**
   * maps to react-native-animatable animation prop.
   * Note: the following animations are not supported due to skewX issues:
   * jello, lightSpeedIn, lightSpeedOut
   * see: https://github.com/oblador/react-native-animatable/issues/147
   */
  animation?: Maybe<Scalars['String']>
  /**
   * maps to react-native-animatable duration prop.
   * in milliseconds.
   */
  duration?: Maybe<Scalars['Int']>
  /** maps to react-native-animatable iterationCount prop. */
  iterationCount?: Maybe<Scalars['Int']>
  /**
   * maps to react-native-animatable delay prop.
   * in milliseconds.
   */
  delay?: Maybe<Scalars['Int']>
  /**  This one should be ignored by the FE  */
  animationTemplate?: Maybe<Scalars['String']>
  /**  Sprite animation properties  */
  sprite?: Maybe<Image>
  spriteSize?: Maybe<Scalars['Int']>
  /**  Orbit properties */
  radius?: Maybe<Scalars['Float']>
  /**  Explosion properties  */
  gravity?: Maybe<Scalars['Float']>
  numberOfParticles?: Maybe<Scalars['Int']>
  emissionRate?: Maybe<Scalars['Int']>
  particleLife?: Maybe<Scalars['Int']>
  direction?: Maybe<Scalars['Int']>
  spread?: Maybe<Scalars['Int']>
};

export type TileEffect = {
  __typename?: 'TileEffect'
  metadata?: Maybe<TileMetadata>
};

export type AnimationSequenceEffect = {
  __typename?: 'AnimationSequenceEffect'
  metadata?: Maybe<AnimationSequenceEffectMetadata>
};

export type AnimationSequenceEffectMetadata = {
  __typename?: 'AnimationSequenceEffectMetadata'
  tileId?: Maybe<Scalars['String']>
  animationSequence?: Maybe<AnimationSequence>
};

export type AnimationSequence = {
  __typename?: 'AnimationSequence'
  isDeletedOnFinish?: Maybe<Scalars['Boolean']>
  animations?: Maybe<Array<Maybe<AnimationEffectMetadata>>>
};

export type SoundEffect = {
  __typename?: 'SoundEffect'
  /** @deprecated Use SoundEffectMetadata.soundType */
  soundType?: Maybe<SoundType>
  /** @deprecated Use SoundEffectMetadata.sourceUri */
  sourceUri?: Maybe<Scalars['String']>
  metadata?: Maybe<SoundEffectMetadata>
};

export type SoundEffectMetadata = {
  __typename?: 'SoundEffectMetadata'
  soundType?: Maybe<SoundType>
  sourceUri?: Maybe<Scalars['String']>
};

export type VibrationEffect = {
  __typename?: 'VibrationEffect'
  metadata?: Maybe<VibrationEffectMetadata>
};

export type VibrationEffectMetadata = {
  __typename?: 'VibrationEffectMetadata'
  vibrationType?: Maybe<VibrationType>
  duration?: Maybe<Scalars['Int']>
};

export enum ModalType {
  Simple = 'Simple',
  SimpleQuarter = 'SimpleQuarter',
  SimpleConfirmation = 'SimpleConfirmation',
  SwippableCards = 'SwippableCards',
  ItemAward = 'ItemAward',
  ProgressBar = 'ProgressBar'
}

export enum ModalPosition {
  Fullscreen = 'Fullscreen',
  Centered = 'Centered'
}

export type ProgressBarModal = {
  __typename?: 'ProgressBarModal'
  metadata?: Maybe<ProgressBarModalCustomData>
};

export type SwippableCardsModal = {
  __typename?: 'SwippableCardsModal'
  metadata?: Maybe<SwippableCardsModalCustomData>
};

export type ModalEffectCustomData = ProgressBarModalCustomData | SwippableCardsModalCustomData;

export type ModalEffectMetadata = {
  __typename?: 'ModalEffectMetadata'
  /** Indicates the modal position. */
  position?: Maybe<ModalPosition>
  /** Indicates the modal type and corresponding metadata type. */
  modalType: ModalType
  /** Indicates whether the user can use escape or clicking on the backdrop to close the modal. */
  disableClose?: Maybe<Scalars['Boolean']>
  /** Indicates if the dialog has a backdrop. */
  hasBackdrop?: Maybe<Scalars['Boolean']>
  /**
   * The action to submit when the modal is dismissed.
   * Other callbacks associated to modal buttons take priority over this.
   */
  actionCallback?: Maybe<ActionCallback>
  texts?: Maybe<ModalTexts>
  buttons?: Maybe<ModalButtons>
  animations?: Maybe<ModalAnimatons>
  images?: Maybe<ModalImages>
  metadata?: Maybe<ModalEffectCustomData>
  asProgressBarModal?: Maybe<ProgressBarModal>
  asSwippableCardsModal?: Maybe<SwippableCardsModal>
};

export type ModalButton = {
  __typename?: 'ModalButton'
  text?: Maybe<Scalars['String']>
  actionCallback?: Maybe<Scalars['String']>
};

export type ModalAnimation = {
  __typename?: 'ModalAnimation'
  /**
   * The URI of the animation to play.
   * This can refer to a lottie file (.json) or a gif (.gif).
   * Must have either a .json or .gif extension.
   */
  sourceUri: Scalars['String']
  sourceType: SourceType
};

export type ModalTexts = {
  __typename?: 'ModalTexts'
  primary?: Maybe<Scalars['String']>
  secondary?: Maybe<Scalars['String']>
  tertiary?: Maybe<Scalars['String']>
};

export type ModalButtons = {
  __typename?: 'ModalButtons'
  primary?: Maybe<ModalButton>
  secondary?: Maybe<ModalButton>
  tertiary?: Maybe<ModalButton>
};

export type ModalImages = {
  __typename?: 'ModalImages'
  primary?: Maybe<Image>
  secondary?: Maybe<Image>
  tertiary?: Maybe<Image>
};

export type ModalAnimatons = {
  __typename?: 'ModalAnimatons'
  primary?: Maybe<ModalAnimation>
  secondary?: Maybe<ModalAnimation>
  tertiary?: Maybe<ModalAnimation>
};

export type ProgressBarModalCustomData = {
  __typename?: 'ProgressBarModalCustomData'
  size?: Maybe<Scalars['Int']>
  progress?: Maybe<Scalars['Int']>
};

export type ModalSwipeCard = {
  __typename?: 'ModalSwipeCard'
  texts?: Maybe<ModalTexts>
  buttons?: Maybe<ModalButtons>
  animations?: Maybe<ModalAnimatons>
  images?: Maybe<ModalImages>
  backgroundColor?: Maybe<Scalars['String']>
};

export type SwippableCardsModalCustomData = {
  __typename?: 'SwippableCardsModalCustomData'
  cards?: Maybe<Array<Maybe<ModalSwipeCard>>>
};

export type ModalEffect = {
  __typename?: 'ModalEffect'
  /** The type of the metadata corresponds to the ModalType. */
  metadata?: Maybe<ModalEffectMetadata>
};

export type SystemMessageEffect = {
  __typename?: 'SystemMessageEffect'
  /** @deprecated Use SystemMessageEffectMetadata.text */
  text?: Maybe<Scalars['String']>
  /** @deprecated invalid: https://gitlab.com/unrealfun/docs/blob/master/GameState.md */
  isVisibleToMe?: Maybe<Scalars['Boolean']>
  /** @deprecated Use SystemMessageEffectMetadata.image */
  image?: Maybe<Image>
  metadata?: Maybe<SystemMessageEffectMetadata>
};

export type SystemMessageEffectMetadata = {
  __typename?: 'SystemMessageEffectMetadata'
  text?: Maybe<Scalars['String']>
  /** Indicates the visual treatment for the message applied on the client */
  style?: Maybe<SystemMessageStyle>
  /** Optional image to show with the system message */
  image?: Maybe<Image>
};

export type ActionEffect = {
  __typename?: 'ActionEffect'
  /** This is executed as soon as it is run, redundant but needed. */
  actionCallback?: Maybe<ActionCallback>
};

export type SequenceEffect = {
  __typename?: 'SequenceEffect'
  metadata?: Maybe<SequenceEffectMetadata>
};

export type SequenceEffectMetadata = {
  __typename?: 'SequenceEffectMetadata'
  sequenceEffectItems?: Maybe<Array<Maybe<SequenceEffectItem>>>
};

export type SequenceEffectItemMetadata = AnimationEffectMetadata | SystemMessageEffectMetadata | SoundEffectMetadata | VibrationEffectMetadata | TileMetadata;

export type SequenceEffectItem = {
  __typename?: 'SequenceEffectItem'
  /** Indicates the effect type and corresponding metadata type. */
  type?: Maybe<EffectType>
  /** The type of the metadata corresponds to the EffectType. */
  metadata?: Maybe<SequenceEffectItemMetadata>
  asAnimationEffect?: Maybe<AnimationEffect>
  asSystemMessageEffect?: Maybe<SystemMessageEffect>
  asActionEffect?: Maybe<ActionEffect>
  asSoundEffect?: Maybe<SoundEffect>
  asVibrationEffect?: Maybe<VibrationEffect>
  asTileEffect?: Maybe<TileEffect>
  /**
   * Indicates whether to wait for a user tap before proceeding
   * to the next SequenceEffectItem
   */
  waitForTap?: Maybe<Scalars['Boolean']>
  /**
   * Indicates whether to remove the artifacts associated with
   * this SequenceEffectItem from the screen when it is finished.
   */
  isDeletedOnFinish?: Maybe<Scalars['Boolean']>
  /**
   * The action to submit when the SequenceEffectItem finishes.
   * If waitForTap = true, the action is submitted after the tap.
   */
  actionCallback?: Maybe<ActionCallback>
  concurrencyDuration?: Maybe<Scalars['Int']>
};

export type ConcurrentEffect = {
  __typename?: 'ConcurrentEffect'
  metadata?: Maybe<ConcurrentEffectMetadata>
};

export type ConcurrentEffectMetadata = {
  __typename?: 'ConcurrentEffectMetadata'
  groups?: Maybe<Array<Maybe<ConcurrentEffectGroup>>>
};

export type ConcurrentEffectGroup = {
  __typename?: 'ConcurrentEffectGroup'
  /** Effects to start in parallel */
  effects?: Maybe<Array<Maybe<SequenceEffectItem>>>
  /** Indicates the duration in milliseconds (ms) to play before moving to the next sequence. */
  duration?: Maybe<Scalars['Int']>
};

export type ActionCallback = {
  __typename?: 'ActionCallback'
  actionName?: Maybe<Scalars['String']>
};

export enum AnimationType {
  SourcedAnimation = 'SourcedAnimation',
  /** Indicates react-native-animatable animations */
  NativeAnimatableAnimation = 'NativeAnimatableAnimation',
  /** Indicates the animation is client specific and runs using native frameworks. */
  NativeAnimation = 'NativeAnimation',
  SpriteAnimation = 'SpriteAnimation'
}

export enum SoundType {
  SourcedSound = 'SourcedSound',
  WhooshSound = 'WhooshSound'
}

export enum VibrationType {
  Default = 'Default'
}

export enum SystemMessageStyle {
  /** The most basic type of system message */
  Default = 'Default',
  /** Chat bubble style #1 */
  ChatStyle01 = 'ChatStyle01',
  /** Chat bubble style #2 */
  ChatStyle02 = 'ChatStyle02'
}

export type Player = {
  __typename?: 'Player'
  id: Scalars['ID']
  entityType: EntityType
  eid: Scalars['String']
  name?: Maybe<Scalars['String']>
  displayName?: Maybe<Scalars['String']>
  image?: Maybe<Image>
  asUser?: Maybe<User>
  asUnObject?: Maybe<UnObject>
  isMe?: Maybe<Scalars['Boolean']>
  presence?: Maybe<PresenceType>
  level?: Maybe<Scalars['Int']>
  tiles?: Maybe<TilesOutput>
  privateTiles?: Maybe<TilesOutput>
  xpField?: Maybe<NumberField>
  bio?: Maybe<Scalars['String']>
  states?: Maybe<Array<HashStatus>>
  hashtributes?: Maybe<HashtributesOutput>
  worldMapLocation?: Maybe<Location>
};

export type PlayerImageArgs = {
  input?: Maybe<ImageInput>
};

/** Note: some User fields are only accessible via master APIs */
export type User = {
  __typename?: 'User'
  id: Scalars['ID']
  email?: Maybe<Scalars['String']>
  tempEmail?: Maybe<Scalars['String']>
  entityType: EntityType
  displayName: Scalars['String']
  gender: Gender
  password?: Maybe<Scalars['String']>
  resetPasswordToken?: Maybe<Scalars['String']>
  confirmEmailToken?: Maybe<Scalars['String']>
  phone?: Maybe<Scalars['String']>
  role: Role
  username: Scalars['String']
  updatedAt: Scalars['DateTime']
  createdAt: Scalars['DateTime']
  signedUpAt: Scalars['DateTime']
  isAnonymous: Scalars['Boolean']
  /**
   * Indicates the confirmation status of a user's email address.
   * A value of true indicates they have confirmed email the address.
   * A value of false indicates they have not yet confirmed the email address.
   * The value is set to false after they change their email address and until it is reconfirmed.
   */
  isConfirmed?: Maybe<Scalars['Boolean']>
  /**
   * Indicates the account is legitimately connected to a real world person or entity.
   * Value is false by default.
   */
  isVerifiedAccount?: Maybe<Scalars['Boolean']>
  isPasswordSet?: Maybe<Scalars['Boolean']>
  roles?: Maybe<Array<Maybe<Scalars['String']>>>
  location?: Maybe<Scalars['String']>
  twitter?: Maybe<Scalars['String']>
  instagram?: Maybe<Scalars['String']>
  bio?: Maybe<Scalars['String']>
  eid: Scalars['String']
  name?: Maybe<Scalars['String']>
  entry?: Maybe<ContentfulEntry>
  image?: Maybe<Image>
  asNode?: Maybe<Node>
  deviceInfos?: Maybe<Array<Maybe<DeviceInfo>>>
  chatRooms?: Maybe<ChatRoomsOutput>
  unObjects?: Maybe<UnObjectsOutput>
  notifications: NotificationsOutput
  followersStats?: Maybe<EdgeStats>
  presence?: Maybe<PresenceType>
  level?: Maybe<Scalars['Int']>
  /**
   * The user's full set of GlobalScope actions.
   * Note: It is redundant to query this info inside a ChatRoom, as the set of
   * actions is always streamed down when the user enters the ChatRoom.
   * @deprecated use User.actions
   */
  actionSheet?: Maybe<ActionSheetOutput>
  /**
   * The user's full set of GlobalScope Actions.
   * Note: It is redundant to query this info inside a ChatRoom, as the set of
   * Actions is always streamed down when the user enters the ChatRoom.
   * @deprecated use User.actionInventory
   */
  actions?: Maybe<ActionsOutput>
  /** @deprecated not used (yet?) */
  mostRecentlyUsedActions?: Maybe<ActionsOutput>
  /**
   * The user's action inventory.  The inventory includes:
   * 1. a set of staticActionStubs
   * 2. a set of actionInstanceStubs
   */
  actionInventory?: Maybe<ActionInventory>
  /**
   * The user's set of GlobalScope Tiles.  
   * GlobalScope Tiles are 
   * (1) "public", i.e. visible to other users 
   * (2) "global", i.e. visible in every chat room 
   */
  tiles?: Maybe<TilesOutput>
  /**
   * The user's set of GlobalPrivateScope Tiles.
   * GlobalPrivateScope Tiles are 
   * (1) "private", i.e. visible to only this user
   * (2) "global", i.e. visible in every chat room 
   */
  privateTiles?: Maybe<TilesOutput>
  avataaar?: Maybe<Avataaar>
  hashtributes?: Maybe<HashtributesOutput>
  unReadCommentCount?: Maybe<Scalars['Int']>
  xpField?: Maybe<NumberField>
  positionOnMap?: Maybe<Scalars['Int']>
  selfChatRoom?: Maybe<ChatRoom>
  /** @deprecated not user anymore */
  welcomeBotChatRoom?: Maybe<ChatRoom>
  birthday?: Maybe<Scalars['DateTime']>
  /** @deprecated use User.deviceInfos */
  fcmToken?: Maybe<Scalars['String']>
  /** @deprecated Field no longer supported */
  badge?: Maybe<Scalars['Int']>
  worldMapLocation?: Maybe<Location>
  follows?: Maybe<FollowsOutput>
  followers?: Maybe<FollowsOutput>
  /** @deprecated Use `isFollowed` */
  isFollowedByMe?: Maybe<Scalars['Boolean']>
  /** @deprecated Use `myFriendRequests` */
  sentFriendRequests: FriendRequestsOutput
  myFriendRequests: FriendRequestsOutput
  /** @deprecated Use `friendRequests` */
  receivedFriendRequests: FriendRequestsOutput
  friendRequests: FriendRequestsOutput
  friends: FriendsOutput
  recentFriends: Array<Player>
  /** @deprecated Use `isFollowing` */
  following?: Maybe<Scalars['Boolean']>
  isFollowed?: Maybe<Scalars['Boolean']>
  isFollowing?: Maybe<Scalars['Boolean']>
  /** @deprecated Use `isFriend` */
  friend?: Maybe<Scalars['Boolean']>
  isFriend?: Maybe<Scalars['Boolean']>
  friendRequest?: Maybe<FriendRequest>
  mutualFriends: MutualFriendsOutput
  isBlocked?: Maybe<Scalars['Boolean']>
  isOnline?: Maybe<Scalars['Boolean']>
  hasBlocked?: Maybe<Scalars['Boolean']>
  likesCount: Scalars['Int']
  friendsCount: Scalars['Int']
  friendRequestsCount: Scalars['Int']
  suggestedFriends: Array<User>
  states: Array<HashStatus>
  notificationsCount: Scalars['Int']
};

/** Note: some User fields are only accessible via master APIs */
export type UserImageArgs = {
  input?: Maybe<ImageInput>
};

/** Note: some User fields are only accessible via master APIs */
export type UserChatRoomsArgs = {
  input?: Maybe<ChatRoomsInput>
};

/** Note: some User fields are only accessible via master APIs */
export type UserNotificationsArgs = {
  input?: Maybe<NotificationsInput>
};

/** Note: some User fields are only accessible via master APIs */
export type UserSentFriendRequestsArgs = {
  input?: Maybe<FriendRequestsInput>
};

/** Note: some User fields are only accessible via master APIs */
export type UserMyFriendRequestsArgs = {
  input?: Maybe<FriendRequestsInput>
};

/** Note: some User fields are only accessible via master APIs */
export type UserReceivedFriendRequestsArgs = {
  input?: Maybe<FriendRequestsInput>
};

/** Note: some User fields are only accessible via master APIs */
export type UserFriendRequestsArgs = {
  input?: Maybe<FriendRequestsInput>
};

/** Note: some User fields are only accessible via master APIs */
export type UserFriendsArgs = {
  input?: Maybe<FriendsInput>
};

/** Note: some User fields are only accessible via master APIs */
export type UserMutualFriendsArgs = {
  input?: Maybe<MutualFriendsInput>
};

/** Note: some User fields are only accessible via master APIs */
export type UserNotificationsCountArgs = {
  input?: Maybe<NotificationsCountInput>
};

export type NotificationsCountInput = {
  isRead?: Maybe<Scalars['Boolean']>
};

export type FollowsInput = {
  pageInput?: Maybe<PageInput>
};

export type FollowsOutput = {
  __typename?: 'FollowsOutput'
  players: Array<Maybe<Player>>
  pageInfo: PageInfo
};

export type PlayerEidUser = {
  __typename?: 'PlayerEidUser'
  playerEid: Scalars['String']
  user: User
};

export type ActionInventory = {
  __typename?: 'ActionInventory'
  /**
   * Static actions are general actions that do not have a sense of "individual instances"
   * that can be "owned" by a player and passed around in the game.  
   * E.g. in blackjack the actions "hit" and "stay" are static actions because it doesn't 
   * make sense to hand out "instances" of these actions. 
   */
  staticActionStubs?: Maybe<Array<Maybe<ActionXStub>>>
  /**
   * Action instances are actions that DO have a sense of "individual instances". 
   * These are actions that require the User have an ActionXInstance before the action
   * can be used.
   */
  actionInstanceStubs?: Maybe<Array<Maybe<ActionXStub>>>
};

export enum FriendRequestStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED'
}

export type FriendRequest = {
  __typename?: 'FriendRequest'
  id: Scalars['ID']
  player: Player
  chatRoom?: Maybe<ChatRoom>
  entityType: EntityType
  status: FriendRequestStatus
  received: Scalars['Boolean']
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
};

export type SendFriendRequestInput = {
  playerEid: Scalars['String']
};

export type UpdateFriendRequestInput = {
  id: Scalars['ID']
  status: FriendRequestStatus
};

export type FriendRequestsInput = {
  pageInput: PageInput
};

export type FriendRequestsOutput = {
  __typename?: 'FriendRequestsOutput'
  requests: Array<FriendRequest>
  pageInfo: PageInfo
};

export type FriendsInput = {
  pageInput: PageInput
};

export type MutualFriendsInput = {
  pageInput?: Maybe<PageInput>
};

export type MutualFriendsOutput = {
  __typename?: 'MutualFriendsOutput'
  players: Array<Player>
  pageInfo: PageInfo
};

export type FriendsOutput = {
  __typename?: 'FriendsOutput'
  players: Array<Player>
  pageInfo: PageInfo
};

export type DeviceInfo = {
  __typename?: 'DeviceInfo'
  id?: Maybe<Scalars['ID']>
  entityType?: Maybe<EntityType>
  userId?: Maybe<Scalars['String']>
  os?: Maybe<Scalars['String']>
  osVersion?: Maybe<Scalars['String']>
  appVersion?: Maybe<Scalars['String']>
  deviceToken?: Maybe<Scalars['String']>
  timezoneOffset?: Maybe<Scalars['Int']>
  createdAt?: Maybe<Scalars['DateTime']>
  updatedAt?: Maybe<Scalars['DateTime']>
};

export type SaveDeviceInfoInput = {
  os?: Maybe<Scalars['String']>
  osVersion?: Maybe<Scalars['String']>
  appVersion?: Maybe<Scalars['String']>
  deviceToken?: Maybe<Scalars['String']>
  timezoneOffset?: Maybe<Scalars['Int']>
};

export type SaveDeviceInfoOutput = {
  __typename?: 'SaveDeviceInfoOutput'
  deviceInfo: DeviceInfo
};

export type PushNotificationPayloadInput = {
  token?: Maybe<Scalars['String']>
  data?: Maybe<Scalars['JSONObject']>
  notification?: Maybe<PushNotificationMessageInput>
};

export type PushNotificationMessageInput = {
  title?: Maybe<Scalars['String']>
  body?: Maybe<Scalars['String']>
};

export type SendRawPushNotificationInput = {
  playerEid: Scalars['String']
  payload?: Maybe<PushNotificationPayloadInput>
  rawPayload?: Maybe<Scalars['JSONObject']>
  rawPayloadJson?: Maybe<Scalars['String']>
};

export type SendPushNotificationInput = {
  notificationId: Scalars['String']
};

export type SendPushNotificationOutput = {
  __typename?: 'SendPushNotificationOutput'
  result?: Maybe<Array<Maybe<Scalars['String']>>>
};

export enum PresenceType {
  Online = 'Online',
  Offline = 'Offline'
}

export type SavePresenceInput = {
  presenceType: PresenceType
};

export type SaveAvataaarInput = {
  topType?: Maybe<Scalars['String']>
  accessoriesType?: Maybe<Scalars['String']>
  hatColor?: Maybe<Scalars['String']>
  hairColor?: Maybe<Scalars['String']>
  facialHairType?: Maybe<Scalars['String']>
  facialHairColor?: Maybe<Scalars['String']>
  clotheType?: Maybe<Scalars['String']>
  clotheColor?: Maybe<Scalars['String']>
  graphicType?: Maybe<Scalars['String']>
  eyeType?: Maybe<Scalars['String']>
  eyebrowType?: Maybe<Scalars['String']>
  mouthType?: Maybe<Scalars['String']>
  skinColor?: Maybe<Scalars['String']>
};

export type SaveAvataaarOutput = {
  __typename?: 'SaveAvataaarOutput'
  avataaar?: Maybe<Avataaar>
};

export type Avataaar = {
  __typename?: 'Avataaar'
  topType?: Maybe<Scalars['String']>
  accessoriesType?: Maybe<Scalars['String']>
  hatColor?: Maybe<Scalars['String']>
  hairColor?: Maybe<Scalars['String']>
  facialHairType?: Maybe<Scalars['String']>
  facialHairColor?: Maybe<Scalars['String']>
  clotheType?: Maybe<Scalars['String']>
  clotheColor?: Maybe<Scalars['String']>
  graphicType?: Maybe<Scalars['String']>
  eyeType?: Maybe<Scalars['String']>
  eyebrowType?: Maybe<Scalars['String']>
  mouthType?: Maybe<Scalars['String']>
  skinColor?: Maybe<Scalars['String']>
};

export type SaveUserProfileImageInput = {
  image?: Maybe<Scalars['JSONObject']>
};

export type SaveUserProfileImageOutput = {
  __typename?: 'SaveUserProfileImageOutput'
  image?: Maybe<Image>
};

export enum Gender {
  Male = 'MALE',
  Female = 'FEMALE',
  NonBinary = 'NON_BINARY'
}

export enum Role {
  Admin = 'Admin',
  Maker = 'Maker',
  Tester = 'Tester',
  User = 'User'
}

export type SignUpInput = {
  email: Scalars['String']
  password?: Maybe<Scalars['String']>
  displayName: Scalars['String']
};

export type SignInInput = {
  username?: Maybe<Scalars['String']>
  email?: Maybe<Scalars['String']>
  emailOrUsername?: Maybe<Scalars['String']>
  password: Scalars['String']
};

export type SignOutInput = {
  deviceToken?: Maybe<Scalars['String']>
};

export type SignOutOutput = {
  __typename?: 'SignOutOutput'
  result?: Maybe<Scalars['Boolean']>
};

export type SignInResult = {
  __typename?: 'SignInResult'
  /** @deprecated unsafe due to auth issues. use me instead */
  user: User
  token: Scalars['String']
};

export type ForgotPasswordInput = {
  username?: Maybe<Scalars['String']>
  email?: Maybe<Scalars['String']>
  emailOrUsername?: Maybe<Scalars['String']>
};

export type ResetPasswordInput = {
  resetPasswordToken: Scalars['String']
  password: Scalars['String']
};

export type ConfirmEmailInput = {
  confirmEmailToken: Scalars['String']
  password?: Maybe<Scalars['String']>
};

export type UserInput = {
  userId?: Maybe<Scalars['ID']>
};

export type MasterUserInput = {
  userId?: Maybe<Scalars['ID']>
  email?: Maybe<Scalars['String']>
  username?: Maybe<Scalars['String']>
};

export type UpdateUserInput = {
  userId: Scalars['ID']
  updatedFields: UpdateUserFields
};

export type UpdateUserFields = {
  tempEmail?: Maybe<Scalars['String']>
  displayName?: Maybe<Scalars['String']>
  location?: Maybe<Scalars['String']>
  twitter?: Maybe<Scalars['String']>
  instagram?: Maybe<Scalars['String']>
  bio?: Maybe<Scalars['String']>
  entryId?: Maybe<Scalars['String']>
  s3Key?: Maybe<Scalars['String']>
  gender?: Maybe<Gender>
  birthday?: Maybe<Scalars['DateTime']>
};

export type FcmTokenInput = {
  fcmToken: Scalars['String']
};

export type UpdateEmailInput = {
  email: Scalars['String']
  password?: Maybe<Scalars['String']>
};

export type EmailCanBeRegisteredInput = {
  email: Scalars['String']
};

export type UpdatePasswordInput = {
  oldPassword?: Maybe<Scalars['String']>
  newPassword: Scalars['String']
};

export type UserRoleInput = {
  userId?: Maybe<Scalars['String']>
  email?: Maybe<Scalars['String']>
  username?: Maybe<Scalars['String']>
  role: Role
};

export type MasterSessionInput = {
  userId?: Maybe<Scalars['String']>
  email?: Maybe<Scalars['String']>
  username?: Maybe<Scalars['String']>
};

export type UserRole = {
  __typename?: 'UserRole'
  id: Scalars['ID']
  userId: Scalars['String']
  role: Scalars['String']
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
};

export type UserToken = {
  __typename?: 'UserToken'
  token: Scalars['String']
  user: User
};

export type RegisterEmailInput = {
  email: Scalars['String']
};

export type RegisterEmailOutput = {
  __typename?: 'RegisterEmailOutput'
  email?: Maybe<Scalars['String']>
};

export type ReportPlayerInput = {
  playerEid: Scalars['String']
  reason: Scalars['String']
};

export type FollowPlayerInput = {
  playerEid: Scalars['String']
};

export type FollowPlayerOutput = {
  __typename?: 'FollowPlayerOutput'
  player?: Maybe<Player>
};

export type InstantFriendInput = {
  userId: Scalars['ID']
};

export type Subscription = {
  __typename?: 'Subscription'
  /** No Authentication Required */
  newHeartbeat: Scalars['String']
  collection: DocChange
  channel: ChannelOutput
  onCreateActivity: ActivityDocChange
  onCreateEdge: EdgeDocChange
};

export type SubscriptionCollectionArgs = {
  input: SubscriptionInput
};

export type SubscriptionChannelArgs = {
  input: ChannelInput
};

export type CreateChatRoomInput = {
  playerEids: Array<Maybe<Scalars['String']>>
};

export type CreateChatRoomOutput = {
  __typename?: 'CreateChatRoomOutput'
  chatRoom: ChatRoom
};

export type ChatRoom = {
  __typename?: 'ChatRoom'
  id: Scalars['ID']
  entityType: EntityType
  asNode?: Maybe<Node>
  players: Array<Player>
  playerEids: Scalars['String']
  comments: CommentsOutput
  /** The list of subscription Channels over which this ChatRoom will stream events. */
  channels?: Maybe<Array<Maybe<Channel>>>
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
  effects: EffectsOutput
  completedActions?: Maybe<CompletedActionsOutput>
  /**
   * The set of actions in the session user's ChatRoomScoped "actions" Field.
   * @deprecated use ChatRoom.myActionSheet
   */
  myActions: ActionsOutput
  /**
   * The session user's ChatRoomScoped 'actionSheet' edges.
   * Note: It's redundant to query this info, as the actions are streamed down when
   * the user enters the ChatRoom.
   */
  myActionSheet: ActionSheetOutput
  /**
   * The ActionXEdgesField contains the current set of actions that are shown
   * in the session user's action sheet in this ChatRoom.
   * Note: It's redundant to query this info, as the actions are streamed down when
   * the user enters the ChatRoom.
   * @deprecated use ChatRoom.myCurrentActionStubsField
   */
  myCurrentActionEdges?: Maybe<ActionXEdgesField>
  /**
   * A Field of type ActionXStubsField that contains the current set of actions 
   * in the session user's action sheet in this ChatRoom.
   */
  myCurrentActionStubsField?: Maybe<Field>
  /** @deprecated use ChatRoom.isDeleted */
  isDestroyed?: Maybe<Scalars['Boolean']>
  /**
   * The set of Tiles attached to this ChatRoom.
   * Includes both GlobalScope and ChatRoomScope Tiles, since they are
   * essentially the same scope.
   */
  tiles?: Maybe<TilesOutput>
  /** @deprecated use ChatRoom.myLocalTiles */
  myTiles?: Maybe<TilesOutput>
  /**
   * The session user's set of ChatRoomScope Tiles for this ChatRoom.
   * ChatRoomScope Tiles are
   * (1) "public", i.e. visible to other users
   * (2) "local" aka "chat-room scoped", i.e. visible only in this ChatRoom
   */
  myLocalTiles?: Maybe<TilesOutput>
  /** @deprecated use ChatRoom.myLocalPrivateTiles */
  myPrivateTiles?: Maybe<TilesOutput>
  /**
   * The session user's set of ChatRoomPrivateScope Tiles for this ChatRoom.
   * ChatRoomPrivateScope Tiles are
   * (1) "private", i.e. visible to only this user
   * (2) "local" aka "chat-room scoped", i.e. visible only in this ChatRoom
   */
  myLocalPrivateTiles?: Maybe<TilesOutput>
  commentCount?: Maybe<Scalars['Int']>
  myUnReadCommentCount?: Maybe<Scalars['Int']>
  myChatRoomStatus?: Maybe<ChatRoomStatus>
  /** The chatRoom's GlobalScope Fields of types the FE should get  */
  fields?: Maybe<FieldsOutput>
  isDeleted: Scalars['Boolean']
  type: ChatRoomType
  /** Denotes whether this room is the latest active room between players */
  isLastActive: Scalars['Boolean']
  isHidden?: Maybe<Scalars['Boolean']>
};

export type ChatRoomCommentsArgs = {
  input?: Maybe<CommentsInput>
};

export type ChatRoomEffectsArgs = {
  input?: Maybe<EffectsInput>
};

export type ChatRoomMyActionsArgs = {
  input?: Maybe<MyActionsInput>
};

export type ChatRoomMyActionSheetArgs = {
  input?: Maybe<ActionsInput>
};

export type ChatRoomStatus = {
  __typename?: 'ChatRoomStatus'
  isLastActivityByMe: Scalars['Boolean']
  statusText: Scalars['String']
};

export type TilesOutput = {
  __typename?: 'TilesOutput'
  tiles?: Maybe<Array<Maybe<Tile>>>
};

export type MyActionsInput = {
  asUnObjectId?: Maybe<Scalars['String']>
};

export type CreateChatRoomCommentInput = {
  chatRoomId: Scalars['String']
  text?: Maybe<Scalars['String']>
  replyToCommentId?: Maybe<Scalars['String']>
  asUnObjectId?: Maybe<Scalars['String']>
  optimisticId?: Maybe<Scalars['String']>
};

export type CreateChatRoomCommentOutput = {
  __typename?: 'CreateChatRoomCommentOutput'
  comment?: Maybe<Comment>
};

export type CreateChatRoomSystemCommentOutput = {
  __typename?: 'CreateChatRoomSystemCommentOutput'
  comment?: Maybe<Comment>
};

export type CreateNewsfeedItemCommentInput = {
  newsfeedItemId: Scalars['String']
  text?: Maybe<Scalars['String']>
  replyToCommentId?: Maybe<Scalars['String']>
  asUnObjectId?: Maybe<Scalars['String']>
  optimisticId?: Maybe<Scalars['String']>
};

export type CreateNewsfeedItemCommentOutput = {
  __typename?: 'CreateNewsfeedItemCommentOutput'
  comment?: Maybe<Comment>
};

export type ChatRoomsInput = {
  pageInput?: Maybe<PageInput>
  p2pOnly?: Maybe<Scalars['Boolean']>
};

export type ChatRoomsOutput = {
  __typename?: 'ChatRoomsOutput'
  pageInfo?: Maybe<PageInfo>
  chatRooms?: Maybe<Array<ChatRoom>>
};

export type ChatRoomInput = {
  chatRoomId: Scalars['ID']
};

export type ChatRoomOutput = {
  __typename?: 'ChatRoomOutput'
  chatRoom?: Maybe<ChatRoom>
};

export type SaveMyChatRoomLocalFieldInput = {
  chatRoomId: Scalars['ID']
  type: FieldType
  name: Scalars['String']
  metadata?: Maybe<Scalars['JSONObject']>
  asUnObjectId?: Maybe<Scalars['String']>
};

export type SaveIsTypingFieldInput = {
  chatRoomId: Scalars['ID']
  isTyping: Scalars['Boolean']
  asUnObjectId?: Maybe<Scalars['String']>
};

export type CreateChatRoomSystemCommentInput = {
  chatRoomId: Scalars['ID']
  text?: Maybe<Scalars['String']>
  replyToCommentId?: Maybe<Scalars['String']>
  visibleToPlayerIds?: Maybe<Array<Maybe<Scalars['String']>>>
  visibleToPlayerEids?: Maybe<Array<Maybe<Scalars['String']>>>
};

export type EnterChatRoomInput = {
  chatRoomId: Scalars['ID']
  asUnObjectId?: Maybe<Scalars['String']>
};

export type ExitChatRoomInput = {
  chatRoomId: Scalars['ID']
  asUnObjectId?: Maybe<Scalars['String']>
};

export type EnterChatRoomOutput = {
  __typename?: 'EnterChatRoomOutput'
  result?: Maybe<Scalars['JSONObject']>
};

export type ExitChatRoomOutput = {
  __typename?: 'ExitChatRoomOutput'
  result?: Maybe<Scalars['JSONObject']>
};

export type BeforeEnterChatRoomOutput = {
  __typename?: 'BeforeEnterChatRoomOutput'
  result: Array<Maybe<Scalars['String']>>
};

export enum ChatRoomType {
  PersonalPlayRoom = 'PersonalPlayRoom',
  SinglePlayRoom = 'SinglePlayRoom',
  P2PChat = 'P2PChat',
  MultiPlayRoom = 'MultiPlayRoom'
}

export type Comment = {
  __typename?: 'Comment'
  id: Scalars['ID']
  entityType: EntityType
  type: NodeType
  collectionId: Scalars['String']
  authorEid: Scalars['String']
  authorUserId: Scalars['String']
  author?: Maybe<Player>
  text?: Maybe<Scalars['String']>
  entryId?: Maybe<Scalars['String']>
  trackingId?: Maybe<Scalars['String']>
  replyToCommentId?: Maybe<Scalars['String']>
  optimisticId?: Maybe<Scalars['String']>
  createdAt?: Maybe<Scalars['DateTime']>
  updatedAt?: Maybe<Scalars['DateTime']>
  metadata?: Maybe<Scalars['JSONObject']>
  asNode?: Maybe<Node>
  asChatRoomSystemComment?: Maybe<ChatRoomSystemComment>
  asChatRoomComment?: Maybe<ChatRoomComment>
  asNewsfeedItemComment?: Maybe<NewsfeedItemComment>
  commentReceipts?: Maybe<CommentReceiptsOutput>
  eid: Scalars['String']
  likesCount?: Maybe<Scalars['Int']>
  myLikesCount?: Maybe<Scalars['Int']>
};

export type CommentReceiptsOutput = {
  __typename?: 'CommentReceiptsOutput'
  commentReceipts: Array<CommentReceipt>
  pageInfo?: Maybe<PageInfo>
};

export type ChatRoomComment = {
  __typename?: 'ChatRoomComment'
  chatRoomId: Scalars['String']
};

export type NewsfeedItemComment = {
  __typename?: 'NewsfeedItemComment'
  newsfeedItemId: Scalars['String']
};

export type ChatRoomSystemComment = {
  __typename?: 'ChatRoomSystemComment'
  visibleToPlayerIds?: Maybe<Array<Maybe<Scalars['String']>>>
  visibleToPlayerEids?: Maybe<Array<Maybe<Scalars['String']>>>
  isVisibleToMe: Scalars['Boolean']
  chatRoomId: Scalars['String']
};

export type CreateCommentInput = {
  type: NodeType
  collectionId: Scalars['String']
  authorEid: Scalars['String']
  text?: Maybe<Scalars['String']>
  entryId?: Maybe<Scalars['String']>
  replyToCommentId?: Maybe<Scalars['String']>
  metadata?: Maybe<Scalars['JSONObject']>
  optimisticId?: Maybe<Scalars['String']>
};

export type CreateCommentOutput = {
  __typename?: 'CreateCommentOutput'
  comment?: Maybe<Comment>
};

export type CommentsOutput = {
  __typename?: 'CommentsOutput'
  comments: Array<Maybe<Comment>>
  pageInfo: PageInfo
};

export type CommentsInput = {
  pageInput?: Maybe<PageInput>
  collectionId?: Maybe<Scalars['String']>
};

export enum ReceiptType {
  Received = 'Received',
  Read = 'Read',
  Dismissed = 'Dismissed',
  /**
   * This is now hard-coded into the CommentReceipt.receiptType field.
   * The isRead, isReceived, and isDismissed flags on CommentReceipt indicate
   * the state of the other types.
   */
  Receipt = 'Receipt'
}

export type CommentReceipt = {
  __typename?: 'CommentReceipt'
  id: Scalars['ID']
  entityType: EntityType
  receiptType: ReceiptType
  collectionId: Scalars['String']
  commentId: Scalars['String']
  playerEid?: Maybe<Scalars['String']>
  sessionUserId: Scalars['String']
  isRead: Scalars['Boolean']
  isReceived: Scalars['Boolean']
  isDismissed: Scalars['Boolean']
  metadata?: Maybe<Scalars['JSONObject']>
  createdAt?: Maybe<Scalars['DateTime']>
  updatedAt?: Maybe<Scalars['DateTime']>
  isMyReceipt?: Maybe<Scalars['Boolean']>
  chatRoomId?: Maybe<Scalars['String']>
  newsFeedItemId?: Maybe<Scalars['String']>
};

export type SaveCommentReceiptInput = {
  collectionId: Scalars['String']
  commentId: Scalars['String']
  receiptType: ReceiptType
  asUnObjectId?: Maybe<Scalars['String']>
};

export type SaveCommentReceiptsInput = {
  receipts: Array<Maybe<SaveCommentReceiptInput>>
};

export type SaveCommentReceiptOutput = {
  __typename?: 'SaveCommentReceiptOutput'
  commentReceipt?: Maybe<CommentReceipt>
};

export type SaveCommentReceiptsOutput = {
  __typename?: 'SaveCommentReceiptsOutput'
  commentReceipts?: Maybe<Array<Maybe<CommentReceipt>>>
};

export type Receipt = {
  __typename?: 'Receipt'
  id: Scalars['ID']
  entityType: EntityType
  type: ReceiptType
  entityCollectionId: Scalars['String']
  entityEid: Scalars['String']
  sessionUserId: Scalars['String']
  playerEid?: Maybe<Scalars['String']>
  metadata?: Maybe<Scalars['JSONObject']>
  createdAt?: Maybe<Scalars['DateTime']>
  updatedAt?: Maybe<Scalars['DateTime']>
};

export type SaveReceiptInput = {
  entityCollectionId: Scalars['String']
  entityEid: Scalars['String']
  type: ReceiptType
  asUnObjectId?: Maybe<Scalars['String']>
};

export type SaveReceiptsInput = {
  receipts: Array<Maybe<SaveReceiptInput>>
};

export type SaveReceiptOutput = {
  __typename?: 'SaveReceiptOutput'
  receipt?: Maybe<Receipt>
};

export type SaveReceiptsOutput = {
  __typename?: 'SaveReceiptsOutput'
  receipts?: Maybe<Array<Maybe<Receipt>>>
};

export type ReceiptsOutput = {
  __typename?: 'ReceiptsOutput'
  receipts?: Maybe<Array<Maybe<Receipt>>>
};

export type CommentsReceiptsInput = {
  collectionId: Scalars['String']
  playerEids?: Maybe<Array<Scalars['String']>>
  pageInput?: Maybe<PageInput>
};

export type ActionResult = {
  __typename?: 'ActionResult'
  id?: Maybe<Scalars['ID']>
  userId: Scalars['ID']
  unObjectId: Scalars['ID']
  trackingId?: Maybe<Scalars['String']>
  action: Scalars['String']
  userAction: Scalars['String']
  startState: Scalars['String']
  endState: Scalars['String']
  card: Card
  newsfeedText?: Maybe<Scalars['String']>
  emoji?: Maybe<Scalars['String']>
  createdAt?: Maybe<Scalars['DateTime']>
  session?: Maybe<Session>
};

export type Storyline = {
  __typename?: 'Storyline'
  id: Scalars['ID']
  unObjectId: Scalars['ID']
  name: Scalars['String']
  text?: Maybe<Scalars['String']>
  imageUrl?: Maybe<Scalars['String']>
  entryId?: Maybe<Scalars['String']>
  entry?: Maybe<ContentfulEntry>
  image?: Maybe<Image>
  unObject?: Maybe<UnObject>
  emoji?: Maybe<Scalars['String']>
  session?: Maybe<Session>
  myEdges?: Maybe<Array<Maybe<Edge>>>
  edgeStats?: Maybe<Array<Maybe<EdgeStats>>>
};

export type Card = {
  __typename?: 'Card'
  text?: Maybe<Scalars['String']>
  imageUrl?: Maybe<Scalars['String']>
  emoji?: Maybe<Scalars['String']>
  entryId?: Maybe<Scalars['String']>
  entry?: Maybe<ContentfulEntry>
};

export type CardInput = {
  text?: Maybe<Scalars['String']>
  emoji?: Maybe<Scalars['String']>
  entryId?: Maybe<Scalars['String']>
};

export type Session = {
  __typename?: 'Session'
  state?: Maybe<Scalars['String']>
  prevState?: Maybe<Scalars['String']>
  action?: Maybe<Scalars['String']>
  stateActionHistory?: Maybe<Array<Maybe<Scalars['String']>>>
  availableActions?: Maybe<Array<Maybe<Scalars['String']>>>
  actionStats?: Maybe<Array<Maybe<ActionStats>>>
  userId: Scalars['ID']
  unObjectId: Scalars['ID']
};

export type ActionStats = {
  __typename?: 'ActionStats'
  action: Scalars['String']
  count: Scalars['Int']
};

/** @deprecated(reason="use ActionX") */
export type Action = {
  __typename?: 'Action'
  id: Scalars['ID']
  createdByUserId: Scalars['ID']
  storyboardId: Scalars['ID']
  unObjectId: Scalars['ID']
  startState: Scalars['String']
  extendState?: Maybe<Scalars['String']>
  buttonText: Scalars['String']
  card: Card
  newsfeedText?: Maybe<Scalars['String']>
  endState: Scalars['String']
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
};

export type ActionStubInput = {
  id: Scalars['ID']
  buttonText?: Maybe<Scalars['String']>
};

/** @deprecated(reason="use ActionXStub") */
export type ActionStub = {
  __typename?: 'ActionStub'
  id: Scalars['ID']
  buttonText: Scalars['String']
};

export type ActionInput = {
  startState: Scalars['String']
  buttonText: Scalars['String']
  card: CardInput
  newsfeedText?: Maybe<Scalars['String']>
  endState: Scalars['String']
};

export type Storyboard = {
  __typename?: 'Storyboard'
  id: Scalars['String']
  createdByUserId: Scalars['String']
  unObjectId: Scalars['String']
  name?: Maybe<Scalars['String']>
  actions: Array<Maybe<Action>>
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
  myPlayerContext: PlayerContext
  status?: Maybe<Scalars['String']>
};

export type PlayerContext = {
  __typename?: 'PlayerContext'
  id: Scalars['String']
  storyboardId: Scalars['String']
  userId: Scalars['String']
  currentState: Scalars['String']
  actionStubs: Array<Maybe<ActionStub>>
  metadata?: Maybe<Scalars['JSONObject']>
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
};

export type ActionWithContext = {
  __typename?: 'ActionWithContext'
  id?: Maybe<Scalars['ID']>
  actionId: Scalars['String']
  action: Action
  myPlayerContextId: Scalars['String']
  myPlayerContext: PlayerContext
  createdAt?: Maybe<Scalars['DateTime']>
  createdByUserId: Scalars['String']
  trackingId?: Maybe<Scalars['String']>
};

export type ContentfulEntry = {
  __typename?: 'ContentfulEntry'
  sys?: Maybe<Scalars['JSONObject']>
  fields?: Maybe<ContentfulEntryFields>
};

export type ContentfulEntryFields = {
  __typename?: 'ContentfulEntryFields'
  description?: Maybe<Scalars['String']>
  image?: Maybe<ContentfulImage>
  tags?: Maybe<Array<Maybe<Scalars['String']>>>
  backgroundColor?: Maybe<Scalars['String']>
};

export type ContentfulImage = {
  __typename?: 'ContentfulImage'
  sys?: Maybe<Scalars['JSONObject']>
  fields?: Maybe<ContentfulImageFields>
};

export type ContentfulImageFields = {
  __typename?: 'ContentfulImageFields'
  title?: Maybe<Scalars['String']>
  file?: Maybe<ContentfulImageFile>
};

export type ContentfulImageFile = {
  __typename?: 'ContentfulImageFile'
  url?: Maybe<Scalars['String']>
  details?: Maybe<ContentfulImageFileDetails>
  fileName?: Maybe<Scalars['String']>
  contentType?: Maybe<Scalars['String']>
};

export type ContentfulImageFileDetails = {
  __typename?: 'ContentfulImageFileDetails'
  size?: Maybe<Scalars['Int']>
  image?: Maybe<ImageDims>
};

export type ImageDims = {
  __typename?: 'ImageDims'
  width?: Maybe<Scalars['Int']>
  height?: Maybe<Scalars['Int']>
};

export type Image = {
  __typename?: 'Image'
  uri?: Maybe<Scalars['String']>
  width?: Maybe<Scalars['Int']>
  height?: Maybe<Scalars['Int']>
  size?: Maybe<Scalars['Int']>
  isDefault?: Maybe<Scalars['Boolean']>
  backgroundColor?: Maybe<Scalars['String']>
  s3Key?: Maybe<Scalars['String']>
};

export type ImageInput = {
  width?: Maybe<Scalars['Int']>
  height?: Maybe<Scalars['Int']>
};

export type DoActionInput = {
  unObjectId: Scalars['ID']
  action: Scalars['String']
};

export type IdInput = {
  id: Scalars['ID']
};

export type CreateStoryboardInput = {
  unObjectId: Scalars['ID']
  actions: Array<Maybe<ActionInput>>
};

export type UpdateStoryboardStatusInput = {
  id: Scalars['ID']
  status: Scalars['String']
};

export type ActionX = {
  __typename?: 'ActionX'
  id?: Maybe<Scalars['ID']>
  unObjectId?: Maybe<Scalars['String']>
  createdByUserId?: Maybe<Scalars['String']>
  entityType?: Maybe<EntityType>
  type?: Maybe<ActionType>
  name: Scalars['String']
  text?: Maybe<Scalars['String']>
  xp?: Maybe<Scalars['Int']>
  power?: Maybe<Scalars['Int']>
  order?: Maybe<Scalars['String']>
  collectionId?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  /** @deprecated use ActionXStub.isDisabled */
  isEnabled?: Maybe<Scalars['Boolean']>
  backgroundColor?: Maybe<Scalars['String']>
  entryId?: Maybe<Scalars['String']>
  emoji?: Maybe<Scalars['String']>
  image?: Maybe<Image>
  rawTags?: Maybe<Scalars['String']>
  tags?: Maybe<Array<Maybe<Scalars['String']>>>
  createdAt?: Maybe<Scalars['DateTime']>
  updatedAt?: Maybe<Scalars['DateTime']>
  metadata?: Maybe<Scalars['JSONObject']>
  args?: Maybe<Scalars['JSONObject']>
  isDeleted?: Maybe<Scalars['Boolean']>
  dropAnimationField?: Maybe<Field>
};

export type ActionXInstance = {
  __typename?: 'ActionXInstance'
  id: Scalars['ID']
  entityType: EntityType
  playerEid: Scalars['String']
  creatorEid: Scalars['String']
  lastGiverEid?: Maybe<Scalars['String']>
  actionName: Scalars['String']
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
  metadata?: Maybe<Scalars['JSONObject']>
  isDeleted: Scalars['Boolean']
  action?: Maybe<ActionX>
};

export enum ActionType {
  Action = 'Action'
}

export type SaveActionInput = {
  name: Scalars['String']
  text: Scalars['String']
  description: Scalars['String']
  entryId?: Maybe<Scalars['String']>
  s3Key?: Maybe<Scalars['String']>
  backgroundColor?: Maybe<Scalars['String']>
  package: Scalars['String']
  collectionId: Scalars['String']
  xp?: Maybe<Scalars['Int']>
  power?: Maybe<Scalars['Int']>
  order?: Maybe<Scalars['String']>
  unObjectId?: Maybe<Scalars['String']>
  tags?: Maybe<Array<Maybe<Scalars['String']>>>
};

export type SaveActionOutput = {
  __typename?: 'SaveActionOutput'
  action?: Maybe<ActionX>
};

export type SubmitActionInput = {
  unObjectId?: Maybe<Scalars['String']>
  name: Scalars['String']
  tags?: Maybe<Array<Maybe<Scalars['String']>>>
  asUnObjectId?: Maybe<Scalars['String']>
};

export type SubmitActionOutput = {
  __typename?: 'SubmitActionOutput'
  result?: Maybe<Scalars['JSONObject']>
  trackingId?: Maybe<Scalars['String']>
};

export type SubmitChatRoomActionInput = {
  chatRoomId: Scalars['String']
  name: Scalars['String']
  tags?: Maybe<Array<Maybe<Scalars['String']>>>
  asUnObjectId?: Maybe<Scalars['String']>
  /** Event source key */
  target?: Maybe<Scalars['String']>
  createdAt?: Maybe<Scalars['DateTime']>
};

export type SubmitChatRoomActionOutput = {
  __typename?: 'SubmitChatRoomActionOutput'
  result?: Maybe<Scalars['JSONObject']>
  trackingId?: Maybe<Scalars['String']>
};

export type ActionsOutput = {
  __typename?: 'ActionsOutput'
  actions?: Maybe<Array<Maybe<ActionX>>>
  edges?: Maybe<Array<Maybe<Edge>>>
  actionEdges?: Maybe<Array<Maybe<ActionXEdge>>>
};

export type ActionsInput = {
  pageInput?: Maybe<PageInput>
};

export type ActionSheetOutput = {
  __typename?: 'ActionSheetOutput'
  /** @deprecated use ActionSheetOutput.actionEdges */
  actions?: Maybe<Array<Maybe<ActionX>>>
  edges?: Maybe<Array<Maybe<Edge>>>
  actionEdges?: Maybe<Array<Maybe<ActionXEdge>>>
};

export enum CompletedActionType {
  ChatRoomAction = 'ChatRoomAction'
}

export type CompletedActionsOutput = {
  __typename?: 'CompletedActionsOutput'
  completedActions?: Maybe<Array<Maybe<CompletedAction>>>
};

export type CompletedAction = {
  __typename?: 'CompletedAction'
  id: Scalars['ID']
  entityType: EntityType
  type: CompletedActionType
  contextId: Scalars['String']
  sessionUserId: Scalars['String']
  actorEid: Scalars['String']
  trackingId?: Maybe<Scalars['String']>
  input?: Maybe<Scalars['JSONObject']>
  output?: Maybe<Scalars['JSONObject']>
  metadata?: Maybe<Scalars['JSONObject']>
  createdAt: Scalars['DateTime']
  updatedAt: Scalars['DateTime']
};

export type DocChange = {
  __typename?: 'DocChange'
  collectionId: Scalars['String']
  type: Scalars['String']
  doc?: Maybe<Scalars['JSONObject']>
};

export type SubscriptionInput = {
  collectionId: Scalars['String']
};

export type ActivityDocChange = {
  __typename?: 'ActivityDocChange'
  collectionId: Scalars['String']
  type: Scalars['String']
  doc: Activity
};

export type EdgeDocChange = {
  __typename?: 'EdgeDocChange'
  collectionId: Scalars['String']
  type: Scalars['String']
  doc: Edge
};

export enum ChannelType {
  Collection = 'Collection',
  Document = 'Document'
}

export type Channel = {
  __typename?: 'Channel'
  channelId: Scalars['String']
  channelType: ChannelType
  name?: Maybe<Scalars['String']>
  /** @deprecated channels are no longer entity-specific. use ChannelOutput.entityType */
  entityType?: Maybe<EntityType>
  isMyChannel?: Maybe<Scalars['Boolean']>
};

export type ChannelInput = {
  channelId: Scalars['String']
  channelType: ChannelType
};

export type DocChangeSnapshot = {
  __typename?: 'DocChangeSnapshot'
  createTime?: Maybe<Scalars['DateTime']>
  updateTime?: Maybe<Scalars['DateTime']>
  readTime?: Maybe<Scalars['DateTime']>
  id?: Maybe<Scalars['String']>
  data?: Maybe<Scalars['JSONObject']>
};

export type ChannelOutput = {
  __typename?: 'ChannelOutput'
  channel: Channel
  changeType?: Maybe<Scalars['String']>
  snapshot?: Maybe<DocChangeSnapshot>
  isArray?: Maybe<Scalars['Boolean']>
  entityType?: Maybe<EntityType>
  /** @deprecated use ChannelOutput.asNode */
  node?: Maybe<Node>
  /** @deprecated use ChannelOutput.asField */
  field?: Maybe<Field>
  /** @deprecated use ChannelOutput.asEdge */
  edge?: Maybe<Edge>
  /** @deprecated use ChannelOutput.asNodes */
  asNode?: Maybe<Node>
  /** @deprecated use ChannelOutput.asFields */
  asField?: Maybe<Field>
  /** @deprecated use ChannelOutput.asEdges */
  asEdge?: Maybe<Edge>
  asEdges?: Maybe<Array<Maybe<Edge>>>
  asFields?: Maybe<Array<Maybe<Field>>>
  asNodes?: Maybe<Array<Maybe<Node>>>
  asFriendRequests?: Maybe<Array<Maybe<FriendRequest>>>
  feedItem?: Maybe<FeedItem>
};

export enum FeedItemActionType {
  AvatarBuilder = 'AvatarBuilder',
  Backpack = 'Backpack',
  Chat = 'Chat',
  ChatList = 'ChatList',
  Default = 'Default',
  Info = 'Info',
  Moves = 'Moves',
  Profile = 'Profile',
  ShareEntity = 'ShareEntity'
}

export enum FeedItemActionEntityType {
  Npc = 'NPC',
  Item = 'Item',
  Move = 'Move',
  User = 'User'
}

export type FeedItemAction = {
  __typename?: 'FeedItemAction'
  entityId?: Maybe<Scalars['ID']>
  entityType?: Maybe<FeedItemActionEntityType>
  player?: Maybe<Player>
  type: FeedItemActionType
  text?: Maybe<Scalars['String']>
};

export enum DynamicFeedItemLayout {
  /** newsfeed post items */
  Post1 = 'Post1',
  /** default dynamic newsfeed item */
  Dynamic1 = 'Dynamic1',
  /** unObject or unObject inset player type of dynamic newsfeed item */
  Dynamic2 = 'Dynamic2'
}

export enum StaticFeedItemLayout {
  /** A 16:9 Card / Any Background Color / Right Justified Image / Left Justified Text */
  Static1 = 'Static1',
  /** A 16:9 Card / White Background Color / Centered Image / Centered Text */
  Static2 = 'Static2',
  /** Two 9:16 Side-by-side Cards / Any Background Color / Centered Image / Left Justified Text */
  Static3 = 'Static3',
  /** A 16:9 Card / Any Background Color / Centered Image / Centered Text */
  Static4 = 'Static4'
}

export type StaticFeedItem = {
  __typename?: 'StaticFeedItem'
  action?: Maybe<FeedItemAction>
  backgroundColor: Scalars['String']
  backgroundImage?: Maybe<Image>
  description?: Maybe<Scalars['String']>
  foregroundImage?: Maybe<Image>
  infoBlock?: Maybe<Scalars['String']>
  title: Scalars['String']
  textColor?: Maybe<Scalars['String']>
  trackingId: Scalars['String']
};

export type StaticFeedItemOutput = {
  __typename?: 'StaticFeedItemOutput'
  data: Array<StaticFeedItem>
  layout: StaticFeedItemLayout
};

export enum SuggestedFriendsFeedItemLayout {
  /** Refers to dynamic data from db based on rules */
  Friend1 = 'Friend1',
  /** Refers to fake data set predefined in Airtable */
  Friend2 = 'Friend2'
}

export type SuggestedFriendsFeedItemOutput = {
  __typename?: 'SuggestedFriendsFeedItemOutput'
  data: Array<Player>
  layout: SuggestedFriendsFeedItemLayout
};

export enum FeedItemType {
  NewsfeedItem = 'NewsfeedItem',
  SmartCard = 'SmartCard',
  Friend = 'Friend'
}

export type FeedItem = {
  __typename?: 'FeedItem'
  dynamic?: Maybe<NewsfeedItem>
  static?: Maybe<StaticFeedItemOutput>
  suggestedFriends?: Maybe<SuggestedFriendsFeedItemOutput>
  type: FeedItemType
};

export type HomeFeed = {
  __typename?: 'HomeFeed'
  items: Array<FeedItem>
  pageInfo: PageInfo
};

export type HomeFeedInput = {
  pageInput?: Maybe<PageInput>
};

export type SharePrivateLinkInput = {
  entityId: Scalars['ID']
  entityType: FeedItemActionEntityType
};

export type SharePrivateLinkOutput = {
  __typename?: 'SharePrivateLinkOutput'
  title: Scalars['String']
  description?: Maybe<Scalars['String']>
  imageURI: Scalars['String']
  smsGreeting: Scalars['String']
  link: Scalars['String']
};

export enum EventType {
  Intraction = 'Intraction',
  NewsfeedItemCreate = 'NewsfeedItemCreate'
}
