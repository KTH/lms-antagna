const express = require('express')
const log = require('../logger')
const app = express()
const prefix = process.env.PROXY_PATH || ''


app.use((req, res) => {
  log.info({req}, 'Hello antagna')
  res.send('Hello antagna')
})

app.get(prefix + '/about', (req, res) => {
  res.send('Hello antagna')
})

module.exports = app
