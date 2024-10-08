import { misc, sf } from '../utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  SaveFieldInput,
  EntityType,
  FieldType,
  AnimationType,
  EdgeType,
  UnObjectType,
  EntityScope,
  Role,
  Gender,
} from '../gql-types'
import {
  UnObject,
  ActionX,
  Field,
  Location,
} from '../db/entity'
import { buildEnumSchema, validate } from '../utils/joi'
import path from 'path'
import YAML from 'yamljs'
import fs from 'fs'
import Joi from '@hapi/joi'
import _ from 'lodash'
import * as models from '../graphql/models'
import * as activityModel from '../graphql/Activity/activity.model'
import * as locationModel from '../graphql/Activity/location.model'
import { toPublicUrl } from 'src/services/aws'
import { items, Item } from 'src/domain/items'
import { Move, moves } from 'src/domain/moves'
import {
  mapInputToUnObject,
  readUnObjectBy,
} from 'src/graphql/Action/unobject.model'
import {
  createOrUpdateActionX,
  mapYamlActionToActionX,
  readActionXsBy,
} from 'src/graphql/Action/actionx.model'
import { saveUnObjectWithDefaultUserId } from 'src/graphql/core'
import { npcs } from 'src/domain/npcs'

const logger = LoggerFactory('actions.parser', 'ActionsParser')

/**
 * @param yamlFile 
 * @return ActionX[]
 */
const parseYamlActions = (yamlFile: string): Promise<ActionX[]> => {
  // The filename (without .yml) is also the default package (suffixes like .v2 and .old are kept)
  const defaultPackage = yamlFile.split(/[/\\]/).pop().replace('.yml', '')
  return Promise.resolve(yamlFile)
    .then(yamlFile => YAML.load(yamlFile))
    .then(sf.thru_if(val => !val)(() => {
      throw new Error('cannot find/parse yaml:' + yamlFile)
    }))
    .then(sf.list_fmap_wait((yamlAction: object) =>
      parseYamlAction({ package: defaultPackage, ...yamlAction })
    ))
    .then(sf.tap(
      (actions: ActionX[]) => logger.debug(`Successfully parsed ${actions.length} actions on ${yamlFile}`)
    ))
    .catch(sf.tap_throw(err => logger.error('ERROR: parseYaml: ', { yamlFile, err })))
    .catch(() => null)
}

export const parseYamlAction = (yamlAction: object): Promise<ActionX> => {
  logger.debug('Parsing YAML action:', yamlAction)
  return Promise.resolve(yamlAction)
    .then(cleanYamlAction)
    .then(validateYamlAction)
    .then(mapYamlActionToActionX)
    .then(createOrUpdateActionX)
    .then(sf.tap_wait(_.partial(saveDropAnimationForActionX, yamlAction)))
    .then(sf.tap((action: ActionX) => logger.debug('Successfully parsed action:', action.name)))
    .catch(sf.tap_throw(err => logger.error('ERROR: parseYaml: ', { err, yamlAction })))
    .catch(() => null)
}

const saveDropAnimationForActionX = (yamlAction: any, action: ActionX): Promise<Field> => {
  const { dropAnimationSourceUri: sourceUri, dropAnimationS3Key: s3Key } = yamlAction

  // FIXME: won't this leave it untouched if you remove?
  if (_.isUndefined(sourceUri) && _.isUndefined(s3Key)) {
    return Promise.resolve(null)
  }
  // both undefined -> keep it is (we can update all every time just in case)
  // one is null -> delete the field
  // empty string -> don't the default animation
  const input: SaveFieldInput = {
    thisEntityId: action.id,
    thisEntityType: EntityType.ActionX,
    name: 'dropAnimation',
    scope: EntityScope.GlobalScope,
    collectionId: models.buildCollectionId(models.mapEntityToEid(action), 'field'),
    type: FieldType.AnimationField,
    isDeleted: !_.isString(sourceUri) && !_.isString(s3Key),
    metadata: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: toPublicUrl(sourceUri),
      s3Key,
    },
  }
  return Promise.resolve(input)
    .then(activityModel.mapSaveFieldInputToField)
    .then(activityModel.createOrUpdateField)
}

const buildYamlActionSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    name: Joi.string().required(),
    package: Joi.string().required(),
    collectionId: Joi.string().required(),
    text: Joi.string().required(),
    description: Joi.string().required(),
    backgroundColor: Joi.string().required(),
    dropAnimationSourceUri: Joi.string().allow(null, ''),
    dropAnimationS3Key: Joi.string().allow(null, ''),
    xp: Joi.number().integer(),
    power: Joi.number().integer(),
    emoji: Joi.string().allow(null, ''),
    order: Joi.string().allow(null, ''),
    unObjectId: Joi.string().allow(null, ''),
    s3Key: Joi.string().allow(null, ''),
    imageUrl: Joi.string().allow(null, ''),
    tags: Joi.array().items(Joi.string()).min(1).max(32),
    isDeleted: Joi.boolean(),
    args: Joi.object().allow(null),
  })
}

