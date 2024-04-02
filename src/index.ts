import { MonitorBot } from "./MonitorBot"

let group1 = {
  visas: [
    { vacCode: 'LID', visaCategoryCode: 'PDV' },
    { vacCode: 'LID', visaCategoryCode: 'PDV' },
    { vacCode: 'LID', visaCategoryCode: 'PDV' },
  ],
  requestsInterval: 4800,
  id: 'group1',
  proxies: [
    {url: 'http://sleepparalysissss:uieu1a5403@pl2-2.mproxy.top:47026', change_ip_url: 'https://api.mproxy.top/change_ip/sleepparalysissss_47026'}
  ]
}


const start = () => {
  const monitorBot = new MonitorBot(2)

  monitorBot.addGroupMonitoring(group1)

  monitorBot.on('slots', console.log)
}

start()