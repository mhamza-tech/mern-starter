import { CountdownField } from './countdown.field'
import { CountdownFieldStyle } from '../../gql-types'

describe(CountdownField.name, () => {
  it('should return field template with defaults', done => {
    const sut = new CountdownField()
    const fieldTemplate = sut.toFieldTemplate()

    expect(fieldTemplate.metadata.dangerDateTime).toBeUndefined()
    expect(fieldTemplate.metadata.warnDateTime).toBeUndefined()
    expect(fieldTemplate.metadata.startDateTime).toBeInstanceOf(Date)
    expect(fieldTemplate.metadata.expiryDateTime).toBeInstanceOf(Date)
    expect(fieldTemplate.metadata.style).toEqual(CountdownFieldStyle.Stopwatch)

    done()
  })

  it('should not let warning date exceed end date', done => {
    const sut = new CountdownField()
    const fieldTemplate = sut
      .endsIn(1, 'second')
      .warnsIn(200, 'minutes')
      .toFieldTemplate()

    const expiry = fieldTemplate.metadata.expiryDateTime
    const warning = fieldTemplate.metadata.warnDateTime

    expect(warning.getSeconds()).toBeLessThanOrEqual(expiry.getSeconds())

    done()
  })

  it('should not let danger date exceed end date', done => {
    const sut = new CountdownField()
    const fieldTemplate = sut
      .endsIn(1, 'second')
      .dangersIn(200, 'minutes')
      .toFieldTemplate()

    const expiry = fieldTemplate.metadata.expiryDateTime
    const danger = fieldTemplate.metadata.dangerDateTime

    expect(danger.getSeconds()).toBeLessThanOrEqual(expiry.getSeconds())

    done()
  })

  it('should return metadata', done => {
    const sut = new CountdownField()
    const metadata = sut
      .endsIn(1, 'second')
      .dangersIn(200, 'minutes')
      .metadata

    expect(metadata.expiryDateTime).toBeInstanceOf(Date)
    expect(metadata.dangerDateTime).toBeInstanceOf(Date)
    expect(metadata.startDateTime).toBeInstanceOf(Date)
    expect(metadata.warnDateTime).toBeUndefined()
    expect(metadata.style).toEqual(CountdownFieldStyle.Stopwatch)

    done()
  })
})
