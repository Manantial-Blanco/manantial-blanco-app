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
  creatorEmail?: string;
  licensePrice?: number;
  canRemix?: boolean;
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

  // Build social media array (include email if provided)
  const socialMedia: Array<{ platform: string; url: string }> = [
    {
      platform: 'Story Protocol',
      url: `https://portal.story.foundation/user/${pieceData.creatorAddress}`,
    },
    {
      platform: 'Website',
      url: 'https://manantialblanco.com',
    },
  ];

  if (pieceData.creatorEmail) {
    socialMedia.push({
      platform: 'Email',
      url: `mailto:${pieceData.creatorEmail}`,
    });
  }

  // Build attributes array (include creator info if available)
  const attributes: Array<{ trait_type: string; value: string | number }> = [
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
    {
      trait_type: 'creator_name',
      value: pieceData.creatorName,
    },
  ];

  if (pieceData.creatorEmail) {
    attributes.push({
      trait_type: 'creator_email',
      value: pieceData.creatorEmail,
    });
  }

  if (pieceData.licensePrice !== undefined) {
    attributes.push({
      trait_type: 'license_price',
      value: pieceData.licensePrice,
    });
  }

  if (pieceData.canRemix !== undefined) {
    attributes.push({
      trait_type: 'can_remix',
      value: pieceData.canRemix ? 'yes' : 'no',
    });
  }

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
        socialMedia,
      },
    ],
    attributes,
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
 * PIL (Programmable IP License) Types
 */
export type PILLicenseType =
  | 'non-commercial' // Non-Commercial Social Remixing (Free, remixes allowed, no commercial use)
  | 'commercial-use' // Commercial Use (Paid, no remixes, commercial use allowed)
  | 'commercial-remix' // Commercial Remix (Paid, remixes allowed, revenue sharing)
  | 'custom'; // Fully custom license with all parameters

export interface PILLicenseConfig {
  type: PILLicenseType;
  // For commercial licenses
  mintingFee?: string; // In IP tokens (e.g., "1" for 1 IP token)
  // For commercial remix
  commercialRevShare?: number; // Percentage (0-100)
  currency?: Address; // Token address for payments
}

/**
 * Custom PIL License Terms
 * Complete configuration for fully custom licenses
 */
export interface CustomPILTerms {
  // Transfer & Ownership
  transferable?: boolean; // Can the license be transferred?

  // Financial Parameters
  defaultMintingFee?: string; // Fee in IP tokens (e.g., "1")
  currency?: Address; // ERC20 token for payments
  royaltyPolicy?: Address; // Royalty policy contract (default: LAP)

  // Expiration
  expiration?: bigint; // License expiration timestamp (0 = no expiration)

  // Commercial Use
  commercialUse?: boolean; // Allow commercial use?
  commercialAttribution?: boolean; // Require attribution for commercial use?
  commercialRevShare?: number; // Revenue share percentage (0-100)
  commercialRevCeiling?: bigint; // Maximum revenue from commercial use
  commercializerChecker?: Address; // Address to restrict commercial exploiters
  commercializerCheckerData?: `0x${string}`; // Data for commercializer checker

  // Derivatives
  derivativesAllowed?: boolean; // Allow derivative works?
  derivativesAttribution?: boolean; // Require attribution for derivatives?
  derivativesApproval?: boolean; // Require approval before creating derivatives?
  derivativesReciprocal?: boolean; // Must derivatives use same license terms?
  derivativeRevCeiling?: bigint; // Maximum revenue from derivative works

  // Off-chain Terms URI
  uri?: string; // URI pointing to off-chain license terms
}

/**
 * Attach License Terms Result
 */
export interface AttachLicenseTermsResult {
  txHash: string;
  licenseTermsId: string;
}

/**
 * Get the default License Terms ID for non-commercial social remixing
 * This is a pre-registered license on the protocol
 */
export function getDefaultLicenseTermsId(): string {
  return '1'; // Non-Commercial Social Remixing
}

/**
 * Attach license terms to an IP Asset
 * @param client - Story Protocol client instance
 * @param ipId - IP Asset ID to attach license to
 * @param licenseTermsId - License terms ID (default: 1n for non-commercial)
 * @returns Transaction hash and license terms ID
 */
export async function attachLicenseTerms(
  client: StoryClient,
  ipId: Address,
  licenseTermsId: bigint = 1n
): Promise<AttachLicenseTermsResult> {
  try {
    const response = await client.license.attachLicenseTerms({
      ipId,
      licenseTermsId,
    });

    if (!response.txHash) {
      throw new Error('Failed to attach license terms: Missing transaction hash');
    }

    return {
      txHash: response.txHash,
      licenseTermsId: licenseTermsId.toString(),
    };
  } catch (error) {
    console.error('Failed to attach license terms:', error);
    throw error;
  }
}

