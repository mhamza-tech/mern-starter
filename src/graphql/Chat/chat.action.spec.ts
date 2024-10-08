import { npcHasNameString, searchNpcsByName } from './chat.actions.util'

describe('Npc search util', () => {
  const TestData = [
    { username: 'frogman', name: 'fz' },
    { username: 'Kitchen Sink', name: 'kitchens' },
    { username: 'kitchen Sink 2', name: 'kitchens2' },
  ] as any[]

  it('should search npc object', () => {
    expect(npcHasNameString('frog')(TestData[0])).toBeTruthy()
    expect(npcHasNameString('fz')(TestData[0])).toBeTruthy()
    expect(npcHasNameString('kitchen sink')(TestData[1])).toBeTruthy()
    expect(npcHasNameString('kitchen')(TestData[1])).toBeTruthy()
  })

  it('should search npc group', () => {
    expect(searchNpcsByName('frog')(TestData)).toEqual([
      { username: 'frogman', name: 'fz' },
    ])

    expect(searchNpcsByName('kitchen')(TestData)).toEqual([
      { username: 'Kitchen Sink', name: 'kitchens' },
      { username: 'kitchen Sink 2', name: 'kitchens2' },
    ])
  })
})
