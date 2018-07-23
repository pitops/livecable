module.exports = (app, opts) => {
  const fs = require('fs')
  const url = require('url')
  const path = require('path')
  const send = require('send')
  const ws = require('express-ws')
  const es = require('event-stream')
  const chokidar = require('chokidar')

  const expressWs = ws(app)
  const wss = expressWs.getWss()

  opts = Object.assign({
    pathToWatch: `${process.cwd()}/static`,
    entryPointFile: 'index.html',
    SPA: false,
    socketAddress: 'livecable'
  }, opts)

  app.ws('/' + opts.socketAddress, ws => {
    // console.log('ws', 'Client connected')
  })

  chokidar
    .watch(opts.pathToWatch, {usePolling: true})
    .on('all', (event, changePath) => {
      if (event !== 'change') {
        return
      }

      wss
        .clients
        .forEach(client => client.send(path.extname(changePath) === '.css' ? 'stylesReload' : 'fullReload'))
    })

  const INJECTED_CODE = require('./injection_payload.js').payload(opts.socketAddress)

  async function injectCodeHandler (req, res, next) {
    const isDirectory = await filePathExists(req.url)

    if (path.extname(req.url) === '' && !req.url.endsWith('/') && !isDirectory) {
      return next()
    }

    const injectCandidates = [new RegExp('</body>', 'i'), new RegExp('</svg>'), new RegExp('</head>', 'i')]
    const reqpath = url.parse(req.url).pathname === '/' ? `${req.url}${opts.entryPointFile}` : url.parse(req.url).pathname
    let injectTag = null

    function error (err) {
      res.statusCode = err.status || 500
      res.end(err.message)
    }

    function directory () {
      res.statusCode = 301
      res.setHeader('Location', req.url + '/')
      res.end('Redirecting to ' + req.url + '/')
    }

    function inject (stream) {
      if (injectTag) {
        const len = INJECTED_CODE.length + res.getHeader('Content-Length')
        res.setHeader('Content-Length', len)
        const originalPipe = stream.pipe
        stream.pipe = (resp) => {
          originalPipe.call(stream, es.replace(new RegExp(injectTag, 'i'), INJECTED_CODE + injectTag)).pipe(resp)
        }
      }
    }

    function file (filepath /*, stat*/) {
      const x = path.extname(filepath).toLocaleLowerCase()
      const possibleExtensions = ['', '.html', '.htm', '.xhtml', '.php', '.svg']
      let match
      if (possibleExtensions.indexOf(x) > -1) {
        const fileContent = fs.readFileSync(filepath, 'utf8')
        for (let i = 0; i < injectCandidates.length; ++i) {
          match = injectCandidates[i].exec(fileContent)
          if (match) {
            injectTag = match[0]
            break
          }
        }
      }
    }

    send(req, reqpath, {root: opts.pathToWatch})
      .on('error', error)
      .on('directory', directory)
      .on('file', file)
      .on('stream', inject)
      .pipe(res)

  }

  function filePathExists (filePath) {
    return new Promise((resolve, reject) => {
      fs.stat(opts.pathToWatch + filePath, (err, stats) => {
        if (err && err.code === 'ENOENT') {
          return resolve(false)
        } else if (err) {
          return reject(err)
        }
        if (stats.isFile() || stats.isDirectory()) {
          return resolve(true)
        }
      })
    })
  }

  return app.use(injectCodeHandler)
}