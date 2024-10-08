import { gql } from 'apollo-server'

export default gql`
  enum EventType {
    Intraction
    NewsfeedItemCreate
  }
`
