import { expect } from 'chai'
import { describe, it } from 'mocha'
import * as RootAPI from './root.test.api'

describe('root.test.ts: GraphQL', async () => {
  it('root:ready: We get a response of OK', async () => {
    const variables = {}
    const { data } = await RootAPI.ready(variables)
    expect(data.errors).to.be.undefined
    expect(data.data.ready).to.equal('OK')
  })
})
