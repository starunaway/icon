import { IconContent, IconItemInfo } from '@/types';
import host from './host';

export async function getIcons() {
  const res = await fetch(`${host}/icon/listContent?type=all`, {
    cache: 'no-cache',
  });
  const data = await res.json();

  if (!res.ok || data.code !== 0) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(data.message || 'server error');
  }

  return data.data as {
    lastUpdateTime: number;
    content: IconContent[];
  };
}

export async function getIconDetail(name: string) {
  const res = await fetch(`${host}/icon/detail?name=${name}`, {
    next: { revalidate: 30 },
  });

  const data = await res.json();

  if (!res.ok || data.code !== 0) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(data.message || 'server error');
  }

  return data.data as IconItemInfo;
}
