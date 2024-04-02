import { MonitorBot } from "./src/MonitorBot"
import crypto from 'crypto'

let group1 = {
  visas: [
    { vacCode: 'LID', visaCategoryCode: 'PDV' },
    { vacCode: 'LID', visaCategoryCode: 'PDV' },
    { vacCode: 'LID', visaCategoryCode: 'PDV' },
  ],
  requestsInterval: 4800,
  id: 'group1',
  proxies: [
    {url: 'http://AEA3iPPQ:syqzWYH7@92.249.14.140:62310', change_ip_url: 'https://api.mproxy.top/change_ip/sleepparalysissss_47026'}
  ]
}


const start = () => {
  const monitorBot = new MonitorBot(2)

  

  monitorBot.addGroupMonitoring(group1)

  monitorBot.on('slots', console.log)
}

start()