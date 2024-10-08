/**
 * @rob4lderman
 * aug2019
 *  
 */
import { expect } from 'chai'
import { describe, it, before } from 'mocha'
import { authService } from '../services'
import { sf } from '../utils'
import { isTestLive } from './utils'

describe('test:authService', async () => {
  before(function () {
    if (!!!isTestLive()) {
      this.skip()
    }
  })

  it('authService:ready', () => {
    return authService.ready_gql()
      .then(sf.tap(res => expect(res.errors).to.be.undefined))
      .then(res => res.data.ready)
      .then(sf.tap(ready => expect(ready).to.equal('OK')))
  })
})
