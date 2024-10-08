import { SimpleModalEffect } from './simple-modal.effect'
import { EffectFactory } from '../effect/effect.factory'
import { ModalEffectTemplate, ModalEffectMetadata } from '../../types'
import { SimpleQuarterModalEffect } from './simple-quarter.effect'
import { SimpleConfirmationModalEffect } from './simple-confirmation.effect'
import { SwippableCardsModalEffect } from './swippable-cards.effect'

export class ModalEffectFactory extends EffectFactory<ModalEffectMetadata, ModalEffectTemplate> {

  simple(): SimpleModalEffect {
    return new SimpleModalEffect(this.applyCtxAndStream, this.applyCtxFn)
  }

  simpleQuarter(): SimpleQuarterModalEffect {
    return new SimpleQuarterModalEffect(this.applyCtxAndStream, this.applyCtxFn)
  }

  simpleConfirmation(): SimpleConfirmationModalEffect {
    return new SimpleConfirmationModalEffect(this.applyCtxAndStream, this.applyCtxFn)
  }

  swippableCards(): SwippableCardsModalEffect {
    return new SwippableCardsModalEffect(this.applyCtxAndStream, this.applyCtxFn)
  }

}
