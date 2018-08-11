let fs = require('fs')
let path = require('path')

let client = fs.readFileSync(path.resolve(__dirname, 'livecable-client.js'), 'utf8')

module.exports = socketPath => `<script type="text/javascript">${client}</script>`.replace('SOCKET_ADDRESS', socketPath)