const buildCollectionIdDefault = (yamlAction: any): string => {
  const unObjectId = _.toString(_.defaultTo(yamlAction.unObjectId, ''))
  return (!!!_.isEmpty(unObjectId) && _.isEmpty(yamlAction.collectionId))
    ? `unobject/${unObjectId}/actionx`
    : _.toLower(_.get(yamlAction, 'collectionId', 'actionx'))
}

const buildYamlActionDefaults = (yamlAction: any): object => ({
  text: _.get(yamlAction, 'name'),
  description: _.get(yamlAction, 'text', _.get(yamlAction, 'name')),
  collectionId: buildCollectionIdDefault(yamlAction),
  package: yamlAction.package || 'default',
  // s3Key: 'action/debug@3x.png',
})

const cleanYamlAction = (yamlAction: any): object => {
  return _.extend(
    {},
    buildYamlActionDefaults(yamlAction),
    yamlAction,
    _.get(yamlAction, 'unObjectId')
      ? { unObjectId: _.toString(_.get(yamlAction, 'unObjectId')) }
      : {}
    ,
    _.isEmpty(yamlAction.backgroundColor)
      ? { backgroundColor: '#00000000' } // transparent
      : { backgroundColor: misc.prependHashToColor(yamlAction.backgroundColor) }

  )
}

const validateYamlAction = (yamlAction: object): object => {
  return validate(yamlAction, buildYamlActionSchema())
}

/**
 * @return Promise w/ list of action yml files (w/ full paths)
 */
const readActionsDir = (): Promise<string[]> => {
  const dirname = path.join(__dirname, '../../static/actions/')
  return new Promise((resolve, reject) => {
    fs.readdir(
      dirname,
      (err, files) => {
        if (err) reject(err)
        resolve(_.map(files, file => path.join(dirname, file)))
      }
    )
  })
}

const deleteEdgesForDeletedUnObjects = (unObjects: UnObject[]): Promise<any> => {
  const deleted = unObjects.filter(unObject => unObject?.isDeleted)
  return Promise.resolve(deleted)
  // TODO: we could potentially delete its ChatRooms too
    .then(sf.list_fmap_wait((unObject: UnObject) => (
      activityModel.updateEdgesBy({ thatEntityId: unObject.id, thatEntityType: EntityType.UnObject }, { isDeleted: true })
    )))
}

const deleteEdgesForDeletedActions = (): Promise<unknown[]> => {
  return readActionXsBy({ isDeleted: true })
    .then(sf.list_fmap_wait(
      (action: ActionX) => activityModel.updateEdgesBy(
        {
          thatEntityId: action.id,
          edgeType: EdgeType.ActionX,
        },
        {
          isDeleted: true,
        }
      )
    ))
}

const updateActionXEdgesOrder = (): Promise<unknown[]> => {
  return readActionXsBy({ isDeleted: false })
    .then(sf.list_fmap_wait(
      (action: ActionX) => activityModel.updateEdgesBy(
        {
          thatEntityId: action.id,
          edgeType: EdgeType.ActionX,
        },
        {
          order: _.defaultTo(action.order, ''),
        }
      )
    ))
}

/**
 * @param yamlFile 
 * @return ActionX[]
 */
const parseYamlUnObjects = (yamlFile: string): Promise<UnObject[]> => {
  return Promise.resolve(yamlFile)
    .then(yamlFile => YAML.load(yamlFile))
    .then(sf.thru_if(val => !val)(() => {
      throw new Error('cannot find/parse yaml:' + yamlFile)
    }))
    .then((unObjects: object[]) => [...unObjects, ...getAirtableNPCs()])
    .then(sf.tap((unObjects: object[]) => logger.info(`Parsing ${unObjects.length} UnObjects, will take a while`)))
    .then(sf.list_fmap_wait(parseYamlUnObject))
    .catch(sf.tap_throw(err => logger.error('ERROR: parseYamlUnObjects: ', { yamlFile, err })))
    .catch(() => null)
}

/**
 * Cleans, parses, validates, and upserts into db.
 * @param yamlUnObject 
 */
const parseYamlUnObject = (yamlUnObject: object): Promise<UnObject> => {
  logger.debug('Parsing YAML UnObject:', yamlUnObject)
  return Promise.resolve(yamlUnObject)
    .then(mapInputToUnObject)
    .then(validateUnObject)
    .then(saveUnObjectWithDefaultUserId)
    .then(sf.tap_wait(_.partial(saveUnObjectLocation, yamlUnObject)))
    .then(sf.tap((unObject: UnObject) => logger.debug(`Successfully parsed unobject: ${unObject.name} (${unObject.id})`)))
    .catch(sf.tap_throw(err => logger.error('ERROR: parseYamlUnObject: ', { err, yamlUnObject })))
    .catch(() => null)
}

