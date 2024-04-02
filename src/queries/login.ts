import http2 from 'http2-wrapper'
import { requester } from './requester'

export type CheckIsSlotAvailableRequestPayload = {
  username: string
  password: string
  captcha_api_key: string
  captcha_version: string
  countrycode: string
  missioncode: string
}

export const login = async ({
  data,
  agent,
}: {
  data: Omit<CheckIsSlotAvailableRequestPayload, 'countrycode' | 'missioncode' | 'captcha_version'>
  agent: http2.proxies.Http2OverHttps
}) => {
  return requester<CheckIsSlotAvailableRequestPayload>({
    path: '/user/login',
    data: {
      ...data,
      countrycode: 'blr',
      missioncode: 'pol',
      captcha_version: 'v2',
    },
    agent,
  })
}
