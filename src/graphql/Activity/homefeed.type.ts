import { gql } from 'apollo-server'

export default gql `
enum FeedItemActionType {
  AvatarBuilder
  Backpack
  Chat
  ChatList
  Default
  Info
  Moves
  Profile
  ShareEntity
}

enum FeedItemActionEntityType {
  NPC
  Item
  Move
  User
}

type FeedItemAction {
  entityId: ID
  entityType: FeedItemActionEntityType
  player: Player
  type: FeedItemActionType!
  text: String
}

enum DynamicFeedItemLayout {
  """
  newsfeed post items
  """
  Post1
  
  """
  default dynamic newsfeed item
  """
  Dynamic1
  
  """
  unObject or unObject inset player type of dynamic newsfeed item
  """
  Dynamic2
}

enum StaticFeedItemLayout {
  """ 
  A 16:9 Card / Any Background Color / Right Justified Image / Left Justified Text
  """
  Static1
  
  """
  A 16:9 Card / White Background Color / Centered Image / Centered Text
  """
  Static2
  
  """
  Two 9:16 Side-by-side Cards / Any Background Color / Centered Image / Left Justified Text
  """
  Static3
  
  """
  A 16:9 Card / Any Background Color / Centered Image / Centered Text
  """
  Static4
}

type StaticFeedItem {
  action: FeedItemAction
  backgroundColor: String!
  backgroundImage: Image
  description: String
  foregroundImage: Image
  infoBlock: String
  title: String!
  textColor: String
  trackingId: String!
}

type StaticFeedItemOutput {
  data: [StaticFeedItem!]!
  layout: StaticFeedItemLayout!
}

enum SuggestedFriendsFeedItemLayout {
  """
  Refers to dynamic data from db based on rules
  """
  Friend1
  
  """
  Refers to fake data set predefined in Airtable
  """
  Friend2
}

type SuggestedFriendsFeedItemOutput {
  data: [Player!]!
  layout: SuggestedFriendsFeedItemLayout!
}

enum FeedItemType {
  NewsfeedItem
  SmartCard
  Friend
}

type FeedItem {
  dynamic: NewsfeedItem
  static: StaticFeedItemOutput
  suggestedFriends: SuggestedFriendsFeedItemOutput
  type: FeedItemType!
}

type HomeFeed {
  items: [FeedItem!]!
  pageInfo: PageInfo!
}

input HomeFeedInput {
  pageInput: PageInput
}

type Query {
  homeFeed(input: HomeFeedInput): HomeFeed!
}

type Mutation {
  dismissSmartCard(id: ID!): StaticFeedItem!
}
`
