import { NextResponse } from 'next/server';
import { describeImage } from '@/lib/services/generative-ai';

export const runtime = 'nodejs';

// POST /api/ai-describe-image
// Expects multipart/form-data with fields:
// - image: File
// - lang: string (optional, e.g., "en", "es")
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get('image');
    const lang = (formData.get('lang') as string) || 'en';

    if (!(image instanceof File)) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    const result = await describeImage({ image, lang });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Unexpected server error', detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
