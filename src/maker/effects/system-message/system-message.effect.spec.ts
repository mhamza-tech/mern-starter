import { SystemMessageEffect } from './system-message.effect'
import { SystemMessageStyle } from '../../../gql-types'

describe(SystemMessageEffect.name, () => {
  it('should build nominal with static', () => {
    const template = new SystemMessageEffect()
      .imageSize(1)
      .imageDimensions(400, 600)
      .imageBackgroundColor('green')
      .imageKey('folder/image.jpg')
      .imageUri('http://images.co/my-img.jpg')
      .style('ChatStyle01')
      .text('Hey! I am the message')
      .toEffect()

    expect(template.metadata.text).toEqual('Hey! I am the message')
    expect(template.metadata.style).toEqual(SystemMessageStyle.ChatStyle01)
    expect(template.metadata.image.size).toEqual(1)
    expect(template.metadata.image.width).toEqual(400)
    expect(template.metadata.image.height).toEqual(600)
    expect(template.metadata.image.backgroundColor).toEqual('green')
    expect(template.metadata.image.uri).toEqual('http://images.co/my-img.jpg')
    expect(template.metadata.image.s3Key).toEqual('https://unreal-dev-us-west-2.s3-us-west-2.amazonaws.com/folder/image.jpg')
  })
})
