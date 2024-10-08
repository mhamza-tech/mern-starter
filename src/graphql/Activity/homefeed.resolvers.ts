import _ from 'lodash'
import { combineResolvers } from 'graphql-resolvers'
import { requireJwtAuth } from 'src/utils/jwt'
import { User } from 'src/db/entity'
import {
  QueryHomeFeedArgs,
  HomeFeed,
  FeedItem,
  EdgeType,
  FeedItemType,
  Player,
  DynamicFeedItemLayout,
  StaticFeedItemLayout,
  SuggestedFriendsFeedItemLayout,
  StaticFeedItem,
  FeedItemAction,
  FeedItemActionEntityType,
  MutationDismissSmartCardArgs,
} from 'src/gql-types'
import {
  SmartCard,
  smartCards,
} from 'src/domain/smartCards'
import * as store from 'src/graphql/store'
import { promiseMap } from 'src/utils/sf.typed'
import * as core from 'src/graphql/core'
import { validate } from 'src/utils/joi'
import { homeFeedInput } from 'src/graphql/joi'
import {
  defaultPageInput,
  mapToPageInfo,
} from 'src/graphql/pageInput'
import { sortByDesc } from 'src/utils/misc'
import { mapEidToId } from 'src/graphql/models'
import { newsfeedItemToFeedItem } from 'src/graphql/Activity/newsfeeditem.model'
import { readSuggestedFriends } from 'src/graphql/User/user.model'
import { fakeUsers } from 'src/domain/fakeUsers'
import { sft } from 'src/utils'

// TODO this is also hard coded in `counters.ts`
const COUNTERS_PREFIX = 'cnt_'

type UserData = {
  me: User
  items: string[]
  friends: User[]
  stateValues: any
  hashtributeValues: any
  counterValues: any
}

type SortedCard = {
  order: string
  data: FeedItem
}

type FeedItemLayout = DynamicFeedItemLayout | StaticFeedItemLayout | SuggestedFriendsFeedItemLayout

const arrayObjectsToObject = (array: any[]): any => {
  return array.reduce((acc, obj) => {
    if (_.isNil(obj) || _.isEmpty(obj)) {
      return acc
    }
    return { ...acc, ...obj }
  }, {})
}

const stateValues = (user: User, smartCards: Readonly<SmartCard[]>): Promise<any> => {
  return Promise.all(smartCards.map(card => {
    if (_.isNil(card.stateId)) {
      return null
    }
    return core.fieldMetadataNumberValue(user, card.stateId)
      .then(v => ({ [card.stateId]: v }))
  }))
    .then(arrayObjectsToObject)
}

const hashtributeValues = (user: User, smartCards: Readonly<SmartCard[]>): Promise<any> => {
  return Promise.all(smartCards.map(card => {
    if (_.isNil(card.hashtributeId)) {
      return null
    }
    return core.fieldMetadataNumberValue(user, card.hashtributeId)
      .then(v => ({ [card.hashtributeId]: v }))
  }))
    .then(arrayObjectsToObject)
}

const counterValues = (user: User, smartCards: Readonly<SmartCard[]>): Promise<any> => {
  return Promise.all(smartCards.map(card => {
    if (_.isNil(card.counterId)) {
      return null
    }
    return core.fieldMetadataNumberValue(user, `${COUNTERS_PREFIX}${card.counterId}`)
      .then(v => ({ [card.counterId]: v }))
  }))
    .then(arrayObjectsToObject)
}

const filterByRules = (smartCards: Readonly<SmartCard[]>, user: UserData): SmartCard[] => {
  return smartCards.filter(card => {
    if (_.isEqual(user.me.gender, card.excludeIfGender)) {
      return false
    }

    if (!_.isNil(card.minFriends) && user.friends.length < card.minFriends) {
      return false
    }
    if (!_.isNil(card.maxFriends) && user.friends.length > card.maxFriends) {
      return false
    }

    if (!_.isEmpty(card.includeIfInInventory) && !card.includeIfInInventory.every(item => user.items.includes(item))) {
      return false
    }
    if (!_.isEmpty(card.excludeIfInInventory) && card.excludeIfInInventory.some(item => user.items.includes(item))) {
      return false
    }

    if (!_.isNil(card.minState) && user.stateValues[card.stateId] < card.minState) {
      return false
    }
    if (!_.isNil(card.maxState) && user.stateValues[card.stateId] > card.maxState) {
      return false
    }

    if (!_.isNil(card.minHashtribute) && user.hashtributeValues[card.hashtributeId] < card.minHashtribute) {
      return false
    }
    if (!_.isNil(card.maxHashtribute) && user.hashtributeValues[card.hashtributeId] > card.maxHashtribute) {
      return false
    }

    if (!_.isNil(card.minCounter) && user.counterValues[card.counterId] < card.minCounter) {
      return false
    }
    if (!_.isNil(card.maxCounter) && user.counterValues[card.counterId] > card.maxCounter) {
      return false
    }
    if (_.isEqual(core.hasValidAge(user.me, card), false)) {
      return false
    }

    return true
  })
}

