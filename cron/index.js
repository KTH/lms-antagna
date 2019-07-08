const { scheduleJob } = require('node-schedule')

// "0 5 * * *" = "Every day at 5:00"
const INTERVAL = process.env.INTERVAL || '0 5 * * *'

async function sync () {
  console.log('Starting sync...')
  console.log('Finishing sync...')
}

module.exports.start = async function start () {
  await sync()
  scheduleJob(INTERVAL, sync)
}