const saveUnObjectLocation = (yamlUnObject: any, dbUnObject: UnObject): Promise<Location> => {
  if (_.isEmpty(yamlUnObject.location)) {
    return Promise.resolve(null)
  }
  return readUnObjectBy({ id: dbUnObject.id })  // TODO: cuz sometimes dbUnObject doesn't have entityType set
    .then((dbUnObject: UnObject) => locationModel.mapYamlUnObjectToLocation(yamlUnObject, dbUnObject))
    .then(locationModel.updateOrCreateLocation)
}

const buildYamlLocationSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    x: Joi.number().integer().required(),
    y: Joi.number().integer().required(),
  })
}

const buildYamlUnObjectSchema = (): Joi.ObjectSchema<any> => {
  return Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    bio: Joi.string().allow('').required(),
    createdByUserId: Joi.string(),
    unObjectType: buildEnumSchema(UnObjectType),
    isFeatured: Joi.boolean().required(),
    isDeleted: Joi.boolean().required(),
    emoji: Joi.string().allow(''),
    entryId: Joi.string(),
    s3Key: Joi.string().allow(null),
    location: buildYamlLocationSchema(),
    imageUrl: Joi.string().allow(null, ''),
    gradientS3Key: Joi.string(),
    featuredSortKey: Joi.string().allow(null),
    backgroundColor: Joi.string().required(),
    hashtribute: Joi.string().allow(null),
    actionSheetBackgroundColor: Joi.string(),
    showBackpack: Joi.boolean().required(),
    showControlBar: Joi.boolean().required(),
    showResetButton: Joi.boolean().required(),
    allowHashtributeNotifications: Joi.boolean().required(),
    disableButtonsUponAction: Joi.boolean().required(),
    minOccupancy: Joi.number().integer().required(),
    maxOccupancy: Joi.number().integer().allow(null),
    backgroundS3Key: Joi.string().allow(null),
    coverS3Key: Joi.string().allow(null),
    socialTitle: Joi.string().required(),
    socialDescription: Joi.string().required(),
    socialImageS3Key: Joi.string(),
    visibleForRole: buildEnumSchema(Role),
    isDestination: Joi.boolean().required(),
    minUserAge: Joi.number().required(),
    gender: buildEnumSchema(Gender),
  })
}

const validateUnObject = (unObject: UnObject): UnObject => {
  return validate(unObject, buildYamlUnObjectSchema())
}

const getAirtableActionXs = (): Partial<ActionX>[] => {
  // Items and Moves from Airtable have attributes not in ActionX, so we need to filter them for the parser
  const keys: (keyof ActionX & keyof Item & keyof Move)[] = ['backgroundColor', 'description', 'isDeleted', 'name', 's3Key', 'text']
  // Temporary until we clean all this up
  keys.push('dropAnimationS3Key' as any)
  return [...Object.values(items), ...Object.values(moves)].map(itemOrMove => _.pick(itemOrMove, keys))
}

const getAirtableNPCs = (): Partial<UnObject>[] => {
  return Object.values(npcs).map(npc => {
    const unObject = _.omit(npc, ['eid', 'rewards', 'hashtribute', 'prefix', 'handler'])
    // The ones in the DB use the displayName
    return { ...unObject, hashtribute: npc.hashtribute?.displayName || null }
  })
}

/**
 * @return nothing
 */
export const readAndParseYamlActions = (): Promise<any> => {
  return readActionsDir()
    .then(sf.tap(files => logger.info(`Parsing ${files.length} action files, this will take a while...`)))
    .then(sf.list_fmap_wait(parseYamlActions))
    .then(_.flatten)
    .then(sf.tap(() => logger.info('Including the items and moves imported from Airtable')))
    .then((actions: ActionX[]) => (
      Promise.all([...actions, ...getAirtableActionXs().map(parseYamlAction)])
    ))
    .then(sf.tap((actions: ActionX[]) => logger.info(`Loaded ${actions.length} actions`)))
    .then(logger.traceFn('CONSISTENCY:deleteEdgesForDeletedActions', deleteEdgesForDeletedActions))
    .then(logger.traceFn('CONSISTENCY:updateActionXEdgesOrder', updateActionXEdgesOrder))
}

export const readAndParsedYamlUnObjects = (): Promise<UnObject[]> => {
  const yamlFile = path.join(__dirname, '../../static/unobjects/unobjects.yml')
  return parseYamlUnObjects(yamlFile)
    .then(_.flatten)
    .then(sf.tap((unObjects: UnObject[]) => logger.info(`Loaded ${unObjects.length} UnObjects`)))
    .then(logger.traceFn('CONSISTENCY:deleteEdgesForDeletedUnObjects', deleteEdgesForDeletedUnObjects))
}
