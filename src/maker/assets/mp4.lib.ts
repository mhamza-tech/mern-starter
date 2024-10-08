import { mapS3KeyToPublicUrl } from 'src/services/aws'

function mp4Path(name: string, version = 0): string {
  const qs = version ? `?v=${version}` : ''
  return mapS3KeyToPublicUrl(`mp4/${name}.mp4${qs}`)
}

export type fileName = 'in_love_with_me' | 'welcome_hi_hello' | 'welcome_wacky_1' | 'male_symbol' | 'female_symbol' | 'welcome_1' | 'wtf_is_unreal_1' | 'another_fucking_day_get_drunk' | 'another_fucking_day_get_drunk_2'

export const getMp4Uri = (name: fileName): string => {
  // const qs = version ? `?v=${version}` : ''
  return mapS3KeyToPublicUrl(`mp4/${name}.mp4`)
}

export const NewsMP4Library = {
  tiger_milker: mp4Path('Tiger_Milker'),
}
