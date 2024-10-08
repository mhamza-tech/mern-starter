/**
 * @rob4lderman
 * mar2020
 */
import { gql } from 'apollo-server'

export default gql`

    type ContainerStyleV2 {
        top: Float
        right: Float
        bottom: Float
        left: Float
        width: Float
        height: Float
        zIndex: Int
        backgroundColor: String
        borderRadius: Int
        borderWidth: Int
        borderColor: String
        opacity: Float
        fullscreen: Boolean
    }

    enum TileType {
        ImageTile
        AnimationTile
        ActionTile
        TextTile
        WorldMapTile
    }

    type Tile {
        id: ID!
        entityType: EntityType!
        type: TileType!
        collectionId: String!
        scope: EntityScope
        name: String!
        thisEid: String
        thisEntityId: String
        thisEntityType: EntityType
        entryId: String
        metadata: TileMetadata
        isDeleted: Boolean!
        createdAt: DateTime!
        updatedAt: DateTime!
        recordVersion: Int!
        asActionTile: ActionTile
        isVisibleToMe: Boolean @deprecated(reason:"invalid: https://gitlab.com/unrealfun/docs/blob/master/GameState.md")
        isPrivate: Boolean
        isLocal: Boolean
    }

    type TileMetadata {
        """
        Optional name for the Tile.
        This is useful for multiple TileEffects within a SequenceEffect to
        reference the same Tile.
        """
        name: String

        """
        Optional Image to place in the Tile.
        The Image will have resizeMode='contain' when it is rendered.
        """
        image: Image

        """
        This is a straight-up React Native style object that is applied to the
        <View> component wrapping the Tile. Use absolute numeric positioning and
        sizing to configure the object.
        """
        containerStyle: ContainerStyleV2

        """
        An optional animation to run in the Tile.  
        The animation will run as soon as the Tile is rendered on the screen.
        """
        animation: AnimationEffectMetadata

        """
        An optional animation sequence to run in the Tile.  
        The animation seqeunce willrun as soon as the Tile is rendered on the screen.
        """
        animationSequence: AnimationSequence

        """
        For use with TileType.TextTiles.  This is the text that will appear in the
        <Text> component.
        """
        text: String

        """
        This is a straight-up React Native style object that is applied to the
        <Text> component for TileType.TextTiles.  
        """
        textStyle: JSONObject

        """
        Only used by WorldMapTiles.
        """
        playerEid: String

        """
        Only used by WorldMapTiles.
        """
        playerUsername: String

        """
        Resolves to the Player identified by playerEid.
        Only used by WorldMapTiles.
        """
        player: Player

        """
        The action to invoke after the tile has been tapped or clicked.
        """
        clickCallback: ActionCallback

        """
        Indicates if a tile should allow something to be dropped on it.
        """
        dropTarget: Boolean
    }

    input TileInput {
        name: String!
        collectionId: String
    }

    type TileOutput {
        tile: Tile
    }

    type ActionTile {
        image: Image
        action: ActionX
    }

    input SaveTileInput {
        type: TileType!
        collectionId: String!
        scope: EntityScope!
        thisEid: String!
        name: String!
        entryId: String
        s3Key: String
        metadata: JSONObject
        isDeleted: Boolean
        image: SaveImageInput
    }

    type SaveTileOutput {
        tile: Tile
    }

    input SaveImageInput {
        uri: String
        s3Key: String
    }

    type Mutation {
        saveTile(input:SaveTileInput!): SaveTileOutput!
    }
`
