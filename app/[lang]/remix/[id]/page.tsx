'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateProvenanceHash } from '@/lib/crypto';
import { SECONDARY_COLOR } from '@/lib/constants/colors';
import { useAccount, useWalletClient } from 'wagmi';
import { uploadFileToIPFS, uploadJSONToIPFS } from '@/lib/services/ipfs';
import { createStoryClient, prepareMetadata, createMetadataHash, getSPGNFTContract } from '@/lib/services/story';
import { Address } from 'viem';

export default function RemixPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  // Unwrap the params Promise using React's use() hook
  const { lang, id } = use(params);
  const router = useRouter();
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
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
  const hasLoadedData = useRef(false);
  const [licenseTokenId, setLicenseTokenId] = useState<bigint | null>(null);
  const [isMintingLicense, setIsMintingLicense] = useState(false);

  useEffect(() => {
    // Prevent multiple loads in React Strict Mode
    if (hasLoadedData.current) {
      return;
    }

    const loadPieceData = () => {
      const cachedData = sessionStorage.getItem(`remix_parent_${id}`);

      if (cachedData) {
        try {
          const pieceData = JSON.parse(cachedData);

          setOriginalPiece({
            id: pieceData.id,
            ip_id: pieceData.id,
            title: pieceData.title,
            image_url: pieceData.imageUrl,
            description: `Artwork by ${pieceData.creatorName}`,
          });

          setFormData({
            title: `Remix of ${pieceData.title}`,
            description: `A creative remix of "${pieceData.title}"`,
            tags: '',
          });

          hasLoadedData.current = true;
          sessionStorage.removeItem(`remix_parent_${id}`);
        } catch (err) {
          console.error('Error loading remix data:', err);
          setOriginalPiece({
            id: id,
            ip_id: id,
            title: 'Story Protocol Asset',
            image_url: '',
            description: 'External artwork from Story Protocol',
          });
          setFormData({
            title: 'Remix',
            description: 'A creative remix',
            tags: '',
          });
          hasLoadedData.current = true;
        }
      } else {
        setOriginalPiece({
          id: id,
          ip_id: id,
          title: 'Story Protocol Asset',
          image_url: '',
          description: 'External artwork from Story Protocol',
        });
        setFormData({
          title: 'Remix',
          description: 'A creative remix',
          tags: '',
        });
        hasLoadedData.current = true;
      }
    };

    loadPieceData();
  }, [id]);

  const handleMintLicense = async () => {
    setIsMintingLicense(true);
    setError(null);

    try {
      if (!isConnected || !address) {
        throw new Error('Please connect your wallet first');
      }

      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      console.log('[MINT LICENSE] Starting license minting...');
      console.log('[MINT LICENSE] Parent IP ID:', id);

      // Create Story Protocol client
      const storyClient = createStoryClient(walletClient);
      if (!storyClient) {
        throw new Error('Failed to create Story Protocol client');
      }

      // Mint license token
      console.log('[MINT LICENSE] Minting license token...');
      // TODO: Auto-detect license ID from parent IP instead of hardcoding
      // For Rock10, use license ID 28272. For other assets, may need different ID.
      const licenseTermsId = 28272n; // Rock10's custom license that allows derivatives

      const response = await storyClient.license.mintLicenseTokens({
        licenseTermsId,
        licensorIpId: id as Address,
        amount: 1,
        receiver: address,
      });

      console.log('[MINT LICENSE] License token minted!');
      console.log('[MINT LICENSE] Transaction hash:', response.txHash);
      console.log('[MINT LICENSE] License token ID:', response.licenseTokenIds?.[0]);

      if (response.licenseTokenIds && response.licenseTokenIds.length > 0) {
        setLicenseTokenId(response.licenseTokenIds[0]);
        console.log('[MINT LICENSE] License acquired successfully!');
      } else {
        throw new Error('Failed to get license token ID');
      }
    } catch (err: any) {
      console.error('[MINT LICENSE] Error minting license:', err);

      if (err.message && err.message.includes('License terms id') && err.message.includes('not attached')) {
        setError(
          'This artwork does not have the required license terms attached. ' +
          'Only artworks with PIL licenses that permit derivatives can be remixed.'
        );
      } else {
        setError(err.message || 'Failed to mint license. Please try again.');
      }
    } finally {
      setIsMintingLicense(false);
    }
  };

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
      if (!isConnected || !address) {
        throw new Error('Please connect your wallet first');
      }

      if (!imageFile) {
        throw new Error('Please select an image for your remix');
      }

      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      const walletAddress = address;

      console.log('[REMIX SUBMIT] Starting remix submission to Story Protocol...');
      console.log('[REMIX SUBMIT] Parent IP ID:', id);

      // Step 1: Upload image to IPFS
      console.log('[REMIX SUBMIT] Uploading image to IPFS...');
      const ipfsHash = await uploadFileToIPFS(imageFile, `remix-${formData.title}`);
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      console.log('[REMIX SUBMIT] Image uploaded to IPFS:', imageUrl);

      // Step 2: Prepare metadata
      console.log('[REMIX SUBMIT] Preparing metadata...');
      const { ipMetadata, nftMetadata } = prepareMetadata({
        name: formData.title,
        description: formData.description,
        imageUrl: imageUrl,
        imageHash: ipfsHash,
        creatorName: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
        creatorAddress: walletAddress,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        canRemix: false, // Remixes cannot be remixed by default
      });

      // Step 3: Upload metadata to IPFS
      console.log('[REMIX SUBMIT] Uploading metadata to IPFS...');
      const ipMetadataHash = await uploadJSONToIPFS(ipMetadata, `remix-ip-metadata-${formData.title}`);
      const nftMetadataHash = await uploadJSONToIPFS(nftMetadata, `remix-nft-metadata-${formData.title}`);

      const ipMetadataURI = `https://gateway.pinata.cloud/ipfs/${ipMetadataHash}`;
      const nftMetadataURI = `https://gateway.pinata.cloud/ipfs/${nftMetadataHash}`;

      console.log('[REMIX SUBMIT] Metadata uploaded:', { ipMetadataURI, nftMetadataURI });

      // Step 4: Generate metadata hashes for Story Protocol
      console.log('[REMIX SUBMIT] Generating metadata hashes...');
      const ipMetadataHashBytes = await createMetadataHash(ipMetadata);
      const nftMetadataHashBytes = await createMetadataHash(nftMetadata);
      console.log('[REMIX SUBMIT] Metadata hashes generated');

      // Step 5: Create Story Protocol client
      console.log('[REMIX SUBMIT] Creating Story Protocol client...');
      const storyClient = createStoryClient(walletClient);

      if (!storyClient) {
        throw new Error('Failed to create Story Protocol client');
      }

      // Step 6: Get SPG NFT contract
      const spgNftContract = getSPGNFTContract(chain?.id) as Address;
      console.log('[REMIX SUBMIT] Using SPG NFT contract:', spgNftContract);

      // Step 7: Register derivative IP on Story Protocol
      console.log('[REMIX SUBMIT] Registering derivative IP on Story Protocol...');
      console.log('[REMIX SUBMIT] This will mint an NFT and register it as a derivative of:', id);

      let response;

      if (licenseTokenId) {
        // Use the license token that was minted earlier
        console.log('[REMIX SUBMIT] Using license token:', licenseTokenId);
        console.log('[REMIX SUBMIT] Parent IP ID:', id);
        console.log('[REMIX SUBMIT] SPG NFT Contract:', spgNftContract);

        try {
          response = await storyClient.ipAsset.mintAndRegisterIpAndMakeDerivativeWithLicenseTokens({
            spgNftContract,
            licenseTokenIds: [licenseTokenId],
            ipMetadata: {
              ipMetadataURI,
              ipMetadataHash: ipMetadataHashBytes as `0x${string}`,
              nftMetadataURI,
              nftMetadataHash: nftMetadataHashBytes as `0x${string}`,
            },
          });
        } catch (tokenError: any) {
          console.error('[REMIX SUBMIT] License token error:', tokenError);

          // If license token fails, reset it and ask user to mint a new one
          if (tokenError.message?.includes('0x177e802f') ||
              tokenError.message?.includes('already been used') ||
              tokenError.message?.includes('invalid')) {
            setLicenseTokenId(null);
            throw new Error(
              'The license token has already been used or is invalid. ' +
              'Please mint a NEW license token and try again.'
            );
          } else {
            throw tokenError;
          }
        }
      } else {
        // No license token - cannot proceed
        console.error('[REMIX SUBMIT] No license token available');
        throw new Error(
          'A license token is required to remix this artwork. ' +
          'Please click "Mint License Token" first to acquire the necessary license.'
        );
      }

      console.log('[REMIX SUBMIT] Derivative IP registered!');
      console.log('[REMIX SUBMIT] Transaction hash:', response.txHash);
      console.log('[REMIX SUBMIT] IP ID:', response.ipId);
      console.log('[REMIX SUBMIT] Token ID:', response.tokenId);

      // Step 8: Save to Supabase if configured
      if (isSupabaseConfigured()) {
        console.log('[REMIX SUBMIT] Saving to database...');

        // Get or create user
        let { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', walletAddress)
          .single();

        if (!user) {
          const { data: newUser } = await supabase
            .from('users')
            .insert({
              wallet_address: walletAddress,
              display_name: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
            })
            .select()
            .single();
          user = newUser;
        }

        if (user) {
          // Generate provenance hash
          const provenanceHash = await generateProvenanceHash({
            title: formData.title,
            description: formData.description,
            imageUrl: imageUrl,
            creatorWallet: walletAddress,
            timestamp: new Date().toISOString(),
          });

          // Create remix piece with Story Protocol data
          const { data: remixPiece, error: insertError } = await supabase
            .from('pieces')
            .insert({
              title: formData.title,
              description: formData.description,
              image_url: imageUrl,
              creator_user_id: user.id,
              provenance_hash: provenanceHash,
              can_remix: false,
              tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
              // Story Protocol fields
              ip_id: response.ipId,
              token_id: response.tokenId?.toString(),
              token_contract: spgNftContract,
              transaction_hash: response.txHash,
              ip_metadata_uri: ipMetadataURI,
              ip_metadata_hash: ipMetadataHashBytes,
              nft_metadata_uri: nftMetadataURI,
              nft_metadata_hash: nftMetadataHashBytes,
            })
            .select()
            .single();

          if (insertError) {
            console.error('[REMIX SUBMIT] Error saving to database:', insertError);
            // Don't throw - the Story Protocol registration succeeded
            console.warn('[REMIX SUBMIT] Continuing despite database error');
          } else if (remixPiece) {
            console.log('[REMIX SUBMIT] Saved to database successfully');

            // Create remix relationship
            const { error: remixError } = await supabase.from('remixes').insert({
              original_piece_id: id,
              remix_piece_id: remixPiece.id,
            });

            if (remixError) {
              console.error('[REMIX SUBMIT] Error creating remix relationship:', remixError);
            }
          }
        }
      }

      console.log('[REMIX SUBMIT] Remix created successfully! Redirecting...');

      // Redirect to home
      router.push(`/${lang}/home`);
    } catch (err: any) {
      console.error('[REMIX SUBMIT] Error creating remix:', err);

      // Check for specific error about missing license
      if (err.message && err.message.includes('License terms id') && err.message.includes('must be attached')) {
        setError(
          'This artwork cannot be remixed because it does not have the required license terms. ' +
          'Only artworks registered with a license that permits derivatives can be remixed. ' +
          'Try remixing an artwork that was created through this app, as they include remix-friendly licenses.'
        );
      } else if (err.message && err.message.includes('0x177e802f')) {
        // License token already used or invalid
        setError(
          'The license token has already been used or is invalid. Please mint a new license token to create another remix.'
        );
        // Reset license token so user can mint a new one
        setLicenseTokenId(null);
      } else {
        setError(err.message || 'Failed to create remix. Please try again.');
      }
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
            href={`/${lang}/landing`}
            className="transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = SECONDARY_COLOR)}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#fff')}
          >
            ← Back to Landing
          </Link>
        </div>
      </header>

      {/* Parent Piece Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex items-start gap-4">
            {/* Parent Image or Icon */}
            {originalPiece.image_url && originalPiece.image_url.trim() !== '' ? (
              <div className="flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden border-2 border-blue-200">
                <Image
                  src={originalPiece.image_url}
                  alt={originalPiece.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex-shrink-0 w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Creating Remix From
              </h2>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {originalPiece.title}
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Parent IP ID:</span>
                  <code className="bg-white px-2 py-1 rounded border border-gray-200 font-mono text-xs">
                    {id.slice(0, 10)}...{id.slice(-8)}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className={`grid grid-cols-1 ${originalPiece.image_url ? 'md:grid-cols-2' : ''} gap-12 mb-12`}>
          {originalPiece.image_url && (
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
          )}

          <div className={!originalPiece.image_url ? 'max-w-2xl mx-auto' : ''}>
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

        {/* License Acquisition Section */}
        {!licenseTokenId && (
          <div className="max-w-3xl mb-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Step 1: Acquire Remix License
            </h3>
            <p className="text-gray-700 mb-4">
              Before creating a remix, you need to mint a license token from the original artwork.
              This gives you permission to create a derivative work on-chain.
            </p>
            <button
              type="button"
              onClick={handleMintLicense}
              disabled={isMintingLicense}
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMintingLicense ? 'Minting License...' : 'Mint License Token'}
            </button>
          </div>
        )}

        {/* License Acquired Confirmation */}
        {licenseTokenId && (
          <div className="max-w-3xl mb-8 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  License Acquired!
                </h3>
                <p className="text-gray-700 mb-2">
                  You have successfully minted a license token. You can now create your remix.
                </p>
                <p className="text-sm text-gray-600">
                  License Token ID: <code className="bg-white px-2 py-1 rounded border border-gray-200 font-mono">{licenseTokenId.toString()}</code>
                </p>
              </div>
            </div>
          </div>
        )}

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
