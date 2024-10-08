import http, { AxiosResponse } from 'axios'
import {
  sf,
  joi,
} from 'src/utils'
import { LoggerFactory } from 'src/utils/logger'
import {
  IOS_BUNDLE_ID,
  WWW_SHORT_DOMAIN,
  FB_SHORTLINK_API_KEY,
  APP_URL,
  WWW_DOMAIN,
} from 'src/env'
import Joi from '@hapi/joi'

export type DyanmicLinkSuffixes = 'SHORT' | 'UNGUESSABLE'

export interface IFirebaseDynamicLinkResponseBodyWarning {
  readonly warningCode: string
  readonly warningMessage: string
}

export interface IFirebaseDynamicLinkResponseBody {
  readonly shortLink: string
  readonly warning: IFirebaseDynamicLinkResponseBodyWarning[]
  readonly previewLink: string
}

export interface IDynamicShareAndroidInfo {
  readonly androidPackageName: string
  readonly androidFallbackLink: string
  readonly androidMinPackageVersionCode: string
}

export interface IDynamicShareNavigationInfo {
  readonly enableForcedRedirect: boolean
}

export interface IDynamicShareSocialMetaTagInfo {
  readonly socialTitle: string
  readonly socialDescription: string
  readonly socialImageLink: string
}

export interface IDynamicShareGooglePlayAnalytics {
  readonly utmSource: string
  readonly utmMedium: string
  readonly utmCampaign: string
  readonly utmTerm: string
  readonly utmContent: string
  readonly gclid: string
}

export interface IDynamicShareItunesConnectAnalytics {
  readonly at: string
  readonly ct: string
  readonly mt: string
  readonly pt: string
}

export interface IDynamicShareAnalyticsInfo {
  readonly googlePlayAnalytics: IDynamicShareGooglePlayAnalytics
  readonly itunesConnectAnalytics: IDynamicShareItunesConnectAnalytics
}

export interface IDynamicShareIosInfo {
  readonly iosBundleId: string
  readonly iosFallbackLink: string
  readonly iosCustomScheme: string
  readonly iosIpadFallbackLink: string
  readonly iosIpadBundleId: string
  readonly iosAppStoreId: string
}

export interface IDynamicLinkInfo {
  readonly domainUriPrefix: string
  readonly link: string
  readonly androidInfo: IDynamicShareAndroidInfo
  readonly iosInfo: Partial<IDynamicShareIosInfo>
  readonly navigationInfo: IDynamicShareNavigationInfo
  readonly analyticsInfo: IDynamicShareAnalyticsInfo
  readonly socialMetaTagInfo: IDynamicShareSocialMetaTagInfo
}

export interface IDynamicLinkSuffix {
  readonly option: DyanmicLinkSuffixes
}

export interface IFirebaseDynamicLinkRequestBody {
  readonly dynamicLinkInfo: Partial<IDynamicLinkInfo>
  readonly suffix: IDynamicLinkSuffix
}

export interface PrivateLink {
  readonly senderEid: string
  readonly smsGreeting: string
  readonly socialDescription?: string
  readonly socialImageLink: string
  readonly socialTitle: string
}

export interface MediaLink {
  readonly eid: string
  readonly username: string
  readonly socialDescription: string
  readonly socialImageLink: string
  readonly socialTitle: string
}

interface LinkRequest {
  linkInfo: MediaLink | PrivateLink
  shortLink: string
  fullLink: string
  fallbackLink: string
  forceRedirect: boolean
}

export class SocialSharingService {

  constructor(private readonly loggingEnabled = true) {}

  private logger = LoggerFactory(SocialSharingService.name, 'GraphQL')

  public static FB_SHORTLINK_API_PATH = 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks'
  public static FB_SHORTLINK_API_POST_URL = `${SocialSharingService.FB_SHORTLINK_API_PATH}?key=${FB_SHORTLINK_API_KEY}`

