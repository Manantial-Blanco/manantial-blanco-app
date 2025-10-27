# Story Protocol Integration Guide

This document explains how the Story Protocol integration works in Manantial Blanco Portal.

## Overview

Story Protocol enables you to register your artwork as IP Assets on the blockchain, creating immutable records of ownership and allowing for programmable licensing.

## Features

- ✅ **IP Asset Registration** - Register artwork as blockchain-verified IP assets
- ✅ **IPFS Storage** - Decentralized storage for images and metadata via Pinata
- ✅ **NFT Minting** - Automatic NFT minting during IP registration
- ✅ **Metadata Verification** - SHA-256 hashes ensure metadata integrity
- ✅ **License Management** - Set remix permissions and license pricing

## Architecture

### Services

1. **Story Protocol Service** ([lib/services/story.ts](../lib/services/story.ts))
   - Handles blockchain interactions with Story Protocol
   - Creates Story client, registers IP assets
   - Manages metadata preparation and hashing

2. **IPFS Service** ([lib/services/ipfs.ts](../lib/services/ipfs.ts))
   - Uploads files and JSON to IPFS via Pinata
   - Generates IPFS gateway URLs
   - Handles image and metadata uploads

3. **Database Integration**
   - Extended `pieces` table with Story Protocol fields
   - Stores IP IDs, transaction hashes, and IPFS URIs

## Setup Instructions

### 1. Environment Variables

Copy `.env.template` to `.env.local` and configure:

```bash
# Story Protocol
NEXT_PUBLIC_RPC_PROVIDER_URL=https://rpc.odyssey.storyrpc.io
SPG_NFT_CONTRACT=  # Optional - uses default public contract if not set

# Pinata IPFS
PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Wallet Connection
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
```

### 2. Database Migration

Run the migration script in your Supabase SQL editor:

```sql
-- For new installations
/docs/sql/schema.sql

-- For existing installations
/docs/sql/migration_add_story_protocol_fields.sql
```

### 3. Get API Keys

