import { on } from 'src/maker/events'
import { ChatRoomActionContextApi, HandlebarsValues } from 'src/types'
import { StringTags } from 'src/domain/strings'
import { NPC, npcs, NPCId } from 'src/domain/npcs'
import { DEFAULT_NPC_ID } from 'src/env'

export const setup = (): void => {
  const send = (api: ChatRoomActionContextApi, tags: StringTags, optional?: StringTags, values?: HandlebarsValues): Promise<any> => {
    const from = api.getUnObject()
    const npc: NPC | undefined = npcs[from?.getId() as NPCId]
    // Ignore unknown NPCs or the bedroom
    if (!npc || npc.id === DEFAULT_NPC_ID) {
      return Promise.resolve()
    }
    // TODO: It can easily allow the bedroom NPC and add the m2m/p2p tag accordingly
    return api.getActor().sendMessage({
      tags: [...tags, 'target_actor', 'standard', npc.id],
      optional, from, values,
    })
  }

  on.item.used.do(({ api, item }) => (
    send(api, ['onitemused'], [item.name], { item })
  ))

  on.move.triggered.do(({ api, move }) => (
    send(api, ['onmovetriggered'], [move.name], { move })
  ))

  on.room.entered.do(({ api }) => (
    send(api, ['onroomentered'])
  ))

  on.npc.session.started.do(({ api }) => (
    send(api, ['onsessionstarted'])
  ))

  on.npc.session.reset.do(({ api }) => (
    send(api, ['onsessionreset'])
  ))

  on.npc.session.failed.do(({ api, item }) => (
    send(api, ['onsessionfailed'], item && [item.name], { item })
  ))

  on.npc.session.succeeded.do(({ api, item }) => (
    send(api, ['onsessionsucceeded'], item && [item.name], { item })
  ))
}
