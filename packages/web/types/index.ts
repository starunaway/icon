export * from './user';

export interface IconItemInfo {
  id: string;
  name: string;
  svg: string;
  optimizeSvg: string;
  desc: string;
  creator: string;
  updater: string;
  label: 'normal' | 'color';
  tag: string[];
  createTime: string;
  updateTime: string;
}

export interface IconContent {
  name: string;
  svg: string;
  optimizeSvg: string;
  label: 'normal' | 'color';
  tag?: string[];
}

export type Res<T> = {
  code: number;
  data: T;
  message: string;
};
