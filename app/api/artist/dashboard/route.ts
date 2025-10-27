import { NextRequest, NextResponse } from 'next/server';
import { Address, createPublicClient, http } from 'viem';

// Story Protocol API Configuration
const STORY_API_BASE_URL = process.env.NEXT_PUBLIC_STORY_API_URL || 'https://api.storyapis.com/api/v4';
const STORY_API_KEY = process.env.STORY_API_KEY || '';

// Chain IDs: 1514 (mainnet), 1315 (testnet Aeneid)
const CHAIN_NAMES: Record<string, string> = {
  '1514': 'Story Mainnet',
  '1315': 'Story Aeneid Testnet',
};

// RPC URLs for each chain
const RPC_URLS: Record<string, string> = {
  '1514': 'https://rpc.ankr.com/story_mainnet',
  '1315': 'https://aeneid.storyrpc.io',
};

// SPG NFT Contract addresses (public collections)
const SPG_NFT_CONTRACTS: Record<string, Address> = {
  '1514': (process.env.SPG_NFT_CONTRACT as Address) || '0xf06808081f6000F17c68D020ec8b159B0A851952' as Address, // Mainnet
  '1315': (process.env.SPG_NFT_CONTRACT as Address) || '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc' as Address, // Testnet
};

// Helper to get SPG NFT contract for a specific chain
const getSPGNFTContract = (chainId: string): Address => SPG_NFT_CONTRACTS[chainId] || SPG_NFT_CONTRACTS['1514'];

// Minimal ERC721 ABI for balanceOf and tokenOfOwnerByIndex
const ERC721_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' }
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
    ],
  },
] as const;

// ============================================================================
// TYPES
// ============================================================================

interface DashboardData {
  summary: {
    published: number;
    registered: number;
    earnedPerks: string;
    totalIncome: string;
  };
  movements: Array<{
    from: string;
    time: string;
    amount: string;
    status: 'pending' | 'completed';
  }>;
  pieces: Array<{
    name: string;
    artist: string;
    type: string;
    price: string;
    perks: string;
    status: 'pending' | 'completed';
    imageUrl?: string;
  }>;
}

// ============================================================================
// API CLIENT
// ============================================================================

