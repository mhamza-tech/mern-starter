/**
 * 
 * Merge GQL resolvers and type schemas.
 */
import { mergeResolvers, mergeTypes } from 'merge-graphql-schemas'
import { GraphQLJSONObject, GraphQLJSON } from 'graphql-type-json'
import { gql } from 'apollo-server'
import { GraphQLDateTime, GraphQLDate } from 'graphql-iso-date'
import activityResolvers from './Activity/activity.resolvers'
import activityTypes from './Activity/activity.type'
import newsfeedItemTypes from './Activity/newsfeeditem.type'
import edgeResolvers from './Activity/edge.resolvers'
import fieldResolvers from './Activity/field.resolvers'
import fieldTypes from './Activity/field.type'
import tileTypes from './Activity/tile.type'
import edgeTypes from './Activity/edge.type'
import qedgeTypes from './Activity/qedge.type'
import nodeTypes from './Activity/node.type'
import notificationTypes from './Activity/notification.type'
import effectResolvers from './Activity/effect.resolvers'
import effectTypes from './Activity/effect.type'
import tileResolvers from './Activity/tile.resolvers'
import nodeResolvers from './Activity/node.resolvers'
import notificationResolvers from './Activity/notification.resolvers'
import newsfeedItemResolvers from './Activity/newsfeeditem.resolvers'
import worldMapResolvers from './Activity/worldmap.resolvers'
import worldMapTypes from './Activity/worldmap.type'
import userResolvers from './User/user.resolvers'
import userTypes from './User/user.type'
import rootResolvers from './Root/resolvers'
import rootTypes from './Root/types'
import chatResolvers from './Chat/chat.resolvers'
import chatTypes from './Chat/chat.type'
import commentResolvers from './Chat/comment.resolvers'
import commentTypes from './Chat/comment.type'
import actionXTypes from './Action/actionx.type'
import actionXResolvers from './Action/actionx.resolvers'
import actionTypes from './Action/action.type'
import unObjectResolvers from './Action/unobject.resolvers'
import unObjectTypes from './Action/unobject.type'
import subResolvers from './subscription/sub.resolvers'
import subTypes from './subscription/sub.type'
import homeTypes from './Activity/homefeed.type'
import homeResolvers from './Activity/homefeed.resolvers'
import shareTypes from './Action/share.type'
import shareResolvers from './Action/share.resolvers'
import eventTypes from './Activity/event.type'

const jsonResolvers = {
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
}
const jsonTypes = gql`
    scalar JSON
    scalar JSONObject
`

const dateTimeTypes = gql`
    scalar DateTime
    scalar Date
`

const dateTimeResolvers = {
  DateTime: GraphQLDateTime,
  Date: GraphQLDate,
}

export const resolvers = mergeResolvers([
  dateTimeResolvers,
  jsonResolvers,
  activityResolvers,
  nodeResolvers,
  notificationResolvers,
  edgeResolvers,
  fieldResolvers,
  effectResolvers,
  tileResolvers,
  newsfeedItemResolvers,
  worldMapResolvers,
  rootResolvers,
  chatResolvers,
  commentResolvers,
  userResolvers,
  actionXResolvers,
  unObjectResolvers,
  subResolvers,
  homeResolvers,
  shareResolvers,
])

export const typeDefs = mergeTypes([
  dateTimeTypes,
  jsonTypes,
  nodeTypes,
  activityTypes,
  fieldTypes,
  tileTypes,
  qedgeTypes,
  newsfeedItemTypes,
  unObjectTypes,
  notificationTypes,
  worldMapTypes,
  edgeTypes,
  effectTypes,
  userTypes,
  rootTypes,
  chatTypes,
  commentTypes,
  actionTypes,
  actionXTypes,
  subTypes,
  homeTypes,
  shareTypes,
  eventTypes,
], {
  all: true,
})
