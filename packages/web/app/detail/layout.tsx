import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Xbot Icon',
  description: 'Xbot Icons',
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="w-full h-full overflow-auto">{children}</div>;
}
