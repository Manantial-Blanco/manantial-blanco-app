import './globals.css';

export const metadata = {
  title: 'Manantial Blanco - Cultural IP Platform',
  description: 'Register, remix and monetize your art with verified ownership and automatic royalty payments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
