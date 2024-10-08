import { parseMentionedUsers } from 'src/graphql/models'

describe('parseMentionedUsers', () => {
  it('should parse simple input', () => {
    expect(parseMentionedUsers('Hey @jeff! How is it going?')).toEqual(['jeff'])
    expect(parseMentionedUsers('Hey  @jeff! How is it going?')).toEqual(['jeff'])
    expect(parseMentionedUsers('Hey   @jeff! How is it going?')).toEqual(['jeff'])
    expect(parseMentionedUsers('Hey @jeff ! How is it going?')).toEqual(['jeff'])
    expect(parseMentionedUsers('Hey @jeff\'s ! How is it going?')).toEqual(['jeff'])
  })

  it('should parse multiple user input', () => {
    expect(parseMentionedUsers('Hey @jeff! How is it going? Did you see @nurislam the other day?')).toEqual(['jeff', 'nurislam'])
    expect(parseMentionedUsers('Hey @jeff! How is it going? Did you see @nurislam and @jacob the other day?')).toEqual(['jeff', 'nurislam', 'jacob'])
  })

  it('should parse multiline input', () => {
    expect(parseMentionedUsers(`
      Hey @jeff!
      
      How is it going? Did you see @nurislam and @jacob the other day?

      What about @fred?
    `)).toEqual(['jeff', 'nurislam', 'jacob', 'fred'])
  })

  it('should handle none', () => {
    expect(parseMentionedUsers('Hey!')).toEqual([])
  })
})
