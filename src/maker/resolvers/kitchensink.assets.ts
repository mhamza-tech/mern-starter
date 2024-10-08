import {
  FieldTemplate,
  TileTemplate,
  EffectTemplate,
  NewsfeedItemTemplate,
  NumberFieldMetadata,
  JsonObjectFieldMetadata,
  TileMetadata,
  AnimationEffectMetadata,
  AnimationSequenceEffectMetadata,
  ConcurrentEffectMetadata,
  ActionXStub,
  ActionStubSet,
} from '../types'
import {
  sf,
  misc,
} from '../../utils'
import {
  FieldType,
  AnimationType,
  TileType,
  EffectType,
  EntityScope,
  Image,
  SequenceEffectMetadata,
  NativeAnimations,
  DynamicFeedItemLayout,
} from '../../gql-types'
import { ReactNativeAnimations } from 'src/maker/animations'
import {
  lotties,
  imageS3Key,
} from '../helpers'
import { SoundEffect } from '../effects'
import _ from 'lodash'
import { SYSTEM_USER_EID } from 'src/env'
import { moves } from 'src/domain/moves'
import { items } from 'src/domain/items'

export const animationUris = {
  avocadoBros: 'https://dl.dropboxusercontent.com/s/s74sy6meq77vtst/4659-avocad-bros.json',
  bouncingFruit: 'https://dl.dropboxusercontent.com/s/qj3jzdbfja0xlmo/9258-bouncing-fruits.json',
  appleBowl: 'https://dl.dropboxusercontent.com/s/z94zgmd04yb5oo5/9383-apples.json',
  greenCheck: 'https://assets10.lottiefiles.com/packages/lf20_n9uJIY.json',
  purpleSquid: 'https://assets4.lottiefiles.com/packages/lf20_kjL78F.json',
  snowman: 'https://assets1.lottiefiles.com/packages/lf20_wmaphh.json',
  popsicle: 'https://assets3.lottiefiles.com/packages/lf20_xpJbLw.json',
  hoppingBottles: 'https://assets8.lottiefiles.com/packages/lf20_kecoMV.json',
}

export const randomAnimationUri = (): string => _.sample(_.values(animationUris))

/**
 * A FieldTemplate defines the name, structure, scope, and initial value 
 * of an arbitrary piece of game state.
 * 
 * Every Field is attached to another Entity, typically a User, UnObject,
 * or ChatRoom.  
 * 
 * Fields are uniquely identified by the combination of 
 * owning-Entity + name + scope.
 * 
 * You create new instances of the Field by calling getActor().saveField().
 * The newly created Field in this case is attached to the "actor" Entity.
 * If the Field already exists for that actor, it is updated (saveField is 
 * an "upsert" operation).
 * 
 * NOTE: misc.deepFreeze "freezes" the object value to guarantee its immutability.
 * Generally we want the templates to be immutable, and we create copies whenever
 * we want to change its value.
 */
export const MyFieldTemplate = misc.deepFreeze<FieldTemplate<JsonObjectFieldMetadata>>({
  name: 'myField',
  type: FieldType.JsonObjectField,
  scope: EntityScope.ChatRoomScope,
  metadata: {
    someValue: 'initial value',
    someOtherValue: 'initial value',
  },
})

export const MyNumberFieldTemplate = misc.deepFreeze<FieldTemplate<NumberFieldMetadata>>({
  name: 'myNumberField',
  type: FieldType.NumberField,
  scope: EntityScope.ChatRoomScope,
  metadata: {
    numberValue: 3,
  },
})

/**
 * A TileTemplate defines the name, structure, scope, and initial value 
 * of a Tile.
 * 
 * Tiles are sized and located on the screen and provided with an image or
 * animation to place inside the Tile.
 * 
 * Every Tile is attached to another Entity, typically a User, UnObject,
 * or ChatRoom.  
 * 
 * Tiles are uniquely identified by the combination of 
 * owning-Entity + name + scope.
 * 
 * You create new instances of the Tile by calling getActor().saveTile().
 * The newly created Tile in this case is attached to the "actor" Entity.
 * If the Tile already exists for that actor, it is updated (saveTile is 
 * an "upsert" operation).
 * 
 */
