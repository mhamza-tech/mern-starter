import { getConnection } from 'typeorm'
// -rx- export const setToken = token => {
// -rx-   return token ? { headers: { 'x-token': token } } : null
// -rx- }

export const truncateAllTables = async (): Promise<void> => {
  if (process.env.NODE_ENV != 'production') {
    console.log('Truncating DB Beginning...')

    const connection = getConnection()
    const TRUNCATE_TABLES = await connection.entityMetadatas.map(e => {
      return `TRUNCATE TABLE "${e.tableName}" CASCADE;\n`
    })
    const allInOneTruncate = `${TRUNCATE_TABLES.join('')}`
    await connection.query(allInOneTruncate)
    console.log('Truncating DB Done!')
  }
}

// TODO: make displayName and Gender required.
export const isTestLive = (): boolean => process.env.TEST_LIVE === 'true'
