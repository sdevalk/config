import { Config } from '../src';
import * as fs from 'fs';

let config: Config;

beforeEach(() => {
  config = new Config();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('loadFromFile', () => {
  it('rejects if filename is invalid', async () => {
    const filename: any = undefined; // tslint:disable-line:no-any
    await expect(config.loadFromFile(filename)).rejects.toThrow(
      'The "path" argument must be one of type string, Buffer, or URL. Received type undefined'
    );
  });

  it('rejects if file does not exist', async () => {
    await expect(
      config.loadFromFile('thisFileDoesNotExist.json')
    ).rejects.toThrow(
      "ENOENT: no such file or directory, open 'thisFileDoesNotExist.json'"
    );
  });

  it('rejects if file contains invalid JSON', async () => {
    jest.spyOn(fs.promises, 'readFile').mockResolvedValue('badJSON');

    await expect(config.loadFromFile('config.json')).rejects.toThrow(
      'Unexpected token b in JSON at position 0'
    );
  });

  it('rejects if file is empty', async () => {
    jest.spyOn(fs.promises, 'readFile').mockResolvedValue('');

    await expect(config.loadFromFile('config.json')).rejects.toThrow(
      'Unexpected end of JSON input'
    );
  });

  it('accepts JSON file', async () => {
    jest.spyOn(fs.promises, 'readFile').mockResolvedValue(`{
      "this": {
        "is": "a test"
      }
    }`);

    await expect(config.loadFromFile('config.json')).resolves.not.toThrow();
  });

  it('accepts comments in JSON file', async () => {
    jest.spyOn(fs.promises, 'readFile').mockResolvedValue(`{
      "this": {
        "is": /* comment1 */ "a test" // comment2
      }
    }`);

    await expect(config.loadFromFile('config.json')).resolves.not.toThrow();
  });
});

describe('getInstance', () => {
  it('rejects if file could not be loaded', async () => {
    jest.spyOn(fs.promises, 'readFile').mockResolvedValue(''); // Random error
    await expect(Config.getInstance('config.json')).rejects.toThrow();
  });

  it('returns a Config instance if file has been loaded', async () => {
    jest.spyOn(fs.promises, 'readFile').mockResolvedValue(`{
      "this": {
        "is": "a test"
      }
    }`);
    await expect(Config.getInstance('config.json')).resolves.toBeInstanceOf(
      Config
    );
  });
});
