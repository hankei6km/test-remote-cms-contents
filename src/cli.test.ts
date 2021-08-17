import { PassThrough } from 'stream';
import cli from './cli';

jest.mock('./lib/remote', () => {
  const mockSaveRemoteContentsFn = async (
    a1: any,
    a2: string,
    pathName: string
  ) => {
    if (pathName.match(/error/)) {
      return new Error('dummy error');
    }
    return null;
  };
  let mockSaveRemoteContents = jest
    .fn()
    .mockImplementation(mockSaveRemoteContentsFn);
  return {
    saveRemoteContents: mockSaveRemoteContents,
    _reset: () => {
      mockSaveRemoteContents.mockReset();
      mockSaveRemoteContents.mockResolvedValue(null);
    },
    _getMocks: () => ({
      mockSaveRemoteContents
    })
  };
});

afterEach(() => {});

describe('cli()', () => {
  it('should return stdout with exitcode=0', async () => {
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    let outData = '';
    stdout.on('data', (d) => (outData = outData + d));
    let errData = '';
    stderr.on('data', (d) => (errData = errData + d));

    const res = cli({
      stdout,
      stderr,
      outDir: '/path',
      apiName: 'pages',
      baseURL: 'http://localhost:3000',
      getApiKey: 'secret'
    });
    expect(await res).toEqual(0);
    const { mockSaveRemoteContents } = require('./lib/remote')._getMocks();
    expect(mockSaveRemoteContents.mock.calls[0]).toEqual([
      { baseURL: 'http://localhost:3000', getApiKey: 'secret' },
      'pages',
      '/path'
    ]);
    expect(outData).toEqual('');
    expect(errData).toEqual('');
  });
  it('should return stderr with exitcode=1', async () => {
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    let outData = '';
    stdout.on('data', (d) => (outData = outData + d));
    let errData = '';
    stderr.on('data', (d) => (errData = errData + d));

    const res = cli({
      stdout,
      stderr,
      outDir: '/path/error',
      apiName: 'pages',
      baseURL: 'http://localhost:3000',
      getApiKey: 'secret'
    });
    expect(await res).toEqual(1);
    expect(outData).toEqual('');
    expect(errData).toEqual('');
  });
});
