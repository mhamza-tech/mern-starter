import _ from 'lodash'
import handlebars from 'handlebars'
import promisedHandlebars from 'promised-handlebars'
import { Gender } from 'src/gql-types'
import { isKeyOf } from 'src/utils/misc'
import { LoggerFactory } from 'src/utils/logger'
import { HandlebarsValues } from 'src/types'
import { moves } from 'src/domain/moves'
import { items } from 'src/domain/items'
import { userStates } from 'src/domain/userStates'
import { hashtributes } from 'src/domain/hashtributes'

const Handlebars = promisedHandlebars(handlebars) as typeof handlebars

const logger = LoggerFactory('handlebars', 'Handlebars')

// FIXME: Replicated mapEntityToEid to break a circular dependency
const mapEntityToEid = (entity: any): string => {
  return entity && _.toLower(`${entity.entityType}/${entity.id}`)
}
// If placed on models, we get a nasty circular dependency
const rawChatRoomLink = (entity: any): string => `/chatroom/${mapEntityToEid(entity)}`
const rawProfileLink = (entity: any): string => `/profile/${mapEntityToEid(entity)}`

// Util types to make the code less crappy
interface Entity {
  id?: string
  name?: string
  displayName?: string
  gender?: Gender
  text?: string
  prefix?: string
}

interface HandlebarsData {
  data?: {
    root?: {
      isYou?: boolean
      node?: Entity
    }
  }
}

interface GenderMap {
  [Gender.Male]: string
  [Gender.Female]: string
  [Gender.NonBinary]: string
  You?: string
}

const isYou = (entity: Entity, data: HandlebarsData): boolean => {
  const root = data?.data?.root
  if (root?.isYou !== undefined) {
    return root.isYou
  }
  return !!entity?.id && entity.id === root?.node?.id
}

const name = (entity: Entity, data: HandlebarsData): string => {
  if (isYou(entity, data)) {
    return 'you'
  }
  // NOTE: items/moves have name & text and we want text, for User/UnObject/ActionX we want the name
  // TODO: We need to clean this up, unify
  return entity?.displayName || entity?.text || entity?.name || '?'
}

const linkName = (entity: Entity, data: HandlebarsData): string => {
  return `[${name(entity, data)}](${rawChatRoomLink(entity)})`
}

const genderedText = (map: GenderMap) => (entity: Entity, data: HandlebarsData): string => {
  return isYou(entity, data) && map.You || map[entity?.gender || Gender.NonBinary]
}

const hisher = genderedText({
  [Gender.Male]: 'his',
  [Gender.Female]: 'her',
  [Gender.NonBinary]: 'their',
  You: 'your',
})

const himher = genderedText({
  [Gender.Male]: 'him',
  [Gender.Female]: 'her',
  [Gender.NonBinary]: 'them',
  // You: 'yourself', JT disbaled and implemented "you".
  You: 'you',
})

const himselfherself = genderedText({
  [Gender.Male]: 'himself',
  [Gender.Female]: 'herself',
  [Gender.NonBinary]: 'themselves',
  You: 'yourself',
})

const heshe = genderedText({
  [Gender.Male]: 'he',
  [Gender.Female]: 'she',
  [Gender.NonBinary]: 'they',
  You: 'you',
})

const isare = genderedText({
  [Gender.Male]: 'is',
  [Gender.Female]: 'is',
  [Gender.NonBinary]: 'are',
  You: 'are',
})

const waswere = genderedText({
  [Gender.Male]: 'was',
  [Gender.Female]: 'was',
  [Gender.NonBinary]: 'were',
  You: 'were',
})

const hashave = genderedText({
  [Gender.Male]: 'has',
  [Gender.Female]: 'has',
  [Gender.NonBinary]: 'have',
  You: 'have',
})

const guygirl = genderedText({
  [Gender.Male]: 'guy',
  [Gender.Female]: 'girl',
  [Gender.NonBinary]: 'person',
})

const aAn = (entity: string | Entity, data: HandlebarsData): string => {
  if (_.isObject(entity)) {
    if (isKeyOf('prefix', entity)) {
      return entity.prefix
    }
    // Support {{ aAn item }} (without name)
    return aAn(name(entity, data), data)
  }
  return /^[aeiou]/i.test(entity) ? 'an' : 'a'
}

// NOTE: must NOT be arrow function in order for "this" to work properly
function link(actor, options): string {
  return `[${options.fn(this)}](${rawChatRoomLink(actor)})`
}

const chatRoomLink = link

// NOTE: must NOT be arrow function in order for "this" to work properly
function profileLink(actor, options): string {
  return `[${options.fn(this)}](${rawProfileLink(actor)})`
}

Handlebars.registerHelper({
  name,
  hisher,
  himselfherself,
  heshe,
  himher,
  isare,
  waswere,
  hashave,
  guygirl,
  linkName,
  link,
  chatRoomLink,
  profileLink,
  rawChatRoomLink,
  rawProfileLink,
  aAn,
  toLower: _.toLower,
  toUpper: _.toUpper,
  capitalize: _.capitalize,
})

export const registerHelper = (name: string, handler: (data: any) => string | Promise<string>): void => {
  Handlebars.registerHelper(name, handler)
}

const preProcess = (text: string): string => {
  return text
}

const augmentContext = (context: HandlebarsValues): object => {
  // For each, you can pass the object directly or the "id" field
  return {
    move: context.moveName && moves[context.moveName],
    item: context.itemName && items[context.itemName],
    userState: context.userStateId && userStates[context.userStateId],
    hashtribute: context.hashtributeId && hashtributes[context.hashtributeId],
    ...context,
  }
}

const postProcess = (text: string): string => {
  return text.trim().replace(/  +/g, ' ')
    // Auto-capitalize words at the start of a sentence (support start of markdown link)
    .replace(/([!?.;] |^)\W*[a-z]/g, _.toUpper)
}

const memoizedCompile = _.memoize(Handlebars.compile).bind(Handlebars)
// If we want to have helpers that return promises, we must use this one
export const compileAndResolve = (text: string, context: object): Promise<string> => {
  try {
    const compiled = memoizedCompile(preProcess(text), { noEscape: true })
    return compiled(augmentContext(context)).then(postProcess)
  } catch (err) {
    logger.error('compileAndResolve', { err, text, context })
    return Promise.resolve(text)
  }
}
