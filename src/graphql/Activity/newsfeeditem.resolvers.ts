import _ from 'lodash'
import { combineResolvers } from 'graphql-resolvers'
import {
  jwt,
  sft,
} from '../../utils'
import {
  NewsfeedItem,
  User,
  UnObject,
  Player,
} from '../../db/entity'
import * as chatModel from '../Chat/chat.model'
import {
  CommentsOutput,
  MutationSavePostArgs,
  SavePostInput,
  FeedItem,
  DynamicFeedItemLayout,
  MutationUpdateNewsfeedItemArgs,
  QueryNewsfeedItemArgs,
  NewsfeedItemMetadata,
  EntityType,
} from 'src/gql-types'
import {
  validate,
  buildSavePostInputSchema,
} from '../joi'
import * as core from '../core'
import * as store from '../store'
import {
  buildCollectionId,
  mapEntityToEid,
} from 'src/graphql/models'
import { NewsfeedItemTemplate } from 'src/types'
import * as newsfeedModel from 'src/graphql/Activity/newsfeeditem.model'

import { colorCombos } from 'src/domain/colorCombos'
import { userStates, UserState } from 'src/domain/userStates'

const newsfeedItem = (root, args: QueryNewsfeedItemArgs): Promise<NewsfeedItem> => {
  return store.newsfeedItemById(args.id)
}

const channels = (newsfeedItem: NewsfeedItem): any => {
  if (!!!newsfeedItem || !!!newsfeedItem.id) {
    return null
  }
  return {
    edgeStats: `newsfeeditem/${newsfeedItem.id}/edgestats`,
  }
}

const comments = (newsfeedItem: NewsfeedItem, args): Promise<CommentsOutput> => {
  return core.comments(
    _.extend(
      {},
      args.input,
      { collectionId: `newsfeeditem/${newsfeedItem.id}/comment` }
    )
  )
}

const mapSavePostInputToCreateNewsfeedItemInput = (
  user: User,
  input: SavePostInput,
): NewsfeedItemTemplate => {
  const colorCombo = _.sample(Object.values(colorCombos))
  return {
    layout: DynamicFeedItemLayout.Post1,
    userId: user.id,
    fromEid: user.eid,
    context: {
      actorEid: user.eid,
    },
    isPublic: true,
    optimisticId: input.optimisticId,
    metadata: {
      statusText: input.text,
      backgroundColor: colorCombo.background,
      textColor: colorCombo.text,
    },
  }
}

const savePost = (root, args: MutationSavePostArgs, ctx): Promise<FeedItem> => {
  const sessionUser: User = ctx.user
  const input = validate(args.input, buildSavePostInputSchema())
  const newsFeedItemInput = mapSavePostInputToCreateNewsfeedItemInput(sessionUser, input)
  return newsfeedModel.createNewsfeedItem(newsFeedItemInput)
    .then(newsfeedModel.newsfeedItemToFeedItem)
}

const commentCount = (newsfeedItem: NewsfeedItem): Promise<number> => {
  const collectionId = buildCollectionId(mapEntityToEid(newsfeedItem), 'comment')
  return chatModel.countComments(collectionId)
}

const isMyNewsfeedItem = (newsfeedItem: NewsfeedItem, args, ctx): boolean => {
  const sessionUser: User = ctx.user
  return _.isEqual(newsfeedItem.userId, sessionUser.id)
}

const updateNewsfeedItem = (root, args: MutationUpdateNewsfeedItemArgs, ctx): Promise<NewsfeedItem> => {
  const user: User = ctx.user
  if (_.isNil(args.input.isPublic) && _.isEqual(args.input.isDismissed, false)) {
    return Promise.reject(new Error(`Can't un-dismiss newsfeed item, ${args.input.id}`))
  }

  return store.newsfeedItemById(args.input.id)
    .then(newsfeedItem => {
      if (_.isNil(newsfeedItem)) {
        return Promise.reject(new Error(`Could not find newsfeed item, ${args.input.id}`))
      }

      if (_.isEqual(args.input.isDismissed, true)) {
        return newsfeedModel.deleteNewsfeedItemEdges([newsfeedItem.id], user.id)
          .then(() => newsfeedItem)
      }

      if (_.isEqual(newsfeedItem.isPublic, args.input.isPublic) ||
        _.isEqual(newsfeedItem.layout, DynamicFeedItemLayout.Post1)) {
        return newsfeedItem
      }

      if (!_.isEqual(user.id, newsfeedItem.userId)) {
        return Promise.reject(new Error(`You do not have permission to (un)publish newsfeed, ${args.input.id}`))
      }

      // 1) when a newsfeed is made public, we fan-out to owner & followers
      // 2) when a newsfeed is made private, we delete edges of that
      //    newsfeed for all users
      newsfeedItem.isPublic = args.input.isPublic
      return store.saveNewsfeedItem(newsfeedItem, newsfeedModel.saveNewsfeedItem)
        .then(sft.tap_wait(
          () => _.isEqual(newsfeedItem.isPublic, false)
            ? newsfeedModel.deleteNewsfeedItemEdges([newsfeedItem.id])
            : newsfeedModel.fanOutNewsfeedItem(newsfeedItem)
        ))
    })
}

const metadata = (newsfeedItem: NewsfeedItem): Promise<NewsfeedItemMetadata> => {
  return core.newsfeedItemStatusText(newsfeedItem)
    .then(statusText => ({ ...newsfeedItem.metadata, statusText }))
}

const isLiveText = (newsfeedItem: NewsfeedItem): string | undefined => {
  if (newsfeedItem.isLive) {
    const userState = userStates[newsfeedItem.stateId] as UserState | undefined
    return userState?.displayName
  }
}

//
// GraphQL schema resolver table.
//

export default {
  Query: {
    newsfeedItem,
  },
  Mutation: {
    updateNewsfeedItem: combineResolvers(jwt.requireJwtAuth, updateNewsfeedItem),
    savePost: combineResolvers(jwt.requireJwtAuth, savePost),
  },
  NewsfeedItem: {
    channels: channels,
    comments: comments,
    commentCount: commentCount,
    likesCount: core.likesCount,
    myLikesCount: core.myLikesCountFor,
    isMyNewsfeedItem: combineResolvers(jwt.requireJwtAuth, isMyNewsfeedItem),
    fromPlayer: core.resolveEidToEntity<Player>('fromEid'),
    player: core.resolveIdToEntity<User>('userId', EntityType.User),
    isLiveText: isLiveText,
    metadata,
  },
  NewsfeedItemMetadata: {
    insetPlayer: core.resolveEidToEntity<Player>('insetPlayerEid'),
  },
  NewsfeedItemContext: {
    actor: core.resolveEidToEntity<Player>('actorEid'),
    partner: core.resolveEidToEntity<Player>('partnerEid'),
    unObject: core.resolveEidToEntity<UnObject>('unObjectEid'),
  },
}
