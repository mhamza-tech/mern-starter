/**
 * @rob4lderman
 * mar2020
 * 
 */

import _ from 'lodash'
import { TYPEORM_CONNECTION } from 'src/env'
import {
  getConnection,
  Repository,
  EntityManager,
  SelectQueryBuilder,
} from 'typeorm'
import {
  ActionType,
  SaveActionInput,
} from 'src/gql-types'
import {
  CompletedAction,
  ActionX,
  ActionXInstance,
} from 'src/db/entity'
import { SimpleActionXInstanceObject } from 'src/db/entity/ActionXInstance'
import { typeOrmEntitiesToPlainObjects } from 'src/db/entity/SimpleOrmObject'
import {
  ActionXInstanceTransferTemplate,
  ActionXInstanceTemplate,
} from 'src/types'
import * as sf from 'src/utils/sf'
import { LoggerFactory } from 'src/utils/logger'
import * as dbUtils from '../../db/utils'

const logger = LoggerFactory('actionx.model')

const DB_CONN_NAME = TYPEORM_CONNECTION

/**
 * @return Promise w/ repository
 */
let cachedActionXRepository = null
export const getActionXRepository = (): Promise<Repository<ActionX>> => {
  return !!!_.isNil(cachedActionXRepository)
    ? Promise.resolve(cachedActionXRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(ActionX))
      .then(sf.tap(repo => {
        cachedActionXRepository = repo
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedActionXInstanceRepository = null
export const getActionXInstanceRepository = (): Promise<Repository<ActionXInstance>> => {
  return !!!_.isNil(cachedActionXInstanceRepository)
    ? Promise.resolve(cachedActionXInstanceRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(ActionXInstance))
      .then(sf.tap(repo => {
        cachedActionXInstanceRepository = repo
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedCompletedActionRepository: Repository<CompletedAction> = null
export const getCompletedActionRepository = (): Promise<Repository<CompletedAction>> => {
  return !!!_.isNil(cachedCompletedActionRepository)
    ? Promise.resolve(cachedCompletedActionRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(CompletedAction))
      .then(sf.tap(repository => {
        cachedCompletedActionRepository = repository
      }))
}

export const buildCompletedAction = (fields: object): CompletedAction => {
  const retMe = new CompletedAction()
  return _.extend(retMe, fields)
}

export const saveCompletedAction = (submitAction: CompletedAction): Promise<CompletedAction> => {
  return getCompletedActionRepository()
    .then(repo => repo.save(submitAction))
}

export const readCompletedActionsBy = (options: object): Promise<CompletedAction[]> => {
  return getCompletedActionRepository()
    .then(repo => repo.find(options))
}

export const readMostRecentCompletedAction = (contextId: string): Promise<CompletedAction> => {
  return readCompletedActionsBy({
    where: {
      contextId,
    },
    order: {
      createdAt: 'DESC',
    },
    take: 1,
    cache: true,
  })
    .then(_.first)
}

export const readCompletedActionBy = (options: object): Promise<CompletedAction> => {
  return getCompletedActionRepository()
    .then(repo => repo.findOne(options))
}

export const mapYamlActionToActionX = (yamlAction: any): ActionX => {
  const retMe = new ActionX()
  retMe.rawTags = JSON.stringify(_.get(yamlAction, 'tags', []))
  retMe.type = ActionType.Action
  retMe.isDeleted = _.defaultTo(_.get(yamlAction, 'isDeleted'), false)
  retMe.order = _.isEmpty(_.get(yamlAction, 'order'))
    ? _.get(yamlAction, 'name')
    : `${yamlAction.order}${yamlAction.name}`

  return _.extend(retMe, _.pick(yamlAction, [
    'name',
    'text',
    'description',
    's3Key',
    'imageUrl',
    'package',
    'emoji',
    'xp',
    'power',
    'collectionId',
    'backgroundColor',
    'unObjectId',
    'args',
  ]))
}

export const mapSaveActionInputToActionX = (input: SaveActionInput): ActionX => {
  const retMe = new ActionX()
  retMe.type = ActionType.Action
  return _.extend(
    retMe,
    _.pick(input, [
      'name',
      'text',
      'description',
      'xp',
      'power',
      'order',
      'collectionId',
      's3Key',
      'package',
      'backgroundColor',
      'unObjectId',
    ]),
    _.isUndefined(input.tags)
      ? {}
      : { rawTags: JSON.stringify(input.tags) }

  )
}

export const saveActionX = (actionX: ActionX): Promise<ActionX> => {
  return getActionXRepository()
    .then(repo => repo.save(actionX))
}

export const updateActionX = (id: string, set: object): Promise<ActionX> => {
  return getActionXRepository()
    .then(sf.tap_wait(repo => repo.update(id, set)))
    .then(repo => repo.findOne(id))
}

export const updateActionXsBy = (options: object, set: object): Promise<any> => {
  return getActionXRepository()
    .then(sf.tap_wait(repo => repo.update(options, set)))
}

export const readActionXBy = (options: object): Promise<ActionX> => {
  logger.debug('readActionXBy', { options })
  return getActionXRepository()
    .then(repo => repo.findOne(options))
}

export const readActionXsBy = (options: object): Promise<ActionX[]> => {
  logger.debug('readActionXsBy', { options })
  return getActionXRepository()
    .then(repo => repo.find(options))
}

export const createOrUpdateActionX = (actionX: ActionX): Promise<any> => {
  return saveActionX(actionX)
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err))(
      err => readActionXBy({
        name: actionX.name,
      })
        .then(sf.thru_if(_.isNil)(
          () => {
            throw err
          }
        ))
        // Note: had to use repo.update instead of repo.save cuz I was
        // getting weird TypeError: cannot convert object to primitive otherwise,
        // on the metadata field.  No clue as to why the initial save w/ metadata 
        // works but a subsequent save does not.
        .then((actionXRecord: ActionX) => updateActionX(
          actionXRecord.id,
          _.extend(
            dbUtils.safeEntityUpdate(actionX),
            { metadata: _.extend({}, actionXRecord.metadata, actionX.metadata) }
          )
        ))
    )(
      err => {
        throw err
      }
    ))
}

export const fillActionXTags = (actionX: ActionX): ActionX => {
  return _.extend(
    actionX,
    { tags: parseActionXRawTags(actionX) }
  )
}

export const parseActionXRawTags = (actionX: ActionX): string[] => {
  return JSON.parse(_.get(actionX, 'rawTags', '[]'))
}

export const readActionXInstancesBy = (options: object): Promise<SimpleActionXInstanceObject[]> => {
  logger.debug('readActionXInstanceBy', { options })
  return getActionXInstanceRepository()
    .then(repo => repo.find(options))
    .then(typeOrmEntitiesToPlainObjects)
}

export const readActionXInstanceBy = (options: object): Promise<ActionXInstance> => {
  return getActionXInstanceRepository()
    .then(repo => repo.findOne(options))
}

export const readLastUpdatedActionXInstance = (actionName: string, playerEid: string): Promise<ActionXInstance> => {
  return readActionXInstanceBy({
    where: {
      actionName,
      playerEid,
      isDeleted: false,
    },
    order: {
      updatedAt: 'DESC',
    },
  })
}

export const saveActionXInstance = (actionInstance: ActionXInstance): Promise<ActionXInstance> => {
  return getActionXInstanceRepository()
    .then(repo => repo.save(actionInstance))
}

export const assertIdOrActionNameNotEmpty = (actionInstance: ActionXInstance): ActionXInstance => {
  if (_.isEmpty(actionInstance.id) && _.isEmpty(actionInstance.actionName)) {
    throw new Error(`ActionXInstance requires either id or name: ${JSON.stringify(actionInstance)}`)
  }
  return actionInstance
}

export const buildActionXInstance = (props: any): ActionXInstance => {
  const retMe = new ActionXInstance()
  retMe.isDeleted = _.get(props, 'isDeleted', false)
  retMe.playerEid = _.get(props, 'playerEid')
  retMe.creatorEid = _.get(props, 'creatorEid') || retMe.playerEid
  return _.extend(retMe, _.pick(props, [
    'id',
    'actionName',
    'metadata',
  ]))
}

/**
 * Note: Transfers the record in the DB if and only if it is still assigned to the given playerEid.
 * @param input - defines actionName and playerEid
 * @return Promise<ActionXInstance> the updated instance, or null if no instance was updated.
 */
export const transferActionXInstance = (input: ActionXInstanceTransferTemplate): Promise<ActionXInstance> => {
  return getConnection(DB_CONN_NAME).transaction(
    'READ UNCOMMITTED',
    (entityManager: EntityManager) => transferActionXInstanceByIdAndPlayerEidInTransaction(entityManager, input)
  )
}

const transferActionXInstanceByIdAndPlayerEidInTransaction = (entityManager: EntityManager, input: ActionXInstanceTransferTemplate): Promise<ActionXInstance> => {
  return Promise.resolve(entityManager)
    .then((entityManager: EntityManager) => entityManager.createQueryBuilder(ActionXInstance, 'actionXInstance'))
    .then((qb: SelectQueryBuilder<ActionXInstance>) =>
      qb.where('actionXInstance.id= :id', _.pick(input, 'id'))
        .andWhere('actionXInstance.playerEid = :playerEid', _.pick(input, 'playerEid'))
        .andWhere('actionXInstance.isDeleted = false')
    )
    .then((qb: SelectQueryBuilder<ActionXInstance>) => qb.setLock('pessimistic_write'))
    .then((qb: SelectQueryBuilder<ActionXInstance>) => qb.getOne())
    .then(sf.thru_if_else(_.isNil)(
      () => null // TODO: fail?
    )(
      // Update existing record
      (record: ActionXInstance) => entityManager.update(
        ActionXInstance,
        record.id,
        {
          playerEid: input.transferToPlayerEid,
          lastGiverEid: record.playerEid,
          metadata: _.extend({}, record.metadata, input.metadata),
        }
      )
        .then(() => entityManager.findOne(ActionXInstance, record.id))
    ))
}

/**
 * Note: Transfers the record in the DB if and only if it is still assigned to the given playerEid.
 * @param input - defines actionName and playerEid
 * @return Promise<ActionXInstance> the updated instance, or null if no instance was updated.
 */
export const transferLastUpdatedActionXInstance = (input: ActionXInstanceTransferTemplate): Promise<ActionXInstance> => {
  return getConnection(DB_CONN_NAME).transaction(
    'READ UNCOMMITTED',
    (entityManager: EntityManager) => transferLastUpdatedActionXInstanceByIdAndPlayerEidInTransaction(entityManager, input)
  )
}

const transferLastUpdatedActionXInstanceByIdAndPlayerEidInTransaction = (entityManager: EntityManager, input: ActionXInstanceTransferTemplate): Promise<ActionXInstance> => {
  return Promise.resolve(entityManager)
    .then((entityManager: EntityManager) => entityManager.createQueryBuilder(ActionXInstance, 'actionXInstance'))
    .then((qb: SelectQueryBuilder<ActionXInstance>) =>
      qb.where('actionXInstance.actionName = :actionName', _.pick(input, 'actionName'))
        .andWhere('actionXInstance.playerEid = :playerEid', _.pick(input, 'playerEid'))
        .andWhere('actionXInstance.isDeleted = false')
        .orderBy('actionXInstance.updatedAt', 'DESC')
    )
    .then((qb: SelectQueryBuilder<ActionXInstance>) => qb.setLock('pessimistic_write'))
    .then((qb: SelectQueryBuilder<ActionXInstance>) => qb.getOne())
    .then(sf.thru_if_else(_.isNil)(
      () => null // TODO: fail?
    )(
      // Update existing record
      (record: ActionXInstance) => entityManager.update(
        ActionXInstance,
        record.id,
        {
          playerEid: input.transferToPlayerEid,
          lastGiverEid: record.playerEid,
          metadata: _.extend({}, record.metadata, input.metadata),
        }
      )
        .then(() => entityManager.findOne(ActionXInstance, record.id))
    ))
}

/**
 * Note: Deletes the record in the DB if and only if it is still assigned to the given playerEid.
 * @param input - defines actionName and playerEid
 * @return Promise<ActionXInstance> the updated instance, or null if no instance was updated.
 */
export const deleteActionXInstance = (input: ActionXInstanceTemplate): Promise<ActionXInstance> => {
  return getConnection(DB_CONN_NAME).transaction(
    'READ UNCOMMITTED',
    (entityManager: EntityManager) => deleteActionXInstanceByIdAndPlayerEidInTransaction(entityManager, input)
  )
}

const deleteActionXInstanceByIdAndPlayerEidInTransaction = (entityManager: EntityManager, input: ActionXInstanceTemplate): Promise<ActionXInstance> => {
  return Promise.resolve(entityManager)
    .then((entityManager: EntityManager) => entityManager.createQueryBuilder(ActionXInstance, 'actionXInstance'))
    .then((qb: SelectQueryBuilder<ActionXInstance>) =>
      qb.where('actionXInstance.id= :id', _.pick(input, 'id'))
        .andWhere('actionXInstance.playerEid = :playerEid', _.pick(input, 'playerEid'))
        .andWhere('actionXInstance.isDeleted = false')
    )
    .then((qb: SelectQueryBuilder<ActionXInstance>) => qb.setLock('pessimistic_write'))
    .then((qb: SelectQueryBuilder<ActionXInstance>) => qb.getOne())
    .then(sf.thru_if_else(_.isNil)(
      () => null // TODO: fail?
    )(
      // Update existing record
      (record: ActionXInstance) => entityManager.update(
        ActionXInstance,
        record.id,
        {
          isDeleted: true,
          metadata: _.extend({}, record.metadata, input.metadata),
        }
      )
        .then(() => entityManager.findOne(ActionXInstance, record.id))
    ))
}

/**
 * Note: Deletes the record in the DB if and only if it is still assigned to the given playerEid.
 * @param input - defines actionName and playerEid
 * @return Promise<ActionXInstance> the updated instance, or null if no instance was updated.
 */
export const deleteLastUpdatedActionXInstance = (input: ActionXInstanceTemplate): Promise<ActionXInstance> => {
  return getConnection(DB_CONN_NAME).transaction(
    'READ UNCOMMITTED',
    (entityManager: EntityManager) => deleteLastUpdatedActionXInstanceByIdAndPlayerEidInTransaction(entityManager, input)
  )
}

const deleteLastUpdatedActionXInstanceByIdAndPlayerEidInTransaction = (entityManager: EntityManager, input: ActionXInstanceTemplate): Promise<ActionXInstance> => {
  return Promise.resolve(entityManager)
    .then((entityManager: EntityManager) => entityManager.createQueryBuilder(ActionXInstance, 'actionXInstance'))
    .then((qb: SelectQueryBuilder<ActionXInstance>) =>
      qb.where('actionXInstance.actionName = :actionName', _.pick(input, 'actionName'))
        .andWhere('actionXInstance.playerEid = :playerEid', _.pick(input, 'playerEid'))
        .andWhere('actionXInstance.isDeleted = false')
        .orderBy('actionXInstance.updatedAt', 'DESC')
    )
    .then((qb: SelectQueryBuilder<ActionXInstance>) => qb.setLock('pessimistic_write'))
    .then((qb: SelectQueryBuilder<ActionXInstance>) => qb.getOne())
    .then(sf.thru_if_else(_.isNil)(
      () => null // TODO: fail?
    )(
      // Update existing record
      (record: ActionXInstance) => entityManager.update(
        ActionXInstance,
        record.id,
        {
          isDeleted: true,
          metadata: _.extend({}, record.metadata, input.metadata),
        }
      )
        .then(() => entityManager.findOne(ActionXInstance, record.id))
    ))
}