export const MyTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.myTile',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/beer_1.png',
    },
    containerStyle: {
      bottom: 15,
      left: 22,
      height: 40,
      width: 26,
      zIndex: 10,
      borderColor: 'red',
      borderWidth: 0,
    },
  },
})

export const aceSpadesTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.ace.spades',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/ace.spades.png',
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 10,
      left: 10,
      height: 20,
      width: 20,
      zIndex: 3,
    },
  },
})

export const trollTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.troll',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    animation: {
      animationType: AnimationType.NativeAnimation,
      animation: NativeAnimations.Dizzy,
    },
    image: {
      s3Key: 'tile/troll_002.png',
    },
    containerStyle: {
      backgroundColor: 'transparent',
      bottom: 10,
      right: 10,
      height: 20,
      width: 20,
      zIndex: 5,
    },
  },
})

export const twoSpadesTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.twospades',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/two.spades.png',
    },
    containerStyle: {
      backgroundColor: 'transparent',
      bottom: 10,
      right: 40,
      height: 20,
      width: 20,
      zIndex: 5,
    },
  },
})

export const walkInCloudsTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.walkinclouds',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      uri: 'https://static.boredpanda.com/blog/wp-content/uploads/2015/09/photos-that-do-not-look-real-3__880.jpg',
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 10,
      right: 10,
      height: 20,
      width: 20,
      zIndex: 5,
    },
  },
})

export const actorImageTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.actor.image',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      // TO BE SET: uri: 'https://static.boredpanda.com/blog/wp-content/uploads/2015/09/photos-that-do-not-look-real-3__880.jpg'
    },
    containerStyle: {
      backgroundColor: 'transparent',
      bottom: 10,
      left: 10,
      height: 20,
      width: 20,
      zIndex: 5,
    },
  },
})

export const animationEffectTemplate = misc.deepFreeze<EffectTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationType: AnimationType.SourcedAnimation,
    sourceUri: animationUris.greenCheck,
  },
})

export const animGreenCheckEffectTemplate = misc.deepFreeze<EffectTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationType: AnimationType.SourcedAnimation,
    sourceUri: animationUris.greenCheck,
  },
})

export const aceSpadesAnimatingTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.ace.spades.animating',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/ace.spades.png',
    },
    animation: {
      animationType: AnimationType.SourcedAnimation,
      // sourceUri: animationUris.greenCheck,
      sourceUri: 'https://assets3.lottiefiles.com/datafiles/Ti08yTvjK9zQZ2S/data.json',
      loop: true,
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 40,
      left: 40,
      height: 20,
      width: 20,
      zIndex: 3,
    },
  },
})

export const sleepingTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.sleeping.animating',
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
      top: 20,
      left: 20,
      height: 60,
      width: 60,
      zIndex: 3,
    },
  },
})

export const mp4TileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.mp4',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    animation: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: 'https://unreal-dev-us-west-2.s3-us-west-2.amazonaws.com/mp4/magic_hands_test.mp4',
      loop: true,
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 20,
      left: 20,
      height: 60,
      width: 60,
      zIndex: 3,
    },
  },
})

export const kingSpadesAnimationSequenceTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.king.spades.animation.sequence',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/king.spades.png',
    },
    animationSequence: {
      isDeletedOnFinish: true,
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.BounceInLeft,
          duration: 1000,
        },
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.RubberBand,
          duration: 1000,
          iterationCount: 2,
          delay: 2000,
        },
        {
          animationType: AnimationType.SourcedAnimation,
          sourceUri: animationUris.greenCheck,
        },
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.RubberBand,
          duration: 1000,
        },
      ],
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 40,
      left: 20,
      height: 20,
      width: 20,
      zIndex: 3,
      borderColor: 'red',
      borderWidth: 1,
    },
  },
})

export const queenSpadesTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.queen.spades',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/queen.spades.png',
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 40,
      right: 20,
      height: 20,
      width: 20,
      zIndex: 3,
    },
  },
})

