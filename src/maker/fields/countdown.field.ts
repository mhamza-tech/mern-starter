import { EntityScope, FieldType, CountdownFieldStyle } from '../../gql-types'
import { FieldTemplate, CountdownFieldMetadata, Image } from '../types'
import { BaseField } from './field'
import { mapS3KeyToPublicUrl } from '../../services/aws'
import moment from 'moment'

export class CountdownField extends BaseField<CountdownFieldMetadata>  {

  protected _name = 'countdown'
  protected _scope = EntityScope.ChatRoomPrivateScope
  protected _type = FieldType.CountdownField

  private _style = CountdownFieldStyle.Stopwatch
  private _startDateTime = moment()
  private _expiryDateTime = moment()
  private _warnDateTime?: moment.Moment
  private _dangerDateTime?: moment.Moment
  private _image: Image = {}

  private startDateTime(): Date {
    return this._startDateTime.toDate()
  }

  private expiryDateTime(): Date {
    return this._expiryDateTime.toDate()
  }

  private warnDateTime(): Date | undefined {
    return this._warnDateTime
      ? this._warnDateTime.toDate()
      : undefined
  }

  private dangerDateTime(): Date | undefined {
    return this._dangerDateTime
      ? this._dangerDateTime.toDate()
      : undefined
  }

  get metadata(): CountdownFieldMetadata {
    return {
      startDateTime: this.startDateTime(),
      expiryDateTime: this.expiryDateTime(),
      warnDateTime: this.warnDateTime(),
      dangerDateTime: this.dangerDateTime(),
      style: this._style,
      image: this._image,
    }
  }

  private parseTimeUnitParam(unit?: moment.unitOfTime.DurationConstructor): moment.unitOfTime.DurationConstructor {
    return unit ? unit : 'seconds'
  }

  image(img: Image): this {
    this._image = { ...this._image, ...img }
    return this
  }

  imageKey(key?: string): this {
    this._image.s3Key = key ? mapS3KeyToPublicUrl(key) : undefined
    return this
  }

  imageUri(uri?: string): this {
    this._image.uri = uri
    return this
  }

  imageBackgroundColor(color?: string): this {
    this._image.backgroundColor = color
    return this
  }

  imageSize(size?: number): this {
    this._image.size = size
    return this
  }

  imageDimensions(width?: number, height?: number): this {
    this._image.width = width
    this._image.height = height
    return this
  }

  imageIsDefault(isDefault: boolean): this {
    this._image.isDefault = isDefault
    return this
  }

  style(key: keyof typeof CountdownFieldStyle): this {
    this._style = CountdownFieldStyle[key]
    return this
  }
  
  startsNow(): this {
    this._startDateTime = moment()
    return this
  }

  startsIn(amount: moment.DurationInputArg1, unit?: moment.unitOfTime.DurationConstructor): this {
    this._startDateTime = moment().add(amount, this.parseTimeUnitParam(unit))
    return this
  }

  endsIn(amount: moment.DurationInputArg1, unit?: moment.unitOfTime.DurationConstructor): this {
    this._expiryDateTime = moment().add(amount, this.parseTimeUnitParam(unit))
    return this
  }

  warnsIn(amount: moment.DurationInputArg1, unit?: moment.unitOfTime.DurationConstructor): this {
    const _warnDateTime = moment().add(amount, this.parseTimeUnitParam(unit))

    this._warnDateTime = _warnDateTime > this._expiryDateTime
      ? this._expiryDateTime
      : _warnDateTime

    return this
  }

  dangersIn(amount: moment.DurationInputArg1, unit?: moment.unitOfTime.DurationConstructor): this {
    const _dangerDateTime = moment().add(amount, this.parseTimeUnitParam(unit))

    this._dangerDateTime = _dangerDateTime > this._expiryDateTime
      ? this._expiryDateTime
      : _dangerDateTime

    return this
  }

  /**
   * Create a JSON field object ready to be streamed to the client.
   * 
   * @returns The a FieldTemplate with apropriate metadata object
   */
  toFieldTemplate(): FieldTemplate<CountdownFieldMetadata> {
    return {
      ...this.toBaseFieldTemplate(),
      metadata: this.metadata,
    }
  }

}
