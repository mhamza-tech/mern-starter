import _ from 'lodash'
import {
  Repository,
  getConnection,
  LessThan,
  MoreThan,
  In,
} from 'typeorm'
import {
  sf,
  misc,
} from '../../utils'
import { TYPEORM_CONNECTION } from 'src/env'
import { FriendRequest } from 'src/db/entity'
import {
  FriendRequestStatus,
  PageInput,
  FriendRequestsInput,
} from 'src/gql-types'
import moment from 'moment'
import {
  resolvePage,
  cursorToDate,
} from '../pageInput'

// const logger = LoggerFactory('friend.request.model')
const DB_CONN_NAME = TYPEORM_CONNECTION
const DEFAULT_PAGE_SIZE = 10

/**
 * @return Promise w/ repository
 */
let cachedFriendRequestRepository: Repository<FriendRequest> = null
export const getFriendRequestRepository = (): Promise<Repository<FriendRequest>> => {
  return !!!_.isNil(cachedFriendRequestRepository)
    ? Promise.resolve(cachedFriendRequestRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(FriendRequest))
      .then(sf.tap(repository => {
        cachedFriendRequestRepository = repository 
      }))
}

export const readFriendRequestById = (id: string): Promise<FriendRequest> => {
  return getFriendRequestRepository()
    .then(repo => repo.findOne({id}))
}

/**
 * friend requests list is in desc order. 
 * "before" and "after" in page terms refers to "later"
 * and "earlier" in newsfeed item timestamps, respectively
 *
 *                                cursor
 *               |<-- last n before | first n after -->|
 * 12pm  11am  10am  9am  8am  7am  6am  5am  4am  3am  2am  1am
 *
 * TODO reduce boilerplate/DRY code
 */
export const readPendingFriendRequestsBy = (opts: object, input: FriendRequestsInput): Promise<FriendRequest[]> => {
  const pageInput: PageInput = _.get(input, 'pageInput', {
    first: DEFAULT_PAGE_SIZE,
    afterCursor: moment().toISOString(),
  })
  return resolvePage(pageInput, {
    firstAfter: () => readFriendRequests({
      where: {
        ...opts,
        status: FriendRequestStatus.Pending,
        createdAt: LessThan(cursorToDate(pageInput.afterCursor)),
      },
      order: {createdAt: 'DESC'},
      take: pageInput.first,
      cache: 30000, // 30 seconds
    }),
    firstBefore: () => readFriendRequests({
      where: {
        ...opts,
        status: FriendRequestStatus.Pending,
        createdAt: MoreThan(misc.addMs(cursorToDate(pageInput.beforeCursor))),
      },
      order: {createdAt: 'DESC'},
      take: pageInput.first,
      cache: 30000,
    }),
    lastAfter: () => readFriendRequests({
      where: {
        ...opts,
        status: FriendRequestStatus.Pending,
        createdAt: LessThan(cursorToDate(pageInput.afterCursor)),
      },
      order: {createdAt: 'ASC'},
      take: pageInput.last,
      cache: 30000, // 30 seconds
    }),
    lastBefore: () => readFriendRequests({
      where: {
        ...opts,
        status: FriendRequestStatus.Pending,
        createdAt: MoreThan(misc.addMs(cursorToDate(pageInput.afterCursor))),
      },
      order: {createdAt: 'ASC'},
      take: pageInput.last,
      cache: 30000,
    }),
  })
}

export const readFriendRequests = (opts: object): Promise<FriendRequest[]> => {
  return getFriendRequestRepository()
    .then(repo => repo.find(opts))
}

export const readMutualFriendRequestByStatus = (
  senderId: string,
  receiverId: string,
  status: FriendRequestStatus[]
): Promise<FriendRequest> => {
  const opts = {
    where: [
      {
        senderId: senderId,
        receiverId: receiverId,
        status: In(status),
        isDeleted: false,
      },
      {
        senderId: receiverId,
        receiverId: senderId,
        status: In(status),
        isDeleted: false,
      },
    ],
  }
  return getFriendRequestRepository()
    .then(repo => repo.findOne(opts))
}

/**
 * Creates a new friend request only when
 * players have not sent request to each other
 * which is pending or accepted
 *
 * @param {Promise<FriendRequest>} friendRequest
 */
export const saveFriendRequest = (friendRequest: FriendRequest): Promise<FriendRequest> => {
  return readMutualFriendRequestByStatus(
    friendRequest.senderId,
    friendRequest.receiverId,
    [
      FriendRequestStatus.Accepted,
      FriendRequestStatus.Pending,
    ]
  )
    .then(request => !_.isEmpty(request)
      ? Promise.reject(new Error(`Friend request already exists between ${friendRequest.senderId} and ${friendRequest.receiverId}`))
      : null
    )
    .then(() => getFriendRequestRepository()
      .then(repo => repo.save(friendRequest)))
}

export const updateFriendRequest = (id: string, set: object): Promise<any> => {
  return getFriendRequestRepository()
    .then(sf.tap_wait(repo => repo.update({id}, set)))
}
