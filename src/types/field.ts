import {
  ActionXStubsFieldMetadata,
  EntityScope,
  FieldType,
  StoryStatusFieldMetadata,
} from 'src/gql-types'

import {
  HashStatusFieldMetadata,
  HashtributeFieldMetadata,
  CountdownFieldMetadata,
  ButtonFieldMetadata,
  NumberFieldMetadata,
} from './misc'
export type JsonObjectFieldMetadata = any;

export interface StringFieldMetadata {
  stringValue: string
}

// export interface NumberFieldMetadata {
//   numberValue: number
//   delta?: number
// }

export type FieldMetadata =
  HashStatusFieldMetadata
  | HashtributeFieldMetadata
  | JsonObjectFieldMetadata
  | StringFieldMetadata
  | NumberFieldMetadata
  | StoryStatusFieldMetadata
  | ActionXStubsFieldMetadata
  | CountdownFieldMetadata
  | ButtonFieldMetadata

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
export interface FieldTemplate<TMetadata extends FieldMetadata> {

  /**
   * See available FieldTypes in GQL schema.
   */
  type: FieldType

  /**
   * The Field name. Fields are uniquely identified by
   */
  name: string

  /**
   * Optional collectionName, for grouping Fields together.
   * This is mostly used by the underlying runtime and you'll probably won't need
   * to use this in the handler module.
   */
  collectionName?: string

  /**
   * Defines the "scope" for the Field, which basically corresponds to its accessibility
   * in the handler code (similar to lexical scope in source code).
   *
   * EntityScope.GlobalScope: the Field is accessible throughout the app.
   * E.g. a Global Field applied in one ChatRoom/handler module is readable/updatable in another
   * ChatRoom/handler module.
   *
   * EntityScope.ChatRoomScope: aka "Local" scope, the Field is accessible in just the
   * ChatRoom/handler module where it was created.
   *
   * "Local" vs "Global" scope: https://gitlab.com/unrealfun/docs/-/blob/master/GameState.md
   */
  scope: EntityScope

  /**
   * The actual game state data is stored in the metadata ("metadata" isn't the best name for
   * it, but oh well).  The type/schema of the metadata is determined by the FieldType
   * (although this is not that strictly enforced at the moment).
   */
  metadata?: TMetadata

  /**
   * "Soft-delete" the Field.  You can "un-delete" a Field by setting isDeleted: false.
   */
  isDeleted?: boolean

  /**
   * Set an "expiration" time for the Field.  The Field will be soft-deleted when it expires.
   */
  expiresAt?: Date
}
