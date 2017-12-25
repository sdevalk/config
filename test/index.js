'use strict';


// Load modules

const Code = require('code');
const Config = require('..');
const Fs = require('fs');
const Lab = require('lab');
const Sinon = require('sinon');


// Declare internals

const internals = {};


// Test shortcuts

const { describe, it, before, after } = exports.lab = Lab.script();
const expect = Code.expect;


describe('Config', () => {

    describe('load async #1', () => {

        const load = (provider) => {

            it('throws error if invalid file was provided', async () => {

                const config = new Config();

                await expect(config.load(provider.filename)).to.reject(Error, provider.message);
            });
        };

        load({ filename: undefined, message: 'path must be a string or Buffer' });
        load({ filename: null, message: 'path must be a string or Buffer' });
        load({ filename: 'nope.json', message: 'ENOENT: no such file or directory, open \'nope.json\'' });
    });

    describe('load async #2', () => {

        let stubReadFile;

        before(() => {

            stubReadFile = Sinon.stub(Fs, 'readFile').yields(new Error('readFile'));
        });

        after(() => {

            stubReadFile.restore();
        });

        it('throws error if error occurred while reading file', async () => {

            const config = new Config();

            await expect(config.load('someFile.json')).to.reject(Error, 'readFile');
        });
    });

    describe('load async #3', () => {

        let stubReadFile;

        before(() => {

            stubReadFile = Sinon.stub(Fs, 'readFile').yields(null, '__badString__');
        });

        after(() => {

            stubReadFile.restore();
        });

        it('throws error if syntax error was found in file', async () => {

            const config = new Config();

            await expect(config.load('someFile.json')).to.reject(SyntaxError);
        });
    });

    describe('load async #4', () => {

        let stubReadFile;

        before(() => {

            stubReadFile = Sinon.stub(Fs, 'readFile').yields(null, '{}');
        });

        after(() => {

            stubReadFile.restore();
        });

        it('does not throw error if file is valid', async () => {

            const config = new Config();

            await config.load('someFile.json');
        });
    });

    describe('load sync #1', () => {

        const load = (provider) => {

            it('throws error if invalid file was provided', () => {

                const config = new Config();

                const fn = () => {

                    config.loadSync(provider.filename);
                };

                expect(fn).to.throw(Error, provider.message);
            });
        };

        load({ filename: undefined, message: 'path must be a string or Buffer' });
        load({ filename: null, message: 'path must be a string or Buffer' });
        load({ filename: 'nope.json', message: 'ENOENT: no such file or directory, open \'nope.json\'' });
    });

    describe('load sync #2', () => {

        let stubReadFileSync;

        before(() => {

            stubReadFileSync = Sinon.stub(Fs, 'readFileSync').throws(new Error('readFileSync'));
        });

        after(() => {

            stubReadFileSync.restore();
        });

        it('throws error if error occurred while reading file', () => {

            const config = new Config();

            const fn = () => {

                config.loadSync('someFile.json');
            };

            expect(fn).to.throw(Error, 'readFileSync');
        });
    });

    describe('load sync #3', () => {

        let stubReadFileSync;

        before(() => {

            stubReadFileSync = Sinon.stub(Fs, 'readFileSync').returns('__badString__');
        });

        after(() => {

            stubReadFileSync.restore();
        });

        it('throws error if syntax error was found in file', () => {

            const config = new Config();

            const fn = () => {

                config.loadSync('someFile.json');
            };

            expect(fn).to.throw(SyntaxError);
        });
    });

    describe('load sync #4', () => {

        let stubReadFileSync;

        before(() => {

            stubReadFileSync = Sinon.stub(Fs, 'readFileSync').returns('{}');
        });

        after(() => {

            stubReadFileSync.restore();
        });

        it('does not throw error if file is valid', () => {

            const config = new Config();

            config.loadSync('someFile.json');
        });
    });

    describe('get #1', () => {

        it('returns undefined if no file was loaded', () => {

            const config = new Config();

            expect(config.get('/thisEntryDoesNotExist')).to.be.undefined();
        });
    });

    describe('get #2', () => {

        let stubReadFile;

        before(() => {

            stubReadFile = Sinon.stub(Fs, 'readFile').yields(null, null);
        });

        after(() => {

            stubReadFile.restore();
        });

        it('returns null if config is null', async () => {

            const config = new Config();

            await config.load('someFile.json');

            expect(config.get('/port')).to.be.null();
        });
    });

    describe('get #3', () => {

        let stubReadFile;

        before(() => {

            const settings = {
                port: 8888,
                host: {
                    $filter: 'env',
                    development: 'localhost',
                    $default: 'none'
                },
                magicNumber: {
                    $filter: 'os',
                    android: 123,
                    ios: 456
                },
                './path/to/plugin': {
                    $filter: 'env',
                    acceptance: [
                        {
                            select: ['api']
                        }
                    ]
                }
            };

            const data = JSON.stringify(settings);
            stubReadFile = Sinon.stub(Fs, 'readFile').yields(null, data);
        });

        after(() => {

            stubReadFile.restore();
        });

        it('returns the expected values', async () => {

            const config = new Config();

            await config.load('someFile.json');

            config.filters = { env: 'development' };
            expect(config.get('/port')).to.equal(8888);
            expect(config.get('/host')).to.equal('localhost');
            expect(config.get('/magicNumber')).to.be.undefined();

            config.filters = { env: 'acceptance' };
            expect(config.get('/port')).to.equal(8888);
            expect(config.get('/host')).to.equal('none');
            expect(config.get('/magicNumber')).to.be.undefined();
            expect(config.get('/')['./path/to/plugin']).to.equal([
                {
                    select: ['api']
                }
            ]);

            config.filters = { os: 'ios' };
            expect(config.get('/port')).to.equal(8888);
            expect(config.get('/host')).to.equal('none');
            expect(config.get('/magicNumber')).to.equal(456);

            config.filters = { env: 'development', os: 'ios' };
            expect(config.get('/port')).to.equal(8888);
            expect(config.get('/host')).to.equal('localhost');
            expect(config.get('/magicNumber')).to.equal(456);
            expect(config.get('/')['./path/to/plugin']).to.be.undefined();
        });
    });

    describe('get #4', () => {

        let stubReadFile;

        before(() => {

            process.env.MY_ENV_PORT = 8888;
            process.env.MY_ENV_USERNAME = 'myName';
            process.env.MY_ENV_PASSWORD = 'myPass';
            process.env.MY_ENV_SALT = 'mySalt';

            const settings = {
                port: '$env.MY_ENV_PORT',
                host: '$env.MY_ENV_HOST', // Not defined!
                options: {
                    username: '$env.MY_ENV_USERNAME',
                    keys: {
                        password: '$env.MY_ENV_PASSWORD',
                        salt: 'no$env.MY_ENV_SALT' // Value does not start with $env.
                    }
                }
            };

            const data = JSON.stringify(settings);
            stubReadFile = Sinon.stub(Fs, 'readFile').yields(null, data);
        });

        after(() => {

            process.env.MY_ENV_PORT = undefined;
            process.env.MY_ENV_USERNAME = undefined;
            process.env.MY_ENV_PASSWORD = undefined;
            process.env.MY_ENV_SALT = undefined;

            stubReadFile.restore();
        });

        it('parses prefixed values as environment variable values', async () => {

            const config = new Config();

            await config.load('someFile.json');

            expect(config.get('/port')).to.equal('8888');
            expect(config.get('/host')).to.equal(undefined);
            expect(config.get('/options/username')).to.equal('myName');
            expect(config.get('/options/keys/password')).to.equal('myPass');
            expect(config.get('/options/keys/salt')).to.equal('no$env.MY_ENV_SALT');
        });
    });
});
