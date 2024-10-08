// https://cooltext.com/Render-Image?RenderID=343619159450514&LogoId=3436191594

import ImgixClient from 'imgix-core-js'
import _ from 'lodash'
// import { LoggerFactory } from 'src/utils/logger'
import { IMGIX_API_KEY, IMGIX_CDN_ROOT_URL } from '../env'

// const logger = LoggerFactory('imgix')

const client = new ImgixClient({
  domain: IMGIX_CDN_ROOT_URL,
  secureURLToken: IMGIX_API_KEY,
  includeLibraryParam: false,
  useHTTPS: true,
})

export { client as ImgixClient }

/**
 *
 * @param avatarURI
 * @param dreamOfUri
 *
 * Supports exporting of a 4:3 ratio image
 * 1x = 283x212
 * 3x = 849x636
 *
 */
export const buildDreaming = (relativeAvatarURI: string, dreamOfUri: string): string => {
  const BUBBLE_WIDTH = 270
  const CANVAS_WIDTH = 283 * 3,
    CANVAS_HEIGHT = 212 * 3

  const composite = client.buildURL('/backgrounds/purple_circles.png', {
    w: CANVAS_WIDTH,
    h: CANVAS_HEIGHT,
    bg: 'lightblue',
    // fit: "fillmax",
    fit: 'crop',

    mark64: client.buildURL('/overlay/1x1.png', {
      w: CANVAS_WIDTH,
      h: CANVAS_HEIGHT,
      fit: 'fillmax',
      fill: 'solid',
      // "fill-color": "lightblue",
      // border: "2,red",

      //   mark64: client.buildURL(avatarURI, {
      //     w: CANVAS_WIDTH * 0.5,
      //     fit: 'fillmax',
      //     fill: 'solid',
      //   }),
      mark64: relativeAvatarURI,
      markalign: 'bottom,left',

      blend64: client.buildURL('/overlay/though_bubble_1.png', {
        w: BUBBLE_WIDTH,
        // h: 100,
        // border: "5,yellow",
        fit: 'fillmax',
        bg: '00FFFFFF',
        blend64: client.buildURL(dreamOfUri, {
          // w: 100,
          h: 0.4 * BUBBLE_WIDTH,
          // border: "2,red",
          fit: 'fillmax',
          bg: '00FFFFFF',
        }),
        // bw: CANVAS_WIDTH - 0.1 * CANVAS_WIDTH,
        bx: 110,
        by: 20,
        bm: 'normal',
        bf: 'max',
      }),
      bx: CANVAS_WIDTH - BUBBLE_WIDTH - 10,
      by: 10,
      // ba: "top,right",
      bm: 'normal',
      bf: 'max',
    }),
    markx: 0,
    marky: 0,

    // mark64: client.buildURL(avatarURI, {
    //   w: CANVAS_WIDTH * 0.5,
    //   h: CANVAS_HEIGHT * 0.5,
    //   fit: "fillmax",
    //   fill: "solid",
    //   // "fill-color": "lightblue",
    //   border: "2,000000",

    // }),
    // markalign: "bottom,left"
  })

  return `${composite}`
}

/**
 *
 * @param absoluteAvatarURI full path for the image
 * @param dreamOfUri relative path within the imgix root
 *
 * Supports exporting of a 4:3 ratio image
 * 1x = 283x212
 * 3x = 849x636
 *
 */
