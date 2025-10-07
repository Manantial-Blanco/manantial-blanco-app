import { getDictionary, isValidLocale } from '@/lib/i18n/getDict';
import { Locale } from '@/types';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

  // Fetch pieces from Supabase if configured
  let pieces: Array<{
    id: string;
    title: string;
    imageUrl: string;
    creatorName: string;
  }> = [];

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('pieces')
        .select(
          `
          id,
          title,
          image_url,
          users!creator_user_id (
            display_name
          )
        `
        )
        .order('created_at', { ascending: false })
        .limit(8);

      if (!error && data) {
        pieces = data.map((piece: any) => ({
          id: piece.id,
          title: piece.title,
          imageUrl: piece.image_url,
          creatorName: piece.users?.display_name || 'Unknown Artist',
        }));
      }
    } catch (error) {
      console.error('Error fetching pieces:', error);
    }
  }

  return <LandingUI dict={dict} lang={lang as Locale} pieces={pieces} />;
}
