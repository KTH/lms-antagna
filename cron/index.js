const { scheduleJob } = require('node-schedule')
const log = require('../logger')
const Period = require('../lib/Period')
const getEnrollments = require('../lib/getEnrollments')
const canvas = require('../lib/Canvas')
const cuid = require('cuid')

// "0 5 * * *" = "Every day at 5:00"
const INTERVAL = process.env.INTERVAL || '0 5 * * *'

const PERIOD = Period(process.env.PERIOD || '2019-HT-P1')

async function sync () {
  // Start a new context
  await log.context({ req_id: cuid() }, async () => {
    log.info(`Starting sync for period ${PERIOD}`)
    try {
      const enr1 = await getEnrollments.toRemoveAntagna(PERIOD.prevPeriod())
      const enr2 = await getEnrollments.toAddAntagna(PERIOD)

      await canvas.sendEnrollments([...enr1, ...enr2])
    } catch (err) {
      log.error(err, `Error in sync for period ${PERIOD}`)
    }
    log.info(`Finish sync for period ${PERIOD}`)
  })
}

module.exports.start = async function start () {
  const job = scheduleJob(INTERVAL, async () => {
    await sync()
    log.info(`Next sync is scheduled for: ${job.nextInvocation()}`)
  })
  await sync()
  log.info(`Next sync is scheduled for: ${job.nextInvocation()}`)
}
