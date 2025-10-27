/**
 * IPFS Upload Service using Pinata
 * For uploading metadata and files to IPFS
 */

import { PinataSDK } from 'pinata-web3';

// Environment configuration
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || '';
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

/**
 * Check if Pinata is configured
 */
export function isPinataConfigured(): boolean {
  return Boolean(PINATA_JWT);
}

/**
 * Create Pinata client
 */
function createPinataClient(): PinataSDK | null {
  if (!isPinataConfigured()) {
    console.warn('Pinata not configured. Set NEXT_PUBLIC_PINATA_JWT environment variable.');
    return null;
  }

  try {
    return new PinataSDK({
      pinataJwt: PINATA_JWT,
    });
  } catch (error) {
    console.error('Failed to create Pinata client:', error);
    return null;
  }
}

/**
 * Upload JSON metadata to IPFS
 * @param metadata - JSON object to upload
 * @param name - Optional name for the pin
 * @returns IPFS hash (CID)
 */
export async function uploadJSONToIPFS(
  metadata: object,
  name?: string
): Promise<string> {
  const pinata = createPinataClient();

  if (!pinata) {
    throw new Error('Pinata not configured. Please set NEXT_PUBLIC_PINATA_JWT in your environment variables.');
  }

  try {
    const result = await pinata.upload.json(metadata, {
      metadata: {
        name: name || 'metadata',
      },
    });

    return result.IpfsHash;
  } catch (error) {
    console.error('Failed to upload JSON to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
}

/**
 * Upload a file to IPFS
 * @param file - File to upload
 * @param name - Optional name for the pin
 * @returns IPFS hash (CID)
 */
export async function uploadFileToIPFS(
  file: File,
  name?: string
): Promise<string> {
  const pinata = createPinataClient();

  if (!pinata) {
    throw new Error('Pinata not configured. Please set NEXT_PUBLIC_PINATA_JWT in your environment variables.');
  }

  try {
    const result = await pinata.upload.file(file, {
      metadata: {
        name: name || file.name,
      },
    });

    return result.IpfsHash;
  } catch (error) {
    console.error('Failed to upload file to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
}

/**
 * Get IPFS URL from hash
 * @param ipfsHash - IPFS hash (CID)
 * @returns Full IPFS URL
 */
export function getIPFSUrl(ipfsHash: string): string {
  // Remove ipfs:// prefix if present
  const hash = ipfsHash.replace('ipfs://', '');
  return `${PINATA_GATEWAY}${hash}`;
}

/**
 * Upload complete piece metadata with image
 * @param imageFile - Image file
 * @param metadata - Piece metadata
 * @returns Object with image and metadata IPFS hashes
 */
export async function uploadPieceToIPFS(
  imageFile: File,
  metadata: {
    name: string;
    description: string;
    attributes?: Array<{ trait_type: string; value: string | number }>;
  }
): Promise<{
  imageHash: string;
  imageUrl: string;
  metadataHash: string;
  metadataUrl: string;
}> {
  try {
    // Upload image first
    const imageHash = await uploadFileToIPFS(imageFile, metadata.name);
    const imageUrl = getIPFSUrl(imageHash);

    // Create metadata with image URL
    const completeMetadata = {
      ...metadata,
      image: imageUrl,
    };

    // Upload metadata
    const metadataHash = await uploadJSONToIPFS(
      completeMetadata,
      `${metadata.name}-metadata`
    );
    const metadataUrl = getIPFSUrl(metadataHash);

    return {
      imageHash,
      imageUrl,
      metadataHash,
      metadataUrl,
    };
  } catch (error) {
    console.error('Failed to upload piece to IPFS:', error);
    throw error;
  }
}
