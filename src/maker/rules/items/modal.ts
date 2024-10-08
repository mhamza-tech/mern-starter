import { on } from 'src/maker/events'
import { showItemModal } from 'src/maker/playerHelpers'
import { delay } from 'src/utils/async_utils'

const ITEM_MODEL_ANIMATION_DELAY = 3900

export const setup = (): void => {
  on.npc.session.completed.do(({ api, item }) => {
    if (!item) {
      return
    }
    return Promise.all([
      delay(ITEM_MODEL_ANIMATION_DELAY).then(() => api.getActor().createActionInstance({ actionName: item.name })),
      showItemModal(api.getChatRoom(), item),
    ])
  })
}
