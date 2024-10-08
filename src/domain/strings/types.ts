export interface StringRow<Tag> {
  id: number
  string: string
  tags: Readonly<Tag[]>
}
