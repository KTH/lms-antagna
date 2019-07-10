const log = require('../logger')

/** Functions to get Canvas-ready enrollments */
module.exports = {
  async toRemoveAntagna (period, { kopps }) {
    const courseRounds = await kopps.getCourseRounds(period)
    log.info(`Course rounds for un-antagna in ${period}: ${courseRounds.length}`)
  }
}