export const animationSequenceEffectTemplate = misc.deepFreeze<EffectTemplate<AnimationSequenceEffectMetadata>>({
  type: EffectType.AnimationSequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationSequence: {
      isDeletedOnFinish: true,
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.BounceInLeft,
          duration: 1000,
        },
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.RubberBand,
          duration: 1000,
          iterationCount: 2,
          delay: 2000,
        },
        {
          animationType: AnimationType.SourcedAnimation,
          sourceUri: animationUris.greenCheck,
        },
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.ZoomOut,
          duration: 1000,
        },
      ],
    },
  },
})

export const nativeAnimatableEffectTemplate = misc.deepFreeze<EffectTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationType: AnimationType.NativeAnimatableAnimation,
    animation: ReactNativeAnimations.Bounce,
    duration: 500,
  },
})

export const nodeTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.nodetile',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      // TO BE SET: uri: 'https://static.boredpanda.com/blog/wp-content/uploads/2015/09/photos-that-do-not-look-real-3__880.jpg'
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 70,
      left: 30,
      height: 20,
      width: 20,
      zIndex: 5,
    },
  },
})

export const DEFAULT_ENTRY_ID = 'LyXnQnwZPbxFoiwBg4Wno'
export const spotItSymbolTable = {
  avocado: '4BTDfSRLKp5IzrwivGu9Xu',
  bigfoot: '2hmHFbebNEh2zIdS4o0EDc',
  bigfootgreen: '6p5Rp6XQXpIYhbiTKGDgzy',
  breathmint: '4YuY64sxTTh94Bw1EyAdj7',
  buildasuperhero: 'YqD4l8WA9k3cWWL2IR6Dy',
  butt: '40HYnILJEa7WUzmmyEnnJJ',
  cemetery: '5ANTucU89VUiwfUYT4al8O',
  trumpbestwords: '3AZ6Opgk3HLaVizMRDtaSb',
  fortunecookie: '17xfTOGxjdcNCvIGCcAUDw',
  hickenlooper: '6s1EQdwyOkKy2QOcYEINQG',
  jesus: 'mPRWUyhOu4JhjpTKYxw2g',
  jokemachine: 'hQ6EidoH1lzjoWDtUrQCN',
  kitty: '5FEeTJWGl3ygHa77tRpXcu',
  magic8ball: '3BsLaXJIvFykdqIVb6T9EU',
  magicwand: '2p0dWBhvUv3LTnieGsvRPV',
  mileycyrus: 'BVhIGCraxbrbG8ievKMaH',
  nicolascage: '7rkH2pwGg3cOzxzOXOBNa6',
  psychmushroom: '4v7P6wszJPu9bTkufpxGM8',
  robotboner: '4f6N8WRcjst6lArRcx9co4',
  stinkysbar: '60DADTydQh7eVAvb2u83Sz',
  thecave: '5RpIvuY8fLGdFAsqPqNOYk',
  theoracle: '6hevHBjao3UMaWrtfCLoNo',
  unicorn: '6kkisM6CrNl1XjR7e8DsJH',
  verymagicjoint: '3PMRhACSP2GpRjQmI1eSVE',
  basicbitch: '5cO89udvmV7toimANftkqh',
  gaypenguins: '7aEE9WSGZHIPdmy7Ku895m',
  protestsign: '2E74tC2x2fcB1H9Y4Tq6X5',
  tequila: '5cO89udvmV7toimANftkqh',
  tinfoilhat: '1RVcRxvzIZyNEWSkBZyj2z',
  toilet: '5XBgpNernyBkRcPktHakmg',
  trumpresort: '3AZ6Opgk3HLaVizMRDtaSb',
  vapepen: '3PZIpWGGowjEGcn7lTNpCu',
  coldkegbeer: '3KO6heMteyOux4pOeSH0Op',
  monkeybutt: '49sWoZUVSgwvxu9ZxDOvAo',
  sexworker: '5LYCHWDHGYRTrZeiKeVxh8',
  trump: 'iiZ4GSv5lp3iKWLoESrk2',
  need0: DEFAULT_ENTRY_ID,
  need1: DEFAULT_ENTRY_ID,
  need2: DEFAULT_ENTRY_ID,
  need3: DEFAULT_ENTRY_ID,
  need4: DEFAULT_ENTRY_ID,
  need5: DEFAULT_ENTRY_ID,
  need6: DEFAULT_ENTRY_ID,
  need7: DEFAULT_ENTRY_ID,
  need8: DEFAULT_ENTRY_ID,
  need9: DEFAULT_ENTRY_ID,
  need10: DEFAULT_ENTRY_ID,
  need11: DEFAULT_ENTRY_ID,
  need12: DEFAULT_ENTRY_ID,
  need13: DEFAULT_ENTRY_ID,
  need14: DEFAULT_ENTRY_ID,
  need15: DEFAULT_ENTRY_ID,
  need16: DEFAULT_ENTRY_ID,
  need17: DEFAULT_ENTRY_ID,
  need18: DEFAULT_ENTRY_ID,
  need19: DEFAULT_ENTRY_ID,
  need20: DEFAULT_ENTRY_ID,
  need21: DEFAULT_ENTRY_ID,
}

