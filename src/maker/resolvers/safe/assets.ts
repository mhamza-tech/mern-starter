import { ActionXInstance, TileType, EntityScope } from '../../../gql-types'
import { ActionX } from 'src/db/entity'
import { misc } from '../../../utils'
import { TileTemplate } from '../../types'

export interface GameState {
  inventory: ActionXInstance[]
  stored: ActionXInstance[]
  actions: ActionX[]
}

export const itemTile = misc.deepFreeze<TileTemplate>({
  name: '',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  isDeleted: false,
  metadata: {
    image: { s3Key: null },
    dropTarget: true,
    containerStyle: {
      backgroundColor: 'transparent',
      zIndex: 5,
      top: null,
      left: null,
      width: null,
      height: null,
    },
  },
})

export enum Actions {
  // TODO: Reuse this one for now, we'll need to unify actions soon
  Pick = 'action.generator.pick'
}
