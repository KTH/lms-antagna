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

      return enrollments
    }
  }
}
