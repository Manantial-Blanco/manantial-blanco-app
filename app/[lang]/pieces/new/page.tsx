import { use } from 'react';
import NewPiecePageClient from './NewPiecePageClient';

export default function NewPiecePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  return <NewPiecePageClient lang={lang} />;
}
