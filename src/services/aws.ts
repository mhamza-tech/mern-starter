/**
 * @rob4lderman
 * dec2019
 */

import {
  UNREAL_AWS_ACCESS_KEY,
  UNREAL_AWS_SECRET_ACCESS_KEY,
  UNREAL_AWS_S3_BUCKET,
} from '../env'
import _ from 'lodash'
import * as AWS from 'aws-sdk'

AWS.config.update({ region: 'us-west-1' })

const s3 = new AWS.S3({
  accessKeyId: UNREAL_AWS_ACCESS_KEY,
  secretAccessKey: UNREAL_AWS_SECRET_ACCESS_KEY,
  region: 'us-west-1',
  signatureVersion: 'v4',
})

export const mapS3KeyToSignedUrl = (s3Key: string): string | null => {
  return _.isEmpty(s3Key)
    ? null
    : s3.getSignedUrl('getObject', { Bucket: UNREAL_AWS_S3_BUCKET, Key: s3Key })
}

export const mapS3KeyToPublicUrl = (s3Key: string): string | null => {
  return _.isEmpty(s3Key)
    ? null
    : `https://${UNREAL_AWS_S3_BUCKET}.s3-us-west-2.amazonaws.com/${s3Key}`
}

export const isAbsolute = (uriOrS3Key: string): boolean => {
  return uriOrS3Key?.includes('://')
}

export const toPublicUrl = (uriOrS3Key: string): string | null => {
  return isAbsolute(uriOrS3Key) ? uriOrS3Key : mapS3KeyToPublicUrl(uriOrS3Key)
}

export const listAvatarKeys = (): Promise<string[]> => {
  return listFiles('avatar').then(keys => (
    keys.filter(key => key.includes('.png'))
  ))
}

export const listFiles = (dir: string): Promise<string[]> => {
  const prefix = `${dir}/`
  return s3
    .listObjects({ Bucket: UNREAL_AWS_S3_BUCKET, Prefix: prefix })
    .promise()
    .then(b => b.Contents.map(a => a.Key).filter(key => key !== prefix))
}

export const upload = (key: string, body: AWS.S3.Body, opts: Partial<AWS.S3.PutObjectRequest> = {}): Promise<AWS.S3.ManagedUpload.SendData> => {
  return s3.upload({ Bucket: UNREAL_AWS_S3_BUCKET, Key: key, Body: body, ACL: 'public-read', ...opts }).promise()
}
