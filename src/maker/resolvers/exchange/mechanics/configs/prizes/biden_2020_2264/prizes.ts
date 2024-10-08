import { biden_2020 } from './biden2020_2271'
import { fallback } from './fallback'
import { trump_2020 } from './trump2020_2251'

export const prizes = [
  ...fallback,
  ...trump_2020,
  ...biden_2020,
]
