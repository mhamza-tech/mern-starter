import { startApolloSever, killPort } from '../graphql/server'
import { before } from 'mocha'
import * as ENV from '../env'

before(async function() {
  if (process.env.TEST_LIVE === 'true') {
    console.log(`TESTING LIVE: \n${JSON.stringify(ENV, null, 2)}`)
    return
  }
  this.timeout(10000)
  console.log('Setting Up Mocha Tests...')
  await killPort()
  await startApolloSever()
  // await truncateAllTables()
  console.log('Done Setting Up Mocha Tests!')
})
