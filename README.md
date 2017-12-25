Config
==============================

Version: 2.0.0

Docker
------------

    $ docker-compose build
    $ docker-compose run --rm node /bin/bash

Installation
------------

    $ npm install https://github.com/sdevalk/config.git --save

Tests
------------

    $ npm run test

Coding conventions
------------
https://hapijs.com/styleguide

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
