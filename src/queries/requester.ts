import http2, { IncomingHttpHeaders } from 'http2-wrapper'
import { base_headers } from './constants'

function isJsonString(str: string) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

export const requester = <T extends Record<string, string>>({
  path,
  data,
  token,
  agent,
}: {
  path: string
  token?: string
  data: T
  agent: http2.proxies.Http2OverHttps
}) => {
  return new Promise((res, rej) => {
    const headers: IncomingHttpHeaders = {
      ...base_headers,
      'content-length': JSON.stringify(data).length as  unknown as string,
    }

    if (token) {
      headers.authorize = token
    }

    const req = http2.request(
      {
        hostname: 'lift-api.vfsglobal.com',
        protocol: 'https:',
        method: 'POST',
        agent,
        path,
        headers: headers,
      },
      (response: http2.IncomingMessage) => {
        let body: Uint8Array[] = []

        response.on('data', (chunk: Buffer) => {
          body.push(chunk)
        })

        response.on('end', () => {
          const validJson = isJsonString(Buffer.concat(body).toString())

          if (validJson) {
            res(JSON.parse(Buffer.concat(body).toString()))
          } else {
            res(Buffer.concat(body).toString())
          }
        })
      },
    )

    req.on('error', rej)

    req.end(JSON.stringify(data))
  })
}
