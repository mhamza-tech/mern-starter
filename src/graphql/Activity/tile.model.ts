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
} from 'typeorm'
import { sf } from '../../utils'
import { Tile } from '../../db/entity'
import { SaveTileInput } from 'src/gql-types'
import * as dbUtils from '../../db/utils'
import * as models from '../models'

const DB_CONN_NAME = TYPEORM_CONNECTION

/**
 * @return Promise w/ repository
 */
let cachedTileRepository: Repository<Tile> = null
export const getTileRepository = (): Promise<Repository<Tile>> => {
  return !!!_.isNil(cachedTileRepository)
    ? Promise.resolve(cachedTileRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Tile))
      .then(sf.tap(repository => {
        cachedTileRepository = repository
      }))
}

export const readTilesBy = (options: object): Promise<Tile[]> => {
  return getTileRepository()
    .then(repo => repo.find(options))
}

export const readTileBy = (options: object): Promise<Tile> => {
  return getTileRepository()
    .then(repo => repo.findOne(options))
}

export const mapSaveTileInputToTile = (input: SaveTileInput): Tile => {
  const retMe = new Tile()
  retMe.isDeleted = _.defaultTo(_.get(input, 'isDeleted'), false)
  retMe.metadata = input.metadata
  retMe.metadata = _.isEmpty(input.image)
    ? retMe.metadata
    : _.extend({}, retMe.metadata, { image: input.image })

  retMe.updatedAt = new Date()   // for optimistic update from cache, pubsub (which filters on updatedAt > now)
  return _.extend(
    retMe,
    _.pick(input, [
      'id',
      'collectionId',
      'name',
      'type',
      'entryId',
      's3Key',
      'thisEid',
      'scope',
    ]),
    models.mapEidToThisEntityRef(input.thisEid)
  )
}

export const createOrUpdateTile = (tile: Tile): Promise<any> => {
  return saveTile(tile)
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err))(
      err => readTileBy({
        collectionId: tile.collectionId,
        name: tile.name,
      })
        .then(sf.thru_if((tileRecord: Tile) => !!!tileRecord)(
          () => {
            throw err
          }
        ))
        // Note: had to use repo.update instead of repo.save cuz I was
        // getting weird TypeError: cannot convert object to primitive otherwise,
        // on the metadata tile.  No clue as to why the initial save w/ metadata 
        // works but a subsequent save does not.
        .then((tileRecord: Tile) => updateTile(
          tileRecord.id,
          _.extend(
            dbUtils.safeEntityUpdate(tile),
            { metadata: _.extend({}, tileRecord.metadata, tile.metadata) }
          )
        ))
    )(
      err => {
        throw err
      }
    ))
}

export const updateTile = (id: string, set: object): Promise<any> => {
  return getTileRepository()
    .then(sf.tap_wait(repo => repo.update(id, set)))
    .then(repo => repo.findOne(id))
}

export const updateTilesBy = (options: object, set: object): Promise<any> => {
  return getTileRepository()
    .then(sf.tap_wait(repo => repo.update(options, set)))
}

export const deleteTilesBy = (options: object): Promise<any> => {
  return updateTilesBy({ ...options, isDeleted: false }, { isDeleted: true })
}

export const saveTile = (tile: Tile): Promise<Tile> => {
  return getTileRepository()
    .then(repo => repo.save(tile))
}
