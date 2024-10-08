import { SequenceEffect } from '../sequence/sequence.effect'
import { EffectType, EntityScope, VibrationType } from '../../../gql-types'
import { SequenceEffectItemTemplate, VibrationEffectMetadata } from '../../types'

// Eventually support multiple styles of vibration
// dot dash dot => DotDashDot?
// dash dash dash => DashDashDash?
// dash dot dash => DashDotDash?
export class VibrationEffect extends SequenceEffect<VibrationEffectMetadata> {

  protected _scope = EntityScope.ChatRoomPrivateScope
  protected _type = EffectType.VibrationEffect

  private _duration = 1000
  private _vibrationType = VibrationType.Default

  protected metadata(): VibrationEffectMetadata {
    return {
      duration: this._duration,
      vibrationType: this._vibrationType,
    }
  }

  /**
   * Set the vibration type
   * @param type type of device vibration pattern
   */
  pattern(type: keyof typeof VibrationType): this {
    this._vibrationType = VibrationType[type]
    return this
  }

  /**
   * Set the vibration duration
   * @param ms milli seconds
   */
  duration(ms: number): this {
    this._duration = ms
    return this
  }

  parse(template: SequenceEffectItemTemplate<VibrationEffectMetadata>): this {
    super.parse(template)

    if (template.metadata) {
      this._duration = template.metadata.duration
      this._vibrationType = template.metadata.vibrationType
    }

    return this
  }

}
