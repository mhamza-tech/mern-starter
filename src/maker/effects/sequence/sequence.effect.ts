import { BaseEffect } from '../effect/effect'
import { SequenceEffectItemTemplate, ActionCallback } from '../../types'

export abstract class SequenceEffect<TMetadata> extends BaseEffect<TMetadata, SequenceEffectItemTemplate<TMetadata>> {

  private _waitForTap = false
  private _isDeletedOnFinish = false
  private _actionCallback?: string

  private actionCallback(): ActionCallback {
    return this._actionCallback
      ? { actionName: undefined }
      : { actionName: this._actionCallback }
  }

  waitForTap(waits = true): this {
    this._waitForTap = waits
    return this
  }

  deleteOnFinish(deletes = true): this {
    this._isDeletedOnFinish = deletes
    return this
  }

  callActionOnFinish(action: string): this {
    this._actionCallback = action
    return this
  }

  parse(template: SequenceEffectItemTemplate<TMetadata>): this {
    this._type = template.type
    this._waitForTap = template.waitForTap
    this._isDeletedOnFinish = template.isDeletedOnFinish
    this._actionCallback = template.actionCallback && template.actionCallback.actionName

    return this
  }

  toEffect(): SequenceEffectItemTemplate<TMetadata> {
    return {
      ...super.toBaseEffect(),
      isDeletedOnFinish: this._isDeletedOnFinish,
      waitForTap: this._waitForTap,
      actionCallback: this.actionCallback(),
      metadata: this.metadata(),
    }
  }

}
