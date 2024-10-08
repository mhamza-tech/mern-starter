/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createHash } from 'crypto'
import { S3, AWSError } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'
import { Database } from './database'
import { Image } from '../../db/entity/Image'
import { v4 } from 'uuid'
import SVGO from 'svgo'
import sharp from 'sharp'
import ReactDomServer from 'react-dom/server'
import Avataaars from 'avataaars'
import React from 'react'

declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Element { }
  }
}

interface IUploadResponse {
  statusCode: number
  body: string
  isBase64Encoded?: boolean
}

interface IOutputOptions {
  readonly width: number
  readonly height: number
  readonly density: number
}

type PartilOutputOptions = Partial<IOutputOptions>

const DEFAULT_OUTPUT_OPTIONS: IOutputOptions = { width: 900, height: 900, density: 300 }

const s3 = new S3()
const database = new Database()

function optimizeSvg(svg: string): Promise<string> {
  return new SVGO()
    .optimize(svg.replace('mask="url(#mask-4)"', '')) // This fixes a bug with the renderer
    .then(a => a.data)
}

function convertSvgToPng(opts: PartilOutputOptions = {}) {
  return function (svg: string): Promise<Buffer> {
    const _opts: IOutputOptions = {
      density: opts.density || DEFAULT_OUTPUT_OPTIONS.density,
      height: opts.height || DEFAULT_OUTPUT_OPTIONS.height,
      width: opts.width || DEFAULT_OUTPUT_OPTIONS.width,
    }

    return sharp(Buffer.from(svg), { density: _opts.density })
      .resize(_opts.width, _opts.height)
      .png()
      .toBuffer()
  }
}

function convertOptimized(svg: string, opts?: PartilOutputOptions): Promise<Buffer> {
  return optimizeSvg(svg).then(convertSvgToPng(opts))
}

function uploadPng(Key: string, Bucket = process.env.IMAGES_BUCKET) {
  return function (Body: Buffer): Promise<S3.ManagedUpload.SendData> {
    return s3.upload({
      Body,
      Bucket,
      Key,
      ACL: 'public-read',
      ContentType: 'image/png',
    }).promise()
  }
}

function saveRecordToDatabase(s3Key: string) {
  return function (s3Data: S3.ManagedUpload.SendData): Promise<string> {
    const id = v4()
    const newDbRecord = {
      id,
      origImageId: id,
      userId: v4(), // TODO: generate random user id for now
      storageService: 'S3',
      dimensions: 'orig',
      mimetype: 'image/png',
      name: s3Key,
      metadata: s3Data,
    }

    return database
      .getConnection()
      .then(connection => connection
        .getRepository(Image)
        .insert(newDbRecord)
        .then(() => s3Key))
  }
}

function getHash(query: { [key: string]: string }): string {
  return createHash('md5').update(JSON.stringify(query)).digest('hex')
}

function createS3Key(hash: string, prefix = 'avatar', ext = 'png'): string {
  return `${prefix}/${hash}.${ext}`
}

function findS3Object(Key: string, Bucket = process.env.IMAGES_BUCKET): Promise<PromiseResult<S3.HeadObjectOutput, AWSError>> {
  return s3.headObject({ Key, Bucket }).promise()
}

function createAvatarString(config: { [key: string]: string }): string {
  const { width, height, ...params } = config

  return ReactDomServer.renderToString(<Avataaars {...params} style={{ width: `'${width}px'`, height: `'${height}px'` }} />)
}

function createResponseBody(s3Key: string): IUploadResponse {
  return { statusCode: 200, body: JSON.stringify({ s3Keys: [s3Key] }) }
}

function createErrorResponseBody(err: string | Error): IUploadResponse {
  return { statusCode: 500, body: err instanceof Error ? JSON.stringify(err.message) : JSON.stringify(err) }
}

function handleAlreadyExists(s3Key: string) {
  return function (): IUploadResponse {
    return createResponseBody(s3Key)
  }
}

function handleDoesNotExist(s3Key: string, avatarParams: { [key: string]: string }, outputParams: PartilOutputOptions) {
  return function (_res: PromiseResult<S3.HeadObjectOutput, AWSError>): Promise<APIGatewayProxyResult> {
    return convertOptimized(createAvatarString(avatarParams), outputParams)
      .then(uploadPng(s3Key))
      .then(saveRecordToDatabase(s3Key))
      .then(createResponseBody)
  }
}

function parseStringToNumberOrUndefined(str: string): number | undefined {
  if (!str) return undefined
  try {
    const parsed = parseInt(str, 10)

    return isNaN(parsed) ? undefined : parsed
  } catch {
    return undefined
  }
}

/**
 * 1) Extract query parameters (?=) from the http request. These are used to render the React "Avataars" component
 * 2) Hash the query params to create a unique key of the config used for storage and retrieval
 * 3) Check if this avataar has already been rendered and saved to s3.
 * 4)     if exists => write entry in DB for user using existing PNG record
 * 5)     if not exists => render to PNG, upload to s3, write entry in DB for user using existing PNG record
 * 6) Return s3 key to client
 */
export const handler = (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const query = event.queryStringParameters || {}
  const s3Key = createS3Key(getHash(query))
  const outputOpts = {
    width: parseStringToNumberOrUndefined(query.width),
    height: parseStringToNumberOrUndefined(query.height),
    density: parseStringToNumberOrUndefined(query.density),
  }

  return findS3Object(s3Key)
    .catch(handleDoesNotExist(s3Key, query, outputOpts))
    .then(handleAlreadyExists(s3Key))
    .catch(createErrorResponseBody)
}
