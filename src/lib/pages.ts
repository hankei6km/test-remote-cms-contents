// import { Writable } from 'stream';
import client, { ClientOptions, fetchConfig } from './client';
import {
  PagesList,
  PagesIds,
  // PagesContent,
  blankPagesList
  // blankPageContent
} from '../types/client/contentTypes';
import { GetQuery, GetContentQuery } from '../types/client/queryTypes';
import {
  PageData,
  blankPageData,
  IndexData,
  blankIndexData,
  IndexList,
  blankIndexList
} from '../types/pageTypes';
import { applyPreviewDataToIdQuery } from './preview';
// TODO: preview  は保留.
// import { draftLint } from './draftlint';
import { ApiNameArticle } from '../types/apiName';
import {
  paginationIdsFromPageCount,
  pageCountFromTotalCount
} from '../utils/pagination';
import { htmlToMarkdown } from './source';
//import { metaPage } from './meta';
// import { getTextlintKernelOptions } from '../utils/textlint';

// const itemsPerPage = 10;
// id が 1件で 40byte  と想定、 content-length が 5M 程度とのことなので、1000*1000*5 / 40 で余裕を見て決めた値。
const allIdsLimit = 120000;

export type PageDataGetOptions = {
  // ページの主題となる一覧を取得する場合に指定(ブログページで posps API を指定するなど)
  // コンテンツ側からは congtentPageArticles として指定する。
  // カテゴリは下記の curCategory が使われる.
  // articlesApi?: ApiNameArticle;
  // route 上で選択されているカテゴリ(page 内の category[] のうちの１つになるはず).
  curCategory?: string;
  // ページング用j
  itemsPerPage?: number;
  pageNo?: number;
};

export async function getSortedPagesData(
  { baseURL, getApiKey, globalDraftKey }: ClientOptions,
  apiName: ApiNameArticle,
  query: GetQuery = {}
): Promise<PagesList> {
  try {
    const res = await client(baseURL)[apiName].get({
      query: {
        ...query,
        fields:
          'id,createdAt,updatedAt,publishedAt,revisedAt,title,content,category,mainVisual'
      },
      config: fetchConfig(getApiKey, globalDraftKey)
    });
    return res.body;
  } catch (err) {
    // res.status = 404 などでも throw される(試した限りでは)
    // res.status を知る方法は?
    console.error(`getSortedPagesData error: ${err.name}`);
  }
  return blankPagesList();
}

export async function getSortedIndexData(
  { baseURL, getApiKey, globalDraftKey }: ClientOptions,
  apiName: ApiNameArticle,
  query: GetQuery = {}
): Promise<IndexList> {
  try {
    const res = await client(baseURL)[apiName].get({
      query: {
        ...query,
        fields:
          'id,createdAt,updatedAt,publishedAt,revisedAt,title,content,category,mainVisual'
      },
      config: fetchConfig(getApiKey, globalDraftKey)
    });
    const p = res.body.contents.map((res) => {
      return async (): Promise<IndexData> => {
        // ここでは res.content は markdown として扱う
        const articleTitle = res.title;
        const mainVisual = res.mainVisual?.url
          ? res.mainVisual
          : {
              url: '',
              width: 0,
              height: 0
            };
        const ret = {
          ...blankIndexData(),
          id: res.id,
          created: res.createdAt,
          updated: res.updatedAt,
          title: res.title,
          category: apiName !== 'pages' ? res.category || [] : [],
          articleTitle,
          mainVisual: {
            ...mainVisual
          },
          description: res.description || ''
        };
        // ret.meta = metaPage({ apiName, ...ret, hash });
        return ret;
      };
    });
    return {
      ...res.body,
      contents: await Promise.all(p.map((p) => p()))
    };
  } catch (err) {
    // res.status = 404 などでも throw される(試した限りでは)
    // res.status を知る方法は?
    console.error(`getSortedPagesData error: ${err.name}`);
  }
  return blankIndexList();
}

export async function getPagesIdsList(
  { baseURL, getApiKey, globalDraftKey }: ClientOptions,
  apiName: ApiNameArticle,
  query: GetQuery = {}
): Promise<PagesIds> {
  try {
    const res = await client(baseURL)[apiName].get({
      query: {
        ...query,
        fields: 'id'
      },
      config: fetchConfig(getApiKey, globalDraftKey)
    });
    return res.body;
  } catch (err) {
    console.error(`getPagesIdsList error: ${err.name}`);
  }
  return blankPagesList();
}

