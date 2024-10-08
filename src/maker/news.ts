import _ from 'lodash'
import moment, { DurationInputObject } from 'moment'
import { SYSTEM_USER_EID } from 'src/env'
import { StringTags } from 'src/domain/strings'
import { lookupString } from 'src/maker/strings'
import {
  Image,
  NewsfeedItem,
  DynamicFeedItemLayout,
} from 'src/gql-types'
import {
  misc,
  sf,
} from './../utils'
import {
  ChatRoomActionContextApi,
  NewsfeedItemTemplate,
  NodeApi,
  NewsfeedItemMetadata,
  NewsfeedItemContext,
} from 'src/types'
import { Item } from 'src/domain/items'
import { Move } from 'src/domain/moves'

//-- Newsfeeds V2 --//

class News {

  private newsfeed: NewsfeedItemTemplate = { layout: DynamicFeedItemLayout.Dynamic1, metadata: {}, context: {} }
  private tags: StringTags
  private optionalTags: string[] = []

  private get metadata(): NewsfeedItemMetadata {
    return this.newsfeed.metadata
  }

  // Wrap values on the root NewsfeedItem

  /** do not fan out to followers of the users in the context */
  public privately = (): this => {
    this.newsfeed.isPublic = false
    return this
  }

  /** make it look like the newsfeed was posted by the system user */
  public fromSystem = (): this => {
    this.newsfeed.fromEid = SYSTEM_USER_EID
    return this
  }

  /** make it look like it was posted by a certain player (neither the actor nor the system user) */
  public fromPlayer = (player: NodeApi): this => {
    this.newsfeed.fromEid = player.getEid()
    return this
  }

  /** restrict the user related to this newsfeed, don't infer from the context (similar to the old forUserId) */
  public onlyFor = (user: NodeApi): this => {
    this.withContext({ actorEid: user.getEid(), partnerEid: null })
    return this
  }

  public rateLimit = (rateId: string, rateLimit: DurationInputObject): this => {
    _.extend(this.newsfeed, { rateId, rateLimit })
    return this
  }

  /** add values that will be passed to handlebars to resolve the statusText */
  public withContext = (context: NewsfeedItemContext): this => {
    _.extend(this.newsfeed.context, context)
    return this
  }

  /** set an expiration for the newsfeed */
  public expiresIn = (duration: DurationInputObject): this => {
    this.newsfeed.expiresAt = moment().add(duration).toDate()
    return this
  }

  // Helper to any custom change needed in the metadata

  /** add values to the newsfeed metadata */
  public withMeta = (metadata: NewsfeedItemMetadata): this => {
    _.extend(this.metadata, metadata)
    return this
  }

  /** sets the (mandatory) StringTags to get the status, if none is found, newsfeed will be silently ignored */
  public withStatus = (tags: StringTags): this => {
    this.tags = ['news', ...tags]
    return this
  }

  /** wrapper to set the metadata.insetPlayerEid */
  public showInset = (player: NodeApi): this => {
    const insetPlayerEid = player.getEid()
    if (player.isUnObject()) {
      this.withContext({ unObjectEid: insetPlayerEid })
    } else {
      this.withContext({ partnerEid: insetPlayerEid })
    }
    return this.withMeta({ insetPlayerEid })
  }

  // Higher-level helpers to fill many values based on an object

  /** fill various properties, context and optional tag based on an Item */
  public showItem = (item: Item): this => {
    this.optionalTags.push(item.name)
    this.withContext({ itemName: item.name })
    return this.withMeta({
      title: item.text,
      description: item.description,
      image: { s3Key: item.s3Key },
    })
  }

  /** fill various properties, context and optional tag based on a Move */
  public showMove = (move: Move): this => {
    this.optionalTags.push(move.name)
    this.withContext({ moveName: move.name })
    return this.withMeta({
      title: move.text,
      description: move.description,
      image: { s3Key: move.s3Key },
    })
  }

  /** fill various properties and context based on the provided user */
  public showUser = (user: NodeApi): this => {
    this.withContext({ partnerEid: user.getEid() })
    return this.withMeta({
      title: user.getName(),
      image: { uri: user.getKey('imageUrl') },
    })
  }

  /** fill various properties, context and optional tag based on the provided NPC */
  public showNPC = (npc: NodeApi): this => {
    this.withContext({ unObjectEid: npc.getEid() })
    this.optionalTags.push(npc.getId())
    return this.withMeta({
      title: npc.getName(),
      description: npc.getKey('description'),
      backgroundColor: npc.getKey('backgroundColor'),
      image: { s3Key: npc.getKey('coverS3Key') },
    })
  }

