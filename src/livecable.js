const fs = require('fs')
const ws = require('express-ws')
const es = require('event-stream')
const url = require('url')
const path = require('path')
const send = require('send')
const chokidar = require('chokidar')

const clientLoader = require('./client-loader.js')

async function isDir (basepath, filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(basepath + filePath, (err, stats) => {
      if (err && err.code === 'ENOENT') {
        return resolve(false)
      }

      if (err) {
        return reject(err)
      }

      if (stats.isDirectory()) {
        return resolve(true)
      }

      return resolve(false)
    })
  })
}

async function isFile (basepath, filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(basepath + filePath, (err, stats) => {
      if (err && err.code === 'ENOENT') {
        return resolve(false)
      }

      if (err) {
        return reject(err)
      }

      if (stats.isFile()) {
        return resolve(true)
      }

      return resolve(false)
    })
  })
}

async function injectCodeHandler (opts, req, res, next) {
  let pathname = url.parse(req.url).pathname
  let extension = path.extname(pathname)

  if (opts.entryPointFile && extension === '') {
    pathname = `/${opts.entryPointFile}`
  }

  const dir = await isDir(opts.pathToWatch, pathname)
  const file = await isFile(opts.pathToWatch, pathname)
  const exists = dir || file

  if (!exists && !opts.entryPointFile) {
    return next()
  }

  let injectableTag = null

  send(req, pathname, {root: opts.pathToWatch})
    .on('error', err => {
      res.statusCode = err.status || 500
      res.end(err.message)
    })
    .on('directory', () => {
      res.statusCode = 301
      res.setHeader('Location', req.url + '/')
      res.end('Redirecting to ' + req.url + '/')
    })
    .on('file', filepath => {
      const fileExtension = path.extname(filepath).toLocaleLowerCase()
      const possibleExtensions = ['', '.html', '.htm', '.xhtml', '.php', '.svg']

      if (!possibleExtensions.includes(fileExtension)) {
        return
      }

      let match
      const candidates = [/<\/body>/i, /<\/svg>/i, /<\/head>/i]
      const fileContent = fs.readFileSync(filepath, 'utf8')

      for (let i = 0; i < candidates.length; ++i) {
        match = candidates[i].exec(fileContent)

        if (match) {
          injectableTag = match.shift()
          break
        }
      }
    })
    .on('stream', stream => {
      if (!injectableTag) {
        return
      }

      const INJECTED_CODE = clientLoader(opts.socketAddress)
      const len = INJECTED_CODE.length + res.getHeader('Content-Length')
      res.setHeader('Content-Length', len)

      const originalPipe = stream.pipe
      stream.pipe = resp => originalPipe.call(stream, es.replace(new RegExp(injectableTag, 'i'), INJECTED_CODE + injectableTag)).pipe(resp)
    })
    .pipe(res)
}

function livecable (app, opts) {
  const expressWs = ws(app)
  const wss = expressWs.getWss()

  const defaults = {
    pathToWatch: `${process.cwd()}/static`,
    socketAddress: 'livecable',
    entryPointFile: null
  }

  opts = Object.assign(defaults, opts)

  app.ws('/' + opts.socketAddress, ws => {})

  chokidar
    .watch(opts.pathToWatch, {usePolling: true})
    .on('all', (event, changePath) => {
      if (event !== 'change') {
        return
      }

      wss.clients.forEach(client => client.send(path.extname(changePath) === '.css' ? 'stylesReload' : 'fullReload'))
    })

  return app.use(injectCodeHandler.bind(null, opts))
}

module.exports = livecable
