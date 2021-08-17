import { Writable } from 'stream';
import { ApiNameArticle } from './types/apiName';
import { ClientOptions } from './lib/client';
import { saveRemoteContents } from './lib/remote';

type Opts = {
  stdout: Writable;
  stderr: Writable;
  outDir: string;
  apiName: ApiNameArticle;
} & ClientOptions;
const cli = async ({
  stdout,
  stderr,
  outDir,
  apiName,
  baseURL,
  getApiKey
}: Opts): Promise<number> => {
  let err: Error | null = null;
  try {
    err = await saveRemoteContents({ baseURL, getApiKey }, apiName, outDir);
  } catch (err) {
    stderr.write(err.toString());
    stderr.write('\n');
    return 1;
  }
  if (err) {
    return 1;
  }
  return 0;
};

export default cli;
