import { use } from 'react';
import LoginPageClient from './LoginPageClient';

export default function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <LoginPageClient lang={lang} />;
}
