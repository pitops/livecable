# livecable

[![Greenkeeper badge](https://badges.greenkeeper.io/pitops/livecable.svg)](https://greenkeeper.io/)

A small browser agnostic live-reload library that does not require manual client-side code

## install 
```bash
npm install -g livecable
```

## Standalone

```bash
livecable --port 9999 --path ./static --index index.html --socket livecable
```

## NPM Package

OR you can install livecable as a package through npm. **Livecable at the moment works only with ExpressJS**

`npm install --save-dev livecable`

## Sample

Below you can find the most minimal setup needed for livecable to work. For a list of options check the configuration section below.

```javascript
const path = require('path')
const express = require('express')
const livecable = require('livecable')

const app = express()

livecable(app, {
   pathToWatch: path.resolve(__dirname, 'static'),
   socketAddress: 'livecable',
   entryPointFile: 'index.html'
})

// rest of your code
```

### Single Page Applications

to enable single page applications just define `entryPointFile` or `--index` file in cli

### How it works

Livecable is built on the idea that the fetched page from the browser does not need user interaction to add client-side code. 
Livecable automatically injects the required client-side code to establish a websocket connection. 
Then its a matter of watching for changes in the specified path. Special props to [live-server](https://github.com/tapio/live-server) which this project is based off of.

### Configuration options

There are few configuration parameters you can pass to livecable. **(see sample above)**

**pathToWatch**

`type`: String
    
As the name suggests, its the root path that livecable will watch for. Its best to use process.cwd() and then the folder name. e.g. `process.cwd()/dist`

**entryPointFile**

`type`: String
    
This option tells livecable what the default entryPoint in the `pathToWatch` directory is. The default is `index.html`

**socketAddress**

`type`: String
    
If your app already connects to a websocket address and for coincidence the socket path ends in `livecable`, you can change it here to avoid conflicts. Default is `livecable` e.g. `ws://localhost:8080/livecable`

### Contribution

Feel free to open up issues and make pull requests.
