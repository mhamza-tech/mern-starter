import _ from 'lodash'
import {
  Repository,
  getConnection,
  FindManyOptions,
} from 'typeorm'
import {
  sf,
} from '../../utils'
import { TYPEORM_CONNECTION } from 'src/env'
import {
  Event,
  CompletedAction,
} from 'src/db/entity'

// TODO - ENABLE LOGGING
// import { LoggerFactory } from 'src/utils/logger'

// const logger = LoggerFactory('event.model')
const DB_CONN_NAME = TYPEORM_CONNECTION

/**
 * @return Promise w/ repository
 */
let cachedEventRepository: Repository<Event> = null
export const getEventRepository = (): Promise<Repository<Event>> => {
  return !!!_.isNil(cachedEventRepository)
    ? Promise.resolve(cachedEventRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Event))
      .then(sf.tap(repository => {
        cachedEventRepository = repository 
      }))
}

export const saveEvent = (event: Event): Promise<Event> => {
  return getEventRepository()
    .then(repo => repo.save(event))
}

export const readEventById = (id: string): Promise<Event> => {
  return getEventRepository()
    .then(repo => repo.findOne(id))
}

export const readEventBy = (fields: Partial<Event>): Promise<Event> => {
  return getEventRepository()
    .then(repo => repo.findOne(fields))
}

export const readEventsBy = (options: FindManyOptions<Partial<Event>>): Promise<Event[]> => {
  return getEventRepository()
    .then(repo => repo.find(options))
}

export const buildEvent = (eventData: object): Event => {
  const event = new Event()
  return _.extend( 
    event, 
    _.pick(eventData, [
      'actionEntityType',
      'actionId',
      'actorEid',
      'contextid',
      'eventType',
      'metadata',
      'partnerEid',
      'unObjectEid',
    ])
  )
}

export const mapCompletedActionToEvent = (action: CompletedAction): Event => {
  // id|entityType|type|contextId|sessionUserId|trackingId|input|output|metadata|createdAt|updatedAt|recordVersion|actorEid
  return buildEvent(action)
}

// const buildEventSchema = (): Joi.ObjectSchema<any> => {
//   return Joi.object().keys({
//     type: Joi.string().required(),
//     source: Joi.string().required(),
//     sessionUserId: buildOptionalStringValidator(),
//     trackingId: buildOptionalStringValidator(),
//     actionWithContextId: buildOptionalStringValidator(),
//     actionWithContext: Joi.object().allow(null),
//     unObjectId: buildOptionalStringValidator(),
//     unObject: Joi.object().allow(null),
//     storyboardId: buildOptionalStringValidator(),
//     storyboard: Joi.object().allow(null),
//     playerContextId: buildOptionalStringValidator(),
//     playerContext: Joi.object().allow(null),
//     actionId: buildOptionalStringValidator(),
//     action: Joi.object().allow(null),
//     edgeId: buildOptionalStringValidator(),
//     edge: Joi.object().allow(null),
//     activityId: buildOptionalStringValidator(),
//     metadata: Joi.object().allow(null),
//   })
// }
