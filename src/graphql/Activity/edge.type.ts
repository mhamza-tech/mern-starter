/**
 * @rob4lderman
 * mar2020
 */
import { gql } from 'apollo-server'

export default gql`
    enum EdgeType {
        Likes
        FriendRequest
        Friend
        Follows
        Actor
        UnObject
        NamedEdge
        ChatRoom
        ActionX
        Tile
        Interest
        Player
        NewsfeedItem
        Block
        ReactionEdge
        SmartCard
    }

    type Edge {
        id: ID!
        entityType: EntityType!
        thisEntityId: ID!
        thisEntityType: EntityType!
        thisEid: String!
        thatEntityId: ID!
        thatEntityType: EntityType!
        thatEid: String!
        edgeType: EdgeType!
        metadata: JSONObject
        name: String
        order: String
        sortKey1: String
        sortKey2: String
        collectionName: String
        collectionId: String
        isDeleted: Boolean
        count: Int
        createdAt: DateTime!
        updatedAt: DateTime!
        recordVersion: Int!
        thatEntity: Node
        thisEntity: Node
        asActionXEdge: ActionXEdge
        asReactionEdge: ReactionEdge
    }

    type ActionXEdge {
        id: ID!
        action: ActionX
        isDisabled: Boolean
        name: String
        quantity: Int
        order: String
        sortKey1: String
        sortKey2: String
        isDeleted: Boolean
        playedCount: Int
        lastPlayedAt: DateTime
        createdAt: DateTime!
        updatedAt: DateTime!
        recordVersion: Int!
        metadata: ActionXEdgeMetadata
    }

    type ActionXEdgeMetadata {
        isDisabled: Boolean
        quantity: Int
        lastPlayedAt: DateTime
        playedCount: Int
    }

    type ReactionEdge {
        action: ActionX
    }

    input CreateEdgeInput {
        thisEntityId: ID!
        thisEntityType: EntityType!
        thatEntityId: ID!
        thatEntityType: EntityType!
        edgeType: EdgeType!
        name: String
        collectionName: String
        collectionId: String
        metadata: JSONObject
        order: String
        sortKey1: String
        sortKey2: String
        updatedAt: DateTime
    }

    type CreateEdgeOutput {
        edge: Edge
    }

    input SaveEdgeInput {
        id: String
        thisEntityId: ID!
        thisEntityType: EntityType!
        thatEntityId: ID!
        thatEntityType: EntityType!
        edgeType: EdgeType!
        name: String
        collectionName: String
        collectionId: String
        metadata: JSONObject
        isDeleted: Boolean
        order: String
        sortKey1: String
        sortKey2: String
        updatedAt: DateTime
    }

    type SaveEdgeOutput {
        edge: Edge
    }

    input SaveThatEdgeInput {
        id: String
        thatEntityId: ID!
        thatEntityType: EntityType!
        edgeType: EdgeType!
        name: String
        collectionName: String
        metadata: JSONObject
        isDeleted: Boolean
        order: String
        sortKey1: String
        sortKey2: String
    }

    input EdgeInput {
        thisEntityId: String!
        thatEntityId: String!
        edgeType: EdgeType!
    }

    input EdgesInput {
        pageInput: PageInput
        edgeType: EdgeType
        thisEntityId: String
        thisEntityType: EntityType
        thatEntityId: String
        thatEntityType: EntityType
        name: String
        collectionId: String
        collectionName: String
    }

    type EdgesOutput {
        edges: [Edge]!
        pageInfo: PageInfo!
    }

    enum EdgeDirection {
        Inbound
        Outbound
    }

    type EdgeStats {
        entityId: ID!
        edgeDirection: EdgeDirection!
        edgeType: EdgeType!
        count: Int
    }

    input EdgeStatsInput {
        pageInput: PageInput
        entityId: ID
        edgeDirection: EdgeDirection
        edgeType: EdgeType
    }

    type EdgeStatsOutput {
        edgeStats: [EdgeStats]!
        pageInfo: PageInfo!
    }

    input CreateUserEdgeInput {
        thatEntityId: ID!
        thatEntityType: EntityType!
        edgeType: EdgeType!
        metadata: JSONObject
    }

    input DeleteUserEdgeInput {
        thatEntityId: ID!
        edgeType: EdgeType!
    }

    type Query {
        edgeStats(input:EntityInput!): [EdgeStats]!
        edges(input:EdgesInput): EdgesOutput!
        userEdges(input:UserEntityInput!): [Edge]
        myEdges(input:EntityInput!): [Edge]
    }

    type Mutation {
        createUserEdge(input:CreateUserEdgeInput!): Edge
        createEdge(input:CreateEdgeInput!): CreateEdgeOutput!
        saveEdge(input:SaveEdgeInput!): SaveEdgeOutput!
        deleteUserEdge(input:DeleteUserEdgeInput!): Boolean
    }
`
