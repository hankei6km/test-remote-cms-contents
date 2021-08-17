import { mockDataPageData } from '../test/testMockData';
import { ClientOptions } from './client';
import { saveFile, saveRemoteContents } from './remote';

// import { getAllPagesIds, getPagesData } from './pages';

jest.mock('fs/promises', () => {
  const mockWriteFileFn = async (pathName: string) => {
    if (pathName.match(/error/)) {
      throw new Error('dummy error');
    }
    return null;
  };
  let mockWriteFile = jest.fn().mockImplementation(mockWriteFileFn);
  return {
    writeFile: mockWriteFile,
    _reset: () => {
      mockWriteFile.mockReset();
      mockWriteFile.mockImplementation(mockWriteFileFn);
    },
    _getMocks: () => ({
      mockWriteFile
    })
  };
});

jest.mock('./pages', () => {
  let mockGetAllPagesIds = jest.fn().mockResolvedValue(['home', 'posts']);
  let mockGetPagesData = jest
    .fn()
    .mockResolvedValueOnce(mockDataPageData[0])
    .mockResolvedValueOnce(mockDataPageData[1]);
  return {
    getAllPagesIds: mockGetAllPagesIds,
    getPagesData: mockGetPagesData,
    _reset: () => {
      mockGetAllPagesIds.mockReset();
      mockGetAllPagesIds.mockResolvedValue(['home', 'posts']);
      mockGetPagesData.mockReset();
      mockGetPagesData
        .mockResolvedValueOnce(mockDataPageData[0])
        .mockResolvedValueOnce(mockDataPageData[1]);
    },
    _getMocks: () => ({
      mockGetAllPagesIds,
      mockGetPagesData
    })
  };
});

afterEach(() => {
  require('fs/promises')._reset();
  require('./pages')._reset();
});

const clientOpts: ClientOptions = {
  baseURL: 'http://localhost:3000',
  getApiKey: 'secret1'
};

describe('saveFile()', () => {
  it('should save text that is included frontmatter to a file', async () => {
    const res = saveFile(mockDataPageData[0], '/path', 1);
    await expect(res).resolves.toEqual(null);
    const { mockWriteFile } = require('fs/promises')._getMocks();
    expect(mockWriteFile.mock.calls[0][1]).toContain('title: Home');
    expect(mockWriteFile.mock.calls[0][1]).toContain('position: 1');
    expect(mockWriteFile.mock.calls[0][1]).toContain('home page');
  });
  it('should return error', async () => {
    const res = saveFile(mockDataPageData[0], '/path/error', 1);
    expect(String(await res)).toMatch(/dummy error/);
  });
});

describe('saveRemoteContents()', () => {
  it('should get remote content and save as local files', async () => {
    const res = saveRemoteContents(clientOpts, 'pages', '/path');
    await expect(res).resolves.toEqual(null);
    const {
      mockGetAllPagesIds,
      mockGetPagesData
    } = require('./pages')._getMocks();
    expect(mockGetAllPagesIds.mock.calls[0]).toEqual([
      { baseURL: 'http://localhost:3000', getApiKey: 'secret1' },
      'pages'
    ]);
    expect(mockGetPagesData.mock.calls[0]).toEqual([
      { baseURL: 'http://localhost:3000', getApiKey: 'secret1' },
      'pages',
      { params: { id: 'home' } }
    ]);
    expect(mockGetPagesData.mock.calls[1]).toEqual([
      { baseURL: 'http://localhost:3000', getApiKey: 'secret1' },
      'pages',
      { params: { id: 'posts' } }
    ]);
    const { mockWriteFile } = require('fs/promises')._getMocks();
    expect(mockWriteFile.mock.calls[0][0]).toEqual('/path/home.md');
    expect(mockWriteFile.mock.calls[0][1]).toContain('title: Home');
    expect(mockWriteFile.mock.calls[0][1]).toContain('position: 0');
    expect(mockWriteFile.mock.calls[0][1]).toContain('home page');
    expect(mockWriteFile.mock.calls[1][0]).toEqual('/path/posts.md');
    expect(mockWriteFile.mock.calls[1][1]).toContain('title: Blog');
    expect(mockWriteFile.mock.calls[1][1]).toContain('position: 1');
    expect(mockWriteFile.mock.calls[1][1]).toContain('documents page');
  });
  it('should return error', async () => {
    const res = saveRemoteContents(clientOpts, 'pages', '/path/error');
    expect(String(await res)).toMatch(/dummy error/);
  });
});
