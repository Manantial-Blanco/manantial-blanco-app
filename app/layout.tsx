import './globals.css';
import { AppKitProvider } from '@/components/providers/AppKitProvider';
import { headers } from 'next/headers';
import { systemFont } from '@/lib/fonts';

export const metadata = {
  title: 'Manantial Blanco - Cultural IP Platform',
  description: 'Register, remix and monetize your art with verified ownership and automatic royalty payments.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <html suppressHydrationWarning className={systemFont.variable}>
      <body className={systemFont.className}>
        <AppKitProvider cookies={cookies}>{children}</AppKitProvider>
      </body>
    </html>
  );
}
