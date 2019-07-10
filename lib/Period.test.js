const Period = require('./Period')
const test = require('ava')

test('Period throws if given format is wrong', t => {
  t.throws(() => Period('2019VT-P1'))
})

test('Period throws if the term is not valid', t => {
  // Period from 6 to 9 do not exist
  t.throws(() => Period('2019-VT-P6'))
  t.throws(() => Period('2019-VT-P7'))
  t.throws(() => Period('2019-VT-P8'))
  t.throws(() => Period('2019-VT-P9'))

  // HT only matches with Periods 0, 1, 2
  t.throws(() => Period('2019-VT-P0'))
  t.throws(() => Period('2019-VT-P1'))
  t.throws(() => Period('2019-VT-P2'))

  // VT only matches with Periods 3, 4, 5
  t.throws(() => Period('2019-HT-P3'))
  t.throws(() => Period('2019-HT-P4'))
  t.throws(() => Period('2019-HT-P5'))
})

test('Period.previous() returns the previous period', t => {
  const periods = [
    ['2018-VT-P3', '2018-VT-P4'],
    ['2018-VT-P5', '2018-HT-P0'],
    ['2018-HT-P1', '2018-HT-P2'],
    ['2018-HT-P2', '2019-VT-P3']
  ]

  for (const [previous, current] of periods) {
    t.is(Period(current).prevPeriod().toString(), Period(previous).toString())
  }
})
