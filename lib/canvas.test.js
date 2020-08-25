const test = require('ava')
const createTestServer = require('create-test-server')
const proxyquire = require('proxyquire').noPreserveCache()

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
