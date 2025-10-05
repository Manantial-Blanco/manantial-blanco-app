import { getDictionary, isValidLocale } from '@/lib/i18n/getDict';
import { Locale } from '@/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getPieceToken } from '@/lib/services/story';

export default async function PieceDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang as Locale);

  // Fetch piece from Supabase if configured
  let piece: any = null;
  let tokenInfo: any = null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('pieces')
        .select(
          `
          *,
          users!creator_user_id (
            display_name,
            wallet_address
          )
        `
        )
        .eq('id', id)
        .single();

      if (!error && data) {
        piece = data;

        // Get token info if piece has been minted
        if (piece.token_id) {
          tokenInfo = await getPieceToken(piece.token_id);
        }
      }
    } catch (error) {
      console.error('Error fetching piece:', error);
    }
  }

  if (!piece) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/${lang}/landing`}>
            <h1 className="text-2xl font-bold">Manantial Blanco</h1>
          </Link>
          <Link href={`/${lang}/landing#catalog`} className="hover:text-[#F1E7D3]">
            ← Back to Catalog
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div>
            <img
              src={piece.image_url}
              alt={piece.title}
              className="w-full h-auto rounded-lg border border-gray-200"
            />
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-bold text-black mb-4">{piece.title}</h1>
            <p className="text-xl text-gray-600 mb-6">
              by {piece.users?.display_name || 'Unknown Artist'}
            </p>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-black mb-2">
                Description
              </h3>
              <p className="text-gray-700">{piece.description}</p>
            </div>

            {piece.tags && piece.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-black mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {piece.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#F1E7D3] text-black rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tokenInfo && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-black mb-2">
                  Token Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Token ID:</span>{' '}
                    {tokenInfo.tokenId}
                  </p>
                  <p>
                    <span className="font-medium">Contract:</span>{' '}
                    {tokenInfo.contract}
                  </p>
                  <p>
                    <span className="font-medium">Owner:</span> {tokenInfo.owner}
                  </p>
                </div>
              </div>
            )}

            {piece.can_remix && (
              <div className="mt-8">
                <Link
                  href={`/${lang}/remix/${piece.id}`}
                  className="inline-block py-3 px-8 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
                >
                  Start Remix
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
