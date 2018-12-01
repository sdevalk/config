'use strict';

const Confidence = require('confidence');
const FsExtra = require('fs-extra');

const internals = {};

exports = module.exports = internals.Config = class {

    constructor() {

        this.filters = {};
        this._store = new Confidence.Store();
    }

    async load(filename) {

        const manifest = await FsExtra.readJson(filename);
        this._store.load(manifest);
    }

    get(key) {

        return this._store.get(key, this.filters);
    }
};
