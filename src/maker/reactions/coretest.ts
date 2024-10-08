/**
 * @rob4lderman
 * nov2019
 */

import {
  sf,
  misc,
} from '../../utils'
import _ from 'lodash'
import { registerReactionFnByName } from '../../enginev3'
import Bluebird from 'bluebird'
import {
  ChatRoomActionContextApi,
  SaveTileInputInContext,
  EffectTemplate,
  TileTemplate,
  AnimationEffectMetadata,
  NewsfeedItemTemplate,
} from '../types'
import {
  AnimationType,
  TileType,
  Image,
  SaveImageInput,
  NewsfeedItem,
  EffectType,
  Tile,
  EntityScope,
  DynamicFeedItemLayout,
} from '../../gql-types'
import * as makerApi from '../api/MakerApi'
import { SYSTEM_USER_EID } from 'src/env'

const animationUris = {
  avocadoBros: 'https://dl.dropboxusercontent.com/s/s74sy6meq77vtst/4659-avocad-bros.json',
  bouncingFruit: 'https://dl.dropboxusercontent.com/s/qj3jzdbfja0xlmo/9258-bouncing-fruits.json',
  appleBowl: 'https://dl.dropboxusercontent.com/s/z94zgmd04yb5oo5/9383-apples.json',
  greenCheck: 'https://assets10.lottiefiles.com/packages/lf20_n9uJIY.json',
  purpleSquid: 'https://assets4.lottiefiles.com/packages/lf20_kjL78F.json',
  snowman: 'https://assets1.lottiefiles.com/packages/lf20_wmaphh.json',
  popsicle: 'https://assets3.lottiefiles.com/packages/lf20_xpJbLw.json',
  hoppingBottles: 'https://assets8.lottiefiles.com/packages/lf20_kecoMV.json',

}

const randomAnimationUri = (): string => _.sample(_.values(animationUris))

const s3Keys = {
  beer: 'tile/beer_1.png',
  gun: 'tile/machine_gun.png',
  troll: 'tile/troll_1.png',
}

const randomS3Key = (): string => _.sample(_.values(s3Keys))

// set image, entryId, or s3Key dynamically
const tileUpperRight: SaveTileInputInContext = {
  name: 'tileUpperRight',
  type: TileType.ImageTile,
  metadata: {
    containerStyle: {
      backgroundColor: 'transparent',
      top: 10,
      right: 30,
      height: 20,
      width: 20,
      zIndex: 5,
    },
  },
}

const tileLowerRight: SaveTileInputInContext = {
  name: 'tileLowerRight',
  type: TileType.ImageTile,
  metadata: {
    containerStyle: {
      backgroundColor: 'transparent',
      bottom: 10,
      right: 30,
      height: 20,
      width: 20,
      zIndex: 3,
    },
  },
}

const gridTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'reserved.tile.grid',
  type: TileType.ImageTile,
  scope: EntityScope.GlobalScope,
  isDeleted: true,    // inits to true, first toggle will set it to false
  metadata: {
    image: {
      s3Key: 'overlay/grid.png',
    },
    containerStyle: {
      top: 0,
      left: 0,
      bottom: null,
      right: null,
      height: 99,
      width: 99,
      zIndex: 1000,
    },
  },
})

const actionTestToggleGridTile = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return contextApi.getChatRoom().tile(gridTileTemplate)
    .then((tile: Tile) => Promise.all([
      contextApi.getActor().sendSystemMessage(tile.isDeleted ? 'applying grid' : 'removing grid'),
      contextApi.getChatRoom().saveTile(sf.lens('isDeleted').set(!!!tile.isDeleted)(gridTileTemplate)),
    ]))
}

//
// FOR TESTING
// 

const sourcedAnimationEffectTemplate = misc.deepFreeze<EffectTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationType: AnimationType.SourcedAnimation,
    sourceUri: '', // set dynamically
  },
})

const tileIdLens = sf.lens('metadata.tileId')
const sourceUriLens = sf.lens('metadata.sourceUri')
const scopeLens = sf.lens('scope')

const actionLocalLottie = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.resolve(sourcedAnimationEffectTemplate)
    .then(scopeLens.set(EntityScope.ChatRoomScope))
    .then(sourceUriLens.set(randomAnimationUri()))
    .then(contextApi.getPartner().saveEffect)
}

const actionGlobalLottie = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.resolve(sourcedAnimationEffectTemplate)
    .then(sourceUriLens.set(randomAnimationUri()))
    .then(contextApi.getChatRoom().saveEffect)
}

