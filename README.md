Config - JSON configuration loader, leveraging Confidence's document format
==============================

## Development

### Build image
    docker-compose build --no-cache

### Logon to container
    docker-compose run --rm node /bin/bash

### Run tests
    npm test

### Coding conventions
https://hapijs.com/styleguide

## Usage
```javascript
const Config = require('config');

(async () => {

    const config = new Config();

    await config.load('your-config.json');

    console.log(config.get('/yourKey'));
})();
```
