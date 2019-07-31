const ldap = require('ldapjs')
const log = require('../logger')

let ldapClient

try {
  ldapClient = ldap.createClient({
    url: process.env.UG_URL
  })
  ldapClient.on('error', (err) => {
    log.error(err, `Error in the LDAP client. This is probably due to some misconfiguration`)
  })
} catch (err) {
  err.message = 'UG: Could not create LDAP client: ' + err.message
  throw err
}

const ldapBind = () => new Promise((resolve, reject) => {
  log.debug('Binding to LDAP client...')
  ldapClient.bind(process.env.UG_USERNAME, process.env.UG_PASSWORD, err => {
    if (err) {
      return reject(err)
    }
    log.debug('Binding successful')
    resolve()
  })
})

const ldapUnbind = () => new Promise((resolve, reject) => {
  log.debug('Unbinding to LDAP client...')
  ldapClient.unbind(err => {
    if (err) {
      return reject(err)
    }
    log.debug('Unbinding successful')
    resolve()
  })
})

const ldapSearch = ({ base = 'OU=UG,DC=ug,DC=kth,DC=se', filter, attributes = [], scope = 'sub' }) => new Promise((resolve, reject) => {
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
        const err = new Error('LDAP search has finished with non-zero status code')
        return reject(err)
      }

      resolve(searchResult)
    })
  })
})

module.exports = {
  ldapBind,
  ldapUnbind,
  async getAntagna (courseCode, term, round) {
    const matching = courseCode.match(/^(F?\w{2})(\w{4})$/)
    if (!matching) {
      throw new Error(`UG: Wrong course code format [${courseCode}]. Format should be "XXXYYYY" (example: "AAA1111")`)
    }

    const [, prefix, suffix] = matching
    const groupName = `ladok2.kurser.${prefix}.${suffix}.antagna_${term}.${round}`
    const groups = await ldapSearch({
      filter: `(&(objectClass=group)(CN=${groupName}))`,
      attributes: ['member']
    })

    if (groups.length > 1) {
      throw new Error(`UG: There is more than one antagna group for ${courseCode} in term ${term}, round ${round}`)
    }

    if (groups.length === 0) {
      log.warn(`UG: Group [${groupName}] not found.`)
      return []
    }

    const peopleDNs = Array.isArray(groups[0].member) ? groups[0].member : [groups[0].member]
    const searchKthIds = peopleDNs.filter(dn => dn).map(
      dn => ldapSearch({ base: dn, scope: 'base', attributes: 'ugKthId' })
    )

    const people = (await Promise.all(searchKthIds))
      .map(r => r[0].ugKthid)

    return people
  }
}
