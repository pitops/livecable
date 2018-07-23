const livecable = require('./livecable')

if (module.parent) {
  module.exports = livecable

  return
}

const express = require('express')
const app = express()

livecable(app, {
  pathToWatch: `${process.cwd()}/static`
})

app.listen(process.env.PORT || 9999, () => {
  console.info(`Server is listening on port ${process.env.PORT || 9999}!`)
})