import http2 from 'http2-wrapper'
import { requester } from './requester'

export type CheckIsSlotAvailableRequestPayload = {
  countryCode: string
  missionCode: string
  vacCode: string
  visaCategoryCode: string
  loginUser: string
  roleName: string
  payCode: string
}

export const checkIsSlotAvailable = async ({
  token,
  data,
  agent,
}: {
  token: string
  data: Omit<CheckIsSlotAvailableRequestPayload, 'countryCode' | 'missionCode' |'roleName' | 'payCode'>
  agent: http2.proxies.Http2OverHttps
}) => {
  return requester<CheckIsSlotAvailableRequestPayload>({
    path: '/appointment/CheckIsSlotAvailable',
    token,
    data: {
      ...data,
      countryCode: 'blr',
      missionCode: 'pol',
      roleName: 'Individual',
      payCode: '',
    },
    agent,
  })
}
