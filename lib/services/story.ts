/**
 * Story Protocol SDK Integration
 * For registering IP assets and managing licensing
 * See: https://docs.story.foundation/developers/typescript-sdk
 */

import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { Address, http } from 'viem';

// Environment configuration
const RPC_PROVIDER_URL = process.env.NEXT_PUBLIC_RPC_PROVIDER_URL || 'https://rpc.ankr.com/story_mainnet';
const SPG_NFT_CONTRACT = process.env.NEXT_PUBLIC_SPG_NFT_CONTRACT as Address | undefined;

/**
 * Check if Story Protocol is configured
 */
export function isStoryConfigured(): boolean {
  return Boolean(RPC_PROVIDER_URL);
}

/**
 * Create Story Protocol client
 * This should be called on the client side with wallet connection
 */
export function createStoryClient(walletClient: any): StoryClient | null {
  if (!isStoryConfigured()) {
    console.warn('Story Protocol not configured');
    return null;
  }

  if (!walletClient || !walletClient.account) {
    console.error('Wallet client or account is missing');
    return null;
  }

  try {
    // Determine chainId based on wallet's connected chain
    // Story SDK accepts: 'mainnet' (1514) or 'aeneid' (testnet 1315)
    const walletChainId = walletClient.chain?.id;
    let chainId: 'mainnet' | 'aeneid' = 'mainnet'; // default to mainnet
    let rpcUrl = 'https://rpc.ankr.com/story_mainnet'; // default to mainnet RPC

    if (walletChainId === 1315) {
      chainId = 'aeneid';
      rpcUrl = 'https://aeneid.storyrpc.io'; // testnet RPC
    } else if (walletChainId === 1514) {
      chainId = 'mainnet';
      rpcUrl = 'https://rpc.ankr.com/story_mainnet'; // mainnet RPC
    } else {
      console.warn(`Unknown chain ID ${walletChainId}, defaulting to mainnet`);
    }

    const config: StoryConfig = {
      account: walletClient.account,
      transport: http(rpcUrl),
      chainId,
      wallet: walletClient,
    };

    console.log(`[Story Client] Created client for ${chainId} (chain ID: ${walletChainId}) with RPC: ${rpcUrl}`);
    return StoryClient.newClient(config);
  } catch (error) {
    console.error('Failed to create Story client:', error);
    return null;
  }
}

/**
 * Metadata interfaces
 */
export interface IPMetadata {
  title: string;
  description: string;
  image: string;
  creators: Array<{
    name: string;
    address: string;
    contributionPercent: number;
    socialMedia?: Array<{
      platform: string;
      url: string;
    }>;
  }>;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  // Optional fields for richer metadata
  tags?: string[];
  createdAt?: string;
  watermarkImg?: string;
  originalLanguage?: string;
  app?: {
    id: string;
    name: string;
    website: string;
  };
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  external_url?: string;
  mediaUrl?: string;
  mediaType?: string;
  mediaHash?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  creators?: Array<{
    address: string;
    name: string;
  }>;
}

/**
 * Register IP Asset Parameters
 */
export interface RegisterIPAssetParams {
  nftContract: Address;
  recipient: Address;
  ipMetadata: {
    ipMetadataURI: string;
    ipMetadataHash: string;
    nftMetadataURI: string;
    nftMetadataHash: string;
  };
}

/**
 * Register IP Asset Result
 */
export interface RegisterIPAssetResult {
  txHash: string;
  ipId: Address;
  tokenId: bigint;
}

/**
 * Register an IP Asset on Story Protocol
 * @param client - Story Protocol client instance
 * @param params - Registration parameters
 * @returns Transaction hash, IP ID, and token ID
 */
export async function registerIPAsset(
  client: StoryClient,
  params: RegisterIPAssetParams
): Promise<RegisterIPAssetResult> {
  try {
    const response = await client.ipAsset.registerIpAsset({
      nft: {
        type: 'mint',
        spgNftContract: params.nftContract,
        recipient: params.recipient,
      },
      ipMetadata: {
        ipMetadataURI: params.ipMetadata.ipMetadataURI,
        ipMetadataHash: params.ipMetadata.ipMetadataHash as `0x${string}`,
        nftMetadataURI: params.ipMetadata.nftMetadataURI,
        nftMetadataHash: params.ipMetadata.nftMetadataHash as `0x${string}`,
      },
    });

    if (!response.txHash || !response.ipId || response.tokenId === undefined) {
      throw new Error('Registration failed: Missing response data');
    }

    return {
      txHash: response.txHash,
      ipId: response.ipId as Address,
      tokenId: response.tokenId,
    };
  } catch (error) {
    console.error('Failed to register IP asset:', error);
    throw error;
  }
}

