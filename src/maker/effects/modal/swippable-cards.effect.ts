import { ModalEffect } from './modal.effect'
import {
  ModalEffectTemplate, ModalType, ModalPosition, SwippableCardsModalCustomData,
  ModalSwipeCard, Image, ModalEffectMetadata, ModalTexts, ModalImages, ModalButtons,
  ModalAnimations, SourceType,
} from '../../types'
import { mapS3KeyToPublicUrl } from '../../../services/aws'

export class ModalCardMaker {

  private _texts: ModalTexts = {}
  private _images: ModalImages = {}
  private _buttons: ModalButtons = {}
  private _animations: ModalAnimations = {}
  private _backgroundColor?: string

  title(title: string): this {
    this._texts = { ...this._texts, primary: title }
    return this
  }

  animation(sourceType: keyof typeof SourceType, sourceUri: string): this {
    this._animations = { primary: { sourceUri, sourceType: SourceType[sourceType] } }
    return this
  }

  animationS3(sourceType: keyof typeof SourceType, s3Key: string): this {
    this.animation(sourceType, mapS3KeyToPublicUrl(s3Key))
    return this
  }

  bgColor(hexColor?: string): this {
    this._backgroundColor = hexColor
    return this
  }

  message(message: string): this {
    this._texts = { ...this._texts, secondary: message }
    return this
  }

  image(image: Image): this {
    this._images = { ...this._images, primary: image }
    return this
  }

  lowerImage(image: Image): this {
    this._images = { ...this._images, secondary: image }
    return this
  }

  lowerText(lowerText: string): this {
    this._texts = { ...this._texts, tertiary: lowerText }
    return this
  }

  acceptCallback(cb: string): this {
    this._buttons = { ...this._buttons, primary: { actionCallback: cb } }
    return this
  }

  rejectCallback(cb: string): this {
    this._buttons = { ...this._buttons, secondary: { actionCallback: cb } }
    return this
  }

  toTemplate(): ModalSwipeCard {
    return {
      buttons: this._buttons,
      images: this._images,
      texts: this._texts,
      animations: this._animations,
      backgroundColor: this._backgroundColor,
    }
  }

}

export class SwippableCardsModalEffect extends ModalEffect<SwippableCardsModalCustomData> {

  protected _modalType = ModalType.SwippableCards
  protected _position = ModalPosition.Centered
  private _cards: ModalSwipeCard[] = []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parse(template: ModalEffectTemplate<SwippableCardsModalCustomData>): this {
    throw new Error('Method not implemented.')
  }

  metadata(): ModalEffectMetadata<SwippableCardsModalCustomData> {
    return {
      ...super.metadata(),
      metadata: {
        cards: this._cards,
      },
    }
  }

  /**
   * Define the dismiss action button
   * @param actionCallback the action to call after clicked
   * @param text a custom message
   */
  dismissible(actionCallback: string, text = 'Dismiss'): this {
    super.buttons({ primary: { text, actionCallback } })
    return this
  }

  /**
   * 
   * @param title Card title
   * @param message the large summary text in the middle of the card
   * @param image The primary card image
   * @param acceptCallback action callback if accepted
   * @param lowerImage additional lower image 
   * @param lowerText additional lower text
   * @param rejectCallback action callback if rejected
   */
  addCard(title: string, message: string, image: Image, acceptCallback: string, lowerImage?: Image, lowerText?: string, rejectCallback?: string, bgColor?: string): this {
    this._cards = [
      ...this._cards,
      {
        texts: lowerText
          ? { primary: title, secondary: message, tertiary: lowerText }
          : { primary: title, secondary: message },
        images: lowerImage
          ? { primary: image, secondary: lowerImage }
          : { primary: image },
        buttons: rejectCallback
          ? { primary: { actionCallback: acceptCallback }, secondary: { actionCallback: rejectCallback } }
          : { primary: { actionCallback: acceptCallback } },
        animations: {},
        backgroundColor: bgColor,
      },
    ]
    return this
  }

  addMakerCard(card: ModalCardMaker): this {
    this.addCardRaw(card.toTemplate())
    return this
  }

  addMakerCards(cards: ModalCardMaker[]): this {
    this.addCardsRaw(cards.map(a => a.toTemplate()))
    return this
  }

  /**
   * Add a card to the end of the collection
   * @param cardBuilderFn card builder function
   */
  buildAndAddCard(cardBuilderFn: (card: ModalCardMaker) => ModalCardMaker): this {
    this._cards = [...this._cards, cardBuilderFn(new ModalCardMaker()).toTemplate()]
    return this
  }

  /**
   * Add a card to the end of the collection using a raw card template
   * @param card the entire card model to be added
   */
  addCardRaw(card: ModalSwipeCard): this {
    this._cards = [...this._cards, card]
    return this
  }

  /**
   * Add a collection of cards to the existing card collection
   * @param cards collection of card models
   */
  addCardsRaw(cards: ModalSwipeCard[]): this {
    this._cards = [...this._cards, ...cards]
    return this
  }

  /**
   * Replace the existing card collection
   * @param cards collection of card models
   */
  setCardsRaw(cards: ModalSwipeCard[]): this {
    this._cards = cards
    return this
  }

}
