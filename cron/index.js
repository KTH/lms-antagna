const { scheduleJob } = require('node-schedule')
const log = require('../logger')
const Period = require('../lib/Period')
const getEnrollments = require('../lib/getEnrollments')
const canvas = require('../lib/Canvas')

// "0 5 * * *" = "Every day at 5:00"
const INTERVAL = process.env.INTERVAL || '0 5 * * *'

const PERIOD = Period(process.env.PERIOD || '2019-HT-P1')

async function sync () {
  // Start a new context
  log.context({ start_time: new Date() }, async () => {
    log.info(`Starting sync for period ${PERIOD}`)
    try {
      const enr1 = await getEnrollments.toRemoveAntagna(PERIOD.prevPeriod())
      const enr2 = await getEnrollments.toAddAntagna(PERIOD)

      await canvas.sendEnrollments([...enr1, ...enr2])
    } catch (err) {
      log.error(err, 'Error in sync for period ${PERIOD}')
    }
  })
}

module.exports.start = async function start () {
  await sync()
  scheduleJob(INTERVAL, () => sync())
}