const lottiePartner = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.resolve(sourcedAnimationEffectTemplate)
    .then(tileIdLens.set('layers.avatar'))
    .then(sourceUriLens.set(randomAnimationUri()))
    .then(contextApi.getChatRoom().saveEffect)
}

const lottieSelf = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.resolve(sourcedAnimationEffectTemplate)
    .then(tileIdLens.set('tile-self-view'))
    .then(sourceUriLens.set(randomAnimationUri()))
    .then(contextApi.getChatRoom().saveEffect)
}

const shakeLocalTile = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const tile = _.merge({}, tileUpperRight, { s3Key: randomS3Key() })
  const retMe = contextApi.getActor().saveLocalTile(tile)
  retMe
    .then(sf.pause(3 * 1000))
    // .then(() => contextApi.getActor().doLocalAnimationOnLocalTile(tile, AnimationType.NativeShakeAnimation))
    .then(sf.pause(6 * 1000))
    .then(() => contextApi.getActor().deleteLocalTile(tile.name))

  return retMe
}

const lottieLocalTile = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const tile = _.merge({}, tileUpperRight, { s3Key: randomS3Key() })
  const retMe = contextApi.getActor().saveLocalTile(tile)
  retMe
    .then(sf.pause(3 * 1000))
    .then(() => contextApi.getActor().doLocalAnimationOnLocalTile(tile, AnimationType.SourcedAnimation, { animationType: AnimationType.SourcedAnimation, sourceUri: randomAnimationUri() }))
    .then(sf.pause(6 * 1000))
    .then(() => contextApi.getActor().deleteLocalTile(tile.name))

  return retMe
}

const actionNewsfeedItem = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return Promise.all([
    contextApi.getActor().getImage()
      .then((image: Image) => contextApi.createNewsfeedItemUnObjectImage(
        `TEST post generated by {{ linkName actor }} in {{ hisher actor }} chat with {{ linkName partner }}, whose s3Key=${_.get(image, 's3Key')}`,
        {
          uri: 'https://static.boredpanda.com/blog/wp-content/uploads/2015/09/photos-that-do-not-look-real-3__880.jpg',
        }
      ))
    ,
    createNewsfeedItemUnObjectImageForPartner(contextApi)
    ,
    createNewsfeedItemStatusUpdate(contextApi),

  ])
}

const createNewsfeedItemUnObjectImageForPartner = (contextApi: ChatRoomActionContextApi): Promise<NewsfeedItem> => {
  const saveImageInput: SaveImageInput = {
    uri: 'https://static.boredpanda.com/blog/wp-content/uploads/2015/09/photos-that-do-not-look-real-3__880.jpg',
  }
  const statusText = 'TEST post generated by {{ linkName partner }} on behalf of {{ linkName actor }}'
  const input: NewsfeedItemTemplate = {
    layout: DynamicFeedItemLayout.Dynamic1,
    fromEid: SYSTEM_USER_EID,
    metadata: {
      statusText: statusText,
      image: saveImageInput,
    },
  }
  return makerApi.saveNewsfeedItem(contextApi.getContext(), input)
}

const createNewsfeedItemStatusUpdate = (contextApi: ChatRoomActionContextApi): Promise<NewsfeedItem> => {
  const statusText = 'TEST status update generated by {{ linkName actor }}'
  const input: NewsfeedItemTemplate = {
    layout: DynamicFeedItemLayout.Dynamic1,
    fromEid: SYSTEM_USER_EID,
    metadata: {
      statusText: statusText,
    },
  }
  return makerApi.saveNewsfeedItem(contextApi.getContext(), input)
}

//
// set*TileOnActor
// 
// not working:
// const actionTestSetLocalTileOnActor = (contextApi: ChatRoomActionContextApi) => {
// const actionTestSetPrivateLocalTileOnActor = (contextApi: ChatRoomActionContextApi) => {
// const actionTestSetPrivateGlobalTileOnActor = (contextApi: ChatRoomActionContextApi) => {

// const actionTestSetLocalTileOnPartner = (contextApi: ChatRoomActionContextApi) => {
// const actionTestSetPrivateLocalTileOnPartner = (contextApi: ChatRoomActionContextApi) => {
// const actionTestSetPrivateGlobalTileOnPartner = (contextApi: ChatRoomActionContextApi) => {