**Pinata (IPFS)**
1. Sign up at [pinata.cloud](https://pinata.cloud)
2. Create an API key with upload permissions
3. Copy the JWT token to `PINATA_JWT`

**Reown AppKit**
1. Sign up at [cloud.reown.com](https://cloud.reown.com)
2. Create a new project
3. Copy the Project ID to `NEXT_PUBLIC_REOWN_PROJECT_ID`

**Story Protocol**
- Testnet RPC is public: `https://rpc.odyssey.storyrpc.io`
- Mainnet RPC: `https://mainnet.storyrpc.io`

### 4. SPG NFT Contract (Optional)

The app uses a default public SPG NFT contract for testing. For production:

1. Visit [Story Protocol Docs](https://docs.story.foundation/)
2. Deploy your own SPG NFT contract
3. Set `SPG_NFT_CONTRACT` to your contract address

## Registration Flow

### User Journey

1. **Connect Wallet** - User connects via Reown AppKit
2. **Fill Form** - Enter artwork name, description, upload image
3. **Set License** - Configure price and remix permissions
4. **Review** - Verify all information
5. **Submit** - Triggers blockchain registration

### Technical Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     IP Asset Registration                    │
└─────────────────────────────────────────────────────────────┘

1. Upload Image → Pinata
   ├─> Returns: IPFS hash
   └─> Generate: Gateway URL

2. Prepare Metadata
   ├─> IP Metadata: {title, description, image, creators}
   └─> NFT Metadata: {name, description, image, attributes}

3. Upload Metadata → Pinata
   ├─> Upload IP metadata → IPFS hash
   └─> Upload NFT metadata → IPFS hash

4. Create Verification Hashes
   ├─> SHA-256 of IP metadata
   └─> SHA-256 of NFT metadata

5. Initialize Story Client
   └─> Connect with user's wallet

6. Register IP Asset (Blockchain Transaction)
   ├─> Mint NFT on SPG contract
   ├─> Register as IP Asset
   └─> Returns: txHash, ipId, tokenId

7. Save to Supabase
   └─> Store all IDs, hashes, and URIs
```

## Code Examples

### Register IP Asset

```typescript
import { useAccount, useWalletClient } from 'wagmi';
import { createStoryClient, registerIPAsset } from '@/lib/services/story';
import { uploadFileToIPFS, uploadJSONToIPFS } from '@/lib/services/ipfs';

// Upload image
const imageHash = await uploadFileToIPFS(imageFile, 'artwork');
const imageUrl = getIPFSUrl(imageHash);

// Prepare metadata
const { ipMetadata, nftMetadata } = prepareMetadata({
  name: 'My Artwork',
  description: 'Beautiful piece',
  imageUrl,
  creatorName: 'Artist Name',
  creatorAddress: walletAddress,
});

// Upload metadata
const ipMetadataHash = await uploadJSONToIPFS(ipMetadata);
const nftMetadataHash = await uploadJSONToIPFS(nftMetadata);

// Create hashes
const ipHash = await createMetadataHash(ipMetadata);
const nftHash = await createMetadataHash(nftMetadata);

// Register
const storyClient = createStoryClient(walletClient);
const result = await registerIPAsset(storyClient, {
  nftContract: getSPGNFTContract(),
  ipMetadata: {
    ipMetadataURI: getIPFSUrl(ipMetadataHash),
    ipMetadataHash: ipHash,
    nftMetadataURI: getIPFSUrl(nftMetadataHash),
    nftMetadataHash: nftHash,
  },
});

// Result contains: txHash, ipId, tokenId
```

### Query IP Asset

```typescript
// From Supabase
const { data } = await supabase
  .from('pieces')
  .select('*')
  .eq('ip_id', ipId)
  .single();

console.log({
  ipId: data.ip_id,
  tokenId: data.token_id,
  transactionHash: data.transaction_hash,
  ipMetadataUri: data.ip_metadata_uri,
});
```

## Database Schema

### Pieces Table (Story Protocol Fields)

```sql
CREATE TABLE pieces (
  -- Core fields
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  creator_user_id UUID REFERENCES users(id),

  -- Story Protocol fields
  ip_id TEXT UNIQUE,              -- Story IP Asset ID
  token_id TEXT,                  -- NFT Token ID
  token_contract TEXT,            -- SPG NFT Contract
  transaction_hash TEXT,          -- Blockchain TX hash

  -- IPFS Metadata
  ip_metadata_uri TEXT,           -- IPFS URI for IP metadata
  ip_metadata_hash TEXT,          -- SHA-256 hash
  nft_metadata_uri TEXT,          -- IPFS URI for NFT metadata
  nft_metadata_hash TEXT,         -- SHA-256 hash

  -- License fields
  license_price DECIMAL(10, 2),   -- Price in $IP tokens
  can_remix BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Metadata Structure

### IP Metadata

```json
{
  "title": "Alebrije Alado",
  "description": "A vibrant Mexican folk art piece...",
  "image": "https://gateway.pinata.cloud/ipfs/Qm...",
  "creators": [
    {
      "name": "0x1234...5678",
      "address": "0x1234567890abcdef...",
      "contributionPercent": 100
    }
  ],
  "attributes": [
    { "trait_type": "tag", "value": "mexican-art" },
    { "trait_type": "tag", "value": "colorful" }
  ]
}
```

### NFT Metadata (ERC-721)

```json
{
  "name": "Alebrije Alado",
  "description": "A vibrant Mexican folk art piece...",
  "image": "https://gateway.pinata.cloud/ipfs/Qm...",
  "attributes": [
    { "trait_type": "tag", "value": "mexican-art" },
    { "trait_type": "tag", "value": "colorful" }
  ]
}
```

## Testing

### 1. Test Environment Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.template .env.local

# Add your API keys
# Edit .env.local with your Pinata JWT and Reown Project ID
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test Registration Flow

1. Go to `http://localhost:3000/en/register-piece`
2. Connect your wallet (MetaMask, WalletConnect, etc.)
3. Fill in the form:
   - Name: "Test Artwork"
   - Upload an image
   - Description: "Testing Story Protocol integration"
   - License Price: 10
   - Remix Permissions: Yes
4. Review and submit
5. Confirm the blockchain transaction in your wallet
6. Wait for confirmation (may take 30-60 seconds)
7. Success modal will show IP ID and transaction hash

### 4. Verify Registration

Check the browser console for detailed logs:
- Image upload to IPFS
- Metadata preparation
- IPFS uploads
- Story Protocol registration
- Database save

## Troubleshooting

### "Failed to initialize Story Protocol client"

- Check `NEXT_PUBLIC_RPC_PROVIDER_URL` is set
- Verify you're connected to the correct network
- Ensure wallet has gas for transactions

### "Pinata not configured"

- Verify `PINATA_JWT` is set in `.env.local`
- Check JWT has upload permissions
- Confirm Pinata account is active

### "Wallet client not available"

- Make sure wallet is connected via Reown AppKit
- Try disconnecting and reconnecting
- Check browser console for wallet errors

### Transaction fails

- Ensure wallet has sufficient gas (testnet ETH)
- Verify SPG NFT contract address is correct
- Check Story Protocol network status

## Resources

- [Story Protocol Docs](https://docs.story.foundation/)
- [Story Protocol SDK](https://github.com/storyprotocol/typescript-sdk)
- [Pinata Docs](https://docs.pinata.cloud/)
- [Reown AppKit Docs](https://docs.reown.com/appkit)

## Support

For issues or questions:
1. Check the browser console for detailed error messages
2. Review environment variables
3. Verify API keys and permissions
4. Check Story Protocol network status
