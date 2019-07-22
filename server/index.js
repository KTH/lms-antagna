const express = require('express')
const app = express()
const prefix = process.env.PROXY_PATH || ''

app.get(prefix + '/about', (req, res) => {
  res.send('Hello antagna')
})

module.exports = app
