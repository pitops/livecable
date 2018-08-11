#! /usr/bin/env node

const path = require('path')
const express = require('express')
const minimist = require('minimist')
const livecable = require('../src/livecable')

const app = express()

const args = minimist(process.argv.slice(2))

const port = args.port || process.env.PORT || 9999
const watch = args.path || 'static'
const index = args.index || 'index.html'
const socket = args.socket || 'livecable'

livecable(app, {pathToWatch: path.resolve(process.cwd(), watch), entryPointFile: index, socketAddress: socket})

app.listen(port, () => console.info(`Server is listening on port ${port}!`))
