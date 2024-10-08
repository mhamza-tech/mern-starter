import { EffectType, EntityScope, ModalType, ModalPosition, ModalEffectCustomData } from '../../../gql-types'
import { ModalEffectTemplate, ActionCallback, ModalTexts, ModalButtons, ModalImages, ModalAnimations, ModalEffectMetadata } from '../../types'
import { BaseEffect } from '../effect/effect'

export abstract class ModalEffect<TCustomData extends ModalEffectCustomData = {}> extends BaseEffect<ModalEffectMetadata<TCustomData>, ModalEffectTemplate<TCustomData>> {

  protected _scope = EntityScope.ChatRoomPrivateScope
  protected _type = EffectType.ModalEffect

  protected abstract _modalType: ModalType
  protected abstract _position: ModalPosition

  private _actionCallback?: string
  private _disableClose = false
  private _hasBackdrop = true
  private _texts: ModalTexts = {}
  private _animations: ModalAnimations = {}
  private _images: ModalImages = {}
  private _buttons: ModalButtons = {}

  private actionCallback(): ActionCallback {
    return this._actionCallback
      ? { actionName: undefined }
      : { actionName: this._actionCallback }
  }

  callActionOnFinish(action: string): this {
    this._actionCallback = action
    return this
  }

  position(key: keyof typeof ModalPosition): this {
    this._position = ModalPosition[key]
    return this
  }

  protected modalType(key: keyof typeof ModalType): this {
    this._modalType = ModalType[key]
    return this
  }

  protected disableClose(disable = true): this {
    this._disableClose = disable
    return this
  }

  protected hasBackdrop(hasBackdrop = true): this {
    this._hasBackdrop = hasBackdrop
    return this
  }

  protected texts(texts: ModalTexts): this {
    this._texts = { ...this._texts, ...texts }
    return this
  }

  protected buttons(buttons: ModalButtons): this {
    this._buttons = { ...this._buttons, ...buttons }
    return this
  }

  protected animations(animations: ModalAnimations): this {
    this._animations = { ...this._animations, ...animations }
    return this
  }

  protected images(images: ModalImages): this {
    this._images = { ...this._images, ...images }
    return this
  }

  toEffect(): ModalEffectTemplate<TCustomData> {
    return {
      ...super.toBaseEffect(),
      metadata: this.metadata(),
    }
  }

  metadata(): ModalEffectMetadata<TCustomData> {
    return {
      actionCallback: this.actionCallback(),
      modalType: this._modalType,
      position: this._position,
      disableClose: this._disableClose,
      hasBackdrop: this._hasBackdrop,
      texts: this._texts || {},
      animations: this._animations || {},
      images: this._images || {},
      buttons: this._buttons || {},
      metadata: {} as TCustomData,
    }
  }

}
