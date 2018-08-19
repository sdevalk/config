Config
==============================

Development
==============================

Build image
------------
    docker-compose build --no-cache

Logon to container
------------
    docker-compose run --rm node /bin/bash

Run tests
------------
    npm test

Coding conventions
------------
https://hapijs.com/styleguide

Usage
==============================

Example
------------
```javascript
const Config = require('..');

(async () => {

    const config = new Config();

    await config.load('your-config.json');

    console.log(config.get('/yourKey'));
})();
```
