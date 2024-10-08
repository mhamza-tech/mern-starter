/**
 * @rob4lderman
 * aug2019
 */
import { gql } from 'apollo-server'

const gqlEventType = gql`
    input PublishEventInput {
        type: String!
        event: JSONObject!
    }
`

export default gql`

    input ActionResultInput {
        actionResultId: ID!
        userId: ID!
        unObjectId: ID!
        trackingId: String
    }

    input UserEntityInput {
        userId: ID!
        entityId: ID!
    }

    input EntityInput {
        entityId: ID!
    }

    input NewsfeedPageInput {
        page: Int
    }

    input NewsfeedTimestampInput {
        timestamp: DateTime
        limit: Int
    }

    union ActivityMetadata = ActivityMetadataActionWithContext | ActivityMetadataActionResult 

    type ActivityMetadataActionWithContext {
        user: User
        unObject: UnObject
        actionWithContext: ActionWithContext
        mustache: JSONObject
    }

    type ActivityMetadataActionResult {
        user: User
        unObject: UnObject
        actionResult: ActionResult
        mustache: JSONObject
    }

    type Activity {
        id: ID!
        actionResultId: ID
        userId: ID
        unObjectId: ID
        trackingId: String
        activityType: String!
        metadata: ActivityMetadata
        updatedAt: DateTime!
        createdAt: DateTime!
        edgeStats: [EdgeStats]
        myEdges: [Edge]
    }

    ${gqlEventType}

    type Query {
        newsfeed(input:NewsfeedPageInput): [Activity]
        newsfeedNewerThan(input:NewsfeedTimestampInput): [Activity]
        newsfeedOlderThan(input:NewsfeedTimestampInput): [Activity]
    }

    type Mutation {
        newActionResult(input:ActionResultInput!): Activity
    }
`
