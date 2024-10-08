import { fallback } from './fallback'
import { desired } from './desired'
import { injured } from './injured'

export const prizes = [
  ...injured,
  ...desired,
  ...fallback,
]
