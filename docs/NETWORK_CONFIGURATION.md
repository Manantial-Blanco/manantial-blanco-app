# Network Configuration Guide

This guide explains how to configure the Manantial Blanco Portal to work with Story Protocol networks (Mainnet and Testnet).

## Story Protocol Networks

### Story Mainnet (Chain ID: 1514)
- **RPC URL**: `https://rpc.storyrpc.io`
- **WebSocket**: `wss://rpc.storyrpc.io`
- **Explorer**: https://storyscan.xyz
- **Currency**: IP

### Story Aeneid Testnet (Chain ID: 1315)
- **RPC URL**: `https://aeneid.storyrpc.io`
- **WebSocket**: `wss://aeneid.storyrpc.io`
- **Explorer**: https://aeneid.storyscan.xyz
- **Currency**: IP (testnet)

## Environment Configuration

### For Mainnet (Production)

```env
# Story Protocol Mainnet Configuration
NEXT_PUBLIC_RPC_PROVIDER_URL=https://rpc.storyrpc.io
SPG_NFT_CONTRACT=0xf06808081f6000F17c68D020ec8b159B0A851952

# Story API (same for both networks)
STORY_API_KEY=your_api_key_here
NEXT_PUBLIC_STORY_API_URL=https://api.storyapis.com/api/v4
```

### For Testnet (Development)

```env
# Story Protocol Testnet Configuration
NEXT_PUBLIC_RPC_PROVIDER_URL=https://aeneid.storyrpc.io
SPG_NFT_CONTRACT=0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc

# Story API (same for both networks)
STORY_API_KEY=your_api_key_here
NEXT_PUBLIC_STORY_API_URL=https://api.storyapis.com/api/v4
```

## SPG NFT Contract Addresses

The SPG (Story Protocol Gateway) NFT contract is used to mint NFTs and register them as IP Assets in a single transaction.

Story Protocol provides **public SPG NFT collections** that you can use directly without deploying your own contracts. This is the recommended approach for most applications.

### Mainnet (Chain ID: 1514)
- **Public SPG NFT Contract**: `0xf06808081f6000F17c68D020ec8b159B0A851952`
- Free to use for all applications
- No deployment needed - works out of the box

### Testnet Aeneid (Chain ID: 1315)
- **Public SPG NFT Contract**: `0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc`
- Free to use for testing and development

> **Note**: The application automatically detects which network you're connected to and uses the correct contract address. You can also override this by setting `SPG_NFT_CONTRACT` in your `.env.local` file if you want to use your own custom collection.

## Creating Your Own SPG NFT Collection (Optional)

If you want to create a custom SPG NFT collection for your own branding:

1. Install dependencies:
```bash
npm install tsx --save-dev
```

2. Set your deployer private key:
```bash
export DEPLOYER_PRIVATE_KEY=0x...your_private_key
```

3. Run the collection creation script:
```bash
npx tsx scripts/create-spg-collection.ts
```

4. Update your `.env.local` with the new contract address:
```env
SPG_NFT_CONTRACT=0x...new_contract_address
```

## Wallet Configuration

Users need to add Story Protocol networks to their wallet (MetaMask, etc.):

### Add Story Mainnet to MetaMask

1. Open MetaMask
2. Click on the network dropdown
3. Select "Add Network"
4. Enter the following details:
   - **Network Name**: Story Mainnet
   - **RPC URL**: `https://rpc.storyrpc.io`
   - **Chain ID**: 1514
   - **Currency Symbol**: IP
   - **Block Explorer**: `https://storyscan.xyz`

### Add Story Aeneid Testnet to MetaMask

1. Open MetaMask
2. Click on the network dropdown
3. Select "Add Network"
4. Enter the following details:
   - **Network Name**: Story Aeneid Testnet
   - **RPC URL**: `https://aeneid.storyrpc.io`
   - **Chain ID**: 1315
   - **Currency Symbol**: IP
   - **Block Explorer**: `https://aeneid.storyscan.xyz`

## Network Detection in Code

The application automatically detects which network the user is connected to and validates it:

```typescript
// In RegisterPieceClient.tsx
if (chain?.id !== 1514 && chain?.id !== 1315) {
  setRegistrationError(
    `Wrong network! Please switch to Story Mainnet or Story Aeneid Testnet`
  );
  return;
}
```

The Story client is automatically configured based on the connected network:

```typescript
// In lib/services/story.ts
const walletChainId = walletClient.chain?.id;
let chainId: 'mainnet' | 'aeneid' = 'mainnet';

if (walletChainId === 1315) {
  chainId = 'aeneid';
} else if (walletChainId === 1514) {
  chainId = 'mainnet';
}
```

## Switching Networks

The application is designed to work seamlessly with both mainnet and testnet:

1. **User switches wallet network** → Application detects the change
2. **Application validates** → Ensures it's a Story Protocol network (1514 or 1315)
3. **Story client adapts** → Automatically uses the correct RPC and configuration
4. **Database tracks network** → Each piece is saved with its network identifier

## Getting Testnet IP Tokens

To test on Aeneid testnet, you'll need testnet IP tokens:

1. Visit the Story Protocol Discord: https://discord.gg/storyprotocol
2. Use the faucet channel to request testnet tokens
3. Or use the official faucet (if available)

## Troubleshooting

### Error: "Wrong network"
- Make sure your wallet is connected to either Story Mainnet (1514) or Story Aeneid Testnet (1315)
- Check that you've added the network to your wallet correctly

### Error: "SPG_NFT_CONTRACT not configured"
- Verify that `SPG_NFT_CONTRACT` is set in your `.env.local` file
- Make sure you're using the correct contract address for your network

### Error: "Failed to fetch"
- Check that `NEXT_PUBLIC_RPC_PROVIDER_URL` matches your wallet's network
- Verify your internet connection
- Try switching to a different RPC endpoint if available

## References

- [Story Protocol Documentation](https://docs.story.foundation)
- [Deployed Smart Contracts](https://docs.story.foundation/developers/deployed-smart-contracts)
- [Story Protocol Explorer](https://storyscan.xyz)
