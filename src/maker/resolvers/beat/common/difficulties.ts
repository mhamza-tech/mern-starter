import { Difficulty } from './types'

export const easy: Difficulty = {
  maxHP: 1250,
  killTime: { seconds: 60 },
}

export const medium: Difficulty = {
  maxHP: 4000,
  killTime: { seconds: 90 },
}

export const hard: Difficulty = {
  maxHP: 6000,
  killTime: { seconds: 120 },
}

export const epic: Difficulty = {
  maxHP: 12000,
  killTime: { seconds: 150 },
}
