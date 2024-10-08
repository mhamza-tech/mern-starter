/**
 * @rob4lderman
 * aug2019
 * 
 */
import { gql } from 'apollo-server'

const gqlActionResultType = gql`
    type ActionResult {
        id: ID
        userId: ID!
        unObjectId: ID!
        trackingId: String
        action: String!
        userAction: String!
        startState: String!
        endState: String!
        card: Card!
        newsfeedText: String
        emoji: String
        createdAt: DateTime
        session: Session
    }
`

const gqlStorylineType = gql`
    type Storyline {
        id: ID!
        unObjectId: ID!
        name: String!
        text: String
        imageUrl: String
        entryId: String
        entry: ContentfulEntry
        image: Image
        unObject: UnObject
        emoji: String
        session: Session
        myEdges: [Edge]
        edgeStats: [EdgeStats]
    }
`

const gqlCardType = gql`
    type Card {
        text: String
        imageUrl: String
        emoji: String
        entryId: String
        entry: ContentfulEntry
    }
    input CardInput {
        text: String
        emoji: String
        entryId: String
    }
`

const gqlActionStatsType = gql`
    type ActionStats {
        action: String!
        count: Int!
    }
`

const gqlSessionType = gql`
    type Session {
        state: String
        prevState: String
        action: String
        stateActionHistory: [String]
        availableActions: [String]
        actionStats: [ActionStats]
        userId: ID!
        unObjectId: ID!
    }
`

const gqlActionType = gql`
    """
    @deprecated(reason="use ActionX")
    """
    type Action {
        id: ID!
        createdByUserId: ID!
        storyboardId: ID!
        unObjectId: ID!
        startState: String!
        extendState: String
        buttonText: String!
        card: Card!
        newsfeedText: String
        endState: String!
        createdAt: DateTime!
        updatedAt: DateTime!
    }
    input ActionStubInput {
        id: ID!
        buttonText: String
    }
    """
    @deprecated(reason="use ActionXStub")
    """
    type ActionStub {
        id: ID!
        buttonText: String!
    }
    input ActionInput {
        startState: String!
        buttonText: String!
        card: CardInput!
        newsfeedText: String
        endState: String!
    }
`

const gqlStoryboardType = gql`
    type Storyboard {
        id: String!
        createdByUserId: String!
        unObjectId: String!
        name: String
        actions: [Action]!
        createdAt: DateTime!
        updatedAt: DateTime!
        myPlayerContext: PlayerContext!
        status: String
    }
`

const gqlPlayerContextType = gql`
    type PlayerContext {
        id: String!
        storyboardId: String!
        userId: String!
        currentState: String!
        actionStubs: [ActionStub]!
        metadata: JSONObject
        createdAt: DateTime!
        updatedAt: DateTime!
    }
`
 
const gqlActionWithContextType = gql`
    type ActionWithContext {
        id: ID
        actionId: String!
        action: Action!
        myPlayerContextId: String!
        myPlayerContext: PlayerContext!
        createdAt: DateTime
        createdByUserId: String!
        trackingId: String
    }
`
  
const gqlTrackingType = gql`
    input TrackingInput {
        trackingId: String!
    }
    type Tracking {
        trackingId: String! 
        actionResults: [ActionResult]
        actionWithContexts: [ActionWithContext]
        playerContexts: [PlayerContext]
        completedActions: [CompletedAction]
    }
`

const gqlContentfulEntryType = gql`
    type ContentfulEntry {
        sys: JSONObject
        fields: ContentfulEntryFields
    }
    type ContentfulEntryFields {
        description: String
        image: ContentfulImage
        tags: [String]
        backgroundColor: String
    }
    type ContentfulImage {
        sys: JSONObject
        fields: ContentfulImageFields
    }
    type ContentfulImageFields {
        title: String
        file: ContentfulImageFile
    }
    type ContentfulImageFile {
        url: String
        details: ContentfulImageFileDetails
        fileName: String
        contentType: String
    }
    type ContentfulImageFileDetails {
        size: Int
        image: ImageDims
    }
    type ImageDims {
        width: Int
        height: Int
    }
`

export const gqlImageType = gql`
    type Image {
        uri: String
        width: Int
        height: Int
        size: Int
        isDefault: Boolean
        backgroundColor: String
        s3Key: String
    }
    input ImageInput {
        width: Int
        height: Int
    }
`

export default gql`
    ${gqlActionResultType}
    ${gqlStorylineType}
    ${gqlCardType}
    ${gqlSessionType}
    ${gqlActionStatsType}
    ${gqlActionType}
    ${gqlStoryboardType}
    ${gqlPlayerContextType}
    ${gqlActionWithContextType}
    ${gqlTrackingType}
    ${gqlContentfulEntryType}
    ${gqlImageType}

    input DoActionInput {
        unObjectId: ID!
        action: String!
    }

    input IdInput {
        id: ID!
    }

    input CreateStoryboardInput {
        unObjectId: ID!
        actions: [ActionInput]!
    }

    input UpdateStoryboardStatusInput {
        id: ID!
        status: String!
    }

    type Query {
        storylines: [Storyline]
        storyline(input:IdInput!): Storyline
        actionResult(input:IdInput!): ActionResult
        actionWithContext(input:IdInput!): ActionWithContext
        suggestedStorylines(input:IdInput): [Storyline]
        storyboard(input:IdInput): Storyboard
        smTracking(input:TrackingInput!): Tracking!
    }

    type Mutation {
        doAction(input: DoActionInput!): ActionResult!
        playAction(input: ActionStubInput!): ActionWithContext!
        reset(unObjectId:ID!): Session!
        createStoryboard(input: CreateStoryboardInput!): Storyboard!
        createStoryboardEdgePublish(input:IdInput!): Storyboard!
        deleteStoryboardEdgePublish(input:IdInput!): Storyboard!
        createStoryboardEdgeDraft(input:IdInput!): Storyboard!
        updateStoryboardStatus(input:UpdateStoryboardStatusInput!): Storyboard!
        resetMyPlayerContext(input:IdInput!): PlayerContext!
    }
`
