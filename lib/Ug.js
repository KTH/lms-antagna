const ldap = require('ldapjs')
const log = require('../logger')

let ldapClient

try {
  ldapClient = ldap.createClient({
    url: process.env.UG_URL
  })
} catch (err) {
  err.message = 'Could not create LDAP client: ' + err.message
  throw err
}

const ldapBind = () => new Promise((resolve, reject) => {
  ldapClient.bind(process.env.UG_USERNAME, process.env.UG_PASSWORD, err => {
    if (err) {
      return reject(err)
    }
    resolve()
  })
})

const ldapUnbind = () => new Promise((resolve, reject) => {
  ldapClient.unbind(err => {
    if (err) {
      return reject(err)
    }
    resolve()
  })
})

const ldapSearch = ({ base = 'OU=UG,DC=ug,DC=kth,DC=se', filter, attributes = [], scope = 'sub'}) => new Promise((resolve, reject) => {
  const query = {
    scope,
    filter,
    attributes,
    timeLimit: 11,
    paging: true,
    paged: {
      pageSize: 1000,
      pagePause: false
    }
  }

  ldapClient.search(base, query, (err, searchObject) => {
    if (err) {
      return reject(err)
    }

    const searchResult = []
    searchObject.on('error', reject)
    searchObject.on('searchEntry', entry => {
      if (Array.isArray(entry.object)) {
        searchResult.push(...entry.object)
      } else {
        searchResult.push(entry.object)
      }
    })
    searchObject.on('end', result => {
      if (result.status !== 0) {
        return reject()
      }

      resolve(searchResult)
    })
  })
})

module.exports = {
  async getAntagna (courseCode, term, round) {
    const matching = courseCode.match(/^(\w+)(\d{4})$/)
    if (!matching) {
      throw new Error(`Wrong course code format [${courseCode}]. Format should be "XXXYYYY" (example: "AAA1111")`)
    }

    const [, prefix, suffix] = matching
    await ldapBind()
    const groups = await ldapSearch({
      filter: `(&(objectClass=group)(CN=ladok2.kurser.${prefix}.${suffix}.antagna_${term}.${round}))`,
      attributes: ['member']
    })

    if (groups.length > 1) {
      throw new Error(`There is more than one antagna group for ${courseCode} in term ${term}, round ${round}`)
    }

    const peopleDNs = groups[0].member
    const searchKthIds = peopleDNs.map(
      dn => ldapSearch({base: dn, scope: 'base', attributes: 'ugKthId'})
    )
    const people = (await Promise.all(searchKthIds))
          .map(r => r[0].ugKthid)
    await ldapUnbind()

    return people
  }
}