export const buildTrumpHat = (absoluteAvatarURI: string, tileUri: string): string => {
  const CANVAS_WIDTH = 283 * 3
  const CANVAS_HEIGHT = 212 * 3
  const TILE_WIDTH = CANVAS_WIDTH / 2

  const composite = client.buildURL('/backgrounds/blue_circles.png', {
    w: CANVAS_WIDTH,
    h: CANVAS_HEIGHT,
    bg: 'lightblue',
    // fit: "fillmax",
    fit: 'crop',

    mark64: client.buildURL('/overlay/1x1.png', {
      w: CANVAS_WIDTH,
      h: CANVAS_HEIGHT,
      fit: 'fillmax',
      fill: 'solid',
      // "fill-color": "lightblue",
      // border: "2,red",

      mark64: client.buildURL('/overlay/1x1.png', {
        w: CANVAS_WIDTH,
        h: CANVAS_HEIGHT,
        fit: 'fillmax',
        fill: 'solid',
        // mark64: client.buildURL(avatarURI, {
        //   w: CANVAS_WIDTH * 0.5,
        //   fit: 'fillmax',
        //   fill: 'solid',
        // }),
        mark64: absoluteAvatarURI,
        markalign: 'bottom,center',

        blend64: client.buildURL('/object/trump_doll.png', {
          w: 0.4 * CANVAS_WIDTH,
          // h: 100,
          // border: "5,yellow",
          fit: 'fillmax',
          bg: '00FFFFFF',
        }),
        // bx: CANVAS_WIDTH - TILE_WIDTH - 10,
        // by: 10,
        ba: 'top,left',
        bm: 'normal',
        bf: 'max',
      }),
      markx: 0,
      marky: 0,

      blend64: client.buildURL(tileUri, {
        w: TILE_WIDTH,
        // h: 100,
        // border: "5,yellow",
        fit: 'fillmax',
        bg: '00FFFFFF',
      }),
      // bx: CANVAS_WIDTH - TILE_WIDTH - 10,
      // by: 10,
      ba: 'top,right',
      bm: 'normal',
      bf: 'max',
    }),
    markx: 0,
    marky: 0,
  })

  return `${composite}`
}

/**
 *
 * @param absoluteAvatarURI full path for the image
 * @param dreamOfUri relative path within the imgix root
 *
 * Supports exporting of a 4:3 ratio image
 * 1x = 283x212
 * 3x = 849x636
 *
 */
export const actionOnSubject = (
  absoluteAvatarURI: string,
  relativeBackgroundUri: string,
  relativeSubjectTileUri: string,
  relativeActionTileUri: string
): string => {
  const CANVAS_WIDTH = 283 * 3
  const CANVAS_HEIGHT = 212 * 3
  const TILE_WIDTH = CANVAS_WIDTH / 2

  const composite = client.buildURL(relativeBackgroundUri, {
    w: CANVAS_WIDTH,
    h: CANVAS_HEIGHT,
    bg: 'lightblue',
    // fit: "fillmax",
    fit: 'crop',

    mark64: client.buildURL('/overlay/1x1.png', {
      w: CANVAS_WIDTH,
      h: CANVAS_HEIGHT,
      fit: 'fillmax',
      fill: 'solid',
      // "fill-color": "lightblue",
      // border: "2,red",

      mark64: client.buildURL('/overlay/1x1.png', {
        w: CANVAS_WIDTH,
        h: CANVAS_HEIGHT,
        fit: 'fillmax',
        fill: 'solid',
        // mark64: client.buildURL(avatarURI, {
        //   w: CANVAS_WIDTH * 0.5,
        //   fit: 'fillmax',
        //   fill: 'solid',
        // }),
        mark64: absoluteAvatarURI,
        markalign: 'bottom,left',

        blend64: client.buildURL(relativeActionTileUri, {
          w: 0.4 * CANVAS_WIDTH,
          // h: 100,
          //   border: '5,yellow',
          fit: 'fillmax',
          bg: '00FFFFFF',
        }),
        // bx: CANVAS_WIDTH - TILE_WIDTH - 10,
        // by: 10,
        ba: 'top,left',
        bm: 'normal',
        bf: 'max',
      }),
      markx: 0,
      marky: 0,

      blend64: client.buildURL(relativeSubjectTileUri, {
        w: TILE_WIDTH,
        // h: 100,
        // border: '5,yellow',
        fit: 'fillmax',
        bg: '00FFFFFF',
      }),
      // bx: CANVAS_WIDTH - TILE_WIDTH - 10,
      // by: 10,
      ba: 'top,right',
      bm: 'normal',
      bf: 'max',
    }),
    markx: 0,
    marky: 0,
  })

  return `${composite}`
}

