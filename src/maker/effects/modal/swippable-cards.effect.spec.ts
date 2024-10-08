import { SwippableCardsModalEffect } from './swippable-cards.effect'

describe(SwippableCardsModalEffect.name, () => {
  it('should have an empty cards property inside custom data by default', () => {
    const sut = new SwippableCardsModalEffect()

    expect(sut.metadata().metadata.cards).toEqual([])
  })

  it('should set bgcolor', () => {
    const sut = new SwippableCardsModalEffect()

    sut.buildAndAddCard(c => c.bgColor('#123456'))

    expect(sut.metadata().metadata.cards[0].backgroundColor).toEqual('#123456')

    sut.buildAndAddCard(c => c.bgColor())

    expect(sut.metadata().metadata.cards[1].backgroundColor).toBeUndefined()
  })

  describe('Dismiss action', () => {
    it('should support a dismiss callback using default text', () => {
      const sut = new SwippableCardsModalEffect()
        .dismissible('my.callback.function.name')

      expect(sut.metadata().buttons.primary).toEqual({
        actionCallback: 'my.callback.function.name',
        text: 'Dismiss',
      })
    })

    it('should support a dismiss callback with custom text', () => {
      const sut = new SwippableCardsModalEffect()
        .dismissible('my.callback.function.name.2', 'Close')

      expect(sut.metadata().buttons.primary).toEqual({
        actionCallback: 'my.callback.function.name.2',
        text: 'Close',
      })
    })
  })

  it('should add card by builder', () => {
    const sut = new SwippableCardsModalEffect()
      .buildAndAddCard(card => card
        .animationS3('Gif', 'gif/homer.gif')
        .title('Golden Key')
        .message('This unique key will grant access to every place in Unreal')
        .image({ s3Key: 'test/key.jpeg' })
        .lowerImage({ s3Key: 'test/banana.png' })
        .lowerText('20 minutes')
        .acceptCallback('action.key.accept')
        .rejectCallback('action.key.reject'))

    expect(sut.metadata().metadata.cards[0]).toEqual({
      buttons: {
        primary: { actionCallback: 'action.key.accept' },
        secondary: { actionCallback: 'action.key.reject' },
      },
      images: {
        primary: { s3Key: 'test/key.jpeg' },
        secondary: { s3Key: 'test/banana.png' },
      },
      texts: {
        primary: 'Golden Key',
        secondary: 'This unique key will grant access to every place in Unreal',
        tertiary: '20 minutes',
      },
      animations: {
        primary: {
          sourceType: 'Gif',
          sourceUri: 'https://unreal-dev-us-west-2.s3-us-west-2.amazonaws.com/gif/homer.gif',
        },
      },
    })
  })

  it('should add cards', () => {
    const sut = new SwippableCardsModalEffect()
      .addCard('Golden Key', 'This unique key will grant access to every place in Unreal', { s3Key: 'test/key.jpeg' }, 'action.key.accepted', { s3Key: 'test/banana.png' }, '20 minutes')
      .addCard('Banana Cake', 'A yummy cake', { s3Key: 'test/banana.png' }, 'action.banana.accepted', { s3Key: 'test/banana.png' }, '1 hour', 'action.banana.rejected')
      .addCard('Golden Key2', 'keeeeeee2', { s3Key: 'test/key.jpeg' }, 'action.key.accepted', { s3Key: 'test/banana.png' }, undefined)
      .addCard('Golden Key3', 'keeeeeee3', { s3Key: 'test/key.jpeg' }, 'action.key.accepted', undefined, undefined)

    const cards = sut.metadata().metadata.cards

    expect(cards).toHaveLength(4)
    expect(cards[0]).toEqual({
      buttons: {
        primary: { actionCallback: 'action.key.accepted' },
      },
      images: {
        primary: { s3Key: 'test/key.jpeg' },
        secondary: { s3Key: 'test/banana.png' },
      },
      texts: {
        primary: 'Golden Key',
        secondary: 'This unique key will grant access to every place in Unreal',
        tertiary: '20 minutes',
      },
      animations: {},
      backgroundColor: undefined,
    })
    expect(cards[1]).toEqual({
      buttons: {
        primary: { actionCallback: 'action.banana.accepted' },
        secondary: { actionCallback: 'action.banana.rejected' },
      },
      images: {
        primary: { s3Key: 'test/banana.png' },
        secondary: { s3Key: 'test/banana.png' },
      },
      texts: {
        primary: 'Banana Cake',
        secondary: 'A yummy cake',
        tertiary: '1 hour',
      },
      animations: {},
      backgroundColor: undefined,
    })
    expect(cards[2]).toEqual({
      buttons: {
        primary: { actionCallback: 'action.key.accepted' },
      },
      images: {
        primary: { s3Key: 'test/key.jpeg' },
        secondary: { s3Key: 'test/banana.png' },
      },
      texts: {
        primary: 'Golden Key2',
        secondary: 'keeeeeee2',
      },
      animations: {},
      backgroundColor: undefined,
    })
    expect(cards[3]).toEqual({
      buttons: {
        primary: { actionCallback: 'action.key.accepted' },
      },
      images: {
        primary: { s3Key: 'test/key.jpeg' },
      },
      texts: {
        primary: 'Golden Key3',
        secondary: 'keeeeeee3',
      },
      animations: {},
      backgroundColor: undefined,
    })
  })
})
