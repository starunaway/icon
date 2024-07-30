import { Res, SsoUser } from '@/types';
import enhancedServerFetch from './enhancedServerFetch';

const host = process.env.NEXT_PUBLIC_SSO_HOST;

/**
 * 校验token，获取用户信息
 * @param user
 * @returns
 */
export const getUserInfoByToken = async () => {
  const res = await enhancedServerFetch(`${host}/auth/userInfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  return res.json() as Promise<Res<SsoUser>>;
};
