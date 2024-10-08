import { FieldTemplate, TileTemplate, ActionStubSetMap, StringFieldMetadata } from '../types'
import { FieldType, EntityScope, TileType } from '../../gql-types'
import { misc, sf } from '../../utils'

export const stringValueLens = sf.lens('metadata.stringValue')

export const AriesTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.fortuneteller.aries',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      //s3Key: 'tile/beer_1.png',
      uri: 'https://scontent.fsfn4-1.fna.fbcdn.net/v/t1.15752-9/89569386_132965868148661_347793682692308992_n.png?_nc_cat=103&_nc_sid=b96e70&_nc_ohc=VeMfz0ERl-IAX8kZDqO&_nc_ht=scontent.fsfn4-1.fna&oh=665dda6d04548ab1986aa53f00b6931e&oe=5E949BBE',
    },
    containerStyle: {
      top: 1,
      right: 1,
      height: 30,
      width: 16,
      zIndex: 10,
      // borderColor: 'red',
      // borderWidth: 1,
    },
  },
})

export const TaurusTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.fortuneteller.taurus',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      //s3Key: 'tile/beer_1.png',
      uri: 'https://scontent.fsfn4-1.fna.fbcdn.net/v/t1.15752-9/89568709_622621678302603_5605442958531756032_n.png?_nc_cat=106&_nc_sid=b96e70&_nc_ohc=84QGOxlRL-8AX_Z1gKm&_nc_ht=scontent.fsfn4-1.fna&oh=cd974768ad81e59867a6a4c63602a4f9&oe=5E918638',
    },
    containerStyle: {
      top: 1,
      right: 1,
      height: 30,
      width: 16,
      zIndex: 10,
      // borderColor: 'red',
      // borderWidth: 1,
    },
  },
})

export const zodiacSymbolSelectedFieldTemplate = misc.deepFreeze<FieldTemplate<StringFieldMetadata>>({
  type: FieldType.StringField,
  name: 'fortuneteller.symbolSelected',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    stringValue: 'Aries',
  },
})

// export const genericTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.fortuneteller.generic',
//     type: TileType.ImageTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
//         image: {
//             //s3Key: 'tile/beer_1.png',
//             uri: 'https://scontent.fsfn4-1.fna.fbcdn.net/v/t1.15752-9/89568709_622621678302603_5605442958531756032_n.png?_nc_cat=106&_nc_sid=b96e70&_nc_ohc=84QGOxlRL-8AX_Z1gKm&_nc_ht=scontent.fsfn4-1.fna&oh=cd974768ad81e59867a6a4c63602a4f9&oe=5E918638'
//         },
//         containerStyle: {
//             top: 1,
//             right: 1,
//             height: 30,
//             width: 16,
//             zIndex: 10,
//             // borderColor: 'red',
//             // borderWidth: 1,
//         },
//     }
// });

/**
 * Actions are defined statically in yaml files under static/actions.
 * The yaml files are parsed and upserted into the DB by the server at startup.
 * E.g. 'Action.Debug.Reset' is defined in static/actions/debug.yml.
 */
export const globalActionNames = [
  'Action.Debug.Reset',
]

/**
 * "Local" actions typically refer to NPC-specific actions (i.e. actions that
 * will only ever be used inside chat rooms with this specific NPC).
 * These actions are also defined in yaml.  E.g. these actions are defined 
 * in static/actions/hammock.yml.
 */
export const localActionNames = [
  'action.fortuneteller.aries',
  'action.fortuneteller.taurus',
  'action.fortuneteller.gemini',
  'action.fortuneteller.cancer',
  'action.fortuneteller.leo',
  'action.fortuneteller.virgo',
  'action.fortuneteller.libra',
  'action.fortuneteller.scorpio',
  'action.fortuneteller.sagittarius',
  'action.fortuneteller.capricorn',
  'action.fortuneteller.aquarius',
  'action.fortuneteller.pisces',
  //
  'action.fortuneteller.health',
  'action.fortuneteller.money',
  'action.fortuneteller.career',
  'action.fortuneteller.love',
  'action.fortuneteller.choosesign',

]

export const stateActionGroups = {
  'state.fortuneteller.start': [
    'action.fortuneteller.aries',
    'action.fortuneteller.taurus',
    'action.fortuneteller.gemini',
    'action.fortuneteller.cancer',
    'action.fortuneteller.leo',
    'action.fortuneteller.virgo',
    'action.fortuneteller.libra',
    'action.fortuneteller.scorpio',
    'action.fortuneteller.sagittarius',
    'action.fortuneteller.capricorn',
    'action.fortuneteller.aquarius',
    'action.fortuneteller.pisces',
  ],

  'state.fortuneteller.chooseTopic': [
    'action.fortuneteller.health',
    'action.fortuneteller.money',
    'action.fortuneteller.career',
    'action.fortuneteller.love',
    'action.fortuneteller.choosesign',
  ],
}

export const stateActionStubSets: ActionStubSetMap = {
  'state.fortuneteller.start': {
    staticActionNames: [
      'action.fortuneteller.aries',
      'action.fortuneteller.taurus',
      'action.fortuneteller.gemini',
      'action.fortuneteller.cancer',
      'action.fortuneteller.leo',
      'action.fortuneteller.virgo',
      'action.fortuneteller.libra',
      'action.fortuneteller.scorpio',
      'action.fortuneteller.sagittarius',
      'action.fortuneteller.capricorn',
      'action.fortuneteller.aquarius',
      'action.fortuneteller.pisces',
    ],
    actionInstanceNames: [],
  },
  'state.fortuneteller.chooseTopic': {
    staticActionNames: [
      'action.fortuneteller.health',
      'action.fortuneteller.money',
      'action.fortuneteller.career',
      'action.fortuneteller.love',
      'action.fortuneteller.choosesign',
    ],
    actionInstanceNames: [],
  },
}
