const log = require('../logger')
const canvas = require('./Canvas')
const kopps = require('./Kopps')
const ug = require('./Ug')

/** Functions to get Canvas-ready enrollments */
module.exports = {
  /** Get an array of "unenrollments" of all antagna students in a given period */
  async toRemoveAntagna (period) {
    const courseRounds = await kopps.getCourseRounds(period)
    log.info(`Course rounds for un-antagna in ${period}: ${courseRounds.length}`)

    const allEnrollments = []
    let nRound = 0
    for (const round of courseRounds) {
      nRound++
      const progress = `${nRound}/${courseRounds.length}`.padStart(7)

      try {
        const roundEnrollments = await canvas.getAntagna(round.sis_id)
        log.debug(`${progress}. Antagna found in [${round.sis_id.padStart(12)}] : ${roundEnrollments.length}`)

        for (const e of roundEnrollments) {
          allEnrollments.push({
            section_id: round.sis_id,
            user_id: e.sis_user_id,
            status: 'deleted'
          })
        }
      } catch (e) {
        log.warn(e, `${progress}. Error in [${round.sis_id.padStart(12)}]`)
      }
    }

    log.info(`Total students enrolled as "antagna" in ${period} course rounds: ${allEnrollments.length}`)
    return allEnrollments
  },

  /** Get an array of antagna "enrollments" in a given period */
  async toAddAntagna (period) {
    const courseRounds = await kopps.getCourseRounds(period)
    log.info(`Course rounds for enroll antagna in ${period}: ${courseRounds.length}`)

    const allEnrollments = []
    let nRound = 0
    for (const round of courseRounds) {
      nRound++
      const progress = `${nRound}/${courseRounds.length}`.padStart(7)
      log.debug(`${progress}. [${round.sis_id.padStart(12)}]`)
    }

    ug.getAntagna(round.course_code, period.koppsTerm(), round.round_id)

    return allEnrollments
  }
}
