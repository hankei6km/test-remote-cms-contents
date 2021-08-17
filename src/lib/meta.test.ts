import { mockDataPageData } from '../test/testMockData';
import { meta } from './meta';

describe('meta()', () => {
  it('should makes meta from pageData', async () => {
    expect(await meta(mockDataPageData, { position: 1 })).toStrictEqual({
      position: 1,
      title: 'Home',
      link: '',
      keyword: [],
      allCategory: [
        { title: 'cat 1', id: 'cat1' },
        { title: 'cat 2', id: 'cat2' }
      ],
      category: [{ title: 'cat 2', id: 'cat2' }],
      description: 'description of draftlint',
      updated: '2020-12-27T04:04:30.107Z',
      image: 'image1.jpg'
    });
  });
});
