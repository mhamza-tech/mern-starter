/**
 * @rob4lderman
 * feb2020
 * 
 * Hammock handler module.
 */

import {
  ActionResolver,
  ChatRoomActionContextApi,
  NewsfeedItemTemplate,
} from '../types'
import {
  sf,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import _ from 'lodash'
import {
  registerReactionFnMap,
  ReactionFnMap,
} from '../../enginev3'
import {
  localActionNames,
  stateActionGroups,
  sleepingTileTemplate,
  star1TileTemplate,
  star2TileTemplate,
  star3TileTemplate,
  star4TileTemplate,
  sheepsRidingCarTileTemplate,
  NewsfeedItemComposedImageTemplate,
  metadataStatusTextLens,
  metadataActorEidLens,
  metadataInsetPlayerEidLens,
  hammockTightenStateFieldTemplate,
  potOfGoldTileTemplate,
  nightmareTileTemplate,
  NewsfeedNightmareTemplate,
  NewsfeedPotOfGoldTemplate,
} from './hammock.assets'
import { getUserState, incUserState } from '../userStates'
import { HashStatusFieldMetadata } from '../types'
import { incrementUserXP } from '../experiencePoints'
import { Field } from '../../gql-types'
import { incrementUserAttribute, UserAttributeKey } from '../playerHelpers'
//import { metadataImageLens } from "./kitchensink.assets";

const logger = LoggerFactory('beach_hammock_534', 'NPC')

/**
 * @param contextApi 
 */
const onActionCountSheep = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return getUserState(contextApi.getActor(), 'sleepy_261')
    .then(metadata => {
      if (metadata.numberValue > 0) {
        return incUserState(contextApi.getActor(), 'sleepy_261', -1).then(() => { })
      } else {
        return contextApi.getActor().sendSystemMessage('You are not tired anymore!').then(() => { })
      }
    })
}
/**
 * @param contextApi 
 */
const onActionRest = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return contextApi.getChatRoom().field(hammockTightenStateFieldTemplate)
    .then(field => {
      if (field.metadata.numberValue > 0) {
        return getUserState(contextApi.getActor(), 'sleepy_261')
          .then((metadata: HashStatusFieldMetadata) => {
            if (metadata.numberValue > 0) {
              contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.resting'])
              contextApi.getChatRoom().saveTile(sleepingTileTemplate)
              return contextApi.getActor().sendSystemMessage(`Finally back to Dreamland, your Tired status is ${metadata.numberValue} `)
            } else {
              return contextApi.getActor().sendSystemMessage('You are not tired enough to sleep!')
            }
          })
      } else {
        return contextApi.getActor().sendSystemMessage('The hammock is too loose, you must tighten it up before using it!')
      }
    })
}

/**
 * @param contextApi 
 */
const onActionTighten = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  contextApi.getChatRoom().field(hammockTightenStateFieldTemplate)
    .then((field: Field) => {
      if (field.metadata.numberValue == 0) {
        contextApi.getChatRoom().incrementField(hammockTightenStateFieldTemplate, 5)
      }
    })

  getUserState(contextApi.getActor(), 'wasted_304')
    .then((metadata: HashStatusFieldMetadata) => {
      if (metadata.numberValue > 0) {
        contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.baNapAvailable'])
      } else {
        contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.start'])
      }
    })
  return contextApi.getActor().sendSystemMessage('You tightened the hammock!')
}

/**
 * @param contextApi 
 */
