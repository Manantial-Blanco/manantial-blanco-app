/**
 * Script to check PIL licenses attached to IP assets
 * Usage: npx tsx scripts/check-ip-licenses.ts <IP_ID>
 */

import { createPublicClient, http, Address } from 'viem';
import { story } from 'viem/chains';

// Licensing Module Read Only ABI (simplified - just what we need)
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

// Licensing Module address on Story Protocol mainnet
const LICENSING_MODULE_ADDRESS = '0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f' as Address;

async function checkIPLicenses(ipId: string) {
  const client = createPublicClient({
    chain: story,
    transport: http('https://rpc.ankr.com/story_mainnet'),
  });

  console.log(`\nChecking licenses for IP: ${ipId}`);
  console.log('='.repeat(60));

  try {
    // Get count of attached licenses
    const count = await client.readContract({
      address: LICENSING_MODULE_ADDRESS,
      abi: LICENSING_MODULE_ABI,
      functionName: 'getAttachedLicenseTermsCount',
      args: [ipId as Address],
    });

    console.log(`\nNumber of attached licenses: ${count}`);

    if (count === 0n) {
      console.log('\n❌ This IP has NO licenses attached.');
      console.log('   It CANNOT be remixed because it lacks PIL terms.');
      return;
    }

    // Get each attached license
    console.log('\n✅ Attached License Terms IDs:');
    for (let i = 0; i < Number(count); i++) {
      const licenseTermsId = await client.readContract({
        address: LICENSING_MODULE_ADDRESS,
        abi: LICENSING_MODULE_ABI,
        functionName: 'getAttachedLicenseTerms',
        args: [ipId as Address, BigInt(i)],
      });

      const licenseName = getLicenseName(licenseTermsId);
      console.log(`   ${i + 1}. License ID: ${licenseTermsId} - ${licenseName}`);
    }

    console.log('\n✅ This IP CAN be remixed!');
    console.log(`   Use License Terms ID: ${await client.readContract({
      address: LICENSING_MODULE_ADDRESS,
      abi: LICENSING_MODULE_ABI,
      functionName: 'getAttachedLicenseTerms',
      args: [ipId as Address, 0n],
    })} when minting license tokens`);
  } catch (error: any) {
    console.error('\n❌ Error checking licenses:', error.message);
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

// Main execution
const ipId = process.argv[2];

if (!ipId) {
  console.error('Usage: npx tsx scripts/check-ip-licenses.ts <IP_ID>');
  console.error('Example: npx tsx scripts/check-ip-licenses.ts 0x2309C7B3F8A33aF01bc6d5fB80471F627976Ef42');
  process.exit(1);
}

checkIPLicenses(ipId);
