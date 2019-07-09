const { scheduleJob } = require('node-schedule')
const log = require('../logger')

// "0 5 * * *" = "Every day at 5:00"
const INTERVAL = process.env.INTERVAL || '0 5 * * *'

async function sync () {
  // Start a new context
  log.context({ start_time: new Date() }, () => {
    log.info('Starting sync...')
    log.info('Finishing sync...')
  })
}

module.exports.start = async function start () {
  await sync()
  scheduleJob(INTERVAL, () => sync())
}
