import _ from 'lodash'
import { EffectType, EntityScope, FieldType } from 'src/gql-types'
import { on } from 'src/maker/events'
import { getActiveUserStates, resetAllUserStates } from 'src/maker/userStates'
import { NodeApi } from 'src/types'
import { promiseMap } from 'src/utils/sf.typed'
import { hasNoModifier, moveIs } from '../helpers'
import { Field } from 'src/db/entity'

export const setup = (): void => {
  on.move.triggering.and(moveIs('debug_inspect_states_2159')).and(hasNoModifier).do(({ api }) => {
    const partner = api.getPartner()
    const user = partner.isUnObject() ? api.getActor() : partner
    return getActiveUserStates(user).then((userStates) => {
      const lines = userStates.map(userState => `- ${userState.changedAt.split('.')[0]} | ${userState.displayName}: ${userState.numberValue}`)
      const text = `${user.getName()} has ${lines.length} active user state(s)\n${lines.join('\n')}`
      return api.getChatRoom().saveEffect({
        type: EffectType.SequenceEffect,
        scope: EntityScope.GlobalScope,
        metadata: {
          sequenceEffectItems: [{
            type: EffectType.SystemMessageEffect,
            waitForTap: true,
            metadata: { text },
          }],
        },
      })
    })
  })

  on.move.triggering.and(moveIs('debug_reset_states_2160')).and(hasNoModifier).do(({ api }) => {
    const actor = api.getActor()
    const partner = api.getPartner()
    return Promise
      .all([
        resetAllUserStates(api.getChatRoom()),
        resetAllUserStates(partner.isUnObject() ? actor : partner),
      ])
      .then(_.flatten)
      .then((fields) => (
        actor.sendSystemMessage(`${fields.length} userState(s) reset:` + fields.map(f => `\n- ${f.thisEntityType}'s ${f.name}`).join(''))
      ))
  })

  const resetCounters = (node: NodeApi): Promise<Field[]> => {
    return node.fieldsByType(FieldType.NumberField)
      .then(fields => fields.filter(field => field.collectionName === 'counters'))
      .then(fields => promiseMap(fields, field => node.saveField({ ...field, isDeleted: true })))
  }

  on.move.triggering.and(moveIs('debug_reset_counters_2161')).and(hasNoModifier).do(({ api }) => {
    const actor = api.getActor()
    const partner = api.getPartner()
    return Promise
      .all([
        resetCounters(api.getChatRoom()),
        resetCounters(partner.isUnObject() ? actor : partner),
      ])
      .then(_.flatten)
      .then((fields) => (
        actor.sendSystemMessage(`${fields.length} counter(s) reset:` + fields.map(f => `\n- ${f.thisEntityType}'s ${f.name}`).join(''))
      ))
  })
}