export const actionOnSubjectWithOverlay = (
  absoluteAvatarURI: string,
  relativeBackgroundUri: string,
  relativeSubjectTileUri: string,
  relativeActionTileUri: string,
  relativeOveralyUri: string
): string => {
  const CANVAS_WIDTH = 283 * 3
  const CANVAS_HEIGHT = 212 * 3
  const TILE_WIDTH = CANVAS_WIDTH / 2

  const composite = client.buildURL(`/${relativeBackgroundUri}`, {
    w: CANVAS_WIDTH,
    h: CANVAS_HEIGHT,
    fit: 'crop',

    blend64: client.buildURL('/overlay/1x1.png', {
      w: CANVAS_WIDTH,
      h: CANVAS_HEIGHT,
      fit: 'fillmax',
      fill: 'solid',
      // "fill-color": "lightblue",
      // border: "2,red",

      mark64: client.buildURL('/overlay/1x1.png', {
        w: CANVAS_WIDTH,
        h: CANVAS_HEIGHT,
        fit: 'fillmax',
        fill: 'solid',
        // mark64: client.buildURL(avatarURI, {
        //   w: CANVAS_WIDTH * 0.5,
        //   fit: 'fillmax',
        //   fill: 'solid',
        // }),
        mark64: absoluteAvatarURI,
        markalign: 'bottom,left',

        blend64: client.buildURL(`/${relativeActionTileUri}`, {
          w: 0.4 * CANVAS_WIDTH,
          // h: 100,
          //   border: '5,yellow',
          fit: 'fillmax',
          bg: '00FFFFFF',
        }),
        // bx: CANVAS_WIDTH - TILE_WIDTH - 10,
        // by: 10,
        ba: 'top,left',
        bm: 'normal',
        bf: 'max',
      }),
      markx: 0,
      marky: 0,

      blend64: client.buildURL(`/${relativeSubjectTileUri}`, {
        w: TILE_WIDTH,
        // h: 100,
        // border: '5,yellow',
        fit: 'fillmax',
        bg: '00FFFFFF',
      }),
      // bx: CANVAS_WIDTH - TILE_WIDTH - 10,
      // by: 10,
      ba: 'top,right',
      bm: 'normal',
      bf: 'max',
    }),
    bx: 0,
    by: 0,
    bm: 'normal',
    bf: 'max',
    mark64: client.buildURL(`/${relativeOveralyUri}`, {
      //   border: '5,yellow',
      w: CANVAS_WIDTH,
      bg: '00FFFFFF',
      fit: 'fillmax',
      fill: 'solid',
    }),
    markx: 0,
    marky: 0,
  })

  return `${composite}`
}

export interface Avatar {
  relativeUri?: string
  absoluteUri?: string
  height: number
}

