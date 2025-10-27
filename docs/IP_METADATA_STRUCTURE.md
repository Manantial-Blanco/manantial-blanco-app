# IP Asset Metadata Structure

This document describes the complete metadata structure used when registering IP Assets on Story Protocol through the Manantial Blanco Portal.

## Overview

Each registered artwork generates two metadata objects:
1. **IP Metadata** - Story Protocol specific metadata
2. **NFT Metadata** - ERC-721 standard metadata

Both are uploaded to IPFS and their hashes are stored on-chain for verification.

## IP Metadata Structure

### Required Fields (from Form)
```json
{
  "title": "Alebrije Alado",
  "description": "Colorful alebrije inspired by Mexican folk art...",
  "image": "https://gateway.pinata.cloud/ipfs/Qm..."
}
```

### Creator Information
```json
{
  "creators": [
    {
      "name": "Manantial Blanco Artist",
      "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      "contributionPercent": 100,
      "socialMedia": [
        {
          "platform": "Story Protocol",
          "url": "https://portal.story.foundation/user/0x742d35..."
        },
        {
          "platform": "Website",
          "url": "https://manantialblanco.com"
        }
      ]
    }
  ]
}
```

### Attributes & Tags
```json
{
  "attributes": [
    {
      "trait_type": "tag",
      "value": "digital-art"
    },
    {
      "trait_type": "tag",
      "value": "ip-asset"
    },
    {
      "trait_type": "tag",
      "value": "story-protocol"
    },
    {
      "trait_type": "platform",
      "value": "Manantial Blanco"
    },
    {
      "trait_type": "type",
      "value": "Original Artwork"
    },
    {
      "trait_type": "registered_on",
      "value": "Story Protocol"
    }
  ],
  "tags": ["digital-art", "ip-asset", "story-protocol"]
}
```

### Additional Metadata
```json
{
  "createdAt": "2025-01-24T10:30:00.000Z",
  "originalLanguage": "es",
  "app": {
    "id": "manantial-blanco",
    "name": "Manantial Blanco Portal",
    "website": "https://manantialblanco.com"
  }
}
```

## NFT Metadata Structure

### Core Fields (ERC-721 Standard)
```json
{
  "name": "Alebrije Alado",
  "description": "Colorful alebrije inspired by Mexican folk art...",
  "image": "ipfs://Qm..."
}
```

### Extended Fields
```json
{
  "animation_url": "ipfs://Qm...",
  "external_url": "https://portal.story.foundation/user/0x742d35...",
  "mediaUrl": "https://gateway.pinata.cloud/ipfs/Qm...",
  "mediaType": "image/jpeg",
  "mediaHash": "0x65edf795c1ef32de2e7929c9c2fbcd549152e36464b26ccab4f8f0437f96ee69"
}
```

### Creators & Attributes
```json
{
  "creators": [
    {
      "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      "name": "Manantial Blanco Artist"
    }
  ],
  "attributes": [
    // Same as IP Metadata attributes
  ]
}
```

## Complete Example

### IP Metadata (ip-metadata.json)
```json
{
  "title": "Alebrije Alado",
  "description": "A vibrant alebrije sculpture representing freedom and Mexican cultural heritage.",
  "image": "https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "creators": [
    {
      "name": "Manantial Blanco Artist",
      "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      "contributionPercent": 100,
      "socialMedia": [
        {
          "platform": "Story Protocol",
          "url": "https://portal.story.foundation/user/0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        },
        {
          "platform": "Website",
          "url": "https://manantialblanco.com"
        }
      ]
    }
  ],
  "attributes": [
    {
      "trait_type": "tag",
      "value": "digital-art"
    },
    {
      "trait_type": "tag",
      "value": "ip-asset"
    },
    {
      "trait_type": "tag",
      "value": "story-protocol"
    },
    {
      "trait_type": "platform",
      "value": "Manantial Blanco"
    },
    {
      "trait_type": "type",
      "value": "Original Artwork"
    },
    {
      "trait_type": "registered_on",
      "value": "Story Protocol"
    }
  ],
  "tags": ["digital-art", "ip-asset", "story-protocol"],
  "createdAt": "2025-01-24T10:30:00.000Z",
  "originalLanguage": "es",
  "app": {
    "id": "manantial-blanco",
    "name": "Manantial Blanco Portal",
    "website": "https://manantialblanco.com"
  }
}
```

### NFT Metadata (nft-metadata.json)
```json
{
  "name": "Alebrije Alado",
  "description": "A vibrant alebrije sculpture representing freedom and Mexican cultural heritage.",
  "image": "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "animation_url": "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "external_url": "https://portal.story.foundation/user/0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "mediaUrl": "https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  "mediaType": "image/jpeg",
  "mediaHash": "0x65edf795c1ef32de2e7929c9c2fbcd549152e36464b26ccab4f8f0437f96ee69",
  "attributes": [
    {
      "trait_type": "tag",
      "value": "digital-art"
    },
    {
      "trait_type": "tag",
      "value": "ip-asset"
    },
    {
      "trait_type": "tag",
      "value": "story-protocol"
    },
    {
      "trait_type": "platform",
      "value": "Manantial Blanco"
    },
    {
      "trait_type": "type",
      "value": "Original Artwork"
    },
    {
      "trait_type": "registered_on",
      "value": "Story Protocol"
    }
  ],
  "creators": [
    {
      "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      "name": "Manantial Blanco Artist"
    }
  ]
}
```

## Default Values

The following fields are automatically populated with default values if not provided:

| Field | Default Value | Can Override |
|-------|---------------|--------------|
| `creators[0].name` | "Manantial Blanco Artist" | Yes (future) |
| `creators[0].socialMedia` | Story Protocol + Website links | Yes (future) |
| `tags` | ["digital-art", "ip-asset", "story-protocol"] | Yes (future) |
| `attributes` | Platform, type, registered_on | Yes (future) |
| `originalLanguage` | "es" | Yes (future) |
| `app` | Manantial Blanco info | No |
| `createdAt` | Current timestamp | No |
| `mediaType` | "image/jpeg" | Yes (detected from file) |

## Verification

Both metadata objects are hashed using SHA-256:
- **IP Metadata Hash**: SHA-256 of the complete IP metadata JSON
- **NFT Metadata Hash**: SHA-256 of the complete NFT metadata JSON
- **Media Hash**: SHA-256 of the image file itself

These hashes are stored on-chain as part of the IP Asset registration, ensuring metadata integrity and preventing tampering.

## Future Enhancements

Fields that can be added to the form in the future:
- Custom artist name (instead of wallet address)
- Social media links (Instagram, Twitter, etc.)
- Custom tags and categories
- Artwork medium and dimensions
- Edition information
- Physical artwork details
- Custom language selection

## References

- [Story Protocol IPA Metadata Standard](https://docs.story.foundation/concepts/ip-asset/metadata)
- [ERC-721 Metadata Standard](https://eips.ethereum.org/EIPS/eip-721)
- [IPFS Best Practices](https://docs.ipfs.tech/concepts/best-practices/)
