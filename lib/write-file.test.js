const test = require('ava')
const { normalizeEnrollments } = require('./write-file')

test.serial(
  'Canvas.normalizeEnrollments() return objects with all the valid keys',
  t => {
    const input = [
      { user_id: 'user', section_id: 'section', status: 'active', role_id: 12 },
      {
        user_id: 'user',
        xxxx_section_id: 'section',
        status: 'active',
        role_id: 12
      }
    ]

    const expected = [
      { user_id: 'user', section_id: 'section', status: 'active', role_id: 12 }
    ]
    const result = normalizeEnrollments(input)

    t.deepEqual(result, expected)
  }
)

test.serial(
  'Canvas.normalizeEnrollments() return objects without the non-valid keys',
  t => {
    const input = [
      { user_id: 'user', section_id: 'section', status: 'active', role_id: 12 },
      {
        user_id: 'user',
        section_id: 'section2',
        status: 'active',
        role_id: 12,
        role: 'nothing'
      }
    ]

    const expected = [
      { user_id: 'user', section_id: 'section', status: 'active', role_id: 12 },
      { user_id: 'user', section_id: 'section2', status: 'active', role_id: 12 }
    ]
    const result = normalizeEnrollments(input)

    t.deepEqual(result, expected)
  }
)
