# livecable

A small browser agnostic live-reload library that does not require manual client-side code

### Getting started

#### Standalone

You can either use this as a standalone server by cloning this repo and run the command `npm start`. Then just replace files inside static folder and you are good to go.

#### NPM Package

OR you can install livecable as a package through npm. **Livecable at the moment works only with ExpressJS**

`npm install --save-dev livecable`

##### Sample

Below you can find the most minimal setup needed for livecable to work. For a list of options check the configuration section below.

```javascript

const express = require('express')
const livecable = require('livecable')

const app = express()

livecable(app, {
  pathToWatch: `${process.cwd()}/static`
})

... rest of your code

```

### Single Page Applications

Livecable has experimental support for single page applications. Please refer to the configuration options on how to enable this.

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

**spa**

`type`: Boolean
    
If you are working with a single-page application then you need to enable this. Default `false`

### Contribution

Feel free to open up issues and make pull requests.



