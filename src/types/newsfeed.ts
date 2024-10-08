import {
  NewsfeedItemMetadata as GQLNewsfeedItemMetadata,
  NewsfeedItemContext as GQLNewsfeedItemContext,
  NewsfeedItem as GqlNewsfeedItem,
  DynamicFeedItemLayout,
  FeedItemAction as GqlFeedItemAction,
} from 'src/gql-types'
import { NewsfeedItem } from 'src/db/entity'
import { DurationInputObject } from 'moment'

export type FeedItemAction = Omit<GqlFeedItemAction, '__typename' | 'player'>

export type NewsfeedItemMetadata = Omit<GQLNewsfeedItemMetadata, '__typename' | 'player' | 'insetPlayer' | 'actor' | 'unObject' | 'action'>
& { action?: FeedItemAction }

export type NewsfeedItemContext = Omit<GQLNewsfeedItemContext, '__typename' | 'actorEid' | 'actor' | 'partner' | 'unObject'>
& { actorEid?: string }

/**
 * A template for declaring and creating NewsfeedItems to be used by the handler code.
 */
export interface NewsfeedItemTemplate {
  /**
   * specifies the owner of a newsfeed item
   */
  userId?: string

  /**
   * specifies the visual appearance of the card on FE
   */
  layout: DynamicFeedItemLayout

  /**
   * For rate-limiting newsfeed items.
   * The handler code specifies the rateId along with a rateLimit when generating NewsfeedItems.
   * The runtime looks up the previous NewsfeedItem with the same rateId and checks its createdAt
   * timestamp against the rateLimit and either creates the NewsfeedItem or doesn't based on the specified rateLimit.
   */
  rateId?: string

  /**
   * Specifies the amount of time to wait between successive NewsfeedItems with the same rateId.
   */
  rateLimit?: DurationInputObject

  /**
   * determines whether newsfeed should be visible to followers/friends
   */
  isPublic?: boolean

  /**
   * Data about background image, color, animation etc
   */
  metadata: NewsfeedItemMetadata

  /**
   * State id of the user's state for which this newsfeed
   * item was generated
   */
  stateId?: string

  /**
   * Specifies whether the newsfeed is live/active
   * i.e., has user's state expired
   */
  isLive?: boolean

  fromEid?: string
  expiresAt?: Date
  context?: NewsfeedItemContext
  optimisticId?: string
  trackingId?: string
}

export type NewsfeedItemOut = NewsfeedItem & GqlNewsfeedItem
