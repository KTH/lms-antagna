const cron = require('./cron')
const bunyan = require('bunyan')

const log = bunyan.createLogger({
  name: 'lms-antagna',
  app: 'lms-antagna'
})

cron.start({log})
log.info('App is running')