  /** normally you'd use .save(api), but if you need the newsfeed, can be retrieved with this method */
  public create = (): NewsfeedItemTemplate | null => {
    const { metadata, newsfeed } = this

    if (this.tags) {
      // If the user provided tags and they don't match, silently ignore the newsfeed
      const statusText = lookupString(this.tags, this.optionalTags as StringTags)
      if (statusText === undefined) {
        return null
      }
      metadata.statusText = statusText
    }
    return newsfeed
  }

  /** instantiate the newsfeed and post it */
  public save = (api: ChatRoomActionContextApi): Promise<NewsfeedItem | null> => {
    const newsfeed = this.create()
    return newsfeed ? api.saveNewsfeedItem(newsfeed) : Promise.resolve(null)
  }

}

// TODO: once we have various type's of newsfeed, we'll need one helper for each
export default (): News => new News()

//-- "Old" newsfeed helpers and code --//

export const NewsfeedItemComposedImageTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  fromEid: SYSTEM_USER_EID,
  metadata: {
    // most fields set dynamically
    statusText: null,
    overlayImage: null,
    backgroundImage: {
      uri: 'https://static.boredpanda.com/blog/wp-content/uploads/2015/09/photos-that-do-not-look-real-3__880.jpg',
    },
    featuredImage: null,
    insetPlayerEid: null,
  },
})

export const NewsfeedItemComposedImageWithTextTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  fromEid: SYSTEM_USER_EID,
  metadata: {
    // most fields set dynamically
    statusText: null,
    imageText: null,
    backgroundImage: {
      uri: 'https://static.boredpanda.com/blog/wp-content/uploads/2015/09/photos-that-do-not-look-real-3__880.jpg',
    },
    featuredImage: null,
  },
})

export const NewsfeedItemTextOnlyTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  fromEid: SYSTEM_USER_EID,
  metadata: {
    statusText: null,
  },
})

export const NewsfeedItemUnObjectImageTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  fromEid: SYSTEM_USER_EID,
  metadata: {
    // most fields set dynamically
    statusText: null,
    image: null,
    isNew: false,
  },
})

export const NewsfeedItemUnObjectCardTemplate = misc.deepFreeze<NewsfeedItemTemplate>({
  layout: DynamicFeedItemLayout.Dynamic1,
  fromEid: SYSTEM_USER_EID,
  metadata: {
    statusText: null,
    isNew: true,
  },
})

export const newsfeedTemplateTest = misc.deepFreeze<NewsfeedItemTemplate>({
  rateLimit: { days: 1 },
  layout: DynamicFeedItemLayout.Dynamic1,
  fromEid: SYSTEM_USER_EID,
  metadata: {},
})

// export const publishActorDoesActionOnParterCard = ({ api, statusText, unObjectEid }): Promise<any> => {
//   api.saveNewsfeedItem(defaultsDeep({
//     rateId: `newsfeed.${NAME}.${actor.getEid()}.${partner.getEid()}`,
//     metadata: {
//       statusText,
//       actorEid: actor.getEid(),
//       image: {
//         uri: p2pActionAbsolute(
//           { absoluteUri: actorImage.uri, height: 0.5 },
//           { absoluteUri: partnerImage.uri, height: 0.5 },
//           NewsfeedBackgrounds.RedFade,
//           _.sample(['😘', '😗', '😙', '😚', '😽', '👄']),
//         ),
//       },
//     },
//   }, newsfeedTemplate))
// }

export const metadataStatusTextLens = sf.lens<string>('metadata.statusText')
export const metadataImageTextLens = sf.lens<string>('metadata.imageText')
export const metadataFeaturedImageLens = sf.lens<Image>('metadata.featuredImage')
export const metadataBackgroundImageLens = sf.lens<Image>('metadata.backgroundImage')
export const metadataActorEidLens = sf.lens<string>('metadata.actorEid')
export const metadataInsetPlayerEidLens = sf.lens<string>('metadata.insetPlayerEid')
export const metadataIsNewLens = sf.lens<boolean>('metadata.isNew')
export const metadataUnObjectEidLens = sf.lens<string>('metadata.unObjectEid')
export const metadataAnimationLens = sf.lens<string>('metadata.animation')
export const metadataAnimationSourceUriLens = sf.lens<string>('metadata.animation.sourceUri')
export const metadataImageLens = sf.lens<Image>('metadata.image')
export const isDeletedLens = sf.lens<boolean>('isDeleted')
export const rateIdLens = sf.lens<string>('rateId')
export const metadataExpiresAtLens = sf.lens<string>('metadata.expiresAt')
export const expiresAtLens = sf.lens<string>('expiresAt')
