/**
 * Quick check for Rock10 IP asset licenses
 * Usage: npx tsx scripts/check-rock10.ts
 */

import { createPublicClient, http, Address } from 'viem';
import { story } from 'viem/chains';

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
const ROCK10_IP_ID = '0x2309C7B3F8A33aF01bc6d5fB80471F627976Ef42' as Address;

function getLicenseName(licenseId: bigint): string {
  switch (licenseId.toString()) {
    case '1':
      return 'Non-Commercial Social Remixing (PIL)';
    case '2':
      return 'Commercial Use (PIL)';
    case '3':
      return 'Commercial Remix (PIL)';
    default:
      return `Custom License (ID: ${licenseId})`;
  }
}

async function checkRock10() {
  console.log('\n🎸 Checking Rock10 IP Asset\n');
  console.log('='.repeat(80));
  console.log(`IP ID: ${ROCK10_IP_ID}`);
  console.log(`Story Portal: https://portal.story.foundation/assets/${ROCK10_IP_ID}`);
  console.log('='.repeat(80));

  const client = createPublicClient({
    chain: story,
    transport: http('https://rpc.ankr.com/story_mainnet'),
  });

  try {
    // Get license count
    console.log('\n📋 Querying Licensing Module contract...');
    const count = await client.readContract({
      address: LICENSING_MODULE_ADDRESS,
      abi: LICENSING_MODULE_ABI,
      functionName: 'getAttachedLicenseTermsCount',
      args: [ROCK10_IP_ID],
    });

    console.log(`\n✅ Number of attached licenses: ${count}\n`);

    if (count === 0n) {
      console.log('❌ This IP has NO licenses attached.');
      console.log('   Cannot be remixed.');
      return;
    }

    // Get each license
    console.log('📜 Attached Licenses:\n');
    const licenseIds: bigint[] = [];

    for (let i = 0; i < Number(count); i++) {
      const licenseTermsId = await client.readContract({
        address: LICENSING_MODULE_ADDRESS,
        abi: LICENSING_MODULE_ABI,
        functionName: 'getAttachedLicenseTerms',
        args: [ROCK10_IP_ID, BigInt(i)],
      });

      licenseIds.push(licenseTermsId);
      const licenseName = getLicenseName(licenseTermsId);
      console.log(`   ${i + 1}. License Terms ID: ${licenseTermsId}`);
      console.log(`      Name: ${licenseName}`);

      if (licenseTermsId === 1n) {
        console.log(`      ✅ This license allows remixing!`);
      }
      console.log('');
    }

    console.log('='.repeat(80));

    if (licenseIds.includes(1n)) {
      console.log('\n✨ GOOD NEWS! Rock10 CAN be remixed!\n');
      console.log('This IP has the "Non-Commercial Social Remixing" license (ID: 1) attached.');
      console.log('You can create remixes using the two-step flow:');
      console.log('  1. Mint a license token from this IP');
      console.log('  2. Use the token to register your derivative\n');
    } else {
      console.log('\n⚠️  Rock10 has licenses, but NOT license ID 1.\n');
      console.log('The current remix flow requires license ID 1 (Non-Commercial Social Remixing).');
      console.log('Available licenses:', licenseIds.map(id => id.toString()).join(', '));
      console.log('\nYou may need to update the remix flow to use a different license ID.\n');
    }

  } catch (error: any) {
    console.error('\n❌ Error querying contract:', error.message);
    console.error('\nFull error:', error);
  }
}

checkRock10().catch(console.error);
