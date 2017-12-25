'use strict';


// Load modules

const Confidence = require('confidence');
const Fs = require('fs');
const Util = require('util');


// Declare internals

const internals = {};


exports = module.exports = internals.Config = class {

    constructor() {

        this.filters = {};
        this._store = new Confidence.Store();
    }

    /**
     * Parse "$env." values to the values of their environment variables
     *
     * Credits: https://github.com/hapijs/rejoice/blob/master/lib/index.js
     *
     * @private
     * @param {Object} manifest
     */
    _parseEnv(manifest) {

        if (!manifest || typeof manifest !== 'object') {
            return;
        }

        Object.keys(manifest).forEach((key) => {

            const value = manifest[key];
            if (typeof value === 'string' && value.startsWith('$env.')) {
                manifest[key] = process.env[value.slice(5)];
            }
            else {
                this._parseEnv(value);
            }
        });
    }

    /**
     * Load data from a JSON-formatted string
     *
     * @private
     * @param {String} data
     */
    _loadData(data) {

        const manifest = JSON.parse(data);
        this._parseEnv(manifest);
        this._store.load(manifest);
    }

    /**
     * Load a JSON-formatted configuration file asynchronously
     *
     * @param {String} filename
     */
    async load(filename) {

        const readFile = Util.promisify(Fs.readFile);
        const data = await readFile(filename, 'utf8');

        this._loadData(data);
    }

    /**
     * Load a JSON-formatted configuration file synchronously
     *
     * @param {String} filename
     */
    loadSync(filename) {

        const data = Fs.readFileSync(filename, 'utf8');

        this._loadData(data);
    }

    /**
     * Get a configuration value
     *
     * @param {String} key
     * @return {Mixed}
     */
    get(key) {

        return this._store.get(key, this.filters);
    }
};
