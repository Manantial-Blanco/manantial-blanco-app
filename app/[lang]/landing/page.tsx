import { getDictionary, isValidLocale } from '@/lib/i18n/getDict';
import { Locale } from '@/types';
import { notFound } from 'next/navigation';
import LandingUI from '@/components/imported/LandingUI';
import { Address } from 'viem';

// Story Protocol API Configuration
const STORY_API_BASE_URL = process.env.NEXT_PUBLIC_STORY_API_URL || 'https://api.storyapis.com/api/v4';
const STORY_API_KEY = process.env.STORY_API_KEY || '';
const FEATURED_WALLETS = [
  '0x19435c8368E81f7f72078DFf1D177fc9C1fC1a3F',
  '0x6B7572a1712b27D2E76Bd9ef6533022693314d54',
  '0x7e764d0C7be74d548f4836D357a31D17B0A81fB9',
  '0x2842decf9baEb5ec76988d1261325329848522Ae',
];

async function fetchStoryProtocolPieces(): Promise<Array<{
  id: string;
  title: string;
  imageUrl: string;
  creatorName: string;
}>> {
  try {
    const allPieces: Array<{
      id: string;
      title: string;
      imageUrl: string;
      creatorName: string;
    }> = [];

    // Fetch pieces from all featured wallets
    for (const wallet of FEATURED_WALLETS) {
      const response = await fetch(`${STORY_API_BASE_URL}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': STORY_API_KEY,
        },
        body: JSON.stringify({
          pagination: {
            limit: 20, // Fetch more to filter
            offset: 0,
          },
          where: {
            ownerAddress: wallet,
          },
          includeLicenses: true,
          orderBy: 'blockNumber',
          orderDirection: 'desc',
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(`Failed to fetch from wallet ${wallet}`);
        continue;
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const piecesWithImages = data.data
          .map((asset: any) => {
            // Extract image URL
            const imageUrl = asset.nftMetadata?.image?.cachedUrl ||
                            asset.nftMetadata?.image?.thumbnailUrl ||
                            asset.nftMetadata?.raw?.metadata?.image ||
                            asset.nftMetadata?.image?.originalUrl ||
                            null;

            // Only return pieces with valid images (not placeholder)
            if (!imageUrl) {
              return null;
            }

            return {
              id: asset.ipId || asset.id,
              title: asset.nftMetadata?.name || asset.nftMetadata?.raw?.metadata?.name || asset.name || 'Untitled',
              imageUrl,
              creatorName: asset.nftMetadata?.raw?.metadata?.creators?.[0]?.name ||
                          asset.nftMetadata?.metadata?.creators?.[0]?.name ||
                          'Artist',
            };
          })
          .filter((piece: any): piece is NonNullable<typeof piece> => piece !== null);

        allPieces.push(...piecesWithImages);
      }
    }

    // Return first 8 pieces with images
    return allPieces.slice(0, 8);
  } catch (error) {
    console.error('Error fetching Story Protocol pieces:', error);
    return [];
  }
}

// Dynamic import for large LandingUI component (584 lines with inline SVGs)
// This improves initial page load performance
const LandingUI = dynamic(() => import('@/components/imported/LandingUI'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="animate-pulse text-white text-xl">Loading...</div>
    </div>
  ),
  ssr: true, // Still render on server for SEO
});

export default async function LandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang as Locale);

  // Fetch pieces from Story Protocol
  const pieces = await fetchStoryProtocolPieces();

  return <LandingUI dict={dict} lang={lang as Locale} pieces={pieces} />;
}
