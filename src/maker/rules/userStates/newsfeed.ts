import { on } from 'src/maker/events'
import { nodeIsUser } from '../helpers'

export const setup = (): void => {
  on.state.cleared.and(nodeIsUser).do(({ node, state }) => (
    node.inactivateLiveNewsfeedItem(state.id)
  ))
}
