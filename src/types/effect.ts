import {
  ActionX,
  EffectType,
  EntityScope,
  Field,
  ModalEffectCustomData,
  Player as GQLPlayer,
  SequenceEffectMetadata,
  ModalEffectMetadata as GQLModalEffectMetadata,
  SequenceEffectItemMetadata as GQLSequenceEffectItemMetadata,
} from 'src/gql-types'
import {
  ActionCallback,
  AnimationEffectMetadata,
  AnimationSequenceEffectMetadata,
  CleanGQLMetadata,
  CleanGQLMetadataRecursive,
  SystemMessageEffectMetadata,
  SoundEffectMetadata,
  ConcurrentEffectMetadata,
  TileMetadata,
} from './misc'
import { ItemName, Item } from 'src/domain/items'
import { MoveName, Move } from 'src/domain/moves'
import { UserStateId, UserState } from 'src/domain/userStates'
import { HashtributeId, Hashtribute } from 'src/domain/hashtributes'
import { NewsfeedItemContext } from './newsfeed'
import { StringTags } from 'src/domain/strings'
import { NodeApi } from 'src/maker/types'

export interface InteractionEffectMetadata {
  actor?: GQLPlayer
  hashStatus?: Field
  action?: ActionX
  text?: string
}

export type EffectMetadata =
  AnimationEffectMetadata
  | SystemMessageEffectMetadata
  | SoundEffectMetadata
  | InteractionEffectMetadata
  | AnimationSequenceEffectMetadata
  | SequenceEffectMetadata
  | ConcurrentEffectMetadata
  | ModalEffectMetadata
  | TileMetadata
 
/**
 * A template for declaring and creating Effects.  Effects are things
 * like animations, sound effects, system messages.  
 * 
 * A defining characteristic of an Effect is that it's ephemeral -- it happens 
 * once, when you create it, and that's it.
 */
export interface EffectTemplate<TMetadata extends EffectMetadata> {

  /**
   * See EffectType in GQL schema.
   */
  type: EffectType

  /**
   * See discussion of scope on TileTemplate.
   */
  scope: EntityScope

  /**
   * The data describing the effect (the animation, the system message text, etc).
   */
  metadata?: TMetadata
}

export interface ModalEffectMetadata<TCustomData = {}> extends CleanGQLMetadataRecursive<GQLModalEffectMetadata> {
  metadata?: TCustomData
}

export interface ModalEffectTemplate<TCustomData extends ModalEffectCustomData = {}> extends EffectTemplate<ModalEffectMetadata<TCustomData>> {
  metadata?: ModalEffectMetadata<TCustomData>
}

export type SequenceEffectItemMetadata = CleanGQLMetadata<GQLSequenceEffectItemMetadata>

export interface SequenceEffectItemTemplate<TMetadata extends SequenceEffectItemMetadata> {
  /** Indicates the effect type and corresponding metadata type. */
  type: EffectType

  /** The type of the metadata corresponds to the EffectType. */
  metadata?: TMetadata

  /**
   * Indicates whether to wait for a user tap before proceeding
   * to the next SequenceEffectItem
   */
  waitForTap?: boolean

  /**
   * Indicates whether to remove the artifacts associated with
   * this SequenceEffectItem from the screen when it is finished.
   */
  isDeletedOnFinish?: boolean

  /**
   * The action to submit when the SequenceEffectItem finishes.
   * If waitForTap = true, the action is submitted after the tap.
   */
  actionCallback?: ActionCallback
}

export interface HandlebarsValues extends Partial<NewsfeedItemContext> {
  // For each, you can pass one or the other
  itemName?: ItemName
  item?: Item
  moveName?: MoveName
  move?: Move
  userStateId?: UserStateId
  userState?: UserState
  hashtributeId?: HashtributeId
  hashtribute?: Hashtribute
  value?: number
  isYou?: boolean
}

export interface SendMessageInput {
  text?: string
  tags?: StringTags
  optional?: StringTags
  values?: HandlebarsValues
  from?: NodeApi
  metadata?: SystemMessageEffectMetadata
}
