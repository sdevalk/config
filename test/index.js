'use strict';

const Code = require('code');
const Config = require('..');
const Lab = require('lab');

const { describe, it, before, after } = exports.lab = Lab.script();
const expect = Code.expect;

describe('Config', () => {

    it('rejects on bad filename', async () => {

        const config = new Config();

        const error = await expect(config.load(undefined)).to.reject();
        expect(error.message).to.startWith('path must be a string or Buffer');
    });

    it('rejects if file is not found', async () => {

        const config = new Config();

        const error = await expect(config.load('./test/assets/nope.json')).to.reject();
        expect(error.message).to.startWith('ENOENT: no such file or directory');
    });

    it('rejects if syntax error is found in file', async () => {

        const config = new Config();

        const error = await expect(config.load('./test/assets/syntax-error.json')).to.reject();
        expect(error.message).to.startWith('Unexpected token _ in JSON at position');
    });

    it('rejects if file is empty', async () => {

        const config = new Config();

        const error = await expect(config.load('./test/assets/empty.json')).to.reject();
        expect(error.message).to.startWith('Unexpected end of JSON input while parsing near');
    });

    describe('get', () => {

        it('returns undefined if no file was loaded', () => {

            const config = new Config();

            expect(config.get('/thisEntryDoesNotExist')).to.be.undefined();
        });

        it('returns the expected values', async () => {

            const config = new Config();

            await config.load('./test/assets/config.json');

            config.filters = { env: 'development' };
            expect(config.get('/port')).to.equal(8888);
            expect(config.get('/host')).to.equal('localhost');
            expect(config.get('/magicNumber')).to.be.undefined();

            config.filters = { env: 'acceptance' };
            expect(config.get('/port')).to.equal(8888);
            expect(config.get('/host')).to.equal('none');
            expect(config.get('/magicNumber')).to.be.undefined();
            expect(config.get('/')['./path/to/plugin']).to.equal([{ select: ['api'] }]);

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

        describe('with env', () => {

            before(() => {

                process.env.MY_ENV_PORT = 8888;
                process.env.MY_ENV_USERNAME = 'myName';
                process.env.MY_ENV_PASSWORD = 'myPass';
                process.env.MY_ENV_SALT = 'mySalt';
            });

            after(() => {

                process.env.MY_ENV_PORT = undefined;
                process.env.MY_ENV_USERNAME = undefined;
                process.env.MY_ENV_PASSWORD = undefined;
                process.env.MY_ENV_SALT = undefined;
            });

            it('returns the expected values with parsed environment variables', async () => {

                const config = new Config();

                await config.load('./test/assets/config-with-env.json');

                expect(config.get('/port')).to.equal('8888');
                expect(config.get('/host')).to.equal(undefined);
                expect(config.get('/options/username')).to.equal('myName');
                expect(config.get('/options/keys/password')).to.equal('myPass');
                expect(config.get('/options/keys/salt')).to.equal('no$env.MY_ENV_SALT');
            });
        });
    });
});
