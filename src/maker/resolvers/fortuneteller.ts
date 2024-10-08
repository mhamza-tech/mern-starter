/**
 * @Ignacio
 * march2020
 * 
 * Fortune Teller handler module.
 */

import { ChatRoomActionContextApi } from '../types'
import { sf } from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import { Field } from '../../gql-types'
import { UnrealChatroom } from '../core/room'
import { UnrealAction, UnrealOnReset, UnrealOnExit, UnrealOnEnter } from 'src/maker/core'
import {
  AriesTileTemplate,
  TaurusTileTemplate,
  zodiacSymbolSelectedFieldTemplate,
  stringValueLens,
  stateActionStubSets,
} from './fortuneteller.assets'

@UnrealChatroom({
  id: 'fortune_teller_500',
})
export default class FortuneTeller implements UnrealOnReset, UnrealOnExit, UnrealOnEnter {

  private readonly logger = LoggerFactory('fortune_teller_500', 'NPC')

  onReset(contextApi: ChatRoomActionContextApi): Promise<any> {
    this.logger.log('onReset')
    return Promise.resolve([
      contextApi.getActor().sendSystemMessage('RESET!'),
    ])
  }

  onExit<T>(contextApi: ChatRoomActionContextApi): Promise<T> {
    this.logger.log('onExit')

    return this.removeTiles(contextApi)
  }

  onEnter(contextApi: ChatRoomActionContextApi): Promise<any> {
    this.logger.log('onEnter')
    this.removeTiles(contextApi)

    contextApi.getActor().saveCurrentActionStubs(stateActionStubSets['state.fortuneteller.start'])

    return contextApi.getActor().sendSystemMessage(
      `HI! Welcome to ${contextApi.getUnObject().getName()}!`
    )
  }

  removeTiles(contextApi: ChatRoomActionContextApi): Promise<any> {
    contextApi.getChatRoom().saveTile(sf.lens('isDeleted').set(true)(AriesTileTemplate))

    return contextApi.getChatRoom().saveTile(sf.lens('isDeleted').set(true)(TaurusTileTemplate))
  }

  @UnrealAction('action.fortuneteller.choosesign')
  onActionChooseAnotherSymbol(contextApi: ChatRoomActionContextApi): Promise<any> {
    this.removeTiles(contextApi)
    return contextApi.getActor().saveCurrentActionStubs(stateActionStubSets['state.fortuneteller.start'])
  }

  @UnrealAction('action.fortuneteller.aries')
  @UnrealAction('action.fortuneteller.taurus')
  @UnrealAction('action.fortuneteller.gemini')
  @UnrealAction('action.fortuneteller.cancer')
  @UnrealAction('action.fortuneteller.leo')
  @UnrealAction('action.fortuneteller.virgo')
  @UnrealAction('action.fortuneteller.libra')
  @UnrealAction('action.fortuneteller.scorpio')
  @UnrealAction('action.fortuneteller.sagittarius')
  @UnrealAction('action.fortuneteller.capricorn')
  @UnrealAction('action.fortuneteller.aquarius')
  @UnrealAction('action.fortuneteller.pisces')
  onActionSelectZodiacSymbol(contextApi: ChatRoomActionContextApi): Promise<any> {
    const zodiacSymbolSelected = contextApi.getCurrentAction().args.zodiacsymbol

    //switch zodiacSymbolSelected and saveTiles of the selected symbol at the top right corner of the screen

    switch (zodiacSymbolSelected) {
      case 'Aries': //contextApi.getChatRoom().saveTile(AriesTileTemplate);
        contextApi.getActor().saveField(stringValueLens.set(zodiacSymbolSelected)(zodiacSymbolSelectedFieldTemplate))
        break
      case 'Taurus':
        contextApi.getActor().saveField(stringValueLens.set(zodiacSymbolSelected)(zodiacSymbolSelectedFieldTemplate))
        break
      case 'Gemini':
        contextApi.getActor().saveField(stringValueLens.set(zodiacSymbolSelected)(zodiacSymbolSelectedFieldTemplate))
        break
      case 'Cancer':
        contextApi.getActor().saveField(stringValueLens.set(zodiacSymbolSelected)(zodiacSymbolSelectedFieldTemplate))
        break
      case 'Leo':
        contextApi.getActor().saveField(stringValueLens.set(zodiacSymbolSelected)(zodiacSymbolSelectedFieldTemplate))
        break
      case 'Virgo':
        contextApi.getActor().saveField(stringValueLens.set(zodiacSymbolSelected)(zodiacSymbolSelectedFieldTemplate))
        break
      case 'Libra':
        contextApi.getActor().saveField(stringValueLens.set(zodiacSymbolSelected)(zodiacSymbolSelectedFieldTemplate))
        break
      case 'Scorpio':
        contextApi.getActor().saveField(stringValueLens.set(zodiacSymbolSelected)(zodiacSymbolSelectedFieldTemplate))
        break
      case 'Sagittarius':
        contextApi.getActor().saveField(stringValueLens.set(zodiacSymbolSelected)(zodiacSymbolSelectedFieldTemplate))
        break
      case 'Capricorn':
        contextApi.getActor().saveField(stringValueLens.set(zodiacSymbolSelected)(zodiacSymbolSelectedFieldTemplate))
        break
      case 'Aquarius':
        contextApi.getActor().saveField(stringValueLens.set(zodiacSymbolSelected)(zodiacSymbolSelectedFieldTemplate))
        break
      case 'Pisces':
        contextApi.getActor().saveField(stringValueLens.set(zodiacSymbolSelected)(zodiacSymbolSelectedFieldTemplate))
        break
    }
    //const getPhrase for randomized text from the ft
    const getRandomPhrase = Math.floor((4) * Math.random())

    switch (getRandomPhrase) {

      case 0: contextApi.getActor().sendSystemMessage(`So you are ${zodiacSymbolSelected} huh`)
        break
      case 1: contextApi.getActor().sendSystemMessage(`I knew you were ${zodiacSymbolSelected}, I felt it as soon as you got inside the room`)
        break
      case 2: contextApi.getActor().sendSystemMessage(`${zodiacSymbolSelected} huh? I can feel a special aura coming from you`)
        break
      case 3: contextApi.getActor().sendSystemMessage(`I haven't seen a ${zodiacSymbolSelected} for a while!`)
        break
    }

    //update the game state
    // -rx- return contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.fortuneteller.chooseTopic']);
    return contextApi.getActor().saveCurrentActionStubs(stateActionStubSets['state.fortuneteller.chooseTopic'])
  }

