/**
 * @rob4lderman
 * aug2019
 */

export interface GqlResponse {
  data: any
  errors: any[]
}

export interface ActionResultInput {
  actionResultId: string
  userId: string
  unObjectId: string
  trackingId: string
}

export interface ActionResult {
  id: string
  userId: string
  unObjectId: string
  trackingId: string
}

export interface UpdateUserInput {
  userId: string
  updatedFields: UpdateUserFields
}

export interface UpdateUserFields {
  tempEmail?: string
}

export interface UserInput {
  userId: string
}

export interface SignUpInput {
  email: string
  password?: string
  displayName: string
}

export interface SignInInput {
  username?: string
  email?: string
  password: string
}

export interface SignInResult {
  user: any
  token: string
}

export interface IdInput {
  id: string
}

export interface DoActionInput {
  unObjectId: string
  action: string
}

export interface UserEntityInput {
  userId: string
  entityId: string
}

export interface EntityInput {
  entityId: string
}

export interface NewsfeedTimestampInput {
  timestamp?: Date
  limit?: number
}

export interface CreateUserEdgeInput {
  thatEntityId: string
  thatEntityType: string
  edgeType: string
  metadata?: object
}

export interface DeleteUserEdgeInput {
  thatEntityId: string
  edgeType: string
}

export interface GqlError {
  message: string
  extensions?: object
}

export interface ForgotPasswordInput {
  username?: string
  email?: string
}

export interface ResetPasswordInput {
  resetPasswordToken: string
  password: string
}

export interface ConfirmEmailInput {
  confirmEmailToken: string
  password?: string
}

export interface UpdateEmailInput {
  email: string
  password: string
}

export interface UpdatePasswordInput {
  oldPassword: string
  newPassword: string
}

export interface ActionWithContextCreatedEvent {
  type: string
  source: string
  sessionUserId: string
  actionWithContextId: string
  actionWithContext?: object
  unObjectId: string
  unObject?: object
  trackingId?: string
}

export interface PublishEventInput {
  type: string
  event: object
}

export interface ActionStubInput {
  id: string
  buttonText?: string
}

export interface CreateUnObjectInput {
  name: string
  text: string
  emoji?: string
  entryId?: string
} 

export interface CardInput {
  text?: string
  emoji?: string
  entryId?: string
}

export interface ActionInput {
  startState: string
  buttonText: string
  card: CardInput
  newsfeedText?: string
  endState: string
}

export interface CreateStoryboardInput {
  unObjectId: string
  actions: ActionInput[]
}

export interface UpdateStoryboardStatusInput {
  id: string
  status: string
}

export interface UpdateUnObjectInput {
  id: string
  name: string
  text: string
  emoji?: string
  entryId?: string
}

export interface UserRole {
  id: string
  userId: string
  role: string
  createdAt: Date
  updatedAt: Date
}
  
export interface UserRoleInput {
  userId: string
  role: string
}

export enum EventType {
  CreateEdge = 'CreateEdge',
  DeleteEdge = 'DeleteEdge',
  CreateActivity = 'CreateActivity',
  ActionWithContextCreated = 'ActionWithContextCreated',
  ActionWithContextCreatedActivityCreated = 'ActionWithContextCreatedActivityCreated',
}

export interface TrackingInput {
  trackingId: string
}
