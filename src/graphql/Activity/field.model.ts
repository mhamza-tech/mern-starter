/**
 * @rob4lderman
 * mar2020
 *  
 * 
 */
import _ from 'lodash'
import { TYPEORM_CONNECTION } from 'src/env'
import {
  getConnection,
  Repository,
  LessThan,
  MoreThan,
  EntityManager,
  SelectQueryBuilder,
} from 'typeorm'
import {
  sf,
  misc,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import { Field } from '../../db/entity'
import {
  PageInput,
  CreateFieldInput,
  FieldsInput,
  HashStatus,
  SaveFieldInput,
  HashtributeField,
  EntityScope,
  FieldType,
  EntityType,
} from 'src/gql-types'
import {
  cursorToDate,
  resolvePage,
} from '../pageInput'
import moment from 'moment'
import { v4 } from 'uuid'
import * as dbUtils from '../../db/utils'
import { ApolloError } from 'apollo-server'
import * as hashtributes from '../../maker/hashtributes'
import * as userStates from '../../maker/userStates'
import * as models from 'src/graphql/models'

const logger = LoggerFactory('field.model')
const DB_CONN_NAME = TYPEORM_CONNECTION
const DEFAULT_PAGE_SIZE = 10

/**
 * @return Promise w/ repository
 */
let cachedFieldRepository: Repository<Field> = null
export const getFieldRepository = (): Promise<Repository<Field>> => {
  return !!!_.isNil(cachedFieldRepository)
    ? Promise.resolve(cachedFieldRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Field))
      .then(sf.tap(repository => {
        cachedFieldRepository = repository 
      }))
}

export const mapCreateFieldInputToField = (input: CreateFieldInput): Field => {
  const retMe = new Field()
  retMe.id = v4()
  return _.extend(retMe, _.pick(input, [ 
    'id',
    'collectionId',
    'thisEntityId',
    'thisEntityType',
    'type',
    'name',
    'collectionName',
    'metadata',
  ]))
}

export const mapSaveFieldInputToField = (input: SaveFieldInput): Field => {
  const retMe = new Field()
  // -rx- retMe.id = v4();
  retMe.isDeleted = _.defaultTo(_.get(input, 'isDeleted'), false)
  retMe.updatedAt = new Date()
  return _.extend(retMe, _.pick(input, [ 
    'id',
    'collectionId',
    'thisEntityId',
    'thisEntityType',
    'type',
    'name',
    'collectionName',
    'metadata',
    'scope',
    'expiresAt',
  ]))
}

export const buildFieldRequiresNameOrCollectionNameError = (): ApolloError => new ApolloError(
  'Field requires a name or collectionName',
  'InvalidField' // TODO: ErrorType.InvalidField
)

export const assertFieldHasNameOrCollectionName = (field: Field): Field => {
  if (_.isEmpty(field.name) && _.isEmpty(field.collectionName)) {
    throw buildFieldRequiresNameOrCollectionNameError()
  }
  return field
}

const updateOrCreateField = (field: Field, recursionLevel = 0): Promise<Field> => {
  return getConnection(DB_CONN_NAME).transaction( 
    'READ UNCOMMITTED',
    (entityManager: EntityManager) => updateOrCreateFieldInTransaction(entityManager, field)
  )
    .catch(sf.tap_throw(err => logger.error('updateOrCreateField.RACE', { recursionLevel, err, field })))
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err) && recursionLevel <= 0)(
      () => updateOrCreateField(field, recursionLevel + 1) 
    )(
      (err) => {
        throw err 
      }
    ))
}

const updateOrCreateFieldInTransaction = (entityManager: EntityManager, field: Field): Promise<Field> => {
  // -rx- field.name == 'HashStatus.Caffeinated' && logger.info( 'updateOrCreateFieldInTransaction.entry');
  return Promise.resolve(entityManager)
    .then((entityManager: EntityManager) => entityManager.createQueryBuilder(Field, 'field'))
    .then((qb: SelectQueryBuilder<Field>) => 
      qb.where('field.collectionId = :collectionId', _.pick(field, 'collectionId'))
        .andWhere('field.name = :name', _.pick(field, 'name'))
    )
    .then((qb: SelectQueryBuilder<Field>) => qb.setLock('pessimistic_write'))
    .then((qb: SelectQueryBuilder<Field>) => qb.getOne())
    .then(sf.thru_if_else(_.isNil)(
      // Create new record
      () => entityManager.save(field)
      // -rx- .then( sf.tap( result => logger.log( 'updateOrCreateField.save.create', {result})) )
    )(
      // Update existing record
      (fieldRecord: Field) => entityManager.update(
        Field,
        fieldRecord.id,
        _.extend( 
          _.omit(dbUtils.safeEntityUpdate(field), ['thisEid']),
          { metadata: _.extend({}, fieldRecord.metadata, field.metadata) }
        ) 
      )
      // -rx- .then( sf.tap( result => logger.log( 'updateOrCreateField.save.update', {result})) )
        .then(() => entityManager.findOne(Field, fieldRecord.id))
    ))
}

