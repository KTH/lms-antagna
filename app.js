require('dotenv').config()
require('skog/bunyan').createLogger({
  app: 'lms-antagna',
  name: 'lms-antagna',
  level:
    process.env.NODE_ENV === 'development'
      ? 'trace'
      : process.env.LOG_LEVEL || 'info',
  serializers: require('bunyan').stdSerializers
})

const log = require('skog')
process.on('uncaughtException', err => {
  log.fatal(err, 'Uncaught Exception thrown')
  process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
  throw reason
})

require('@kth/reqvars').check()
const cron = require('./cron')
const server = require('./server')

log.info(
  [
    `App started with the following env variables (secrets are not shown)`,
    `PROXY_PATH=${process.env.PROXY_PATH}`,
    `CANVAS_API_URL=${process.env.CANVAS_API_URL}`,
    `UG_URL=${process.env.UG_URL}`,
    `KOPPS_API_URL=${process.env.KOPPS_API_URL}`
  ].join('\n')
)

log.child({ trigger: 'http' }, () => {
  server.listen(process.env.PORT || 3000, () => {
    log.info(`Express server started!`)
  })
})

log.child({ trigger: 'cron' }, () => {
  cron.start()
})
