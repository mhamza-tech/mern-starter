import axios, { AxiosResponse } from 'axios'
import _ from 'lodash'
import { gql } from 'apollo-server'
import { print } from 'graphql/language/printer'
import { serverInfo } from '../server'
import { SERVICE_URL } from 'src/env'

const assertServiceUrl = (): string => {
  if (!!!_.isEmpty(serverInfo)) {
    return serverInfo.url
  }
  if (_.isEmpty(SERVICE_URL)) {
    throw new Error('ACTIVITY_SERVICE_URL is undefined')
  }
  return SERVICE_URL
}

export const ready = async (variables: object): Promise<AxiosResponse<any>> => {
  const query = gql`
      query ready {
        ready
      }
    `
  return axios.post(assertServiceUrl(), {
    query: print(query),
    variables,
  })
}
