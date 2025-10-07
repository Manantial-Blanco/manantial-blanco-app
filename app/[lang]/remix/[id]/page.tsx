'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prepareAsset, mintPiece } from '@/lib/services/story';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateProvenanceHash } from '@/lib/crypto';
import { SECONDARY_COLOR } from '@/lib/constants/colors';

export default function RemixPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  // Unwrap the params Promise using React's use() hook
  const { lang, id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalPiece, setOriginalPiece] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // Fetch original piece
    const fetchPiece = async () => {
      if (isSupabaseConfigured()) {
        const { data } = await supabase
          .from('pieces')
          .select('*')
          .eq('id', id)
          .single();

        if (data) {
          setOriginalPiece(data);
          setFormData({
            title: `Remix of ${data.title}`,
            description: `A creative remix of "${data.title}"`,
            tags: data.tags?.join(', ') || '',
          });
        }
      }
    };

    fetchPiece();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!imageFile) {
        throw new Error('Please select an image for your remix');
      }

      const walletAddress = '0x0000000000000000000000000000000000000000';

      // Prepare asset with Story SDK
      const { metadataUrl } = await prepareAsset({
        file: imageFile,
        metadata: {
          title: formData.title,
          description: formData.description,
          creator: walletAddress,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        },
      });

      // Mint remix piece
      const { tokenId, contract } = await mintPiece({
        metadataUrl,
        creatorWallet: walletAddress,
      });

      // Generate provenance hash
      const provenanceHash = await generateProvenanceHash({
        title: formData.title,
        description: formData.description,
        imageUrl: imagePreview || '',
        creatorWallet: walletAddress,
        timestamp: new Date().toISOString(),
      });

      // Save to Supabase if configured
      if (isSupabaseConfigured()) {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', walletAddress)
          .single();

        if (user) {
          // Create remix piece
          const { data: remixPiece } = await supabase
            .from('pieces')
            .insert({
              title: formData.title,
              description: formData.description,
              image_url: imagePreview || '',
              creator_user_id: user.id,
              token_id: tokenId,
              token_contract: contract,
              provenance_hash: provenanceHash,
              can_remix: false,
              tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
            })
            .select()
            .single();

          // Create remix relationship
          if (remixPiece) {
            await supabase.from('remixes').insert({
              original_piece_id: id,
              remix_piece_id: remixPiece.id,
            });
          }
        }
      }

      // Redirect to home
      router.push(`/${lang}/home`);
    } catch (err: any) {
      console.error('Error creating remix:', err);
      setError(err.message || 'Failed to create remix. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!originalPiece) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/${lang}/landing`}>
            <h1 className="text-2xl font-bold">Manantial Blanco</h1>
          </Link>
          <Link
            href={`/${lang}/piece/${id}`}
            className="transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = SECONDARY_COLOR)}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#fff')}
          >
            ← Back to Original
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">
              Original Piece
            </h3>
            <div className="relative w-full aspect-square">
              <Image
                src={originalPiece.image_url}
                alt={originalPiece.title}
                fill
                className="object-contain rounded-lg border border-gray-200"
              />
            </div>
            <h4 className="text-xl font-bold text-black mt-4">
              {originalPiece.title}
            </h4>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-black mb-4">
              Your Remix
            </h3>
            {imagePreview ? (
              <div className="relative w-full aspect-square">
                <Image
                  src={imagePreview}
                  alt="Remix preview"
                  fill
                  className="object-contain rounded-lg border border-gray-200"
                />
              </div>
            ) : (
              <div className="w-full aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <p className="text-gray-400">Upload your remix image</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remix Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Remix Image *
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Remix...' : 'Create Remix'}
            </button>
            <Link
              href={`/${lang}/piece/${id}`}
              className="py-3 px-6 border-2 border-black text-black rounded-full font-semibold hover:bg-gray-100 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
