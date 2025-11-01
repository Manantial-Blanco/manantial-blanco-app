/**
 * Check Rock10 licenses using Story Protocol API
 * Usage: npx tsx scripts/check-rock10-api.ts
 *
 * Make sure to set STORY_API_KEY in your environment:
 * STORY_API_KEY=your_key npx tsx scripts/check-rock10-api.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const STORY_API_BASE_URL = process.env.NEXT_PUBLIC_STORY_API_URL || 'https://api.storyapis.com/api/v4';
const STORY_API_KEY = process.env.STORY_API_KEY || '';
const ROCK10_IP_ID = '0x2309C7B3F8A33aF01bc6d5fB80471F627976Ef42';

console.log('🔑 API Key configured:', STORY_API_KEY ? 'Yes ✅' : 'No ❌');

function getLicenseName(licenseTermsId: string | number): string {
  const id = licenseTermsId.toString();
  switch (id) {
    case '1':
      return 'Non-Commercial Social Remixing (PIL)';
    case '2':
      return 'Commercial Use (PIL)';
    case '3':
      return 'Commercial Remix (PIL)';
    default:
      return `Custom License (ID: ${id})`;
  }
}

async function checkRock10Licenses() {
  console.log('\n🎸 Checking Rock10 IP Asset via Story Protocol API\n');
  console.log('='.repeat(80));
  console.log(`IP ID: ${ROCK10_IP_ID}`);
  console.log(`Story Portal: https://portal.story.foundation/assets/${ROCK10_IP_ID}`);
  console.log('='.repeat(80));

  try {
    console.log('\n📋 Fetching recent assets from Story Protocol API...\n');

    // Fetch recent assets (without filtering by ipId since the API format is unclear)
    const response = await fetch(`${STORY_API_BASE_URL}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': STORY_API_KEY,
      },
      body: JSON.stringify({
        pagination: {
          limit: 100,
          offset: 0,
        },
        includeLicenses: true,
        orderBy: 'blockNumber',
        orderDirection: 'desc',
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.data || result.data.length === 0) {
      throw new Error('No assets found in Story Protocol');
    }

    // Find Rock10 by IP ID
    const asset = result.data.find((a: any) =>
      a.ipId?.toLowerCase() === ROCK10_IP_ID.toLowerCase() ||
      a.id?.toLowerCase() === ROCK10_IP_ID.toLowerCase()
    );

    if (!asset) {
      console.log(`\n❌ Rock10 (${ROCK10_IP_ID}) not found in recent assets.`);
      console.log(`   Fetched ${result.data.length} recent assets but Rock10 was not among them.\n`);
      console.log('💡 TIP: Rock10 might be older. Try checking Story Portal directly:');
      console.log(`   https://portal.story.foundation/assets/${ROCK10_IP_ID}\n`);
      return;
    }

    const data = { data: asset };

    console.log('✅ Asset found!');
    console.log(`   Title: ${data.data?.nftMetadata?.name || 'Unknown'}`);
    console.log(`   Owner: ${data.data?.owner || 'Unknown'}`);
    console.log(`   Token Contract: ${data.data?.nftMetadata?.tokenContract || 'Unknown'}`);
    console.log(`   Token ID: ${data.data?.nftMetadata?.tokenId || 'Unknown'}`);

    // Check licenses
    const licenses = data.data?.licenses || [];

    console.log(`\n📜 Attached Licenses: ${licenses.length}\n`);

    if (licenses.length === 0) {
      console.log('❌ This IP has NO licenses attached.');
      console.log('   Cannot be remixed with the current flow.\n');
      console.log('💡 TIP: Only IPs with PIL terms can be remixed.');
      return;
    }

    // Display each license
    licenses.forEach((license: any, index: number) => {
      const licenseTermsId = license.licenseTermsId || license.id || 'Unknown';
      const licenseName = getLicenseName(licenseTermsId);

      console.log(`   ${index + 1}. License Terms ID: ${licenseTermsId}`);
      console.log(`      Name: ${licenseName}`);

      if (license.licenseTemplate) {
        console.log(`      Template: ${license.licenseTemplate}`);
      }

      if (license.terms) {
        console.log(`      Details:`);
        if (license.terms.transferable !== undefined) {
          console.log(`        - Transferable: ${license.terms.transferable}`);
        }
        if (license.terms.commercialUse !== undefined) {
          console.log(`        - Commercial Use: ${license.terms.commercialUse}`);
        }
        if (license.terms.derivativesAllowed !== undefined) {
          console.log(`        - Derivatives Allowed: ${license.terms.derivativesAllowed}`);
        }
        if (license.terms.commercialRevShare !== undefined) {
          console.log(`        - Commercial Rev Share: ${license.terms.commercialRevShare}%`);
        }
      }

      if (licenseTermsId.toString() === '1') {
        console.log(`      ✅ This license allows remixing!`);
      }

      console.log('');
    });

    console.log('='.repeat(80));

    // Check if license ID 1 exists
    const hasLicenseId1 = licenses.some((l: any) =>
      l.licenseTermsId?.toString() === '1' || l.id?.toString() === '1'
    );

    if (hasLicenseId1) {
      console.log('\n✨ GOOD NEWS! Rock10 CAN be remixed!\n');
      console.log('This IP has the "Non-Commercial Social Remixing" license (ID: 1) attached.');
      console.log('You can create remixes using the two-step flow:');
      console.log('  1. Go to landing page and find Rock10');
      console.log('  2. Click "Remix" button');
      console.log('  3. Mint a license token from this IP');
      console.log('  4. Use the token to register your derivative\n');
    } else {
      const licenseIds = licenses.map((l: any) => l.licenseTermsId || l.id).join(', ');
      console.log('\n⚠️  Rock10 has licenses, but NOT license ID 1.\n');
      console.log('The current remix flow requires license ID 1 (Non-Commercial Social Remixing).');
      console.log(`Available licenses: ${licenseIds}`);
      console.log('\nYou may need to update the remix flow to use a different license ID.\n');
    }

  } catch (error: any) {
    console.error('\n❌ Error fetching asset data:', error.message);

    if (error.message.includes('404')) {
      console.log('\n💡 The IP ID may not exist or may not be indexed yet.');
    }

    console.error('\nFull error:', error);
  }
}

checkRock10Licenses().catch(console.error);