const smartCardToPartialStaticFeedItem = (card: Readonly<SmartCard>, action?: FeedItemAction): StaticFeedItem => {
  const backgroundImage = _.isEmpty(card.backgroundImage)
    ? null
    : core.mapS3KeyToImage(null, card.backgroundImage.s3Key)

  return {
    trackingId: card.id.toString(),
    title: card.title,
    description: card.description,
    backgroundColor: card.foregroundImage.backgroundColor,
    foregroundImage: core.mapS3KeyToImage(null, card.foregroundImage.s3Key),
    backgroundImage,
    action,
    infoBlock: card.infoBlock,
  }
}

const smartCardToStaticFeedItem = (card: Readonly<SmartCard>, user: UserData): Promise<StaticFeedItem> => {
  const getPlayer = (): Promise<Player> => {
    if (_.isNil(card.actionType)) {
      return Promise.resolve(null)
    }
    switch (card.actionType) {
      case 'M2M':
        return Promise.resolve(user.me)
      case 'NPC':
        return store.unObjectById(card.entityId)
      case 'P2P':
        if (card.entityId.startsWith('user')) {
          return store.userByIdOrUsername(mapEidToId(card.entityId))
        }
        return Promise.resolve(_.sample(user.friends))
      case 'OpenView':
        return Promise.resolve(null)
    }
  }

  return getPlayer()
    .then(player => {
      const action = _.isNil(card.feedItemActionType)
        ? null
        : {
          player,
          type: card.feedItemActionType,
          entityId: card.entityId,
          entityType: card.entityType,
        }
      return smartCardToPartialStaticFeedItem(card, action)
    })
}

// TODO fetching all friends and blocked in memory is not optimal
const staticFeedItems = (user: User): Promise<StaticFeedItem[]> => {
  return Promise.all([
    core.itemsNameByPlayer(user),
    store.edgesByThisIdEdgeType({
      thisEntityId: user.id,
      edgeType: EdgeType.Friend,
    })
      .then(friendsEdge => store.edgesByThisIdEdgeType({
        thisEntityId: user.id,
        edgeType: EdgeType.Block,
      })
        .then(blocked => _.isEmpty(blocked)
          ? friendsEdge
          : friendsEdge.filter(e =>
            blocked.some(b => !_.isEqual(b.thatEntityId, e.thisEntityId)))
        )
      )
      .then(edges => store.thatEntitiesOfEdges<User>(edges)),
    store.edgesByThisIdEdgeType({
      thisEntityId: user.id,
      edgeType: EdgeType.SmartCard,
    })
      .then(core.remainingSmartCards),
  ])
    .then(([userItems, friends, cards]) => {
      const userData: UserData = {
        me: user,
        friends: friends,
        items: userItems,
        stateValues: null,
        hashtributeValues: null,
        counterValues: null,
      }
      return Promise.all([
        stateValues(user, cards),
        hashtributeValues(user, cards),
        counterValues(user, cards),
      ])
        .then(([stateValues, hashtributeValues, counterValues]) => filterByRules(cards, {
          ...userData,
          stateValues,
          hashtributeValues,
          counterValues,
        }))
        .then(remainingCards => _.sortBy(remainingCards, c => c.sortBy))
        .then(remainingCards => _.groupBy(remainingCards, c => c.groupBy))
        .then(remainingCardsMap => Object.values(remainingCardsMap).map(cards => _.sample(cards)))
        .then(remainingCards => promiseMap(
          remainingCards,
          card => smartCardToStaticFeedItem(card, userData)
        ))
    })
}

const staticFeedItemToFeedItem = (staticItems: StaticFeedItem[], layout: StaticFeedItemLayout): FeedItem => {
  return {
    type: FeedItemType.SmartCard,
    static: {
      data: staticItems,
      layout,
    },
  }
}

const suggestedFriendsToFeedItem = (friends: User[], layout: SuggestedFriendsFeedItemLayout): FeedItem => {
  return {
    type: FeedItemType.Friend,
    suggestedFriends: {
      data: friends,
      layout,
    },
  }
}

