import { isDeletedLens } from '../fxHelpers'
import { misc } from '../../utils'
import { lotties } from '../helpers'
import { TileTemplate, ChatRoomActionContextApi } from '../types'
import { AnimationType, EntityScope, TileType } from '../../gql-types'
import { ReactNativeAnimations } from 'src/maker/animations'

const animationSequenceTileTemplate = misc.deepFreeze<TileTemplate>({
  name: 'reserved.animation.chitchat',
  type: TileType.AnimationTile,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationSequence: {
      animations: [
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FadeIn,
          duration: 200,
        },
        {
          animationType: AnimationType.SourcedAnimation,
          sourceUri: lotties.chat_conversation,
        },
        {
          animationType: AnimationType.NativeAnimatableAnimation,
          animation: ReactNativeAnimations.FadeOut,
          duration: 500,
          delay: 0,
        },
      ],
    },
    containerStyle: {
      backgroundColor: 'transparent',
      top: 30,
      left: 4,
      height: 15,
      width: 15,
      zIndex: 10,
      borderWidth: 0,
      borderColor: 'red',
    },
  },
})

export const animate = (contextApi: ChatRoomActionContextApi): Promise<any> => {
  return contextApi.getChatRoom().saveTile(animationSequenceTileTemplate)
    .then(isDeletedLens.set(true))
    .then(contextApi.getChatRoom().saveTileNoPublish)
}

// export const remove = (contextApi: ChatRoomActionContextApi) => {
//     return contextApi.getChatRoom().saveTile(isDeletedLens.set(true)(animationSequenceTileTemplate))
// }
