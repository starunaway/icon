import getCookie from '@/utils/getCookie';
import host from './host';

const enhancedClientFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = getCookie('ep_token');
  return fetch(input, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    ...init,
  });
};

export async function createIcon(body: FormData) {
  const res = await enhancedClientFetch(`${host}/icon/create`, {
    method: 'POST',
    body: body,
  });

  const data = await res.json();

  if (!res.ok || data.code !== 0) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(data.message || 'server error');
  }
  return res;
}

export async function deleteIcon(id: string) {
  const res = await enhancedClientFetch(`${host}/icon/delete?id=${id}`, {
    method: 'DELETE',
  });

  const data = await res.json();

  if (!res.ok || data.code !== 0) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(data.message || 'server error');
  }
  return res;
}

export async function updateIcon(body: FormData) {
  const res = await enhancedClientFetch(`${host}/icon/update`, {
    method: 'POST',
    body: body,
  });

  const data = await res.json();

  if (!res.ok || data.code !== 0) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(data.message || 'server error');
  }

  return res;
}
