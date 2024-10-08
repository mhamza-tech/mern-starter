import { Image } from '../../db/entity/Image'
import { Database } from './Database'
import { v4 } from 'uuid'
import { S3 } from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

const Busboy = require('busboy')
const s3 = new S3()
const database = new Database()

interface IUploadResponse {
  statusCode: number
  body: string
  isBase64Encoded: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler = (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return parseFormData(event)
    .then(parsedData => {
      const { files } = parsedData

      if (!files.length) return createResponseObject('No files were uploaded.', 400)

      const s3Promises: Promise<{ metadata: S3.ManagedUpload.SendData; fileName: string; contentType: string }>[] = files.map(file => {
        const fileName = buildFilename(file.fileName)
        return s3.upload({
          Body: file.file,
          Bucket: process.env.IMAGES_BUCKET,
          Key: `avatar/${fileName}`,
          ACL: 'public-read',
          ContentType: file.contentType,
        }).promise()
          .then(metadata => {
            return {
              metadata,
              fileName,
              contentType: file.contentType,
            }
          })
          .catch(err => {
            console.error(err)
            return undefined
          })
      })

      return Promise
        .all(s3Promises)
        .then(a => a.filter(Boolean)) // remove any items that failed to upload
        .then(s3Items => {
          const id = v4()
          const itemsToSaveInDb = s3Items.map(resolved => {
            return {
              id,
              origImageId: id,
              userId: v4(), // TODO generate random user id for now
              storageService: 'S3',
              dimensions: 'orig',
              mimetype: resolved.contentType,
              name: resolved.fileName,
              metadata: resolved.metadata,
            }
          })

          return database
            .getConnection()
            .then(connection => connection
              .getRepository(Image)
              .insert(itemsToSaveInDb)
              .then(() => itemsToSaveInDb.map(b => b.metadata.Key)))
        })
        .then(s3Keys => {
          console.log(`Uploaded and saved ${s3Keys.length} entries to the database`)
          return createResponseObject({ s3Keys }, 200)
        }).catch(err => {
          console.error(err)
          return createResponseObject({ s3Keys: [] }, 500)
        })
    })
}

const createResponseObject = (body: any, statusCode: number): IUploadResponse => {
  return {
    statusCode,
    body: JSON.stringify(body),
    isBase64Encoded: false,
  }
}

const parseFormData = (event: APIGatewayProxyEvent): Promise<any> => {
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({
      headers: {
        ...event.headers,
        'content-type': event.headers['Content-Type'] || event.headers['content-type'],
      },
    })
    const result = { files: [] }

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      file.on('data', (data) => {
        result.files.push({
          file: data,
          fileName: filename,
          contentType: mimetype,
        })
      })
    })
    busboy.on('field', (fieldname, value) => {
      try {
        result[fieldname] = JSON.parse(value)
      } catch (err) {
        result[fieldname] = value
      }
    })
    busboy.on('error', (error) => reject(`Parse error: ${error}`))
    busboy.on('finish', () => {
      resolve(result)
    })
    busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary')
    busboy.end()
  })
}

const buildFilename = (fileName: string): string => {
  const extIndex = fileName.lastIndexOf('.')
  const name = fileName.substr(0, extIndex)
  const ext = fileName.substr(extIndex + 1)
  const now = new Date().toISOString()
  // format YYYYMMDD.HHmmss.SSS
  const formatted = now.split('T').join('.')
    .split(':').join('')
    .split('-').join('')
    .replace('Z', '')
  return `${name}_${formatted}.${ext}`
}
