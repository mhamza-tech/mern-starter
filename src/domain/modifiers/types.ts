
export interface BaseModifier<Id> {
  id: Id
  name: string
  operation?: 'Transfer' | 'Destroy'
  description?: string
}
