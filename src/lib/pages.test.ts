import mockAxios from 'jest-mock-axios';
import { mockDataPagesList, mockDataPagesHome } from '../test/testMockData';
import { getSortedPagesData, getAllPagesIds, getPagesData } from './pages';
import { queryParams } from '../test/testUtils';
import { mockDataPagesIds } from '../test/testMockData';

afterEach(() => {
  mockAxios.reset();
});

// テスト別に切り替えるのは難しいか.
//jest.mock('../utils/baseUrl', () => ({
//  ...jest.requireActual('../utils/baseUrl'),
//  getBaseUrl: () => 'https://hankei6km.github.io/mardock'
//}));

describe('getSortedPagesData()', () => {
  it('should returns contents array with out displayOnIndexPage filed', async () => {
    const res = getSortedPagesData('pages');
    mockAxios.mockResponse({
      data: JSON.parse(JSON.stringify(mockDataPagesList)),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    });
    expect(mockAxios.request).toHaveBeenCalledTimes(1);
    expect(mockAxios.request.mock.calls[0][0].url).toContain('/pages');
    expect(mockAxios.request.mock.calls[0][0].params).toStrictEqual({
      fields:
        'id,createdAt,updatedAt,publishedAt,revisedAt,title,content,sourceContents,sourcePages,source,category,mainVisual'
    });
    expect(await res).toStrictEqual({
      contents: [
        {
          id: 'home',
          createdAt: '2020-12-27T04:04:30.107Z',
          updatedAt: '2020-12-27T04:04:30.107Z',
          publishedAt: '2020-12-27T04:04:30.107Z',
          revisedAt: '2020-12-27T04:04:30.107Z',
          description: 'description of draftlint',
          title: 'Home',
          category: []
        },
        {
          id: 'posts',
          createdAt: '2020-12-26T15:29:14.476Z',
          updatedAt: '2020-12-26T15:29:14.476Z',
          publishedAt: '2020-12-26T15:29:14.476Z',
          revisedAt: '2020-12-26T15:29:14.476Z',
          title: 'Blog',
          category: []
        }
      ],
      totalCount: 2,
      offset: 0,
      limit: 120000
    });
  });
  it('should pass query params', async () => {
    const res = getSortedPagesData('pages', {
      filters: 'displayOnIndexPage[equals]true'
    });
    mockAxios.mockResponse({
      data: JSON.parse(JSON.stringify(mockDataPagesList)),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    });
    await res;
    expect(mockAxios.request).toHaveBeenCalledTimes(1);
    expect(mockAxios.request.mock.calls[0][0].url).toContain('/pages');
    expect(mockAxios.request.mock.calls[0][0].params).toStrictEqual({
      fields:
        'id,createdAt,updatedAt,publishedAt,revisedAt,title,content,sourceContents,sourcePages,source,category,mainVisual',
      filters: 'displayOnIndexPage[equals]true'
    });
    // expect(fetchMock.mock.calls[0][1]?.headers) 環境変数の設定とメッセージによっては API キーが漏洩する可能性があるのでとりあえずやめる
  });
});

describe('getAllPagesIds()', () => {
  it('should returns all ids', async () => {
    const res = getAllPagesIds('pages');
    mockAxios.mockResponse({
      data: JSON.parse(JSON.stringify(mockDataPagesIds)),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    });
    expect(mockAxios.request.mock.calls[0][0].url).toContain('/pages');
    expect(mockAxios.request.mock.calls[0][0].params).toStrictEqual({
      fields: 'id',
      limit: 120000
    });
    expect(await res).toStrictEqual(['home', 'posts']);
  });
});
describe('getPagesData()', () => {
  it('should returns pageData', async () => {
    const res = getPagesData('pages', { params: { id: 'home' } });
    mockAxios.mockResponse({
      data: JSON.parse(JSON.stringify(mockDataPagesHome)),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    });
    expect(mockAxios.request.mock.calls[0][0].url).toContain('/pages/home');
    expect(mockAxios.request.mock.calls[0][0].params).toStrictEqual({
      fields:
        'id,createdAt,updatedAt,publishedAt,revisedAt,title,content,sourceContents,sourcePages,source,category,mainVisual,description'
    });
    expect(await res).toStrictEqual({
      id: 'home',
      title: 'Home',
      pageCount: -1,
      pageNo: 1,
      allCategory: [],
      category: [],
      curCategory: '',
      description: 'description of draftlint',
      articleTitle: 'Home',
      updated: '2020-12-27T04:04:30.107Z',
      htmlToc: {
        items: []
      },
      html: 'home page\n',
      mainVisual: {
        url: '',
        width: 0,
        height: 0
      },
      meta: {
        title: '',
        link: '',
        updated: '',
        keyword: [],
        description: '',
        image: ''
      },
      feedUrl: ''
    });
  });
});
