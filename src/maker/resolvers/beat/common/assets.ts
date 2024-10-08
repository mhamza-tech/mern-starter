import { CountdownFieldStyle, EntityScope, FieldType, ProgressField, ModalType, EffectType } from 'src/gql-types'
import { CountdownFieldMetadata, FieldTemplate, JsonObjectFieldMetadata, ModalEffectTemplate } from 'src/maker/types'
import { misc } from 'src/utils'

export const gameStateField = misc.deepFreeze<FieldTemplate<JsonObjectFieldMetadata>>({
  type: FieldType.JsonObjectField,
  name: 'gameState',
  scope: EntityScope.GlobalScope,
  // Note: Part of the state should be per-player when it becomes MP
  metadata: { version: 1.0, state: {} },
})

export const progressBarField = misc.deepFreeze<FieldTemplate<ProgressField>>({
  type: FieldType.ProgressField,
  scope: EntityScope.GlobalScope,
  name: 'progress',
  metadata: {
    minValue: 0,
    color: null,
    maxValue: null,
    numberValue: null,
  },
})

export const countdownField = misc.deepFreeze<FieldTemplate<CountdownFieldMetadata>>({
  type: FieldType.CountdownField,
  scope: EntityScope.GlobalScope,
  name: 'countdown',
  metadata: {
    style: CountdownFieldStyle.Stopwatch,
    expiryDateTime: null,
  },
})

export const loseModal = misc.deepFreeze<ModalEffectTemplate>({
  type: EffectType.ModalEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    modalType: ModalType.SimpleConfirmation,
    texts: { primary: 'Oh no! Maybe next time!', secondary: null },
  },
})
