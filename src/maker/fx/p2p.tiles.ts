
import { SaveTileInputInContext } from '../types'
import { TileType } from '../../gql-types'
import { imageS3Key } from '../helpers'

export const p2pKnifeTile: SaveTileInputInContext = {
  name: 'p2p.knife.tile',
  type: TileType.ImageTile,
  s3Key: imageS3Key.Knife,
  metadata: {
    containerStyle: {
      backgroundColor: 'transparent',
      bottom: 10,
      right: 30,
      height: 30,
      width: 30,
      zIndex: 3,
    },
  },
}
