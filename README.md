Config
==============================

Version: 1.1.1

Docker
------------

    $ docker-compose build
    $ docker-compose run --rm app /bin/bash

Installation
------------

    $ npm install https://github.com/sdevalk/config.git --save

Tests
------------

    $ npm run test

Example
------------

```javascript
const Config = require('config');

const config = new Config();

// Asynchronous
config.load('someFile.json', (err) => {

    if (err) {
        // ...
    }

    const value = config.get('/key');
});

// Synchronous
try {
    config.loadSync('someFile.json');

    const value = config.get('/key');
}
catch (error) {
    // ...
}

```