const onActionWakeUp = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  contextApi.getChatRoom().field(hammockTightenStateFieldTemplate)
    .then((field: Field) => {
      if (field.metadata.numberValue > 0) {
        contextApi.getChatRoom().incrementField(hammockTightenStateFieldTemplate, -1)
      } else {
        // contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.start'])
      }
    })

  // contextApi.getChatRoom().field(hammockTightenStateFieldTemplate)
  // .then((field: Field) => contextApi.getActor().sendSystemMessage("Hammock tighten state: " +(field.metadata.numberValue - 1)))

  contextApi.getChatRoom().field(hammockTightenStateFieldTemplate)
    .then((field: Field) => {
      if (field.metadata.numberValue > 1) {
        getUserState(contextApi.getActor(), 'wasted_304')
          .then((metadata: HashStatusFieldMetadata) => {
            if (metadata.numberValue > 0) {
              contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.baNapAvailable'])
            } else {
              contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.start'])
            }
          })
      } else {
        getUserState(contextApi.getActor(), 'wasted_304')
          .then((metadata: HashStatusFieldMetadata) => {
            if (metadata.numberValue > 0) {
              contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.tightenBaNap'])
            } else {
              contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.tightenRest'])
            }
          })
        //contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.start'])
      }
    })

  // contextApi.getChatRoom().field(bluntsAmountFieldTemplate)
  // .then((field: Field) => {
  //     if(field.metadata.numberValue > 0)  {
  //         contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.bluntFound'])  
  //     }
  //     else {
  //         contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.start'])
  //     }
  // })

  //potOfGoldTileTemplate

  incrementUserXP(contextApi.getActor(), 2)
  contextApi.getChatRoom().saveTiles([sf.lens('isDeleted').set(true)(sleepingTileTemplate),
    (sf.lens('isDeleted').set(true)(star1TileTemplate)),
    (sf.lens('isDeleted').set(true)(star2TileTemplate)),
    (sf.lens('isDeleted').set(true)(star3TileTemplate)),
    (sf.lens('isDeleted').set(true)(star4TileTemplate)),
    (sf.lens('isDeleted').set(true)(sheepsRidingCarTileTemplate)),
    (sf.lens('isDeleted').set(true)(potOfGoldTileTemplate)),
    (sf.lens('isDeleted').set(true)(nightmareTileTemplate))])
  return contextApi.getActor().sendSystemMessage('What a great nap!')
}

/**
 * @param contextApi 
 */
const onActionbaNap = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return contextApi.getChatRoom().field(hammockTightenStateFieldTemplate)
    .then(field => {
      if (field.metadata.numberValue > 0) {
        let highEnoughToSleep = false
        return Promise.all([
          getUserState(contextApi.getActor(), 'wasted_304')
            .then((metadata: HashStatusFieldMetadata) => {
              if (metadata.numberValue > 0) {
                highEnoughToSleep = true
              } else {
                highEnoughToSleep = false
              }
            }),
          getUserState(contextApi.getActor(), 'sleepy_261')
            .then(metadata => {
              if (metadata.numberValue > 0 && highEnoughToSleep == true) {
                contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.baNap'])
                //get random dream function here
                const getDream = Math.floor((3) * Math.random())
                switch (getDream) {
                  case 0: return Promise.all([
                    contextApi.getChatRoom().saveTiles([sleepingTileTemplate, star1TileTemplate, star2TileTemplate, star3TileTemplate,
                      star4TileTemplate, sheepsRidingCarTileTemplate]),
                    contextApi.saveNewsfeedItem(
                      _.chain(NewsfeedItemComposedImageTemplate)
                        .thru(metadataStatusTextLens.set('**[{{ name actor }}]({{ rawProfileLink actor }})** just had an **awesome** dream about sheeps driving a **sports car**!'))
                        .thru(metadataActorEidLens.set(contextApi.getActor().getEid()))
                        .thru(metadataInsetPlayerEidLens.set(contextApi.getPartner().getEid()))
                        .value() as NewsfeedItemTemplate
                    ),
                  ]).then(() => { })
                  case 1: return Promise.all([
                    contextApi.getChatRoom().saveTiles([sleepingTileTemplate, star1TileTemplate, star2TileTemplate, star3TileTemplate,
                      star4TileTemplate, potOfGoldTileTemplate]),
                    contextApi.saveNewsfeedItem(
                      _.chain(NewsfeedPotOfGoldTemplate)
                        .thru(metadataStatusTextLens.set('**[{{ name actor }}]({{ rawProfileLink actor }})** just had an **amazing** dream about finding a pot of gold at the end of the **rainbow**!'))
                        .thru(metadataActorEidLens.set(contextApi.getActor().getEid()))
                        .thru(metadataInsetPlayerEidLens.set(contextApi.getPartner().getEid()))
                        .value() as NewsfeedItemTemplate
                    ),
                  ]).then(() => { })
                  case 2: return Promise.all([
                    contextApi.getChatRoom().saveTiles([sleepingTileTemplate, star1TileTemplate, star2TileTemplate, star3TileTemplate,
                      star4TileTemplate, nightmareTileTemplate]),
                    contextApi.saveNewsfeedItem(
                      _.chain(NewsfeedNightmareTemplate)
                        .thru(metadataStatusTextLens.set('**[{{ name actor }}]({{ rawProfileLink actor }})** just had a **nightmare**!'))
                        .thru(metadataActorEidLens.set(contextApi.getActor().getEid()))
                        .thru(metadataInsetPlayerEidLens.set(contextApi.getPartner().getEid()))
                        .value() as NewsfeedItemTemplate
                    ),
                  ]).then(() => { })
                }

                // contextApi.getChatRoom().saveTiles([sleepingTileTemplate, star1TileTemplate, star2TileTemplate, star3TileTemplate,
                // star4TileTemplate, sheepsRidingCarTileTemplate]);

                //contextApi.getChatRoom().saveTile(sparklesTileTemplate);
                incUserState(contextApi.getActor(), 'sleepy_261', -metadata.numberValue)

                getUserState(contextApi.getActor(), 'wasted_304')
                  .then((metadata: HashStatusFieldMetadata) => {
                    if (metadata.numberValue > 0) {
                      incUserState(contextApi.getActor(), 'wasted_304', -metadata.numberValue)
                    }
                  })

                return contextApi.getActor().sendSystemMessage('Now that’s how you sleep').then(() => { })
                //Share the dream function here
                // return Promise.all([
                //     contextApi.saveNewsfeedItem(
                //         _.chain( NewsfeedItemComposedImageTemplate )
                //             .thru( metadataStatusTextLens.set( `**[{{ name actor }}]({{ rawProfileLink actor }})** just had an **awesome** dream about sheeps driving a **sports car**!`) )
                //             //.thru( metadataImageLens.set( { uri: 'https://scontent.fsfn4-1.fna.fbcdn.net/v/t1.15752-9/89125494_131545018274874_6077787909669257216_n.png?_nc_cat=108&_nc_sid=b96e70&_nc_ohc=8lr9PhjVVHkAX-f89Ug&_nc_ht=scontent.fsfn4-1.fna&oh=fc13c54062e63971c2967fd1cce12b31&oe=5E96CF63' } ) )
                //             //metadataImageLens was imported from kitchen.assets
                //             //.thru( metadataFeaturedImageLens.set( { s3Key: 'tile/beer_1.png' } ) )
                //             .thru( metadataActorEidLens.set( contextApi.getActor().getEid() ) )
                //             .thru( metadataInsetPlayerEidLens.set( contextApi.getPartner().getEid() ) )
                //             .value() as NewsfeedItemTemplate
                //     )])
              } else {
                return contextApi.getActor().sendSystemMessage('You are not tired or high enough for a Badass Nap!').then(() => { })
              }
            }),
        ]).then(() => { })
      } else {
        return contextApi.getActor().sendSystemMessage('The hammock is too loose, you must tighten it up before using it!').then(() => { })
      }
    })
}

