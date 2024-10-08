import { ActionX } from 'src/db/entity'
import { VState } from 'src/maker/vstate'
import { DurationInputObject } from 'moment'

interface Extra<Name> {
  name: Name
  damage?: number
  cooldown?: DurationInputObject
  dropAnimationS3Key?: string
  effectVState: VState
  buffVState?: VState
  socialTitle: string
  socialDescription: string
  prefix: string
  verb: string
  pastVerb: string
  minUserAge: number
}

export type BaseMove<Name> = Pick<ActionX, 'description' | 'text' | 's3Key' | 'backgroundColor' | 'isDeleted'> & Extra<Name>
