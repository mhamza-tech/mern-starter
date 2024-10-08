// import _ from 'lodash'
import { justBkg, buildDreaming, buildTrumpHat, actionOnSubject, actionOnSubjectWithOverlay, textboxStyle1 } from './imgix'
import * as imgix from './imgix'
// import { NewsBacgrounds } from 'src/maker/news'
// import { Move } from 'src/domain/moves'

// const client = new ImgixClient({
//   domain: 'unrealfun.imgix.net',
//   secureURLToken: 'yl1FNqD6QX4AEPoXhZuxJPHx4NLYIpyq',
//   includeLibraryParam: false,
//   useHTTPS: true,
// })

// const jeffAvatarAbsoluteUri: string =
//     'https://images.ctfassets.net/k7kwi95p54k1/1HPmba5qhhyIzXwQ0rgQGp/a72e5b5e9c78950e35744310b5341bb3/RNFetchBlobTmp_2bs374ocipyhlj9xpx9e5j.png?w=424'

const jeffAvatarAbsoluteUri =
  'https://images.ctfassets.net/k7kwi95p54k1/1HPmba5qhhyIzXwQ0rgQGp/a72e5b5e9c78950e35744310b5341bb3/RNFetchBlobTmp_2bs374ocipyhlj9xpx9e5j.png'

// const partnerAvatarAbsoluteUri: string =
//     'https://images.ctfassets.net/k7kwi95p54k1/6vjdqktMuKUqFEmmDKkxtX/32151f2bcac6f00cb6de2b2bbe5e89c6/clay_munny.png?w=424'

// const partnerAvatarAbsoluteUri =
//   'https://images.ctfassets.net/k7kwi95p54k1/6vjdqktMuKUqFEmmDKkxtX/32151f2bcac6f00cb6de2b2bbe5e89c6/clay_munny.png'

// const defaultAvatarAbsoluteUri = 'http://unrealfun.imgix.net/avatar/default.png'
// const defaultAvatarRelativeUri = '/avatar/default.png'

// const partnerAvatarRelativeUri =
//   '/avatar/RNFetchBlobTmp_54oscor3boebrpmvst730v_20191219.142411.177.png'

console.log(`\n \n -----> buildDreaming:${buildDreaming('/avatar/default.png', '/object/sexy_woman_3.png')}`)

// console.log(`\n \n -----> buildTrumpHat:${buildTrumpHat('/avatar/jeff.png', '/tile/trump_hat_1.png')}`)

console.log(
  `\n \n -----> buildTrumpHat:${buildTrumpHat(
    'https://images.ctfassets.net/k7kwi95p54k1/1HPmba5qhhyIzXwQ0rgQGp/a72e5b5e9c78950e35744310b5341bb3/RNFetchBlobTmp_2bs374ocipyhlj9xpx9e5j.png',
    '/tile/trump_hat_1.png'
  )}`
)

// const x = client.buildURL('/overlay/1x1.png', {
//   w: 300,
//   h: 300,
//   fit: 'fillmax',
//   fill: 'solid',
//   'fill-color': 'lightblue',
//   border: '2,red',
//   mark64:
//     'https://images.ctfassets.net/k7kwi95p54k1/1HPmba5qhhyIzXwQ0rgQGp/a72e5b5e9c78950e35744310b5341bb3/RNFetchBlobTmp_2bs374ocipyhlj9xpx9e5j.png',
//   markalign: 'bottom,left',
// })

// console.log(
//   `

//   test: ${x}`,
// )

console.log(`\n \n -----> buildTrumpHat:${buildTrumpHat(jeffAvatarAbsoluteUri, '/tile/trump_hat_1.png')}`)

console.log(
  `\n \n -----> actionOnObject:${actionOnSubject(
    jeffAvatarAbsoluteUri,
    '/backgrounds/blood_bath_1.png',
    '/tile/troll_1.png',
    '/tile/machine_gun.png'
  )}`
)

console.log(
  `\n \n -----> actionOnSubjectWithOverlay:${actionOnSubjectWithOverlay(
    jeffAvatarAbsoluteUri,
    '/backgrounds/red_1.png',
    '/tile/troll_1.png',
    '/tile/machine_gun.png',
    '/overlay/blood_bath_2.png'
  )}`
)

console.log(
  `\n \n -----> actionOnSubjectWithOverlay_2:${actionOnSubjectWithOverlay(
    jeffAvatarAbsoluteUri,
    '/backgrounds/red_1.png',
    '/tile/troll_1.png',
    '/overlay/1x1.png',
    '/overlay/blood_bath_2.png'
  )}`
)

console.log(
  `\n \n -----> trollbeer:${actionOnSubjectWithOverlay(
    jeffAvatarAbsoluteUri,
    '/backgrounds/blue_circles.png',
    '/tile/troll_1.png',
    '/tile/beer_1.png',
    '/overlay/1x1.png'
  )}`
)

console.log(
  `\n \n -----> just overlay:${actionOnSubjectWithOverlay(
    'https://images.ctfassets.net/k7kwi95p54k1/3Paaa22pjaMJVcDFSgo7QM/7240a59f24f19377d6845eb1b9db902f/cave.png',
    '/overlay/1x1.png',
    '/overlay/1x1.png',
    '/overlay/1x1.png',
    '/overlay/crimescene.png'
  )}`
)

// console.log(
//   `\n \n -----> p2pActionAbsolute:${p2pActionAbsolute(
//     {
//       relativeUri: defaultAvatarRelativeUri,
//       absoluteUri: defaultAvatarAbsoluteUri,
//       height: .5,
//     },
//     {
//       relativeUri: defaultAvatarRelativeUri,
//       absoluteUri: defaultAvatarAbsoluteUri,
//       height: .5,
//     },
//     _.sample([
//       NewsBackgrounds.PowWithBlueBackground
//       , NewsBackgrounds.PowWithGreenBackground
//       , NewsBackgrounds.OMGLightBlueBackground,
//     ]),
//     // '/overlay/1x1.png',
//     '💨'

//   )}`
// )

console.log(
  `\n \n -----> justBkg:${justBkg(

    '/backgrounds/diamond_1.png', {}

  )}`
)

const buildPizzaCard = (actor: string, partner: string, sliceCount: number): void => {
  const plural = sliceCount > 1 ? 's' : ''

  console.log(
    `\n \n -----> pizza:${justBkg(

      '/backgrounds/pizza2.png', { text: `${sliceCount} slice${plural} in 24 hours!` }

    )}`
  )

  console.log(
    `\n \n -----> pizza empty text:${justBkg(

      '/backgrounds/pizza2.png', { text: null }

    )}`
  )
}

buildPizzaCard('Jeff', 'Rob', 20)

textboxStyle1('503D4C5F', 'I was made by someone just like you.')

imgix.textboxStyle2({
  avatarS3Key: 'avatar/RNFetchBlobTmp_2v6r4na2er6a672j3craxm_20200218.055816.729.png',
  avatarThumbBackgroundColor: 'B6EB5F',
  // txt: 'hey dude'
  txt: 'I\'m starving... can you feed me that Jelly Bean?\n\nJust drag it to me.',
})

imgix.sharedEntity('action/color/chicken_299.png', '#ffff20', 'static/basic_blue_582_20200728081535.jpg')
