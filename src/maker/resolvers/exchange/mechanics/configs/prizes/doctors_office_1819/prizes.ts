import { fallback } from './fallback'
import { injured } from './injured'
import { pukingFromMushrooms } from './pukingFromMushrooms'
import { wasted } from './wasted'

export const prizes = [
  ...injured,
  ...wasted,
  ...pukingFromMushrooms,
  ...fallback,
]
