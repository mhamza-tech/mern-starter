import moment from 'moment'
import { on } from 'src/maker/events'
import { jobIs, jobNames } from '../helpers'
import { SYSTEM_USER_EID } from 'src/env'
import { events } from 'src/events'
import { ActionXInstance } from 'src/db/entity'

export const setup = (): void => {
  interface JobArgs { itemId: string }

  on.item.created
    // Items granted by the system user (FTUE) don't expire
    .and(({ item, instance }) => !!item.expirationTime && instance.creatorEid !== SYSTEM_USER_EID)
    .do(({ api, instance, item }) => {
      return api.scheduleJob<JobArgs>({
        actionName: jobNames.ItemExpires,
        dispatchAt: moment().add(item.expirationTime).toDate(),
        args: { itemId: instance.id },
      })
    })

  on.job.executed.and(jobIs('ItemExpires')).do(async ({ api, args }) => {
    const { itemId }: JobArgs = args
    const instance = await api.readActionInstance(itemId) as ActionXInstance
    if (!instance) {
      return
    }
    const owner = await api.getByEid(instance.playerEid)
    if (!owner) {
      return
    }

    await events.item.expired.notify({ node: owner, instance })
    // Item expires and is deleted
    await owner.deleteActionInstance({ id: itemId })
  })
}
