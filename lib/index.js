const log = require('skog')
const canvas = require('./canvas')
const kopps = require('./kopps')
const ug = require('./ug')

/**
 * Get students that are enrolled in Canvas as antagna in a given period
 */
async function getCanvasAntagna (period) {
  const courseRounds = await kopps.getCourseRounds(period)
  log.info(`Course rounds in ${period}: ${courseRounds.length}`)

  const allEnrollments = []
  let nRound = 0
  for (const round of courseRounds) {
    nRound++
    const progress = `${nRound}/${courseRounds.length}`.padStart(7)

    try {
      const roundEnrollments = await canvas.getAntagna(round.sis_id)
      log.debug(
        `CANVAS: ${progress}. Antagna found in [${round.sis_id.padStart(
          12
        )}] : ${roundEnrollments.length}`
      )

      for (const e of roundEnrollments) {
        allEnrollments.push({
          section_id: round.sis_id,
          user_id: e.sis_user_id
        })
      }
    } catch (err) {
      if (err.name === 'HTTPError' && err.statusCode === 404) {
        log.warn(
          err,
          `CANVAS: ${progress}. Error. [${round.sis_id.padStart(12)}] not found`
        )
      } else {
        err.message =
          `CANVAS: Error when getting enrollments in [${round.sis_id}]: ` +
          err.message
        throw err
      }
    }
  }

  log.info(
    `CANVAS: Total antagna students in ${period}: ${allEnrollments.length}`
  )
  return allEnrollments
}

/**
 * Get students that are officially antagna in a given period (according to
 * KTH internal services, UG and Kopps)
 */
async function getOfficialAntagna (period) {
  const courseRounds = await kopps.getCourseRounds(period)
  log.info(
    `Course rounds for enroll antagna in ${period}: ${courseRounds.length}`
  )
  const allEnrollments = []
  let nRound = 0
  for (const round of courseRounds) {
    nRound++
    const progress = `${nRound}/${courseRounds.length}`.padStart(7)

    try {
      const kthIds = await ug.getAntagna(
        round.course_code,
        period.koppsTerm(),
        round.round_id
      )
      log.debug(
        `UG: ${progress}. Antagna found for [${round.sis_id.padStart(12)}]: ${
          kthIds.length
        }`
      )

      for (const id of kthIds) {
        allEnrollments.push({
          section_id: round.sis_id,
          user_id: id
        })
      }
    } catch (err) {
      err.message =
        `UG: Error when getting antagna for [${round.sis_id}]: ` + err.message
      throw err
    }
  }

  log.info(`UG: Total "antagna" in ${period}: ${allEnrollments.length}`)
  return allEnrollments
}

async function syncAntagna (period) {
  const enr1 = (await getCanvasAntagna(period.prevPeriod())).map(e => ({
    section_id: e.section_id,
    user_id: e.user_id,
    status: 'deleted',
    role_id: canvas.ANTAGNA_ID
  }))

  const enr2 = await getOfficialAntagna(period).map(e => ({
    section_id: e.section_id,
    user_id: e.user_id,
    status: 'active',
    role_id: canvas.ANTAGNA_ID
  }))

  await canvas.sendEnrollments([...enr1, ...enr2])
}

module.exports = {
  getCanvasAntagna,
  getOfficialAntagna,
  syncAntagna
}
