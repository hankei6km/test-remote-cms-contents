import { resolve } from 'path';
import { writeFile } from 'fs/promises';
import { ApiNameArticle } from '../types/apiName';
import { PageData } from '../types/pageTypes';
import { ClientOptions } from './client';
import { meta } from './meta';
import { getAllPagesIds, getPagesData } from './pages';
import matter from 'gray-matter';

export async function saveFile(
  page: PageData,
  outDir: string,
  position: number
): Promise<Error | null> {
  let ret: Error | null = null;

  // id に含まれる文字でトラバーサルにはならないのでとくにチェックはしない.
  // CMS によって事情が異なるので注意.
  const savePath = `${resolve(outDir, page.id)}.md`; // 拡張子を付ける API なかったけ?

  try {
    const metaData = await meta(page, { position });
    const markdown = page.content; // 今回はフロントマターはないのでそのまま使う
    const file = matter.stringify(markdown, metaData);
    await writeFile(savePath, file);
  } catch (err) {
    ret = err;
  }

  return ret;
}

export async function saveRemoteContents(
  clientOpts: ClientOptions,
  apiName: ApiNameArticle,
  outDir: string
): Promise<Error | null> {
  let ret: Error | null = null;
  try {
    const ids = await getAllPagesIds(clientOpts, apiName);
    const len = ids.length;
    for (let idx = 0; idx < len; idx++) {
      const res = await getPagesData(clientOpts, apiName, {
        params: { id: ids[idx] }
      });
      ret = await saveFile(res, outDir, idx);
      if (ret) {
        break;
      }
    }
  } catch (err) {
    // console.log('err:', err);
    ret = err;
  }
  return ret;
}
