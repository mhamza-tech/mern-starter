import { ItemName } from 'src/domain/items'
import { MoveName } from 'src/domain/moves'
import { Modifier } from 'src/domain/modifiers'
import { gameLogic } from 'src/domain/gameLogic'

const modifiers: { [K in ItemName | MoveName]?: Modifier[] } = {}
const addModifier = (name: ItemName | MoveName, modifier: Modifier | undefined): void => {
  if (!modifier) {
    return
  }
  if (!modifiers[name]) {
    modifiers[name] = [modifier]
  } else if (!modifiers[name].includes(modifier)) {
    modifiers[name].push(modifier)
  }
}

gameLogic.forEach(entry => {
  entry.events.forEach(event => {
    if (event.type === 'onMoveTriggered') {
      addModifier(event.move, event.modifier)
    } else if (event.type === 'onItemUsed') {
      addModifier(event.item, event.modifier)
    }
  })
})

export const getModifiers = (name: ItemName | MoveName): Modifier[] => {
  return modifiers[name] || []
}

export const hasModifiers = (name: ItemName | MoveName): boolean => {
  return name in modifiers
}
