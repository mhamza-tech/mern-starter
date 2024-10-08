import {
  SetGlobalStateInput,
  SetLocalStateInput,
  ChatRoomActionContextApi,
  NodeApi,
  SaveTileInputInContext,
  SetStateInput,
  HashStatusFieldMetadata,
  InteractionEffectMetadata,
  FieldTemplate,
  TileTemplate,
  SetActionInput,
  StringFieldMetadata,
} from '../types'
import { sf } from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  SaveFieldOutput,
  FieldType,
  CreateChatRoomSystemCommentOutput,
  CreateChatRoomCommentInput,
  AnimationType,
  TileType,
  Image,
  EffectType,
  Player,
  Gender,
  ActionXStub,
  Effect,
  EntityScope,
  ActionXModifier,
  FeedItemActionEntityType,
  FeedItemActionType,
  DynamicFeedItemLayout,
} from 'src/gql-types'
import {
  Field,
  Tile,
} from '../../db/entity'
import _ from 'lodash'
import moment, { DurationInputObject } from 'moment'
import {
  composeReactionFns,
  SkipReactionsError,
  WILDCARD_ACTION,
} from '../../enginev3'
import * as common from './common'
import Bluebird from 'bluebird'
import {
  UserAttributeKey,
  getUserAttribute,
} from '../playerHelpers'
import { UserStateId } from 'src/domain/userStates'
import {
  incUserState,
  getUserState,
  resetUserState,
} from '../userStates'
import {
  incrementUserXP,
  getUserXP,
} from '../experiencePoints'
import {
  metadataAnimationLens,
  isDeletedLens,
  nativeAnimatableEffectTemplate,
  kingSpadesAnimationSequenceTileTemplate,
  queenSpadesTileTemplate,
  animationSequenceEffectTemplate,
  aceSpadesAnimatingTileTemplate,
  animGreenCheckEffectTemplate,
  metadataImageLens,
  animationEffectTemplate,
  randomAnimationUri,
  animationUris,
  twoSpadesTemplate,
  walkInCloudsTileTemplate,
  trollTileTemplate,
  aceSpadesTileTemplate,
  actorImageTileTemplate,
  spotItSymbolTable,
  MyFieldTemplate,
  MyNumberFieldTemplate,
  MyTileTemplate,
  firstAidAnimationSequenceTileTemplate,
  metadataAnimationSourceUriLens,
  aceSpadesTextTileTemplate,
  sleepingTileTemplate,
  mp4TileTemplate,
  NewsfeedItemComposedImageTemplate,
  NewsfeedItemComposedImageWithTextTemplate,
  NewsfeedItemUnObjectImageTemplate,
  NewsfeedItemUnObjectCardTemplate,
  sequenceEffectTemplate,
  tileEffectTemplate,
  globalPrivateScopedTileTemplate,
  chatRoomPrivateScopedTileTemplate,
  NewsfeedItemComposedImageRateLimitTemplate,
  metadataTextLens,
  actionStubSet,
  sequenceEffectConcurrentTemplate,
  bigTapTroll,
  tapTrollFallToBag,
} from './kitchensink.assets'
import {
  incHashtributeRaw,
  getHashtribute,
  resetAllHashtributes,
} from 'src/maker/hashtributes'
import { ActionEdgeApi } from '../api/ActionEdgeApi'
import { delay } from '../../utils/async_utils'
import { CountdownField } from 'src/maker/fields'
import { ReactNativeAnimations } from '../animations/react-native-animations'
import {
  UnrealChatroom,
  UnrealOnComment,
  UnrealOnExit,
  UnrealOnEnter,
  UnrealOnReset,
  UnrealAction,
  UnrealActorEid,
  UnrealUnObjectEid,
  UnrealJobId,
  UnrealJobNodeEid,
} from 'src/maker/core'
import { ReactionFn } from 'src/enginev3/types'
import { promiseMap } from 'src/utils/sf.typed'
import {
  incCounter,
  getCounterField,
} from '../counters'
import {
  randomInt,
  defaultsDeep,
  cloneDeep,
} from 'src/utils/misc'
import { NewsBackgrounds } from '../assets/news.lib'
import { items, Item } from 'src/domain/items'
import { NativeAnimationId } from 'src/domain/nativeAnimations'
import { SYSTEM_USER_EID } from 'src/env'
import { moves } from 'src/domain/moves'
import { fullScreenTileTemplate } from '../fx/tiles'
import { HashtributeId } from 'src/domain/hashtributes'
import * as removeFromRoom from 'src/maker/fx/animation.removeFromRoom'
import { modifiers } from 'src/domain/modifiers'
import { ActionStubSet } from 'src/types'

const logger = LoggerFactory('kitchensink', 'NPC')

/**
 * Note the signature: value => value. Good for composition.
 * @param value:T 
 * @return value:T (new instance w/ updated metadata)
 */
const updateMyField = <T extends Field | FieldTemplate<StringFieldMetadata>>(value: T): T => {
  const currentMetadata = value.metadata
  return _.merge(
    {},
    value,
    {
      metadata: {
        someValue: currentMetadata.someValue + '... and a little more',
      },
    }
  )
}

/**
 * Note the signature: value => value. Good for composition.
 * @param value:T 
 * @return value:T (new instance w/ updated metadata)
 */
const updateMyTile = <T extends Tile | TileTemplate>(value: T): T => {
  return _.merge(
    {},
    value,
    { isDeleted: !!!value.isDeleted }
  )
}

const skipIt = async (): Promise<void> => {
  if (1 == 1) {
    // Note: throwing from one async function thru another async function
    //       will cause the SkipReactionsError to be lost to an "uncaught promise rejection" error.
    throw SkipReactionsError
  }
}

const onActionHelloWorld = async (blah: string, contextApi: ChatRoomActionContextApi): Promise<any> => {
  await contextApi.getChatRoom().getGlobalState('isItWorkingDefault')
  logger.info('onActionHelloWorld')
  // return Promise.reject( new Error('blah' ));
  // throw SkipReactionsError;
  skipIt()
  // return Promise.reject( SkipReactionsError );
  // return Promise.resolve({ hello: 'worldv1' });
}

const randomGreeting = (): string => _.sample([
  'HI',
  'HOLA',
  'HELLO',
  'BONJOUR',
  'HEY',
  'HEYYY',
  'HAI',
  'CIAO',
  'PRIVET',
  'YAYO',
  'OI',
  'HEJ',
  'YASSOU',
  'HALO',
  'SELAM',
  'HEI',
])

const buildSpotItTilesTopQuadrant = (symbolKeys: string[]): Promise<SaveTileInputInContext[]> => {
  return Promise.resolve(symbolKeys)
    .then((symbolsKeys: string[]) => _.map(
      symbolsKeys,
      (symbolKey: string, index: number) => buildSpotItSaveTileInput({
        name: `spotit_top_${index}`,
        entryId: spotItSymbolTable[symbolKey],
      })
    ))
    .then(position8TilesInTopQuadrant)
}

const buildSpotItTilesBottomQuadrant = (symbolKeys: string[]): Promise<SaveTileInputInContext[]> => {
  return Promise.resolve(symbolKeys)
    .then((symbolsKeys: string[]) => _.map(
      symbolsKeys,
      (symbolKey: string, index: number) => buildSpotItSaveTileInput({
        name: `spotit_bottom_${index}`,
        entryId: spotItSymbolTable[symbolKey],
      })
    ))
    .then(position8TilesInBottomQuadrant)
}

const buildDeletedSpotItTilesTopQuadrant = (): SaveTileInputInContext[] => {
  return _.map(
    _.range(0, 8),
    (index: number) => buildSpotItSaveTileInput({
      name: `spotit_top_${index}`,
      entryId: null,
      isDeleted: true,
    })
  )
}

const buildDeletedSpotItTilesBottomQuadrant = (): SaveTileInputInContext[] => {
  return _.map(
    _.range(0, 8),
    (index: number) => buildSpotItSaveTileInput({
      name: `spotit_bottom_${index}`,
      entryId: null,
      isDeleted: true,
    })
  )
}

