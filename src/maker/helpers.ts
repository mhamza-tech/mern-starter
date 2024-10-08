import _ from 'lodash'
import {
  SetLocalStateInput,
  ChatRoomActionContextApi,
  NodeApi,
} from './types'
import { LottieLibrary } from 'src/maker/assets'

import { SaveFieldOutput, FieldType } from '../gql-types'
export interface Scene {
  unObject: any
  location: any
}

export enum toMessage {
  player,
  unObject,
}

export interface ItemDescription {
  prefix: string
  name: string
  isWearing: boolean
  disrobeMessage: { toUser: string; toUnObject: string }
}

// export const actionCounterName = (actionName: string): string => {
//   return actionName + '_count'
// }

export const say = _.rest(function (what, names) {
  return what + ' ' + _.initial(names).join(', ') + (_.size(names) > 1 ? ', & ' : '') + _.last(names)
})

export const toCommaString = _.rest(function (names) {
  return _.initial(names).join(', ') + (_.size(names) > 1 ? ', & ' : '') + _.last(names)
})

export const lotties = {
  // TODO: spread the new lib here so we don't HAVE to update old NPCs/actions now. Most will go away
  ...LottieLibrary,
  buttcoin: 'https://assets7.lottiefiles.com/datafiles/8xLMjZJ5z4LTI93/data.json',
  starexplode: 'https://assets7.lottiefiles.com/datafiles/UMSCdaMgjwzpkDF/data.json',

  dancingmonkey: 'https://assets8.lottiefiles.com/packages/lf20_Y8UeVt.json',
  cryingsadface: 'https://assets8.lottiefiles.com/datafiles/AP6eAJ4K8cbfOl9/data.json',
  bluediamond: 'https://assets2.lottiefiles.com/packages/lf20_ZCjq5s.json',
  magnify1: 'https://assets10.lottiefiles.com/packages/lf20_7CtEHh/search_04.json',
  glitter1: 'https://assets5.lottiefiles.com/temp/lf20_C3gF4y.json',

  // Beer animations
  happy_friday: 'https://assets10.lottiefiles.com/packages/lf20_apus74.json',
  beer_mug: 'https://assets4.lottiefiles.com/packages/lf20_1KXVr1/beer.json',
  beer: 'https://assets8.lottiefiles.com/temp/lf20_YbXgAc.json',

  // This beer_charlotte_dupont seems to have particle that causes the lottie engine to crash the app
  // so we can't use it.  Let's try not to use animations that have particles that fly off the screen
  // beer_charlotte_dupont: 'https://assets2.lottiefiles.com/packages/lf20_UDstUT.json',

  beer_mug_2: 'https://assets1.lottiefiles.com/packages/lf20_9calsB/53 - Beer Mug.json',
  new_year_party: 'https://assets5.lottiefiles.com/packages/lf20_44x5Wm.json',

  wave1: 'https://assets9.lottiefiles.com/packages/lf20_Xc3ARL.json',
  chatterteeth: 'https://assets10.lottiefiles.com/datafiles/qkRnxNcx7UVdZLa/data.json',
  lock1: 'https://assets4.lottiefiles.com/packages/lf20_56AmG7.json',
  beaker1: 'https://assets6.lottiefiles.com/packages/lf20_PHgz6B.json',

  // Kiss Animations
  kiss_victor_kai: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',
  // kissing_emoji: 'https://assets4.lottiefiles.com/packages/lf20_iOEPwP.json',
  // kissing: 'https://assets3.lottiefiles.com/packages/lf20_zijAa0.json',
  kissing_cute_bears_bryan_seah: 'https://assets4.lottiefiles.com/packages/lf20_zijAa0.json',
  animated_bears_1_bryan_seah: 'https://assets5.lottiefiles.com/packages/lf20_AoAA16.json',
  more_bears_bryan_seah: 'https://assets6.lottiefiles.com/packages/lf20_I4rPAT.json',

  // Dance Animations
  dancing: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',

  // Air Guitar Animations
  air_guitar_tune: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',

  // Disco Ball Animations
  disco_ball: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',

  // Dancing Dog Animations
  dancing_dog: 'https://assets5.lottiefiles.com/packages/lf20_eLKAOD.json',

  // Black Hole Animations
  black_hole: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',

  // Burping Animations
  burping: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',

  // Chocolate Waterfall Animations
  chocolate_waterfall: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',

  // Drone Selfie Animations
  drone_selfie: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',

  // Fireball Animatios
  fireball: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',

  // Flip Off Animations
  flip_off: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',

  // Full Moon
  full_moon: 'https://assets7.lottiefiles.com/packages/lf20_mW5rHk.json',

  // Confetti
  confetti: 'https://assets7.lottiefiles.com/datafiles/3mHMugmtPuaAyzO/data.json',

  // Sing
  sing: 'https://assets2.lottiefiles.com/packages/lf20_H9cy3V.json',

  feed_pizza: 'https://assets5.lottiefiles.com/temp/lf20_8pOfYn.json',

  swordfight1: 'https://assets1.lottiefiles.com/datafiles/yHc09CaY4TXtqFA/data.json',
  fireworks1: 'https://assets9.lottiefiles.com/datafiles/Tj3Hd1X74Once2j/data.json', // bad formatting on screen
  fireworks2: 'https://assets5.lottiefiles.com/packages/lf20_kd7V2C.json',
  fireworks3: 'https://assets6.lottiefiles.com/datafiles/uPRZVpdi1M78Hhm/data.json',
  takePill1: 'https://assets9.lottiefiles.com/datafiles/GsRJSv3N6Uwz8nY/data.json',
  spray1: 'https://assets10.lottiefiles.com/packages/lf20_OANf6P.json',
  help1: 'https://assets6.lottiefiles.com/datafiles/uym8UXCA3u5ALDa/data.json',
  firstplacecup: 'https://assets6.lottiefiles.com/datafiles/VtCIGqDsiVwFPNM/data.json',
  dotchatanimation: 'https://assets7.lottiefiles.com/datafiles/de0d21bcb94547e12540cb362d965f8e/data.json',
  highfive: 'https://assets2.lottiefiles.com/packages/lf20_lH3QMK.json',
  giftbox1: 'https://assets1.lottiefiles.com/datafiles/zc3XRzudyWE36ZBJr7PIkkqq0PFIrIBgp4ojqShI/newAnimation.json',
  singlespinninggear: 'https://assets2.lottiefiles.com/datafiles/1muIJcITVpLzjzp/data.json',
  multispinninggear: 'https://assets2.lottiefiles.com/datafiles/lMHl0obBNN9kCUE/data.json',
  greenCheck: 'https://assets10.lottiefiles.com/packages/lf20_n9uJIY.json',
  greencheck2: 'https://assets1.lottiefiles.com/datafiles/F8yLwPvno9fP0Ag/data.json',
  smileface_1: 'https://assets8.lottiefiles.com/packages/lf20_18ApyG.json',
  pour_whiskey: 'https://assets3.lottiefiles.com/packages/lf20_Iz7RoP.json',
  // eyeball_1: 'https://assets8.lottiefiles.com/datafiles/9Yy5W6jdnnTTDHb/data.json',
  eyeball_2: 'https://assets2.lottiefiles.com/temp/lf20_kkhPlx.json',
  eyeball_3: 'https://assets9.lottiefiles.com/temp/lf20_D0nz3r.json',
  punch_1: 'https://assets1.lottiefiles.com/packages/lf20_8dWDU2.json',
  glare_1: 'https://assets2.lottiefiles.com/packages/lf20_CZ5mts.json',

  // debug reset
  search: 'https://assets1.lottiefiles.com/packages/lf20_uhnn8C/32 - Search from Cloud.json',
  reload_salih: 'https://assets5.lottiefiles.com/datafiles/pkdpXUEZjLLKgnqTQPW56QqbLovxwZ1MAZD1HPrC/ModernPictogramsForLottie_Reload.json',
  lego_loader: 'https://assets7.lottiefiles.com/datafiles/RsO0f9C8rU3E426/data.json',

  clouds_carlos_ochoa: 'https://assets10.lottiefiles.com/packages/lf20_unJ8q8.json',

  flipoff_eugene: 'https://assets10.lottiefiles.com/packages/lf20_1tvq5c.json'

  , confetti_cannons: 'https://assets10.lottiefiles.com/packages/lf20_u4yrau.json'
  , chat_salih: 'https://assets6.lottiefiles.com/datafiles/4jrBMHVtyhhLAprII2ZO9QxLHdMZfp8hjAvp7lgs/ModernPictogramsForLottie_SpeechBubble.json'
  , chat_conversation: 'https://assets9.lottiefiles.com/packages/lf20_yFmNqK/chat_03.json',
  unicorn_bomb: 'https://assets6.lottiefiles.com/packages/lf20_IzvAfk.json',
  witches_brew: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',
  vampire_bite: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',
  snowball_fight: 'https://assets3.lottiefiles.com/packages/lf20_RxT5mk.json',
  shrink_ray: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',
  puppy_stampede: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',
  mosh_pit: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',
  insane_pepper: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',
  icestorm: 'https://assets10.lottiefiles.com/packages/lf20_06r0kk.json',
  glowstick_show: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',

  glitternado: 'https://assets3.lottiefiles.com/datafiles/gD8H2jNOhxSiBqb/data.json',

  //backgrounds

  //  blob_2 do not use ever.  ugly.

  //  red_time_warp has choppy animation sequence.  do not use ever.  ugly.

  apple: 'https://assets4.lottiefiles.com/datafiles/B72oUBQasKJJz8b/data.json',
  confetti_ribbons: 'https://assets5.lottiefiles.com/packages/lf20_aEFaHc.json',

}