export const p2pFartAction = (
  actorAvatar: Avatar,
  partnerAvatar: Avatar,
  relativeBackgroundUri: string
): string => {
  const CANVAS_WIDTH = 283 * 3
  const CANVAS_HEIGHT = 212 * 3
  // const TILE_WIDTH = CANVAS_WIDTH / 2

  const composite = client.buildURL(relativeBackgroundUri, {
    w: CANVAS_WIDTH,
    h: CANVAS_HEIGHT,
    fit: 'crop',

    blend64: client.buildURL('/overlay/1x1.png', {
      w: CANVAS_WIDTH,
      h: CANVAS_HEIGHT,
      fit: 'fillmax',
      fill: 'solid',
      // "fill-color": "lightblue",
      // border: "2,red",

      mark64: client.buildURL('/overlay/1x1.png', {
        w: CANVAS_WIDTH,
        h: CANVAS_HEIGHT,
        fit: 'crop',

        // border: "3,green",

        mark64: client.buildURL('/overlay/1x1.png', {
          w: CANVAS_WIDTH,
          h: CANVAS_HEIGHT,
          fit: 'crop',
          // border: "1,black",
          mark64: client.buildURL(actorAvatar.relativeUri, {

            h: CANVAS_HEIGHT * actorAvatar.height,
            fit: 'crop',
            // markh: 100, //CANVAS_HEIGHT * actorAvatar.height,
            // markfit: 'clip',
            // fill: 'solid',
            // border: "1,blue",
            // mark64: actorAvatar.uri,
            // markalign: 'middle,left',
          }),
          // markx: 50,
          // marky: 0,
          markalign: 'middle,left',
          blend64: client.buildURL(actorAvatar.relativeUri, {
            h: CANVAS_HEIGHT * actorAvatar.height,
            fit: 'crop',
            fill: 'solid',
            // border: "1,red",

          }),
          blendalign: 'middle,right',
          bm: 'normal',
          bf: 'max',

        }),
        markx: 0,
        marky: 0,

      }),
      markx: 0,
      marky: 0,

    }),
    bx: 0,
    by: 0,
    bm: 'normal',
    bf: 'max',

    mark64: client.buildURL('/~text', {
      'txt-size': 128,
      'txt-pad': 40,
      'txt-color': 'ffffff',
      'txt-align': 'bottom,center',
      'txt-font': 'Avenir+Next+Condensed,Bold',
      txt:
        '💨',
      w: 600,
      // h: 300,
      bg: '00FFFFFF',
      // mark: "/overlay/hashtag_fun.png",
      // markscale: 41,
      // markalign: "top,left"
    }),
    markalign: 'middle,center',
    // mark64: client.buildURL(relativeOveralyUri, {
    //     //   border: '5,yellow',
    //     w: CANVAS_WIDTH,
    //     bg: '00FFFFFF',
    //     fit: 'fillmax',
    //     fill: 'solid',
    // }),
    // markx: 0,
    // marky: 0,
  })

  return `${composite}`
}

// export const p2pFartActionAbsolute = (
export const p2pActionAbsolute = (
  actorAvatar: Avatar,
  partnerAvatar: Avatar,
  relativeBackgroundUri: string,
  // relativeSubjectTileUri: string,
  // relativeActionTileUri: string,
  actionText: string
  // relativeOveralyUri: string,
): string => {
  const CANVAS_WIDTH = 283 * 3
  const CANVAS_HEIGHT = 212 * 3
  // const TILE_WIDTH = CANVAS_WIDTH / 2

  const composite = client.buildURL(`/${relativeBackgroundUri}`, {
    w: CANVAS_WIDTH,
    h: CANVAS_HEIGHT,
    fit: 'crop',

    blend64: client.buildURL('/overlay/1x1.png', {
      w: CANVAS_WIDTH,
      h: CANVAS_HEIGHT,
      fit: 'fillmax',
      fill: 'solid',
      // "fill-color": "lightblue",
      // border: "2,red",
      mark64: client.buildURL('/overlay/1x1.png', {
        w: CANVAS_WIDTH,
        h: CANVAS_HEIGHT,
        fit: 'crop',
        // ------ border: "3,green"
        mark64: client.buildURL('/overlay/1x1.png', {
          w: CANVAS_WIDTH,
          h: CANVAS_HEIGHT,
          fit: 'crop',
          // border: "1,black",
          mark64: `${actorAvatar.absoluteUri}?h=${CANVAS_HEIGHT * actorAvatar.height}`,
          markalign: 'middle,left',
          blend64: `${partnerAvatar.absoluteUri}?h=${CANVAS_HEIGHT * actorAvatar.height}`,
          blendalign: 'middle,right',
          bm: 'normal',
          bf: 'max',
        }),
        markx: 0,
        marky: 0,
      }),
      markx: 0,
      marky: 0,
    }),
    bx: 0,
    by: 0,
    bm: 'normal',
    bf: 'max',

    mark64: client.buildURL('/~text', {
      'txt-size': 128,
      'txt-pad': 40,
      'txt-color': 'ffffff',
      'txt-align': 'bottom,center',
      'txt-font': 'Avenir+Next+Condensed,Bold',
      txt: actionText,
      // "💨",
      w: 600,
      // h: 300,
      bg: '00FFFFFF',
      // mark: "/overlay/hashtag_fun.png",
      // markscale: 41,
      // markalign: "top,left"
    }),
    markalign: 'middle,center',
    // mark64: client.buildURL(relativeOveralyUri, {
    //     //   border: '5,yellow',
    //     w: CANVAS_WIDTH,
    //     bg: '00FFFFFF',
    //     fit: 'fillmax',
    //     fill: 'solid',
    // }),
    // markx: 0,
    // marky: 0,
  })

  return `${composite}`
}