const buildSpotItSaveTileInput = ({ name, entryId, isDeleted = false }: { name: string; entryId: string; isDeleted?: boolean }): SaveTileInputInContext => ({
  name,
  entryId,
  type: TileType.ImageTile,
  isDeleted,
  metadata: {
    containerStyle: {
      backgroundColor: '#00000044',
      height: 20,
      width: 20,
      zIndex: 5,
    },
  },
})

const position8TilesInTopQuadrant = (tiles: SaveTileInputInContext[]): SaveTileInputInContext[] => {
  return _.map(
    tiles,
    (tile: SaveTileInputInContext, index: number) => _.merge(tile, {
      metadata: {
        containerStyle: {
          top: `${0 + index > 3 ? 20 : 0}%`,
          left: `${0 + (index % 4) * 25}%`,
        },
      },
    })
  )
}

const position8TilesInBottomQuadrant = (tiles: SaveTileInputInContext[]): SaveTileInputInContext[] => {
  return _.map(
    tiles,
    (tile: SaveTileInputInContext, index: number) => _.merge(tile, {
      metadata: {
        containerStyle: {
          bottom: `${0 + index > 3 ? 20 : 0}%`,
          left: `${0 + (index % 4) * 25}%`,
        },
      },
    })
  )
}

/**
 * @deprecated - see onActionSaveField.
 * Note: this is for testing purposes.  
 * Normally the handler code would NOT be setting the isTyping flag.
 */
const setIsTyping = (actorApi: NodeApi, booleanValue: boolean): Promise<any> => {
  const setLocalStateInput: SetLocalStateInput = {
    type: FieldType.BooleanField,
    name: 'isTyping',
    metadata: {
      booleanValue,
    },
  }
  return actorApi.setLocalState(setLocalStateInput)
    .then((saveFieldOutput: SaveFieldOutput) => saveFieldOutput.field)
}

const sendReplyToCommentText = (contextApi: ChatRoomActionContextApi, inboundCommentText: string): Promise<any> => {
  if (_.includes(inboundCommentText, 'unobject')) {
    return contextApi.sendUnObjectComment(
      'ALOHA! says the UNOBJECT'
    )
  } else {
    return contextApi.getActor().sendSystemComment(
      'ALOHA! says the SYSTEM'
    )
  }
}

/**
 * Note: this is for testing purposes.
 * Normally the handler code would NOT be simulating typing + comment like this.
 */
const simulateTypingReplyComment = (contextApi: ChatRoomActionContextApi, inboundCommentText: string): Promise<any> => {
  return Promise.resolve(setIsTyping(contextApi.getUnObject(), true))
    .then(sf.pause(3 * 1000))
    .then(() => setIsTyping(contextApi.getUnObject(), false))
    .then(sf.pause(300))
    .then(() => sendReplyToCommentText(contextApi, inboundCommentText) as Promise<any>)
}

const preAction = (): Promise<any> => {
  logger.info('avocado.preAction')
  return Promise.resolve('hi from preAction')
}

const postAction = (): Promise<any> => {
  logger.info('avocado.postAction')
  return Promise.resolve('hi from postAction')
}

const extendStub = (actionName: string, changes: Partial<ActionXStub>): ActionStubSet => {
  const set = cloneDeep(actionStubSet)
  set.staticActionStubs.concat(set.actionInstanceStubs).forEach(stub => {
    if (stub.actionName === actionName) {
      _.extend(stub, changes)
    }
  })
  return set
}

const updateStubsModifiers = async (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const actor = contextApi.getActor()
  const list: ActionXModifier[] = []
  for (const modifier of _.sampleSize(Object.values(modifiers), 3)) {
    list.push({ id: modifier.id, name: await actor.resolveText(modifier.name), description: modifier.description })
  }
  return actor.saveCurrentActionStubs(
    extendStub('avocado.modifiers', { modifiers: list })
  )
}

@UnrealChatroom({
  id: 'kitchen_sink_1622',
  assets: [
    'https://unreal-dev-us-west-2.s3-us-west-2.amazonaws.com/mp4/magic_hands_test.mp4',
    'https://static.boredpanda.com/blog/wp-content/uploads/2015/09/photos-that-do-not-look-real-3__880.jpg',
    'https://www.soundjay.com/door/sounds/creaking-door-1.mp3',
    'tile/beer_1.png',
    'tile/troll_002.png',
    'object/bluejoe.png',
  ],
})
export default class KitchenSink implements UnrealOnComment, UnrealOnExit, UnrealOnEnter, UnrealOnReset {

  onComment(contextApi: ChatRoomActionContextApi): Promise<any> {
    logger.info('avocado.onComment')
    const input: CreateChatRoomCommentInput = contextApi.getArgs().input
    const text: string = _.toLower(input.text)
    if (_.includes(text, 'aloha')) {
      setTimeout(
        _.partial(simulateTypingReplyComment, contextApi, text),
        3 * 1000
      )
    }
    return null
  }

  onEnter(contextApi: ChatRoomActionContextApi): Promise<any> {
    logger.info('avocado.onEnter')

    return Promise.all([
      contextApi.getActor().sendSystemMessage(
        `HI! Welcome to the **${contextApi.getUnObject().getName()}**. Everything gets thrown in here!`
      ),
      updateStubsModifiers(contextApi),
    ])
  }

  onExit(contextApi: ChatRoomActionContextApi): Promise<any> {
    logger.info('avocado.onExit')

    return Promise.all([
      contextApi.getChatRoom().saveTile(isDeletedLens.set(true)(tapTrollFallToBag)),
      contextApi.getChatRoom().saveTile(isDeletedLens.set(true)(bigTapTroll)),
      contextApi.getChatRoom().saveTile(isDeletedLens.set(true)(trollTileTemplate)),
    ])
  }

  @UnrealAction('avocado.reset')
  onReset(contextApi: ChatRoomActionContextApi): Promise<any> {
    logger.info('avocado.onReset')

    return Promise.resolve([
      common.resetIsFirstEnter(contextApi.getActor()),
      resetUserState(contextApi.getPartner(), 'injured_876'),
    ])
  }

  @UnrealAction('avocado.savefield')
  onActionSaveField(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().saveField(updateMyField(MyFieldTemplate))
  }

  @UnrealAction('avocado.helloworld')
  helloWorld(): ReactionFn {
    return composeReactionFns(preAction, _.partial(onActionHelloWorld, 'hi'), postAction)
  }

  /**
  * Read a Field from the store, update it locally, and write it back.
  * @param contextApi 
  * @return Profile<Field> - the updated Field
  */
  @UnrealAction('avocado.readandsavefield')
  onActionReadAndSaveField(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().field(MyFieldTemplate)
      .then(sf.tap((field: Field) => logger.info('onActionReadAndSaveField.1', { field })))
      .then(updateMyField)
      .then(contextApi.getActor().saveField)
      .then(sf.tap((field: Field) => logger.info('onActionReadAndSaveField.2', { field })))
  }

  @UnrealAction('avocado.incrementfield')
  onActionIncrementField(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().incrementField(MyNumberFieldTemplate, 2)
  }

  /**
    * Read a Tile from the store, update it locally, and write it back.
    * @param contextApi 
    * @return Profile<Tile> - the updated Tile
    */
  @UnrealAction('avocado.readandsavetile')
  onActionReadAndSaveTile(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().tile(MyTileTemplate)
      .then(updateMyTile)
      .then(contextApi.getActor().saveTile)
  }

  /**
   * Write a Tile to the store.
   * @param contextApi 
   * @return Profile<Tile> - the updated Tile
   */
  @UnrealAction('avocado.savetile')
  onActionSaveTile(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().saveTile(updateMyTile(MyTileTemplate))
  }

