const { scheduleJob } = require('node-schedule')
const log = require('skog')
const Period = require('../lib/Period')
const getEnrollments = require('../lib/getEnrollments')
const canvas = require('../lib/Canvas')
const cuid = require('cuid')

if (!process.env.PERIOD) {
  throw new Error(
    'The environmental variable "PERIOD" should be set to run this app.'
  )
}

// "0 5 * * *" = "Every day at 5:00"
const INTERVAL = process.env.INTERVAL || '0 5 * * *'
const PERIOD = Period(process.env.PERIOD)
let job
let running = false

async function sync () {
  if (running) {
    return
  }

  running = true
  // Start a new context
  await log.child({ req_id: cuid() }, async () => {
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
  running = false
}

async function start () {
  job = scheduleJob(INTERVAL, async () => {
    await sync()
    log.info(`Next sync is scheduled for: ${job.nextInvocation()}`)
  })
  await sync()
  log.info(`Next sync is scheduled for: ${job.nextInvocation()}`)
}

function nextSync () {
  if (job) {
    return job.nextInvocation()
  } else {
    return 'synchronization not set'
  }
}

function isRunning () {
  return running
}

module.exports = {
  start,
  nextSync,
  isRunning
}
