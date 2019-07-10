require('dotenv').config({})
const cron = require('./cron')
const log = require('./logger')

log.createLogger({
  name: 'lms-antagna'
})

log.context({ request_type: 'cron' }, () => {
  log.info('Cron job is going to start')
  cron.start()
})

log.info('App is running')
