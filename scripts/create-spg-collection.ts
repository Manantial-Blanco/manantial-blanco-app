/**
 * Script to create an SPG NFT Collection on Story Protocol
 * Run with: npx tsx scripts/create-spg-collection.ts
 */

import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { http, createWalletClient, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Configuration
const CHAIN_ID: 'mainnet' | 'aeneid' = 'mainnet'; // Change to 'aeneid' for testnet
const RPC_URLS = {
  mainnet: 'https://rpc.ankr.com/story_mainnet',
  aeneid: 'https://aeneid.storyrpc.io',
};

// IMPORTANT: Set this in your environment or replace with your private key
// NEVER commit private keys to git!
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;

if (!PRIVATE_KEY) {
  console.error('❌ Error: DEPLOYER_PRIVATE_KEY environment variable is required');
  console.log('\nUsage:');
  console.log('  DEPLOYER_PRIVATE_KEY=0x... npx tsx scripts/create-spg-collection.ts');
  process.exit(1);
}

async function createSPGCollection() {
  try {
    console.log(`\n🚀 Creating SPG NFT Collection on Story Protocol ${CHAIN_ID}...\n`);

    // Create wallet from private key
    const account = privateKeyToAccount(PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: CHAIN_ID === 'mainnet'
        ? { id: 1514, name: 'Story Mainnet' } as any
        : { id: 1315, name: 'Story Aeneid' } as any,
      transport: http(RPC_URLS[CHAIN_ID]),
    });

    console.log(`📝 Using wallet address: ${account.address}`);

    // Create Story Protocol client
    const config: StoryConfig = {
      account,
      transport: http(RPC_URLS[CHAIN_ID]),
      chainId: CHAIN_ID,
      wallet: walletClient,
    };

    const client = StoryClient.newClient(config);
    console.log(`✅ Story Protocol client created for ${CHAIN_ID}\n`);

    // Create SPG NFT Collection
    console.log('📦 Creating SPG NFT Collection...');
    const collectionResponse = await client.nftClient.createNFTCollection({
      name: 'Manantial Blanco IP Assets',
      symbol: 'MBIA',
      maxSupply: 1000,
      isPublicMinting: true,
      mintOpen: true,
      mintFeeRecipient: account.address,
      contractURI: '', // Optional: Add metadata URI for collection
    });

    if (!collectionResponse.spgNftContract) {
      throw new Error('Failed to create NFT collection');
    }

    console.log('\n✅ SPG NFT Collection created successfully!');
    console.log(`\n📋 Collection Details:`);
    console.log(`   Contract Address: ${collectionResponse.spgNftContract}`);
    console.log(`   Transaction Hash: ${collectionResponse.txHash}`);
    console.log(`\n💡 Add this to your .env.local file:`);
    console.log(`   SPG_NFT_CONTRACT=${collectionResponse.spgNftContract}`);
    console.log(`   NEXT_PUBLIC_RPC_PROVIDER_URL=${RPC_URLS[CHAIN_ID]}\n`);

    return collectionResponse.spgNftContract;
  } catch (error) {
    console.error('\n❌ Error creating SPG NFT collection:', error);
    throw error;
  }
}

// Run the script
createSPGCollection()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
