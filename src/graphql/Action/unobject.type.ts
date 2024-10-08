/**
 * @rob4lderman
 * aug2019
 * 
 */
import { gql } from 'apollo-server'

// 10/13/2019: note: removed all the '!' from this type to be backwards-compatible
// with some denormalized data stored in Activity.metadata
export default gql`
    type UnObject {
        id: ID!
        eid: String!
        name: String
        username: String!
        text: String @deprecated(reason:"use UnObject.description")
        description: String
        emoji: String
        entryId: String
        s3Key: String
        gradientS3Key: String
        backgroundS3Key: String
        coverS3Key: String
        handlerUnObjectId: String
        entry: ContentfulEntry
        image(input:ImageInput): Image
        gradientImage(input:ImageInput): Image
        backgroundImage: Image
        coverImage: Image
        entityType: EntityType!
        createdByUserId: ID!
        createdByUser: User
        createdAt: DateTime!
        updatedAt: DateTime!
        publishedStoryboard: Storyboard
        draftStoryboard: Storyboard
        storyboards: [Storyboard]
        myEdges: [Edge]
        edgeStats: [EdgeStats]
        asNode: Node
        field(input:FieldInput!): FieldOutput
        chatRooms: ChatRoomsOutput
        level: Int
        presence: PresenceType
        isMyUnObject: Boolean
        actionSheet: ActionSheetOutput
        tiles: TilesOutput
        privateTiles: TilesOutput
        backgroundColor: String
        hashtribute: String
        actionSheetBackgroundColor: String
        showBackpack: Boolean!
        showControlBar: Boolean! @deprecated(reason:"to be deleted soon")
        showResetButton: Boolean!
        allowHashtributeNotifications: Boolean!
        disableButtonsUponAction: Boolean!
        minOccupancy: Int!
        maxOccupancy: Int
        reactionEdges: ReactionEdgesOutput
        xpField: NumberField
        bio: String
        unObjectType: UnObjectType!
        isFeatured: Boolean!
        featuredSortKey: String
        isDeleted: Boolean!
        hashtributes: HashtributesOutput
        location: Location @deprecated(reason:"use UnObject.worldMapLocation")
        worldMapLocation: Location
        isFollowedByMe: Boolean @deprecated(reason: "Use \`isFollowed\`")
        following: Boolean @deprecated(reason: "Use \`isFollowing\`")
        isFollowed: Boolean
        isFollowing: Boolean
        socialTitle: String
        socialDescription: String
        socialImageS3Key: String
        socialImage: Image
        activity: UnObjectActivity
        fakeData: JSONObject
        showAvatarDropZone: Boolean
        isDestination: Boolean!
        states: [HashStatus!]
    }

    enum UnObjectType {
        UnObject
        Place
    }

    type UnObjectsOutput {
        unObjects: [UnObject]
    }

    type ReactionEdgesOutput {
        reactionEdges: [ReactionEdge]
        edges: [Edge]
    }

    input CreateUnObjectInput {
        name: String!
        description: String
        emoji: String
        entryId: String
        s3Key: String
    }

    input UpdateUnObjectInput {
        id: ID!
        name: String
        description: String
        emoji: String
        entryId: String
        s3Key: String
    }

    input CreateHandledUnObjectInput {
        handlerUnObjectId: String!
        name: String
        description: String
        isMakerVisible: Boolean
        convoStarter: String
    }

    type CreateHandledUnObjectOutput {
        unObject: UnObject
    }

    type HandlerUnObjectsOutput {
        handlerUnObjects: [UnObject]
    }

    input UnObjectsInput {
        minOccupancy: Int
        maxOccupancy: Int
        isDestination: Boolean
        isFeatured: Boolean
        pageInput: PageInput
    }

    input FeaturedHandlerUnObjectsInput {
      minOccupancy: Int
      maxOccupancy: Int
    }

    type UnObjectsOutput {
        unObjects: [UnObject]
        pageInfo: PageInfo!
    }
    
    input UnObjectInput {
      id: ID
      username: String
    }
    
    type UnObjectActivity {
      likesCount: Int!
      comments: [UnObjectActivityComment!]!
    }
    
    type UnObjectActivityComment {
      id: ID!
      text: String!
      author: UnObjectActivityAuthor!
    }
    
    type UnObjectActivityAuthor {
       id: ID!
       displayName: String!
       avatarURL: String!
    }

    type Query {
        unObject(input: UnObjectInput!): UnObject
        myUnObjects: [UnObject]
        handlerUnObjects: HandlerUnObjectsOutput!
        featuredHandlerUnObjects(input: FeaturedHandlerUnObjectsInput): HandlerUnObjectsOutput! @deprecated(reason: "Use unObjects")
        unObjects(input: UnObjectsInput): UnObjectsOutput!
    }

    type Mutation {
        createHandledUnObject(input: CreateHandledUnObjectInput!): CreateHandledUnObjectOutput!
        createUnObject(input: CreateUnObjectInput!): UnObject!
        updateUnObject(input: UpdateUnObjectInput!): UnObject!
    }
`