  private requestBody = (request: LinkRequest): IFirebaseDynamicLinkRequestBody => {
    return {
      dynamicLinkInfo: {
        domainUriPrefix: request.shortLink,
        link: request.fullLink,
        iosInfo: {
          iosBundleId: IOS_BUNDLE_ID,
          iosFallbackLink: request.fallbackLink,
        },
        navigationInfo: {
          enableForcedRedirect: request.forceRedirect,
        },
        socialMetaTagInfo: {
          socialDescription: request.linkInfo.socialDescription,
          socialImageLink: request.linkInfo.socialImageLink,
          socialTitle: request.linkInfo.socialTitle,
        },
      },
      suffix: {
        option: 'SHORT',
      },
    }
  }

  private privateLinkBody = (privateLink: PrivateLink): IFirebaseDynamicLinkRequestBody => {
    const schema = Joi.object<PrivateLink>({
      senderEid: Joi.string().required(),
      smsGreeting: Joi.string().required(),
      socialDescription: Joi.string().allow(''),
      socialImageLink: Joi.string().required(),
      socialTitle: Joi.string().required(),
    }).required()
      .messages({ 'any.required': 'A SocialLinkObject is required to create a request body.' })
    joi.validate(privateLink, schema)

    const baseLink = `https://${APP_URL}`
    const link = `${baseLink}/?type=chat&playerEid=${privateLink.senderEid}`
    const fallbackLink = `${baseLink}/${privateLink.senderEid}`
    return this.requestBody({
      linkInfo: privateLink,
      shortLink: `https://${WWW_SHORT_DOMAIN}`,
      fullLink: link,
      fallbackLink,
      forceRedirect: true,
    })
  }

  private mediaLinkBody = (mediaLink: MediaLink): IFirebaseDynamicLinkRequestBody => {
    const schema = Joi.object<MediaLink>({
      eid: Joi.string().required(),
      username: Joi.string().required(),
      socialDescription: Joi.string().allow(''),
      socialImageLink: Joi.string().required(),
      socialTitle: Joi.string().required(),
    }).required()
      .messages({ 'any.required': 'A SocialLinkObject is required to create a request body.' })
    joi.validate(mediaLink, schema)
    const baseLink = `https://${WWW_DOMAIN}`
    const link = `${baseLink}/?type=chat&playerEid=${mediaLink.eid}&username=${mediaLink.username}`
    const fallbackLink = `${baseLink}/${mediaLink.username}`
    return this.requestBody({
      linkInfo: mediaLink,
      shortLink: `https://${WWW_SHORT_DOMAIN}`,
      fullLink: link,
      fallbackLink,
      forceRedirect: true,
    })
  }

  private requestUrlFromFirebase = (body: IFirebaseDynamicLinkRequestBody): Promise<IFirebaseDynamicLinkResponseBody> => {
    return http.post<IFirebaseDynamicLinkResponseBody>(SocialSharingService.FB_SHORTLINK_API_POST_URL, body)
      .then(sf.tap((r: AxiosResponse<IFirebaseDynamicLinkResponseBody>) => {
        if (Array.isArray(r.data.warning) && r.data.warning.length) {
          if (this.loggingEnabled) this.logger.warn('Sharing service returned a warning with response', r.data.warning)
        }
      }))
      .then((r: AxiosResponse<IFirebaseDynamicLinkResponseBody>) => r.data)
  }

  private fetchShortUrl = (body: IFirebaseDynamicLinkRequestBody): Promise<string> => {
    return this.requestUrlFromFirebase(body)
      .then(resp => resp.shortLink)
  }

  public fetchShortUrlForPrivateLink = (link: PrivateLink): Promise<string> => {
    const body = this.privateLinkBody(link)
    return this.fetchShortUrl(body)
  }

  public fetchShortUrlForMediaLink = (link: MediaLink): Promise<string> => {
    const body = this.mediaLinkBody(link)
    return this.fetchShortUrl(body)
  }

}
