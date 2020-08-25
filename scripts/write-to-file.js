require('dotenv').config()
const log = require('skog')
function consoleLogger () {
  return {
    debug (msg) {
      console.log(msg)
    },
    info (msg) {
      console.log(msg)
    },
    warn (msg) {
      console.error(msg)
    },
    error (msg) {
      console.error(msg)
    },
    child () {
      return consoleLogger()
    }
  }
}
log.logger = consoleLogger()

const Period = require('../lib/period')
const CURRENT_PERIOD = Period(process.env.PERIOD)
const file = require('../lib/file')
const getEnrollments = require('../lib/get-enrollments')

async function start () {
  console.log(
    'This is the "write-to-file" script.\n\n' +
    `It will generate CSV files for REMOVING antagna for period ${CURRENT_PERIOD.prevPeriod()}\n` +
    `and ADDING antagna for period ${CURRENT_PERIOD}\n\n` +
    'Please change the env variable "PERIOD" if you want different periods to be handled'
  )

  const enr1 = await getEnrollments.toRemoveAntagna(CURRENT_PERIOD.prevPeriod())
  const enr2 = [] //await getEnrollments.toAddAntagna(CURRENT_PERIOD)

  file.writeEnrollments(`/tmp/enrollments-antagna-${CURRENT_PERIOD}.csv`, [...enr1, ...enr2])
}

start()
