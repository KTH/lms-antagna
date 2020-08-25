const log = require('skog')
const Joi = require('@hapi/joi')
const fs = require('fs')
const csv = require('fast-csv')

const enrollmentSchema = Joi.object().keys({
  user_id: Joi.required(),
  section_id: Joi.required(),
  status: Joi.required(),
  role_id: Joi.required()
})

function normalizeEnrollments (enrollments) {
  return enrollments
    .filter(
      e => enrollmentSchema.validate(e, { stripUnknown: true }).error === null
    )
    .map(e => enrollmentSchema.validate(e, { stripUnknown: true }).value)
}

module.exports = {
  async writeEnrollments (file, enrollments) {
    const normalized = normalizeEnrollments(enrollments)

    if (enrollments.length > normalized.length) {
      log.error(
        `CREATE CSV FILE: There are ${enrollments.length -
          normalized.length} enrollments that are not going to be sent to Canvas due to incorrect formatting. Please check what you send to "Canvas.sendEnrollments"`
      )
    }

    const writer = fs.createWriteStream(file)
    log.debug(`CREATE CSV FILE: Created tmp file [${file}]`)

    const stream = csv.format({ headers: true })
    stream.pipe(writer)

    normalized.forEach(e => stream.write(e))
    stream.end()

    await new Promise((resolve, reject) => {
      writer.on('error', reject)
      writer.on('finish', resolve)
    })

    log.debug(`CREATE CSV FILE: File [${file}] ready`)
  }
}
