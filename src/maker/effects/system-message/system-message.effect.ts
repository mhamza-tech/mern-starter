import { SequenceEffect } from '../sequence/sequence.effect'
import { mapS3KeyToPublicUrl } from 'src/services/aws'
import { EntityScope, EffectType, SystemMessageStyle } from 'src/gql-types'
import { SystemMessageEffectMetadata, Image, SequenceEffectItemTemplate } from 'src/maker/types'

export class SystemMessageEffect extends SequenceEffect<SystemMessageEffectMetadata> {

  protected _scope = EntityScope.ChatRoomPrivateScope
  protected _type = EffectType.SystemMessageEffect

  private _style = SystemMessageStyle.Default
  private _text?: string
  private _image?: Image = {}

  protected metadata(): SystemMessageEffectMetadata {
    return {
      style: this._style,
      text: this._text,
      image: {
        s3Key: this._image.s3Key,
        uri: this._image.uri,
        backgroundColor: this._image.backgroundColor,
        height: this._image.height,
        width: this._image.width,
        size: this._image.size,
        isDefault: false,
      },
    }
  }

  style(style: keyof typeof SystemMessageStyle): this {
    this._style = SystemMessageStyle[style]
    return this
  }

  text(text?: string): this {
    this._text = text
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

  parse(template: SequenceEffectItemTemplate<SystemMessageEffectMetadata>): this {
    super.parse(template)

    if (template.metadata) {
      this._style = template.metadata.style
      this._text = template.metadata.text
      this._image = template.metadata.image || {}
    }

    return this
  }

}
