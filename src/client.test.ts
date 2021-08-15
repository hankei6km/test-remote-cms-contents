import { fetchConfig } from './client';

describe('fetchConfig()', () => {
  it('should return setuped object', () => {
    expect(fetchConfig('secret')).toEqual({
      headers: {
        'X-API-KEY': 'secret'
      }
    });
    expect(fetchConfig('secret', 'global')).toEqual({
      headers: {
        'X-API-KEY': 'secret',
        'X-GLOBAL-DRAFT-KEY': 'global'
      }
    });
  });
});