// const actionTestSetLocalTileOnChatRoom = (contextApi: ChatRoomActionContextApi) => {
// const actionTestDoLocalEffectOnChatRoom = (contextApi: ChatRoomActionContextApi) => {

// fri: not working
const actionTestSetLocalTileOnActor = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const tile = _.merge({}, tileLowerRight, { s3Key: randomS3Key() })
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The tile should be visible to ${contextApi.getPartner().getName()} in THIS chat room only`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    tile: contextApi.getActor().setLocalTile(tile.name, tile)
      .then(sf.pause(2 * 1000))
      .then(() => contextApi.getActor().deleteLocalTile(tile.name)),

  })
}

// fri: not working
const actionTestSetPrivateLocalTileOnActor = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const tile = _.merge({}, tileLowerRight, { s3Key: randomS3Key() })
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The tile should be visible to ${contextApi.getActor().getName()} in THIS chat room only`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    tile: contextApi.getActor().setPrivateLocalTile(tile.name, tile)
      .then(sf.pause(2 * 1000))
      .then(() => contextApi.getActor().deletePrivateLocalTile(tile.name)),

  })
}

// fri: works!
const actionTestSetGlobalTileOnActor = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const tile = _.merge({}, tileLowerRight, { s3Key: randomS3Key() })
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The tile should be visible to ${contextApi.getActor().getName()}'s PARTNERs in EVERY chat room `
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    tile: contextApi.getActor().setGlobalTile(tile.name, tile)
      .then(sf.pause(2 * 1000))
      .then(() => contextApi.getActor().deleteGlobalTile(tile.name)),

  })
}

// fri: not working
const actionTestSetPrivateGlobalTileOnActor = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const tile = _.merge({}, tileLowerRight, { s3Key: randomS3Key() })
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The tile should be visible to ${contextApi.getActor().getName()} in EVERY chat room`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    tile: contextApi.getActor().setPrivateGlobalTile(tile.name, tile)
      .then(sf.pause(2 * 1000))
      .then(() => contextApi.getActor().deletePrivateGlobalTile(tile.name)),

  })
}

///
// set*TileOnPartner
// 

// fri: not working
const actionTestSetLocalTileOnPartner = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const tile = _.merge({}, tileLowerRight, { s3Key: randomS3Key() })
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The tile should be visible to ${contextApi.getActor().getName()} in THIS chat room only`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    tile: contextApi.getPartner().setLocalTile(tile.name, tile)
      .then(sf.pause(2 * 1000))
      .then(() => contextApi.getPartner().deleteLocalTile(tile.name)),

  })
}

// fri: not working
const actionTestSetPrivateLocalTileOnPartner = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const tile = _.merge({}, tileLowerRight, { s3Key: randomS3Key() })
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The tile should be visible to ${contextApi.getPartner().getName()} in THIS chat room only`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    tile: contextApi.getPartner().setPrivateLocalTile(tile.name, tile)
      .then(sf.pause(2 * 1000))
      .then(() => contextApi.getPartner().deletePrivateLocalTile(tile.name)),

  })
}

// fri: works
const actionTestSetGlobalTileOnPartner = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const tile = _.merge({}, tileLowerRight, { s3Key: randomS3Key() })
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The tile should be visible to ${contextApi.getPartner().getName()}'s PARTNERs in EVERY chat room `
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    tile: contextApi.getPartner().setGlobalTile(tile.name, tile)
      .then(sf.pause(2 * 1000))
      .then(() => contextApi.getPartner().deleteGlobalTile(tile.name)),

  })
}

// fri: not working
const actionTestSetPrivateGlobalTileOnPartner = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const tile = _.merge({}, tileLowerRight, { s3Key: randomS3Key() })
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The tile should be visible to ${contextApi.getPartner().getName()} in EVERY chat room`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    tile: contextApi.getPartner().setPrivateGlobalTile(tile.name, tile)
      .then(sf.pause(2 * 1000))
      .then(() => contextApi.getPartner().deletePrivateGlobalTile(tile.name)),

  })
}

//
// set*TileOnChatRoom
//

// fri: not working
const actionTestSetLocalTileOnChatRoom = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const tile = _.merge({}, tileLowerRight, { s3Key: randomS3Key() })
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The tile should be visible to BOTH players in THIS chat room only`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    tile: contextApi.getChatRoom().setLocalTile(tile.name, tile)
      .then(sf.pause(2 * 1000))
      .then(() => contextApi.getChatRoom().deleteLocalTile(tile.name)),

  })
}

