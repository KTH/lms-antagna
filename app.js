require('dotenv').config({})
const cron = require('./cron')
const log = require('./logger')
const server = require('./server')
const { stdSerializers } = require('bunyan')

log.createLogger({
  app: 'lms-antagna',
  name: 'lms-antagna',
  level:
    process.env.NODE_ENV === 'development'
      ? 'trace'
      : process.env.LOG_LEVEL || 'info',
  serializers: stdSerializers
})

log.info(
  [
    `App started with the following env variables (secrets are not shown)`,
    `PROXY_PATH=${process.env.PROXY_PATH}`,
    `CANVAS_API_URL=${process.env.CANVAS_API_URL}`,
    `UG_URL=${process.env.UG_URL}`,
    `KOPPS_API_URL=${process.env.KOPPS_API_URL}`
  ].join('\n')
)

log.context({ trigger: 'http' }, () => {
  server.listen(process.env.PORT || 3000, () => {
    log.info(`Express server started!`)
  })
})

log.context({ trigger: 'cron' }, () => {
  cron.start()
})
