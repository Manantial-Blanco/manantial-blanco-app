import { getDictionary, isValidLocale } from '@/lib/i18n/getDict';
import { Locale } from '@/types';
import { notFound } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import { RegistrationProvider } from '@/components/providers/RegistrationProvider';

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }];
}

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  // Type assertion after validation
  const validLang = lang as Locale;

  const dict = await getDictionary(validLang);

  return (
    <RegistrationProvider dict={dict}>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">{children}</main>
        <Footer dict={dict} />
      </div>
    </RegistrationProvider>
  );
}
