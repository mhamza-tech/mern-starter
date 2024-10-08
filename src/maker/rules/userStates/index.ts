import moment from 'moment'
import { on } from 'src/maker/events'
import { jobNames, jobIs } from '../helpers'
import { userStates, UserStateId } from 'src/domain/userStates'
import { getUserState, setUserState } from 'src/maker/userStates'
import { LoggerFactory } from 'src/utils/logger'
import { safeAdd } from 'src/utils/misc'

export const setup = (): void => {
  const logger = LoggerFactory('userStates', 'Rules')

  interface JobArgs {
    stateId: UserStateId
  }

  on.state.changed
    .and(({ state, input }) => !!state.decayInterval && state.decayRate !== 0 && input.numberValue !== 0)
    .do(({ node, state }) => {
      // Bake the interval and rate into the id, so that if we change it (for testing) the shorter decay runs too (and both converge)
      const parts = ['decay', state.id, node.getEid(), moment.duration(state.decayInterval).asSeconds(), state.decayRate]
      return node.scheduleJob<JobArgs>({
        id: parts.join('.'),
        actionName: jobNames.UserStateDecay,
        dispatchAt: moment().add(state.decayInterval!).toDate(),
        args: { stateId: state.id },
      })
    })

  on.job.onNode.executed.and(jobIs('UserStateDecay')).do(async ({ args, node }) => {
    const { stateId } = args as JobArgs
    const state = userStates[stateId]
    if (!state) {
      logger.warn('Unknown user state found:', stateId)
      return null
    }
    const { numberValue: value, changedAt } = await getUserState(node, stateId)
    const sign = value >= 0 ? 1 : -1
    const delta = -sign * Math.min(Math.abs(value), state.decayRate)
    if (delta === 0) {
      return null
    }
    const numberValue = safeAdd(value, delta)
    // Don't use incUserState() to avoid re-fetching and to maintain the previous changedAt
    return setUserState(node, stateId, { delta, numberValue, changedAt })
  })
}
