import { on } from 'src/maker/events'
import { StateToVState, statesToVStates } from 'src/domain/statesToVStates'
import { getActiveUserStates, getUserState } from 'src/maker/userStates'
import { setVState, VState } from 'src/maker/vstate'
import { MasterType } from '../helpers'
import { userStates, UserStateId } from 'src/domain/userStates'
import { NodeApi } from 'src/maker/types'
import vstates from 'src/maker/vstate/states'
import { ChatRoomActionContextApi } from 'src/types'

export const setup = (): void => {
  const getNode = (api: ChatRoomActionContextApi): NodeApi => {
    const partner = api.getPartner()
    // For NPC rooms, we increase the ChatRoom's User States instead of the NPC's
    return partner.isUser() ? partner : api.getChatRoom()
  }

  const findEntry = (data: Pick<MasterType, 'state' | 'input'>, prev = false): StateToVState | undefined => {
    const value = data.input.numberValue - (prev ? data.input.delta : 0)
    return statesToVStates.find(entry => (
      entry.userState === data.state.id && value >= entry.minValue && value <= entry.maxValue
    ))
  }

  const getVState = async (node: NodeApi): Promise<VState | undefined> => {
    // TODO: the type returned by this sucks, I need to refactor that whole thing
    const states = await getActiveUserStates(node)
    for (const state of states) {
      const entry = findEntry({ state: userStates[state.id], input: state })
      if (entry) {
        return entry.vstate
      }
    }
  }

  on.state.increased
    .and(data => !!findEntry(data))
    // When they increase, we know they are now on top so switch to them
    .do((data) => setVState(data.node, findEntry(data)!.vstate))

  on.state.decreased
    // TODO: Optimize this further with clever checks
    .and(data => (
      // Check if the entry changed due to this decay tick
      findEntry(data) !== findEntry(data, true)
    ))
    .do(async ({ node }) => {
      const vstate = await getVState(node) || vstates.clearState
      // When users are already in the room, we need to clear layers if no vstate is to be shown
      return setVState(node, vstate)
    })

  // Since vstates are not persistent, restore them on enter
  on.room.entered.do(async ({ api }) => {
    const vstate = await getVState(getNode(api))
    if (vstate) {
      return setVState(api.getActor(), vstate, true)
    }
  })

  // Allow the FE to switch to another vstate
  on.room.action.receiving
    .and(({ api }) => api.getCurrentActionName() === '_showState')
    .do(async ({ api }) => {
      const state = userStates[api.getCurrentActionTarget() as UserStateId]
      if (!state) {
        return
      }
      const input = await getUserState(getNode(api), state.id)
      const entry = findEntry({ state, input })
      const vstate = entry ? entry.vstate : vstates.clearState
      return setVState(api.getActor(), vstate, true)
    })
}
