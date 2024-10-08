import { ContainerStyle } from 'src/maker/types'

export enum Actions {
  PrizeReady = 'action.prize.ready',
  SpinFinished = 'action.spin.finished',
  SetReels = 'action.set.reels',
}

export interface ReelSymbolData {
  s3Key: string
  containerConfig: ContainerStyle
}

export interface GameState {
  offeredItem: string
}
