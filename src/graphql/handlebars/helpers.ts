import * as handlebars from './'
import { resolveHashtributes } from '../core'
import { User } from 'src/db/entity'

// Register helpers for handlebars that require queries. Separated to keep handlebars.ts without risky imports

export default { register: (): void => {
  handlebars.registerHelper('topHashtribute', (user: User): Promise<string> => {
    return resolveHashtributes(user).then(({ hashtributes }) => hashtributes?.[0].metadata.displayName || 'Nobody')
  })
}}
