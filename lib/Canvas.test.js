const test = require('ava')
const createTestServer = require('create-test-server')
const Canvas = require('./Canvas')

test('Canvas.getAntagna() returns only users with SIS ID', async t => {
  const server = await createTestServer()

  server.get('/sections/sis_section_id:AAA/enrollments', () => [
    { sis_user_id: 'aaa' },
    { sis_user_id: null },
    { sis_user_id: 'bbb' }
  ])

  const canvas = Canvas(server.url, '')
  const enrollments = await canvas.getAntagna('AAA')

  t.deepEqual(enrollments, [
    { sis_user_id: 'aaa' },
    { sis_user_id: 'bbb' }
  ])
})

test('Canvas.getAntagna() returns only the SIS ID', async t => {
  const server = await createTestServer()

  server.get('/sections/sis_section_id:AAA/enrollments', () => [{
    sis_user_id: 'aaa',
    id: '123123',
    name: 'Ana Svensson'
  }])

  const canvas = Canvas(server.url, '')
  const enrollments = await canvas.getAntagna('AAA')

  t.deepEqual(enrollments, [
    { sis_user_id: 'aaa' }
  ])
})