// export const actionOnSubjectWithOverlayDead = (
//   absoluteAvatarURI: string,
//   relativeBackgroundUri: string,
//   relativeSubjectTileUri: string,
//   relativeActionTileUri: string,
//   relativeOveralyUri: string,
//   avatarWidth: number,
// ) => {
//   const CANVAS_WIDTH = 283 * 3
//   const CANVAS_HEIGHT = 212 * 3
//   const TILE_WIDTH = CANVAS_WIDTH / 2

//   let composite = client.buildURL(relativeBackgroundUri, {
//     w: CANVAS_WIDTH,
//     h: CANVAS_HEIGHT,
//     fit: 'crop',

//     blend64: client.buildURL('/overlay/1x1.png', {
//       w: CANVAS_WIDTH,
//       h: CANVAS_HEIGHT,
//       fit: 'fillmax',
//       fill: 'solid',
//       // "fill-color": "lightblue",
//       // border: "2,red",

//       mark64: client.buildURL('/overlay/1x1.png', {
//         w: CANVAS_WIDTH,
//         h: CANVAS_HEIGHT,
//         fit: 'fillmax',
//         fill: 'solid',

//         mark64: client.buildURL('/overlay/1x1.png', {
//           w: avatarWidth,
//           //   fit: 'fillmax',
//           //   fill: 'solid',
//           border: '5,yellow',
//           mark64: `${ absoluteAvatarURI } ? w = ${ avatarWidth }`,
//           //    markalign: 'bottom,left',
//           //   rot: 90,
//         }),
//         markalign: 'bottom,left',

//         blend64: client.buildURL(relativeActionTileUri, {
//           w: 0.4 * CANVAS_WIDTH,
//           // h: 100,
//           //   border: '5,yellow',
//           fit: 'fillmax',
//           bg: '00FFFFFF',
//         }),
//         // bx: CANVAS_WIDTH - TILE_WIDTH - 10,
//         // by: 10,
//         ba: 'top,left',
//         bm: 'normal',
//         bf: 'max',
//       }),
//       markx: 0,
//       marky: 0,

//       blend64: client.buildURL(relativeSubjectTileUri, {
//         w: TILE_WIDTH,
//         // h: 100,
//         // border: '5,yellow',
//         fit: 'fillmax',
//         bg: '00FFFFFF',
//       }),
//       // bx: CANVAS_WIDTH - TILE_WIDTH - 10,
//       // by: 10,
//       ba: 'top,right',
//       bm: 'normal',
//       bf: 'max',
//     }),
//     bx: 0,
//     by: 0,
//     bm: 'normal',
//     bf: 'max',
//     mark64: client.buildURL(relativeOveralyUri, {
//       //   border: '5,yellow',
//       w: CANVAS_WIDTH,
//       bg: '00FFFFFF',
//       fit: 'fillmax',
//       fill: 'solid',
//     }),
//     markx: 0,
//     marky: 0,
//   })

//   return `${ composite }`
// }