export const staticActionNames = [
  'avocado.checkwallet',
  'avocado.shake',
  'avocado.sourcedanimation',
  'avocado.localsourcedanimation',
  'avocado.whoosh',
  'avocado.sourcedsound',
  'avocado.localsourcedsound',
  'avocado.vibrate',
  // 'avocado.createnewsfeeditem',
  // 'avocado.createnewsfeeditemratelimit',
  // 'avocado.createnewsfeeditemforactor',
  'avocado.placetile',
  'avocado.spotit',
  'avocado.clearspotit',
  'avocado.placeunobjecttile',
  'avocado.removetile',
  'avocado.animatetiles',
  'avocado.placeanimatingtile',
  // -rx- 'avocado.animationsequence',
  // -rx- 'avocado.animationsequence.2s',
  // -rx- 'avocado.animationsequence.3s',
  'avocado.animationsequenceeffect',
  'avocado.notify',
  'avocado.progressfield',
  'avocado.reset',
  'avocado.bonanza',
  'avocado.deletecomments',
  'avocado.debugfirstaidkit',
  'avocado.testanything',
  'avocado.sequenceeffect',
  'avocado.tileeffect',
  'avocado.placeprivatetiles',
  'avocado.removeprivatetiles',
  'avocado.schedulejob',
  'avocado.incrementlocalaction',
  'avocado.changetext',
  'avocado.create.sponge.action',
  'avocado.transfer.sponge.action',
  'avocado.hello.world',
  moves.punch_80.name,
  'action.test.toggleGridTile',
  'avocado.read.action.instances',
  'avocado.read.action.sponge.instances',
  'avocado.action.cooldown',
  'avocado.action.disable',
  'avocado.action.countdown.second.30',
  'avocado.action.countdown.second.30.ticker',
  'avocado.action.msg.chatstyle01',
  'avocado.modal.simple',
  'avocado.modal.simple.quarter',
  'avocado.modal.simple.confirmation',
  'avocado.modal.swippable.cards',
  'avocado.sequenceeffect.concurrent',
  'avocado.ping',
  'avocado.tapme.launch',
  'avocado.animate.native.dizzy',
  'avocado.animate.native.addToInventoryFallDownFullScreen',
  'avocado.lottie.slow.speed',
  'avocado.job.repeat',
  'avocado.job.nodeapi',
  'avocado.hashtributes.reset',
  'avocado.actionxinstances.read',
  'avocado.actionxinstances.replace',
  'avocado.getByEid',
  'avocado.counter.increase',
  'avocado.time.local',
  'avocado.newsfeed.default',
  'avocado.newsfeed.live',
  'avocado.newsfeed.expireLive',
  'avocado.newsfeed.rateLimit',
  // 'avocado.newsfeed.you',
  'avocado.nativeAnimations.orbit',
  'avocado.nativeAnimations.explosion',
  'avocado.modifiers',
  moves.debug_inspect_states_2159.name,
  moves.debug_reset_states_2160.name,
  moves.debug_reset_counters_2161.name,
  'avocado.items.grant',
].reverse()

const nameToStub = (actionName: string): ActionXStub => ({ actionName, isUsable: true })

