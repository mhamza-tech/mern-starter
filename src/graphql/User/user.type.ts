import { gql } from 'apollo-server'

// 10/13/2019: note: removed most of the '!' from this type to be backwards-compatible
// with some denormalized data stored in Activity.metadata 
// Specifically the unObject/storyline, where unObject.id is missing but unObject.unObjectId is there, iirc
// could work around that with an id resolver.
// but do we care?  just break the old shit - WAGNI
// ALSO!!! the generated types conflict with the DB entity types. add '!' to db fields only?
export default gql`
    type Player {
        id: ID!
        entityType: EntityType!
        eid: String!
        name: String
        displayName: String
        image(input:ImageInput): Image
        asUser: User
        asUnObject: UnObject
        isMe: Boolean
        presence: PresenceType
        level: Int
        tiles: TilesOutput
        privateTiles: TilesOutput
        xpField: NumberField
        bio: String
        states: [HashStatus!]
        hashtributes: HashtributesOutput
        worldMapLocation: Location
    }
    
    "Note: some User fields are only accessible via master APIs"
    type User {
        id: ID!
        email: String
        tempEmail: String
        entityType: EntityType!
        displayName: String!
        gender: Gender!
        password: String
        resetPasswordToken: String
        confirmEmailToken: String
        phone: String
        role: Role!
        username: String!
        updatedAt: DateTime!
        createdAt: DateTime!
        signedUpAt: DateTime!
        isAnonymous: Boolean!
        """
        Indicates the confirmation status of a user's email address.
        A value of true indicates they have confirmed email the address.
        A value of false indicates they have not yet confirmed the email address.
        The value is set to false after they change their email address and until it is reconfirmed.
        """
        isConfirmed: Boolean
        """
        Indicates the account is legitimately connected to a real world person or entity.
        Value is false by default.
        """
        isVerifiedAccount: Boolean
        isPasswordSet: Boolean
        roles: [String]
        location: String
        twitter: String
        instagram: String
        bio: String
        eid: String!
        name: String
        entry: ContentfulEntry
        image(input:ImageInput): Image
        asNode: Node
        deviceInfos: [DeviceInfo]
        chatRooms(input:ChatRoomsInput): ChatRoomsOutput 
        unObjects: UnObjectsOutput
        notifications(input: NotificationsInput): NotificationsOutput!
        followersStats: EdgeStats
        presence: PresenceType
        level: Int

        """
        The user's full set of GlobalScope actions.
        Note: It is redundant to query this info inside a ChatRoom, as the set of
        actions is always streamed down when the user enters the ChatRoom.
        """
        actionSheet: ActionSheetOutput @deprecated(reason:"use User.actions")

        """
        The user's full set of GlobalScope Actions.
        Note: It is redundant to query this info inside a ChatRoom, as the set of
        Actions is always streamed down when the user enters the ChatRoom.
        """
        actions: ActionsOutput @deprecated(reason:"use User.actionInventory")

        mostRecentlyUsedActions: ActionsOutput @deprecated(reason:"not used (yet?)")

        """
        The user's action inventory.  The inventory includes:
        1. a set of staticActionStubs
        2. a set of actionInstanceStubs
        """
        actionInventory: ActionInventory

        """
        The user's set of GlobalScope Tiles.  
        GlobalScope Tiles are 
        (1) "public", i.e. visible to other users 
        (2) "global", i.e. visible in every chat room 
        """
        tiles: TilesOutput

        """
        The user's set of GlobalPrivateScope Tiles.
        GlobalPrivateScope Tiles are 
        (1) "private", i.e. visible to only this user
        (2) "global", i.e. visible in every chat room 
        """
        privateTiles: TilesOutput

        avataaar: Avataaar
        hashtributes: HashtributesOutput
        unReadCommentCount: Int
        xpField: NumberField
        positionOnMap: Int
        selfChatRoom: ChatRoom
        welcomeBotChatRoom: ChatRoom @deprecated(reason:"not user anymore")
        birthday: DateTime

        fcmToken: String @deprecated(reason:"use User.deviceInfos")
        badge: Int @deprecated

        worldMapLocation: Location
        follows: FollowsOutput
        followers: FollowsOutput
        isFollowedByMe: Boolean @deprecated(reason: "Use \`isFollowed\`")
        sentFriendRequests(input: FriendRequestsInput): FriendRequestsOutput! @deprecated(reason: "Use \`myFriendRequests\`")
        myFriendRequests(input: FriendRequestsInput): FriendRequestsOutput!
        receivedFriendRequests(input: FriendRequestsInput): FriendRequestsOutput! @deprecated(reason: "Use \`friendRequests\`")
        friendRequests(input: FriendRequestsInput): FriendRequestsOutput!
        friends(input: FriendsInput): FriendsOutput!
        recentFriends: [Player!]!
        following: Boolean @deprecated(reason: "Use \`isFollowing\`")
        isFollowed: Boolean
        isFollowing: Boolean
        friend: Boolean @deprecated(reason: "Use \`isFriend\`")
        isFriend: Boolean
        friendRequest: FriendRequest
        mutualFriends(input: MutualFriendsInput): MutualFriendsOutput!
        isBlocked: Boolean
        isOnline: Boolean
        hasBlocked: Boolean
        likesCount: Int!
        friendsCount: Int!
        friendRequestsCount: Int!
        suggestedFriends: [User!]!
        states: [HashStatus!]!
        notificationsCount(input: NotificationsCountInput): Int!
    }
    
    input NotificationsCountInput {
      isRead: Boolean
    }

    input FollowsInput {
        pageInput: PageInput
    }

    type FollowsOutput {
        players: [Player]!
        pageInfo: PageInfo!
    }

    type PlayerEidUser {
        playerEid: String!
        user: User!
    }

    type ActionInventory {
        """
        Static actions are general actions that do not have a sense of "individual instances"
        that can be "owned" by a player and passed around in the game.  
        E.g. in blackjack the actions "hit" and "stay" are static actions because it doesn't 
        make sense to hand out "instances" of these actions. 
        """
        staticActionStubs: [ActionXStub]

        """
        Action instances are actions that DO have a sense of "individual instances". 
        These are actions that require the User have an ActionXInstance before the action
        can be used.
        """
        actionInstanceStubs: [ActionXStub]
    }
    
    enum FriendRequestStatus {
      PENDING
      ACCEPTED
      REJECTED
    }
    
    type FriendRequest {
      id: ID!
      player: Player!
      chatRoom: ChatRoom
      entityType: EntityType!
      status: FriendRequestStatus!
      received: Boolean!
      createdAt: DateTime!
      updatedAt: DateTime!
    }
    
    input SendFriendRequestInput {
      playerEid: String!
    }
    
    input UpdateFriendRequestInput {
      id: ID!
      status: FriendRequestStatus!
    }
    
    input FriendRequestsInput {
        pageInput: PageInput!
    }
    
    type FriendRequestsOutput {
        requests: [FriendRequest!]!
        pageInfo: PageInfo!
    }
    
    input FriendsInput {
        pageInput: PageInput!
    }
    
    input MutualFriendsInput {
        pageInput: PageInput
    }
    
    type MutualFriendsOutput {
        players: [Player!]!
        pageInfo: PageInfo!
    }
    
    type FriendsOutput {
        players: [Player!]!
        pageInfo: PageInfo!
    }

    type DeviceInfo {
        id: ID
        entityType: EntityType
        userId: String
        os: String
        osVersion: String
        appVersion: String
        deviceToken: String
        timezoneOffset: Int
        createdAt: DateTime
        updatedAt: DateTime
    }
    
    input SaveDeviceInfoInput {
        os: String
        osVersion: String
        appVersion: String
        deviceToken: String
        timezoneOffset: Int
    }
    
    type SaveDeviceInfoOutput {
        deviceInfo: DeviceInfo!
    }
    
    input PushNotificationPayloadInput {
        token: String
        data: JSONObject
        notification: PushNotificationMessageInput
    }
    
    input PushNotificationMessageInput {
        title: String
        body: String
    }
    
    input SendRawPushNotificationInput {
        playerEid: String!
        payload: PushNotificationPayloadInput
        rawPayload: JSONObject
        rawPayloadJson: String
    }
    
    input SendPushNotificationInput {
        notificationId: String!
    }
    
    type SendPushNotificationOutput {
        result: [String]
    }

    enum PresenceType {
        Online
        Offline
    }
    
    input SavePresenceInput {
        presenceType: PresenceType!
    }

    input SaveAvataaarInput {
        topType: String
        accessoriesType: String
        hatColor: String
        hairColor: String
        facialHairType: String
        facialHairColor: String
        clotheType: String
        clotheColor: String
        graphicType: String
        eyeType: String
        eyebrowType: String
        mouthType: String
        skinColor: String
    }
    
    type SaveAvataaarOutput {
        avataaar: Avataaar
    }
    
    type Avataaar {
        topType: String
        accessoriesType: String
        hatColor: String
        hairColor: String
        facialHairType: String
        facialHairColor: String
        clotheType: String
        clotheColor: String
        graphicType: String
        eyeType: String
        eyebrowType: String
        mouthType: String
        skinColor: String
    }
    
    input SaveUserProfileImageInput {
        image: JSONObject
    }
    
    type SaveUserProfileImageOutput {
        image: Image
    }
 
  enum Gender {
    MALE
    FEMALE
    NON_BINARY
  }
  
  enum Role {
    Admin
    Maker
    Tester
    User
  }

  input SignUpInput {
      email: String!
      password: String
      displayName: String!
  }

  input SignInInput {
      username: String
      email: String
      emailOrUsername: String
      password: String!
  }

  input SignOutInput {
      deviceToken: String
  }

  type SignOutOutput {
      result: Boolean
  }
 
  type SignInResult {
      user: User! @deprecated(reason:"unsafe due to auth issues. use me instead")
      token: String!
  }

  input ForgotPasswordInput {
      username: String
      email: String
      emailOrUsername: String
  }

  input ResetPasswordInput {
      resetPasswordToken: String!
      password: String!
  }

  input ConfirmEmailInput {
      confirmEmailToken: String!
      password: String
  }

  input UserInput {
    userId: ID
  }

  input MasterUserInput {
    userId: ID
    email: String
    username: String
  }

  input UpdateUserInput {
    userId: ID!
    updatedFields: UpdateUserFields!
  }

  input UpdateUserFields {
      tempEmail: String
      displayName: String
      location: String
      twitter: String
      instagram: String
      bio: String
      entryId: String
      s3Key: String
      gender: Gender
      birthday: DateTime
  }

  input FCMTokenInput {
    fcmToken: String!
  }

  input UpdateEmailInput {
      email: String!
      password: String
  }

  input EmailCanBeRegisteredInput {
      email: String!
  }

  input UpdatePasswordInput {
      oldPassword: String
      newPassword: String!
  }

  input UserRoleInput {
      userId: String
      email: String
      username: String
      role: Role!
  }

  input MasterSessionInput {
      userId: String
      email: String
      username: String
  }

  type UserRole {
      id: ID!
      userId: String!
      role: String!
      createdAt: DateTime!
      updatedAt: DateTime!
  }

  type UserToken {
    token: String!
    user: User!
  }

  input RegisterEmailInput {
      email: String!
  }

  type RegisterEmailOutput {
      email: String
  }

  input ReportPlayerInput {
      playerEid: String!
      reason: String!
  }

  input FollowPlayerInput {
      playerEid: String!
  }

  type FollowPlayerOutput {
      player: Player
  }
  
  input InstantFriendInput {
    userId: ID!
  }

  type Query {
    "Requires Authentication Token"
    me: User!
    user(input: UserInput!): User
    masterUser(input: MasterUserInput!): User
    isUsernameAvailable(input: String!): Boolean
    isResetPasswordTokenValid(input: String!): Boolean
    validateResetPasswordToken(input: String!): User
    validateConfirmEmailToken(input: String!): User
  }

  type Mutation {
    signUp(input: SignUpInput!): SignInResult!
    signIn(input: SignInInput!): SignInResult!
    signOut(input: SignOutInput!): SignOutOutput!
    forgotPassword(input:ForgotPasswordInput!): Boolean
    resetPassword(input:ResetPasswordInput!): SignInResult!
    confirmEmail(input:ConfirmEmailInput!): SignInResult!
    sendConfirmEmail: Boolean
    sendRawPushNotification(input: SendRawPushNotificationInput!): SendPushNotificationOutput!
    sendPushNotification(input: SendPushNotificationInput!): SendPushNotificationOutput!
    session: SignInResult!
    masterSession(input:MasterSessionInput!): SignInResult!
    updateUser(input: UpdateUserInput!): User
    updateMe(input: UpdateUserFields!): User
    updateUsername(input:String!): User
    updateEmail(input:UpdateEmailInput!): User
    emailCanBeRegistered(input: EmailCanBeRegisteredInput!): Boolean
    updatePassword(input: UpdatePasswordInput!): User
    updateUserRole(input: UserRoleInput): User!
    deleteUserRole(input: UserRoleInput): UserRole
    savePresence(input: SavePresenceInput!): SaveFieldOutput!
    saveAvataaar(input: SaveAvataaarInput!): SaveAvataaarOutput!
    saveUserProfileImage(input: SaveUserProfileImageInput!): SaveUserProfileImageOutput!
    registerEmail(input: RegisterEmailInput!): RegisterEmailOutput!
    reportPlayer(input: ReportPlayerInput!): User!
    blockPlayer(id: ID!): User!
    unblockPlayer(id: ID!): User!
    followPlayer(input: FollowPlayerInput!): FollowPlayerOutput!
    unfollowPlayer(input: FollowPlayerInput!): FollowPlayerOutput!
    sendFriendRequest(input: SendFriendRequestInput!): FriendRequest!
    updateFriendRequest(input: UpdateFriendRequestInput!): FriendRequest!
    unfriend(playerEid: String!): Player!
    instantFriend(input: InstantFriendInput!): User!
    "Requires Authentication Token"
    saveDeviceInfo(input: SaveDeviceInfoInput!): SaveDeviceInfoOutput!
  }
`
