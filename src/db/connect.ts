/**
 * @rob4lderman
 * oct2019
 * 
 * Init DB connections.
 */

import { createConnections, getConnectionOptions } from 'typeorm'
import _ from 'lodash'
import {
  User,
  UserRole,
  EmailRegistry,
  Activity,
  Edge,
  EdgeStats,
  Event,
  Action,
  ActionResult,
  ActionWithContext,
  PlayerContext,
  Storyboard,
  StoryboardEdge,
  StoryboardEdgeType,
  StorylineSession,
  UnObject,
  NewsfeedItem,
  Field,
  Comment,
  CommentReceipt,
  Receipt,
  DeviceInfo,
  ChatRoom,
  Notification,
  Effect,
  CompletedAction,
  ActionX,
  ActionXInstance,
  Tile,
  QEdge,
  SDist,
  Report,
  Location,
  Job,
  Image,
} from './entity'
import {
  FAST_BOOT,
  TYPEORM_HOST,
  TYPEORM_PORT,
  TYPEORM_USERNAME,
  TYPEORM_PASSWORD,
  TYPEORM_DATABASE,
  TYPEORM_CONNECTION,
  TYPEORM_MIGRATIONS_DIR,
} from '../env'
import { LoggerFactory } from 'src/utils/logger'
import { FriendRequest } from 'src/db/entity'
import pgtools from 'pgtools'
import { promiseMap } from 'src/utils/sf.typed'

const logger = LoggerFactory('connect')

const databaseInitializer = async (): Promise<void> => {
  logger.info('Initializing Database Connections...')

  const dbConnections = [
    {
      name: TYPEORM_CONNECTION,
      type: 'postgres',
      host: TYPEORM_HOST,
      database: TYPEORM_DATABASE,
      entities: [
        User,
        UserRole,
        DeviceInfo,
        EmailRegistry,
        Report,
        Activity,
        Edge,
        QEdge,
        SDist,
        EdgeStats,
        Event,
        Effect,
        NewsfeedItem,
        Field,
        Tile,
        Comment,
        CommentReceipt,
        Receipt,
        ChatRoom,
        Notification,
        Location,
        Job,
        FriendRequest,
        Action,
        ActionX,
        ActionXInstance,
        ActionResult,
        ActionWithContext,
        PlayerContext,
        Storyboard,
        StoryboardEdge,
        StoryboardEdgeType,
        StorylineSession,
        CompletedAction,
        UnObject,
        Image,
      ],
      migrations: [
        `${TYPEORM_MIGRATIONS_DIR}/*.ts`,
        `${TYPEORM_MIGRATIONS_DIR}/*.js`,
      ],
    },
  ]

  if (!FAST_BOOT) {
    await promiseMap(dbConnections, conn => {
      const config = {
        user: TYPEORM_USERNAME,
        password: TYPEORM_PASSWORD,
        port: TYPEORM_PORT,
        host: TYPEORM_HOST,
      }
      return pgtools.createdb(config, conn.database)
        .then(res => {
          logger.info(`${conn.database} db is now created. YAAAY :)!!`)
          return res
        })
        .catch(err => {
          logger.info(`${conn.database} db is already created, ignore this`)
          return err
        })
    })
  }

  // read connection options from ormconfig file (or ENV variables)
  console.time('TIMING: getConnectionOptions')
  const connectionOptions = await getConnectionOptions()
  console.timeEnd('TIMING: getConnectionOptions')
  const connectionOptionsMap = _.map(
    dbConnections,
    dbConnection => _.extend({}, connectionOptions, dbConnection)
  )

  return await createConnections(connectionOptionsMap)
    .then(async () => {
      logger.info('Database connections established')
      // logger.info('Running db migrations...')
      // await conn.runMigrations({ transaction: true })
    })
}

// The promise that other code can wait on before trying
// to access the DB.  Note that typeorm's getConnection().getRepository()
// will FAIL if the connection has not yet been established.
export const createConnectionsPromise = databaseInitializer()
