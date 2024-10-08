/**
 * @rob4lderman
 * dec2019
 *  
 *  common action resolver functions
 */

import {
  SetLocalStateInput,
  NodeApi,
} from '../types'
import {
  sf,
  misc,
} from '../../utils'
import {
  SaveFieldOutput,
  FieldType,
  Field,
} from '../../gql-types'
import _ from 'lodash'

export const isFirstEnter = (node: NodeApi): Promise<boolean> => {
  const input: SetLocalStateInput = {
    type: FieldType.BooleanField,
    name: '__isFirstEnter',
    metadata: {
      booleanValue: true,
    },
  }
  return node.getLocalState(input.name, input)
    .then((field: Field) => _.get(field, 'metadata.booleanValue') as boolean)
    .then(sf.tap_if(misc.isTrue)(
      () => node.setLocalState(_.merge({}, input, { metadata: { booleanValue: false } }))
    ))
}

export const resetIsFirstEnter = (node: NodeApi): Promise<SaveFieldOutput> => {
  const input: SetLocalStateInput = {
    type: FieldType.BooleanField,
    name: '__isFirstEnter',
    metadata: {
      booleanValue: true,
    },
  }
  return node.setLocalState(input)
}

// NOTE: these tiles now hardcoded - use tile id 'tile-self-view', 'layers.avatar'
// -rx- export const actorAvatarSaveTileInput:SaveTileInputInContext = {
// -rx-    name: 'actorAvatarTile',
// -rx-    type: TileType.ImageTile,
// -rx-    metadata: {
// -rx-        // assigned: image: await getActor().getImage(),
// -rx-        containerStyle: {
// -rx-            backgroundColor: 'transparent',
// -rx-            top: 10,
// -rx-            right: 10, 
// -rx-            height: 20,
// -rx-            width: 20,
// -rx-            zIndex: 5,
// -rx-        },
// -rx-    }
// -rx- };
// -rx- 
// -rx- export const partnerAvatarSaveTileInput:SaveTileInputInContext = {
// -rx-    name: 'partnerAvatarTile',
// -rx-    type: TileType.ImageTile,
// -rx-    metadata: {
// -rx-        // assigned: image: await getActor().getImage(),
// -rx-        containerStyle: {
// -rx-            backgroundColor: 'transparent',
// -rx-            top: 0,
// -rx-            left: 0, 
// -rx-            height: 100,
// -rx-            width: 100,
// -rx-            zIndex: 2,
// -rx-        },
// -rx-    }
// -rx- };
