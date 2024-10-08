import { UserStateId } from 'src/domain/userStates'
import { VState } from 'src/maker/vstate'

export interface StateToVState {
  id: number
  userState: UserStateId
  minValue: number
  maxValue: number
  vstate: VState
}
