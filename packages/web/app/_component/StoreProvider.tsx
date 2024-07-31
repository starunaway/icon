'use client';
import { AppStore, makeStore } from '@/lib/store';
import { initialUser } from '@/lib/store/slices/user';
import { SsoUser } from '@/types';
import { useRef } from 'react';
import { Provider } from 'react-redux';

export default function StoreProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SsoUser;
}) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
    storeRef.current.dispatch(initialUser(user));
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