export const justBkg = (relativeBackgroundURI: string, overlay: object): string => {
  const CANVAS_WIDTH = 283 * 3,
    CANVAS_HEIGHT = 212 * 3

  const blendOverlay = !_.isNull(_.get(overlay, 'text')) ? {
    blend64: client.buildURL('/~text', {
      fm: 'png',
      w: CANVAS_WIDTH,
      'txt-size': 64,
      'txt-pad': 10,
      'txt-color': 'DE00000',
      'txt-align': 'middle,center',
      'txt-font': 'Avenir+Next,Bold',
      txt64: _.get(overlay, 'text'),
      'txt-width': 400,
      bg: '6676725F',
    }),
    bw: CANVAS_WIDTH, // - 0.1 * CANVAS_WIDTH,
    ba: 'bottom,left',
    bm: 'normal',
    bf: 'max',
  } : {}

  const composite = client.buildURL(relativeBackgroundURI, {
    w: CANVAS_WIDTH,
    h: CANVAS_HEIGHT,
    bg: 'lightblue',
    // fit: "fillmax",
    fit: 'crop',
    ...blendOverlay,
  })

  return `${composite}`
}

export const textboxStyle1 = (bg: string, txt: string): string => {
  const messageUrl = client.buildURL('/~text', {
    'txt-size': 48,
    'txt-pad': 30,
    'txt-color': 'ffffff',
    'txt-align': 'middle,center',
    'txt-font': 'Avenir+Next+Condensed,Bold',
    txt,
    w: 600,
    h: 200,
    bg,
    // mark: "/overlay/hashtag_fun.png",
    // markscale: 41,
    // markalign: "top,left"
  })

  // console.log(`\nmessage: ${messageUrl}\n`)

  return messageUrl
}

export const avatarThumbnail = ({ avatarS3Key, avatarThumbBorderRadius, avatarThumbWidth }): string => {
  const url = client.buildURL(`/${avatarS3Key}`, {
    w: avatarThumbWidth,
    border: '1,00FFFFFF', // 00FFFFFF= 00=transparent/ffffff=white
    fit: 'contain',
    'border-radius': avatarThumbBorderRadius,
  })

  // console.log(`avatarThumbnail: ${url}`)

  return url
}

export const avatarThumbBackgroundWithAvatar = ({ avatarS3Key, avatarThumbWidth, avatarThumbBackgroundColor, avatarThumbBorderRadius, avatarThumbnail }): string => {
  const url = client.buildURL('/overlay/1x1.png', {
    w: avatarThumbWidth,
    border: '1,00FFFFFF', // 00FFFFFF= 00=transparent/ffffff=white
    fit: 'contain',
    bg: avatarThumbBackgroundColor,
    'border-radius': avatarThumbBorderRadius,
    mark64: avatarThumbnail({
      avatarS3Key,
      avatarThumbBorderRadius,
      avatarThumbWidth,
    }),
    markalign: 'center,middle',
  })

  // console.log(`avatarThumbBackgroundWithAvatar: ${url}`)

  return url
}

