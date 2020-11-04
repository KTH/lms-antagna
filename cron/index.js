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

// Read `.env.in` for more information about the "PERIOD" env var
const currentPeriod = Period.fromString(process.env.PERIOD)

let job
let running = false

// How many times has the sync failed consecutively
let consecutiveFailures = 0

async function sync () {
  if (running) {
    log.error('Previous sync has not finished yet. Maybe the app has hung?')
    return
  }

  running = true

  await log.child({ req_id: cuid() }, async () => {
    try {
      const removeRange = Period.range(currentPeriod, -5, -1)
      const addRange = Period.range(currentPeriod, 0, 5)
      log.info(
        `Starting sync. Current: ${currentPeriod}\n- Remove [${removeRange}] \n- Add    [${addRange}]`
      )
      const enrollments = []

      for (const period of removeRange) {
        enrollments.push(...(await getEnrollments.toRemoveAntagna(period)))
      }

      for (const period of addRange) {
        enrollments.push(...(await getEnrollments.toAddAntagna(period)))
      }

      await canvas.sendEnrollments(enrollments)

      log.info(`Sync finished.`)
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
          `Error in sync. It has failed ${consecutiveFailures} times in a row. Will try again on: ${job.nextInvocation()}`
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
