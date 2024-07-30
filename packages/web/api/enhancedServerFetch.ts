import { cookies } from 'next/headers';

const enhancedServerFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const cookieStore = cookies();
  const token = cookieStore.get('ep_token');

  return fetch(input, {
    ...init,
    headers: {
      Authorization: `Bearer ${token?.value}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
};

export default enhancedServerFetch;
