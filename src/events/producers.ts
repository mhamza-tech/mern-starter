import { ActionXInstance, User, Field } from 'src/db/entity'
import { NodeApi, ChatRoomActionContextApi, HashtributeFieldMetadata, HandlebarsValues } from 'src/types'
import { Subject } from './types'
import { UserState } from 'src/domain/userStates'
import { Hashtribute } from 'src/domain/hashtributes'
import { StringTags } from 'src/domain/strings'
import { UserStateInput } from 'src/maker/userStates'
import { Item } from 'src/domain/items'

/**
 * These are the events that producers fire, they get everything started
 */

export const hashtribute = {
  increased: new Subject<{ node: NodeApi; hashtribute: Hashtribute; metadata: HashtributeFieldMetadata }>(),
}

export const state = {
  changed: new Subject<{ node: NodeApi; state: UserState; input: UserStateInput }>(),
}

export const item = {
  created: new Subject<{ api: ChatRoomActionContextApi; node: NodeApi; instance: ActionXInstance }>(),
  destroyed: new Subject<{ api: ChatRoomActionContextApi; node: NodeApi; instance: ActionXInstance }>(),
  transferred: new Subject<{ api: ChatRoomActionContextApi; node: NodeApi; instance: ActionXInstance; to: NodeApi }>(),
  expired: new Subject<{ node: NodeApi; instance: ActionXInstance }>(),
}

export const room = {
  entering: new Subject<{ api: ChatRoomActionContextApi }>(),
  entered: new Subject<{ api: ChatRoomActionContextApi }>(),
  action: {
    receiving: new Subject<{ api: ChatRoomActionContextApi }>(),
    received: new Subject<{ api: ChatRoomActionContextApi }>(),
  },
}

export const npc = {
  session: {
    started: new Subject<{ api: ChatRoomActionContextApi }>(),
    reset: new Subject<{ api: ChatRoomActionContextApi }>(),
    completed: new Subject<{ api: ChatRoomActionContextApi; item?: Item; success: boolean }>(),
  },
}

export const message = {
  sent: new Subject<{ api: ChatRoomActionContextApi; node: NodeApi; from?: NodeApi; text: string; values?: HandlebarsValues }>(),
  tagged: { sent: new Subject<{ api: ChatRoomActionContextApi; node: NodeApi; from?: NodeApi; tags: StringTags; optional?: StringTags; text: string; values?: HandlebarsValues }>() },
}

export const notification = {
  tagged: { sent: new Subject<{ api: ChatRoomActionContextApi; node: NodeApi; tags: StringTags; optional?: StringTags; text:string; values?: HandlebarsValues }>() },
}

export const user = {
  created: new Subject<{ user: User }>(),
  connected: new Subject<{ user: User }>(),
  disconnected: new Subject<{ user: User }>(),
}

export const field = {
  saved: new Subject<{ api: ChatRoomActionContextApi; node: NodeApi; field: Field }>(),
}
