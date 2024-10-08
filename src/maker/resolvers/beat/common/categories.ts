import { Category } from './types'
import { moves } from 'src/domain/moves'

export const CreepSlapper: Category = {
  deplete: true,
  tools: [moves.slap_92, moves.hit_with_anvil_7],
}

export const PuppyLover: Category = {
  deplete: false,
  tools: [moves.pet_dog_65, moves.scratch_dog_88],
}

export const PlantParent: Category = {
  deplete: false,
  tools: [moves.sunny_mist_102, moves.sweet_talk_103],
}
