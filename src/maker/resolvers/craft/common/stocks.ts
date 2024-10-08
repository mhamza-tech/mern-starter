import stocks from 'lodash'
import { Item } from 'src/domain/items'
import { cloneDeep } from 'src/utils/misc'
import { SimpleActionXInstanceObject } from 'src/db/entity/ActionXInstance'

/** Helper module to aggregate list of items into counters */

type Stock = { [string: string]: number }
type Unit = SimpleActionXInstanceObject | Item | string

const prune = (stock: Stock): Stock => {
  return stocks.pickBy(stock, count => count !== 0)
}

const merge = (stock1: Stock, stock2: Stock, sign: number): Stock => {
  const stock = cloneDeep(stock1)
  for (const name in stock2) {
    stock[name] = (stock[name] || 0) + stock2[name] * sign
  }
  return prune(stock)
}

export const from = (units: Unit[]): Stock => {
  return stocks.countBy(units, (unit) => (
    stocks.isString(unit) ? unit :
      'name' in unit ? unit.name : unit.actionName
  ))
}

export const add = (stock1: Stock, stock2: Stock): Stock => {
  return merge(stock1, stock2, +1)
}

export const sub = (stock1: Stock, stock2: Stock): Stock => {
  return merge(stock1, stock2, -1)
}

export const isComplete = (stock: Stock): boolean => {
  return stocks.every(stock, count => count === 0)
}

export const isMissingAny = (stock: Stock): boolean => {
  return stocks.some(stock, count => count < 0)
}
