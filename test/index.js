'use strict';


// Load modules
const Code = require('code');
const Config = require('..');
const Fs = require('fs');
const Lab = require('lab');
const Sinon = require('sinon');


// Test shortcuts
const lab = exports.lab = Lab.script();
const experiment = lab.experiment;
const it = lab.it;
const before = lab.before;
const after = lab.after;
const expect = Code.expect;


experiment('Config', () => {

    experiment('constructor', () => {

        it('throws error if not instantiated using new', (done) => {

            const fn = () => {

                Config();
            };

            expect(fn).to.throw(Error, 'Object must be instantiated using "new"');

            done();
        });
    });

    experiment('load async #1', () => {

        let load = (provider) => {

            it('throws error if invalid file was provided', (done) => {

                const config = new Config();

                const fn = () => {

                    config.load(provider.filename, (err) => {

                        expect(err).to.not.exist(); // Not reached
                    });
                };

                expect(fn).to.throw(Error, provider.message);

                done();
            });
        };

        load({ filename: undefined, message: 'path must be a string or Buffer' });
        load({ filename: null, message: 'path must be a string or Buffer' });

        load = (provider) => {

            it('returns error if non-existing file was provided', (done) => {

                const config = new Config();

                config.load(provider.filename, (err) => {

                    expect(err).to.be.an.instanceOf(Error);
                    expect(err.message).to.equal(provider.message);

                    done();
                });
            });
        };

        load({ filename: 'nope.json', message: 'ENOENT: no such file or directory, open \'nope.json\'' });
    });

    experiment('load async #2', () => {

        let stubReadFile;

        before((done) => {

            stubReadFile = Sinon.stub(Fs, 'readFile').yields(new Error('readFile'));

            done();
        });

        after((done) => {

            stubReadFile.restore();

            done();
        });

        it('returns error if error occurred while reading file', (done) => {

            const config = new Config();

            config.load('someFile.json', (err) => {

                expect(err).to.be.an.instanceOf(Error);
                expect(err.message).to.equal('readFile');

                done();
            });
        });
    });

    experiment('load async #3', () => {

        let stubReadFile;

        before((done) => {

            stubReadFile = Sinon.stub(Fs, 'readFile').yields(null, '__badString__');

            done();
        });

        after((done) => {

            stubReadFile.restore();

            done();
        });

        it('returns error if syntax error was found in file', (done) => {

            const config = new Config();

            config.load('someFile.json', (err) => {

                expect(err).to.be.an.instanceOf(SyntaxError);

                done();
            });
        });
    });

    experiment('load async #4', () => {

        let stubReadFile;

        before((done) => {

            stubReadFile = Sinon.stub(Fs, 'readFile').yields(null, '{}');

            done();
        });

        after((done) => {

            stubReadFile.restore();

            done();
        });

        it('does not return error if file is valid', (done) => {

            const config = new Config();

            config.load('someFile.json', (err) => {

                expect(err).to.not.exist();

                done();
            });
        });
    });

    experiment('load sync #1', () => {

        const load = (provider) => {

            it('throws error if invalid file was provided', (done) => {

                const config = new Config();

                const fn = () => {

                    config.loadSync(provider.filename);
                };

                expect(fn).to.throw(Error, provider.message);

                done();
            });
        };

        load({ filename: undefined, message: 'path must be a string or Buffer' });
        load({ filename: null, message: 'path must be a string or Buffer' });
        load({ filename: 'nope.json', message: 'ENOENT: no such file or directory, open \'nope.json\'' });
    });

    experiment('load sync #2', () => {

        let stubReadFileSync;

        before((done) => {

            stubReadFileSync = Sinon.stub(Fs, 'readFileSync').throws(new Error('readFileSync'));

            done();
        });

        after((done) => {

            stubReadFileSync.restore();

            done();
        });

        it('throws error if error occurred while reading file', (done) => {

            const config = new Config();

            const fn = () => {

                config.loadSync('someFile.json');
            };

            expect(fn).to.throw(Error, 'readFileSync');

            done();
        });
    });

    experiment('load sync #3', () => {

        let stubReadFileSync;

        before((done) => {

            stubReadFileSync = Sinon.stub(Fs, 'readFileSync').returns('__badString__');

            done();
        });

        after((done) => {

            stubReadFileSync.restore();

            done();
        });

        it('throws error if syntax error was found in file', (done) => {

            const config = new Config();

            const fn = () => {

                config.loadSync('someFile.json');
            };

            expect(fn).to.throw(SyntaxError);

            done();
        });
    });

    experiment('load sync #4', () => {

        let stubReadFileSync;

        before((done) => {

            stubReadFileSync = Sinon.stub(Fs, 'readFileSync').returns('{}');

            done();
        });

        after((done) => {

            stubReadFileSync.restore();

            done();
        });

        it('does not throw error if file is valid', (done) => {

            const config = new Config();

            config.loadSync('someFile.json');

            done();
        });
    });

    experiment('get #1', () => {

        it('returns undefined if no file was loaded', (done) => {

            const config = new Config();

            expect(config.get('/thisEntryDoesNotExist')).to.be.undefined();

            done();
        });
    });

    experiment('get #2', () => {

        let stubReadFile;

        before((done) => {

            stubReadFile = Sinon.stub(Fs, 'readFile').yields(null, null);

            done();
        });

        after((done) => {

            stubReadFile.restore();

            done();
        });

        it('returns null if config is null', (done) => {

            const config = new Config();

            config.load('someFile.json', (err) => {

                expect(err).to.not.exist();

                expect(config.get('/port')).to.be.null();

                done();
            });
        });
    });

    experiment('get #3', () => {

        let stubReadFile;

        before((done) => {

            const settings = {
                port: 8888,
                host: {
                    $filter: 'env',
                    development: 'localhost',
                    $default: 'none',
                },
                magicNumber: {
                    $filter: 'os',
                    android: 123,
                    ios: 456,
                },
                './path/to/plugin': {
                    $filter: 'env',
                    acceptance: [
                        {
                            select: ['api']
                        }
                    ],
                },
            };

            const data = JSON.stringify(settings);
            stubReadFile = Sinon.stub(Fs, 'readFile').yields(null, data);

            done();
        });

        after((done) => {

            stubReadFile.restore();

            done();
        });

        it('returns the expected values', (done) => {

            const config = new Config();

            config.load('someFile.json', (err) => {

                expect(err).to.not.exist();

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

                done();
            });
        });
    });

    experiment('get #4', () => {

        let stubReadFile;

        before((done) => {

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
                        salt: 'no$env.MY_ENV_SALT', // Value does not start with $env.
                    }
                }
            };

            const data = JSON.stringify(settings);
            stubReadFile = Sinon.stub(Fs, 'readFile').yields(null, data);

            done();
        });

        after((done) => {

            process.env.MY_ENV_PORT = undefined;
            process.env.MY_ENV_USERNAME = undefined;
            process.env.MY_ENV_PASSWORD = undefined;
            process.env.MY_ENV_SALT = undefined;

            stubReadFile.restore();

            done();
        });

        it('parses prefixed values as environment variable values', (done) => {

            const config = new Config();

            config.load('someFile.json', (err) => {

                expect(err).to.not.exist();

                expect(config.get('/port')).to.equal('8888');
                expect(config.get('/host')).to.equal(undefined);
                expect(config.get('/options/username')).to.equal('myName');
                expect(config.get('/options/keys/password')).to.equal('myPass');
                expect(config.get('/options/keys/salt')).to.equal('no$env.MY_ENV_SALT');

                done();
            });
        });
    });
});
