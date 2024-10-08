## Modals


### SwippableCardsModalEffect
#### Streamed inline inside a resolver action
```ts
const onActionSwippableCardsModal = (contextApi: ChatRoomActionContextApi) => {
  return contextApi
    .getActor()
    .modals()
    .swippableCards()
    .addCardByBuilder(card => card
      .title('Golden Key')
      .message('This unique key will grant access to every place in Unreal')
      .image({ s3Key: 'test/key.jpeg' })
      .lowerImage({ s3Key: 'test/banana.png' })
      .lowerText('20 minutes')
      .acceptCallback('action.key.accept')
      .rejectCallback('action.key.reject'))
    .addCard('Banana Cake', 'A yummy cake', { s3Key: 'test/banana.png' }, 'action.banana.accepted', undefined, undefined, 'action.banana.rejected')
    .dismissible('go.away.func')
    .stream()
}
```

#### Computed template
```ts
const onActionVibrate = (contextApi: ChatRoomActionContextApi): Promise<Effect> => {
  const effectTemplate = new SwippableCardsModalEffect()
    .addCard('Golden Key', 'This unique key will grant access to every place in Unreal', { s3Key: 'test/key.jpeg' }, 'action.key.accepted')
    .addCard('Banana Cake', 'A yummy cake', { s3Key: 'test/banana.png' }, 'action.banana.accepted', 'action.banana.rejected')
    .dismissible('go.away.func')
    .toEffect()
  
  return contextApi
    .getActor()
    .saveEffect(effectTemplate)
}
```

### Parse from static template
```ts
const onActionVibrate = (contextApi: ChatRoomActionContextApi): Promise<Effect> => {
  const effectTemplate = misc.deepFreeze<ModalEffectTemplate<SwippableCardsModalCustomData>>({
    type: EffectType.ModalEffect,
    scope: EntityScope.ChatRoomPrivateScope,
    metadata: {
      position: ModalPosition.Centered,
      modalType: ModalType.SwippableCards, // look here I am new!
      customData: {
        cards: [
          { // CARD 1
            buttons: {
              primary: { actionCallback: 'action.banana.accepted' }, // swipe right, yay
              secondary: { actionCallback: 'action.banana.rejected' }, // swipe left, awww (optional)
            },
            images: {
              primary: { s3Key: 'test/banana.png', }, // Primary card image
            },
            texts: {
              primary: 'Banana Cake', // title
              secondary: 'A yummy cake', // summary
            },
          },
          { // CARD 2
            buttons: {
              primary: { actionCallback: 'action.banana.accepted' } // swipe right, yay
            },
            images: {
              primary: { s3Key: 'test/banana.png', }, // Primary card image
            },
            texts: {
              primary: 'Banana Cake', // title
              secondary: 'A yummy cake', // summary
            },
          },
        ],
      },
    },
  })

  return contextApi
    .getActor()
    .swippableCards()
    .parse(effectTemplate)
    .stream()

  // or
  return contextApi
    .getActor()
    .saveEffect(effectTemplate)
}
```