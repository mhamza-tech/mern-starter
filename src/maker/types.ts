/**
 * @rob4lderman
 * oct2019
 * 
 */

import {
  FieldType,
  TileType,
  SaveImageInput,
  EntityScope,
  Image as GQLImage,
  CountdownField as GQLCountdownField,
  SoundEffect as GQLSoundEffect,
  ModalEffect as GQLModalEffect,
  ModalTexts as GQLModalTexts,
  ModalImages as GQLModalImages,
  ModalButton as GQLModalButton,
  ModalButtons as GQLModalButtons,
  ModalAnimatons as GQLModalAnimations,
  SwippableCardsModalCustomData as GQLSwippableCardsModalCustomData,
  ModalSwipeCard as GQLModalSwipeCard,
  ContainerStyleV2 as GQLContainerStyle,
  SourceType,
  ActionXStub as GQLActionXStub,
  VibrationEffectMetadata as GQLVibrationEffectMetadata,
  SystemMessageEffectMetadata as GQLSystemMessageEffectMetadata,
  ConcurrentEffectMetadata as GQLConcurrentEffectMetadata,
  ButtonField as GQLButtonField,
} from '../gql-types'
import { ActionX as _ActionX } from '../db/entity'
import { BeforeEnterAsset } from 'src/enginev3/types'
import { 
  CleanGQLMetadata,
  CleanGQLMetadataRecursive,
  ChatRoomActionContextApi,
  FieldTemplate,
} from 'src/types'
import { NPCId } from 'src/domain/npcs'
export * from 'src/types'

export type ModalEffect = CleanGQLMetadataRecursive<GQLModalEffect>
export type ModalTexts = CleanGQLMetadataRecursive<GQLModalTexts>
export type ModalAnimations = CleanGQLMetadataRecursive<GQLModalAnimations>
export type ModalImages = CleanGQLMetadataRecursive<GQLModalImages>
export type ModalButtons = CleanGQLMetadataRecursive<GQLModalButtons>
export type ModalButton = CleanGQLMetadataRecursive<GQLModalButton>
export type SwippableCardsModalCustomData = CleanGQLMetadata<GQLSwippableCardsModalCustomData>
export type ModalSwipeCard = CleanGQLMetadataRecursive<GQLModalSwipeCard>
export type ConcurrentEffectMetadata = CleanGQLMetadataRecursive<GQLConcurrentEffectMetadata>
export type ActionX = _ActionX;
export type ActionXStub = CleanGQLMetadata<GQLActionXStub>;
export type ContainerStyle = CleanGQLMetadata<GQLContainerStyle>

export { SourceType }
export { ModalType, ModalPosition } from '../gql-types'

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

export interface Action {
  id?: string
  name: string
  unObjectId?: string
  text: string
  description: string
  isEnabled?: boolean
  backgroundColor?: string
  package?: string
  tags?: string[]
  // TODO: image?
}

export interface SaveTileInputInContext {
  name: string
  type: TileType
  entryId?: string
  s3Key?: string
  isDeleted?: boolean
  metadata: object
  image?: SaveImageInput
}

export type ActionResolverFn = (contextApi: ChatRoomActionContextApi, args: any) => Promise<any>;

type ActionResolverBeforeEnter = (contextApi: ChatRoomActionContextApi, args: any) => Promise<BeforeEnterAsset[]>;

export interface ActionResolverMap {
  [key: string]: ActionResolverFn
}

export interface UnrealOnEnter {
  /**
   * Called whenever a user enters a chat room with this NPC.
   */
  onEnter: ActionResolverFn
}

export interface UnrealOnReset {
  /**
   * This method is not called by the runtime (yet), but some handler modules
   * have wired up an "onReset" function to the action 'Action.Debug.Reset'.
   */
  onReset: ActionResolverFn
}

/**
 * All handler modules export an ActionResolver object.
 */
export interface ActionResolver extends UnrealOnEnter, UnrealOnEnter, Partial<UnrealOnReset> {

  /**
   * Event triggered when receiving keyboard input from a room
   */
  onComment?: ActionResolverFn

  /**
   * The NPC's unObjectId ("NPCs" are aka "UnObjects").
   */
  unObjectId?: NPCId

  /**
   * For ActionResolvers associated with User's (instead of NPC's),
   * this field identifies the username of the associated User.
   * (Note that usernames are unique).
   */
  username?: string

