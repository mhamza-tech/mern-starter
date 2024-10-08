import { deepFreeze, cloneDeep } from 'src/utils/misc'
import { TileTemplate } from 'src/types'
import { itemTileTemplate } from './assets'

export const grabTileTemplate = (s3Key : string, isDeleted?: boolean) : TileTemplate => {
  const template = cloneDeep(itemTileTemplate)
  template.metadata.image.s3Key = s3Key
  template.isDeleted = isDeleted
  return deepFreeze<TileTemplate>(template)
}

// WIP
// export const rockPaperScissorsTileTemplate = (rockS3Key : string, paperS3Key : string, scissorsS3Key : string, isDeleted?: boolean) : TileTemplate => {
//   const template = cloneDeep(rockPaperScissorsAnimationEffect)
//   template.metadata.animationSequence.animations[0].sprite.s3Key = rockS3Key
//   template.metadata.animationSequence.animations[1].sprite.s3Key = paperS3Key
//   template.metadata.animationSequence.animations[2].sprite.s3Key = scissorsS3Key
//   template.isDeleted = isDeleted
//   return deepFreeze<TileTemplate>(template)
// }
