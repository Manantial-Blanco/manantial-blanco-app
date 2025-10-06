import { getDictionary, isValidLocale } from '@/lib/i18n/getDict';
import { Locale } from '@/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang as Locale);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/${lang}/landing`}>
            <h1 className="text-2xl font-bold">Manantial Blanco</h1>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <Link href={`/${lang}/home`} className="hover:text-[#F1E7D3]">
                {dict.common.home}
              </Link>
              <Link href={`/${lang}/pieces/new`} className="hover:text-[#F1E7D3]">
                {dict.pieces.registerNew}
              </Link>
            </nav>
            <LogoutButton lang={lang as Locale} label={dict.common.logout || 'Logout'} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-black mb-4">
            {dict.common.home}
          </h2>
          <p className="text-gray-600 text-lg">
            Welcome to your creative dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href={`/${lang}/pieces/new`}
            className="p-8 border-2 border-[#F1E7D3] bg-[#F1E7D3] rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 className="text-2xl font-semibold text-black mb-2">
              {dict.pieces.registerNew}
            </h3>
            <p className="text-gray-700">
              Register your artwork and protect your intellectual property
            </p>
          </Link>

          <Link
            href={`/${lang}/landing#catalog`}
            className="p-8 border-2 border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 className="text-2xl font-semibold text-black mb-2">
              {dict.landing.exploreTitle}
            </h3>
            <p className="text-gray-700">
              Browse and discover artwork from other creators
            </p>
          </Link>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-black mb-6">
            {dict.pieces.myPieces}
          </h3>
          <div className="text-center py-12 text-gray-500">
            <p>No pieces registered yet. Start by registering your first piece!</p>
          </div>
        </div>
      </main>
    </div>
  );
}
