/**
 * Generative AI Service
 * Provides AI-powered image description functionality using OpenAI's GPT-4 Vision API
 */

export interface DescribeImageOptions {
  image: File;
  lang?: string;
}

export interface DescribeImageResult {
  description: string;
}

/**
 * Generates a marketplace-style description of an artwork image using AI
 * @param options - Configuration options including the image file and language preference
 * @returns Promise resolving to the generated description
 * @throws Error if the API request fails or no description is generated
 */
export async function describeImage(
  options: DescribeImageOptions
): Promise<DescribeImageResult> {
  const { image, lang = 'en' } = options;

  // Convert image to base64 data URL
  const arrayBuffer = await image.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUrl = `data:${image.type || 'image/jpeg'};base64,${base64}`;

  // Prepare language-specific prompt
  const prompt =
    lang === 'es'
      ? 'Escribe una descripción breve (2-4 oraciones) de esta imagen. Enfócate en el sujeto, estilo, materiales y sensación. No incluyas nombres de archivo ni metadatos.'
      : 'Write a concise (2–4 sentences) marketplace-style description of this artwork. Focus on subject, style, materials, and mood. Do not mention file names or camera metadata.';

  // Validate API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI request failed: ${errText}`);
  }

  const data = await response.json();
  const description: string = data?.choices?.[0]?.message?.content?.trim?.() || '';

  if (!description) {
    throw new Error('No description generated');
  }

  return { description };
}