export const textboxStyle2 = ({ avatarS3Key, avatarThumbBackgroundColor, txt }): string => {
  const CANVAS_WIDTH = 1000
  // const CANVAS_HEIGHT = 200
  const avatarThumbWidth = 68
  const avatarThumbBorderRadius = `${avatarThumbWidth / 2},${avatarThumbWidth / 2},${avatarThumbWidth / 2},${avatarThumbWidth / 2}`
  const marginLeftMessageTextBox = 24
  const marginRightMessageTextBox = 40
  const marginLeftAvatarThumb = 20
  const messageTextBoxWidth = CANVAS_WIDTH - marginLeftAvatarThumb - avatarThumbWidth - marginLeftMessageTextBox - marginRightMessageTextBox
  const messageContainerBackgroundColor = 'A3000000'
  const messageTextBoxBackgroundColor = '00FFFFFF'/*'85354651'*/
  const messageContainerBorderRadius = `${CANVAS_WIDTH * 0.025},${CANVAS_WIDTH * 0.025},${0},${0}`

  // const avatarThumbnail = client.buildURL(`/${avatarS3Key}`, {
  //     w: avatarThumbWidth,
  //     border: '1,00FFFFFF', // 00FFFFFF= 00=transparent/ffffff=white
  //     fit: 'contain',
  //     'border-radius': avatarThumbBorderRadius
  // })

  // const avatarThumbBackground = client.buildURL(`/overlay/1x1.png`, {
  //     w: avatarThumbWidth,
  //     border: '1,00FFFFFF', // 00FFFFFF= 00=transparent/ffffff=white
  //     fit: 'contain',
  //     bg: avatarThumbBackgroundColor,
  //     'border-radius': avatarThumbBorderRadius
  // })

  // const avatarThumbBackgroundWithAvatar = client.buildURL(`/overlay/1x1.png`, {
  //     w: avatarThumbWidth,
  //     border: '1,00FFFFFF', // 00FFFFFF= 00=transparent/ffffff=white
  //     fit: 'contain',
  //     bg: avatarThumbBackgroundColor,
  //     'border-radius': avatarThumbBorderRadius,
  //     mark64: avatarThumbnail,
  //     markalign: 'center,middle',
  // })

  const messageTextBox = client.buildURL('/~text', {
    'txt-size': 42,
    'txt-pad': 0,
    'txt-color': 'ffffff',
    'txt-align': 'left,top',
    'txt-font': 'Avenir+Next+Condensed,Bold',
    txt,
    w: messageTextBoxWidth,
    bg: messageTextBoxBackgroundColor,
  })

  const messageContainer = client.buildURL('/overlay/1x1.png', {
    w: CANVAS_WIDTH,
    // h: CANVAS_HEIGHT,
    ar: '10:2',
    fit: 'crop',
    border: `1,${messageContainerBackgroundColor}`,
    // fit: 'contain',
    bg: messageContainerBackgroundColor,
    'border-radius': messageContainerBorderRadius,
    mark64: avatarThumbBackgroundWithAvatar({
      avatarS3Key,
      avatarThumbWidth,
      avatarThumbBackgroundColor,
      avatarThumbBorderRadius,
      avatarThumbnail,
    }),
    markx: marginLeftAvatarThumb,
    marky: 30,
    blend64: messageTextBox,
    bw: messageTextBoxWidth,
    bx: marginLeftAvatarThumb + avatarThumbWidth + marginLeftMessageTextBox,
    by: 28,
    bm: 'normal',
    // bf: 'clamp',
  })

  // console.log(`avatarThumbnail: ${avatarThumbnail}`);

  // console.log(`avatarThumbBackground: ${avatarThumbBackground}`);

  // console.log(`avatarThumbBackgroundWithAvatar: ${avatarThumbBackgroundWithAvatar}`);

  // console.log(`messageTextBox: ${messageTextBox}`);

  // console.log(`messageContainer: ${messageContainer}`);

  return messageContainer
}

export const genericImage = (s3Key: string, width: number): string => {
  const url = client.buildURL(`/${s3Key}`, {
    w: width,
    border: '0,00FFFFFF', // 00FFFFFF= 00=transparent/ffffff=white
    fit: 'contain',
  })

  // console.log(`avatarThumbnail: ${url}`)

  return url
}

export const sharedEntity = (entityImageS3Key: string, backgroundColor: string, backgroundImagesS3Key?: string): string => {
  const width = 900

  if (!backgroundImagesS3Key) {
    backgroundImagesS3Key = 'overlay/1x1.png'
  }

  const composedImage = client.buildURL('/overlay/1x1.png', {
    w: width,
    ar: '1:1',
    fit: 'crop',
    border: '0',
    bg: backgroundColor,
    mark64: genericImage(
      entityImageS3Key,
      width,
    ),
    markx: 0,
    marky: 0,
    blend64: genericImage(
      backgroundImagesS3Key,
      width,
    ),
    bx: 0,
    by: 0,
    bm: 'normal',
  })

  // console.log(`sharedEntity: ${composedImage}`)

  return composedImage
}