async function storyApiRequest(endpoint: string, body?: any): Promise<any> {
  const url = `${STORY_API_BASE_URL}${endpoint}`;

  console.log(`[Story API Request] ${body ? 'POST' : 'GET'} ${url}`);
  if (body) {
    console.log('[Story API Request Body]', JSON.stringify(body, null, 2));
  }

  const options: RequestInit = {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': STORY_API_KEY,
    },
    cache: 'no-store', // Disable caching for real-time data
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Story API Error] ${response.status}: ${errorText}`);
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  console.log(`[Story API Response] Success - ${data.data?.length || 0} items`);
  return data;
}

/**
 * Get token IDs owned by a wallet directly from the NFT contract
 */
async function getTokenIdsFromContract(walletAddress: Address, chainId: string): Promise<bigint[]> {
  try {
    const rpcUrl = RPC_URLS[chainId];
    if (!rpcUrl) {
      console.log(`[getTokenIdsFromContract] No RPC URL for chain ${chainId}`);
      return [];
    }

    const spgContract = getSPGNFTContract(chainId);

    const client = createPublicClient({
      transport: http(rpcUrl),
    });

    // Get balance
    const balance = await client.readContract({
      address: spgContract,
      abi: ERC721_ABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    });

    console.log(`[getTokenIdsFromContract] Wallet ${walletAddress} has ${balance} tokens on chain ${chainId}`);

    if (balance === 0n) {
      return [];
    }

    // Get all token IDs
    const tokenIds: bigint[] = [];
    for (let i = 0; i < Number(balance); i++) {
      try {
        const tokenId = await client.readContract({
          address: spgContract,
          abi: ERC721_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [walletAddress, BigInt(i)],
        });
        tokenIds.push(tokenId);
      } catch (error) {
        console.error(`[getTokenIdsFromContract] Error getting token at index ${i}:`, error);
      }
    }

    console.log(`[getTokenIdsFromContract] Found ${tokenIds.length} token IDs:`, tokenIds.map(id => id.toString()));
    return tokenIds;
  } catch (error) {
    console.error('[getTokenIdsFromContract] Error:', error);
    return [];
  }
}

async function getIpAssetsByOwner(walletAddress: Address, chainId: string): Promise<any[]> {
  try {
    // First, get token IDs directly from the contract
    const tokenIds = await getTokenIdsFromContract(walletAddress, chainId);

    // Then fetch all assets from Story API
    const allAssets: any[] = [];
    let offset = 0;
    let hasMore = true;
    const limit = 100;

    while (hasMore) {
      const response = await storyApiRequest('/assets', {
        pagination: {
          limit: Math.min(limit, 200),
          offset: offset,
        },
        where: {
          ownerAddress: walletAddress,
        },
        includeLicenses: true,
        orderBy: 'blockNumber',
        orderDirection: 'desc',
      });

      if (response.data && response.data.length > 0) {
        allAssets.push(...response.data);

        if (response.data.length < limit) {
          hasMore = false;
        } else {
          offset += response.data.length;
        }
      } else {
        hasMore = false;
      }
    }

    // Filter assets by chainId from Story API
    const chainIds = [...new Set(allAssets.map(a => a.chainId || a.chain_id))];
    console.log(`[getIpAssetsByOwner Debug] All chainIds in API response: ${JSON.stringify(chainIds)}`);

    const filteredAssets = allAssets.filter(asset => {
      const assetChainId = asset.chainId || asset.chain_id || asset.blockMetadata?.chainId;
      return assetChainId === chainId || assetChainId === parseInt(chainId);
    });

    // If we have tokens from contract but not in API, create minimal asset objects
    if (tokenIds.length > 0 && filteredAssets.length < tokenIds.length) {
      console.log(`[getIpAssetsByOwner] Contract has ${tokenIds.length} tokens but API only shows ${filteredAssets.length}. Creating placeholder assets for missing tokens.`);

      const apiTokenIds = new Set(filteredAssets.map(a => a.tokenId?.toString()));

      const spgContract = getSPGNFTContract(chainId);

      for (const tokenId of tokenIds) {
        if (!apiTokenIds.has(tokenId.toString())) {
          // Create a minimal asset object for tokens not yet indexed by API
          filteredAssets.push({
            tokenId: tokenId.toString(),
            chainId: chainId,
            tokenContract: spgContract,
            ownerAddress: walletAddress,
            name: `Token #${tokenId}`,
            title: `Token #${tokenId}`,
            description: 'Recently registered (pending API indexing)',
            nftMetadata: {
              name: `Token #${tokenId}`,
              description: 'Recently registered (pending API indexing)',
            },
            licenses: [],
            _isPlaceholder: true, // Mark as placeholder
          });
        }
      }
    }

    console.log(`[getIpAssetsByOwner] Total assets: ${allAssets.length} from API, ${filteredAssets.length} for chain ${chainId} (${CHAIN_NAMES[chainId] || 'Unknown'}), ${tokenIds.length} from contract`);

    return filteredAssets;
  } catch (error) {
    console.error('[getIpAssetsByOwner] Error fetching assets:', error);

    // If it's a 404 or "no assets found", return empty array
    if ((error as Error).message.includes('404') || (error as Error).message.includes('not found')) {
      console.log('[getIpAssetsByOwner] No assets found for wallet, returning empty array');
      return [];
    }

    // Otherwise, rethrow the error
    throw error;
  }
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