/**
 * Get the SPG NFT contract address
 *
 * SPG NFT contracts are used to mint NFTs and register them as IP Assets in one transaction.
 *
 * Default contracts (public collections):
 * - Mainnet (1514): 0xf06808081f6000F17c68D020ec8b159B0A851952
 * - Testnet (1315): 0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc
 *
 * You can also create your own SPG NFT collection:
 * - Run: npx tsx scripts/create-spg-collection.ts
 * - Set SPG_NFT_CONTRACT in .env.local with your collection address
 */
export function getSPGNFTContract(chainId?: number): Address {
  // Use configured contract if available
  if (SPG_NFT_CONTRACT) {
    return SPG_NFT_CONTRACT;
  }

  // Otherwise use default public collections
  if (chainId === 1315) {
    // Testnet Aeneid
    return '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc' as Address;
  } else {
    // Mainnet (default)
    return '0xf06808081f6000F17c68D020ec8b159B0A851952' as Address;
  }
}

/**
 * Create metadata hash using SHA-256
 * @param metadata - Metadata object to hash
 * @returns Hex string hash with 0x prefix
 */
export async function createMetadataHash(metadata: IPMetadata | NFTMetadata): Promise<string> {
  const content = JSON.stringify(metadata);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `0x${hashHex}`;
  }

  throw new Error('Web Crypto API not available');
}

/**
 * Prepare metadata for IP registration
 * @param pieceData - Data from the registration form
 * @returns IP and NFT metadata objects with complete Story Protocol metadata
 */
export function prepareMetadata(pieceData: {
  name: string;
  description: string;
  imageUrl: string;
  imageHash: string;
  creatorName: string;
  creatorAddress: string;
  tags?: string[];
  mediaType?: string;
}): { ipMetadata: IPMetadata; nftMetadata: NFTMetadata } {
  // Convert HTTP URL to ipfs:// format for image field
  const ipfsImageUrl = pieceData.imageUrl.includes('ipfs')
    ? pieceData.imageUrl.replace(/https?:\/\/[^/]+\/ipfs\//, 'ipfs://')
    : pieceData.imageUrl;

  // Generate default tags if none provided
  const defaultTags = pieceData.tags && pieceData.tags.length > 0
    ? pieceData.tags
    : ['digital-art', 'ip-asset', 'story-protocol'];

  // Create comprehensive IP metadata
  const ipMetadata: IPMetadata = {
    title: pieceData.name,
    description: pieceData.description,
    image: pieceData.imageUrl,
    creators: [
      {
        name: pieceData.creatorName || 'Manantial Blanco Artist',
        address: pieceData.creatorAddress,
        contributionPercent: 100,
        socialMedia: [
          {
            platform: 'Story Protocol',
            url: `https://portal.story.foundation/user/${pieceData.creatorAddress}`,
          },
          {
            platform: 'Website',
            url: 'https://manantialblanco.com',
          },
        ],
      },
    ],
    attributes: [
      ...defaultTags.map(tag => ({
        trait_type: 'tag',
        value: tag,
      })),
      {
        trait_type: 'platform',
        value: 'Manantial Blanco',
      },
      {
        trait_type: 'type',
        value: 'Original Artwork',
      },
      {
        trait_type: 'registered_on',
        value: 'Story Protocol',
      },
    ],
    tags: defaultTags,
    createdAt: new Date().toISOString(),
    originalLanguage: 'es', // Default to Spanish (can be made dynamic later)
    app: {
      id: 'manantial-blanco',
      name: 'Manantial Blanco Portal',
      website: 'https://manantialblanco.com',
    },
  };

  // Create comprehensive NFT metadata
  const nftMetadata: NFTMetadata = {
    name: pieceData.name,
    description: pieceData.description,
    image: ipfsImageUrl, // Use ipfs:// format
    animation_url: ipfsImageUrl, // Same as image for static images
    external_url: `https://portal.story.foundation/user/${pieceData.creatorAddress}`,
    mediaUrl: pieceData.imageUrl, // Full HTTP URL
    mediaType: pieceData.mediaType || 'image/jpeg',
    mediaHash: pieceData.imageHash,
    attributes: ipMetadata.attributes,
    creators: [
      {
        address: pieceData.creatorAddress,
        name: pieceData.creatorName || 'Manantial Blanco Artist',
      },
    ],
  };

  return { ipMetadata, nftMetadata };
}

/**
 * Legacy interfaces for backward compatibility
 */
export interface PrepareAssetParams {
  file: File;
  metadata: {
    title: string;
    description: string;
    creator: string;
    tags: string[];
  };
}

export interface PrepareAssetResult {
  metadataUrl: string;
}

export interface MintPieceParams {
  metadataUrl: string;
  creatorWallet: string;
}

export interface MintPieceResult {
  tokenId: string;
  contract: string;
}

export interface PieceToken {
  tokenId: string;
  contract: string;
  owner: string;
  metadataUrl: string;
  mintedAt?: string;
}
