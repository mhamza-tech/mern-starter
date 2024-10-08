/**
 * @rob4lderman
 * sep2019
 */
import { gql } from 'apollo-server'

export const gqlChannelType = gql`
    enum ChannelType {
        Collection
        Document
    }

    type Channel {
        channelId: String!
        channelType: ChannelType!
        name: String
        entityType: EntityType @deprecated(reason:"channels are no longer entity-specific. use ChannelOutput.entityType")
        isMyChannel: Boolean
    }

    input ChannelInput {
        channelId: String!
        channelType: ChannelType!
    }

    type DocChangeSnapshot {
        createTime: DateTime
        updateTime: DateTime
        readTime: DateTime
        id: String
        data: JSONObject
    }

    type ChannelOutput {
        channel: Channel!
        changeType: String
        snapshot: DocChangeSnapshot
        isArray: Boolean
        entityType: EntityType
        node: Node @deprecated(reason:"use ChannelOutput.asNode")
        field: Field @deprecated(reason:"use ChannelOutput.asField")
        edge: Edge @deprecated(reason:"use ChannelOutput.asEdge")
        asNode: Node @deprecated(reason:"use ChannelOutput.asNodes")
        asField: Field @deprecated(reason:"use ChannelOutput.asFields")
        asEdge: Edge @deprecated(reason:"use ChannelOutput.asEdges")
        asEdges: [Edge]
        asFields: [Field]
        asNodes: [Node]
        asFriendRequests: [FriendRequest]
        feedItem: FeedItem
    }

`

export default gql`

    type DocChange {
        collectionId: String!
        type: String!
        doc: JSONObject
    }

    input SubscriptionInput {
        collectionId: String!
    }

    type ActivityDocChange {
        collectionId: String!
        type: String!
        doc: Activity!
    }

    type EdgeDocChange {
        collectionId: String!
        type: String!
        doc: Edge!
    }

    ${gqlChannelType}

    type Subscription {
        collection(input:SubscriptionInput!): DocChange!
        channel(input:ChannelInput!): ChannelOutput!
        onCreateActivity: ActivityDocChange!
        onCreateEdge: EdgeDocChange!
    }
`
