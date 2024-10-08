/**
 * @rob4lderman
 * sep2019
 */
import { gql } from 'apollo-server'

export default gql`
    type ActionX {
        id: ID
        unObjectId: String
        createdByUserId: String
        entityType: EntityType
        type: ActionType
        name: String!
        text: String
        xp: Int
        power: Int
        order: String
        collectionId: String
        description: String
        isEnabled: Boolean @deprecated(reason:"use ActionXStub.isDisabled")
        backgroundColor: String
        entryId: String
        emoji: String
        image: Image
        rawTags: String
        tags: [String]
        createdAt: DateTime
        updatedAt: DateTime
        metadata: JSONObject
        args: JSONObject
        isDeleted: Boolean
        dropAnimationField: Field
    }

    type ActionXInstance {
        id: ID!
        entityType: EntityType!
        playerEid: String!
        creatorEid: String!
        lastGiverEid: String
        actionName: String!
        createdAt: DateTime!
        updatedAt: DateTime!
        metadata: JSONObject
        isDeleted: Boolean!
        action: ActionX
    }

    enum ActionType {
        Action
    }

    input SaveActionInput {
        name: String!
        text: String!
        description: String!
        entryId: String
        s3Key: String
        backgroundColor: String
        package: String!
        collectionId: String!
        xp: Int
        power: Int
        order: String
        unObjectId: String
        tags: [String]
    }

    type SaveActionOutput {
        action: ActionX
    }

    input SubmitActionInput {
        unObjectId: String
        name: String!
        tags: [String]
        asUnObjectId: String
    }

    type SubmitActionOutput {
        result: JSONObject
        trackingId: String
    }

    input SubmitChatRoomActionInput {
        chatRoomId: String!
        name: String!
        tags: [String]
        asUnObjectId: String

        """
        Event source key
        """
        target: String
        createdAt: DateTime
    }

    type SubmitChatRoomActionOutput {
        result: JSONObject
        trackingId: String
    }

    type ActionsOutput {
        actions: [ActionX]
        edges: [Edge]
        actionEdges: [ActionXEdge]
    }

    input ActionsInput {
        pageInput: PageInput
    }

    type ActionSheetOutput {
        actions: [ActionX] @deprecated(reason:"use ActionSheetOutput.actionEdges")
        edges: [Edge]
        actionEdges: [ActionXEdge]
    }

    enum CompletedActionType {
        ChatRoomAction
    }

    type CompletedActionsOutput {
        completedActions: [CompletedAction]
    }

    type CompletedAction {
        id: ID!
        entityType: EntityType!
        type: CompletedActionType!
        contextId: String!
        sessionUserId: String!
        actorEid: String!
        trackingId: String
        input: JSONObject
        output: JSONObject
        metadata: JSONObject
        createdAt: DateTime!
        updatedAt: DateTime!
    }

`
