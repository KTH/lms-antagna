/**
 * Singleton object, wrapping `@kth/canvas-api`. Exposes specific functions for this app.
 */
const log = require('skog')
const CanvasApi = require('@kth/canvas-api')
const tempy = require('tempy')
const { writeEnrollments } = require('./write-file')

const canvasApi = CanvasApi(
  process.env.CANVAS_API_URL,
  process.env.CANVAS_API_TOKEN
)

module.exports = {
  /** Return enrolled people as "Admitted not registered student" in a given section SIS ID */
  async getAntagna (sectionSisId) {
    const enrollments = await canvasApi
      .list(`/sections/sis_section_id:${sectionSisId}/enrollments`, {
        role_id: [25]
      })
      .toArray()

    const cleanedEnrollments = enrollments
      .filter(e => e.sis_user_id)
      .map(e => ({ sis_user_id: e.sis_user_id }))

    if (enrollments.length > cleanedEnrollments.length) {
      log.warn(
        `CANVAS: There are ${enrollments.length -
          cleanedEnrollments.length} people without SIS ID enrolled as "antagna" in section [${sectionSisId}]`
      )
    }

    return cleanedEnrollments
  },

  /** Send enrollments to Canvas using a CSV file */
  async sendEnrollments (enrollments) {
    const file = tempy.file({ name: 'enrollments.csv' })
    log.debug(`SIS IMPORT: Created tmp file [${file}]`)
    await writeEnrollments(file, enrollments)

    log.debug(`SIS IMPORT: File [${file}] ready to be sent to Canvas`)

    const { body: response } = await canvasApi.sendSis(
      '/accounts/1/sis_imports',
      file
    )
    const url = `${process.env.CANVAS_API_URL}/accounts/1/sis_imports/${
      response.id
    }`
    log.info(
      `SIS IMPORT: correctly created with ID [${response.id}]. Details: ${url}`
    )

    let progress = 0
    let sisImport = null

    while (progress < 100) {
      sisImport = (await canvasApi.get(
        `/accounts/1/sis_imports/${response.id}`
      )).body
      progress = sisImport.progress
      log.trace(
        `SIS IMPORT [${response.id}] status "${
          sisImport.workflow_state
        }". Progress: ${progress}`
      )
    }

    if (sisImport.workflow_state !== 'imported') {
      log.error(`SIS IMPORT ERROR. Please check import with ID ${response.id}`)
    } else {
      log.info(`SIS IMPORT CORRECTLY FINISHED. Details: ${url}`)
    }
  }
}
