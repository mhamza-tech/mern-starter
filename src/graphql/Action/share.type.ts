import { gql } from 'apollo-server'

export default gql`
input SharePrivateLinkInput {
  entityId: ID!
  entityType: FeedItemActionEntityType!
}

type SharePrivateLinkOutput {
  title: String!
  description: String
  imageURI: String!
  smsGreeting: String!
  link: String!
}

type Mutation {
  socialSharingUrl(unObjectIdOrUsername: String!): String! @deprecated(reason:"use shareMediaLink")
  shareMediaLink(unObjectIdOrUsername: String!): String!
  sharePrivateLink(input: SharePrivateLinkInput): SharePrivateLinkOutput!
}
`
