/**
 * @rob4lderman
 * jan2020
 *  
 */

import { ActionStubSetMap } from '../types'

/** 
 * Mapping from state => action set
 */
export const stateActionGroups = {
  'state.casino.pickacard': [
    'action.casino.leftcard',
    'action.casino.centercard',
    'action.casino.rightcard',
  ],
  'state.casino.pickacard.bonus': [
    'action.casino.leftcard',
    'action.casino.centercard',
    'action.casino.rightcard',
    'action.casino.bonusleftcard',
    'action.casino.bonusrightcard',
  ],
  'state.casino.start': [
    'action.casino.bet5',
    'action.casino.bet10',
    'action.casino.bet20',
  ],
}

export const stateActionStubSets: ActionStubSetMap = {
  'state.casino.pickacard': {
    staticActionNames: [
      'action.casino.leftcard',
      'action.casino.centercard',
      'action.casino.rightcard',
    ],
    actionInstanceNames: [],
  },
  'state.casino.pickacard.bonus': {
    staticActionNames: [
      'action.casino.leftcard',
      'action.casino.centercard',
      'action.casino.rightcard',
      'action.casino.bonusleftcard',
      'action.casino.bonusrightcard',
    ],
    actionInstanceNames: [],
  },
  'state.casino.start': {
    staticActionNames: [
      'action.casino.bet5',
      'action.casino.bet10',
      'action.casino.bet20',
    ],
    actionInstanceNames: [],
  },
}

/** 
 * List of local actions ("local" == defined only in this chatroom).
 */
export const localActionNames = [
  'action.casino.leftcard',
  'action.casino.centercard',
  'action.casino.rightcard',
  'action.casino.bonusleftcard',
  'action.casino.bonusrightcard',
  'action.casino.bet5',
  'action.casino.bet10',
  'action.casino.bet20',
]
