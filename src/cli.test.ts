import mockAxios from 'jest-mock-axios';
import { PassThrough } from 'stream';
import cli from './cli';

afterEach(() => {
  mockAxios.reset();
});

describe('cli()', () => {
  it('should return stdout with exitcode=0', async () => {
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const outData = jest.fn();
    stdout.on('data', outData);
    const errData = jest.fn();
    stderr.on('data', errData);

    const res = cli({
      stdout,
      stderr,
      outDir: '/path',
      apiName: 'pages',
      baseURL: 'http://localhost',
      getApiKey: 'secret'
    });
    mockAxios.mockResponse({
      data: { contents: [] }
    });
    expect(await res).toEqual(0);
  });
});