export async function getAllPagesIds(
  clientOpts: ClientOptions,
  apiName: ApiNameArticle,
  query: GetQuery = {}
) {
  try {
    return (
      await getPagesIdsList(clientOpts, apiName, {
        ...query,
        limit: query.limit !== undefined ? query.limit : allIdsLimit
      })
    ).contents.map(({ id }) => id);
  } catch (err) {
    console.error(`getAllPagesIds error: ${err.name}`);
  }
  return [];
}

export async function getAllPaginationIds(
  clientOpts: ClientOptions,
  apiName: ApiNameArticle,
  itemsPerPage: number,
  pagePath: string[] = [],
  query: GetQuery = {}
): Promise<string[][]> {
  try {
    const idsList = await getPagesIdsList(clientOpts, apiName, {
      ...query,
      limit: 0
    });
    return paginationIdsFromPageCount(
      pageCountFromTotalCount(idsList.totalCount, itemsPerPage),
      pagePath
    );
  } catch (err) {
    console.error(`getAllPagesIdsPageCount error: ${err.name}`);
  }
  return [];
}

export async function getAllCategolizedPaginationIds(
  clientOpts: ClientOptions,
  apiName: ApiNameArticle,
  category: string[],
  itemsPerPage: number,
  pagePath: string[] = ['page'],
  query: GetQuery = {}
) {
  try {
    let ret: string[][] = category.map((cat) => [cat]);
    // Promis.all だと、各カテゴリの ids をすべて保持しておく瞬間があるのでやめておく.
    // totalCount を使うようにしたので、上記の制約はないが、とりあえずそのまま
    const categoryLen = category.length;
    for (let idx = 0; idx < categoryLen; idx++) {
      const cat = category[idx];
      const ids = await getAllPaginationIds(
        clientOpts,
        apiName,
        itemsPerPage,
        pagePath,
        {
          ...query,
          filters: `category[contains]${cat}`
        }
      );
      ret = ret.concat(ids.map((id) => [cat, ...id]));
    }
    return ret;
  } catch (err) {
    console.error(`getAllPagesIdsPageCount error: ${err.name}`);
  }
  return [];
}

export async function getPagesData(
  { baseURL, getApiKey, globalDraftKey }: ClientOptions,
  apiName: ApiNameArticle,
  { params = { id: '' }, preview = false, previewData = {} }: any,
  options: PageDataGetOptions = {
    itemsPerPage: 10
  }
): Promise<PageData> {
  try {
    const [id, query] = applyPreviewDataToIdQuery<GetContentQuery>(
      preview,
      previewData,
      apiName,
      params.id as string,
      {
        fields:
          'id,createdAt,updatedAt,publishedAt,revisedAt,title,content,category,mainVisual,description'
      }
    );
    const res = await client(baseURL)
      [apiName]._id(id)
      .$get({
        query: query,
        config: fetchConfig(getApiKey, globalDraftKey)
      });

    const articleTitle = res.title;
    const markdown = await htmlToMarkdown(res.content || '');
    const mainVisual = res.mainVisual?.url
      ? res.mainVisual
      : {
          url: '',
          width: 0,
          height: 0
        };
    const ret: PageData = {
      ...blankPageData(),
      id: res.id,
      created: res.createdAt,
      updated: res.updatedAt,
      title: res.title,
      pageNo: options.pageNo !== undefined ? options.pageNo : 1,
      pageCount: -1, // あとで設定する
      // pages の各ページの category を all category として利用(API コール回数、定義数削減)
      allCategory: apiName === 'pages' ? res.category || [] : [],
      category: apiName !== 'pages' ? res.category || [] : [],
      curCategory: options.curCategory || '',
      articleTitle,
      content: markdown,
      mainVisual: {
        ...mainVisual
      },
      description: res.description || ''
      //feedUrl: siteServerSideConfig.globalFeedUrl
    };
    // ret.meta = metaPage({
    //   apiName,
    //   ...ret,
    //   deck: ret.deck.slide,
    //   hash: ret.deck.hash
    // });
    return ret;
  } catch (err) {
    // console.error(`getPagesData error: ${err.name}`);
    console.error(`getPagesData error: ${err}`);
  }
  return blankPageData();
}