export const actionStubSet: ActionStubSet = {
  staticActionStubs: staticActionNames.map(nameToStub),
  actionInstanceStubs: Object.keys(items).map(nameToStub),
}

export const bgColorPalette = {
  'darkorange': 'F7402D',
  'darkpink': 'ED1561',
  'purple': '9D1DB3',
  'darkpurple': '6735BA',
  'blue': '3E4EB8',
  'lightblue': '1895F6',
  'teal': '00BBD9',
  'darkgreen': '009888',
  'green': '47B14B',
  'lightgreen': '8AC441',
  // yellow: 'FFED1B',
  // lightorange: 'FFC200',
  'orange': 'FF9800',
  'tomato': 'FF560A',
  // grey: 'AFBFC6',
  'black': '273238',
}

export const firstAidAnimationSequenceTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.doctor.first.aid.animation.sequence',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: imageS3Key.FirstAidKit,
    },
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.BounceInUp,
          duration: 750,
        },
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.Tada,
          duration: 500,
          iterationCount: 1,
          delay: 100,
        },
        {
          animationType: AnimationType.SourcedAnimation,
          sourceUri: lotties.greencheck2,
        },
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FadeOutUp,
          duration: 200,
        },
      ],
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 24,
      right: 5.5,
      height: 15,
      width: 15,
      zIndex: 3,
      borderColor: 'red',
      borderWidth: 1,
    },
  },
})

export const aceSpadesTextTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.ace.spades.text',
  type: TileType.TextTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    image: {
      s3Key: 'tile/ace.spades.png',
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 30,
      left: 30,
      height: 20,
      width: 20,
      zIndex: 3,
    },
    text: 'HI!',
    textStyle: {
      color: 'green',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      alignSelf: null,
    },
  },
})

export const NewsfeedItemComposedImageRateLimitTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  rateId: null,   // set dynamically,
  rateLimit: {
    minutes: 5,
  },
  fromEid: SYSTEM_USER_EID,
  metadata: {
    // most fields set dynamically
    statusText: null,
    overlayImage: null,
    backgroundImage: {
      uri: 'https://static.boredpanda.com/blog/wp-content/uploads/2015/09/photos-that-do-not-look-real-3__880.jpg',
    },
    featuredImage: null,
    insetPlayerEid: null, // contextApi.getUnObject().getEid(),
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
      uri: 'https://static.boredpanda.com/blog/wp-content/uploads/2015/09/photos-that-do-not-look-real-3__880.jpg',
    },
    featuredImage: null,
    insetPlayerEid: null, // contextApi.getUnObject().getEid(),
  },
})

export const NewsfeedItemComposedImageWithTextTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  fromEid: SYSTEM_USER_EID,
  metadata: {
    // most fields set dynamically
    statusText: null,
    imageText: null,
    backgroundImage: {
      uri: 'https://static.boredpanda.com/blog/wp-content/uploads/2015/09/photos-that-do-not-look-real-3__880.jpg',
    },
    featuredImage: null,
  },
})

export const NewsfeedItemUnObjectImageTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  fromEid: SYSTEM_USER_EID,
  metadata: {
    // most fields set dynamically
    statusText: null,
    image: null,
    isNew: false,
  },
})

export const NewsfeedItemUnObjectCardTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic2,
  fromEid: SYSTEM_USER_EID,
  metadata: {
    // most fields set dynamically
    statusText: null,
    isNew: false,
  },
})

// TODO: const SystemMessageSequenceEffectItem = misc.deepFreeze<SequenceEffectItem>({
// TODO:     type: EffectType.SystemMessageEffect,
// TODO:     waitForTap: true,
// TODO:     isDeletedOnFinish: true,
// TODO:     metadata: {
// TODO:         text: 'Sequence Message #1 (waitForTap=true). Next a beer should bounce in from the left',
// TODO:     },
// TODO: });
// TODO: 

/**
 * 
 */
