import { BaseEntity } from 'typeorm'
import { toPlainObjectRecursive } from 'src/utils/misc'

export type SimpleOrmObject<T extends BaseEntity> = Omit<T, 'save' | 'hasId' | 'addId' | 'reload' | 'remove'>

export function typeOrmEntityToPlainObject<T extends BaseEntity>(entity: T): SimpleOrmObject<T> {
  return toPlainObjectRecursive(entity) as SimpleOrmObject<T>
}

export function typeOrmEntitiesToPlainObjects<T extends BaseEntity>(entities: T[]): SimpleOrmObject<T>[] {
  return entities.map(typeOrmEntityToPlainObject)
}
