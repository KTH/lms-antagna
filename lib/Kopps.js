const got = require('got')
const log = require('../logger')

module.exports = function Kopps (apiUrl = 'https://kth.se/api/kopps/v2') {
  return {
    async getCourseRounds (period) {
      const { body: courseRounds } = await got({
        baseUrl: apiUrl,
        url: '/courses/offerings',
        json: true,
        query: {
          from: period.koppsTerm(),
          skip_coordinator_info: true
        }
      })

      const cleanCourseRounds = courseRounds
        .filter(c => c.state)
        .filter(c => c.first_period)
        .filter(c => c.offering_id !== undefined)
        .filter(c => c.first_semester)
        .filter(c => c.course_code)

      if (cleanCourseRounds.length < courseRounds.length) {
        log.warn(`Response from KOPPS: Found ${courseRounds.length - cleanCourseRounds.length} course rounds without the properties [state, first_period, offering_id, first_semester, course_code]. They will be ignored`)
      }

      return cleanCourseRounds
        .filter(c => c.state === 'Godkänt' || c.state === 'Fullsatt')
        .filter(c => c.first_period === period.koppsPeriod())
        .map(c => ({
          sis_id: `${c.course_code}${c.first_semester}${c.offering_id}`
        }))
    }
  }
}
