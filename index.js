const livecable = require('./livecable')

if (!process.env.SERVER) {
  return livecable
}

const express = require('express')
const app = express()

livecable(app, `${process.cwd()}/static`)

app.listen(process.env.PORT || 9999, () => {
  console.info(`Server is listening on port ${process.env.PORT || 9999}!`)
})