import { 
  EntityScope,
  TileType,
  TileMetadata,
  SaveImageInput,
} from 'src/gql-types'

export interface SaveTileInputInContext {
  name: string
  type: TileType
  entryId?: string
  s3Key?: string
  isDeleted?: boolean
  metadata: object
  image?: SaveImageInput
}

/**
 * A template for declaring and creating Fields to be used by the handler code.
 * Fields can hold arbitrary game state.  See FieldType (in the GQL schema) for
 * the various types available.
 * 
 * scope: https://gitlab.com/unrealfun/docs/-/blob/master/GameState.md
 * 
 * NOTE: Fields are UNIQUELY IDENTIFIED in the DB by the name + scope + node-they-are-attached-to,
 * where "node-they-are-attached-to" is typically a User/UnObject/ChatRoom entity.
 */

/**
 * A template for declaring and creating Tiles to be used by the handler code.
 * Tiles are images and/or animations that you can size and place anywhere
 * on the ChatRoom canvas.
 * 
 * NOTE: Tiles, like Fields, are UNIQUELY IDENTIFIED in the DB by the 
 * name + scope + node-they-are-attached-to, where "node-they-are-attached-to" 
 * is typically a User/UnObject/ChatRoom entity.
 */
export interface TileTemplate {

  /**
   * Usually you'll use TileType.ImageTile.
   * For Tiles with built-in animations, use TileType.AnimationTile
   * See available TileTypes in GQL schema.
   */
  type: TileType

  /**
   * BE AWARE!!! The Tile name + scope is used to UNIQUELY IDENTIFY THE TILE IN THE DB.
   * If you change the name or scope during dev, you'll get a NEW TILE RECORD in the DB,
   * and your OLD TILE RECORD STILL EXISTS (and therefore will still show up if you haven't
   * explicitly called saveTile w/ isDeleted:true to delete it).
   */
  name: string

  /**
   * Defines the "scope" for the Tile, which basically corresponds to its visibility.
   *
   * EntityScope.GlobalScope: the Tile is visible throughout the app.  E.g. a Global Tile
   * applied to a User's profile will appear in every ChatRoom with that User.
   *
   * EntityScope.ChatRoomScope: aka "Local" scope, the Tile is visible in just the ChatRoom
   * in which it was applied.
   *
   * "Local" vs "Global" scope: https://gitlab.com/unrealfun/docs/-/blob/master/GameState.md
   */
  scope: EntityScope

  /**
   * Data about the Tile (its image, animation, containerStyle, etc)
   */
  metadata: TileMetadata

  /**
   * Delete the Tile.  This is a "soft-delete" in that the Tile is just marked deleted
   * in the DB and removed from the ChatRoom canvas.  You can "un-delete" the Tile by
   * setting isDeleted: false.
   */
  isDeleted?: boolean
}
