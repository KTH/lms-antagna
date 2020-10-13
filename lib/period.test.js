const Period = require('./period')
const test = require('ava')

test('Period throws if given format is wrong', t => {
  t.throws(() => Period.fromString('2019VT-P1'))
})

test('Period throws if the term is not valid', t => {
  // Period from 6 to 9 do not exist
  t.throws(() => Period.fromString('2019-VT-P6'))
  t.throws(() => Period.fromString('2019-VT-P7'))
  t.throws(() => Period.fromString('2019-VT-P8'))
  t.throws(() => Period.fromString('2019-VT-P9'))

  // HT only matches with Periods 0, 1, 2
  t.throws(() => Period.fromString('2019-VT-P0'))
  t.throws(() => Period.fromString('2019-VT-P1'))
  t.throws(() => Period.fromString('2019-VT-P2'))

  // VT only matches with Periods 3, 4, 5
  t.throws(() => Period.fromString('2019-HT-P3'))
  t.throws(() => Period.fromString('2019-HT-P4'))
  t.throws(() => Period.fromString('2019-HT-P5'))
})

test('Period.previous() returns the previous period', t => {
  const periods = [
    ['2018-VT-P3', '2018-VT-P4'],
    ['2018-VT-P5', '2018-HT-P0'],
    ['2018-HT-P1', '2018-HT-P2'],
    ['2018-HT-P2', '2019-VT-P3']
  ]

  for (const [previous, current] of periods) {
    t.is(
      Period.fromString(current)
        .prev()
        .toString(),
      previous
    )
  }
})

test('Period.nextPeriod() returns the previous period', t => {
  const periods = [
    ['2018-VT-P3', '2018-VT-P4'],
    ['2018-VT-P5', '2018-HT-P0'],
    ['2018-HT-P1', '2018-HT-P2'],
    ['2018-HT-P2', '2019-VT-P3']
  ]

  for (const [current, next] of periods) {
    t.is(
      Period.fromString(current)
        .next()
        .toString(),
      next,
      `Next from ${current} should be ${next}`
    )
  }
})

test('Period.toKoppsString() returns the correct term', t => {
  t.is(Period.fromString('2019-VT-P3').toKoppsString(), '20191')
  t.is(Period.fromString('2019-HT-P0').toKoppsString(), '20192')
})

test('Period.add() returns the correct term', t => {
  const current = Period.fromString('2020-HT-P2')
  const expected = [
    '2020-VT-P3',
    '2020-VT-P4',
    '2020-VT-P5',
    '2020-HT-P0',
    '2020-HT-P1',
    '2020-HT-P2',
    '2021-VT-P3',
    '2021-VT-P4',
    '2021-VT-P5',
    '2021-HT-P0',
    '2021-HT-P1'
  ]

  for (let i = 0; i < expected.length; i++) {
    t.is(current.add(i - 5).toString(), expected[i])
  }
})

test('Period.range() returns a range of periods', t => {
  const current = Period.fromString('2020-HT-P2')
  const expected = [
    '2020-VT-P3',
    '2020-VT-P4',
    '2020-VT-P5',
    '2020-HT-P0',
    '2020-HT-P1',

    '2020-HT-P2',

    '2021-VT-P3',
    '2021-VT-P4',
    '2021-VT-P5',
    '2021-HT-P0',
    '2021-HT-P1'
  ]

  t.deepEqual(Period.range(current, -5, 5).map(c => c.toString()), expected)
})
