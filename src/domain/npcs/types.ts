import { Role, Gender } from 'src/gql-types'
import { Hashtribute } from 'src/domain/hashtributes'
import { Item } from 'src/domain/items'

// Sadly the UnObject is a bit magical and the attributes types get lost, dup it here:
export interface BaseNPC<Id> {
  id: Id
  name: string
  description: string
  s3Key: string | null
  backgroundColor: string
  bio: string
  isFeatured: boolean
  featuredSortKey?: string
  hashtribute?: Hashtribute
  showBackpack: boolean
  showControlBar: boolean
  showResetButton: boolean
  minOccupancy: number
  maxOccupancy: number | null
  backgroundS3Key: string | null
  coverS3Key: string
  isDeleted: boolean
  socialTitle: string
  socialDescription: string
  socialImageS3Key: string
  allowHashtributeNotifications: boolean
  disableButtonsUponAction: boolean
  visibleForRole: Role
  isDestination: boolean
  eid: string
  rewards: Readonly<Item[]>
  prefix: string
  minUserAge: number
  handler?: 'Airtable' | 'Raw Generator'
  gender: Gender
}
