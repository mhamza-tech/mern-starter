## VibrationEffect
Some examples of how to use the VibrationEffect

### Streamed inline inside a resolver action
```ts
const onActionVibrate = (contextApi: ChatRoomActionContextApi): Promise<Effect> => {
  return contextApi
    .getChatRoom()
    .vibrationEffects()
    .duration(3000) // 3 seconds (3000 ms)
    // this doesn't need to be set since it's already the default, future patterns will be available
    .pattern('Default') 
    .stream()
}
```

### Computed template
```ts
const onActionVibrate = (contextApi: ChatRoomActionContextApi): Promise<Effect> => {
  const effect = new VibrationEffect().duration(2000).toEffect()
  
  return contextApi
    .getChatRoom()
    .saveEffect(effect)
}
```

### Parse from static template
```ts
const onActionVibrate = (contextApi: ChatRoomActionContextApi): Promise<Effect> => {
  const effectTemplate = misc.deepFreeze<SequenceEffectItemTemplate<VibrationEffectMetadata>>({
    type: EffectType.VibrationEffect,
    metadata: {
      duration: 1000,
      vibrationType: VibrationType.Default,
    },
  })

  return contextApi
    .getChatRoom()
    .vibrationEffects()
    .parse(effectTemplate)
    .stream()

  // or
  return contextApi
    .getChatRoom()
    .saveEffect(effectTemplate)
}
```