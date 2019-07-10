/** "Period" object to transform between diverse Period formats */
module.exports = function Period (str = '') {
  const matching = str.match(/^(\d+)-(VT|HT)-P(\d)$/)

  if (!matching) {
    throw new Error('Wrong format. String must be formatted as "YYYY-TT-PP" (example: "2019-VT-P3")')
  }

  const [, year, term, period] = matching

  if (period > 5) {
    throw new Error(`Wrong format. Period [P${period}] does not exist. Should be from 0 to 5`)
  }

  if ((term === 'HT' && period > 2) || (term === 'VT' && period < 3)) {
    throw new Error(`Wrong format. [${term}-P${period}] does not exist. Valids are HT-P0, HT-P1, HT-P2, VT-P3, VT-P4, VT-P5`)
  }

  return {
    toString () {
      return `${year}-${term}-P${period}`
    }
  }
}
