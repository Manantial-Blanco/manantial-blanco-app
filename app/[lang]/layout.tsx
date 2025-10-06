import { getDictionary, isValidLocale } from '@/lib/i18n/getDict';
import { Locale } from '@/types';
import { notFound } from 'next/navigation';
import Footer from '@/components/layout/Footer';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const { lang } = params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">{children}</main>
      <Footer dict={dict} />
    </div>
  );
}
