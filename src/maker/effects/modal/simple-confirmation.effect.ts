import { SimpleModalEffect } from './simple-modal.effect'
import { ModalType, ModalPosition } from '../../../gql-types'
import { ModalButton } from '../../types'

export class SimpleConfirmationModalEffect extends SimpleModalEffect {

  protected _modalType = ModalType.SimpleConfirmation
  protected _position = ModalPosition.Centered

  okButton(btn: ModalButton): this {
    super.buttons({ primary: btn })
    return this
  }

}
