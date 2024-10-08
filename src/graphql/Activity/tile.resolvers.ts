/**
 * @rob4lderman
 * mar2020
 * 
 * 
 */
import _ from 'lodash'
import {
  combineResolvers,
} from 'graphql-resolvers'
import {
  sf,
  jwt,
} from '../../utils'
import {
  Player,
  User,
  Tile,
} from '../../db/entity'
import {
  TileType,
  TileMetadata,
  ContainerStyleV2,
} from '../../gql-types'
import * as core from '../core'
import * as store from '../store'
import * as models from '../models'
import * as userModel from '../User/user.model'
import { chompCollectionId } from '../models'

/**
 * @deprecated - not accurate anymore TODO
 * The only time a tile is NOT visible to a user is when it's a 
 * LOCAL tile in a CHAT ROOM.
 * 
 * user/myid/tile - NOT visible to me (UNLESS i'm looking at myself)
 */
const tileIsVisibleToMe = (parent, args, ctx): Promise<boolean> => {
  const sessionUser: User = ctx.user
  const eid: string[] = _.takeRight(
    _.split(chompCollectionId(_.get(parent, 'collectionId')), '/'),
    2
  )
  if (_.first(eid) == 'local') {
    return store.mapLocalIdToPlayer(_.last(eid))
      .then(sf.maybe_fmap(store.mapPlayerToUser))
      .then((user: User) => _.get(user, 'id') == sessionUser.id)
  } else {
    return Promise.resolve(true)
  }
}

const resolveTileIsLocal = (tile: Tile): boolean => {
  return models.isLocalCollectionId(tile.collectionId)
}

const resolveTileIsPrivate = (tile: Tile): boolean => {
  return _.includes(tile.collectionId, 'privatetile')
}

const resolveTileMetadataPlayer = (tileMetadata: TileMetadata): Promise<Player> => {
  return !!!_.isEmpty(tileMetadata.playerUsername)
    ? userModel.readUserByUsername(tileMetadata.playerUsername)   // TODO: cache username -> user
    : core.resolveEidToEntity<Player>('playerEid')(tileMetadata)
}

const resolveAsNumber = (key: keyof ContainerStyleV2) => (style: ContainerStyleV2): number | undefined => {
  const prop = style?.[key]
  if (_.isNumber(prop)) {
    return prop
  }
  if (_.isString(prop)) {
    return parseFloat(prop)
  }
  return undefined
}

//
// GraphQL schema resolver table.
//

export default {
  Mutation: {
    saveTile: combineResolvers(jwt.requireMasterApiKeyGql, core.saveTile),
  },
  Tile: {
    asActionTile: core.resolveAsType(TileType.ActionTile),
    isVisibleToMe: combineResolvers(jwt.requireJwtAuth, tileIsVisibleToMe),
    isPrivate: resolveTileIsPrivate,
    isLocal: resolveTileIsLocal,
  },
  TileMetadata: {
    player: resolveTileMetadataPlayer,
  },
  ContainerStyleV2: {
    left: resolveAsNumber('left'),
    right: resolveAsNumber('right'),
    top: resolveAsNumber('top'),
    bottom: resolveAsNumber('bottom'),
    width: resolveAsNumber('width'),
    height: resolveAsNumber('height'),
  },
  ActionTile: {
    action: core.resolveMetadataAction,
    image: core.resolveImageNoDefault,
  },
}