export const getRandomLookAnimation = (): string => {
  return _.sample([lotties.eyeball_2, lotties.eyeball_3])
}

export const getRandomKissAnimation = (): string => {
  return _.sample([
    lotties.kiss_victor_kai
    , lotties.kissing_cute_bears_bryan_seah
    , lotties.animated_bears_1_bryan_seah
    , lotties.more_bears_bryan_seah,
  ])
}

export const getRandomDanceAnimation = (): string => {
  return _.sample([
    lotties.dancing,
  ])
}

export const getRandomBeerAnimation = (): string => {
  return _.sample([
    lotties.happy_friday
    , lotties.beer_mug
    , lotties.beer_mug_2
    , lotties.beer,
    // , lotties.beer_charlotte_dupont
  ])
}

export const imageS3Key = {
  BuyDietPills: 'action/color/buydietpill.png', // has a dollar sign in the image
  InventoryDietPills: 'action/color/dietpill.png', // has a dollar sign in the image
  // DietPills: 'action/color/dietpill.png'
  BuyFirstAidKit: 'action/color/buyaidkit.png' // has a dollar sign in the image
  , FirstAidKit: 'action/color/aidkit.png'
  , Beer: 'action/color/beermug.png'
  , HighFive: 'action/color/highfive.png'
  , WaterDropH2O: 'action/color/water.png'
  , BillTwentyDollars: 'action/color/20bill.png'
  , Whiskey: 'action/color/whiskey.png'
  , Corn: 'action/color/corn.png'
  , Hops: 'action/color/hops.png',
  Knife: 'action/color/knive.png',
  StackOfMoney: 'action/color/money.png',
  Pizza: 'action/color/pizza.png',
  RainbowBrick: 'action/color/rainbowbrick.png',
  Apple: 'action/color/apple.png',
  GoldenApple: 'action/color/goldenapple.png',
  Platypus: 'http://stmarkhamilton.org/wp-content/uploads/2015/06/OR-platypus.png',
  Tile: {

    // , PointerFinger: 'tile/pointing_finger.png',
    // SubWindowStyle1: 'tile/haunted.house.window.cutout.png'
  
  },
  Overlay: {
    Square: {
      OneByOne: 'overlay/1x1.png',
      BloodBath1: 'overlay/blood_bath_1x1.png',
    },
    FourByThree: {
      BloodBath1: 'overlay/blood_bath_4x3.png',
    },
  },
}

