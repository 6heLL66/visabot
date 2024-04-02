export type VisaType = {
  vacCode: string
  visaCategoryCode: string
}

export type Proxy = {
  url: string
  change_ip_url: string
}

export type VisaTypesGroup = {
  visas: VisaType[]
  proxies: Proxy[]
  id: string
  requestsInterval: number
}

export type MonitorBotHandlers = {
  slots?: () => void;
  error?: (message: string) => void;
}
