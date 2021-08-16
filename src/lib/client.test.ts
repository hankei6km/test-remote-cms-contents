import mockAxios from 'jest-mock-axios';
import client, { fetchConfig } from './client';

afterEach(() => {
  mockAxios.reset();
});

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

describe('client', () => {
  it('should call axios.request to get single item by id', async () => {
    const res = client('https://test-srv')
      .pages._id('home')
      .$get({
        config: fetchConfig('secret')
      });
    expect(mockAxios.request).toHaveBeenLastCalledWith({
      baseURL: 'https://test-srv',
      data: undefined,
      headers: { 'X-API-KEY': 'secret' },
      method: 'GET',
      params: undefined,
      responseType: 'json',
      url: '/api/v1/pages/home'
    });
    mockAxios.mockResponse({
      data: {
        id: 'home'
      }
    });
    await expect(res).resolves.toEqual({ id: 'home' });
  });
  it('should call axios.request to get ids list', async () => {
    const res = client('https://test-srv').pages.get({
      query: {
        fields: 'id'
      },
      config: fetchConfig('secret')
    });
    expect(mockAxios.request).toHaveBeenLastCalledWith({
      baseURL: 'https://test-srv',
      data: undefined,
      headers: { 'X-API-KEY': 'secret' },
      method: 'GET',
      params: {
        fields: 'id'
      },
      responseType: 'json',
      url: '/api/v1/pages'
    });
    mockAxios.mockResponse({
      data: ['home', 'blog']
    });
    expect((await res).body).toEqual(['home', 'blog']);
  });
});