// fri: working
const actionTestSetGlobalTileOnChatRoom = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const tile = _.merge({}, tileLowerRight, { s3Key: randomS3Key() })
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The tile should be visible to BOTH players in THIS chat room only`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    tile: contextApi.getChatRoom().setGlobalTile(tile.name, tile)
      .then(sf.pause(2 * 1000))
      .then(() => contextApi.getChatRoom().deleteGlobalTile(tile.name)),

  })
}

//
// do*EffectOnActor
//

// fri: works!
const actionTestDoLocalEffectOnActor = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The effect should be visible to ${contextApi.getPartner().getName()} in THIS chat room only`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    effect: contextApi.getActor().doLocalEffect(EffectType.AnimationEffect, {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: randomAnimationUri(),
    }),
  })
}

// fri: works
const actionTestDoPrivateLocalEffectOnActor = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The effect should be visible to ${contextApi.getActor().getName()} in THIS chat room only`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    effect: contextApi.getActor().doPrivateLocalEffect(EffectType.AnimationEffect, {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: randomAnimationUri(),
    }),
  })
}

// fri: works!
const actionTestDoGlobalEffectOnActor = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The effect should be visible to ${contextApi.getActor().getName()}'s PARTNERs in EVERY chat room `
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    effect: contextApi.getActor().doGlobalEffect(EffectType.AnimationEffect, {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: randomAnimationUri(),
    }),
  })
}

// fri: works!
const actionTestDoPrivateGlobalEffectOnActor = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The effect should be visible to ${contextApi.getActor().getName()} in EVERY chat room`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    effect: contextApi.getActor().doPrivateGlobalEffect(EffectType.AnimationEffect, {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: randomAnimationUri(),
    }),
  })
}

//
// do*EffectOnPartner
//

// fri: works
const actionTestDoLocalEffectOnPartner = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The effect should be visible to ${contextApi.getActor().getName()} in THIS chat room only`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    effect: contextApi.getPartner().doLocalEffect(EffectType.AnimationEffect, {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: randomAnimationUri(),
    }),
  })
}

// fri: works
const actionTestDoPrivateLocalEffectOnPartner = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The effect should be visible to ${contextApi.getPartner().getName()} in THIS chat room only`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    effect: contextApi.getPartner().doPrivateLocalEffect(EffectType.AnimationEffect, {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: randomAnimationUri(),
    }),
  })
}

// fri: works
const actionTestDoGlobalEffectOnPartner = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The effect should be visible to ${contextApi.getPartner().getName()}'s PARTNERs in EVERY chat room `
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    effect: contextApi.getPartner().doGlobalEffect(EffectType.AnimationEffect, {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: randomAnimationUri(),
    }),
  })
}

// fri: works
const actionTestDoPrivateGlobalEffectOnPartner = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The effect should be visible to ${contextApi.getPartner().getName()} in EVERY chat room`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    effect: contextApi.getPartner().doPrivateGlobalEffect(EffectType.AnimationEffect, {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: randomAnimationUri(),
    }),
  })
}

//
// do*EffectOnChatRoom
///

// fri: not working
const actionTestDoLocalEffectOnChatRoom = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The effect should be visible to BOTH players in THIS chat room only`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    effect: contextApi.getChatRoom().doLocalEffect(EffectType.AnimationEffect, {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: randomAnimationUri(),
    }),
  })
}

// fri: works
const actionTestDoGlobalEffectOnChatRoom = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const msg = `${contextApi.getActor().getName()} ran ${contextApi.getCurrentActionName()}. The effect should be visible to BOTH players in THIS chat room only`
  return Bluebird.Promise.props({
    actorSystemMessage: contextApi.getActor().sendSystemMessage(msg),
    partnerSystemMessage: contextApi.getPartner().sendSystemMessage(msg),
    effect: contextApi.getChatRoom().doGlobalEffect(EffectType.AnimationEffect, {
      animationType: AnimationType.SourcedAnimation,
      sourceUri: randomAnimationUri(),
    }),
  })
}

