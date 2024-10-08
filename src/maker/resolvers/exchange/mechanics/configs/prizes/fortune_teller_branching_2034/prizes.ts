import { desired } from './desired'
import { fallback } from './fallback'
import { lucky } from './lucky'

export const prizes = [
  ...desired,
  ...lucky,
  ...fallback,
]
