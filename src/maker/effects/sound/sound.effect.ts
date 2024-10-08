import { SoundEffectMetadata, EffectTemplate, SequenceEffectItemTemplate } from '../../types'
import { EntityScope, EffectType, SoundType } from '../../../gql-types'
import { SoundEffectLibrary } from './sound.lib'
import { mapS3KeyToPublicUrl } from '../../../services/aws'
import { SequenceEffect } from '../sequence/sequence.effect'

export class SoundEffect extends SequenceEffect<SoundEffectMetadata> {

  protected _scope = EntityScope.ChatRoomPrivateScope
  protected _type = EffectType.SoundEffect

  private _soundType?: SoundType
  private _sourcedUri?: string
  private _bucket = 'sounds'

  private setAsSourced(): void {
    this._soundType = SoundType.SourcedSound
  }

  private setSourcedUri(uri: string): void {
    this._sourcedUri = uri
  }

  protected metadata(): SoundEffectMetadata {
    return {
      soundType: this._soundType,
      sourceUri: this._sourcedUri,
    }
  }

  static load(s3Key: keyof typeof SoundEffectLibrary): EffectTemplate<SoundEffectMetadata> {
    return new SoundEffect().load(s3Key).toEffect()
  }

  static loadUri(url: string): EffectTemplate<SoundEffectMetadata> {
    return new SoundEffect().loadUri(url).toEffect()
  }

  parse(template: SequenceEffectItemTemplate<SoundEffectMetadata>): this {
    super.parse(template)
    
    if (template.metadata) {
      this._soundType = template.metadata.soundType
      this._sourcedUri = template.metadata.sourceUri
    }

    return this
  }

  toEffect(): EffectTemplate<SoundEffectMetadata> {
    return {
      ...this.toBaseEffect(),
      metadata: this.metadata(),
    }
  }

  load(s3Key: keyof typeof SoundEffectLibrary): this {
    if (!s3Key) return this

    this.setSourcedUri(mapS3KeyToPublicUrl(`${this._bucket}/${SoundEffectLibrary[s3Key]}`))
    this.setAsSourced()
    return this
  }

  loadUri(url: string): this {
    if (!url) return this

    this.setSourcedUri(url)
    this.setAsSourced()
    return this
  }

}