/**
 * @return fn
 */
export const pause = pause_ms => (value): Promise<any> => {
  return new Promise(resolve => setTimeout(() => resolve(value), pause_ms))
}

export const diff_hours = (dt2: Date, dt1: Date): number => {
  let diff = (dt2.getTime() - dt1.getTime()) / 1000
  diff /= (60 * 60)
  return Math.abs(Math.round(diff))
}

export const diff_mins = (dt2: Date, dt1: Date): number => {
  let diff = (dt2.getTime() - dt1.getTime()) / 1000
  diff /= (60)
  return Math.abs(Math.round(diff))
}

// Takes a % probability and returns true based on a random chance and that probability
export const probability = (perc: number): boolean => {
  return Math.random() * 100 <= perc
}

export const grammarAOrAn = (noun: string) : string => {
  return `${'aeiou'.includes(noun[0].toLowerCase()) ? 'an' : 'a'} ${noun}`
}

const setIsTyping = (actorApi: NodeApi, booleanValue: boolean): Promise<any> => {
  const setLocalStateInput: SetLocalStateInput = {
    type: FieldType.BooleanField,
    name: 'isTyping',
    metadata: {
      booleanValue,
    },
  }
  return actorApi.setLocalState(setLocalStateInput).then((saveFieldOutput: SaveFieldOutput) => saveFieldOutput.field)
}

