import {
  ActionXStub,
  ActionXInstanceTemplate as GQLActionXInstanceTemplate,
  ActionXInstanceTransferTemplate as GQLActionXInstanceTransferTemplate,
} from 'src/gql-types'
import { FieldTemplate } from './field'
import { CleanGQLMetadata } from 'src/types/misc'

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

export interface ActionXInstanceReplaceTemplate extends GQLActionXInstanceTemplate {
  toActionName: string
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

export type ActionXInstanceTemplate = CleanGQLMetadata<GQLActionXInstanceTemplate>

export type ActionXInstanceTransferTemplate = CleanGQLMetadata<GQLActionXInstanceTransferTemplate>
