/**
 * @rob4lderman
 * aug2019
 */

import _ from 'lodash'

const adj1s = [
  'little',
  'big', 
  'bright', 
  'dark',
  'very tactful',
  'happy',
  'fresh',
  'friendly',
  'funny',
  'odd',
  'lucky',
]

const adj2s = [
  'red',
  'yellow',
  'blue',
  'hairless',
  'wild',
  'green',
  'orange',
  'purple',
]

const nouns = [
  'butterfly',
  'frog',
  'arddvvaarkk',
  'dog',
  'duck',
  'panda',
  'giraffe',
  'zebra',
  'potato',
  'seal',
  'pony',
  'bird',
  'squirrel',
  'sea lion',
  'octupus',
  'penguin',
  'hawk',
]

export const buildAnonymousDisplayName = (): string => {
  // return _.startCase( `${_.sample(adj1s)} ${_.sample(adj2s)} ${_.sample(nouns)}` );
  return _.startCase(`${_.sample(_.union(adj1s, adj2s))} ${_.sample(nouns)}`)
}
