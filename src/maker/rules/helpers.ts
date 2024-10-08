import _ from 'lodash'
import { NodeApi, HashtributeFieldMetadata, ChatRoomActionContextApi, HandlebarsValues } from 'src/types'
import { Gender } from 'src/gql-types'
import { UserState, UserStateId } from 'src/domain/userStates'
import { getUserState, UserStateInput } from '../userStates'
import { ActionXInstance, User, Field } from 'src/db/entity'
import { Hashtribute, HashtributeId } from 'src/domain/hashtributes'
import moment, { MomentInput } from 'moment'
import { StringTags } from 'src/domain/strings'
import { items, ItemName, Item } from 'src/domain/items'
import { SYSTEM_USER_EID, DEFAULT_NPC_ID } from 'src/env'
import { Move, moves, MoveName } from 'src/domain/moves'
import { NPCId, NPC } from 'src/domain/npcs'
import { getCounter, FTUE } from '../counters'
import { Modifier, ModifierId } from 'src/domain/modifiers'

// Helpers
interface Action { name: string }

// A type made for testing that has all the possible inputs to an and() function
export interface MasterType {
  api: ChatRoomActionContextApi
  node: NodeApi
  instance: ActionXInstance
  to: NodeApi
  from: NodeApi
  state: UserState
  input: UserStateInput
  hashtribute: Hashtribute
  metadata: HashtributeFieldMetadata
  args: any
  probability: number
  success: boolean
  tags: StringTags
  optional?: StringTags
  user: User
  item: Item
  move: Move
  modifier?: Modifier
  values?: HandlebarsValues
  npc?: NPC
  field: Field
}

// The type of an and() function
type AndCondition = (data: MasterType) => boolean

export enum jobNames {
  UserStateDecay = 'jobs.userStateDecay',
  SproutFairytWings = 'Sprout Fairy Wings',
  DevelopsMalaria = 'Develops Malaria',
  ItchyAss = 'ItchyAss',
  ItchyGeneral = 'ItchyGeneral',
  ItemExpires = 'Item Expires',
  MosquitoBitesCurrentOwner = 'Mosquito Bites Current Owner',
  MosquitoFliesIntoBackpack = 'MosquitoFliesIntoBackpack',
  TestTransferItem = 'TestTransferItem',
  ExecuteEffect = 'ExecuteEffect',
}

type JobId = keyof typeof jobNames

const MAX_FTUE = 3
// Cannot be used in and()! Needs to be maintained with the right count
export const isInFTUE = (node: NodeApi): Promise<boolean> => getCounter(node, FTUE).then(step => step <= MAX_FTUE)

export const toUser: AndCondition = ({ api }) => api.getPartner().isUser()
export const isUserRoom = toUser
export const isM2M: AndCondition = ({ api }) => api.isSelfChatRoom()
export const isUser: AndCondition = ({ api }) => api.getActor().isUser()
export const isP2P: AndCondition = (data) => isUserRoom(data) && !isM2M(data)
export const isNPCRoom: AndCondition = ({ api }) => api.getPartner().isUnObject()
const actionIs = (action: Action): AndCondition => ({ api }): boolean => api.getCurrentActionName() === action.name
export const nodeIsUser: AndCondition = ({ node }) => node.isUser()
// For now it's undefined, soon will appear as a proper NPC
export const isBedroom: AndCondition = (data) => {
  const unobject = data.api.getUnObject()
  return !unobject || unobject.getId() === DEFAULT_NPC_ID
}

// use on item.used
export const itemActionIs = (name: ItemName): AndCondition => actionIs(items[name])
// use on item.added, item.removed, item.transfer
export const itemIs = (name: ItemName): AndCondition => ({ instance }): boolean => instance.actionName === name
export const moveIs = (name: MoveName): AndCondition => actionIs(moves[name])
export const npcIs = (id: NPCId): AndCondition => ({ api }): boolean => api.getUnObject()?.getId() === id
export const jobIs = (id: JobId): AndCondition => actionIs({ name: jobNames[id] })
export const modifierIs = (id: ModifierId): AndCondition => ({ modifier }): boolean => modifier?.id === id
export const hasNoModifier: AndCondition = ({ modifier }) => !modifier
export const hashtributeIs = (hashtributeId: HashtributeId | undefined): AndCondition => ({ hashtribute }): boolean => hashtribute?.id === hashtributeId
export const isActorMale: AndCondition = ({ api }) => api.getActor().getKey('gender') === Gender.Male
export const isActorFemale: AndCondition = ({ api }) => api.getActor().getKey('gender') === Gender.Female
export const isPartnerMale: AndCondition = ({ api }) => api.getPartner().getKey('gender') === Gender.Male
export const isPartnerFemale: AndCondition = ({ api }) => api.getPartner().getKey('gender') === Gender.Female
export const ownerIsCreator: AndCondition = ({ instance }): boolean => instance.creatorEid === instance.playerEid
export const ownerIsNotCreator: AndCondition = ({ instance }): boolean => instance.creatorEid !== instance.playerEid && instance.creatorEid !== SYSTEM_USER_EID
export const isSystemItem: AndCondition = ({ instance }): boolean => instance.creatorEid === SYSTEM_USER_EID
export const getString = (val: any): string => _.isUndefined(val) ? '' : val
// filter for any of the events that work off tags (notifications, npc commented, etc.)
export const withTags = (...list: StringTags): AndCondition => ({ tags, optional }): boolean => list.every(tag => tags.includes(tag) || optional?.includes(tag))
export const itemIsCrafted: AndCondition = ({ item }): boolean => item.creationSource === 'crafted'
export const itemIsGenerated: AndCondition = ({ item }): boolean => item.creationSource === 'generated'

export const stateIsInRange = (id: UserStateId, start: number, end = 100): AndCondition => ({ state, input }): boolean => state.id === id && input.numberValue >= start && input.numberValue <= end

export const actorTimeInRange = (start: MomentInput, end: MomentInput): AndCondition => ({ api }): boolean =>
  api.getActor().getLocalTime().isBetween(moment(start, moment.HTML5_FMT.TIME), moment(end, moment.HTML5_FMT.TIME))

export const minutesToDecayComplete = (numberValue: number, state: UserState): number => {
  if (!numberValue) {
    return 0
  }
  // It will never decay
  if (!state.decayRate || !state.decayInterval) {
    return Number.MAX_SAFE_INTEGER
  }
  const minutes = moment.duration(state.decayInterval).asMinutes()
  return Math.ceil(numberValue / state.decayRate * minutes)
}

export const actorStateInRange = (stateId: UserStateId, start: number, end: number, api: ChatRoomActionContextApi): Promise<boolean> => {
  return getUserState(api.getActor(), stateId)
    .then((field) => field.numberValue >= start && field.numberValue <= end)
}

export const nodeStateInRange = (stateId: UserStateId, start: number, end: number, node: NodeApi): Promise<boolean> => {
  return getUserState(node, stateId)
    .then((field) => field.numberValue >= start && field.numberValue <= end)
}

const beatNpcRooms: NPCId[] = ['bentley_43', 'brett_the_creep_35', 'chip_the_dog_14', 'ethan_the_creep_30', 'fire_lanterns_72', 'francois_40', 'gobi_dahlia_71', 'hollywood_producer_36', 'rubber_tree_70']

export const notBeatNPC: AndCondition = ({ api }) => !beatNpcRooms.includes(api.getUnObject().getId() as NPCId)