  @UnrealAction('avocado.bonanza')
  onActionEffectsBonanza(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      // -rx- contextApi.sendUnObjectComment(`BONANZA! This is an UNOBJECT comment!`),
      contextApi.createNewsfeedItemUnObjectCard('{{{ capitalize (name actor) }}} just triggered an EFFECTS BONANZA!'),
      // -rx- contextApi.getActor().incrementLocalState('myHappinessMeter', 2),
      // -rx- contextApi.getActor().incrementLocalState(newFieldName, 2),
      // -rx- contextApi.getActor().sendSystemComment(`BONANZA: system comment`),
      contextApi.getActor().sendSystemMessage('BONANZA: system message', {
        image: {
          uri: 'https://static.boredpanda.com/blog/wp-content/uploads/2015/09/photos-that-do-not-look-real-3__880.jpg',
        },
      }),
      contextApi.getChatRoom().saveEffect(sf.lens('metadata.sourceUri').set(randomAnimationUri())(animationEffectTemplate)),
      contextApi.getChatRoom().applyAnimation(AnimationType.NativeAnimatableAnimation, {
        animationType: AnimationType.NativeAnimatableAnimation,
        tileId: 'layers.avatar',
        animation: ReactNativeAnimations.RubberBand,
        iterationCount: 2,
      }),
      // -rx- contextApi.getActor().doLocalSourcedAnimation(randomAnimationUri()),
      // -rx- contextApi.getPartner().doLocalSourcedAnimation(randomAnimationUri()),
    ])
  }

  @UnrealAction('avocado.progressfield')
  onActionProgressField(contextApi: ChatRoomActionContextApi): Promise<any> {
    const defaultInput: SetStateInput = {
      type: FieldType.ProgressField,
      name: 'myProgressField',
      metadata: {
        minValue: 1,
        maxValue: 5,
        numberValue: 1,
        color: '#00cc00',
      },
    }
    return contextApi.getActor().getLocalState(defaultInput.name, defaultInput)
      .then(sf.thru_if_else((field: Field) => _.get(field, 'metadata.numberValue', 0) >= 5)(
        () => contextApi.getActor().setLocalState(defaultInput)
      )(
        () => contextApi.getActor().incrementLocalState(defaultInput.name, 1)
      ))
  }

  /** add an action to the user's inventory / ActionSheet. */
  @UnrealAction('avocado.unlockaction')
  onActionUnlockAction(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      contextApi.getActor().setGlobalAction({
        name: 'slice',
        isDeleted: false,
        quantity: 2,
        isDisabled: false,
        order: 'ABB',
      }),
      contextApi.getActor().setLocalAction({
        name: 'chop',
        isDeleted: false,
        isDisabled: true,
      }),
    ])
  }

  /** remove an action from the user's inventory / ActionSheet. */
  @UnrealAction('avocado.lockaction')
  onActionLockAction(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      contextApi.getActor().setLocalAction({
        name: 'chop',
        isDeleted: true,
      }),
    ])
  }

  @UnrealAction('avocado.createnewsfeeditem')
  onActionCreateNewsfeedItem(contextApi: ChatRoomActionContextApi, @UnrealActorEid() actorEid: string, @UnrealUnObjectEid() unObjectEid: string): Promise<any> {
    return Promise.all([
      contextApi.saveNewsfeedItem(
        defaultsDeep({
          userId: contextApi.getActor().getId(),
          metadata: {
            statusText: '**[{{ name actor }}]({{ rawProfileLink actor }})** is testing a **NewsfeedItemComposedImage** card!',
            image: { s3Key: 'tile/beer_1.png' },
            insetPlayerEid: unObjectEid,
          },
        }, NewsfeedItemComposedImageTemplate)
      ),
      contextApi.saveNewsfeedItem(
        defaultsDeep({
          userId: contextApi.getActor().getId(),
          metadata: {
            statusText: '**[{{ name actor }}]({{ rawProfileLink actor }})** is testing a **NewsfeedItemUnObjectImage** card with **[{{ name unObject }}]({{ rawProfileLink unObject }})**!',
            image: { s3Key: 'object/bluejoe.png' },
            isNew: true,
          },
        }, NewsfeedItemUnObjectImageTemplate)
      ),
      contextApi.saveNewsfeedItem(
        defaultsDeep({
          userId: contextApi.getActor().getId(),
          metadata: {
            statusText: '**[{{ name actor }}]({{ rawProfileLink actor }})** is testing a **NewsfeedItemUnObjectCard** card with **[{{ name unObject }}]({{ rawProfileLink unObject }})**!',
            isNew: true,
          },
        }, NewsfeedItemUnObjectCardTemplate)
      ),
      contextApi.saveNewsfeedItem(
        defaultsDeep({
          userId: contextApi.getActor().getId(),
          metadata: {
            statusText: '**[{{ name actor }}]({{ rawProfileLink actor }})** is testing a **NewsfeedItemUnObjectImage** card with an **mp4 file**!',
            image: { uri: 'https://unreal-dev-us-west-2.s3-us-west-2.amazonaws.com/mp4/magic_hands_test.mp4' },
            isNew: true,
          },
        }, NewsfeedItemComposedImageWithTextTemplate)
      ),
      contextApi.saveNewsfeedItem(
        defaultsDeep({
          userId: contextApi.getActor().getId(),
          metadata: {
            statusText: 'Posted by Unreal on behalf of **[{{ name actor }}]({{ rawProfileLink actor }})**',
            imageText: 'TROLLING!',
            image: { s3Key: 'tile/troll_002.png' },
            isNew: true,
          },
        }, NewsfeedItemComposedImageWithTextTemplate)
      ),
    ])
  }

  @UnrealAction('avocado.createnewsfeeditemratelimit')
  onActionCreateNewsfeedItemRateLimit(contextApi: ChatRoomActionContextApi, @UnrealActorEid() actorEid: string, @UnrealUnObjectEid() unObjectEid: string): Promise<any> {
    return Promise.all([
      contextApi.saveNewsfeedItem(
        defaultsDeep({
          userId: contextApi.getActor().getId(),
          rateId: `${actorEid}-avocado.newsfeeditem`,
          metadata: {
            statusText: '**[{{ name actor }}]({{ rawProfileLink actor }})** is testing a **RATE-LIMITED** card!',
            image: { s3Key: 'tile/beer_1.png' },
            insetPlayerEid: unObjectEid,
          },
        }, NewsfeedItemComposedImageRateLimitTemplate)
      ),
    ])
  }

  @UnrealAction('avocado.createnewsfeeditemforactor')
  onActionCreateNewsfeedItemForActor(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      contextApi.saveNewsfeedItem(
        defaultsDeep({
          userId: contextApi.getActor().getId(),
          metadata: {
            statusText: 'PRIVATE NewsfeedItem posted by Unreal for ONLY **{{ name actor }}**',
            image: { s3Key: 'tile/troll_002.png' },
            imageText: 'PRIVATE TROLLING!',
          },
        }, NewsfeedItemComposedImageWithTextTemplate)
      ),
    ])
  }

  /** @deprecated - see onActionSaveField */
  @UnrealAction('avocado.setglobalstate')
  onActionSetGlobalState(contextApi: ChatRoomActionContextApi): Promise<any> {
    const setGlobalStateInput: SetGlobalStateInput = {
      type: FieldType.BooleanField,
      name: 'isItWorking',
      metadata: {
        booleanValue: true,
      },
    }
    return contextApi
      .getChatRoom()
      .setGlobalState(setGlobalStateInput)
      .then((saveFieldOutput: SaveFieldOutput) => saveFieldOutput.field)
  }

  /**  @deprecated - see onActionReadAndSaveField  */
  @UnrealAction('avocado.getglobalstate')
  onActionGetGlobalState(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getChatRoom().getGlobalState('isItWorking')
  }

  @UnrealAction('avocado.getglobalstatedefault')
  onActionGetGlobalStateDefault(contextApi: ChatRoomActionContextApi): Promise<any> {
    const setGlobalStateInput: SetGlobalStateInput = {
      type: FieldType.BooleanField,
      name: 'isItWorkingDefault',
      metadata: {
        booleanValue: true,
      },
    }
    return contextApi.getChatRoom().getGlobalState('isItWorkingDefault', setGlobalStateInput)
  }

  /**
  * @deprecated - see onActionSaveField
  */
  @UnrealAction('avocado.getglobalstatenodefault')
  onActionGetGlobalStateNoDefault(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getChatRoom().getGlobalState('isItWorkingDefault')
  }

  @UnrealAction('avocado.sethashstatus')
  onActionSetHashStatus(contextApi: ChatRoomActionContextApi): Promise<any> {
    const userStateId: UserStateId = 'injured_876'
    return getUserState(contextApi.getActor(), userStateId)
      .then((metadata: HashStatusFieldMetadata) => logger.info('avocado.onActionSetHashStatus.1', { metadata }))
      .then(() => incUserState(contextApi.getActor(), userStateId, 2))
      .then((field: Field) => logger.info('avocado.onActionSetHashStatus.2', { field }))
      .then(() => getUserState(contextApi.getActor(), userStateId))
      .then((metadata: HashStatusFieldMetadata) => logger.info('avocado.onActionSetHashStatus.3', { metadata }))
      .then(() => incUserState(contextApi.getActor(), userStateId, -2))
      .then(sf.tap((field: Field) => logger.info('avocado.onActionSetHashStatus.4', { field })))
      .then(() => getUserState(contextApi.getActor(), userStateId))
      .then(sf.tap((metadata: HashStatusFieldMetadata) => logger.info('avocado.onActionSetHashStatus.5', { metadata })))
  }

  @UnrealAction('avocado.sethashtribute')
  onActionSetHashtribute(contextApi: ChatRoomActionContextApi): Promise<any> {
    const hashtribute: HashtributeId = 'friendly_178'
    return getHashtribute(contextApi.getActor(), hashtribute)
      .then((metadata: HashStatusFieldMetadata) => logger.info('avocado.onActionSetHashtribute.1', { metadata }))
      .then(() => incHashtributeRaw(contextApi.getActor(), hashtribute, 2))
      .then((metadata: HashStatusFieldMetadata) => logger.info('avocado.onActionSetHashtribute.2', { metadata }))
      .then(() => getHashtribute(contextApi.getActor(), hashtribute))
      .then((metadata: HashStatusFieldMetadata) => logger.info('avocado.onActionSetHashtribute.3', { metadata }))
      .then(() => incHashtributeRaw(contextApi.getActor(), hashtribute, -2))
      .then((metadata: HashStatusFieldMetadata) => logger.info('avocado.onActionSetHashtribute.4', { metadata }))
      .then(() => getHashtribute(contextApi.getActor(), hashtribute))
      .then(sf.tap((metadata: HashStatusFieldMetadata) => logger.info('avocado.onActionSetHashtribute.5', { metadata })))
  }

  @UnrealAction('avocado.setxp')
  onActionSetXp(contextApi: ChatRoomActionContextApi): Promise<any> {
    return getUserXP(contextApi.getActor())
      .then(sf.tap((field: Field) => logger.info('avocado.onActionSetXp.1', { field })))
      .then(() => incrementUserXP(contextApi.getActor(), 10))
      .then(sf.tap((field: Field) => logger.info('avocado.onActionSetXp.2', { field })))
      .then(() => getUserXP(contextApi.getActor()))
      .then(sf.tap((field: Field) => logger.info('avocado.onActionSetXp.3', { field })))
  }

  /**
   * @deprecated - see onActionSaveField
   * @param contextApi 
   */
  @UnrealAction('avocado.setlocalstate')
  onActionSetLocalState(contextApi: ChatRoomActionContextApi): Promise<any> {
    const setLocalStateInput: SetLocalStateInput = {
      type: FieldType.BooleanField,
      name: 'isItWorkingLocally',
      metadata: {
        booleanValue: true,
      },
    }
    return Promise.all([
      contextApi.getActor().setLocalState(setLocalStateInput),
      contextApi.getPartner().setLocalState(setLocalStateInput),
    ])
  }

  /**
  * @deprecated - see onActionReadAndSaveField
  * @param contextApi 
  */
  @UnrealAction('avocado.getlocalstate')
  onActionGetLocalState(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().getLocalState('isItWorkingLocally')
  }

  @UnrealAction('avocado.systemcomment')
  onActionSystemComment(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().sendSystemComment(
      `this is a v2 system comment at ${moment().format('h:mm:ss a')}`
    )
      .then((output: CreateChatRoomSystemCommentOutput) => output.comment)
  }

  @UnrealAction('avocado.unobjectcomment')
  onActionUnObjectComment(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.sendUnObjectComment(
      `this is an UNOBJECT comment at ${moment().format('h:mm:ss a')}`
    )
  }

  @UnrealAction('avocado.probability')
  onActionProbability(contextApi: ChatRoomActionContextApi): Promise<any> {
    const setLocalStateInput: SetLocalStateInput = {
      type: FieldType.StringField,
      name: 'withProbability',
      metadata: {
        stringValue: contextApi.selectByUniformDist([
          {
            percentile: 0.5,
            do: (): string => '50% probability of seeing this (random number fell between 0 and 0.5)',
          },
          {
            percentile: 0.65,
            do: (): string => '15% probability of seeing this (random number fell between 0.5 and 0.65)',
          },
          {
            percentile: 1.00,
            do: (): string => '35% probability of seeing this (random number fell between 0.65 and 1.00)',
          },
        ]),
      },
    }
    return contextApi.getActor().setLocalState(setLocalStateInput)
      .then((saveFieldOutput: SaveFieldOutput) => saveFieldOutput.field)
  }

  /**
    * @deprecated - see onActionIncrementField
    * @param contextApi 
    */
  @UnrealAction('avocado.incrementlocalstate')
  onActionIncrementLocalState(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().incrementLocalState('myHappinessMeter', 2)
  }

  /**
   * @deprecated - see onActionIncrementField
   * @param contextApi 
   */
  @UnrealAction('avocado.incrementglobalstate')
  onActionIncrementGlobalState(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().incrementGlobalState('myHappinessMeter', 2)
  }

  @UnrealAction('avocado.sourcedanimation')
  onActionSourcedAnimation(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.doSourcedAnimation(_.sample(_.values(animationUris)), {
      animationType: AnimationType.SourcedAnimation,
      startFrame: _.random(0, 100),
    })
  }

  @UnrealAction(moves.punch_80.name)
  onActionPunch(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      // apply InteractionEffect to the Partner. 
      // The InterfaceEffect will be shown to everyone in a ChatRoom with this Partner.
      incUserState(contextApi.getPartner(), 'injured_876', 1)
        .then((field: Field) => ({
          actor: contextApi.getActor().getNode() as any as Player,
          hashStatus: field,
          text: `${contextApi.getActor().getName()} punched ${contextApi.getPartner().getName()}!`,
          action: contextApi.getCurrentAction(),
        }))
        .then((metadata: InteractionEffectMetadata) => contextApi.getPartner().applyEffect(
          EffectType.InteractionEffect,
          metadata
        ))
      ,
      // send InteractionEffect to the Actor over their Private-Effect channel.
      // Effects sent over a User's Private-Effect channel are visible only to that User.
      // e.g. SystemMessageEffects are always sent over the Private-Effect channel.
      incUserState(contextApi.getActor(), 'injured_876', 1)
        .then((field: Field) => ({
          actor: contextApi.getPartner().getNode() as any as Player,
          hashStatus: field,
          text: `You punched ${contextApi.getPartner().getName()} and injured your hand!`,
          action: contextApi.getCurrentAction(),
        }))
        .then((metadata: InteractionEffectMetadata) => contextApi.getActor().doPrivateGlobalEffect(
          EffectType.InteractionEffect,
          metadata
        )),
    ])
  }

  @UnrealAction('avocado.localsourcedanimation')
  onActionLocalSourcedAnimation(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().doLocalSourcedAnimation(_.sample(_.values(animationUris)), {
      animationType: AnimationType.SourcedAnimation,
      startFrame: _.random(0, 100),
    })
  }

  @UnrealAction('avocado.sourcedsound')
  onActionSourcedSound(contextApi: ChatRoomActionContextApi): Promise<Effect> {
    return contextApi.getActor().soundEffects().loadUri('https://www.soundjay.com/door/sounds/creaking-door-1.mp3').stream()
  }

  @UnrealAction('avocado.localsourcedsound')
  onActionLocalSourcedSound(contextApi: ChatRoomActionContextApi): Promise<Effect> {
    return contextApi.getActor().soundEffects().load('HitPunch03').stream()
  }

  @UnrealAction('avocado.vibrate')
  onActionVibrate(contextApi: ChatRoomActionContextApi): Promise<Effect> {
    return contextApi.getActor().vibrationEffects().stream()
  }

  @UnrealAction('avocado.whoosh')
  onActionWhoosh(contextApi: ChatRoomActionContextApi): Promise<Effect> {
    return contextApi.getActor().soundEffects().load('DigitalSwoosh01').stream()
  }

  @UnrealAction('avocado.spotit')
  onActionSpotIt(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.resolve(null)
      .then(() => [
        _.sampleSize(_.keys(spotItSymbolTable), 8),
        _.sampleSize(_.keys(spotItSymbolTable), 8),
      ])
      .then(
        ([topSymbols, bottomSymbols]) => Promise.all([
          buildSpotItTilesTopQuadrant(topSymbols),
          buildSpotItTilesBottomQuadrant(bottomSymbols),
        ])
      )
      .then(_.flatten)
      .then(sf.list_fmap_wait(contextApi.getChatRoom().saveGlobalTile))
  }

  @UnrealAction('avocado.clearspotit')
  onActionClearSpotIt(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.resolve(null)
      .then(
        () => Promise.all([
          buildDeletedSpotItTilesTopQuadrant(),
          buildDeletedSpotItTilesBottomQuadrant(),
        ])
      )
      .then(_.flatten)
      .then(sf.list_fmap_wait(contextApi.getChatRoom().saveGlobalTile))
  }

  /**
  * Place many Tiles on the screen.
  */
  @UnrealAction('avocado.placetile')
  onActionPlaceTiles(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      contextApi.getChatRoom().saveTiles([
        twoSpadesTemplate,
        walkInCloudsTileTemplate,
        trollTileTemplate,
        aceSpadesTileTemplate,
        aceSpadesTextTileTemplate,
        aceSpadesAnimatingTileTemplate,
        firstAidAnimationSequenceTileTemplate,
        sleepingTileTemplate,
      ]),
      contextApi.getActor().getImage()
        .then(sf.lens('backgroundColor').set('00ff00'))
        .then((image: Image) => metadataImageLens.set(image)(actorImageTileTemplate))
        .then(contextApi.getChatRoom().saveTile),
    ])
  }

  /**
   * Remove many Tiles from the screen.
   */
  @UnrealAction('avocado.removetile')
  onActionRemoveTiles(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getChatRoom().saveTiles([
      isDeletedLens.set(true)(twoSpadesTemplate),
      isDeletedLens.set(true)(walkInCloudsTileTemplate),
      isDeletedLens.set(true)(trollTileTemplate),
      isDeletedLens.set(true)(aceSpadesTileTemplate),
      isDeletedLens.set(true)(aceSpadesTextTileTemplate),
      isDeletedLens.set(true)(aceSpadesAnimatingTileTemplate),
      isDeletedLens.set(true)(kingSpadesAnimationSequenceTileTemplate),
      isDeletedLens.set(true)(queenSpadesTileTemplate),
      isDeletedLens.set(true)(aceSpadesTileTemplate),
      isDeletedLens.set(true)(mp4TileTemplate),
      isDeletedLens.set(true)(sleepingTileTemplate),
      isDeletedLens.set(true)(firstAidAnimationSequenceTileTemplate),
      isDeletedLens.set(true)(actorImageTileTemplate),
    ])
  }

  @UnrealAction('avocado.animatetiles')
  onActionAnimateTiles(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      contextApi.getChatRoom().saveEffectOnTile(sf.lens('metadata.loop').set(true)(animGreenCheckEffectTemplate), twoSpadesTemplate),
      contextApi.getChatRoom().saveEffectOnTile(animGreenCheckEffectTemplate, walkInCloudsTileTemplate),
      contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), walkInCloudsTileTemplate),
      contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), trollTileTemplate),
      contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), aceSpadesTileTemplate),
      contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), actorImageTileTemplate),
    ])
      .then(sf.pause(1.5 * 1000))
      .then(() => Promise.all([
        contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), walkInCloudsTileTemplate),
        contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), trollTileTemplate),
        contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), aceSpadesTileTemplate),
        contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), actorImageTileTemplate),
      ]))
      .then(sf.pause(1.5 * 1000))
      .then(() => Promise.all([
        contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), walkInCloudsTileTemplate),
        contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), trollTileTemplate),
        contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), aceSpadesTileTemplate),
        contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), actorImageTileTemplate),
      ]))
      .then(sf.pause(1.5 * 1000))
      .then(() => Promise.all([
        contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), walkInCloudsTileTemplate),
        contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), trollTileTemplate),
        contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), aceSpadesTileTemplate),
        contextApi.getChatRoom().saveEffectOnTile(metadataAnimationLens.set(_.sample(ReactNativeAnimations))(nativeAnimatableEffectTemplate), actorImageTileTemplate),
      ]))
  }

  @UnrealAction('avocado.placeanimatingtile')
  onActionPlaceAnimatingTile(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getChatRoom().saveTile(
      metadataAnimationSourceUriLens.set(randomAnimationUri())(aceSpadesAnimatingTileTemplate)
    )
  }

  @UnrealAction('avocado.animationsequenceeffect')
  onActionAnimationSequenceEffect(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      // we must be guaranteed that the Tile event has been submitted to pubsub
      // by the time the promise resolves, to avoid a race condition where the isDeleted
      // update runs first.
      contextApi.getChatRoom().saveTile(kingSpadesAnimationSequenceTileTemplate)
        .then(isDeletedLens.set(true))
        .then(contextApi.getChatRoom().saveTileNoPublish)
      ,
      contextApi.getChatRoom().saveTile(queenSpadesTileTemplate)
        .then(sf.pause(2 * 1000))
        .then(() => contextApi.getChatRoom().saveEffectOnTile(animationSequenceEffectTemplate, queenSpadesTileTemplate)),
    ])
  }

  @UnrealAction('avocado.placeunobjecttile')
  onActionPlaceUnObjectTile(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getUnObject().saveTile(aceSpadesTileTemplate)
  }

  @UnrealAction('avocado.getimages')
  onActionGetImages(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Bluebird.Promise.props({
      actorImage: contextApi.getActor().getImage(),
      userImage: contextApi.getUser().getImage(),
      unObjectImage: contextApi.getUnObject().getImage(),
      makerImage: contextApi.getMaker().getImage(),
    })
  }

  @UnrealAction('avocado.notify')
  onActionNotify(contextApi: ChatRoomActionContextApi): Promise<any> {
    Promise.resolve(null)
      .then(sf.pause(5 * 1000))
      .then(() => Promise.all([
        contextApi.getPartner().sendNotification({
          title: `${contextApi.getActor().getName()} played the notify action`,
          body: 'Here\'s the custom handler message',
        }),
        contextApi.getActor().sendNotification({
          title: 'You played the notify action',
          body: 'Here\'s the custom handler message',
        }),
      ]))

    return null
  }

  @UnrealAction('avocado.checkwallet')
  onActionCheckWallet(contextApi: ChatRoomActionContextApi): Promise<any> {
    return getUserAttribute(UserAttributeKey.Wealth, contextApi.getActor(), 5)
      .then((wealth: number) => contextApi.getActor().sendMessage({
        text: `{{ name actor }} (that\'s you) has ${{ wealth }} in {{ hisher actor }} wallet, says {{ name unObject }}'`,
      }))
  }

  @UnrealAction('avocado.getactionedge')
  onActionGetActionEdge(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().getActionEdge(contextApi.getCurrentActionName())
  }

  @UnrealAction('avocado.deletecomments')
  onActionDeleteComments(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getChatRoom().deleteComments()
  }

  @UnrealAction('avocado.debugfirstaidkit')
  onActionDebugFirstAidKit(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      contextApi.getChatRoom().saveTile(firstAidAnimationSequenceTileTemplate),
    ])
  }

  @UnrealAction('avocado.testanything')
  onActionTestAnything(contextApi: ChatRoomActionContextApi): Promise<any> {
    // const mp4Source = 'https://unreal-dev-us-west-2.s3-us-west-2.amazonaws.com/mp4/magic_hands_test.mp4';
    // return contextApi.getChatRoom().saveEffect( sf.lens( 'metadata.sourceUri' ).set( mp4Source )( animationEffectTemplate ) );
    //     incrementPositionOnMap( contextApi.getActor(), 1 );
    //     readPositionOnMap( contextApi.getActor() )
    //         .then( (field:Field) => log( 'readPositionOnMap', { field } ))
    //         .then( () => savePositionOnMap( contextApi.getActor(), 0 ) )
    //         ;
    return contextApi.getChatRoom().saveTile(mp4TileTemplate)
  }

  @UnrealAction('avocado.updateuserfields')
  onActionUpdateUserFields(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      contextApi.getActor().sendSystemMessage('calling saveNewsfeedItem...'),
      contextApi.getActor().updateUserFields({
        gender: contextApi.getActor().getKey('gender') === Gender.Female
          ? Gender.Male
          : Gender.Female,
      }),
    ])
  }

  @UnrealAction('avocado.sequenceeffect')
  onActionSequenceEffect(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getChatRoom().saveEffect(sequenceEffectTemplate)
  }

  @UnrealAction('avocado.tileeffect')
  onActionTileEffect(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getChatRoom().saveEffect(tileEffectTemplate)
  }

  /**
   * In general, "private" Tiles/Effects/Fields are targeted for a specific user, and 
   * are only visible by that user.
   * 
   * Tiles w/ GlobalPrivateScope are
   * (1) "global", in that they are visible in every ChatRoom
   * (2) "private", in that they are visible only to the specific user they're attached to.
   * 
   * @param contextApi 
   */
  @UnrealAction('avocado.placeprivatetiles')
  onActionPlacePrivateTiles(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      contextApi.getActor().saveTile(globalPrivateScopedTileTemplate),
      contextApi.getActor().saveTile(chatRoomPrivateScopedTileTemplate),
    ])
  }

  @UnrealAction('avocado.removeprivatetiles')
  onActionRemovePrivateTiles(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      contextApi.getActor().saveTile(isDeletedLens.set(true)(globalPrivateScopedTileTemplate)),
      contextApi.getActor().saveTile(isDeletedLens.set(true)(chatRoomPrivateScopedTileTemplate)),
    ])
  }

  @UnrealAction('avocado.schedulejob')
  onActionScheduleJob(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      contextApi.scheduleJob({
        id: `kitchensink-${moment().unix()}`,
        actionName: 'avocado.jobaction',
        dispatchAt: moment().add({ seconds: 30 }).toDate(),
      }),
      contextApi.getActor().sendSystemMessage('The job has been scheduled to run 30 seconds from now (give or take the job.worker periodicity)'),
    ])
  }

  @UnrealAction('avocado.jobaction')
  onActionJobAction(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().sendSystemMessage('This message generated by a scheduled job!')
  }

  /**
  * @deprecated - use ActionInstances, see onActionCreateSpongeAction
  */
  @UnrealAction('avocado.incrementlocalaction')
  onActionIncrementLocalAction(contextApi: ChatRoomActionContextApi): Promise<any> {
    const actionName = contextApi.getCurrentActionName()
    return contextApi.getActor().getActionEdge(actionName)
      .then(
        (actionEdge: ActionEdgeApi) => _.isNil(actionEdge)
          ? { name: actionName, quantity: 1 }
          : { name: actionName, quantity: actionEdge.quantity() + 1 }
      )
      .then((input: SetActionInput) => contextApi.getActor().setLocalAction(input))
      .then(sf.tap(() => contextApi.getActor().sendSystemMessage('Incremented the current action by 1')))
  }

  @UnrealAction('avocado.sequenceeffect.actioncallback')
  onActionSequenceEffectActionCallback(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().sendSystemMessage('actionCallback received!')
  }

  @UnrealAction('avocado.changetext')
  onActionChangeTextTileText(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getChatRoom().saveTile(
      metadataTextLens.set(randomGreeting())(aceSpadesTextTileTemplate)
    )
  }

  @UnrealAction('avocado.create.sponge.action')
  onActionCreateSpongeAction(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().createActionInstance({
      actionName: 'avocado.execute.sponge.action',
      trxDescription: `${contextApi.getActor().getName()} was awarded the sponge by the ${contextApi.getUnObject().getName()}`,
    })
      .then(sf.tap(
        contextApi.getActor().sendSystemMessage('Sponge action created! It should appear now in your action sheet.'),
      ))
  }

  @UnrealAction('avocado.execute.sponge.action')
  onActionExecuteSpongeAction(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().deleteActionInstance({
      actionName: 'avocado.execute.sponge.action',
      trxDescription: `${contextApi.getActor().getName()} used up the sponge action at the ${contextApi.getUnObject().getName()}`,
    })
      .then(sf.tap_if_else(_.isNil)(
        () => contextApi.getActor().sendSystemMessage('You have no sponges left to use')
      )(
        () => contextApi.getActor().sendSystemMessage(
          'You used the sponge! It should be removed now from your action sheet.'
        )
      ))
  }

  @UnrealAction('avocado.transfer.sponge.action')
  onActionTransferSpongeAction(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().transferActionInstance({
      actionName: 'avocado.execute.sponge.action',
      transferToPlayerEid: contextApi.getPartner().getEid(),
      trxDescription: `${contextApi.getActor().getName()} transferred the sponge to ${contextApi.getPartner().getName()}`,
    })
      .then(sf.tap_if_else(_.isNil)(
        () => contextApi.getActor().sendSystemMessage('You have no sponges left to transfer')
      )(
        () => contextApi.getActor().sendSystemMessage(
          `Sponge action transferred to ${contextApi.getPartner().getName()}! It should be removed now from your action sheet.`
        )
      ))
  }

  @UnrealAction('avocado.hello.world')
  onActionHelloWorld2(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().sendSystemMessage(`Hello there ${contextApi.getActor().getName()}!`)
  }

  @UnrealAction('avocado.read.action.instances')
  onActionReadActionInstances(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi
      .getActor()
      .readAllActionInstances()
      .then(instances => {
        // here we have the db results
        // let's convert it to a nicer object with types and their counts
        // {
        //   state.avocado.start: 4
        // }
        return instances.reduce((acc, curr) => {
          return {
            ...acc,
            [curr.actionName]: acc[curr.actionName] ? acc[curr.actionName] + 1 : 1,
          }
        }, {} as { [key: string]: number })
      })
      .then(resultObject => {
        return contextApi
          .getActor()
          .sendSystemMessage(JSON.stringify(resultObject))  // inform the user of this awesome data
      })
  }

  @UnrealAction('avocado.read.action.sponge.instances')
  onActionReadSpongeInstances(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi
      .getActor()
      .readActionInstances('avocado.execute.sponge.action')
      .then(instances => {
        return contextApi
          .getActor()
          .sendSystemMessage(`You have $${instances.length} sponges!`)
      })
  }

  @UnrealAction('avocado.action.cooldown')
  onActionCooldown(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().saveCurrentActionStubs(
      extendStub(contextApi.getCurrentActionName(), {
        disabledUntil: moment().add(10, 'seconds').toISOString(),
      })
    )
  }

  @UnrealAction('avocado.action.disable')
  onActionDisable(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().saveCurrentActionStubs(
      extendStub(contextApi.getCurrentActionName(), { isDisabled: true })
    )
  }

  @UnrealAction('avocado.schedulejobwithargs')
  onActionScheduleJobWithArgs(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      contextApi.scheduleJob({
        id: `kitchensink-args-${moment().unix()}`,
        actionName: 'avocado.jobactionwithargs',
        dispatchAt: moment().add({ seconds: 5 }).toDate(),
        args: { greeting: 'hi, I was passed to a job in args and will be merged with action args' },
      }),
      contextApi.getActor().sendSystemMessage('The job has been scheduled to run 60 seconds from now (give or take the job.worker periodicity)'),
    ])
  }

  @UnrealAction('avocado.jobactionwithargs')
  onActionJobActionWithArgs(contextApi: ChatRoomActionContextApi): Promise<any> {
    const actionArgs = contextApi.getCurrentAction().args
    logger.log(`Received actionArgs: ${JSON.stringify(actionArgs)}`)
    return contextApi.getActor().sendSystemMessage(actionArgs.greeting)
  }

  @UnrealAction('avocado.action.countdown.second.30')
  onActionCountdown30Seconds(contextApi: ChatRoomActionContextApi): Promise<any> {
    const countdownField = new CountdownField()
      .startsNow()
      .warnsIn(20)
      .dangersIn(25)
      .endsIn(30)
      .toFieldTemplate()

    return contextApi.getChatRoom().saveField(countdownField)
  }

  @UnrealAction('avocado.action.countdown.second.30.ticker')
  onActionCountdown30SecondsTickerStyle(contextApi: ChatRoomActionContextApi): Promise<any> {
    const countdownField = new CountdownField()
      .startsNow()
      .warnsIn(20)
      .dangersIn(25)
      .endsIn(30)
      .style('Ticker')
      .toFieldTemplate()

    return contextApi.getChatRoom().saveField(countdownField)
  }

  @UnrealAction('avocado.action.cancel.job')
  cancelJob(contextApi: ChatRoomActionContextApi): Promise<any> {
    const id = '1234567890'
    return contextApi.cancelJob(id)
  }

  @UnrealAction('avocado.action.msg.chatstyle01')
  onActionSystemMessageWithChatStyle01(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor()
      .systemMessages()
      .text('Hey! This should be a styled message :)')
      .imageKey('avatar/jeff.png')
      .style('ChatStyle01')
      .stream()
  }

  @UnrealAction('avocado.modal.simple')
  onActionSimpleModal(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi
      .getActor()
      .modals()
      .simple()
      .image({ s3Key: 'tile/beer_1.png' })
      .title('Modal Title')
      .message('The message!')
      .stream()
  }

  @UnrealAction('avocado.modal.simple.quarter')
  onActionSimpleQuarterModal(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi
      .getActor()
      .modals()
      .simpleQuarter()
      .title('Golden Key')
      .message('Open any door in Unrel')
      .image({ s3Key: 'tile/troll_002.png' })
      .bottomImage({ s3Key: 'object/bluejoe.png' })
      .stream()
  }

  @UnrealAction('avocado.modal.simple.confirmation')
  onActionSimpleConfirmModal(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi
      .getActor()
      .modals()
      .simpleConfirmation()
      .title('Let\'s get started')
      .message('Swipe right to start crafting, or swipe left to discard it')
      .image({ s3Key: 'tile/beer_1.png' })
      .okButton({ text: 'Okay', actionCallback: 'avocado.modal.simple.confirmation.response' })
      .stream()
  }

  @UnrealAction('avocado.modal.simple.confirmation.response')
  onActionSimpleConfirmModalReponse(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi
      .getActor()
      .sendSystemMessage('Thanks for confirming that modal!')
  }

  @UnrealAction('avocado.modal.swippable.cards')
  onActionSwippableCardsModal(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi
      .getActor()
      .modals()
      .swippableCards()
      .buildAndAddCard(card => card
        .bgColor('#123456')
        .title('Golden Key')
        .message('This unique key will grant access to every place in Unreal')
        .image({ s3Key: 'tile/troll_002.png' })
        .lowerImage({ s3Key: 'tile/beer_1.png' })
        .lowerText('20 minutes')
        .acceptCallback('action.key.accept')
        .rejectCallback('action.key.reject'))
      .addCard('Banana Cake', 'A yummy cake', { s3Key: 'tile/beer_1.png' }, 'action.banana.accepted', undefined, undefined, 'action.banana.rejected', '#333666')
      .dismissible('go.away.func')
      .stream()
  }

  @UnrealAction('avocado.sequenceeffect.concurrent')
  onActionConcurrentEffect(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getChatRoom().saveEffect(sequenceEffectConcurrentTemplate)
  }

  @UnrealAction('avocado.tapme.launch')
  onLaunchKickPunchTapTroll(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi
      .getChatRoom()
      .saveTile(bigTapTroll)
  }

  @UnrealAction('avocado.tapme.ontap')
  onKickPunchTap(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi
      .getActor()
      .systemMessages()
      .text('Stop poking me!!! I am leaving\n')
      .stream()
      .then(() => contextApi.getChatRoom().saveTile(isDeletedLens.set(true)(bigTapTroll)))
  }

  @UnrealAction('avocado.ping')
  onPing(contextApi: ChatRoomActionContextApi): Promise<any> {
    // Give them 5 seconds to close the app or exit the room to test
    return contextApi.getActor().sendSystemMessage('Sending the ping in 5 seconds...')
      .then(() => delay(5000))
      .then(() => contextApi.getActor().sendPing())
      .then(() => contextApi.getActor().sendSystemMessage('Hey, there you are!'))
      .catch(() =>
        contextApi.getActor().sendNotification({
          title: 'Ping failed',
          body: 'Where did you go?!',
        })
      )
  }

  @UnrealAction('avocado.animate.native.dizzy')
  onNativeDizzy(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getChatRoom().saveTile(trollTileTemplate)
  }

  @UnrealAction('avocado.animate.native.addToInventoryFallDownFullScreen')
  addToInventoryFallDownFullScreen(contextApi: ChatRoomActionContextApi): Promise<any> {
    const item = _.sample(items)
    return contextApi.getChatRoom().saveEffect(removeFromRoom.animate(item.s3Key))
  }

  @UnrealAction('avocado.lottie.slow.speed')
  lottieSpeedTest(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getChatRoom().saveTile(
      sf.lens<number>('metadata.animation.speed').set(.1)(aceSpadesAnimatingTileTemplate)
    )
  }

  @UnrealAction('avocado.job.repeat')
  repeatJob(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.scheduleJob({
      id: Math.random().toString(),
      actionName: 'avocado.time.local',
      dispatchAt: moment().add({ seconds: 0 }).toDate(),
    }, { repeat: { limit: 3, every: 2000 } })
  }

  @UnrealAction('avocado.job.nodeapi')
  nodeApiJob(contextApi: ChatRoomActionContextApi): Promise<any> {
    return contextApi.getActor().scheduleJob({
      actionName: 'avocado.job.nodeapi.process',
      dispatchAt: moment().add({ seconds: 1 }).toDate(),
      args: { test: 1 },
    })
  }

  @UnrealAction('avocado.job.nodeapi.process')
  nodeApiJobProcess(contextApi: ChatRoomActionContextApi, @UnrealJobId() jobId?: string, @UnrealJobNodeEid() jobNodeEid?: string): Promise<any> {
    const node = contextApi.getJobNode()
    return contextApi.getActor().sendSystemMessage(`Hello JobID ${jobId},\n ${jobNodeEid}, ${node.getEid()}, ${node.getName()}}`)
  }

  @UnrealAction('avocado.hashtributes.reset')
  resetHashtributes(contextApi: ChatRoomActionContextApi): Promise<any> {
    return resetAllHashtributes(contextApi.getActor()).then((hashtributes) => {
      const names = hashtributes.map(trait => `- #${trait.displayName}`)
      return contextApi.getActor().sendSystemMessage([
        'The following hashtributes were reset:', ...names,
      ].join('\n'))
    })
  }

  @UnrealAction('avocado.actionxinstances.read')
  readActionXInstance(contextApi: ChatRoomActionContextApi): Promise<any> {
    // If you have 0 items in the inventory this action will fail, tough luck
    return contextApi.getActor().readAllActionInstances()
      .then(([item]) => Promise.all([
        item,
        contextApi.readActionInstance(item.id),
        contextApi.getActor().readActionInstance(item.id),
      ]))
      .then((items) => (
        contextApi.getActor().sendSystemMessage(
          `Same item in all cases: ${['', ...items.map(item => item.id)].join('\n- ')}`
        )
      ))
  }

  @UnrealAction('avocado.actionxinstances.replace')
  replaceActionXInstance(contextApi: ChatRoomActionContextApi): Promise<any> {
    const actor = contextApi.getActor()
    const toActionName = 'Action.Rewarded.Tomato'
    return actor.readAllActionInstances()
      .then((items) => actor.replaceActionInstance({ id: items.find(item => item.actionName !== toActionName).id, toActionName }))
      .then((item) => actor.sendSystemMessage(`Replaced an item for a ${item.actionName}`))
  }

  @UnrealAction('avocado.getByEid')
  getByEid(contextApi: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      // This one will be sync since it's in the context
      contextApi.getByEid(contextApi.getChatRoom().getEid()),
      // This one will need to be fetched from the DB
      contextApi.getByEid('unobject/bentley_43'),
    ])
      .then(entities => promiseMap(entities, (entity) => (
        contextApi.getActor().sendSystemMessage(`Fetched the entity with Eid ${entity.getEid()}`)
      )))
  }

  @UnrealAction('avocado.counter.increase')
  counterIncrease(api: ChatRoomActionContextApi): Promise<any> {
    const actor = api.getActor()
    const resetIn: DurationInputObject = { seconds: 10 }
    const keys = [api.getCurrentAction(), api.getChatRoom(), api.getUnObject(), 'counter']
    return incCounter(actor, keys, randomInt(-10, 10), resetIn)
      .then(() => getCounterField(actor, keys))
      .then(field => (
        actor.sendSystemMessage([
          `name: "${field.name}"`,
          `delta: ${field.metadata.delta}`,
          `value: ${field.metadata.numberValue}`,
          `resets in: ${moment.duration(resetIn).humanize({ ss: 1 })}`,
          `reset at: ${field.expiresAt.toISOString().split(/[TZ]/)[1]}`,
        ].join('\n'))
      ))
  }

  @UnrealAction('avocado.time.local')
  localTime(api: ChatRoomActionContextApi): Promise<any> {
    return api.getActor().sendSystemMessage(
      `Your local time is: ${api.getActor().getLocalTime().toLocaleString()}`
    )
  }

  @UnrealAction('avocado.newsfeed.default')
  newsfeedItemDefault(api: ChatRoomActionContextApi): Promise<any> {
    const actor = api.getActor()
    const item = _.sample(items)

    return api.saveNewsfeedItem({
      layout: DynamicFeedItemLayout.Dynamic1,
      userId: actor.getId(),
      fromEid: SYSTEM_USER_EID,
      context: { itemName: item.name, actorEid: actor.getEid() },
      metadata: {
        backgroundColor: item.backgroundColor,
        backgroundImage: { uri: _.sample(NewsBackgrounds) },
        image: { s3Key: item.s3Key },
        overlayImage: { s3Key: 'overlay/crimescene.png' },
        title: item.text,
        description: item.description,
        insetPlayerEid: api.getUnObject().getEid(),
        isNew: true,
        statusText: '{{ name actor }} got a new {{ name item }}',
        action: {
          entityId: item.name,
          entityType: FeedItemActionEntityType.Item,
          type: FeedItemActionType.Backpack,
        },
      },
    })
  }

  @UnrealAction('avocado.newsfeed.live')
  newsfeedItemLive(api: ChatRoomActionContextApi): Promise<any> {
    const actor = api.getActor()
    const item = _.sample(items)

    return api.saveNewsfeedItem({
      layout: DynamicFeedItemLayout.Dynamic1,
      userId: actor.getId(),
      fromEid: SYSTEM_USER_EID,
      context: { itemName: item.name, actorEid: actor.getEid() },
      stateId: 'avocadoed_1484',
      isLive: true,
      metadata: {
        backgroundColor: item.backgroundColor,
        backgroundImage: { uri: _.sample(NewsBackgrounds) },
        image: { s3Key: item.s3Key },
        overlayImage: { s3Key: 'overlay/crimescene.png' },
        title: item.text,
        description: item.description,
        insetPlayerEid: api.getUnObject().getEid(),
        isNew: true,
        statusText: '{{ name actor }} got a new {{ name item }}',
        action: {
          entityId: item.name,
          entityType: FeedItemActionEntityType.Item,
          type: FeedItemActionType.Backpack,
        },
      },
    })
  }

  @UnrealAction('avocado.newsfeed.expireLive')
  expireNewsfeedItemLive(api: ChatRoomActionContextApi): Promise<any> {
    return api.getActor().inactivateLiveNewsfeedItem('avocadoed_1484')
  }

  @UnrealAction('avocado.newsfeed.rateLimit')
  newsfeedItemRateLimit(api: ChatRoomActionContextApi): Promise<any> {
    const actor = api.getActor()
    const item = _.sample(items)

    return api.saveNewsfeedItem({
      layout: DynamicFeedItemLayout.Dynamic1,
      userId: actor.getId(),
      fromEid: SYSTEM_USER_EID,
      rateId: `${api.getCurrentActionName()}.${actor.getId()}`,
      rateLimit: { days: 1 },
      context: { itemName: item.name },
      stateId: 'avocadoed_1484',
      isLive: true,
      metadata: {
        backgroundColor: item.backgroundColor,
        backgroundImage: { uri: _.sample(NewsBackgrounds) },
        image: { s3Key: item.s3Key },
        overlayImage: { s3Key: 'overlay/crimescene.png' },
        title: item.text,
        description: item.description,
        insetPlayerEid: api.getUnObject().getEid(),
        isNew: true,
        statusText: 'RATE LIMITED: {{ name actor }} got a new {{ name item }}',
        action: {
          entityId: item.name,
          entityType: FeedItemActionEntityType.Item,
          type: FeedItemActionType.Backpack,
        },
      },
    })
  }

  @UnrealAction('avocado.newsfeed.you')
  async newsfeedItemDefaultYou(api: ChatRoomActionContextApi): Promise<any> {
    const statusText = '{{ name actor }} {{ isare actor }} vain and kissed {{ himselfherself actor }} in {{ hisher actor }} belly button, better tell {{ himher actor }} that is not socially acceptable and that {{ heshe actor }} should stop that behavior.'
    return api.saveNewsfeedItem({
      userId: api.getActor().getId(),
      layout: DynamicFeedItemLayout.Dynamic1,
      fromEid: SYSTEM_USER_EID,
      metadata: { statusText, backgroundImage: { s3Key: 'mp4/in_love_with_me.mp4' } },
    })
      .then(() => api.getActor().sendMessage({ text: statusText }))
  }

  @UnrealAction('avocado.nativeAnimations.orbit')
  async orbit(api: ChatRoomActionContextApi): Promise<any> {
    const animationTemplate: NativeAnimationId = 'orbit_5'
    // This one sends an effect with tileName
    return api.getChatRoom().saveEffectOnTile({
      type: EffectType.AnimationEffect,
      scope: EntityScope.GlobalScope,
      metadata: {
        animationType: AnimationType.SpriteAnimation,
        animationTemplate,
        sprite: { s3Key: items.poop_678.s3Key },
      },
    }, fullScreenTileTemplate)
  }

  @UnrealAction('avocado.nativeAnimations.explosion')
  async explosion(api: ChatRoomActionContextApi): Promise<any> {
    const animationTemplate: NativeAnimationId = 'explosion'
    // This one sends a tile with a nativeAnimation in it
    return api.getChatRoom().saveTile(defaultsDeep({
      metadata: {
        animation: {
          animationType: AnimationType.SpriteAnimation,
          animationTemplate,
          sprite: { s3Key: items.rainbow_poop_1619.s3Key },
        },
      },
    }, fullScreenTileTemplate))
  }

  @UnrealAction('avocado.modifiers')
  modifiers(api: ChatRoomActionContextApi): Promise<any> {
    return Promise.all([
      api.getActor().sendSystemMessage(`You picked ${api.getCurrentActionTarget() || 'none'}`),
      updateStubsModifiers(api),
    ])
  }

  @UnrealAction('avocado.items.grant')
  itemsGrant(api: ChatRoomActionContextApi): Promise<any> {
    return promiseMap(Object.values(items), item => (
      api.getActor().createActionInstance({ actionName: item.name }))
    )
      .then(() => api.getActor().sendSystemMessage('Added all known items to your inventory'))
  }

  @UnrealAction(WILDCARD_ACTION)
  grantAnItem(api: ChatRoomActionContextApi): Promise<any> {
    const item: Item | undefined = items[api.getCurrentActionName()]
    if (!item) {
      return Promise.resolve()
    }
    return promiseMap(_.range(10), () => (
      api.getActor().createActionInstance({ actionName: item.name }))
    )
      .then(() => api.getActor().sendSystemMessage(`Enjoy some more ${item.text}!`))
  }

}
