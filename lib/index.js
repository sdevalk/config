'use strict';

const Confidence = require('confidence');
const LoadJsonFile = require('load-json-file');

const internals = {};

exports = module.exports = internals.Config = class {

    constructor() {

        this.filters = {};
        this._store = new Confidence.Store();
    }

    _parseEnv(manifest) {

        if (typeof manifest !== 'object') {
            return;
        }

        // Based on https://github.com/hapijs/rejoice/blob/master/lib/index.js
        for (const key in manifest) {
            const value = manifest[key];
            if (typeof value === 'string' && value.startsWith('$env.')) {
                manifest[key] = process.env[value.slice(5)];
            }
            else {
                this._parseEnv(value);
            }
        }
    }

    async load(filename) {

        const manifest = await LoadJsonFile(filename);
        this._parseEnv(manifest);
        this._store.load(manifest);
    }

    get(key) {

        return this._store.get(key, this.filters);
    }
};
