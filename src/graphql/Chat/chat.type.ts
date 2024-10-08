/**
 * @rob4lderman
 * sep2019
 */
import { gql } from 'apollo-server'

const gqlChatRoomType = gql`
    input CreateChatRoomInput {
        playerEids: [String]!
    }
    type CreateChatRoomOutput {
        chatRoom: ChatRoom!
    }
    type ChatRoom {
        id: ID!
        entityType: EntityType!
        asNode: Node
        players: [Player!]!
        playerEids: String!

        comments(input:CommentsInput): CommentsOutput!

        """
        The list of subscription Channels over which this ChatRoom will stream events.
        """
        channels: [Channel]

        createdAt: DateTime!
        updatedAt: DateTime!

        effects(input:EffectsInput): EffectsOutput!
        completedActions: CompletedActionsOutput

        """
        The set of actions in the session user's ChatRoomScoped "actions" Field.
        """
        myActions(input:MyActionsInput): ActionsOutput! @deprecated(reason:"use ChatRoom.myActionSheet")

        """
        The session user's ChatRoomScoped 'actionSheet' edges.
        Note: It's redundant to query this info, as the actions are streamed down when
        the user enters the ChatRoom.
        """
        myActionSheet(input:ActionsInput): ActionSheetOutput!

        """
        The ActionXEdgesField contains the current set of actions that are shown
        in the session user's action sheet in this ChatRoom.
        Note: It's redundant to query this info, as the actions are streamed down when
        the user enters the ChatRoom.
        """
        myCurrentActionEdges: ActionXEdgesField @deprecated(reason:"use ChatRoom.myCurrentActionStubsField")

        """
        A Field of type ActionXStubsField that contains the current set of actions 
        in the session user's action sheet in this ChatRoom.
        """
        myCurrentActionStubsField: Field 

        isDestroyed: Boolean @deprecated(reason:"use ChatRoom.isDeleted")

        """
        The set of Tiles attached to this ChatRoom.
        Includes both GlobalScope and ChatRoomScope Tiles, since they are
        essentially the same scope.
        """
        tiles: TilesOutput

        myTiles: TilesOutput @deprecated(reason:"use ChatRoom.myLocalTiles")

        """
        The session user's set of ChatRoomScope Tiles for this ChatRoom.
        ChatRoomScope Tiles are
        (1) "public", i.e. visible to other users
        (2) "local" aka "chat-room scoped", i.e. visible only in this ChatRoom
        """
        myLocalTiles: TilesOutput

        myPrivateTiles: TilesOutput @deprecated(reason:"use ChatRoom.myLocalPrivateTiles")

        """
        The session user's set of ChatRoomPrivateScope Tiles for this ChatRoom.
        ChatRoomPrivateScope Tiles are
        (1) "private", i.e. visible to only this user
        (2) "local" aka "chat-room scoped", i.e. visible only in this ChatRoom
        """
        myLocalPrivateTiles: TilesOutput 

        commentCount: Int
        myUnReadCommentCount: Int
        myChatRoomStatus: ChatRoomStatus

        """
        The chatRoom's GlobalScope Fields of types the FE should get 
        """
        fields: FieldsOutput

        isDeleted: Boolean!
        type: ChatRoomType!
        """
        Denotes whether this room is the latest active room between players
        """
        isLastActive: Boolean!
        isHidden: Boolean
    }
    type ChatRoomStatus {
        isLastActivityByMe: Boolean!
        statusText: String!
    }
    type TilesOutput {
        tiles: [Tile]
    }
    input MyActionsInput {
        asUnObjectId: String
    }
    input CreateChatRoomCommentInput {
        chatRoomId: String!
        text: String
        replyToCommentId: String
        asUnObjectId: String
        optimisticId: String
    }
    type CreateChatRoomCommentOutput {
        comment: Comment
    }
    type CreateChatRoomSystemCommentOutput {
        comment: Comment
    }
    input CreateNewsfeedItemCommentInput {
        newsfeedItemId: String!
        text: String
        replyToCommentId: String
        asUnObjectId: String
        optimisticId: String
    }
    type CreateNewsfeedItemCommentOutput {
        comment: Comment
    }
    
    input ChatRoomsInput {
        pageInput: PageInput
        p2pOnly: Boolean
    }
    type ChatRoomsOutput {
        pageInfo: PageInfo
        chatRooms: [ChatRoom!]
    }
    input ChatRoomInput {
        chatRoomId: ID!
    }
    type ChatRoomOutput {
        chatRoom: ChatRoom
    }
    input SaveMyChatRoomLocalFieldInput {
        chatRoomId: ID!
        type: FieldType!
        name: String!
        metadata: JSONObject
        asUnObjectId: String
    }
    input SaveIsTypingFieldInput {
        chatRoomId: ID!
        isTyping: Boolean!
        asUnObjectId: String
    }
    input CreateChatRoomSystemCommentInput {
        chatRoomId: ID!
        text: String
        replyToCommentId: String
        visibleToPlayerIds: [String]
        visibleToPlayerEids: [String]
    }
    input EnterChatRoomInput {
        chatRoomId: ID!
        asUnObjectId: String
    }
    input ExitChatRoomInput {
      chatRoomId: ID!
      asUnObjectId: String
    }
    type EnterChatRoomOutput {
        result: JSONObject
    }
    type ExitChatRoomOutput {
      result: JSONObject
    }
    type BeforeEnterChatRoomOutput {
      result: [String]!
    }
    
    enum ChatRoomType { 
        PersonalPlayRoom
        SinglePlayRoom
        P2PChat
        MultiPlayRoom
    }

`

export default gql`

    ${gqlChatRoomType}

    type Query {
        chatRoom(input:ChatRoomInput!): ChatRoomOutput!
    }

    type Mutation {
        beforeEnterChatRoom(input:EnterChatRoomInput!): BeforeEnterChatRoomOutput!
        enterChatRoom(input:EnterChatRoomInput!): EnterChatRoomOutput!
        exitChatRoom(input:ExitChatRoomInput!): ExitChatRoomOutput!
        hideChatRoom(id: ID!): ChatRoom!
        createChatRoom(input:CreateChatRoomInput!): CreateChatRoomOutput!
        createComment(input:CreateCommentInput!): CreateCommentOutput!
        createChatRoomComment(input:CreateChatRoomCommentInput!): CreateChatRoomCommentOutput!
        createNewsfeedItemComment(input:CreateNewsfeedItemCommentInput!): CreateNewsfeedItemCommentOutput!
        createChatRoomSystemComment(input:CreateChatRoomSystemCommentInput!): CreateChatRoomSystemCommentOutput!
        saveMyChatRoomLocalField(input:SaveMyChatRoomLocalFieldInput!): SaveFieldOutput!
        saveIsTypingField(input:SaveIsTypingFieldInput!): SaveFieldOutput!
        submitChatRoomAction(input:SubmitChatRoomActionInput!): SubmitChatRoomActionOutput!
        saveAction(input:SaveActionInput!): SaveActionOutput!
    }

`
