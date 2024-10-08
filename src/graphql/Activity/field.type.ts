/**
 * @rob4lderman
 * mar2020
 */
import { gql } from 'apollo-server'

export default gql`
    input FieldsInput {
        pageInput: PageInput
        type: FieldType
        name: String
        collectionName: String
        collectionId: String
        thisEntityId: String
        thisEntityType: EntityType
    }

    type FieldsOutput {
        fields: [Field]!
        pageInfo: PageInfo!
    }

    input FieldInput {
        name: String!
        collectionId: String
    }

    type FieldOutput {
        field: Field
    }

    enum FieldType {
        DateField
        BooleanField
        NumberField
        StringField
        ChatRoomIsTyping
        ChatRoomLastViewedAt
        NewsfeedItemCard
        ActionsField
        AnimationField
        PresenceField
        JSONObjectField
        AvataaarField
        HashStatusField
        HashtributeField
        ProgressField
        CountdownField
        EdgesField
        ActionXEdgesField
        ActionXStubsField
        ButtonField
    }

    type Field {
        id: ID!
        entityType: EntityType
        collectionId: String!
        scope: EntityScope
        name: String!
        type: FieldType!
        thisEntityId: String!
        thisEntityType: EntityType!
        thisEntity: Node
        thisEid: String!
        recordVersion: Int!
        isDeleted: Boolean
        expiresAt: DateTime
        createdAt: DateTime
        updatedAt: DateTime
        metadata: JSONObject
        asBooleanField: BooleanField
        asDateField: DateField
        asNumberField: NumberField
        asChatRoomLastViewedAt: DateField
        asChatRoomIsTyping: BooleanField @deprecated(reason:"use Field.asBooleanField")
        asActionsField: ActionsField
        asPresenceField: PresenceField
        asJSONObjectField: JSONObject
        asHashStatusField: HashStatus
        asHashtributeField: HashtributeField
        asProgressField: ProgressField
        asCountdownField: CountdownField
        asAnimationField: AnimationField
        asEdgesField: EdgesField
        asActionXEdgesField: ActionXEdgesField
        asActionXStubsField: ActionXStubsField
        asXpField: NumberField @deprecated(reason:"use Field.asNumberField")
        asButtonField: ButtonField
        isMyField: Boolean
        isLocal: Boolean
        isPrivate: Boolean
        likesCount: Int @deprecated(reason:"this was for story which is now gone")
        myLikesCount: Int @deprecated(reason:"this was for story which is now gone")
    }

    type StoryStatusField {
        metadata: StoryStatusFieldMetadata @deprecated(reason:"going away")
    }

    type StoryStatusFieldMetadata {
        backgroundColor: String
        backgroundImage: Image
        overlayImage: Image!
        thumbnailImage: Image
        text: String
        title: String
        description: String
    }

    type StoryStatusFieldsOutput {
        storyStatusFields: [Field]!
    }

    type PresenceField {
        presenceType: PresenceType!
    }

    type ActionsField {
        actions: [ActionX]!
    }

    type BooleanField {
        booleanValue: Boolean!
    }

    type DateField {
        dateValue: DateTime!
    }

    type NumberField {
        numberValue: Int!
        delta: Int
    }

    type ProgressField {
        numberValue: Int
        color: String
        minValue: Int
        maxValue: Int
    }

    type ButtonField {
        """
        The action to invoke after the button is clicked.
        """
        actionName: String
        isDisabled: Boolean
    }

    enum CountdownFieldStyle {
      Stopwatch
      Ticker
    }
    
    type CountdownField {
      startDateTime: DateTime
      warnDateTime: DateTime
      dangerDateTime: DateTime
      expiryDateTime: DateTime
      style: CountdownFieldStyle
      image: Image,
      text: String
    } 

    type AnimationField {
        animationType: AnimationType
        sourceType: SourceType
        sourceUri: String
        startFrame: Int
        endFrame: Int
        loop: Boolean
        speed: Float
        tileId: String
        tile: Tile
    }

    type HashStatus {
        id: ID!
        name: String!
        player: Player
        isDeleted: Boolean
        metadata: HashStatusMetadata
    }

    type HashStatusMetadata {
        numberValue: Float!
        delta: Float!
        """
        This one is only incremented when manually changed (not due to decay)
        """
        changedAt: DateTime
        """
        All the following fields are calculated on read (and required).
        """
        color: String
        minValue: Int
        maxValue: Int
        displayName: String
        thumbImage: Image
        promotedImage: Image
        description: String
    }

    type HashtributeField {
        id: ID!
        name: String!
        numberValue: Int! @deprecated(reason:"use HashtributeField.metadata")
        color: String @deprecated(reason:"not used")
        level: Int! @deprecated(reason:"use HashtributeField.metadata")
        nextLevelThreshold: Int! @deprecated(reason:"use HashtributeField.metadata")
        delta: Int! @deprecated(reason:"use HashtributeField.metadata")
        displayName: String! @deprecated(reason:"use HashtributeField.metadata")
        description: String @deprecated(reason:"use HashtributeField.metadata")
        image: Image @deprecated(reason:"not used")
        thumbImage: Image @deprecated(reason:"use HashtributeField.metadata")
        promotedImage: Image @deprecated(reason:"use HashtributeField.metadata")
        isPromoted: Boolean @deprecated(reason:"not used")
        isDeleted: Boolean
        metadata: HashtributeFieldMetadata
    }

    type HashtributeFieldMetadata {
        numberValue: Int!
        delta: Int
        """
        All the following fields are calculated on read (and required).
        """
        level: Int
        prevLevelThreshold: Int
        thisLevelThreshold: Int
        nextLevelThreshold: Int
        displayName: String
        description: String
        thumbImage: Image
        promotedImage: Image
        silent: Boolean
        lastStarsDelta: Int @deprecated(reason:"about to be deleted")
    }

    type EdgesField {
        id: ID!
        edgeIds: [String]
        edges: [Edge]
    }

    type ActionXEdgesField {
        id: ID!
        edgeIds: [String]
        actionXIds: [String]
        actionEdges: [ActionXEdge]
        asField: Field
    }

    type ActionXStubsField {
        metadata: ActionXStubsFieldMetadata
    }

    """
    This is the format of the "currentActionStubs" Field used by ChatRooms 
    to configure a User's action sheet.
    """
    type ActionXStubsFieldMetadata {
        staticActionStubs: [ActionXStub]
        actionInstanceStubs: [ActionXStub]
    }

    type ActionXModifier {
      id: String!
      name: String!
      description: String
    }

    """
    ActionXStubs collect together an actionName along with the corresponding ActionX entity,
    plus a list of ActionXInstances for that action, owned by a particular Player (typically 
    the session User).  The frontend mostly deals with ActionXStubs via User.actionInventory
    and the "currentActionStubs" ActionXStubsField.
    "action" and "actionInstances" shouldn't be passed, they are filled by the resolver
    """
    type ActionXStub {
        actionName: String!
        isDisabled: Boolean
        action: ActionX
        actionInstances: [ActionXInstance]
        disabledUntil: DateTime
        isGivable: Boolean
        isUsable: Boolean
        modifiers: [ActionXModifier!]
    }

    type HashtributesOutput {
        hashtributes: [HashtributeField]
    }

    input CreateFieldInput {
        collectionId: String!
        thisEntityId: ID!
        thisEntityType: EntityType!
        type: FieldType!
        name: String
        collectionName: String
        metadata: JSONObject
    }

    type CreateFieldOutput {
        field: Field
    }

    input SaveFieldInput {
        id: String
        collectionId: String!
        scope: EntityScope!
        thisEntityId: ID!
        thisEntityType: EntityType!
        type: FieldType!
        name: String
        collectionName: String
        metadata: JSONObject
        isDeleted: Boolean
        expiresAt: DateTime
    }

    type SaveFieldOutput {
        field: Field
    }

    type Mutation {
        createField(input:CreateFieldInput!): CreateFieldOutput!
        saveField(input:SaveFieldInput!): SaveFieldOutput!
    }
`
