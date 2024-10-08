import { parseBoolean } from './env'

describe('misc tools', () => {
  it('should parse string to boolean', done => {
    expect(parseBoolean('true')).toEqual(true)
    expect(parseBoolean('1')).toEqual(true)

    expect(parseBoolean('false')).toEqual(false)
    expect(parseBoolean('0')).toEqual(false)

    done()
  })
})
