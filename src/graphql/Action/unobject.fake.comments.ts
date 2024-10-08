import { misc } from 'src/utils'
import { Redis } from 'src/services/redis'
import { listAvatarKeys } from 'src/services/aws'
import { mapS3KeyToImgixImageUrl } from '../models'
import { LoggerFactory } from 'src/utils/logger'
import * as faker from 'faker'
import _ from 'lodash'

interface fakeUser {
  displayName: string
  avatarURL: string
  id: string
}

interface fakeComment {
  id: string
  text: string
  author: fakeUser
}

const logger = LoggerFactory('unobject.resolvers')
const redis = Redis.getInstance().getClient()
const randomId = (): string => misc.randomInt(1, 10000).toString()
const hashtributes = [
  'puppysnuggler',
  'puppyevangelist',
  'guru',
  'spiritual',
]

const getAvatarImageCollection = (): Promise<string[]> => {
  const key = 'web:share:fake:avatarkeys'

  return redis
    .get(key)
    .then(a => typeof a === 'string'
      ? JSON.parse(a) as string[]
      : listAvatarKeys().then(a => redis.set(key, JSON.stringify(a)).then(() => a)))
    .then(a => a.map(mapS3KeyToImgixImageUrl))
}

export const generateRandomUser = (): Promise<fakeUser> => {
  return getAvatarImageCollection()
    .then(avatarKeys => {
      return {
        id: randomId(),
        displayName: faker.name.findName(),
        avatarURL: _.sample(avatarKeys),
      }
    })
}

export const generateRandomComment = (): Promise<fakeComment> => {
  return generateRandomUser().then(author => {
    return {
      id: randomId(),
      text: `**${author.displayName}** ${faker.hacker.phrase()} **#${_.sample(hashtributes)}**`,
      author,
    }
  })
}

export const generateRandomUsers = (count: number): Promise<fakeUser[]> => Promise.all(Array(count).fill(0).map(generateRandomUser))
export const generateRandomComments = (count: number): Promise<fakeComment[]> => Promise.all(Array(count).fill(0).map(generateRandomComment))

export const autoIncrementNumber = (key: string): Promise<number> => {
  const redis = Redis.getInstance().getClient()

  return redis
    .get(key)
    .then(value => typeof value !== 'string'
      ? redis.set(key, `${misc.randomInt(10, 10000)}`)
      : redis.set(key, `${(parseInt(value, 10) + misc.randomInt(1, 20))}`))
    .then(() => redis.get(key))
    .then(value => parseInt(value, 10))
    .catch(err => {
      logger.error(err)
      return 0
    })
}

export const incrementComments = (key: string): Promise<fakeComment[]> => {
  const randomNumber = Math.random()
  const willCreateNewComments = randomNumber <= 0.1 // 10% chance to insert new comment

  return redis
    .get(key)
    .then(value => typeof value === 'string'
      ? willCreateNewComments
        ? generateRandomComments(1).then(a => redis.set(key, JSON.stringify([...JSON.parse(value), ...a])))
        : Promise.resolve('') // noop
      : generateRandomComments(1).then(a => redis.set(key, JSON.stringify(a))))
    .then(() => redis.get(key))
    .then(value => JSON.parse(value) as fakeComment[])
    .catch(err => {
      logger.error(err)
      return []
    })
}
