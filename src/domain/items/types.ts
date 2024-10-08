import { ActionX } from 'src/db/entity'
import { DurationInputObject } from 'moment'
import { VState } from 'src/maker/vstate'

type CreationSource = 'generated' | 'crafted'

interface Extra<Name> {
  name: Name
  creationTime?: DurationInputObject
  expirationTime?: DurationInputObject
  creationSource: CreationSource
  effectVState?: VState
  dropAnimationS3Key?: string
  socialTitle: string
  socialDescription: string
  prefix: string
  minUserAge: number
}

export type BaseItem<Name> = Pick<ActionX, 'description' | 'text' | 's3Key' | 'backgroundColor' | 'isDeleted'> & Extra<Name>
