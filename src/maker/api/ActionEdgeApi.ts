/**
 * @rob4lderman
 * oct2019
 * 
 * @deprecated - we don't use ActionXEdges anymore.  They've been replaced
 *               w/ a combination of ActionXInstances and ActionXStubs.
 */

import _ from 'lodash'
import { ActionXEdgeResolvers } from '../../graphql/Activity/edge.resolvers'
import {
  Edge,
  ActionX,
} from '../../db/entity'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ActionEdgeApiFactory = (edge: Edge, ctx: any): ActionEdgeApi => {
  const action = (): Promise<ActionX> => ActionXEdgeResolvers.action(edge)
  const quantity = (): number => _.defaultTo(ActionXEdgeResolvers.quantity(edge), 0)
  const isDisabled = (): boolean => _.defaultTo(ActionXEdgeResolvers.isDisabled(edge), false)
  const get = (key: string): any => _.get(edge, key)
  const getEdge = (): Edge => edge
  const name = (): string => edge.name
  return {
    get,
    action,
    quantity,
    isDisabled,
    getEdge,
    name,
  }
}

export interface ActionEdgeApi {
  get: (key: string) => any
  action: () => Promise<ActionX>
  quantity: () => number
  isDisabled: () => boolean
  getEdge: () => Edge
  name: () => string
}
