import { DurationInputObject } from 'moment'

export interface BaseUserState<Id, Tag> {
  id: Id
  tags: Readonly<Tag[]>
  displayName: string
  decayRate: number
  decayInterval?: DurationInputObject
  minValue: number
  maxValue: number
}
