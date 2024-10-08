/**
 * @rob4lderman
 * aug2019
 * 
 */

import _ from 'lodash'
import {
  getConnection,
  Repository,
} from 'typeorm'
import {
  ActionResult,
  UnObject,
  Storyboard,
  Action,
  PlayerContext,
  ActionWithContext,
  StoryboardEdge,
  StoryboardEdgeType,
} from '../../db/entity'
import {
  CreateStoryboardInput,
  ActionInput,
  ActionStub,
} from '../../gql-types'
import {
  misc,
  sf,
} from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import * as errors from './action.error'
import * as dbUtils from '../../db/utils'
import { TYPEORM_CONNECTION } from 'src/env'
import { unObjectById } from 'src/graphql/store'

const logger = LoggerFactory('action.model')

const DB_CONN_NAME = TYPEORM_CONNECTION

/**
 * @return Promise w/ repository
 */
let cachedActionResultRepository = null
export const getActionResultRepository = (): Promise<Repository<ActionResult>> => {
  return !!!_.isNil(cachedActionResultRepository)
    ? Promise.resolve(cachedActionResultRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(ActionResult))
      .then(sf.tap(repo => {
        cachedActionResultRepository = repo 
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedStoryboardRepository = null
export const getStoryboardRepository = (): Promise<Repository<Storyboard>> => {
  return !!!_.isNil(cachedStoryboardRepository)
    ? Promise.resolve(cachedStoryboardRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Storyboard))
      .then(sf.tap(repo => {
        cachedStoryboardRepository = repo 
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedStoryboardEdgeRepository = null
export const getStoryboardEdgeRepository = (): Promise<Repository<StoryboardEdge>> => {
  return !!!_.isNil(cachedStoryboardEdgeRepository)
    ? Promise.resolve(cachedStoryboardEdgeRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(StoryboardEdge))
      .then(sf.tap(repo => {
        cachedStoryboardEdgeRepository = repo 
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedActionRepository = null
export const getActionRepository = (): Promise<Repository<Action>> => {
  return !!!_.isNil(cachedActionRepository)
    ? Promise.resolve(cachedActionRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(Action))
      .then(sf.tap(repo => {
        cachedActionRepository = repo 
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedPlayerContextRepository = null
export const getPlayerContextRepository = (): Promise<Repository<PlayerContext>> => {
  return !!!_.isNil(cachedPlayerContextRepository)
    ? Promise.resolve(cachedPlayerContextRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(PlayerContext))
      .then(sf.tap(repo => {
        cachedPlayerContextRepository = repo 
      }))
}

/**
 * @return Promise w/ repository
 */
let cachedActionWithContextRepository = null
export const getActionWithContextRepository = (): Promise<Repository<ActionWithContext>> => {
  return !!!_.isNil(cachedActionWithContextRepository)
    ? Promise.resolve(cachedActionWithContextRepository)
    : Promise.resolve(getConnection(DB_CONN_NAME).getRepository(ActionWithContext))
      .then(sf.tap(repo => {
        cachedActionWithContextRepository = repo 
      }))
}

/**
 * 
 * @param doActionResult
 * @return doActionResult, with card "prettified" to remove extra whitespace.
 */
export const prettifyCard = (actionResult: ActionResult): ActionResult => {
  return _.extend(
    {},
    actionResult,
    {
      card: _.extend(
        {},
        actionResult.card,
        { text: _.trim(misc.compressWhitespace(_.result(actionResult.card, 'text'))) }
      ),
    }
  )
}

export const buildStoryboard = (input: CreateStoryboardInput, userId: string): Storyboard => {
  const storyboard = new Storyboard()
  storyboard.createdByUserId = userId
  storyboard.unObjectId = input.unObjectId
  return storyboard
}

export const saveStoryboard = (storyboard: Storyboard): Promise<Storyboard> => {
  return getStoryboardRepository()
    .then(repo => repo.save(storyboard))
}

export const createStoryboard = saveStoryboard

export const readStoryboard = (storyboardId: string): Promise<Storyboard> => {
  return getStoryboardRepository()
    .then(repo => repo.findOne(storyboardId))
}

export const assertStoryboard = (storyboardId: string): Promise<Storyboard> => {
  return readStoryboard(storyboardId)
    .then(sf.thru_if(storyboard => _.isNil(storyboard))(
      () => {
        throw new Error(`Storyboard with ID ${storyboardId} not found.`) 
      }
    ))
}

export const buildAction = (input: ActionInput, unObjectId: string, storyboardId: string, userId: string): Action => {
  const action = new Action()
  action.createdByUserId = userId
  action.storyboardId = storyboardId
  action.unObjectId = unObjectId
  action.buttonText = input.buttonText
  action.startState = input.startState
  action.endState = input.endState
  action.card = input.card
  action.newsfeedText = input.newsfeedText
  return action
}

export const createActions = (actions: Action[]): Promise<Action[]> => {
  if (_.isEmpty(actions)) {
    return Promise.resolve([])
  }
  return getActionRepository()
    .then(repo => repo.insert(actions))
    .then(() => actions)
}

export const readActionsForStoryboard = (storyboardId: string): Promise<Action[]> => {
  return getActionRepository()
    .then(repo => repo.find({ storyboardId }))
}

export const readAction = (actionId: string): Promise<Action> => {
  return getActionRepository()
    .then(repo => repo.findOne(actionId))
}

export const buildActionWithContext = (action: Action, myPlayerContext: PlayerContext, trackingId: string = null): ActionWithContext => {
  const actionWithContext = new ActionWithContext()
  actionWithContext.actionId = action.id
  actionWithContext.action = action
  actionWithContext.myPlayerContext = myPlayerContext
  actionWithContext.myPlayerContextId = myPlayerContext.id
  actionWithContext.createdByUserId = myPlayerContext.userId
  actionWithContext.trackingId = trackingId
  return actionWithContext
}

const setPlayedActions = (playerContext: PlayerContext, playedActions: string[]): PlayerContext => {
  playerContext.metadata = _.extend({}, playerContext.metadata, { playedActions })
  return playerContext
}

const setPlayedAction = (playerContext: PlayerContext, action: Action): PlayerContext => {
  const playedActions = [
    ..._.result(playerContext, 'metadata.playedActions', []),
    action.id,
  ]
  return setPlayedActions(playerContext, playedActions)
}

export const setPlayerContextForAction = (playerContext: PlayerContext, action: Action, storyboardActions: Action[]): PlayerContext => {
  return _.chain(playerContext)
    .thru(playerContext => _.extend(playerContext, { currentState: action.endState }))
    .thru(playerContext => setPlayedAction(playerContext, action))
    .thru(playerContext => setActionStubsForPlayerContext(playerContext, storyboardActions))
    .value()
}

export const resetPlayerContext = (playerContext: PlayerContext, storyboardActions: Action[]): PlayerContext => {
  return _.chain(playerContext)
    .thru(playerContext => _.extend(playerContext, { currentState: 'start' }))
    .thru(playerContext => setPlayedActions(playerContext, []))
    .thru(playerContext => setActionStubsForPlayerContext(playerContext, storyboardActions))
    .value()
}

export const createActionWithContext = (actionWithContext: ActionWithContext): Promise<ActionWithContext> => {
  return getActionWithContextRepository()
    .then(repo => repo.save(actionWithContext))
}

export const readActionWithContext = (actionWithContextId: string): Promise<ActionWithContext> => {
  return getActionWithContextRepository()
    .then(repo => repo.findOne(actionWithContextId))
}

export const readPlayerContext = (userId: string, storyboardId: string): Promise<PlayerContext> => {
  return getPlayerContextRepository()
    .then(repo => repo.findOne({ userId, storyboardId }))
}

export const savePlayerContext = (playerContext: PlayerContext): Promise<PlayerContext> => {
  return getPlayerContextRepository()
    .then(repo => repo.save(playerContext))
}

export const createPlayerContext = (playerContext: PlayerContext): Promise<PlayerContext> => {
  return savePlayerContext(playerContext)
    .catch(sf.thru_if_else(err => dbUtils.isUniqueViolation(err))(
      err => readPlayerContext(playerContext.userId, playerContext.storyboardId)
        .then(sf.tap(playerContext1 => logger.error('DB UNIQUE:', { playerContext, playerContext1 })))
        .then(sf.thru_if((playerContext1: PlayerContext) => _.isNil(playerContext1))(
          () => {
            throw err 
          }
        ))
        .then((playerContext1: PlayerContext) => _.extend(playerContext, { id: playerContext1.id }))
        .then((playerContext: PlayerContext) => updatePlayerContext(playerContext))
        .then(sf.tap(playerContext => logger.error('DB UNIQUE SAVED:', { playerContext })))
    )(
      err => {
        throw err 
      }
    ))
}

export const updatePlayerContext = savePlayerContext

export const buildPlayerContext = (userId: string, storyboardId: string): PlayerContext => {
  const playerContext = new PlayerContext()
  playerContext.userId = userId
  playerContext.storyboardId = storyboardId
  playerContext.currentState = 'start'
  return playerContext
}

export const buildActionStub = (action: Action): ActionStub => {
  return {
    id: action.id,
    buttonText: action.buttonText,
  }
}

export const setActionStubsForStoryboard = (playerContext: PlayerContext, storyboardId: string): Promise<PlayerContext> => {
  return readActionsForStoryboard(storyboardId)
    .then((actions: Action[]) => setActionStubsForPlayerContext(playerContext, actions))
}

const cleanActionStubsButtonText = (actionStubs: ActionStub[]): ActionStub[] => {
  return _.map(
    actionStubs,
    actionStub => _.extend(actionStub, { buttonText: misc.trimDots(actionStub.buttonText) })
  )
}

export const setActionStubsForPlayerContext = (playerContext: PlayerContext, actions: Action[]): PlayerContext => {
  const actionStubs = _.chain(actions)
    .thru(actions => getActionStubsForStartState(actions, playerContext.currentState))
    .thru(actionStubs => handleDuplicateActionStubs(actionStubs, playerContext))
    .thru(actionStubs => cleanActionStubsButtonText(actionStubs))
    .value()
    
  return _.extend(playerContext, { actionStubs })
}

const handleDuplicateActionStubs = (actionStubs: ActionStub[], playerContext: PlayerContext): ActionStub[] => {
  const groupedDups = _.groupBy(actionStubs, actionStub => misc.trimDots(actionStub.buttonText))
  return _.chain(_.values(groupedDups))
    .map((dups: ActionStub[]) => dups.length <= 1
      ? _.first(dups)
      : resolveDuplicateActionStubs(dups, playerContext)
    )
    .compact()
    .value()
}

const resolveDuplicateActionStubs = (actionStubs: ActionStub[], playerContext: PlayerContext): ActionStub => {
  return _.first(
    _.chain(actionStubs)
      .reject(actionStub => _.includes(_.result(playerContext, 'metadata.playedActions', []), actionStub.id))
      .sortBy(actionStub => actionStub.buttonText.length)
      .value()
  )
}

export const getActionStubsForStartState = (actions: Action[], startState: string): ActionStub[] => {
  return _.chain(getActionsForStartState(actions, startState))
    .map((action: Action) => buildActionStub(action))
    .value()
}

const getActionsForStartState = (actions: Action[], startState: string): Action[] => {
  return startState
    ? _.filter(actions, (action: Action) => _.toLower(action.startState) === _.toLower(startState))
    : []
}

export const readPublishedStoryboardForUnObject = (unObjectId: string): Promise<Storyboard> => {
  return getStoryboardEdgeRepository()
    .then(repo => repo.findOne({
      unObjectId,
      edgeType: StoryboardEdgeType.PUBLISHED,
    }))
    .then(sf.maybe_fmap(
      (storyboardEdge: StoryboardEdge) => readStoryboard(storyboardEdge.storyboardId)
    ))
}

export const readDraftStoryboardForUnObject = (unObjectId: string): Promise<Storyboard> => {
  return getStoryboardEdgeRepository()
    .then(repo => repo.findOne({
      unObjectId,
      edgeType: StoryboardEdgeType.DRAFT,
    }))
    .then(sf.thru_if_else(storyboardEdge => !!!storyboardEdge)(
      () => readLatestStoryboardForUnObject(unObjectId)
    )(
      (storyboardEdge: StoryboardEdge) => readStoryboard(storyboardEdge.storyboardId)
    ))
}

export const readLatestStoryboardForUnObject = (unObjectId: string): Promise<Storyboard> => {
  return getStoryboardRepository()
    .then(
      repo => repo.createQueryBuilder('storyboard')
        .where('storyboard.unObjectId = :unObjectId', { unObjectId })
        .orderBy('storyboard.createdAt', 'DESC')
        .getOne()
    )
}

export const readStoryboardsForUnObject = (unObjectId: string): Promise<Storyboard[]> => {
  return getStoryboardRepository()
    .then(repo => repo.find({ unObjectId }))
}

export const deleteStoryboardEdges = (deleteSpec: object): Promise<any> => {
  return getStoryboardEdgeRepository()
    .then(repo => repo.delete(deleteSpec))
}

export const createStoryboardEdge = (storyboardEdge: StoryboardEdge): Promise<StoryboardEdge> => {
  return getStoryboardEdgeRepository()
    .then(repo => repo.save(storyboardEdge))
}

export const buildStoryboardEdge = (props: object): StoryboardEdge => {
  return Object.assign(new StoryboardEdge(), props)
}

export const createStoryboardEdgePublish = (storyboard: Storyboard): Promise<StoryboardEdge> => {
  return deleteStoryboardEdges({
    unObjectId: storyboard.unObjectId,
    edgeType: StoryboardEdgeType.PUBLISHED,
  })
    .then(() => buildStoryboardEdge({
      storyboardId: storyboard.id,
      unObjectId: storyboard.unObjectId,
      edgeType: StoryboardEdgeType.PUBLISHED,
    }))
    .then((storyboardEdge: StoryboardEdge) => createStoryboardEdge(storyboardEdge))
}

export const deleteStoryboardEdgePublish = (storyboard: Storyboard): Promise<StoryboardEdge> => {
  return deleteStoryboardEdges({
    storyboardId: storyboard.id,
    unObjectId: storyboard.unObjectId,
    edgeType: StoryboardEdgeType.PUBLISHED,
  })
}

export const createStoryboardEdgeDraft = (storyboard: Storyboard): Promise<StoryboardEdge> => {
  return deleteStoryboardEdges({
    unObjectId: storyboard.unObjectId,
    edgeType: StoryboardEdgeType.DRAFT,
  })
    .then(() => buildStoryboardEdge({
      storyboardId: storyboard.id,
      unObjectId: storyboard.unObjectId,
      edgeType: StoryboardEdgeType.DRAFT,
    }))
    .then((storyboardEdge: StoryboardEdge) => createStoryboardEdge(storyboardEdge))
}

export const isStoryboardPublished = (storyboardId: string): Promise<boolean> => {
  return getStoryboardEdgeRepository()
    .then(repo => repo.findOne({ storyboardId, edgeType: StoryboardEdgeType.PUBLISHED }))
    .then(edge => !!!_.isNil(edge))
}

const safeUpdateStoryboard = (updatedFields: object): object => {
  return _.pick(updatedFields, ['status'])
}

export const updateStoryboard = (storyboardId: string, updatedFields: object): Promise<Storyboard> => {
  return getStoryboardRepository()
    .then(sf.tap_wait(repo => repo.update(storyboardId, safeUpdateStoryboard(updatedFields))))
    .then(repo => repo.findOne(storyboardId))
}

export const readActionResultsByTrackingId = (trackingId: string): Promise<ActionResult[]> => {
  return getActionResultRepository()
    .then(repo => repo.find({ trackingId }))
}

export const readActionWithContextsByTrackingId = (trackingId: string): Promise<ActionWithContext[]> => {
  return getActionWithContextRepository()
    .then(repo => repo.find({ trackingId }))
}

export const readPlayerContextsByTrackingId = (trackingId: string): Promise<PlayerContext[]> => {
  return getPlayerContextRepository()
    .then(repo => repo.find({ trackingId }))
}

export const validateStoryboard = (storyboard: Storyboard): Promise<Storyboard> => {
  return Promise.resolve(storyboard)
    .then(sf.tap_wait(storyboard => validateStoryboardUnObject(storyboard)))
    .then(sf.tap_wait(storyboard => validateStoryboardActions(storyboard)))
}

export const validateStoryboardUnObject = (storyboard: Storyboard): Promise<UnObject> => {
  return Promise.resolve(storyboard)
    .then(sf.thru_if(storyboard => _.isEmpty(_.trim(storyboard.unObjectId)))(
      () => {
        throw errors.buildInvalidStoryboardErrorUnObjectRequired() 
      }
    ))
    .then(storyboard => unObjectById(storyboard.unObjectId))
    .then(sf.thru_if(unObject => _.isNil(unObject))(
      () => {
        throw errors.buildInvalidStoryboardErrorUnObjectRequired() 
      }
    ))
    .then(sf.thru_if(unObject => _.isEmpty(_.trim(unObject.name)))(
      () => {
        throw errors.buildInvalidUnObjectErrorNameRequired() 
      }
    ))
    .then(sf.thru_if(unObject => _.isEmpty(_.trim(unObject.entryId)))(
      () => {
        throw errors.buildInvalidUnObjectErrorImageRequired() 
      }
    ))
}

export const validateStoryboardActions = (storyboard: Storyboard): Promise<any[]> => {
  return readActionsForStoryboard(storyboard.id)
    .then(sf.thru_if(actions => _.isEmpty(actions))(
      () => {
        throw errors.buildInvalidStoryboardErrorActionsRequired() 
      }
    ))
    .then(sf.list_fmap_wait(action => validateAction(action)))
}

export const validateAction = (action: Action): Promise<Action> => {
  return Promise.resolve(action)
    .then(sf.thru_if(action => _.isEmpty(_.trim(action.card.text)) && _.isEmpty(action.card.entryId))(
      () => {
        throw errors.buildInvalidActionErrorCardRequired(action) 
      }
    ))
}
