/**
 * Script to find remixable IP assets from the landing page
 * Usage: npx tsx scripts/find-remixable-assets.ts
 */

import { createPublicClient, http, Address } from 'viem';
import { story } from 'viem/chains';

// Licensing Module Read Only ABI
const LICENSING_MODULE_ABI = [
  {
    inputs: [{ name: 'ipId', type: 'address' }],
    name: 'getAttachedLicenseTermsCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'ipId', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'getAttachedLicenseTerms',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const LICENSING_MODULE_ADDRESS = '0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f' as Address;

// Story Protocol API Configuration
const STORY_API_BASE_URL = 'https://api.storyapis.com/api/v4';
const STORY_API_KEY = process.env.STORY_API_KEY || '';

const FEATURED_WALLETS = [
  '0x19435c8368E81f7f72078DFf1D177fc9C1fC1a3F',
  '0x6B7572a1712b27D2E76Bd9ef6533022693314d54',
  '0x7e764d0C7be74d548f4836D357a31D17B0A81fB9',
  '0x2842decf9baEb5ec76988d1261325329848522Ae',
  '0xf4d588537576F6a140B208b1DC58F1d96af66d70',
];

async function fetchAssetsFromWallet(wallet: string) {
  const response = await fetch(`${STORY_API_BASE_URL}/assets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': STORY_API_KEY,
    },
    body: JSON.stringify({
      pagination: {
        limit: 20,
        offset: 0,
      },
      where: {
        ownerAddress: wallet,
      },
      includeLicenses: true,
      orderBy: 'blockNumber',
      orderDirection: 'desc',
    }),
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.data || [];
}

async function checkLicense(ipId: string, client: any) {
  try {
    const count = await client.readContract({
      address: LICENSING_MODULE_ADDRESS,
      abi: LICENSING_MODULE_ABI,
      functionName: 'getAttachedLicenseTermsCount',
      args: [ipId as Address],
    });

    if (count === 0n) {
      return { hasLicense: false, licenseIds: [] };
    }

    const licenseIds: bigint[] = [];
    for (let i = 0; i < Number(count); i++) {
      const licenseTermsId = await client.readContract({
        address: LICENSING_MODULE_ADDRESS,
        abi: LICENSING_MODULE_ABI,
        functionName: 'getAttachedLicenseTerms',
        args: [ipId as Address, BigInt(i)],
      });
      licenseIds.push(licenseTermsId);
    }

    return { hasLicense: true, licenseIds };
  } catch (error) {
    return { hasLicense: false, licenseIds: [], error };
  }
}

function getLicenseName(licenseId: bigint): string {
  switch (licenseId.toString()) {
    case '1':
      return 'Non-Commercial Social Remixing';
    case '2':
      return 'Commercial Use';
    case '3':
      return 'Commercial Remix';
    default:
      return 'Custom License';
  }
}

async function findRemixableAssets() {
  const client = createPublicClient({
    chain: story,
    transport: http('https://rpc.ankr.com/story_mainnet'),
  });

  console.log('\n🔍 Scanning IP assets from featured wallets...\n');
  console.log('='.repeat(80));

  const allAssets: Array<{
    ipId: string;
    title: string;
    hasLicense: boolean;
    licenseIds: bigint[];
  }> = [];

  // Fetch and check all assets
  for (const wallet of FEATURED_WALLETS) {
    console.log(`\n📁 Checking wallet: ${wallet}`);

    const assets = await fetchAssetsFromWallet(wallet);

    for (const asset of assets) {
      const ipId = asset.ipId || asset.id;
      const title = asset.nftMetadata?.name || asset.name || 'Untitled';
      const imageUrl = asset.nftMetadata?.image?.cachedUrl ||
                      asset.nftMetadata?.image?.thumbnailUrl ||
                      null;

      // Skip assets without images
      if (!imageUrl) continue;

      const licenseInfo = await checkLicense(ipId, client);

      allAssets.push({
        ipId,
        title,
        hasLicense: licenseInfo.hasLicense,
        licenseIds: licenseInfo.licenseIds,
      });

      const status = licenseInfo.hasLicense ? '✅' : '❌';
      console.log(`   ${status} ${title.substring(0, 40)} (${ipId})`);

      if (licenseInfo.hasLicense) {
        licenseInfo.licenseIds.forEach((id, idx) => {
          console.log(`      License ${idx + 1}: ${id} - ${getLicenseName(id)}`);
        });
      }
    }
  }

  console.log('\n');
  console.log('='.repeat(80));
  console.log('\n📊 SUMMARY\n');

  const remixableAssets = allAssets.filter(a => a.hasLicense);
  const nonRemixableAssets = allAssets.filter(a => !a.hasLicense);

  console.log(`Total assets found: ${allAssets.length}`);
  console.log(`✅ Remixable (have licenses): ${remixableAssets.length}`);
  console.log(`❌ Not remixable (no licenses): ${nonRemixableAssets.length}`);

  if (remixableAssets.length > 0) {
    console.log('\n✨ REMIXABLE ASSETS:\n');
    remixableAssets.forEach((asset, idx) => {
      console.log(`${idx + 1}. ${asset.title}`);
      console.log(`   IP ID: ${asset.ipId}`);
      console.log(`   Licenses: ${asset.licenseIds.map(id => `${id} (${getLicenseName(id)})`).join(', ')}`);
      console.log('');
    });

    console.log('💡 TIP: Try remixing one of the above assets!');
    console.log(`   Example: Go to the landing page and click "Remix" on "${remixableAssets[0].title}"`);
  } else {
    console.log('\n⚠️  WARNING: No remixable assets found!');
    console.log('   None of the assets in the landing page have PIL licenses attached.');
    console.log('   You can only remix assets that have been registered with PIL terms.');
  }
}

findRemixableAssets().catch(console.error);