export const simulateTypingReplyComment = (contextApi: ChatRoomActionContextApi, message: string): Promise<any> => {
  return Promise.resolve(setIsTyping(contextApi.getUnObject(), true))
    .then(pause(3 * 1000))
    .then(() => setIsTyping(contextApi.getUnObject(), false))
    .then(pause(300))
    .then(() => (message.length > 0 ? contextApi.sendUnObjectComment(message) : Promise.resolve(null)))
  // .then(pause(1.5 * 1000))
  // .then(async () => {
  //   const gameState: GameState = await getGameState(contextApi)
  //   gameState.unObject.smartass++
  //   const score = `⭐️⭐️ He's a level ${gameState.unObject.smartass} Smart Ass ⭐️⭐️`
  //   await setGameState(contextApi, gameState)
  //   await contextApi
  //     .getUser()
  //     .sendSystemComment(`He loves to chat, but you know he just talks out of his butt, right?\n${score}`)
  //   return null
  // })
}

// export const getUsedSystemMessages = async (contextApi: ChatRoomActionContextApi): Promise<string[]> => {
//   const stateVariable = 'usedSystemMessages'
//   const defaultInput: SetLocalStateInput = {
//     type: FieldType.JsonObjectField,
//     name: stateVariable,
//     metadata: {
//       stateVariable: [],
//     },
//   }
//   return contextApi
//     .getChatRoom()
//     .getLocalState(stateVariable, defaultInput)
//     .then((field: Field) => _.get(field, 'metadata.usedSystemMessages') as string[])
//     .then((val: any) => (_.isArray(val) ? val : _.values(val)))
// }

// export const setUsedSystemMessages = (contextApi: ChatRoomActionContextApi, keys: string[]): Promise<any> => {
//   const stateVariable = 'usedSystemMessages'
//   const setLocalStateInput: SetLocalStateInput = {
//     type: FieldType.JsonObjectField,
//     name: stateVariable,
//     metadata: {
//       stateVariable: keys,
//     },
//   }
//   return contextApi.getChatRoom().setLocalState(setLocalStateInput)
// }

// const getUsedSystemMessagesByUserContext = async (
//     userContext: NodeApi,
//     //   stateVariable: string,
// ): Promise<StringTable.Item[]> => {
//     const defaultInput: SetLocalStateInput = {
//         type: FieldType.JsonObjectField,
//         name: 'usedSystemMessagesByUnObject',
//         metadata: {
//             usedSystemMessagesByUnObject: [],
//         },
//     }
//     return userContext
//         .getLocalState('usedSystemMessagesByUnObject', defaultInput)
//         .then((field: Field) => _.get(field, 'metadata.usedSystemMessagesByUnObject') as StringTable.Item[])
//         .then((val: any) => (_.isArray(val) ? val : _.values(val)))
// }

