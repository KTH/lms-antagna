const test = require('ava')
const { getAntagnaGroupName } = require('./ug')

test('Get the correct group name for normal courses', t => {
  t.is(
    getAntagnaGroupName('AA1111', '20201', '2'),
    'ladok2.kurser.AA.1111.antagna_20201.2'
  )

  t.is(
    getAntagnaGroupName('XX1D1E', '20201', '2'),
    'ladok2.kurser.XX.1D1E.antagna_20201.2'
  )
})

test('Throw an error for non-valid course codes', t => {
  t.throws(() => {
    getAntagnaGroupName('AA  22', '20211', '2')
  })

  t.throws(() => {
    getAntagnaGroupName('AA22___', '20211', '2')
  })
})

test('Get the correct group name for F-courses', t => {
  t.is(
    getAntagnaGroupName('FAA1111', '20201', '2'),
    'ladok2.kurser.FAA.1111.antagna_20201.2'
  )

  t.is(
    getAntagnaGroupName('FXX1D1E', '20201', '2'),
    'ladok2.kurser.FXX.1D1E.antagna_20201.2'
  )
})
