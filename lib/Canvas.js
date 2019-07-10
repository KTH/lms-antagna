const log = require('../logger')
const CanvasApi = require('@kth/canvas-api')

module.exports = function Canvas (apiUrl, apiToken) {
  const canvasApi = CanvasApi(apiUrl, apiToken)

  return {
    async getAntagna (sisId) {
      const enrollments = await canvasApi
        .list(
          `/sections/sis_section_id:${sisId}/enrollments`,
          { role: ['Admitted not registered'] }
        )
        .toArray()

      const cleanedEnrollments = enrollments
        .filter(e => e.sis_user_id)
        .map(e => ({ sis_user_id: e.sis_user_id }))

      if (enrollments.length > cleanedEnrollments.length) {
        log.warn(`There are ${enrollments.length - cleanedEnrollments.length} people without SIS ID enrolled as "antagna" in section [${sisId}]`)
      }

      return cleanedEnrollments
    }
  }
}
