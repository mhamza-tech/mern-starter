import {
  ActionCallback as GQLActionCallback,
  EntityScope,
  FieldType,
  ButtonField as GQLButtonField,
  CountdownField,
  HashStatusMetadata,
  HashtributeFieldMetadata as GQLHashtributeFieldMetadata,
  SoundEffect as GQLSoundEffect,
  Image as GQLImage,
  AnimationType,
  TileMetadata as GQLTileMetadata,
  AnimationSequence as GQLAnimationSequence,
  SystemMessageEffectMetadata as GQLSystemMessageEffectMetadata,
  AnimationEffectMetadata as GQLAnimationEffectMetadata,
  AnimationSequenceEffectMetadata as GQLAnimationSequenceEffectMetadata,
  ConcurrentEffectMetadata as GQLConcurrentEffectMetadata,
  ContainerStyleV2 as GQLContainerStyle,
  NativeAnimations,
  SpriteAnimations,
} from 'src/gql-types'
import { ReactNativeAnimations } from 'src/maker/animations/react-native-animations'
import { User, UnObject, ChatRoom } from 'src/db/entity'

export type ActionCallback = CleanGQLMetadataRecursive<GQLActionCallback>
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
type OmitDistributive<T, K> = T extends any ? (T extends object ? Id<OmitRecursively<T, K>> : T) : never;
type Id<T> = {} & { [P in keyof T]: T[P] } // Cosmetic use only makes the tooltips expad the type can be removed 
export type OmitRecursively<T extends any, K> = Omit<{ [P in keyof T]: OmitDistributive<T[P], K> }, K>
export type CleanGQLMetadata<T> = Omit<T, '__typename'>
export type CleanGQLMetadataRecursive<T> = OmitRecursively<T, '__typename'>

export type ButtonFieldMetadata = CleanGQLMetadata<GQLButtonField>
export type CountdownFieldMetadata = CleanGQLMetadataRecursive<CountdownField>
export type HashStatusFieldMetadata = CleanGQLMetadataRecursive<HashStatusMetadata>
export type HashtributeFieldMetadata = CleanGQLMetadataRecursive<GQLHashtributeFieldMetadata>
export type Image = CleanGQLMetadataRecursive<GQLImage>
export interface SystemMessageEffectMetadata extends CleanGQLMetadataRecursive<GQLSystemMessageEffectMetadata> {
  image?: Image
}
export type SoundEffectMetadata = CleanGQLMetadataRecursive<GQLSoundEffect>

type SpriteAnimationMeta = { animationType: AnimationType.SpriteAnimation; animation: SpriteAnimations } & GQLAnimationEffectMetadata
type NativeAnimationMeta = { animationType: AnimationType.NativeAnimation; animation: NativeAnimations } & GQLAnimationEffectMetadata
type NativeAnimatableAnimation = { animationType: AnimationType.NativeAnimatableAnimation; animation: ReactNativeAnimations } & GQLAnimationEffectMetadata
type SourcedAnimationMeta = { animationType: AnimationType.SourcedAnimation; sourceUri: string } & GQLAnimationEffectMetadata
export type ConcurrentEffectMetadata = CleanGQLMetadataRecursive<GQLConcurrentEffectMetadata>

export type AnimationEffectMetadata = CleanGQLMetadata<NativeAnimationMeta | NativeAnimatableAnimation | SourcedAnimationMeta | SpriteAnimationMeta>
export interface AnimationSequence extends CleanGQLMetadataRecursive<GQLAnimationSequence> {
  animations?: AnimationEffectMetadata[]
}

export interface AnimationSequenceEffectMetadata extends CleanGQLMetadataRecursive<GQLAnimationSequenceEffectMetadata> {
  animationSequence?: AnimationSequence
}

export type ContainerStyle = CleanGQLMetadata<GQLContainerStyle>
export interface TileMetadata extends CleanGQLMetadataRecursive<GQLTileMetadata> {
  animation?: AnimationEffectMetadata
  containerStyle?: ContainerStyle
}

export interface PercentileFn {
  percentile: number
  do: Function
}

export enum Tag {
  Secret,
  Physical,
  Visible,
  Incrementable,
  Trait,
  Status,
  Health,
  Sick,
}
// TODO: need a better name for this.
export type GameNode = User | UnObject | ChatRoom;

export interface NumberFieldMetadata {
  numberValue: number
  delta?: number
}

export interface SetStateInput {
  type: FieldType
  name: string
  scope?: EntityScope
  collectionName?: string
  metadata?: any
  isDeleted?: boolean
  expiresAt?: Date
}

export type SetGlobalStateInput = SetStateInput;
export type SetLocalStateInput = SetStateInput;
