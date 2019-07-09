const { scheduleJob } = require('node-schedule')

// "0 5 * * *" = "Every day at 5:00"
const INTERVAL = process.env.INTERVAL || '0 5 * * *'

async function sync ({log: parentLogger}) {
  const log = parentLogger.child({start_time: new Date()})
  log.info('Starting sync...')
  log.info('Finishing sync...')
}

module.exports.start = async function start ({log}) {
  await sync({log})
  scheduleJob(INTERVAL, () => sync({log}))
}
