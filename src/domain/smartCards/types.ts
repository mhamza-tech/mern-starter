import {
  Gender,
  FeedItemActionType,
  FeedItemActionEntityType,
} from 'src/gql-types'
import { MoveName } from 'src/domain/moves'
import { ItemName } from 'src/domain/items'
import { Asset } from 'src/domain/assets'
import { NPCId } from 'src/domain/npcs'
import { UserStateId } from 'src/domain/userStates'
import { HashtributeId } from 'src/domain/hashtributes'

export type SmartCardActionType = 'NPC' | 'P2P' | 'M2M' | 'OpenView'

export interface SmartCard {
  id: number
  title: string
  description: string
  foregroundImage: Asset
  excludeIfGender?: Gender
  includeIfInInventory: ItemName[]
  excludeIfInInventory: ItemName[]
  actionType?: SmartCardActionType
  feedItemActionType?: FeedItemActionType
  entityId?: MoveName | ItemName | NPCId | string
  entityType?: FeedItemActionEntityType
  sortBy: string
  groupBy: string
  minFriends?: number
  maxFriends?: number
  stateId?: UserStateId
  minState?: number
  maxState?: number
  hashtributeId?: HashtributeId
  minHashtribute?: number
  maxHashtribute?: number
  infoBlock?: string
  counterId?: string
  minCounter?: number
  maxCounter?: number
  backgroundImage?: Asset
  minUserAge: number
}
