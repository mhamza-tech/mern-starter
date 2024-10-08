/**
 * @rob4lderman
 * mar2020
 */
import { gql } from 'apollo-server'

const gqlErrorType = gql`
    enum ErrorType {
        INVALID_PASSWORD
        INVALID_EMAIL
        INVALID_CREDENTIALS
        EMAIL_ALREADY_EXISTS
        USERNAME_ALREADY_EXISTS
        USERNAME_PROHIBITED
        EMAIL_OR_USERNAME_REQUIRED
        EMAIL_OR_USERNAME_NOT_FOUND
        EMAIL_NOT_FOUND
        USERNAME_NOT_FOUND
        INVALID_RESET_PASSWORD_TOKEN
        INVALID_CONFIRM_EMAIL_TOKEN
        PASSWORD_REQUIRED
        AUTHENTICATION_REQUIRED
        DISPLAY_NAME_REQUIRED
        USER_ID_NOT_FOUND
        INPUT_REQUIRED
        NOT_AUTHORIZED_SESSION_USER
        NOT_AUTHORIZED_ROLE
        NOT_AUTHORIZED_CREATOR
        INVALID_STORYBOARD_UNOBJECT_REQUIRED
        INVALID_UNOBJECT_NAME_REQUIRED
        INVALID_UNOBJECT_IMAGE_REQUIRED
        INVALID_STORYBOARD_ACTIONS_REQUIRED
        INVALID_ACTION_CARD_REQUIRED
        NOT_AUTHORIZED_CHAT
        CHAT_ROOM_DESTROYED
        InternalError
        InvalidHandlerUnObjectIdError
        InvalidField
        NotAuthorizedDeleteNewsfeedItem
        NotAuthorizedReadNotification
    }
`

const gqlEntityType = gql`
    enum EntityType {
        Activity
        UnObject
        User
        NewsfeedItem
        Edge
        Field
        Comment
        DeviceInfo
        ChatRoom
        Notification
        CommentReceipt
        Receipt
        Effect
        CompletedAction
        ActionX
        ActionXInstance
        Tile
        QEdge
        SDist
        Report
        Location
        Job
        UserNewsfeedItemEdge
        FriendRequest
    }

    type EntityRef {
        id: ID!
        entityType: EntityType!
    }

    """
    EntityScope applies to Fields, Tiles, Effects, and Actions.
    EntityScope generally governs the "visibility/accessibility" of an Entity.

    It breaks down along two dimensions: 
    1. "global" vs. "local" ("local" aka "chatroom") scope
    2. "public" vs. "private" scope

    Global scope: visible/accessible in all ChatRooms
    Local aka ChatRoom scope: visible/accessible in only one specific ChatRoom.

    Public scope: visible/accessible to all users.
    Private scope: visible/accessible to only one specific user.
    """
    enum EntityScope {
        """
        GlobalScope entities are (generally speaking)...
        (1) "global", i.e. visible/accessible in all ChatRooms
        (2) "public", i.e. visible/accessible to all users 
        """
        GlobalScope

        """
        GlobalPrivateScope entities are (generally speaking)...
        (1) "global", i.e. visible/accessible in all ChatRooms
        (2) "private", i.e. visible/accessible to only one specific user
        """
        GlobalPrivateScope

        """
        ChatRoomScope entities are (generally speaking)...
        (1) "local" aka "chatroom-scoped", i.e. visible/accessible in only one specific ChatRoom
        (2) "public", i.e. visible/accessible to all users
        """
        ChatRoomScope

        """
        ChatRoomPrivateScope entities are (generally speaking)...
        (1) "local" aka "chatroom-scoped", i.e. visible/accessible in only one specific ChatRoom
        (2) "private", i.e. visible/accessible to only one specific user
        """
        ChatRoomPrivateScope
    }

`

const gqlJobType = gql`
    enum JobType {
        ReactionFnJob
    }
`

const gqlTrackingType = gql`
    input TrackingInput {
        trackingId: String!
    }

    type Tracking {
        trackingId: String!
        activities: [Activity]
        effects: [Effect]
        newsfeedItems: [NewsfeedItem]
        comments: [Comment]
        notifications: [Notification]
    }
`

const gqlNodeType = gql`
    type Node {
        id: ID!
        entityType: EntityType!
        eid: String!
        edges(input:EdgesInput): EdgesOutput      
        edgeStats(input:EdgeStatsInput): EdgeStatsOutput      
        fields(input:FieldsInput): FieldsOutput    
        field(input:FieldInput!): FieldOutput
        image: Image
        asChatRoom: ChatRoom
        asUnObject: UnObject
        asComment: Comment
        asNotification: Notification
        asUser: User
        asPlayer: Player
        asCommentReceipt: CommentReceipt
        asReceipt: Receipt
        asEffect: Effect
        asTile: Tile
        asActionX: ActionX
        asActionXInstance: ActionXInstance
    }
    input NodeInput {
        eid: String!
    }
    type NodeOutput {
        node: Node
    }
    enum NodeType {
        ChatRoomComment
        ChatRoomSystemComment
        NewsfeedItemComment
    }
`

const gqlLocationType = gql`
    type Location {
        id: ID!
        entityType: EntityType!
        thisEid: String!
        x: Int!
        y: Int!
        createdAt: DateTime!
        updatedAt: DateTime!
        isDeleted: Boolean!
    }
`

export default gql`

    ${gqlEntityType}

    ${gqlJobType}

    ${gqlTrackingType}

    ${gqlNodeType}

    ${gqlErrorType}

    ${gqlLocationType}

    type PageInfo {
        firstCursor: String
        lastCursor: String
    }

    input PageInput {
        first: Int
        last: Int
        afterCursor: String
        beforeCursor: String
    }

    input CacheRefetchInput {
        cacheName: String!
        cacheKey: String
        compositeCacheKey: JSONObject
    }

    type CacheRefetchOutput {
        result: JSONObject
    }

    input SearchInput {
        query: String!
        friendsOnly: Boolean
        pageInput: PageInput
    }

    type SearchOutput {
        players: [Player]
        pageInfo: PageInfo!
    }

    type Query {
        tracking(input:TrackingInput!): Tracking!
        node(input:NodeInput!): NodeOutput!
        errorMessage(input:ErrorType!): String!
        searchPlayers(input:SearchInput!): SearchOutput!
    }

    type Mutation {
        cacheRefetch(input:CacheRefetchInput!): CacheRefetchOutput!
    }
`
