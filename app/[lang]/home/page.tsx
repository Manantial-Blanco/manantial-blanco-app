import { use } from 'react';
import dynamic from 'next/dynamic';
import { getDictionary, isValidLocale } from '@/lib/i18n/getDict';

// Dynamic import for HomePageClient to reduce initial bundle
const HomePageClient = dynamic(() => import('./HomePageClient'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-lg">Loading...</div>
    </div>
  ),
  ssr: true,
});

export default function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const locale = isValidLocale(lang) ? lang : 'en';
  const dict = getDictionary(locale);
  return <HomePageClient lang={locale} dict={dict} />;
}

