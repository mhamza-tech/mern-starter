import { isValidUsername, isInvalidUsername } from './user.model'

describe('Prohibited usernames', () => {
  it('should return false when using blacklisted name', () => {
    expect(isValidUsername('me')).toEqual(false)
    expect(isValidUsername('undefined')).toEqual(false)
    expect(isValidUsername('null')).toEqual(false)

    expect(isInvalidUsername('me')).toEqual(true)
    expect(isInvalidUsername('undefined')).toEqual(true)
    expect(isInvalidUsername('null')).toEqual(true)
  })

  it('should return true when using a proper name', () => {
    expect(isValidUsername('patrick')).toEqual(true)
    expect(isInvalidUsername('patrick')).toEqual(false)
  })
})
