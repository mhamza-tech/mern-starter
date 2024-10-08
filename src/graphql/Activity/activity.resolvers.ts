/**
 * @rob4lderman
 * aug2019
 * 
 * GQL Type: User
 * Db Type: UserRow or UserRecord or UserDoc
 * Edges: store.mapEdgeToThis/ThatEntity
 * ID contains type -> store.mapIdToEntity
 * store thisEntityType separately when necessary
 * store.read<Entity>By         
 * store.update<Entity>By
 * store.save<Entity>
 * db.createOrRead<Entity> 
 * db.createOrUpdate<Entity>
 * save<Entity>With<EdgeType>Edges
 * resolveEdge
 * resolveEid
 *          
 * TODO: defaults write -g ApplePressAndHoldEnabled -bool true
 * TODO: timing bug on enterChatRoom still there
 * TODO: virtual goods
 * TODO: handler api: access user's avataaar settings
 * TODO: handler api: generate new avataaar pngs (e.g. with different facial expressions)
 * TODO: PRIORITIZE features related to user test; week after next (dec 15)
 * TODO: spot it.
 *          - code for placing 8 tiles in the upper / lower quadrant of the screen, random location, size, orientation. 
 *          - next: code for remembering which symbols are visible in the tiles
 *          - code for assigning 8 symbols to the tiles
 *              - chosen at random from the cards
 *          - action to select the next card.
 * TODO: opt-out of notifications on newsfeed items
 *          - smarter: "proximity" notifications (?).  need to know if you actually open them.
 * TODO: consistency DB table to keep track of which one-time consistency functions have ran (like typeorm migrations)
 * TODO: imgix: snapshot of unobject image + tiles => png for newsfeed item that is shareable
 * TODO: choreographed effects - tiles, lottie animations, native animations, sounds
 *          - add "choregraphId" to each entity, stream them down separately
 *          - also need "1/n" so front end knows when it has all of them.
 * TODO: handler api: long-running timer/scheduling system
 * TODO: perf: typeorm "upsert" - createOrUpdate should **assume it exists**.  first update, then create. 
 *          - except update doesn't return the num affected rows.
 *          - so can't do this.
 *          - instead take the fieldId as a parameter.  What's the risk?  that it'll update the wrong field record??
 *              but that would be a uniqueness violation!
 * TODO: actions: attach "submit animations", which run when the action is submitted
 * TODO: what if all notifications were delivered IN THE NEWSFEED!
 *          - some sort of indicator that notifications await
 *          - but you have to scroll down in the newsfeed to see them!
 *          - and you can fully interact with them in the newsfeed.
 *          - including a fully private chat room
 *          - vs. a "public space"
 *          - right IN THE NEWSFEED
 *          - so you actually ALWAYS process your notification newsfeed items FIRST
 *              - (or close to first - ranked overall)
 *          - snooze it!
 *          - queue it!
 *          - remove it after one view
 *              - always available under interactions view
 *          - double-tap to bring it to "foreground" (or "zoom" button or whatever)
 *          - expansion animation (not slide-in-stacked)
 *          - double-tap to send to background (or X or whatever)
 *          - e.g. a newsfeed item where your friend commented and actioned you in your private chat.
 *              - you see the action, the comment, the effect, like poop on your face. right there
 *              - in your newsfeed (and we remind them: "(only you see this)")
 *              - in your newsfeed (and we remind them: "(only you and your friend see this)")
 *              - in your newsfeed (and we remind them: "(private chat room)") // tap to learn more
 *              - in your newsfeed (and we remind them: "(only the ppl on the thread see this)")
 *              - in your newsfeed (and we remind them: "(private thread)")
 *              - and you want to action and comment back
 *              - so you press the action sheet drawer button, or the keyboard button to type
 *              - and it immediately brings you into the "foreground" mode
 *              - w/ the keyboard open or the action ready to be fired
 * TODO: field-state updates in yaml.  animation effects in yaml. 
 * TODO: variable reactions
 * TODO: add "valence" to actions - i.e. temporary tags that reflect temporal context
 * TODO: hosted vs unhosted objects
 * TODO: action quantities, replenishable - only so many bruce lee kicks , only so many bullets in the gun
 * TODO: actions / counter-actions (natural reactions) - handles bruce lee kick
 * TODO: bot: run an action from the handler
 * TODO: bot: varying-length comments (for ui validation)
 * TODO: presence: manually set by user.
 * TODO: presence: detect sub onConnect/onDisconnect.  how to tell the channelId onConnect/onDisconnect?
 * TODO: presence: enter/exitChatRoom: send signal
 * TODO: user profile front-end apis
 *          - User.health
 *          - User.mood
 *          - User.traits
 *              - need to associate trait w/ objects you've interacted w/
 *              - need to remember which objects you've intereacted w/
 *              - need to remember the traits that were affected by that objects. 
 *                  - and reverse the lookup from trait -> object
 * TODO: maker api: onNewChatRoom - init local state
 * TODO: maker api: onReset at midnight
 * TODO: authz everywhere - especially subscriptions
 * TODO: maker api: "reactive" hooks for actions / reactions, IFTTT, adding XP (XP can also be calc'ed offline)
 * TODO: actions: scoped names, like "unreal.actions.kiss"
 * TODO: actions: types? like UnrealActionsKiss
 * TODO: actions: system handlers?  dispatcher.registerActionHandler( "unreal.actions.kiss", ... )
 * TODO: actions on newsfeed items, object page
 * TODO: on socket reconnect - send all un-received msgs AND EFFECTS for a given playerId
 *          - select * from comments 
 *          - left join 
 *              - (select * from commentreceipts 
 *                  where collectionId='...' 
 *                  and userId='...' 
 *                  and status='received') 
 *          - where collectionId='...'
 *          - and join is null
 * TODO: formalize ACTIONS.
 * TODO: push notification queue
 *          - aggregate notifications (e.g. per chatroom)
 * TODO: chat player invite status
 * TODO: chat player new-message badge count
 * TODO: content moderation - report, block
 * TODO: refactor to avoid all circular deps
 * TODO: restrict length on all varchar input fields.
 * TODO: add code to filter out malicious scripts from html/markdown (e.g. newsfeedItem text)
 *
 * GQL/api layer
 *      - validate input
 *      - authz
 *      - INGRESS/EGRESS LAYER
 * 
 * handler layer
 *      - api depends on biz layer
 * 
 * biz layer
 *      - resolver functions
 *      - behavior orchestration
 *      - interacts w/ model
 *      - publishes events
 * 
 * model layer
 *      - functions on types
 *      - interacts w/ store/cache
 * 
 * store layer
 *      - cache
 *      - database access
 *      - store.save 
 *          - create or update
 *      - publishes events?
 *          - firebase.setDoc
 * 
 * 
 * action: follow
 * 1. GQL: invokeAction(input:{
 *      actionType: 'Follow',
 *      args: {
 *          thisEntityId: {session.userId}  // optional - for MASTER_KEY override
 *          thatEntityId: {userId} 
 *      }
 * })
 * 2. Effect: model.createAction
 * 3. Effect: model.createEdge
 * 4. Effect: model.createNotification
 * 5. Error: model.createError
 * 
 * 
 * TODO: circular deps
 * merge
 * => activity.resolvers
 * => eventLocal 
 * => stateMachineLocal 
 * => action.resolvers
 * => engine => resolvers
 * => actionModel
 * => activityLocal 
 * 
 * 
 * 
 */
