const { scheduleJob } = require('node-schedule')
const log = require('../logger')
const Period = require('../lib/Period')

// "0 5 * * *" = "Every day at 5:00"
const INTERVAL = process.env.INTERVAL || '0 5 * * *'

const PERIOD = Period(process.env.PERIOD || '2019-HT-P1')

async function sync () {
  // Start a new context
  log.context({ start_time: new Date() }, () => {
    log.info(`Starting sync for period ${PERIOD}`)
    log.info('Finishing sync...')
  })
}

module.exports.start = async function start () {
  await sync()
  scheduleJob(INTERVAL, () => sync())
}
