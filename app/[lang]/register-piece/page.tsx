import { use } from 'react';
import RegisterPieceClient from './RegisterPieceClient';
import { getDictionary, isValidLocale } from '@/lib/i18n/getDict';

export default function RegisterPiecePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const locale = isValidLocale(lang) ? lang : 'en';
  const dict = getDictionary(locale);
  return <RegisterPieceClient lang={locale} dict={dict} />;
}
