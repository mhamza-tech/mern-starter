import { SimpleModalEffect } from './simple-modal.effect'
import { ModalType, ModalPosition } from '../../../gql-types'
import { Image } from '../../types'

export class SimpleQuarterModalEffect extends SimpleModalEffect {

  protected _modalType = ModalType.SimpleQuarter
  protected _position = ModalPosition.Centered

  bottomImage(image: Image): this {
    super.images({ secondary: image })
    return this
  }

}
