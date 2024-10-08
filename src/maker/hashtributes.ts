import { LoggerFactory } from 'src/utils/logger'
import _ from 'lodash'
import { Hashtribute, HashtributeId, hashtributes } from 'src/domain/hashtributes'
import { events } from 'src/events'
import { deepFreeze, defaultsDeep, findLast } from 'src/utils/misc'
import { promiseMap } from 'src/utils/sf.typed'
import { EntityScope, Field, FieldType } from '../gql-types'
import { FieldTemplate, HashtributeFieldMetadata, NodeApi } from './types'

interface Level {
  number: number // starts at 1
  forNextLevel: number // extra points for next level
  minPoints: number // running total of points needed to get to it
  efficiency: number // how efficient the user is at this
}

let minPoints = 0
export const LEVELS = deepFreeze(_.range(1, 26).map((number) => {
  const forNextLevel = 10 + Math.round(Math.pow(number, 3.25))
  const efficiency = 1 + Math.log10(number) * 0.21
  const level = deepFreeze<Level>({ number, forNextLevel, minPoints, efficiency })
  minPoints += forNextLevel
  return level
}))

// Input is what's stored in the DB
export type HashtributeInput = Pick<HashtributeFieldMetadata, 'numberValue' | 'delta'>

// Metadata is what we actually expose to the FE and makers
type Metadata = Required<HashtributeFieldMetadata>

const logger = LoggerFactory('hashtributes', 'Hashtributes')

const getLevel = (points: number): Level => {
  return findLast(LEVELS, l => l.minPoints <= points)
}

const defaultInput: Required<HashtributeInput> = { numberValue: 0, delta: 0 }

export const hashtributeField = deepFreeze<FieldTemplate<HashtributeFieldMetadata>>({
  name: null,
  type: FieldType.HashtributeField,
  scope: EntityScope.GlobalPrivateScope,
  collectionName: 'hashtributes',
  // silence the implicit update done by the BE when saving the template
  metadata: { ...defaultInput, silent: true },
})

export const fieldToMetadata = (field: Field): Metadata | null => {
  const hashtribute = hashtributes[field.name]
  if (!hashtribute) {
    // Old entry not in the list above, skip it
    return null
  }
  // Ignore any extraneous data from metadata (from old data)
  const values: HashtributeInput = _.pick(field?.metadata, Object.keys(defaultInput))
  const metadata: Metadata = { ...getDefaultMetadata(hashtribute), ...values }
  const level = getLevel(metadata.numberValue)
  const prevLevel = getLevel(level.minPoints - 1)
  metadata.level = level.number
  metadata.prevLevelThreshold = prevLevel ? prevLevel.minPoints : 0
  metadata.thisLevelThreshold = level.minPoints
  metadata.nextLevelThreshold = level.minPoints + level.forNextLevel
  return metadata
}

export const incHashtributeRaw = async (node: NodeApi, id: HashtributeId, by: number): Promise<Metadata> => {
  const delta = Math.max(0, by)
  let metadata = await getHashtribute(node, id)
  if (!delta) {
    return metadata
  }

  metadata = await setHashtribute(node, id, { numberValue: metadata.numberValue + delta, delta })
  await events.hashtribute.increased.notify({ node, hashtribute: hashtributes[id], metadata })
  return metadata
}

// Alternative "shortcut" method with built-in standards
export const incHashtribute = (node: NodeApi, id: HashtributeId, success = true): Promise<Metadata> => {
  // it was decided to always grant 12 points for success and 2 for failure to make the math easier for the GD
  return incHashtributeRaw(node, id, success ? 12 : 2)
}

export const getHashtribute = (node: NodeApi, id: HashtributeId): Promise<Metadata> => {
  const field = defaultsDeep({ name: id, metadata: defaultInput }, hashtributeField)
  return node.field(field).then(fieldToMetadata)
}

const isSilent = (hashtribute: Hashtribute, input: HashtributeInput): boolean => {
  return !!hashtribute.silent || !input.numberValue || !input.delta
}

const setHashtribute = (node: NodeApi, id: HashtributeId, input: HashtributeInput): Promise<Metadata> => {
  const hashtribute = hashtributes[id]
  const metadata: HashtributeFieldMetadata = {
    ...input,
    // We decided to force hashtribute points to be integers
    numberValue: Math.round(input.numberValue),
    silent: isSilent(hashtribute, input),
  }
  const field = defaultsDeep({ name: id, metadata, isDeleted: !input.numberValue }, hashtributeField)
  const level = getLevel(input.numberValue)?.number
  logger.info(`${node.getName()}(${node.getEid()} is now ${input.numberValue} (level ${level}) into #${hashtribute.displayName}`)
  return node.saveField(field).then(fieldToMetadata)
}

/**
 * Checks if the last increment caused a level up
 */
export const hasJustLeveledUp = (metadata: Metadata): boolean => {
  if (!metadata.delta || !metadata.numberValue) {
    return false
  }
  return getLevel(metadata.numberValue - metadata.delta) !== getLevel(metadata.numberValue)
}

export const resetHashtribute = (node: NodeApi, id: HashtributeId): Promise<Metadata> => {
  return setHashtribute(node, id, defaultInput)
}

export const resetAllHashtributes = (node: NodeApi): Promise<Metadata[]> => {
  return node.fieldsByType(hashtributeField.type)
    .then(fields => promiseMap(fields, field => resetHashtribute(node, field.name as HashtributeId)))
}

const getDefaultMetadata = (hashtribute: Hashtribute): Metadata => ({
  ...defaultInput,
  level: LEVELS[0].number,
  nextLevelThreshold: LEVELS[0].forNextLevel,
  prevLevelThreshold: 0,
  thisLevelThreshold: 0,
  displayName: hashtribute.displayName,
  thumbImage: { s3Key: hashtribute.thumbImageS3Key },
  // For now we use the same thumb for promoted
  promotedImage: { s3Key: hashtribute.thumbImageS3Key },
  description: hashtribute.description,
  silent: hashtribute.silent,
  lastStarsDelta: 0,
})
