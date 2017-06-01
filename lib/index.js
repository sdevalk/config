'use strict';


// Load modules
const Confidence = require('confidence');
const Fs = require('fs');


// Declare internals
const internals = {};


/**
 * Constructor
 *
 * @constructor
 * @throws {Error}
 * @returns {Void}
 */
exports = module.exports = internals.Config = function () {

    if (!(this instanceof internals.Config)) {
        throw new Error('Object must be instantiated using "new"');
    }

    this.filters = {};

    /** @protected */
    this._store = new Confidence.Store();
};


/**
 * Parse "$env." values to the values of their environment variables
 *
 * @private
 * @param {Object} manifest
 * @returns {Void}
 * @see Credits: https://github.com/hapijs/rejoice/blob/master/lib/index.js
 */
internals.Config.prototype._parseEnv = function (manifest) {

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
};


/**
 * Load a JSON-formatted configuration file
 *
 * @param {String} filename
 * @param {Function} next
 * @returns {Void}
 */
internals.Config.prototype.load = function (filename, next) {

    Fs.readFile(filename, 'utf8', (err, data) => {

        if (err) {
            return next(err);
        }

        try {
            const manifest = JSON.parse(data);
            this._parseEnv(manifest);
            this._store.load(manifest);
        }
        catch (err) {
            return next(err);
        }

        return next();
    });
};


/**
 * Load a JSON-formatted configuration file synchronously
 *
 * @param {String} filename
 * @returns {Void}
 * @throws {Error}
 */
internals.Config.prototype.loadSync = function (filename) {

    const data = Fs.readFileSync(filename, 'utf8');
    const manifest = JSON.parse(data);
    this._parseEnv(manifest);
    this._store.load(manifest);
};


/**
 * Get a configuration value
 *
 * @param {String} key
 * @returns {Mixed}
 */
internals.Config.prototype.get = function (key) {

    return this._store.get(key, this.filters);
};