export const sequenceEffectTemplate = misc.deepFreeze<EffectTemplate<SequenceEffectMetadata>>({
  type: EffectType.SequenceEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    sequenceEffectItems: [
      {
        type: EffectType.SystemMessageEffect,
        waitForTap: true,
        isDeletedOnFinish: true,
        metadata: {
          text: 'Sequence Message #1 (waitForTap=true). Next a beer should bounce in from the left',
        },
      },
      {
        type: EffectType.TileEffect,
        waitForTap: false,
        isDeletedOnFinish: false,
        metadata: {
          name: 'effect.avocado.sequence.tile.one',
          animation: {
            animationType: AnimationType.NativeAnimatableAnimation,
            animation: 'bounceInLeft',
            duration: 1000,
          },
          image: {
            s3Key: 'tile/beer_1.png',
          },
          containerStyle: {
            backgroundColor: 'transparent',
            top: 24,
            left: 5.5,
            height: 15,
            width: 15,
            zIndex: 3,
            borderColor: 'red',
            borderWidth: 1,
          },
        },
      },
      {
        type: EffectType.SystemMessageEffect,
        waitForTap: true,
        isDeletedOnFinish: true,
        metadata: {
          text: 'Sequence Message #2 (waitForTap=true). Next the beer should play a green-check animation',
        },
      },
      {
        type: EffectType.AnimationEffect,
        waitForTap: false,
        isDeletedOnFinish: false,
        metadata: {
          tileName: 'effect.avocado.sequence.tile.one',
          animationType: AnimationType.SourcedAnimation,
          sourceUri: lotties.greencheck2,
        },
      },
      {
        type: EffectType.SystemMessageEffect,
        waitForTap: true,
        isDeletedOnFinish: true,
        metadata: {
          text: 'Sequence Message #3 (waitForTap=true). Penultimately the beer should slide up and fade out',
        },
      },
      {
        type: EffectType.AnimationEffect,
        waitForTap: false,
        isDeletedOnFinish: true,
        metadata: {
          tileName: 'effect.avocado.sequence.tile.one',
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FadeOutUp,
          duration: 200,
        },
      },
      {
        type: EffectType.SystemMessageEffect,
        waitForTap: true,
        isDeletedOnFinish: true,
        actionCallback: {
          actionName: 'avocado.sequenceeffect.actioncallback',
        },
        metadata: {
          text: 'Sequence Message #4 (waitForTap=true). Finally an actionCallback will be submitted.',
        },
      },
    ],
  },
})

export const sequenceEffectConcurrentTemplate = misc.deepFreeze<EffectTemplate<ConcurrentEffectMetadata>>({
  type: EffectType.ConcurrentEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    groups: [
      {
        duration: 2000,
        effects: [
          {
            type: EffectType.SystemMessageEffect,
            metadata: {
              text: 'Sequence Message #1 (waitForTap=true). Next a beer should bounce in from the left',
            },
          },
          new SoundEffect().load('Flip01').toEffect(),
          new SoundEffect().load('HitPunch03').toEffect(),
          new SoundEffect().load('WindBlizzard01').toEffect(),
          {
            type: EffectType.TileEffect,
            metadata: {
              name: 'effect.avocado.sequence.tile.one',
              animation: {
                animationType: AnimationType.NativeAnimatableAnimation,
                animation: 'bounceInLeft',
                duration: 2000,
              },
              image: {
                s3Key: 'tile/beer_1.png',
              },
              containerStyle: {
                backgroundColor: 'transparent',
                top: 50,
                left: 5.5,
                height: 15,
                width: 15,
                zIndex: 3,
                borderColor: 'red',
                borderWidth: 1,
              },
            },
          },
          {
            type: EffectType.TileEffect,
            metadata: {
              name: 'effect.avocado.sequence.tile.two',
              animation: {
                animationType: AnimationType.NativeAnimatableAnimation,
                animation: 'bounceInRight',
                duration: 1000,
              },
              image: {
                s3Key: 'tile/troll_002.png',
              },
              containerStyle: {
                backgroundColor: 'transparent',
                top: 50,
                right: 5.5,
                height: 15,
                width: 15,
                zIndex: 3,
                borderColor: 'green',
                borderWidth: 1,
              },
            },
          },
        ],
      },
      {
        duration: 3000,
        effects: [
          {
            type: EffectType.AnimationEffect,
            waitForTap: false,
            isDeletedOnFinish: true,
            metadata: {
              tileName: 'effect.avocado.sequence.tile.one',
              animationType: AnimationType.NativeAnimatableAnimation,
              animation: ReactNativeAnimations.FadeOutUp,
              duration: 200,
            },
          },
          {
            type: EffectType.AnimationEffect,
            waitForTap: false,
            isDeletedOnFinish: true,
            metadata: {
              tileName: 'effect.avocado.sequence.tile.two',
              animationType: AnimationType.NativeAnimatableAnimation,
              animation: ReactNativeAnimations.FadeInDownBig,
              duration: 200,
            },
          },
        ],
      },
    ],
  },
})

