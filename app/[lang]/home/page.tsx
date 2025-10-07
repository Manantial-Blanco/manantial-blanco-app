import { use } from 'react';
import HomePageClient from './HomePageClient';
import { getDictionary, isValidLocale } from '@/lib/i18n/getDict';

export default function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const locale = isValidLocale(lang) ? lang : 'en';
  const dict = getDictionary(locale);
  return <HomePageClient lang={locale} dict={dict} />;
}