function transformToDashboardData(assets: any[], walletAddress: Address): DashboardData {
  // Calculate summary
  const totalAssets = assets.length;
  const publishedCount = assets.filter(a => a.licenses && a.licenses.length > 0).length;

  // Transform pieces
  const pieces = assets.map(asset => {
    // Get name from various possible locations
    const name =
      asset.nftMetadata?.name ||
      asset.nftMetadata?.raw?.metadata?.name ||
      asset.name ||
      asset.title ||
      'Unnamed Piece';

    // Get creator name
    const creatorName =
      asset.nftMetadata?.raw?.metadata?.creators?.[0]?.name ||
      asset.nftMetadata?.metadata?.creators?.[0]?.name ||
      'Unknown Artist';

    // Determine if it has licenses
    const hasLicense = asset.licenses && asset.licenses.length > 0;
    const status: 'pending' | 'completed' = hasLicense ? 'completed' : 'pending';

    // Get license info for pricing
    const defaultMintingFee = asset.licenses?.[0]?.terms?.defaultMintingFee || '0';
    const commercialRevShare = asset.licenses?.[0]?.terms?.commercialRevShare || 0;

    // Convert from wei to IP tokens (1 IP = 10^18 wei)
    const feeInIPTokens = BigInt(defaultMintingFee) / BigInt(1e18);
    const priceInIPTokens = Number(feeInIPTokens);

    // Calculate revenue share (commercialRevShare is in basis points: 11000000 = 11%)
    const revSharePercent = commercialRevShare / 1000000;

    // Extract image URL from various possible locations
    // Priority: cached/optimized URLs first, then original IPFS URLs
    const imageUrl =
      asset.nftMetadata?.image?.cachedUrl ||           // Alchemy cached URL (fastest)
      asset.nftMetadata?.image?.thumbnailUrl ||        // Thumbnail version
      asset.nftMetadata?.raw?.metadata?.image ||       // Original from metadata JSON
      asset.nftMetadata?.image?.originalUrl ||         // Original IPFS URL
      asset.nftMetadata?.metadata?.image ||            // Legacy path
      asset.metadata?.image ||                         // Alternative path
      asset.image ||                                   // Direct image field
      null;

    return {
      name,
      artist: creatorName,
      type: 'IP Asset' as const,
      price: priceInIPTokens > 0 ? `${priceInIPTokens.toFixed(2)} IP` : 'Free',
      perks: revSharePercent > 0 ? `${revSharePercent.toFixed(2)}%` : 'No royalties',
      status: (hasLicense ? 'completed' : 'pending') as 'pending' | 'completed',
      imageUrl: imageUrl || undefined,
    };
  });

  // Calculate potential earnings from licenses
  let totalPotentialEarnings = 0;
  let totalRoyaltyPercent = 0;
  let assetsWithRoyalties = 0;

  assets.forEach(asset => {
    const defaultMintingFee = asset.licenses?.[0]?.terms?.defaultMintingFee || '0';
    const commercialRevShare = asset.licenses?.[0]?.terms?.commercialRevShare || 0;

    const feeInIPTokens = Number(BigInt(defaultMintingFee) / BigInt(1e18));
    totalPotentialEarnings += feeInIPTokens;

    if (commercialRevShare > 0) {
      totalRoyaltyPercent += (commercialRevShare / 1000000);
      assetsWithRoyalties++;
    }
  });

  const avgRoyaltyPercent = assetsWithRoyalties > 0
    ? (totalRoyaltyPercent / assetsWithRoyalties).toFixed(2)
    : '0';

  // Mock movements (Story Protocol doesn't provide transaction history in basic query)
  const movements = [
    {
      from: 'Story Protocol',
      time: 'No transactions yet',
      amount: '0 IP',
      status: 'completed' as const,
    },
  ];

  return {
    summary: {
      published: publishedCount,
      registered: totalAssets,
      earnedPerks: `${avgRoyaltyPercent}% avg royalty`,
      totalIncome: totalPotentialEarnings > 0
        ? `${totalPotentialEarnings.toFixed(2)} IP potential`
        : 'No earnings yet',
    },
    movements,
    pieces,
  };
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Get wallet address and chainId from query params
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const chainId = searchParams.get('chainId');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!chainId) {
      return NextResponse.json(
        { error: 'Chain ID is required' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Validate chainId is a Story network
    if (!CHAIN_NAMES[chainId]) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}. Please connect to Story Odyssey (1514) or Story Aeneid (1315)` },
        { status: 400 }
      );
    }

    console.log(`[Dashboard API] Fetching assets for wallet ${walletAddress} on ${CHAIN_NAMES[chainId]} (${chainId})`);

    // Fetch IP assets from Story Protocol
    const assets = await getIpAssetsByOwner(walletAddress as Address, chainId);

    // Transform to dashboard format
    const dashboardData = transformToDashboardData(assets, walletAddress as Address);

    return NextResponse.json({
      success: true,
      data: dashboardData,
      metadata: {
        wallet: walletAddress,
        chainId: chainId,
        network: CHAIN_NAMES[chainId],
        timestamp: new Date().toISOString(),
        totalAssets: assets.length,
      },
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    console.error('Error stack:', (error as Error).stack);

    // Check if it's an API authentication error
    if ((error as Error).message.includes('401') || (error as Error).message.includes('403')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Story API authentication failed',
          message: 'Please check your STORY_API_KEY environment variable',
          details: (error as Error).message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