import _ from 'lodash'
import {
  combineResolvers,
} from 'graphql-resolvers'
import { jwt } from '../../utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  Activity,
  Edge,
  EdgeStats,
} from '../../db/entity'
import * as model from './activity.model'
import { redisPubSub } from '../../services'
import * as edgeResolvers from './edge.resolvers'

const logger = LoggerFactory('activity.resolvers', 'ActivityResolvers')
const pubsubLogger = LoggerFactory('pubsub', 'PubSub')

// -rx- const isEdgeUserLikesActivity = (edge:Edge):boolean => {
// -rx-     return edge.thatEntityType == EntityType.Activity 
// -rx-         && edge.edgeType == EdgeType.Likes
// -rx-         && edge.thisEntityType == EntityType.User
// -rx-         ;
// -rx- };
// -rx- 
// -rx- /**
// -rx-  * 
// -rx-  * @param edge 
// -rx-  */
// -rx- const createUserEdgeLikesViaActivity = (edge:Edge): Promise<Edge> => {
// -rx-     if ( !!! isEdgeUserLikesActivity( edge ) ) {
// -rx-         return Promise.resolve(null);
// -rx-     }
// -rx-     return model.readActivity( edge.thatEntityId )
// -rx-         .then( sf.maybe_fmap( 
// -rx-             (activity:Activity) => Promise.resolve( model.buildUserEdgeLikesViaActivity( edge, activity ) )
// -rx-                 .then( (edge:Edge) => model.createOrUpdateEdge( edge ) )
// -rx-                 // -rx- .then( (edge:Edge) => model.updateEdgeCount( edge ) )
// -rx-                 .then( sf.tap_catch( (edge:Edge) => model.updateEdgeStatsForEdge( edge ) ) )
// -rx-                 .then( sf.tap_catch( 
// -rx-                     (edge:Edge) => model.saveEvent({ 
// -rx-                         type: _.toString( EventType.CreateEdge ), 
// -rx-                         source: 'activity.resolvers.createUserEdgeLikesViaActivity',
// -rx-                         sessionUserId: edge.thisEntityId,
// -rx-                         edgeId: edge.id,
// -rx-                         edge: edge,
// -rx-                     })
// -rx-                 ))
// -rx-                 .then( sf.tap_catch( core.publishEdge ) )
// -rx-         ))
// -rx-         .catch( err => logger.error( 'createUserEdgeLikesViaActivity', { edge, err } ))
// -rx-         ;
// -rx- };

