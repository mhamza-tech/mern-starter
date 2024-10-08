/**
 * @rob4lderman
 * oct2019
 *
 * EXAMPLE.
 *
 */

import {
  ActionResolver,
  SetLocalStateInput,
  ChatRoomActionContextApi,
  NodeApi,
} from '../types'
import { SaveFieldOutput, FieldType, CreateChatRoomCommentInput } from '../../gql-types'
import _ from 'lodash'
import {
  registerReactionFnMap,
  ReactionFnMap,
} from '../../enginev3'

const log = console.log
const unObjectId = 'big_foot_3_1629'

const setIsTyping = (actorApi: NodeApi, booleanValue: boolean): Promise<any> => {
  const setLocalStateInput: SetLocalStateInput = {
    type: FieldType.BooleanField,
    name: 'isTyping',
    metadata: {
      booleanValue,
    },
  }
  return actorApi.setLocalState(setLocalStateInput).then((saveFieldOutput: SaveFieldOutput) => saveFieldOutput.field)
}

const sendReplyToCommentText = (contextApi: ChatRoomActionContextApi, inboundCommentText: string): Promise<any> => {
  if (_.includes(inboundCommentText, 'unobject')) {
    return contextApi.sendUnObjectComment('ALOHA! says the UNOBJECT')
  } else {
    return contextApi.getActor().sendSystemComment('ALOHA! says the SYSTEM')
  }
}

/**
 * @return fn
 */
export const pause = pause_ms => (value): Promise<any> => {
  return new Promise(resolve => setTimeout(() => resolve(value), pause_ms))
}

const simulateTypingReplyComment = (contextApi: ChatRoomActionContextApi, inboundCommentText: string): Promise<any> => {
  return Promise.resolve(setIsTyping(contextApi.getUnObject(), true))
    .then(pause(3 * 1000))
    .then(() =>
      Promise.all([
        sendReplyToCommentText(contextApi, inboundCommentText),
        setIsTyping(contextApi.getUnObject(), false),
      ])
    )
}

const echoActionName = (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
  setTimeout(
    () =>
      Promise.all([
        contextApi.getActor().sendSystemComment(`You ran the action ${args.input.name}`),
        contextApi
          .getPartner()
          .sendSystemComment(`${contextApi.getActor().getName()} ran the action ${args.input.name}`),
      ]),
    3 * 1000
  )
  return null
}

// const bgColorPalette = [
//   'F7402D',
//   'ED1561',
//   '9D1DB3',
//   '6735BA',
//   '3E4EB8',
//   '1895F6',
//   '00BBD9',
//   '009888',
//   '47B14B',
//   '8AC441',
//   // 'FFED1B',
//   // 'FFC200',
//   'FF9800',
//   'FF560A',
//   // 'AFBFC6',
//   '273238',
// ]

// const kissAction: Action = {
//   name: 'kiss',
//   unObjectId,
//   text: 'kiss',
//   description: 'Kiss Bigfoot!',
//   isEnabled: true,
//   backgroundColor: _.sample(bgColorPalette),
// }

// const abductAction: Action = {
//   name: 'abduct',
//   unObjectId,
//   text: 'ABDUCT',
//   description: 'Abduct Bigfoot!',
//   isEnabled: true,
//   backgroundColor: _.sample(bgColorPalette),
// }

// const allActions = [kissAction, abductAction]

const onEnter = (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
  log('bigfoot.onEnter', { args })
  Promise.resolve(null)
    .then(pause(1 * 1000))
    // -rx- .then(() => contextApi.getActor().setActions(allActions))
    .then(() =>
      contextApi
        .getActor()
        .sendSystemComment(
          `WELCOME! the actor is ${contextApi
            .getActor()
            .getName()}, the user is ${contextApi.getUser().getName()}, the unObject is ${contextApi.getUnObject().getName()}`
        )
    )
  return null
}

const onComment = (contextApi: ChatRoomActionContextApi, args: any): Promise<any> => {
  log('bigfoot.onComment', { args })
  const input: CreateChatRoomCommentInput = args.input
  const text: string = _.toLower(input.text)
  if (_.includes(text, 'aloha')) {
    setTimeout(_.partial(simulateTypingReplyComment, contextApi, text), 3 * 1000)
  }
  return null
}

const onReset = (): Promise<any> => {
  return Promise.resolve(null)
}

const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {
    kiss: echoActionName,
  } as ReactionFnMap)
}

const actionResolver: ActionResolver = {
  unObjectId,
  onComment,
  onEnter,
  onReset,
  onLoad: registerReactionFns,
}

export default actionResolver