export const createOrUpdateField = (field: Field): Promise<Field> => {
  return updateOrCreateField(field)
}

export const updateFieldsBy = (options: object, set: object): Promise<any> => {
  return getFieldRepository()
    .then(sf.tap_wait(repo => repo.update(options, set)))
}

export const deleteFieldsBy = (options: object): Promise<any> => {
  return updateFieldsBy({ ...options, isDeleted: false }, { isDeleted: true })
}

export const readFieldBy = (queryFields: object): Promise<Field> => {
  return getFieldRepository()
    .then(repo => repo.findOne(queryFields))
}

export const readFieldsBy = (options: object): Promise<Field[]> => {
  return getFieldRepository()
    .then(repo => repo.find(options))
}
 
/**
 * feed is in desc order. "before" and "after" in page terms refers to "later"
 * and "earlier" in newsfeed item timestamps, respectively
 * 
 *                                cursor
 *               |<-- last n before | first n after -->|
 * 12pm  11am  10am  9am  8am  7am  6am  5am  4am  3am  2am  1am
 *
 */
export const readFieldsPageByCreatedAtDesc = (fieldsInput: FieldsInput): Promise<Field[]> => {
  const pageInput: PageInput = _.get(fieldsInput, 'pageInput', { first: DEFAULT_PAGE_SIZE, afterCursor: moment().toISOString() })
  return resolvePage(pageInput, {
    firstAfter: () => readFieldsBy({
      where: _.extend( 
        mapFieldsInputToFieldsWhere(fieldsInput),
        { createdAt: LessThan(cursorToDate(pageInput.afterCursor)) }
      ),
      order: {
        createdAt: 'DESC',
      },
      take: pageInput.first,
      cache: true,
    })
    ,
    firstBefore: () => readFieldsBy({
      where: _.extend( 
        mapFieldsInputToFieldsWhere(fieldsInput),
        { createdAt: MoreThan(misc.addMs(cursorToDate(pageInput.beforeCursor))) }
      ),
      order: {
        createdAt: 'DESC',
      },
      take: pageInput.first,
      cache: true,
    })
    ,
    lastAfter: () => readFieldsBy({
      where: _.extend( 
        mapFieldsInputToFieldsWhere(fieldsInput),
        { createdAt: LessThan(cursorToDate(pageInput.afterCursor)) }
      ),
      order: {
        createdAt: 'ASC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse)
    ,
    lastBefore: () => readFieldsBy({
      where: _.extend( 
        mapFieldsInputToFieldsWhere(fieldsInput),
        { createdAt: MoreThan(misc.addMs(cursorToDate(pageInput.beforeCursor))) }
      ),
      order: {
        createdAt: 'ASC',
      },
      take: pageInput.last,
      cache: true,
    })
      .then(_.reverse),
    
  })
}

export const mapFieldsInputToFieldsWhere = (fieldsInput: FieldsInput): any => {
  return _.pick(fieldsInput, [
    'thisEntityId',
    'thisEntityType',
    'name',
    'collectionName',
    'type',
  ])
}

export const fieldToHashStatus = (field: Field): HashStatus | null => {
  const metadata = userStates.fieldToMetadata(field)
  if (!metadata) {
    return null
  }
  // This one shouldn't be exposed to the FE (all this needs a refactor)
  delete metadata.id
  return { ...field, ...metadata, metadata }
}

export const fieldToHashtributeField = (field: Field): HashtributeField | null => {
  const metadata = hashtributes.fieldToMetadata(field)
  if (!metadata) {
    return null
  }
  
  return {
    ...field,
    // What's normally extended in the metadata, we inline into the Field as the FE expects
    ...metadata,
    metadata,
    // For backwards compatiblity
    color: null,
    isPromoted: false,
  }
}

export const numberField = (userId: string, name: string, value: Number): any => ({
  id: v4(), // generate random id
  collectionId: models.buildCollectionId(models.buildEid(EntityType.User, userId), 'field'),
  collectionName: 'count',
  scope: EntityScope.GlobalPrivateScope,
  name: name,
  type: FieldType.NumberField,
  thisEntityId: userId,
  thisEntityType: EntityType.User,
  metadata: { numberValue: value, delta: 0 },
  isDeleted: false,
  entityType: EntityType.Field,
})
