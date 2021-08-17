import { PagesCategory } from './client/contentTypes';

export type MetaData = {
  position: number; // API から取得したときの並び順.
  title: string;
  link: string;
  updated: string;
  keyword: string[]; // 今回は使わない
  allCategory: PagesCategory[]; // pages API で使うときもある(API で使う category の一覧).
  category: PagesCategory[];
  description: string;
  image: string; // Tewitter card 等のバリエーションは保持しない、利用時に生成する(imgix 前提)
};

export const blankMetaData = (): MetaData => ({
  position: -1,
  title: '',
  link: '',
  updated: '', // 現在時刻を入れておくか？
  keyword: [],
  allCategory: [],
  category: [],
  description: '',
  image: ''
});
