export interface BaseHashtribute<Id> {
  id: Id
  displayName: string
  description: string
  thumbImageS3Key: string
  silent: boolean
}
