import mockAxios from 'jest-mock-axios';
import { ClientOptions } from './client';
import { getRemoteFiles } from './remote';

afterEach(() => {
  mockAxios.reset();
});

const clientOpts: ClientOptions = {
  baseURL: 'http://localhost:3000',
  getApiKey: 'secret1'
};

describe('getRemoteFiles()', () => {
  it('should throw error', async () => {
    const res = getRemoteFiles(clientOpts, 'pages', '/path');
    mockAxios.mockResponse({
      data: { contents: [] }
    });
    await expect(res).resolves.toEqual(null);
  });
});