const validateNewsfeedInput = (input: any): any => {
  return _.extend({}, { page: 1 }, input)
}

/**
 * @return Promise w/ Activity list
 */
const newsfeed = (parent, args): Promise<Activity[]> => {
  logger.log('newsfeed', { input: args.input })
  const input: any = validateNewsfeedInput(args.input)
  return model.readActivities(input.page)
}

const validateNewsfeedTimestampInput = (input: any): any => {
  return _.defaults(input, {
    limit: model.ACTIVITY_PAGE_SIZE,
    timestamp: new Date(),
  })
}

/**
 * @return Promise w/ Activity list
 */
const newsfeedNewerThan = (parent, args): Promise<Activity[]> => {
  logger.log('newsfeedNewerThan', { input: args.input })
  const input: any = validateNewsfeedTimestampInput(args.input)
  return model.readActivitiesNewerThan(input.timestamp, input.limit)
}

/**
 * @return Promise w/ Activity list
 */
const newsfeedOlderThan = (parent, args): Promise<Activity[]> => {
  logger.log('newsfeedOlderThan', { input: args.input })
  const input: any = validateNewsfeedTimestampInput(args.input)
  return model.readActivitiesOlderThan(input.timestamp, input.limit)
}

const activityMyEdges = (parent, args, ctx): Promise<Edge[]> => {
  logger.log('activityMyEdges', { parent, args, ctx })
  return edgeResolvers.myEdges(
    parent,
    {
      input: { entityId: parent.id },
    },
    ctx
  )
}

const activityEdgeStats = (parent, args, ctx): Promise<EdgeStats[]> => {
  logger.log('activityEdgeStats', { parent, args, ctx })
  return edgeResolvers.edgeStats(
    parent,
    {
      input: { entityId: parent.id },
    }
  )
}

const resolveActivityMetadataType = (metadata): string | undefined => {
  if (metadata.actionWithContext) {
    return 'ActivityMetadataActionWithContext'
  }
  if (metadata.actionResult) {
    return 'ActivityMetadataActionResult'
  }
  return null
}

export const publishActivity = (activity: Activity): Promise<void> => {
  pubsubLogger.log('publishActivity', { collectionId: 'activity', activity })
  return redisPubSub.publish('activity', activity)
}

//
// GraphQL schema resolver table.
//

export default {
  Query: {
    newsfeed,
    newsfeedNewerThan,
    newsfeedOlderThan,
  },
  Activity: {
    edgeStats: combineResolvers(activityEdgeStats), // TODO: n+1
    myEdges: combineResolvers(jwt.requireJwtGql, activityMyEdges), // TODO: n+1
  },
  ActivityMetadata: {
    __resolveType: resolveActivityMetadataType,
  },
}