const load = (): void => {
  registerReactionFnByName('localLottie', actionLocalLottie)
  registerReactionFnByName('globalLottie', actionGlobalLottie)
  // registerReactionFnByName('shakePartner', actionShakePartner)
  // registerReactionFnByName('shakeSelf', shakeSelf)
  registerReactionFnByName('lottiePartner', lottiePartner)
  registerReactionFnByName('lottieSelf', lottieSelf)
  registerReactionFnByName('shakeLocalTile', shakeLocalTile)
  registerReactionFnByName('lottieLocalTile', lottieLocalTile)
  registerReactionFnByName('newsfeedItem', actionNewsfeedItem)
  registerReactionFnByName('action.test.setLocalTileOnActor', actionTestSetLocalTileOnActor)
  registerReactionFnByName('action.test.setPrivateLocalTileOnActor', actionTestSetPrivateLocalTileOnActor)
  registerReactionFnByName('action.test.setGlobalTileOnActor', actionTestSetGlobalTileOnActor)
  registerReactionFnByName('action.test.setPrivateGlobalTileOnActor', actionTestSetPrivateGlobalTileOnActor)
  registerReactionFnByName('action.test.setLocalTileOnPartner', actionTestSetLocalTileOnPartner)
  registerReactionFnByName('action.test.setPrivateLocalTileOnPartner', actionTestSetPrivateLocalTileOnPartner)
  registerReactionFnByName('action.test.setGlobalTileOnPartner', actionTestSetGlobalTileOnPartner)
  registerReactionFnByName('action.test.setPrivateGlobalTileOnPartner', actionTestSetPrivateGlobalTileOnPartner)
  registerReactionFnByName('action.test.setLocalTileOnChatRoom', actionTestSetLocalTileOnChatRoom)
  registerReactionFnByName('action.test.setGlobalTileOnChatRoom', actionTestSetGlobalTileOnChatRoom)
  registerReactionFnByName('action.test.doLocalEffectOnActor', actionTestDoLocalEffectOnActor)
  registerReactionFnByName('action.test.doPrivateLocalEffectOnActor', actionTestDoPrivateLocalEffectOnActor)
  registerReactionFnByName('action.test.doGlobalEffectOnActor', actionTestDoGlobalEffectOnActor)
  registerReactionFnByName('action.test.doPrivateGlobalEffectOnActor', actionTestDoPrivateGlobalEffectOnActor)
  registerReactionFnByName('action.test.doLocalEffectOnPartner', actionTestDoLocalEffectOnPartner)
  registerReactionFnByName('action.test.doPrivateLocalEffectOnPartner', actionTestDoPrivateLocalEffectOnPartner)
  registerReactionFnByName('action.test.doGlobalEffectOnPartner', actionTestDoGlobalEffectOnPartner)
  registerReactionFnByName('action.test.doPrivateGlobalEffectOnPartner', actionTestDoPrivateGlobalEffectOnPartner)
  registerReactionFnByName('action.test.doLocalEffectOnChatRoom', actionTestDoLocalEffectOnChatRoom)
  registerReactionFnByName('action.test.doGlobalEffectOnChatRoom', actionTestDoGlobalEffectOnChatRoom)
  registerReactionFnByName('action.test.toggleGridTile', actionTestToggleGridTile)
  // TODO: registerReactionFnByName('action.test.setLocalStateOnActor', (contextApi: ChatRoomActionContextApi) => {
  // TODO: registerReactionFnByName('action.test.setGlobalStateOnActor', (contextApi: ChatRoomActionContextApi) => {
  // TODO: registerReactionFnByName('action.test.setLocalStateOnPartner', (contextApi: ChatRoomActionContextApi) => {
  // TODO: registerReactionFnByName('action.test.setGlobalStateOnPartner', (contextApi: ChatRoomActionContextApi) => {

  // TODO: registerReactionFnByName('action.test.setLocalActionsOnActor', (contextApi: ChatRoomActionContextApi) => {
  // TODO: registerReactionFnByName('action.test.setGlobalActionsOnActor', (contextApi: ChatRoomActionContextApi) => {
  // TODO: registerReactionFnByName('action.test.setLocalActionsOnPartner', (contextApi: ChatRoomActionContextApi) => {
  // TODO: registerReactionFnByName('action.test.setGlobalActionsOnPartner', (contextApi: ChatRoomActionContextApi) => {

  // TODO: registerReactionFnByName('action.test.deleteLocalActionsOnActor', (contextApi: ChatRoomActionContextApi) => {
  // TODO: registerReactionFnByName('action.test.deleteGlobalActionsOnActor', (contextApi: ChatRoomActionContextApi) => {
  // TODO: registerReactionFnByName('action.test.deleteLocalActionsOnPartner', (contextApi: ChatRoomActionContextApi) => {
  // TODO: registerReactionFnByName('action.test.deleteGlobalActionsOnPartner', (contextApi: ChatRoomActionContextApi) => {
}

export default { load }