export const tileEffectTemplate = misc.deepFreeze<EffectTemplate<TileMetadata>>({
  type: EffectType.TileEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    name: 'effect.avocado.tileeffect.check',
    animation: {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: 'https://assets10.lottiefiles.com/packages/lf20_n9uJIY.json',
    },
    image: {
      s3Key: 'tile/beer_1.png',
    },
    text: 'Hello!',
    textStyle: {
      color: 'green',
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      alignSelf: null,
    },
    containerStyle: {
      bottom: 5,
      left: 10,
      height: 60,
      width: 80,
      zIndex: 15,
    },
  },
})

export const globalPrivateScopedTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.global.private',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalPrivateScope,
  metadata: {
    image: {
      s3Key: 'tile/eight.spades.png',
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 10,
      left: 30,
      height: 20,
      width: 20,
      zIndex: 3,
    },
  },
})

export const chatRoomPrivateScopedTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'tile.avocado.chatroom.private',
  type: TileType.ImageTile,
  scope: EntityScope.ChatRoomPrivateScope,
  metadata: {
    image: {
      s3Key: 'tile/nine.spades.png',
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 10,
      left: 50,
      height: 20,
      width: 20,
      zIndex: 3,
    },
  },
})

export const metadataStatusTextLens = sf.lens<string>('metadata.statusText')
export const metadataImageTextLens = sf.lens<string>('metadata.imageText')
export const metadataFeaturedImageLens = sf.lens<Image>('metadata.featuredImage')
export const metadataActorEidLens = sf.lens<string>('metadata.actorEid')
export const metadataInsetPlayerEidLens = sf.lens<string>('metadata.insetPlayerEid')
export const metadataIsNewLens = sf.lens<boolean>('metadata.isNew')
export const metadataUnObjectEidLens = sf.lens<string>('metadata.unObjectEid')
export const metadataAnimationLens = sf.lens<string>('metadata.animation')
export const metadataAnimationLensType = sf.lens<string>('metadata.animation.animation')
export const metadataAnimationSourceUriLens = sf.lens<string>('metadata.animation.sourceUri')
export const metadataImageLens = sf.lens<Image>('metadata.image')
export const isDeletedLens = sf.lens<boolean>('isDeleted')
export const rateIdLens = sf.lens<string>('rateId')
export const metadataExpiresAtLens = sf.lens<string>('metadata.expiresAt')
export const expiresAtLens = sf.lens<string>('expiresAt')
export const metadataTextLens = sf.lens('metadata.text')
export const metadataDropTargetLens = sf.lens<boolean>('metadata.dropTarget')
export const metadataClickCallbackLens = sf.lens<string>('metadata.clickCallback.actionName')
export const metadataNameLens = sf.lens<string>('name')

export let bigTapTroll = trollTileTemplate
bigTapTroll = metadataNameLens.set('tap.troll')(bigTapTroll)
bigTapTroll = metadataDropTargetLens.set(true)(bigTapTroll)
bigTapTroll = metadataClickCallbackLens.set('avocado.tapme.ontap')(bigTapTroll)

export let tapTrollFallToBag = trollTileTemplate
tapTrollFallToBag = metadataNameLens.set('inventory.troll')(tapTrollFallToBag)
tapTrollFallToBag = metadataAnimationLensType.set(NativeAnimations.AddToInventoryFallDownFullScreen)(tapTrollFallToBag)
