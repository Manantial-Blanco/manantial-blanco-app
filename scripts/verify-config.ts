/**
 * Configuration Verification Script
 * Run with: npx tsx scripts/verify-config.ts
 *
 * This script verifies that all environment variables are set correctly
 * for IP Asset registration on Story Protocol.
 */

console.log('\n🔍 Manantial Blanco - Configuration Verification\n');
console.log('='.repeat(60));

// Check environment variables
const requiredVars = {
  'NEXT_PUBLIC_RPC_PROVIDER_URL': process.env.NEXT_PUBLIC_RPC_PROVIDER_URL,
  'SPG_NFT_CONTRACT': process.env.SPG_NFT_CONTRACT,
  'NEXT_PUBLIC_PINATA_JWT': process.env.NEXT_PUBLIC_PINATA_JWT,
  'STORY_API_KEY': process.env.STORY_API_KEY,
  'NEXT_PUBLIC_REOWN_PROJECT_ID': process.env.NEXT_PUBLIC_REOWN_PROJECT_ID,
};

const optionalVars = {
  'NEXT_PUBLIC_PINATA_GATEWAY': process.env.NEXT_PUBLIC_PINATA_GATEWAY,
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
};

let hasErrors = false;

console.log('\n📋 Required Configuration:\n');

Object.entries(requiredVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const displayValue = value
    ? (value.length > 50 ? `${value.substring(0, 47)}...` : value)
    : 'NOT SET';

  console.log(`${status} ${key}: ${displayValue}`);

  if (!value) {
    hasErrors = true;
  }
});

console.log('\n📋 Optional Configuration:\n');

Object.entries(optionalVars).forEach(([key, value]) => {
  const status = value ? '✅' : '⚠️ ';
  const displayValue = value
    ? (value.length > 50 ? `${value.substring(0, 47)}...` : value)
    : 'NOT SET (optional)';

  console.log(`${status} ${key}: ${displayValue}`);
});

// Network detection
console.log('\n🌐 Network Configuration:\n');

const rpcUrl = process.env.NEXT_PUBLIC_RPC_PROVIDER_URL || '';
const isMainnet = rpcUrl.includes('rpc.storyrpc.io');
const isTestnet = rpcUrl.includes('aeneid.storyrpc.io');

if (isMainnet) {
  console.log('✅ Network: Story Mainnet (Chain ID: 1514)');
  console.log('   RPC: https://rpc.storyrpc.io');
  console.log('   Explorer: https://storyscan.xyz');

  const expectedContract = '0xf06808081f6000F17c68D020ec8b159B0A851952';
  const actualContract = process.env.SPG_NFT_CONTRACT;

  if (actualContract === expectedContract) {
    console.log(`✅ SPG NFT Contract: ${expectedContract} (Mainnet Public Collection)`);
  } else if (actualContract) {
    console.log(`⚠️  SPG NFT Contract: ${actualContract} (Custom Collection)`);
    console.log(`   Expected Mainnet Public: ${expectedContract}`);
  } else {
    console.log(`❌ SPG NFT Contract: NOT SET`);
    hasErrors = true;
  }
} else if (isTestnet) {
  console.log('✅ Network: Story Aeneid Testnet (Chain ID: 1315)');
  console.log('   RPC: https://aeneid.storyrpc.io');
  console.log('   Explorer: https://aeneid.storyscan.xyz');

  const expectedContract = '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc';
  const actualContract = process.env.SPG_NFT_CONTRACT;

  if (actualContract === expectedContract) {
    console.log(`✅ SPG NFT Contract: ${expectedContract} (Testnet Public Collection)`);
  } else if (actualContract) {
    console.log(`⚠️  SPG NFT Contract: ${actualContract} (Custom Collection)`);
    console.log(`   Expected Testnet Public: ${expectedContract}`);
  } else {
    console.log(`❌ SPG NFT Contract: NOT SET`);
    hasErrors = true;
  }
} else {
  console.log('❌ Unknown network configuration');
  console.log(`   Current RPC: ${rpcUrl || 'NOT SET'}`);
  console.log('   Expected Mainnet: https://rpc.storyrpc.io');
  console.log('   Expected Testnet: https://aeneid.storyrpc.io');
  hasErrors = true;
}

// IPFS Configuration
console.log('\n💾 IPFS Configuration:\n');

const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;
const pinataGateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';

if (pinataJwt) {
  console.log('✅ Pinata JWT: Configured');
  console.log(`   Gateway: ${pinataGateway}`);
} else {
  console.log('❌ Pinata JWT: NOT SET');
  console.log('   IPFS uploads will fail without Pinata credentials');
  hasErrors = true;
}

// Story API
console.log('\n🔑 Story Protocol API:\n');

const storyApiKey = process.env.STORY_API_KEY;
const storyApiUrl = process.env.NEXT_PUBLIC_STORY_API_URL || 'https://api.storyapis.com/api/v4';

if (storyApiKey) {
  console.log('✅ Story API Key: Configured');
  console.log(`   API URL: ${storyApiUrl}`);
} else {
  console.log('❌ Story API Key: NOT SET');
  console.log('   Dashboard data fetching may fail');
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('\n❌ Configuration has errors! Please fix the issues above.\n');
  console.log('📝 Create a .env.local file with the missing variables:');
  console.log('   cp .env.template .env.local');
  console.log('   # Then edit .env.local with your values\n');
  process.exit(1);
} else {
  console.log('\n✅ Configuration is complete and valid!\n');
  console.log('🚀 You can now run the application:');
  console.log('   npm run dev\n');
  console.log('📖 For testing instructions, see:');
  console.log('   docs/TESTING_CHECKLIST.md\n');
  process.exit(0);
}
