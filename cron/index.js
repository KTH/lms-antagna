const { scheduleJob } = require('node-schedule')
const log = require('skog')
const Period = require('../lib/period')
const getEnrollments = require('../lib/get-enrollments')
const canvas = require('../lib/canvas')
const cuid = require('cuid')

if (!process.env.PERIOD) {
  throw new Error(
    'The environmental variable "PERIOD" should be set to run this app.'
  )
}

// "0 5 * * *" = "Every day at 5:00"
const INTERVAL = process.env.INTERVAL || '0 5 * * *'

// "0,30 * * * *" = "Every 30 minutes (at X:00 and X:30)"
const FAILURE_INTERVAL = '0,30 * * * *'

const PERIOD = Period(process.env.PERIOD)
let job
let running = false

// How many times has the sync failed consecutively
let consecutiveFailures = 0

async function sync () {
  if (running) {
    return
  }

  running = true

  await log.child({ req_id: cuid() }, async () => {
    log.info(`Starting sync for period ${PERIOD}`)
    try {
      const enr1 = await getEnrollments.toRemoveAntagna(PERIOD.prevPeriod())
      const enr2 = await getEnrollments.toAddAntagna(PERIOD)

      await canvas.sendEnrollments([...enr1, ...enr2])

      log.info(`Finish sync successfully for period ${PERIOD}`)
      job.reschedule(INTERVAL)
      consecutiveFailures = 0
    } catch (err) {
      consecutiveFailures++

      if (consecutiveFailures > 5) {
        log.fatal(err, 'Sync has failed more than 5 times in a row.')
        consecutiveFailures = 0
        job.reschedule(INTERVAL)
      } else {
        job.reschedule(FAILURE_INTERVAL)
        log.error(
          err,
          `Error in sync for period ${PERIOD}. It has failed ${consecutiveFailures} times in a row. Will try again on: ${job.nextInvocation()}`
        )
      }
    }
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
