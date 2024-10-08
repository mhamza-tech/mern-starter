import { gql } from 'apollo-server'

export default gql`
type NewsfeedItemMetadata {
  statusText: String
  title: String
  description: String
  backgroundColor: String
  textColor: String
  backgroundImage: Image
  image: Image
  overlayImage: Image
  featuredImage: Image
  overlayText: String
  imageText: String
  isNew: Boolean
  insetPlayerEid: String
  insetPlayer: Player
  action: FeedItemAction
}

type NewsfeedItemContext {
  actorEid: String!
  actor: Player!
  partnerEid: String
  partner: Player
  unObjectEid: String
  unObject: UnObject
  hashtributeId: String
  value: Int
  userStateId: String
  itemName: String
  moveName: String
}

type NewsfeedItem {
  id: ID!
  entityType: EntityType
  layout: DynamicFeedItemLayout!
  userId: String!
  player: Player!
  fromEid: String!
  fromPlayer: Player!
  createdAt: DateTime
  expiresAt: DateTime
  trackingId: String
  metadata: NewsfeedItemMetadata
  channels: JSONObject
  comments(input:CommentsInput): CommentsOutput
  commentCount: Int
  likesCount: Int
  myLikesCount: Int
  isMyNewsfeedItem: Boolean
  isDeleted: Boolean
  optimisticId: String
  context: NewsfeedItemContext!
  isPublic: Boolean!
  isLive: Boolean
  isLiveText: String
}

input SavePostInput {
  text: String!
  optimisticId: String
}

input UpdateNewsfeedItemInput {
  id: ID!
  isPublic: Boolean
  isDismissed: Boolean
}

type Query {
  newsfeedItem(id: ID!): NewsfeedItem!
}

type Mutation {
  updateNewsfeedItem(input: UpdateNewsfeedItemInput!): NewsfeedItem!
  savePost(input: SavePostInput!): FeedItem!
}
`
