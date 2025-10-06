import { use } from 'react';
import LoginPageClient from './LoginPageClient';
import { getDictionary, isValidLocale } from '@/lib/i18n/getDict';

export default function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const locale = isValidLocale(lang) ? lang : 'en';
  const dict = getDictionary(locale);
  return <LoginPageClient lang={locale} dict={dict} />;
}
