const test = require('ava')
const createTestServer = require('create-test-server')
const proxyquire = require('proxyquire').noPreserveCache()
const Canvas = require('./canvas')
const fs = require('fs')

test.serial('Canvas.ANTAGNA_ID exists', t => {
  t.truthy(Canvas.ANTAGNA_ID)
})

test.serial('Canvas.getAntagna() returns only users with SIS ID', async t => {
  const server = await createTestServer()

  server.get('/sections/sis_section_id:AAA/enrollments', () => [
    { sis_user_id: 'ccc' },
    { sis_user_id: null },
    { sis_user_id: 'ddd' }
  ])

  process.env.CANVAS_API_URL = server.url
  const canvas = proxyquire('./canvas', {})

  const enrollments = await canvas.getAntagna('AAA')

  t.deepEqual(enrollments, [{ sis_user_id: 'ccc' }, { sis_user_id: 'ddd' }])
})

test.serial('Canvas.getAntagna() returns only the SIS ID', async t => {
  const server = await createTestServer()

  server.get('/sections/sis_section_id:AAA/enrollments', () => [
    {
      sis_user_id: 'aaa',
      id: '123123',
      name: 'Ana Svensson'
    }
  ])

  process.env.CANVAS_API_URL = server.url
  const canvas = proxyquire('./canvas', {})
  const enrollments = await canvas.getAntagna('AAA')

  t.deepEqual(enrollments, [{ sis_user_id: 'aaa' }])
})

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
    const result = Canvas.normalizeEnrollments(input)

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
    const result = Canvas.normalizeEnrollments(input)

    t.deepEqual(result, expected)
  }
)

test.serial(
  'Canvas.writeEnrollments() writes a CSV file with correct format',
  async t => {
    const enrollments = [
      { user_id: 'u1', section_id: 's1', status: 'active', role_id: 25 },
      { user_id: 'u2', section_id: 's1', status: 'active', role_id: 25 }
    ]

    const file = '/tmp/enrollments.csv'
    await Canvas.writeEnrollments(enrollments, file)

    const content = fs.readFileSync(file, { encoding: 'utf-8' })
    t.snapshot(content)
  }
)

test.serial(
  'Canvas.sendEnrollments() uses the right canvas endpoints',
  async t => {
    t.plan(3)
    const server = await createTestServer()
    server.post('/accounts/1/sis_imports', (req, res) => {
      t.pass()
      res.send({
        id: 1
      })
    })

    server.get('/accounts/1/sis_imports/1', (req, res) => {
      t.pass()
      return {
        progress: 100,
        workflow_state: 'imported'
      }
    })

    process.env.CANVAS_API_URL = server.url
    const canvas = proxyquire('./canvas', {})

    const enrollments = [
      { user_id: 'u1', section_id: 's1', status: 'active', role_id: 25 },
      { user_id: 'u2', section_id: 's1', status: 'active', role_id: 25 }
    ]

    const file = '/tmp/enrollments.csv'
    await canvas.sendEnrollments(enrollments, file)
    t.pass()
  }
)