/**
 * Register PIL terms and attach to IP Asset in one transaction
 * Use this for custom license configurations
 * @param client - Story Protocol client instance
 * @param ipId - IP Asset ID
 * @param config - PIL license configuration
 * @returns Transaction hash and license terms ID
 */
export async function registerAndAttachPILTerms(
  client: StoryClient,
  ipId: Address,
  config: PILLicenseConfig
): Promise<AttachLicenseTermsResult> {
  try {
    // Dynamic import to avoid bundling issues
    const { PILFlavor } = await import('@story-protocol/core-sdk');
    const { parseEther } = await import('viem');

    let terms;

    switch (config.type) {
      case 'non-commercial':
        // For non-commercial, just use the default license terms ID
        return attachLicenseTerms(client, ipId, 1n);

      case 'commercial-use':
        terms = PILFlavor.commercialUse({
          defaultMintingFee: parseEther(config.mintingFee || '1'),
          currency: config.currency || ('0x1514000000000000000000000000000000000000' as Address),
        });
        break;

      case 'commercial-remix':
        terms = PILFlavor.commercialRemix({
          commercialRevShare: config.commercialRevShare || 10,
          defaultMintingFee: parseEther(config.mintingFee || '1'),
          currency: config.currency || ('0x1514000000000000000000000000000000000000' as Address),
        });
        break;

      default:
        throw new Error(`Unknown license type: ${config.type}`);
    }

    const response = await client.license.registerPilTermsAndAttach({
      ipId,
      licenseTermsData: [{ terms }],
    });

    if (!response.txHash || !response.licenseTermsIds || response.licenseTermsIds.length === 0) {
      throw new Error('Failed to register and attach PIL terms: Missing response data');
    }

    return {
      txHash: response.txHash,
      licenseTermsId: response.licenseTermsIds[0].toString(),
    };
  } catch (error) {
    console.error('Failed to register and attach PIL terms:', error);
    throw error;
  }
}

/**
 * Register fully custom PIL terms and attach to IP Asset
 * Use this when you need complete control over all license parameters
 * @param client - Story Protocol client instance
 * @param ipId - IP Asset ID
 * @param customTerms - Complete custom PIL terms configuration
 * @returns Transaction hash and license terms ID
 */
export async function registerCustomPILTerms(
  client: StoryClient,
  ipId: Address,
  customTerms: CustomPILTerms
): Promise<AttachLicenseTermsResult> {
  try {
    // Dynamic imports
    const { parseEther, zeroAddress } = await import('viem');

    // Default values for required fields
    const defaultRoyaltyPolicy = '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E' as Address; // RoyaltyPolicyLAP
    const defaultCurrency = '0x1514000000000000000000000000000000000000' as Address; // $IP token

    // Build the complete license terms object
    const licenseTerms = {
      // Transfer & Ownership
      transferable: customTerms.transferable ?? true,

      // Financial Parameters
      defaultMintingFee: customTerms.defaultMintingFee
        ? parseEther(customTerms.defaultMintingFee)
        : 0n,
      currency: customTerms.currency || defaultCurrency,
      royaltyPolicy: customTerms.royaltyPolicy || defaultRoyaltyPolicy,

      // Expiration
      expiration: customTerms.expiration ?? 0n,

      // Commercial Use
      commercialUse: customTerms.commercialUse ?? false,
      commercialAttribution: customTerms.commercialAttribution ?? false,
      commercialRevShare: customTerms.commercialRevShare ?? 0,
      commercialRevCeiling: customTerms.commercialRevCeiling ?? 0n,
      commercializerChecker: customTerms.commercializerChecker || zeroAddress,
      commercializerCheckerData: customTerms.commercializerCheckerData || ('0x' as `0x${string}`),

      // Derivatives
      derivativesAllowed: customTerms.derivativesAllowed ?? false,
      derivativesAttribution: customTerms.derivativesAttribution ?? false,
      derivativesApproval: customTerms.derivativesApproval ?? false,
      derivativesReciprocal: customTerms.derivativesReciprocal ?? false,
      derivativeRevCeiling: customTerms.derivativeRevCeiling ?? 0n,

      // Off-chain Terms
      uri: customTerms.uri || '',
    };

    console.log('[Story] Registering custom PIL terms:', licenseTerms);

    // Register and attach the custom terms
    const response = await client.license.registerPilTermsAndAttach({
      ipId,
      licenseTermsData: [{ terms: licenseTerms }],
    });

    if (!response.txHash || !response.licenseTermsIds || response.licenseTermsIds.length === 0) {
      throw new Error('Failed to register custom PIL terms: Missing response data');
    }

    console.log('[Story] Custom PIL terms registered:', {
      txHash: response.txHash,
      licenseTermsId: response.licenseTermsIds[0].toString(),
    });

    return {
      txHash: response.txHash,
      licenseTermsId: response.licenseTermsIds[0].toString(),
    };
  } catch (error) {
    console.error('[Story] Failed to register custom PIL terms:', error);
    throw error;
  }
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
