require('dotenv').config({})
const cron = require('./cron')
const log = require('./logger')
const server = require('./server')

log.createLogger({
  app: 'lms-antagna',
  name: 'lms-antagna',
  level: process.env.NODE_ENV === 'development' ? 'trace' : 'info'
})

log.info([
  `App started.`,
  `PROXY_PATH=${process.env.PROXY_PATH}`,
  `CANVAS_API_URL=${process.env.CANVAS_API_URL}`,
  `UG_URL=${process.env.UG_URL}`,
  `KOPPS_API_URL=${process.env.KOPPS_API_URL}`
].join('\n'))

log.context({ request_type: 'express' }, () => {
  server.listen(process.env.PORT || 3000, () => {
    log.info(`Express server started!`)
  })
})

log.context({ request_type: 'cron' }, () => {
  log.info('Cron job is going to start')
  cron.start()
})
