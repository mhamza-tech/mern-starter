/**
 * @rob4lderman
 * sep2019
 */
import { gql } from 'apollo-server'

const gqlCommentType = gql`
    type Comment {
        id: ID!
        entityType: EntityType!
        type: NodeType!
        collectionId: String!
        authorEid: String!
        authorUserId: String!
        author: Player
        text: String
        entryId: String
        trackingId: String
        replyToCommentId: String
        optimisticId: String
        createdAt: DateTime
        updatedAt: DateTime
        metadata: JSONObject
        asNode: Node
        asChatRoomSystemComment: ChatRoomSystemComment
        asChatRoomComment: ChatRoomComment
        asNewsfeedItemComment: NewsfeedItemComment
        commentReceipts: CommentReceiptsOutput
        eid: String!
        likesCount: Int
        myLikesCount: Int
    }

    type CommentReceiptsOutput {
        commentReceipts: [CommentReceipt!]!
        pageInfo: PageInfo
    }

    type ChatRoomComment {
        chatRoomId: String!
    }

    type NewsfeedItemComment {
        newsfeedItemId: String!
    }

    type ChatRoomSystemComment {
        visibleToPlayerIds: [String]
        visibleToPlayerEids: [String]
        isVisibleToMe: Boolean!
        chatRoomId: String!
    }

    input CreateCommentInput {
        type: NodeType!
        collectionId: String!
        authorEid: String!
        text: String
        entryId: String
        replyToCommentId: String
        metadata: JSONObject
        optimisticId: String
    }

    type CreateCommentOutput {
        comment: Comment
    }

    type CommentsOutput {
        comments: [Comment]!
        pageInfo: PageInfo!
    }

    input CommentsInput {
        pageInput: PageInput
        collectionId: String
    }
`

const gqlCommentReceiptType = gql`
    enum ReceiptType {
        Received
        Read
        Dismissed

        """
        This is now hard-coded into the CommentReceipt.receiptType field.
        The isRead, isReceived, and isDismissed flags on CommentReceipt indicate
        the state of the other types.
        """
        Receipt
    }

    type CommentReceipt {
        id: ID!
        entityType: EntityType!
        receiptType: ReceiptType!
        collectionId: String!
        commentId: String!
        playerEid: String 
        sessionUserId: String!
        isRead: Boolean!
        isReceived: Boolean!
        isDismissed: Boolean!
        metadata: JSONObject
        createdAt: DateTime
        updatedAt: DateTime
        isMyReceipt: Boolean
        chatRoomId: String
        newsFeedItemId: String
    }

    input SaveCommentReceiptInput {
        collectionId: String!
        commentId: String!
        receiptType: ReceiptType!
        asUnObjectId: String
    }

    input SaveCommentReceiptsInput {
        receipts: [SaveCommentReceiptInput]!
    }

    type SaveCommentReceiptOutput {
        commentReceipt: CommentReceipt
    }

    type SaveCommentReceiptsOutput {
        commentReceipts: [CommentReceipt]
    }

    type Receipt {
        id: ID!
        entityType: EntityType!
        type: ReceiptType!
        entityCollectionId: String!
        entityEid: String!
        sessionUserId: String!
        playerEid: String 
        metadata: JSONObject
        createdAt: DateTime
        updatedAt: DateTime
    }

    input SaveReceiptInput {
        entityCollectionId: String!
        entityEid: String!
        type: ReceiptType!
        asUnObjectId: String
    }

    input SaveReceiptsInput {
        receipts: [SaveReceiptInput]!
    }

    type SaveReceiptOutput {
        receipt: Receipt
    }

    type SaveReceiptsOutput {
        receipts: [Receipt]
    }

    type ReceiptsOutput {
        receipts: [Receipt]
    }
    
    input CommentsReceiptsInput {
        collectionId: String!
        playerEids: [String!]
        pageInput: PageInput
    }
`

export default gql`
    ${gqlCommentType}
    ${gqlCommentReceiptType}

    type Query {
        commentsReceipts(input: CommentsReceiptsInput!): CommentReceiptsOutput!
    }

    type Mutation {
        saveCommentReceipt(input:SaveCommentReceiptInput!): SaveCommentReceiptOutput!
        saveCommentReceipts(input:SaveCommentReceiptsInput!): SaveCommentReceiptsOutput!
        saveReceipt(input:SaveReceiptInput!): SaveReceiptOutput!
        saveReceipts(input:SaveReceiptsInput!): SaveReceiptsOutput!
    }
`