// const setUsedSystemMessagesByUserContext = (
//     userContext: NodeApi,
//     //   stateVariable: string,
//     keys: StringTable.Item[],
// ): Promise<any> => {
//     const setLocalStateInput: SetLocalStateInput = {
//         type: FieldType.JsonObjectField,
//         name: 'usedSystemMessagesByUnObject',
//         metadata: {
//             usedSystemMessagesByUnObject: keys,
//         },
//     }
//     return userContext.setLocalState(setLocalStateInput)
// }
/**
 *
 * @param contextApi
 *
 * will purge all the system messages that have been tracked
 */
// export const clearAllSystemMessageJustOnceToUnObject = async (contextApi: ChatRoomActionContextApi) => {
//     //   const stateVariable = 'usedSystemMessagesByUnObject'
//     const setLocalStateInput: SetLocalStateInput = {
//         type: FieldType.JsonObjectField,
//         name: 'usedSystemMessagesByUnObject',
//         metadata: {
//             usedSystemMessagesByUnObject: [],
//         },
//     }
//     return contextApi.getUnObject().setLocalState(setLocalStateInput)
// }

// export const displaySystemMessageJustOnceToUnObject = async (
//     contextApi: ChatRoomActionContextApi,
//     stringId: StringTable.Item,
//     message: string,
// ) => {
//     //   const stateVariable = 'usedSystemMessagesByUnObject'
//     const userContext = contextApi.getUnObject()
//     const metadata = {
//         usedSystemMessagesByUnObject: [],
//     }
//     const usedSystemMessages: StringTable.Item[] = await getUsedSystemMessagesByUserContext(userContext)

//     /* FOR TESTING
//     const allNames: string[] = _.map(usedSystemMessages, (item: StringTable.Item) => {
//       return StringTable.Item[item]
//     })
//     await contextApi.getUnObject().sendSystemComment(`used messages: ${allNames.join(',')}`)
//     */

//     if (_.includes(usedSystemMessages, stringId)) return Promise.resolve(null)

//     await contextApi.getUnObject().sendSystemComment(message)

//     await setUsedSystemMessagesByUserContext(userContext, _.union(usedSystemMessages, [stringId]))
//     return Promise.resolve(null)
// }

// const getUsedCommentsFromUnObjectToUser = async (userContext: NodeApi): Promise<StringTable.Item[]> => {
//     const defaultInput: SetLocalStateInput = {
//         type: FieldType.JsonObjectField,
//         name: 'usedCommentsFromUnObjectToUser',
//         metadata: {
//             usedCommentsFromUnObjectToUser: [],
//         },
//     }
//     return userContext
//         .getLocalState('usedCommentsFromUnObjectToUser', defaultInput)
//         .then((field: Field) => _.get(field, 'metadata.usedCommentsFromUnObjectToUser') as StringTable.Item[])
//         .then((val: any) => (_.isArray(val) ? val : _.values(val)))
// }

// const setUsedCommentsFromUnObjectToUser = (userContext: NodeApi, keys: StringTable.Item[]): Promise<any> => {
//     const setLocalStateInput: SetLocalStateInput = {
//         type: FieldType.JsonObjectField,
//         name: 'usedCommentsFromUnObjectToUser',
//         metadata: {
//             usedCommentsFromUnObjectToUser: keys,
//         },
//     }
//     return userContext.setLocalState(setLocalStateInput)
// }

// export const displayCommentJustOnceToPlayer = async (
//     contextApi: ChatRoomActionContextApi,
//     stringId: StringTable.Item,
//     message: string,
// ) => {
//     const userContext = contextApi.getUnObject()
//     const usedCommentsFromUnObjectToUser: StringTable.Item[] = await getUsedCommentsFromUnObjectToUser(userContext)

//     const allNames: string[] = _.map(usedCommentsFromUnObjectToUser, (item: StringTable.Item) => {
//         return StringTable.Item[item]
//     })
//     // await contextApi.getUser().sendSystemComment(`used comments: ${allNames.join(',')}`)

//     if (_.includes(usedCommentsFromUnObjectToUser, stringId)) return Promise.resolve(null)

//     await contextApi.sendUnObjectComment(message)
//     // await contextApi.getActor().sendSystemMessage(message)

//     await setUsedCommentsFromUnObjectToUser(userContext, _.union(usedCommentsFromUnObjectToUser, [stringId]))
//     return Promise.resolve(null)
// }
