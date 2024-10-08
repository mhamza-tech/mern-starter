import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnectionManager,
} from 'typeorm'
import { Image } from '../../db/entity/Image'

export class Database {

  private connectionManager = getConnectionManager()

  public async getConnection(): Promise<Connection> {
    const CONNECTION_NAME = 'default'

    if (this.connectionManager.has(CONNECTION_NAME)) {
      console.log('Database.getConnection() - using existing connection ...')
      const connection = this.connectionManager.get(CONNECTION_NAME)

      return connection.isConnected ? connection : connection.connect()
    } else {
      console.log('Database.getConnection() - creating connection ...')

      const connectionOptions: ConnectionOptions = {
        name: 'default',
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        database: process.env.DB_NAME,
        synchronize: false,
        entities: [Image],
      }

      // Don't need a pwd locally
      if (process.env.DB_PASSWORD) {
        Object.assign(connectionOptions, {
          password: process.env.DB_PASSWORD,
        })
      }

      return createConnection(connectionOptions)
    }
  }

}
