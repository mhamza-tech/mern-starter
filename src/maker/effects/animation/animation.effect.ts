import { SequenceEffect } from '../sequence/sequence.effect'
import { EffectType, EntityScope } from '../../../gql-types'
import { AnimationEffectMetadata } from '../../types'

export class AnimationEffect extends SequenceEffect<AnimationEffectMetadata> {
  
  protected _scope = EntityScope.ChatRoomPrivateScope
  protected _type = EffectType.AnimationEffect

  protected metadata(): AnimationEffectMetadata {
    throw new Error('Not implemented')
  }

}