// TODO fetching all newsfeed items in memory is not optimal
const dynamicFeedItems = (user: User): Promise<{
  posts: FeedItem[]
  otherItems: FeedItem[]
}> => {
  return store.edgesByThisIdEdgeType({
    thisEntityId: user.id,
    edgeType: EdgeType.NewsfeedItem,
  })
    .then(edges => promiseMap(
      edges,
      edge => store.newsfeedItemById(edge.collectionId)
    ))
    .then(newsfeedItems => newsfeedItems.sort(sortByDesc('createdAt')))
    .then(newsfeedItems => promiseMap(newsfeedItems, newsfeedItemToFeedItem))
    .then(feedItems => _.partition<FeedItem>(
      feedItems,
      item => item.dynamic.layout === DynamicFeedItemLayout.Post1
    ))
    .then(([posts, otherItems]) => ({ posts, otherItems }))
}

const readFakeUsers = (user: User): Promise<User[]> => {
  return sft.promiseMap(Object.values(fakeUsers), fakeUser => store.userById(fakeUser.id))
    .then(users => sft.promiseFilter(
      users,
      fakeUser => core.areFriends({
        thisId: user.id,
        thatId: fakeUser.id,
      }),
      true
    ))
}

const feedItems = (user: User): Promise<SortedCard[]> => {
  const template: FeedItemLayout[] = [
    DynamicFeedItemLayout.Dynamic1,
    DynamicFeedItemLayout.Dynamic1,
    DynamicFeedItemLayout.Post1,
    DynamicFeedItemLayout.Dynamic1,
    DynamicFeedItemLayout.Dynamic1,
    DynamicFeedItemLayout.Post1,
    DynamicFeedItemLayout.Dynamic1,
    DynamicFeedItemLayout.Dynamic1,
    DynamicFeedItemLayout.Post1,
    StaticFeedItemLayout.Static1,
    StaticFeedItemLayout.Static2,
    StaticFeedItemLayout.Static3,
    StaticFeedItemLayout.Static4,
    SuggestedFriendsFeedItemLayout.Friend1,
    DynamicFeedItemLayout.Post1,
    StaticFeedItemLayout.Static1,
    StaticFeedItemLayout.Static2,
    StaticFeedItemLayout.Static3,
    StaticFeedItemLayout.Static4,
    SuggestedFriendsFeedItemLayout.Friend2,
    StaticFeedItemLayout.Static3,
    StaticFeedItemLayout.Static4,
  ]

  return Promise.all([
    staticFeedItems(user),
    dynamicFeedItems(user),
    readSuggestedFriends(user),
    readFakeUsers(user),
  ])
    .then(([staticData, dynamicData, suggestedFriends, fakeUsers]) => {
      // TODO this whole block needs to be improved
      //  because it smells very DRY

      const numCards = staticData.length + dynamicData.posts.length + dynamicData.otherItems.length
      const filteredTemplate = template.filter(layout => {
        switch(layout) {
          case DynamicFeedItemLayout.Dynamic1:
            return dynamicData.otherItems.length !== 0
          case DynamicFeedItemLayout.Post1:
            return dynamicData.posts.length !== 0
          case StaticFeedItemLayout.Static1:
          case StaticFeedItemLayout.Static2:
          case StaticFeedItemLayout.Static3:
          case StaticFeedItemLayout.Static4:
            return staticData.length !== 0
          case SuggestedFriendsFeedItemLayout.Friend1:
            return suggestedFriends.length !== 0
          case SuggestedFriendsFeedItemLayout.Friend2:
            return fakeUsers.length !== 0
          default:
            return true
        }
      })
      const remainder = numCards % filteredTemplate.length
      const quotient = Math.floor(numCards / filteredTemplate.length)
      const repeatedTemplate: FeedItemLayout[] = Array(quotient)
        .fill(filteredTemplate)
        .flat(1)
      repeatedTemplate.push(...filteredTemplate.slice(0, remainder))

      let pl = 0
      let dl = 0
      let sl = 0
      const filtered = repeatedTemplate.filter(layout => {
        switch (layout) {
          case DynamicFeedItemLayout.Dynamic1:
            dl++
            return dl <= dynamicData.otherItems.length
          case DynamicFeedItemLayout.Post1:
            pl++
            return pl <= dynamicData.posts.length
          case StaticFeedItemLayout.Static1:
          case StaticFeedItemLayout.Static2:
          case StaticFeedItemLayout.Static4:
            sl++
            return sl <= staticData.length
          case StaticFeedItemLayout.Static3:
            sl += 2
            return sl <= staticData.length
          case SuggestedFriendsFeedItemLayout.Friend1:
          case SuggestedFriendsFeedItemLayout.Friend2:
            return true
          default:
            return true
        }
      })

      let si = 0
      let pi = 0
      let di = 0
      let order = 1
      const sortedCardByLayout = (cur: FeedItemLayout): SortedCard => {
        switch (cur) {
          case DynamicFeedItemLayout.Post1:
            return {
              order: (order++).toString(),
              data: dynamicData.posts[pi++],
            }
          case DynamicFeedItemLayout.Dynamic1:
          case DynamicFeedItemLayout.Dynamic2:
            return {
              order: (order++).toString(),
              data: dynamicData.otherItems[di++],
            }
          case StaticFeedItemLayout.Static1:
          case StaticFeedItemLayout.Static2:
          case StaticFeedItemLayout.Static4:
            return {
              order: (order++).toString(),
              data: staticFeedItemToFeedItem([staticData[si++]], cur),
            }
          case StaticFeedItemLayout.Static3:
            return {
              order: (order++).toString(),
              data: staticFeedItemToFeedItem(
                [
                  staticData[si++],
                  staticData[si++],
                ],
                cur
              ),
            }
          case SuggestedFriendsFeedItemLayout.Friend1:
            return {
              order: (order++).toString(),
              data: suggestedFriendsToFeedItem(suggestedFriends, cur),
            }
          case SuggestedFriendsFeedItemLayout.Friend2:
            return {
              order: (order++).toString(),
              data: suggestedFriendsToFeedItem(fakeUsers, cur),
            }
          default:
            return null
        }
      }

      return _.compact(filtered.map(sortedCardByLayout))
    })
}