/**
 * @param contextApi 
 */
const onActionSearch = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  const itemFound = Math.floor((5) * Math.random())
  return getUserState(contextApi.getActor(), 'sleepy_261')
    .then(metadata => {
      if (metadata.numberValue < 5) {
        incUserState(contextApi.getActor(), 'sleepy_261', 1)
        switch (itemFound) {
          case 0:
          case 1:
            return incrementUserAttribute(contextApi.getActor(), UserAttributeKey.Wealth, 5)
              .then((wealthValue: number) => `Lucky you! You have found $5! You now have $${wealthValue} in your wallet. `)
              .then(contextApi.getActor().sendSystemMessage)
            break
          default: return contextApi.getActor().sendSystemMessage('You haven’t found anything')
        }
      } else {
        return contextApi.getActor().sendSystemMessage('You are too tired to search')
      }
    })
}

/**
 * @param contextApi 
 */
const onActionLightBlunt = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return getUserState(contextApi.getActor(), 'wasted_304')
    .then((metadata: HashStatusFieldMetadata) => {
      if (metadata.numberValue < 5) {
        incUserState(contextApi.getActor(), 'wasted_304', 1)

        return contextApi.getActor().sendSystemMessage('You lighted a blunt')
      } else {
        return contextApi.getActor().sendSystemMessage('You are too high')
      }
    })
}

/**
 * Long-pressing the user's avatar in the upper-right of the Chat Room will
 * execute the 'Action.Debug.Reset' action, which is wired up to this method.
 * 
 * @param contextApi 
 */
const onReset = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  logger.info('onReset')
  return Promise.resolve([
    contextApi.getActor().sendSystemMessage('RESET!'),
  ])
}

