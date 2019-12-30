import { promises as Fs } from 'fs';
import * as Confidence from 'confidence';
import * as StripJsonComments from 'strip-json-comments';

export class Config extends Confidence.Store {
  async loadFromFile(filename: string): Promise<void> {
    const data = await Fs.readFile(filename, 'utf-8');
    const manifest = JSON.parse(StripJsonComments(data));
    super.load(manifest);
  }

  static async getInstance(filename: string): Promise<Config> {
    const config = new Config();
    await config.loadFromFile(filename);
    return config;
  }
}
