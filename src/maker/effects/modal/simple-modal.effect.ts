import { ModalEffect } from './modal.effect'
import { ModalType, ModalPosition } from '../../../gql-types'
import { Image } from '../../types'

export class SimpleModalEffect extends ModalEffect {

  protected _modalType = ModalType.Simple
  protected _position = ModalPosition.Centered

  public parse(): this {
    throw new Error('Method not implemented.')
  }

  title(text: string): this {
    super.texts({ primary: text })
    return this
  }

  message(text: string): this {
    super.texts({ secondary: text })
    return this
  }

  image(image: Image): this {
    super.images({ primary: image })
    return this
  }

}
