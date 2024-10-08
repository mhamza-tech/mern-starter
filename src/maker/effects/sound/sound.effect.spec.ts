import { SoundEffect } from './sound.effect'
import { SoundEffectLibrary } from './sound.lib'
import { SoundType, EffectType, EntityScope } from '../../../gql-types'

describe(SoundEffect.name, () => {
  it('should construct', () => {
    const sut = new SoundEffect()
    const effectTemplate = sut.toEffect()

    expect(sut).toBeInstanceOf(SoundEffect)
    expect(effectTemplate.metadata.sourceUri).toBeUndefined()
    expect(effectTemplate.metadata.soundType).toBeUndefined()
  })

  it('should set external sound uri', () => {
    const sut = new SoundEffect()
    const sourceUri = 'http://www.sounds.com/my-sound.mp3'

    sut.loadUri(sourceUri)

    const effectTemplate = sut.toEffect()

    expect(effectTemplate.metadata.sourceUri).toEqual(sourceUri)
    expect(effectTemplate.metadata.soundType).toEqual(SoundType.SourcedSound)
    expect(effectTemplate).toEqual({
      scope: EntityScope.ChatRoomPrivateScope,
      type: EffectType.SoundEffect,
      metadata: {
        soundType: SoundType.SourcedSound,
        sourceUri,
      },
    })
  })

  describe('load', () => {
    it('should construct public uri based on storage key', () => {
      const sut = new SoundEffect()
      const sourcedKey = SoundEffectLibrary.DigitalSwoosh01

      sut.load('DigitalSwoosh01')

      expect(sut.toEffect().metadata.sourceUri).toEqual(`https://unreal-dev-us-west-2.s3-us-west-2.amazonaws.com/sounds/${sourcedKey}`)
    })
  })
})
