import axiosClient from '@aspida/axios';
import axios from 'axios';
import api from './types/client/$api';

export const fetchConfig = (getApiKey: string, globalDraftKey: string = '') => {
  if (getApiKey === '' && process.env.NODE_ENV !== 'test') {
    console.error('$GET_API_KEY is not defined.');
  }
  const headers: { [key: string]: string } = { 'X-API-KEY': getApiKey };
  if (globalDraftKey) {
    headers['X-GLOBAL-DRAFT-KEY'] = globalDraftKey;
  }
  return { headers };
};

const clientV1 = (baseURL: string) =>
  api({ ...axiosClient(axios), baseURL }).api.v1;

export default clientV1;
