/**
 * @rob4lderman
 * oct2019
 *  
 * EXAMPLE. 
 * 
 */

import { EffectTemplate, ActionStubSetMap, AnimationEffectMetadata } from '../types'
import { misc, sf } from '../../utils'
import { EntityScope, EffectType, AnimationType } from '../../gql-types'
import _ from 'lodash'
import { items } from 'src/domain/items'

const animationSourceUris = {
  avocadoBros: 'https://dl.dropboxusercontent.com/s/s74sy6meq77vtst/4659-avocad-bros.json',
  bouncingFruit: 'https://dl.dropboxusercontent.com/s/qj3jzdbfja0xlmo/9258-bouncing-fruits.json',
  appleBowl: 'https://dl.dropboxusercontent.com/s/z94zgmd04yb5oo5/9383-apples.json',
  greenCheck: 'https://assets10.lottiefiles.com/packages/lf20_n9uJIY.json',
  hoppingBottles: 'https://assets8.lottiefiles.com/packages/lf20_kecoMV.json',
}

export const randomAnimationUri = (): string => _.sample(_.values(animationSourceUris))

export const animationEffectTemplate = misc.deepFreeze<EffectTemplate<AnimationEffectMetadata>>({
  type: EffectType.AnimationEffect,
  scope: EntityScope.GlobalScope,
  metadata: {
    animationType: AnimationType.SourcedAnimation,
    sourceUri: '', // sourceUri set dynamically: 'https://assets10.lottiefiles.com/packages/lf20_n9uJIY.json',
  },
})

//
// Lenses (FP setters and getters)
//
export const numberValueLens = sf.lens('metadata.numberValue')
export const stringValueLens = sf.lens('metadata.stringValue')
export const sourceUriLens = sf.lens('metadata.sourceUri')
export const imageS3KeyLens = sf.lens('metadata.image.s3Key')
export const isDeletedLens = sf.lens('isDeleted')

export const standItems = {
  apple: {
    name: 'apple',
    plural: 'apples',
    animationSourceUri: animationSourceUris.appleBowl,
    aAn: 'an',  // indefinite article
  },
  orange: {
    name: 'orange',
    plural: 'oranges',
    animationSourceUri: animationSourceUris.bouncingFruit,
    aAn: 'an',
  },
  tomato: {
    name: 'tomato',
    plural: 'tomatoes',
    animationSourceUri: animationSourceUris.bouncingFruit,
    aAn: 'a',
  },
  kale: {
    name: 'kale',
    plural: 'kale',
    animationSourceUri: animationSourceUris.avocadoBros,
    aAn: 'some',
  },
  cuttingboard: {
    name: 'cutting board',
    plural: 'cutting boards',
    animationSourceUri: animationSourceUris.greenCheck,
    aAn: 'a',
  },
  knife: {
    name: 'knife',
    plural: 'knives',
    animationSourceUri: animationSourceUris.greenCheck,
    aAn: 'a',
  },
  patchouli: {
    name: 'patchouli spray',
    plural: 'patchouli sprays',
    animationSourceUri: animationSourceUris.greenCheck,
    aAn: '',
  },
  corn: {
    name: 'corn',
    plural: 'corn',
    animationSourceUri: animationSourceUris.greenCheck,
    aAn: '',
  },
  hops: {
    name: 'hops',
    plural: 'hops',
    animationSourceUri: animationSourceUris.greenCheck,
    aAn: '',
  },
}

export const staticActionNames = [
  'action.producestand.buyapple',
  'action.producestand.buykale',
  'action.producestand.buyknife',
  'action.producestand.buyhops',
  'action.producestand.buycorn',
]

export const actionInstanceNames = [
  'Action.Rewarded.Apple',
  'Action.Rewarded.Kale',
  items.knife_585.name,
  'Action.Brewery.Hops',
  'Action.Brewery.Corn',
]

export const stateActionStubSets: ActionStubSetMap = {
  'state.producestand.all': {
    staticActionNames,
    actionInstanceNames,
  },
}

export const stateActionGroups = {
  'state.producestand.all': staticActionNames,
}
