import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/header';
import { clsx } from 'clsx';
import { getIcons } from '@/api';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as HotToaster } from 'react-hot-toast';
import { getUserInfoByToken } from '@/api/user';
import StoreProvider from './_component/StoreProvider';

export const metadata: Metadata = {
  title: 'Xbot Icon',
  description: 'Xbot Icons',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getIcons();
  const insertHtml = data.content.reduce((pre: string, cur: { optimizeSvg: string }) => {
    pre += `${cur.optimizeSvg || ''}`;
    return pre;
  }, '');

  const res = await getUserInfoByToken();

  const { data: user, code } = res;

  return (
    <html lang="en">
      <body className={clsx('flex flex-col ')}>
        <Header title="Icon" user={user}></Header>
        <main className="flex-1  w-full h-full overflow-hidden">
          <StoreProvider user={user}>{children}</StoreProvider>
        </main>
        <Toaster />
        <HotToaster />
        <svg
          id="__svg__icons__dom__"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            width: '0',
            height: '0',
          }}
          dangerouslySetInnerHTML={{ __html: insertHtml }}
        ></svg>
      </body>
    </html>
  );
}
