import { ApiNameArticle } from '../types/apiName';
import { ClientOptions } from './client';
import { getAllPagesIds, getPagesData } from './pages';

export async function getRemoteFiles(
  clientOpts: ClientOptions,
  apiName: ApiNameArticle,
  outDir: string
): Promise<Error | null> {
  let ret: Error | null = null;
  try {
    const ids = await getAllPagesIds(clientOpts, apiName);
    console.log('ids:', ids);
    const len = ids.length;
    for (let idx = 0; idx < len; idx++) {
      const res = await getPagesData(clientOpts, apiName, {
        params: { id: ids[idx] }
      });
      console.log('res:', res);
    }
  } catch (err) {
    console.log('err:', err);
    ret = err;
  }
  return ret;
}
