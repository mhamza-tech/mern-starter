import { mapS3KeyToImgixImageUrl } from 'src/graphql/models'

function resolve(name: string): string {
  return mapS3KeyToImgixImageUrl(`news/${name}.png`)
}

export const NewsBackgrounds = {
  hashtribute_unlock_level: resolve('backgrounds/UnlockBG'),
  hashtribute_general: resolve('backgrounds/HashtributeBG'),
  PurpleCircles: resolve('backgrounds/purple_circles'),
  SolidYellow: resolve('backgrounds/yellow'),
  PowWithGreenBackground: resolve('backgrounds/pow_1.1'),
  PowWithBlueBackground: resolve('backgrounds/pow_2.1'),
  OMGLightBlueBackground: resolve('backgrounds/omg_1'),
  WelcomeBanner1: resolve('backgrounds/welcome_1'),
  WelcomeBalloons1: resolve('backgrounds/welcome_2'),
  RedFade: resolve('backgrounds/red_1'),
}

export const NewsOverlays = {
  hashtribute_unlock: resolve('Unlock'),
  hashtribute: resolve('Hashtribute'),
}
