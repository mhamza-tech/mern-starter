import { UnObject } from 'src/db/entity'

export const npcHasNameString = (s: string) => {
  return (npc: UnObject): boolean => {
    const loweredSearch = s.toLocaleLowerCase()
    const loweredUsername = npc.username.toLocaleLowerCase()
    const loweredName = npc.name.toLocaleLowerCase()

    return loweredUsername.includes(loweredSearch) || loweredName.includes(loweredSearch)
  }
}

export const searchNpcsByName = (s: string) => {
  return (npcs: UnObject[]): UnObject[] => {
    return npcs.filter(npcHasNameString(s))
  }
}
