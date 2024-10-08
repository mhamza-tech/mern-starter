import { ChatRoomActionContextApi } from 'types'

export interface UnrealOnBeforeEnter {
  onBeforeEnter(contextApi: ChatRoomActionContextApi): Promise<string[]>
}

export interface UnrealOnEnter {
  onEnter<T>(contextApi: ChatRoomActionContextApi): Promise<T>
}

export interface UnrealOnLoad {
  onLoad<T>(contextApi: ChatRoomActionContextApi): Promise<T>
}

export interface UnrealOnComment {
  onComment<T>(contextApi: ChatRoomActionContextApi): Promise<T>
}

export interface UnrealOnReset {
  onReset<T>(contextApi: ChatRoomActionContextApi): Promise<T>
}

export interface UnrealOnExit {
  onExit<T>(contextApi: ChatRoomActionContextApi): Promise<T>
}
