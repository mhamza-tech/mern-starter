/**
 * @rob4lderman
 * feb2020
 *  
 * Assets used by hammock.ts.
 * 
 * "Assets" in this case refers to the FieldTemplates, TileTemplates, 
 * EffectTemplates, Actions, etc used by this NPC.
 * 
 * The idea is to use this file to statically declare the assets used by 
 * the NPC, then import and use those assets in the handler module.
 * 
 * Check out other *.assets.ts files for examples.  A good start is:
 *      casino.assets.ts
 *      testObject001.assets.ts 
 *      kitchensink.assets.ts
 * 
 */
import {
  FieldTemplate,
  TileTemplate,
  NewsfeedItemTemplate,
  NumberFieldMetadata,
  StringFieldMetadata,
} from '../types'
import {
  FieldType,
  EntityScope,
  TileType,
  AnimationType,
  DynamicFeedItemLayout,
} from 'src/gql-types'
import {
  misc,
  sf,
} from '../../utils'
import { SYSTEM_USER_EID } from 'src/env'

export const currentStateFieldTemplate = misc.deepFreeze<FieldTemplate<StringFieldMetadata>>({
  type: FieldType.StringField,
  name: 'hammock.currentState',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    stringValue: 'state.hammock.start',
  },
})

export const sleepingTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.hammock.sleeping.animating',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
        
    animation: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: 'https://assets3.lottiefiles.com/datafiles/Ti08yTvjK9zQZ2S/data.json',
      loop: true,
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 5,
      left: 5,
      height: 30,
      width: 30,
      zIndex: 6,
    },
  },
})

export const star1TileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.hammock.star1.animating',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
        
    animation: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: 'https://assets2.lottiefiles.com/datafiles/37eUecfCINgL4BgFY1NcvncT1LRajr8hJkkfQ9DY/star/star.json',
      loop: true,
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 15,
      left: 15,
      height: 30,
      width: 30,
      zIndex: 4,
    },
  },
})

export const star2TileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.hammock.star2.animating',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
        
    animation: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: 'https://assets2.lottiefiles.com/datafiles/37eUecfCINgL4BgFY1NcvncT1LRajr8hJkkfQ9DY/star/star.json',
      loop: true,
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 15,
      right: 15,
      height: 30,
      width: 30,
      zIndex: 4,
    },
  },
})

export const star3TileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.hammock.star3.animating',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
        
    animation: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: 'https://assets2.lottiefiles.com/datafiles/37eUecfCINgL4BgFY1NcvncT1LRajr8hJkkfQ9DY/star/star.json',
      loop: true,
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 75,
      left: 15,
      height: 30,
      width: 30,
      zIndex: 4,
    },
  },
})

export const star4TileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.hammock.star4.animating',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
        
    animation: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: 'https://assets2.lottiefiles.com/datafiles/37eUecfCINgL4BgFY1NcvncT1LRajr8hJkkfQ9DY/star/star.json',
      loop: true,
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 75,
      right: 15,
      height: 30,
      width: 30,
      zIndex: 4,
    },
  },
})

export const sheepsRidingCarTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.hammock.sheepsRidingCar.animating',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
        
    animation: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: 'https://assets7.lottiefiles.com/packages/lf20_lOwP3H.json',
      loop: true,
      //loopForMs: 3000
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 30,
      right: 20,
      height: 60,
      width: 60,
      zIndex: 3,
    },
  },
})

export const potOfGoldTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.hammock.potOfGold.animating',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
        
    animation: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: 'https://assets5.lottiefiles.com/packages/lf20_hxrsEb.json',
      loop: true,
      //loopForMs: 3000
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 30,
      right: 20,
      height: 60,
      width: 60,
      zIndex: 3,
    },
  },
})

export const nightmareTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.hammock.nightmare.animating',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
        
    animation: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: 'https://assets2.lottiefiles.com/datafiles/mC4m44lb0JdgZMI/data.json',
      loop: true,
      //loopForMs: 3000
    },
    containerStyle: {
      backgroundColor: 'black',
      top: 30,
      right: 20,
      height: 60,
      width: 60,
      zIndex: 3,
    },
  },
})

// export const sparklesTileTemplate = misc.deepFreeze<TileTemplate>({
//     name: 'tile.hammock.sparkles.animating',
//     type: TileType.AnimationTile,
//     scope: EntityScope.GlobalScope,
//     metadata: {
        
//         animation: {
//             animationType: AnimationType.SourcedAnimation,
//             sourceUri: 'https://assets4.lottiefiles.com/datafiles/uPRZVpdi1M78Hhm/data.json',
//             loop: true
//         },
//         containerStyle: {
//             backgroundColor: 'transparent',
//             top: 30,
//             right: 30,
//             height: 40,
//             width: 40,
//             zIndex: 6,
//         },
//     }
// });