const feed = (root, args: QueryHomeFeedArgs, ctx): Promise<HomeFeed> => {
  const input = validate(args.input, homeFeedInput()) || {}
  const defaultInput = {
    pageInput: defaultPageInput(input?.pageInput, '0'),
  }
  const user: User = ctx.user

  return feedItems(user)
    .then(feedItems => {
      // TODO use pageInput.pageResult fn instead
      const filtered = feedItems.filter(item => {
        if (defaultInput.pageInput.afterCursor) {
          return item.order > defaultInput.pageInput.afterCursor
        }
        return item.order < defaultInput.pageInput.beforeCursor
      })
      const toTake = defaultInput.pageInput.first || defaultInput.pageInput.last
      const take = filtered.length > toTake ? toTake : filtered.length
      if (defaultInput.pageInput.first) {
        return filtered.slice(0, take)
      }
      return filtered.slice(filtered.length - take)
    })
    .then(feedItems => {
      const pageInfo = mapToPageInfo(feedItems, defaultInput.pageInput, 'order')
      const items = feedItems.map(item => item.data)
      return { items, pageInfo }
    })
}

const actionPlayer = (action: FeedItemAction, args, ctx): Promise<Player> => {
  if (!_.isNil(action.player)) {
    return Promise.resolve(action.player)
  }
  switch (action.entityType) {
    case FeedItemActionEntityType.User:
      return store.userById(action.entityId)
    case FeedItemActionEntityType.Npc:
      return store.unObjectById(action.entityId)
    case FeedItemActionEntityType.Item:
    case FeedItemActionEntityType.Move:
      return Promise.resolve(ctx.user)
  }
}

const dismissSmartCard = (root, args: MutationDismissSmartCardArgs, ctx): Promise<StaticFeedItem> => {
  const user: User = ctx.user
  return store.edgeByThisIdCollectionId({
    thisEntityId: user.id,
    collectionId: args.id,
    edgeType: EdgeType.SmartCard,
  })
    .then(edge => {
      if (_.isNil(edge)) {
        return Promise.reject(new Error(`Could not find edge for smart card, ${args.id}`))
      }

      edge.isDeleted = true
      return store.saveEdge(edge)
        .then(() => smartCards.find(card => edge.collectionId === card.id.toString()))
        .then(smartCardToPartialStaticFeedItem)
    })
}

export default {
  Query: {
    homeFeed: combineResolvers(requireJwtAuth, feed),
  },
  Mutation: {
    dismissSmartCard: combineResolvers(requireJwtAuth, dismissSmartCard),
  },
  FeedItemAction: {
    player: actionPlayer,
  },
}