  /**
   * First call whenever a user enters a chat room with this NPC.
   */
  onBeforeEnter?: ActionResolverBeforeEnter

  /**
   * Called whenever a user enters a chat room with this NPC.
   */
  onEnter: ActionResolverFn

  /**
   * Called whenever a user exits a chat room with this NPC.
   */
  onExit?: ActionResolverFn

  /**
   * Called at server startup.
   * The handler module should register itself with the action router in this method
   * (via registerReactionFnMap).
   */
  onLoad?: () => Promise<any>
}

/**
 * Used with NodeApi.setGlobalAction, setLocalAction.
 * "Global" actions are available in every ChatRoom.
 * "Local" actions are available in a specific ChatRoom.
 */
export interface SetActionInput {

  /**
   * The ActionX name.  Corresponds to the name defined in the YAML file.
   */
  name: string

  /**
   * An optional quantity for the action.  A non-zero quantity shows up
   * in the action sheet as a gray badge w/ a number in it.
   */
  quantity?: number

  /**
   * Mark the action deleted.
   * Note that the action is deleted only for the User you're invoking this against.
   */
  isDeleted?: boolean

  /**
   * Greys out the action in the action sheet.
   */
  isDisabled?: boolean

  /**
   * Controls the display order of the action.
   */
  order?: string
}

// https://stackoverflow.com/questions/54542318/using-an-enum-as-a-dictionary-key
export type EnumDictionary<T extends string | symbol | number, U> = {
  [K in T]: U
}

// export type ActionCallback = CleanGQLMetadataRecursive<GQLActionCallback>
export type VibrationEffectMetadata = CleanGQLMetadataRecursive<GQLVibrationEffectMetadata>
export type SoundEffectMetadata = CleanGQLMetadataRecursive<GQLSoundEffect>
export type Image = CleanGQLMetadataRecursive<GQLImage>
export interface SystemMessageEffectMetadata extends CleanGQLMetadataRecursive<GQLSystemMessageEffectMetadata> {
  image?: Image
}

export type ButtonFieldMetadata = CleanGQLMetadata<GQLButtonField>

export enum ButtonFieldNames {
  // Each will be mapped to a UI button in the FE
  Reset = 'reset'
}

export type JsonObjectFieldMetadata = any;

export interface StringFieldMetadata {
  stringValue: string
}

export interface NumberFieldMetadata {
  numberValue: number
  delta?: number
}

export type CountdownFieldMetadata = CleanGQLMetadataRecursive<GQLCountdownField>

export interface WithMetadata {
  metadata?: any
}

/**
 * The template for creating jobs.
 * The job is scheduled to run the given actionName at time dispatchAt.
 */
export interface JobTemplate {
  id: string
  actionName: string
  dispatchAt: Date
  args?: Record<string, unknown>
}

/**
 * ActionStubSet(s) are used for setting the action sheet in the ChatRoom.
 * You can pass in action names or the full ActionXStub objects.
 *
 * An ActionStubSet contains arrays of action names and ActionXStub:
 *      1. staticActionNames
 *      2. actionInstanceNames
 *      3. staticActionStubs
 *      4. actionInstanceStubs
 *
 * The main difference between "static actions" and "action instances" is whether
 * or not an individual "instance" of the action is required in the user's action inventory,
 * before the action will be rendered in the action sheet.
 * 
 * "static actions" do not require an action instance. Any actions included in staticActionNames
 * will always show up in the action sheet.  
 * 
 * "action instances" require an action instance; i.e. the user must have an instance of that 
 * action in their inventory.  Otherwise the action will not be rendered in the action sheet.  
 * 
 * Action instances can be created and added to a user's inventory via NodeApi.createActionInstance.
 * Action instances can also be transferred between users via NodeApi.transferActionInstance.
 * (see examples in kitchesink.ts).
 */
export interface ActionStubSet {
  staticActionNames?: string[]
  actionInstanceNames?: string[]
  staticActionStubs?: ActionXStub[]
  actionInstanceStubs?: ActionXStub[]
}

export interface ActionStubSetMap {
  [key: string]: ActionStubSet
}

export interface FieldTemplateFactory<TMetadata> {
  toFieldTemplate(): FieldTemplate<TMetadata>
}
