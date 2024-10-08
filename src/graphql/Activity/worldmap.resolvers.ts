/**
 * @rob4lderman
 * feb2020
 */

import {
  WorldMap,
  EntityType,
  TileType,
  EntityScope,
  HandlerUnObjectsOutput,
} from '../../gql-types'
import {
  Tile, Player,
} from '../../db/entity'
import moment from 'moment'
import _ from 'lodash'
import {
  TileTemplate,
} from 'src/types'
import {
  misc,
} from '../../utils'
import * as userModel from '../User/user.model'
import Bluebird from 'bluebird'
import { featuredHandlerUnObjects } from '../Action/unobject.resolvers'
import { In } from 'typeorm'

const createdAtDate = moment('2020-02-18T00:00:00.000Z').toDate()

const commonTileData = misc.deepFreeze({
  entityType: EntityType.Tile,
  type: TileType.WorldMapTile,
  collectionId: 'worldmap/tile',
  scope: EntityScope.GlobalScope,
  thisEntityId: null,
  thisEntityType: null,
  thisEid: null,
  entryId: null,
  s3Key: null,
  imageUrl: null,
  metadata: null,
  isDeleted: false,
  createdAt: createdAtDate,
  updatedAt: createdAtDate,
  recordVersion: 1,
})

// const drSpacemanTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.worldmap.drspaceman',
//     type: TileType.WorldMapTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         containerStyle: {
//             bottom: 42,
//             right: 8,
//             width: 20,
//             height: 27,
//         },
//         playerEid: 'unobject/55',
//     }
// });

// const gnomeTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.worldmap.gnome',
//     type: TileType.WorldMapTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         containerStyle: {
//             bottom: 68,
//             left: 2,
//             width: 21,
//             height: 28,
//         },
//         playerEid: 'unobject/70',
//     }
// });

const hairMonsterTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.worldmap.hairy.monster',
  type: TileType.WorldMapTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    containerStyle: {
      bottom: 66,
      left: 18,
      width: 21,
      height: 28,
    },
    playerEid: 'unobject/npc.jt.hairy.monster',
  },
})

const hostTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.worldmap.host.jeff',
  type: TileType.WorldMapTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    // image: {
    //     s3Key: 'tile/card.eight.spades.png',
    //     // uri: 
    // },
    containerStyle: {
      bottom: 110,
      left: 26,
      width: 15,
      height: 20,
    },
    playerUsername: 'ferris',
  },
})

// const hauntedHouseTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.worldmap.hauntedhouse',
//     type: TileType.WorldMapTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         containerStyle: {
//             bottom: 100,
//             right: 25,
//             width: 21,
//             height: 28,
//         },
//         playerEid: 'unobject/67',
//     }
// });

// const bigfootTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.worldmap.bigfoot',
//     type: TileType.WorldMapTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         containerStyle: {
//             bottom: 100,
//             left: 10,
//             width: 21,
//             height: 28,
//         },
//         playerEid: 'unobject/71',
//     }
// });

const joeBlueTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.worldmap.blue.joe',
  type: TileType.WorldMapTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    containerStyle: {
      bottom: 90,
      left: 65,
      width: 21,
      height: 28,
    },
    playerEid: 'unobject/npc.jt.blue.joe',
  },
})

const welcomeBotTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.worldmap.welcomebot',
  type: TileType.WorldMapTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    containerStyle: {
      bottom: 18,
      left: 38,
      width: 25,
      height: 30,
    },
    playerEid: 'unobject/66',
  },
})

const buildTile = (tileTemplate: TileTemplate): Tile => {
  const tile = new Tile()
  tile.id = tileTemplate.name
  return _.extend(
    tile,
    commonTileData,
    tileTemplate
  )
}

const resolveWorldMapTiles = (): Tile[] => {
  // return [
  //     buildTile( welcomeBotTileTemplate ),
  //     buildTile( drSpacemanTileTemplate ),
  //     buildTile( gnomeTileTemplate ),
  //     buildTile( hauntedHouseTileTemplate ),
  //     buildTile( bigfootTileTemplate ),
  // ];

  return [
    buildTile(welcomeBotTileTemplate),
    buildTile(hairMonsterTileTemplate),
    buildTile(joeBlueTileTemplate),
    buildTile(hostTileTemplate),
    // buildTile(hauntedHouseTileTemplate),
    // buildTile(bigfootTileTemplate),
  ]
}

const worldMapUsernames = [
  'roba',
  'jeff',
]

const resolveWorldMapPlayers = (root, args, ctx): Promise<Player[]> => {
  return Promise.all([
    featuredHandlerUnObjects(root, args, ctx)
      .then((output: HandlerUnObjectsOutput) => output.handlerUnObjects)
    ,
    // TODO: cache user by username
    userModel.readUsersBy({
      username: In(worldMapUsernames),
    }),
  ])
    .then(_.flatten as any)
}

const resolveWorldMap = (root, args, ctx): Promise<WorldMap> => {
  return Bluebird.Promise.props({
    tiles: resolveWorldMapTiles(),
    players: resolveWorldMapPlayers(root, args, ctx),
  })
}

export default {
  Query: {
    worldMap: resolveWorldMap,
  },
}
