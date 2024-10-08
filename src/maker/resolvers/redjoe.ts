/**
 * @rob4lderman
 * feb2020
*/

import { ChatRoomActionContextApi } from '../types'
import { LoggerFactory } from 'src/utils/logger'
import { ActionStubSet } from '../types'
import { UnrealChatroom, UnrealOnEnter, UnrealOnReset, UnrealAction } from 'src/maker/core'

/**
 * The ActionStubSet to show in the action sheet in this ChatRoom.
 * You can have multiple ActionStubSets.
 * An ActionStubSet is streamed down to the app via:
 *      contextApi.getActor().saveCurrentActionStubs( actionStubSet )
 */
export const actionStubSet: ActionStubSet = {
  staticActionNames: [
    'redjoe.action.helloworld',
    'Action.Debug.Reset',
  ],
  actionInstanceNames: [
    'redjoe.action.peanutbutter',
  ],
}

@UnrealChatroom({
  id: 'red_joe_1642',
})
export default class RedJoe implements UnrealOnEnter, UnrealOnReset {

  private readonly logger = LoggerFactory('redjoe', 'NPC')

  onEnter(contextApi: ChatRoomActionContextApi): Promise<any> {
    this.logger.log('onEnter')
    contextApi.getActor().saveCurrentActionStubs(actionStubSet)
    return contextApi.getActor().sendSystemMessage(
      `HI! Welcome to ${contextApi.getUnObject().getName()}!`
    )
  }

  onReset(contextApi: ChatRoomActionContextApi): Promise<any> {
    this.logger.log('onReset')
    return contextApi.getActor().sendSystemMessage('RESET!')
  }

  @UnrealAction('redjoe.action.helloworld')
  onActionHelloWorld(contextApi: ChatRoomActionContextApi): Promise<any> {
    contextApi.getActor().createActionInstance({
      actionName: 'redjoe.action.peanutbutter',
      trxDescription: 'given out by redjoe!',
    })
    return contextApi.getActor().sendSystemMessage('Hello World!')
  }

  @UnrealAction('redjoe.action.peanutbutter')
  onActionPeanutButter(contextApi: ChatRoomActionContextApi): Promise<any> {
    contextApi.getActor().deleteActionInstance({
      actionName: 'redjoe.action.peanutbutter',
      trxDescription: 'given back to redjoe!',
    })
    return contextApi.getActor().sendSystemMessage('Yum yum!')
  }

}