export const bluntsAmountFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'bluntsAmount',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: 0,
  },
})

export const hammockTightenStateFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  type: FieldType.NumberField,
  name: 'tightenState',
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: 5,
  },
})

export const NewsfeedItemComposedImageTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  fromEid: SYSTEM_USER_EID,
  metadata: {
    // most fields set dynamically
    statusText: null,   
    overlayImage: null, 
    backgroundImage: {
      uri: 'https://scontent.fsfn4-1.fna.fbcdn.net/v/t1.15752-9/89519087_587581965304763_5749710287234138112_n.png?_nc_cat=100&_nc_sid=b96e70&_nc_ohc=-AIi2Ek0lbwAX_12rzg&_nc_ht=scontent.fsfn4-1.fna&oh=771a79880de04f648a540575e82f8d22&oe=5E92A3F2',
      //uri: 'https://scontent.fsfn4-1.fna.fbcdn.net/v/t1.15752-9/89125494_131545018274874_6077787909669257216_n.png?_nc_cat=108&_nc_sid=b96e70&_nc_ohc=8lr9PhjVVHkAX-f89Ug&_nc_ht=scontent.fsfn4-1.fna&oh=fc13c54062e63971c2967fd1cce12b31&oe=5E96CF63'
      //uri: 'https://static.boredpanda.com/blog/wp-content/uploads/2015/09/photos-that-do-not-look-real-3__880.jpg'
    },
    featuredImage: null,    
    insetPlayerEid: null, 
  },
})

export const NewsfeedNightmareTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  fromEid: SYSTEM_USER_EID,
  metadata: {
    // most fields set dynamically
    statusText: null,   
    overlayImage: null, 
    backgroundImage: {
      uri: 'https://scontent.fsfn4-1.fna.fbcdn.net/v/t1.15752-9/89602503_518531119089956_8445279968916668416_n.png?_nc_cat=108&_nc_sid=b96e70&_nc_ohc=oIPKaC4RAoMAX931jZ7&_nc_ht=scontent.fsfn4-1.fna&oh=5f435997a25347ed7a69fec9f0e22538&oe=5E94D6B4',
            
    },
    featuredImage: null,    
    insetPlayerEid: null, 
  },
})

export const NewsfeedPotOfGoldTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  fromEid: SYSTEM_USER_EID,
  metadata: {
    // most fields set dynamically
    statusText: null,   
    overlayImage: null, 
    backgroundImage: {
      uri: 'https://scontent.fsfn4-1.fna.fbcdn.net/v/t1.15752-9/89472027_797765317379561_4131212906106716160_n.png?_nc_cat=107&_nc_sid=b96e70&_nc_ohc=kq1u7fsTuhUAX8qeVG6&_nc_ht=scontent.fsfn4-1.fna&oh=c36f8e5e4f22b395341207dd22cd9ab4&oe=5E959089',
            
    },
    featuredImage: null,    
    insetPlayerEid: null, 
  },
})

export const metadataStatusTextLens = sf.lens<string>('metadata.statusText')
//export const metadataImageLens = sf.lens<Image>('metadata.image');
export const metadataActorEidLens = sf.lens<string>('metadata.actorEid')
export const metadataInsetPlayerEidLens = sf.lens<string>('metadata.insetPlayerEid')

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
  'action.hammock.rest',
  'action.hammock.wakeup',
  'action.hammock.countSheep',
  'action.hammock.restCompletely',
  'action.hammock.search',
  'action.hammock.blunt',
  'action.hammock.tighten',
  'action.hammock.tightenOptions',
  'action.hammock.payAssistant',
  'action.hammock.goBack',
]

export const stateActionGroups = {
  'state.hammock.start': [
    'action.hammock.rest',
    'action.hammock.search',
    //temporary action to test baNaping
    //'action.hammock.blunt'
        
  ],
  'state.hammock.baNapAvailable': [
    'action.hammock.restCompletely',
    'action.hammock.search',
        
  ],
  'state.hammock.resting': [
    'action.hammock.wakeup',
    'action.hammock.countSheep',
  ],
  'state.hammock.baNap': [
    'action.hammock.wakeup',
  ],
  'state.hammock.bluntFound': [
    'action.hammock.rest',
    'action.hammock.restCompletely',
    'action.hammock.search',
    'action.hammock.blunt',
  ],
    
  'state.hammock.tightenRest': [
    'action.hammock.search',
    'action.hammock.rest',
    'action.hammock.tighten',
  ],
  'state.hammock.tightenBaNap': [
    'action.hammock.search',
    'action.hammock.restCompletely',
    'action.hammock.tighten',
  ],

}
