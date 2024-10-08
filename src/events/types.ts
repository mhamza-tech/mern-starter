import _ from 'lodash'
import { LoggerFactory } from 'src/utils/logger'

const logger = LoggerFactory('events', 'Events')

type Mapper<T, U> = (data: T) => U
type Effect<T> = Mapper<T, any>
type Condition<T> = Mapper<T, boolean>

interface Handler<T> {
  spy: boolean
  effect: Effect<T>
}

interface Child<T, U = unknown> {
  condition: Condition<T>
  mapper: Mapper<T, U>
  sub: Subscription<U>
}

// For consumers
export class Subscription<T> {

  private handlers: Handler<T>[] = []
  private children: Child<T>[] = []

  /** registers an effect to execute whenever this subscription gets data */
  public do = (effect: Effect<T>): this => {
    this.handlers.push({ spy: false, effect })
    return this
  }

  /** registers an effect that will execute but won't affect the result of handles() */
  public spy = (effect: Effect<T>): this => {
    this.handlers.push({ spy: true, effect })
    return this
  }

  private add = <U>(mapper: Mapper<T, U> = _.identity, condition: Condition<T> = _.stubTrue): Child<T, U> => {
    // Small optimization, reuse Subscriptions if possible
    const same = this.children.find(child => child.mapper === mapper && child.condition === condition)
    if (same) {
      return same as Child<T, U>
    }

    const sub = new Subscription<U>()
    const child: Child<T, U> = { mapper, condition, sub }
    this.children.push(child)
    return child
  }

  /** creates a subscription that will only trigger if it passes a filter */
  public and = (condition: Condition<T>): Subscription<T> => {
    return this.add(undefined, condition).sub as Subscription<T>
  }

  /** creates a subscription that will transform the data downstream */
  public map = <U>(mapper: Mapper<T, U>): Subscription<U> => {
    return this.add(mapper).sub
  }

  /** creates a child that subscribes to both streams */
  public or = (other: Subscription<T>): Subscription<T> => {
    const child = this.add<T>()
    other.children.push(child)
    return child.sub
  }

  /** check if any subscriber in the tree will have an effect for this data */
  public handles = (data: T): boolean => {
    return this.handlers.some(handler => !handler.spy) || this.children.some(child => (
      child.condition(data) && child.sub.handles(child.mapper(data))
    ))
  }

  protected runEffects = (data: T): any[] => {
    return this.handlers.map(handler => handler.effect(data)).concat(
      this.children
        .filter(child => child.condition(data))
        .map(child => child.sub.runEffects(child.mapper(data)))
    )
  }

}

// For producers
export class Subject<T> extends Subscription<T> {

  /** runs the data down the whole tree and monitors each returned value */
  public notify = (data: T): Promise<any> => {
    try {
      const results = this.runEffects(data)
      // Don't await, we don't want to delay the external promise chain (for now)
      Promise.all(results).catch(err => {
        // We cannot crash the promise flow or app due to rules, catch any error
        logger.warn('Async error while executing effects:', err)
      })
    } catch (err) {
      // This one catches sync errors outside the promise chain
      logger.warn('Sync error while executing effects:', err)
    }
    // Make it easy for us to return the promises and block execution in the future
    return Promise.resolve()
  }

}
