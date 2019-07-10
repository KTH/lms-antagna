const log = require('../logger')

/** Functions to get Canvas-ready enrollments */
module.exports = {
  async toRemoveAntagna (period, { kopps, canvas }) {
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
            sisCourseId: round.sis_id,
            userId: 'xxx',
            role: 'Admitted not registered',
            status: 'deleted'
          })
        }
      } catch (e) {
        log.warn(e, `${progress}. Error in [${round.sis_id.padStart(12)}]`)
      }
    }

    log.info(`Total students enrolled as "antagna" in ${period} course rounds: ${allEnrollments.length}`)
    return allEnrollments
  }
}
