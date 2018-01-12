Config
==============================

Version: 2.0.0

Build image
------------
    docker-compose build

Logon to container
------------
    docker-compose run --rm node /bin/bash

Run tests
------------
    npm test

Coding conventions
------------
https://hapijs.com/styleguide

Install
------------
    npm install https://github.com/sdevalk/config.git --save

Example
------------

```javascript
const Config = require('config');

const config = new Config();

// Asynchronous (wrap in async function)
try {
    await config.load('someFile.json');

    const value = config.get('/key');
}
catch (error) {
    // ...
}

// Synchronous
try {
    config.loadSync('someFile.json');

    const value = config.get('/key');
}
catch (error) {
    // ...
}

```
