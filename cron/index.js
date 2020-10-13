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

const currentPeriod = Period.fromString(process.env.PERIOD)
const START_OFFSET = -5
const END_OFFSET = 5

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
    const remove0 = currentPeriod.offset(START_OFFSET)
    const remove1 = currentPeriod.offset(-1)

    const add0 = currentPeriod
    const add1 = currentPeriod.offset(END_OFFSET)
    log.info(
      `Starting sync. Current: ${currentPeriod}\n- Remove ${remove0} to ${remove1}\n- Add    ${add0} to ${add1}`
    )

    try {
      const removeRange = Period.range(currentPeriod, START_OFFSET, -1)
      const addRange = Period.range(currentPeriod, 0, END_OFFSET)
      const enrollments = []

      for (const period of removeRange) {
        enrollments.push(...(await getEnrollments.toRemoveAntagna(period)))
      }

      for (const period of addRange) {
        enrollments.push(...(await getEnrollments.toAddAntagna(period)))
      }

      await canvas.sendEnrollments(enrollments)

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
