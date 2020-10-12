/** "Period" object to transform between diverse Period formats */
function getTerm (period) {
  if (period <= 2) {
    return 'HT'
  } else {
    return 'VT'
  }
}

function prevPeriod ({ year, period }) {
  const y2 = period - 1 === 2 ? year - 1 : year
  const p2 = period - 1 < 0 ? 5 : period - 1

  return {
    year: y2,
    term: getTerm(p2),
    period: p2
  }
}

function nextPeriod ({ year, period }) {
  const y2 = period + 1 === 3 ? year + 1 : year
  const p2 = period + 1 > 5 ? 0 : period + 1

  return {
    year: y2,
    term: getTerm(p2),
    period: p2
  }
}

/** Constructor from String */
function Period (str) {
  const matching = str.match(/^(\d+)-(VT|HT)-P(\d)$/)

  if (!matching) {
    throw new Error(
      'Wrong format. String must be formatted as "YYYY-TT-PP" (example: "2019-VT-P3")'
    )
  }

  const [, year, term, period] = matching

  return Period.fromObject({
    year: parseInt(year, 10),
    term,
    period: parseInt(period, 10)
  })
}

/** Constructor from {year, term, period} object */
Period.fromObject = function ({ year, term, period }) {
  if (period > 5) {
    throw new Error(
      `Wrong format. Period [P${period}] does not exist. Should be from 0 to 5`
    )
  }

  if (getTerm(period) !== term) {
    throw new Error(
      `Wrong format. [${term}-P${period}] does not exist. Valids are HT-P0, HT-P1, HT-P2, VT-P3, VT-P4, VT-P5`
    )
  }

  return {
    prevPeriod () {
      return Period.fromObject(prevPeriod({ year, period }))
    },
    nextPeriod () {
      return Period.fromObject(nextPeriod({ year, period }))
    },
    offset (n) {
      if (n > 0) {
        return this.nextPeriod().offset(n - 1)
      } else if (n < 0) {
        return this.prevPeriod().offset(n + 1)
      }

      return this
    },
    toString () {
      return `${year}-${term}-P${period}`
    },
    koppsTerm () {
      return `${year}${term === 'VT' ? 1 : 2}`
    },
    koppsPeriod () {
      return `${year}${term === 'VT' ? 1 : 2}P${period}`
    },
    range (startOffset, endOffset) {
      if (startOffset > endOffset) {
        throw new Error(
          `Wrong parameters. "startOffset" should be smaller than "endOffset"`
        )
      }

      return Array.from(
        { length: endOffset - startOffset + 1 },
        (x, i) => i + startOffset
      ).map(v => this.offset(v))
    }
  }
}

module.exports = Period
