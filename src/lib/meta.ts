import { blankMetaData, MetaData } from '../types/metaTypes';
import { PageData } from '../types/pageTypes';

type MetaOptions = {
  position: number;
};
export async function meta(
  page: PageData,
  opts: MetaOptions
): Promise<MetaData> {
  // 画像の情報等を扱うことを想定して async にしてある.
  const ret = blankMetaData();

  ret.position = opts.position;
  ret.title = page.title;
  ret.created = page.created;
  ret.updated = page.updated;
  ret.allCategory = page.allCategory.map(({ title, id }) => ({
    title,
    id
  }));
  ret.category = page.category.map(({ title, id }) => ({
    title,
    id
  }));
  ret.description = page.description;
  ret.image = page.mainVisual.url;

  return ret;
}