/**
 * This method is called every time a User enters this Chat Room.
 * @param contextApi 
 */
const onEnter = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  logger.info('onEnter')
  //
  // What's going on here??
  // 
  // 1. setCurrentActionEdges - sets the actions that are visible in the action sheet 
  //    of this Chat Room.
  //    Most handler modules set the action sheet in onEnter.
  // 2. readOrCreateLocalActionEdges - creates "edges" in the DB between the User and
  //    the localActionNames.  This needs to happen at least once, before the actions
  //    will show in the User's action sheet.  It's an idempotent operation, so it is
  //    safe to call it multiple times.  If you update the list of localActionNames,
  //    then you'll need to call this again to create edges to the new actions.
  //    For simplicity, especially during dev, it makes sense to call it every time
  //    in onEnter.
  // 

  // contextApi.getChatRoom().field(bluntsAmountFieldTemplate)
  // .then((field: Field) => {
  //     if(field.metadata.numberValue > 0)  {
  //         contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.bluntFound'])  
  //     }
  //     else {
  //         contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.start'])
  //     }
  // })

  contextApi.getChatRoom().field(hammockTightenStateFieldTemplate)
    .then((field: Field) => {
      if (field.metadata.numberValue > 0) {
        getUserState(contextApi.getActor(), 'wasted_304')
          .then((metadata: HashStatusFieldMetadata) => {
            if (metadata.numberValue > 0) {
              contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.baNapAvailable'])
            } else {
              contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.start'])
            }
          })
      } else {
        getUserState(contextApi.getActor(), 'wasted_304')
          .then((metadata: HashStatusFieldMetadata) => {
            if (metadata.numberValue > 0) {
              contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.tightenBaNap'])
            } else {
              contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.tightenRest'])
            }
          })
        //contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.start'])
      }
    })

  Promise.resolve(null)
    .then(_.partial(contextApi.getActor().readOrCreateLocalActionEdges, localActionNames))
    .then(() => contextApi.getChatRoom().field(hammockTightenStateFieldTemplate))
    .then((field: Field) => {
      if (field.metadata.numberValue > 0) {
        getUserState(contextApi.getActor(), 'wasted_304')
          .then((metadata: HashStatusFieldMetadata) => {
            if (metadata.numberValue > 0) {
              _.partial(contextApi.getActor().setCurrentActionEdges, stateActionGroups['state.hammock.baNapAvailable'])
              //contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.baNapAvailable']);
            } else {
              //contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.start']);
              _.partial(contextApi.getActor().setCurrentActionEdges, stateActionGroups['state.hammock.start'])
            }
          })
      } else {
        getUserState(contextApi.getActor(), 'wasted_304')
          .then((metadata: HashStatusFieldMetadata) => {
            if (metadata.numberValue > 0) {
              //contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.tightenBaNap']);
              _.partial(contextApi.getActor().setCurrentActionEdges, stateActionGroups['state.hammock.tightenBaNap'])
            } else {
              _.partial(contextApi.getActor().setCurrentActionEdges, stateActionGroups['state.hammock.tightenRest'])
              //contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.tightenRest']);
            }
          })
        //contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.hammock.start'])
      }
    })

  return contextApi.getActor().sendSystemMessage(
    `HI! Welcome to ${contextApi.getUnObject().getName()}!`
  )
}

/**
 * The NPC's unObjectId for this handler module.
 * Each handler module is associated with a specific NPC.
 */
const unObjectId = 'beach_hammock_534'

/**
 * This wires up the reaction functions in this module to the action router. 
 * This method should be called from onLoad.
 */
const registerReactionFns = (): Promise<any> => {
  return registerReactionFnMap(unObjectId, {
    'action.hammock.rest': onActionRest,
    'action.hammock.wakeup': onActionWakeUp,
    'action.hammock.countSheep': onActionCountSheep,
    'Action.Debug.Reset': onReset,
    'action.hammock.restCompletely': onActionbaNap,
    'action.hammock.search': onActionSearch,
    'action.hammock.blunt': onActionLightBlunt,
    'action.hammock.tighten': onActionTighten,
  } as ReactionFnMap)
}

/**
 * All handler modules export an ActionResolver object.
 */
const actionResolver: ActionResolver = {
  unObjectId,
  onEnter,
  onReset,
  onLoad: registerReactionFns,
}

export default actionResolver
