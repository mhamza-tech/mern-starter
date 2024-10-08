import { gql } from 'apollo-server'

export default gql`
  type Query {
    ready: String
  }

  type Subscription {
    "No Authentication Required"
    newHeartbeat: String!
  }
`
