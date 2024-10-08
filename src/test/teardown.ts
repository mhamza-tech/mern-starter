import { closeApolloServer, killPort } from '../graphql/server'
import { after } from 'mocha'
// import { push } from '../src/utils/apn'

after(async function() {
  if (process.env.TEST_LIVE === 'true') {
    console.log('teardown: TESTING LIVE')
    return
  }
  console.log('Tearing Down Mocha Tests...')
  await closeApolloServer()
  await killPort()
  // await push.apn.connection.shutdown()
  console.log('Done Tearing Down Mocha Tests!')
})
