import { getDictionary, isValidLocale } from '@/lib/i18n/getDict';
import { Locale } from '@/types';
import { notFound } from 'next/navigation';
import LandingUI from '@/components/imported/LandingUI';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
