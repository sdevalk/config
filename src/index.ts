import { promises as Fs } from 'fs';
import * as Confidence from 'confidence';
import * as StripJsonComments from 'strip-json-comments';

export class Config {
  protected store: Confidence.Store;

  constructor() {
    this.store = new Confidence.Store();
  }

  async loadFromFile(filename: string): Promise<void> {
    const data = await Fs.readFile(filename, 'utf-8');
    const manifest = JSON.parse(StripJsonComments(data));
    this.store.load(manifest);
  }

  // tslint:disable-next-line:no-any
  get(key: string, criteria?: any) {
    return this.store.get(key, criteria);
  }

  static async getInstance(filename: string): Promise<Config> {
    const config = new Config();
    await config.loadFromFile(filename);
    return config;
  }
}
