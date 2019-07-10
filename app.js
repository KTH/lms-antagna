require('dotenv').config({})
const cron = require('./cron')
const log = require('./logger')

log.createLogger({
  name: 'lms-antagna',
  level: process.env.NODE_ENV === 'development' ? 'trace' : 'info'
})

log.context({ request_type: 'cron' }, () => {
  log.info('Cron job is going to start')
  cron.start()
})

log.info('App is running')