  @UnrealAction('action.fortuneteller.health')
  @UnrealAction('action.fortuneteller.money')
  @UnrealAction('action.fortuneteller.career')
  @UnrealAction('action.fortuneteller.love')
  onActionSelectTopic(contextApi: ChatRoomActionContextApi): Promise<any> {
    const topicSelected = contextApi.getCurrentAction().args.topic

    return contextApi.getActor().field(zodiacSymbolSelectedFieldTemplate)
      .then((field: Field) => {
        switch (field.metadata.stringValue) {

          case 'Aries': switch (topicSelected) {
            case 'Love': contextApi.getActor().sendSystemMessage('Avoid Cancer signs today.')
          }
            break
          case 'Taurus': switch (topicSelected) {
            case 'Love': contextApi.getActor().sendSystemMessage('Chill with another Taurus sign if you dare.')
          }
            break
          case 'Gemini': switch (topicSelected) {
            case 'Love': contextApi.getActor().sendSystemMessage('Kiss a Sagittarius today.')
          }
            break
          case 'Cancer': switch (topicSelected) {
            case 'Love': contextApi.getActor().sendSystemMessage('If you see a Leo today, flirt.')
          }
            break
          case 'Leo': switch (topicSelected) {
            case 'Love': contextApi.getActor().sendSystemMessage('If a Virgo asks you out, say no.')
          }
            break
          case 'Virgo': switch (topicSelected) {
            case 'Love': contextApi.getActor().sendSystemMessage('Virgos are better off in the friend zone today.')
          }
            break
          case 'Libra': switch (topicSelected) {
            case 'Love': contextApi.getActor().sendSystemMessage('Libras do it better...so find one.')
          }
            break
          case 'Scorpio': switch (topicSelected) {
            case 'Love': contextApi.getActor().sendSystemMessage('A Taurus will rock you, good and bad.')
          }
            break
          case 'Sagittarius': switch (topicSelected) {
            case 'Love': contextApi.getActor().sendSystemMessage('Find a Gemini; they\'ll make you laugh.')
          }
            break
          case 'Capricorn': switch (topicSelected) {
            case 'Love': contextApi.getActor().sendSystemMessage('Keep the Sagittarius in the friend zone.')
          }
            break
          case 'Aquarius': switch (topicSelected) {
            case 'Love': contextApi.getActor().sendSystemMessage('A Leo will make quite a dent on your love life.')
          }
            break
          case 'Pisces': switch (topicSelected) {
            case 'Love': contextApi.getActor().sendSystemMessage('Steer clear of Aries signs today.')
          }
            break

        }

        // if(field.metadata.stringValue == "Taurus")  {
        //     contextApi.getActor().sendSystemMessage(`Symbol selected taurus`);
        // }
        // else if (field.metadata.stringValue == "Aries") {
        //     contextApi.getActor().sendSystemMessage(`Symbol selected aries`);
        // }
      })

    //removeTiles(contextApi);
    //return contextApi.getActor().sendSystemMessage(`You selected ${topicSelected}!`);
    //return contextApi.getActor().setCurrentActionEdges(stateActionGroups['state.fortuneteller.start']);
  }

}
