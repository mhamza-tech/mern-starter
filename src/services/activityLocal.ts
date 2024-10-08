/**
 * @rob4lderman
 * oct2019
 * 
 * Local api between gql services.
 */

import {
  EdgeStats,
  Edge,
} from '../db/entity'
import * as edgeResolvers from '../graphql/Activity/edge.resolvers'

export const readUserEdges = (userId: string, entityId: string): Promise<Edge[]> => {
  return edgeResolvers.userEdges(
    null,
    { input: { userId, entityId } }
  )
}

export const readEdgeStats = (entityId: string): Promise<EdgeStats[]> => {
  return edgeResolvers.edgeStats(
    null,
    { input: { entityId } }
  )
}
