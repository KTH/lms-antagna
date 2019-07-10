const log = require('../logger')

/** Functions to get Canvas-ready enrollments */
module.exports = {
  async toRemoveAntagna (period, { kopps, canvas }) {
    const courseRounds = await kopps.getCourseRounds(period)
    log.info(`Course rounds for un-antagna in ${period}: ${courseRounds.length}`)

    const allEnrollments = []
    for (const round of courseRounds) {
      const roundEnrollments = await canvas.getAntagna(round.sis_id)

      for (const e of roundEnrollments) {
        allEnrollments.push({
          sisCourseId: round.sis_id,
          userId: e.userId,
          role: 'Admitted not registered',
          status: 'deleted'
        })
      }
    }

    log.info(`Total students enrolled as "antagna" in ${period} course rounds: ${allEnrollments.length}`)
    return allEnrollments
  }
}
