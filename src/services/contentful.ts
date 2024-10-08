/**
 * @rob4lderman
 * aug2019
 * 
 * https://www.contentful.com/developers/docs/references/images-api/
 * 
 * ENTRY:
{
  "sys": {
    "space": {
      "sys": {
        "type": "Link",
        "linkType": "Space",
        "id": "k7kwi95p54k1"
      }
    },
    "id": "5syD94dQatb3zLgTTfYVFA",
    "type": "Entry",
    "createdAt": "2019-08-23T21:00:31.537Z",
    "updatedAt": "2019-08-23T21:48:09.031Z",
    "environment": {
      "sys": {
        "id": "master",
        "type": "Link",
        "linkType": "Environment"
      }
    },
    "revision": 4,
    "contentType": {
      "sys": {
        "type": "Link",
        "linkType": "ContentType",
        "id": "stickerImage"
      }
    },
    "locale": "en-US"
  },
  "fields": {
    "description": "Fun image of a marijuana joint with stars and rainbows",
    "image": {
      "sys": {
        "type": "Link",
        "linkType": "Asset",
        "id": "5nCNeP3oPXOj0PvWmb0kBO"
      }
    },
    "tags": [
      "COLOR",
      "RATING-R",
      "ILLUSTRATION"
    ],
    "backgroundColor": "eeeeee"
  }
}

* ASSET:
{
  "sys": {
    "space": {
      "sys": {
        "type": "Link",
        "linkType": "Space",
        "id": "k7kwi95p54k1"
      }
    },
    "id": "5nCNeP3oPXOj0PvWmb0kBO",
    "type": "Asset",
    "createdAt": "2019-06-16T05:01:43.711Z",
    "updatedAt": "2019-06-16T05:01:43.711Z",
    "environment": {
      "sys": {
        "id": "master",
        "type": "Link",
        "linkType": "Environment"
      }
    },
    "revision": 1,
    "locale": "en-US"
  },
  "fields": {
    "title": "magicjoint landing@3x",
    "file": {
      "url": "//images.ctfassets.net/k7kwi95p54k1/5nCNeP3oPXOj0PvWmb0kBO/755ed11e7e787aa7b4b39b845f42a80c/magicjoint_landing_3x.png",
      "details": {
        "size": 1341647,
        "image": {
          "width": 1200,
          "height": 1200
        }
      },
      "fileName": "magicjoint_landing@3x.png",
      "contentType": "image/png"
    }
  }
}
 *
 * collections:
 * {
 *   "sys": { "type": "Array" },
 *   "skip": 0,
 *   "limit": 100,
 *   "total": 1256,
 *   "items": [ / 100 individual resources / ]
 * }
 * 
 * 
 */

import {
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_DELIVERY_API_KEY,
} from '../env'
import {
  Asset,
  Entry,
  createClient,
} from 'contentful'
import _ from 'lodash'
import {
  sf,
} from '../utils'
import { LoggerFactory } from 'src/utils/logger'

const logger = LoggerFactory('contentful')

// TODO: wrap this in try-catch?
const client = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_DELIVERY_API_KEY,
})

// -rx- const logEntry = (msg:string, entry) => logger.log( msg, JSON.stringify(entry,null,2) );

export const getEntry = (entryId: string): Promise<any> => {
  if (_.isEmpty(entryId)) {
    return null
  }
  return client.getEntry(entryId)
  // .then( sf.tap( entry => logEntry( 'getEntry', entry ) ) )
    .catch(sf.tap_throw(err => logger.error('ERROR: getEntry', { err })))
}

export const getAsset = (assetId: string): Promise<any> => {
  if (_.isEmpty(assetId)) {
    return null
  }
  return client.getAsset(assetId)
  // .then( sf.tap( asset => logEntry( 'getAsset', asset ) ) )
    .catch(sf.tap_throw(err => logger.error('ERROR: getAsset', { err })))
}

const parseImageAssetIdFromEntry = (entry: Entry<any>): string => {
  return _.result(entry, 'fields.image.sys.id')
}

export const getImageUrlForEntry = (entryId: string): Promise<string> => {
  return getEntry(entryId)
    .then((entry) => getImageUrlForAsset(parseImageAssetIdFromEntry(entry)))
    .catch(sf.tap_throw(err => logger.error('ERROR: getImageUrlForEntry', { err })))
}

export const getImageUrlForAsset = (assetId: string): Promise<string> => {
  return getAsset(assetId)
    .then((asset: Asset) => _.result(asset, 'fields.file.url') as string)
    .catch(sf.tap_throw(err => logger.error('ERROR: getImageUrlForAsset', { err })))
}

export interface EntryAsset {
  entry: Entry<any>
  asset: Asset
}

export const getEntryAndImageAsset = (entryId: string): Promise<EntryAsset> => {
  if (_.isEmpty(entryId)) {
    return Promise.resolve(null)
  }
  return getEntry(entryId)
    .then( 
      (entry: Entry<any>) => getAsset(parseImageAssetIdFromEntry(entry))
        .then((asset: Asset) => ({ entry, asset }))
    )
}
     
// const entryId = '5syD94dQatb3zLgTTfYVFA';
// const imageId = '14XuIuGZd69qemG17xlpgn';
// // retrieve all entries in space.
// client.getEntries()
//     .then( sf.tap( entries => logger.log( 'getEntries', { entries } ) ) )
//     .then( entries => entries.items )
//     .then( sf.list_fmap( entry => logEntry('getEntries', entry) ) )
//     .catch( err => logger.error( 'ERROR: getEntries', { err } ) )
//     ;
// 
// // pagination
// client.getEntries({
//     skip: 2,
//     limit: 2,
//     order: 'sys.createdAt'
// })
//     .then( sf.tap( entries => logger.log( 'getEntries.skip', { entries } ) ) )
//     .then( entries => entries.items )
//     .then( sf.list_fmap( entry => logEntry('getEntries.skip', entry) ) )
//     .catch( err => logger.error( 'ERROR: getEntries.skip', { err } ) )
// 
// // fetch assets e.g. images
// client.getAssets()
//     .then( sf.tap( assets => logger.log( 'getAssets', { assets } ) ) )
//     .then( assets => assets.items )
//     .then( sf.list_fmap( asset => logEntry('getAssets', asset) ) )
//     .catch( err => logger.error( 'ERROR: getAssets', { err } ) )
// 
// retrieve image w/ options
// TODO: const asset = client.getAsset('<asset_id>')
// TODO:   .then((asset) => logger.log(`${asset.fields.file.url}?fit=pad`))
// w=100&h=100
// fm=jpg
// fm=jpg&fl=progressive
// fit values:
//  pad: Resize the image to the specified dimensions, padding the image if needed.
//  fill: Resize the image to the specified dimensions, cropping the image if needed.
//  scale: Resize the image to the specified dimensions, changing the original aspect ratio if needed.
//  crop: Crop a part of the original image to fit into the specified dimensions.
//  thumb: Create a thumbnail from the image.
// f=face&
// focus area values: 
// center, top, right, left, bottom.
// top_right, top_left, bottom_right, bottom_left.
// face for the largest face detected.
// faces for all the faces detected.
// r=20  - rounded corners
// r=max - full circle/ellipse
// q=50   - quality between 1 - 100
// bg=rgb:ffffff  - background color if padded
