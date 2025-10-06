import { getDictionary, isValidLocale } from '@/lib/i18n/getDict';
import { Locale } from '@/types';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  return <>{children}</>;
}
