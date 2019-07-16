/**
 * Singleton object, wrapping `@kth/canvas-api`. Exposes specific functions for this app.
 */
const log = require('../logger')
const CanvasApi = require('@kth/canvas-api')
const csv = require('fast-csv')
const tempy = require('tempy')
const fs = require('fs')

const canvasApi = CanvasApi(process.env.CANVAS_API_URL, process.env.CANVAS_API_TOKEN)

module.exports = {
  /** Return enrolled people as "Admitted not registered" in a given section SIS ID */
  async getAntagna (sectionSisId) {
    const enrollments = await canvasApi
      .list(
        `/sections/sis_section_id:${sectionSisId}/enrollments`,
        { role: ['Admitted not registered'] }
      )
      .toArray()

    const cleanedEnrollments = enrollments
      .filter(e => e.sis_user_id)
      .map(e => ({ sis_user_id: e.sis_user_id }))

    if (enrollments.length > cleanedEnrollments.length) {
      log.warn(`There are ${enrollments.length - cleanedEnrollments.length} people without SIS ID enrolled as "antagna" in section [${sectionSisId}]`)
    }

    return cleanedEnrollments
  },

  /** Send enrollments to Canvas using a CSV file */
  async sendEnrollments (enrollments) {
    const validEnrollments = enrollments
      .filter(e => e.sis_user_id && e.sis_section_id && e.status)

    if (enrollments.length > validEnrollments.length) {
      log.warn(`There are ${enrollments.length - validEnrollments.length} enrollments that are not going to be sent to Canvas due to incorrect formatting. Please check what you send to "Canvas.sendEnrollments"`)
    }

    const file = tempy.file({ name: 'enrollments.csv' })
    const writer = fs.createWriteStream(file)
    log.debug(`Created tmp file [${file}]`)

    const stream = csv.format({ headers: true })
    stream.pipe(writer)

    enrollments.forEach(e => stream.write(e))
    stream.end()

    await new Promise((resolve, reject) => {
      writer.on('error', reject)
      writer.on('finish', resolve)
    })

    log.debug(`File [${file}] ready to be sent to Canvas`)

    const { body: response } = await canvasApi.sendSis('/accounts/1/sis_imports', file)
  }
}
