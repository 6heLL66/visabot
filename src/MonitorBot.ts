import http2 from 'http2-wrapper'

import { checkIsSlotAvailable } from './queries/checkIsSlotAvailable'
import { MonitorBotHandlers, Proxy, VisaTypesGroup } from './types'

import pg from 'pg';
import { login } from './queries/login';

const client = new pg.Client({
  user: 'visabot_owner',
  host: 'ep-dry-cake-a2ir0a20.eu-central-1.aws.neon.tech',
  database: 'visabot',
  password: '1gxPSYKG0phk',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  }
})

const MAX_REQUESTS = 30;

export class MonitorBot {
  groups: VisaTypesGroup[]
  token: string
  loginUser: string
  concurrentRequests: number
  proxyExpired: Record<string, number>
  agents: Record<string, http2.proxies.Http2OverHttps>
  handlers: MonitorBotHandlers
  db_connected: boolean

  constructor(concurrentRequests = 2) {
    this.groups = []
    this.token = ''
    this.loginUser = ''
    this.agents = {}
    this.proxyExpired = {}
    this.concurrentRequests = concurrentRequests
    this.handlers = {}

    this.db_connected = false

    this.updateToken()
  }

  private log = (message: any) => {
    console.log(message)
  }

  private setAgent = (groupId: string, proxy: Proxy) => {
    if (this.agents[groupId]) {
      this.agents[groupId].destroy();
    }

    this.agents[groupId] = new http2.proxies.Http2OverHttps({
      proxyOptions: {
        url: proxy.url,
      },
    }) 
  }

  public addGroupMonitoring = (group: VisaTypesGroup) => {
    this.groups.push(group)
    group.proxies.forEach((proxy) => {
      this.proxyExpired[proxy.url] = 0
    })

    this.monitor(group.id)
  }

  private updateToken = async () => {
    if (!this.db_connected) {
      await client.connect()
      this.db_connected = true
    }
    let row = (await client.query('SELECT * FROM tokens ORDER BY email ASC')).rows[0];

    this.token = row.token
    this.loginUser = row.email
  }

  private changeProxyIp = async (proxy: Proxy, shouldWait: boolean) => {
    if (shouldWait) {
      await fetch(proxy.change_ip_url)
    } else {
      fetch(proxy.change_ip_url)
    }
    
    this.proxyExpired[proxy.url] = 0
  }

  private wait = async (time: number) => {
    return new Promise(r => setTimeout(r, time))
  }

  private monitor = async (groupId: string) => {
    const group = this.groups.find(g => g.id === groupId)

    
    if (!group) {
      throw Error('Group not found')
    }

    const proxy = group?.proxies.sort((a, b) => this.proxyExpired[b.url] - this.proxyExpired[a.url])[0]

    this.setAgent(groupId, proxy)

    await this.auth('wbefuq@mailto.plus', 'Qf5TiYh377pkp1B9QNXe7nPhJYGhwNSEUXO864LvoNCn0FPqG4DSj4V8wIetOiOipydyMDYIYooqVLKuhEnWp6s9uofIkjRHF6Cqn/ZkbmwuW9DShOZJDNuYB9jevLLNzs/CiTSiBIQVoEIt+G4jMussOHlJG+kdgcb3TPxZ6BI=', 'fjbrngekngekmkl')
    return;

    const timeMark = Date.now()

    for (
      let i = 0;
      i < Math.ceil(group.visas.length / this.concurrentRequests);
      i += this.concurrentRequests
    ) {
      const requestsData = group.visas.slice(i, i + this.concurrentRequests)

      const responses = await Promise.all(
        requestsData.map(data => checkIsSlotAvailable({
          token: this.token,
          data: {
            ...data,
            loginUser: this.loginUser
          },
          agent: this.agents[group.id],
        })),
      )

      this.proxyExpired[proxy.url] += responses.length
      
      await this.handleResponses(responses)
    }

    if (this.proxyExpired[proxy.url] + this.concurrentRequests > MAX_REQUESTS) {
      await this.changeProxyIp(proxy, group.proxies.length > 1)
    }

    let timePast = Date.now() - timeMark

    if (timePast < group.requestsInterval) {
      await this.wait(group.requestsInterval - timePast)
    }

    this.monitor(group.id)
  }

  public on = (handlerName: keyof MonitorBotHandlers , cb: () => void) => {
    this.handlers[handlerName] = cb
  }

  public auth = async (username, password, captcha_api_key) => {
    console.log(this.agents)
    const response = await login({ data: {username, password, captcha_api_key}, agent: Object.values(this.agents)[0]})

    this.log(response)
  }

  private handleResponses = async (responses: any[]) => {
    responses.forEach((response, index) => {
      this.log(response)

      if (response.error) {
        return;
      }
    
      if (response.status === 200) {
        this.handlers.slots?.()
      }
    })

    if (responses.some(res => res.status === 401)) {
      await this.updateToken()
    }
  }
}
