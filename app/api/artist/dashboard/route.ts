import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';

// Story Protocol API Configuration
const STORY_API_BASE_URL = process.env.NEXT_PUBLIC_STORY_API_URL || 'https://api.storyapis.com/api/v4';
const STORY_API_KEY = process.env.STORY_API_KEY || '';

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
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  return await response.json();
}

async function getIpAssetsByOwner(walletAddress: Address): Promise<any[]> {
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

  return allAssets;
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

    // Get license info for perks/pricing
    const defaultMintingFee = asset.licenses?.[0]?.terms?.defaultMintingFee || '0';
    const feeInEth = parseInt(defaultMintingFee) / 1e18;

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
      price: `$${(feeInEth * 3000).toFixed(2)} USD`, // Rough ETH to USD conversion
      perks: `$${(feeInEth * 3000 * 0.1).toFixed(2)} USD`, // 10% perks estimate
      status: (hasLicense ? 'completed' : 'pending') as 'pending' | 'completed',
      imageUrl: imageUrl || undefined,
    };
  });

  // Mock movements (Story Protocol doesn't provide transaction history in basic query)
  const movements = [
    {
      from: 'Story Protocol',
      time: 'Recently',
      amount: '$0.00 USD',
      status: 'completed' as const,
    },
  ];

  return {
    summary: {
      published: publishedCount,
      registered: totalAssets,
      earnedPerks: '0', // TODO: Calculate from actual royalty data
      totalIncome: '$0.00', // TODO: Calculate from actual transaction data
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
    // Get wallet address from query params
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
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

    // Fetch IP assets from Story Protocol
    const assets = await getIpAssetsByOwner(walletAddress as Address);

    // Transform to dashboard format
    const dashboardData = transformToDashboardData(assets, walletAddress as Address);

    return NextResponse.json({
      success: true,
      data: dashboardData,
      metadata: {
        wallet: walletAddress,
        timestamp: new Date().toISOString(),
        totalAssets: assets.length,
      },
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);

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
