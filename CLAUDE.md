# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Manantial Blanco Portal is a Next.js 15 application for registering and managing artists' intellectual property ("Pieces") on the Story Protocol blockchain. It uses wallet-based authentication via Reown AppKit, Story Protocol SDK for IP asset registration, IPFS (Pinata) for metadata storage, and Supabase for data persistence, with full internationalization support (English/Spanish).

## Development Commands

```bash
# Development
npm run dev                  # Start dev server (http://localhost:3000)
npm run build                # Production build
npm run build:analyze        # Build with bundle analysis (opens in browser)
npm start                    # Start production server

# Code Quality
npm run lint                 # Run ESLint

# Testing
npm test                     # Run all tests with Vitest
npm run test:ui              # Run tests with UI interface
```

## Environment Setup

Required environment variables (copy from `.env.template` to `.env.local`):

**Supabase (Database)**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

**Reown AppKit (Wallet Connection)**
- `NEXT_PUBLIC_REOWN_PROJECT_ID` - Reown AppKit project ID

**Story Protocol (IP Asset Registration)**
- `NEXT_PUBLIC_RPC_PROVIDER_URL` - Story Protocol RPC endpoint
  - Mainnet (default): `https://rpc.storyrpc.io`
  - Testnet: `https://aeneid.storyrpc.io`
- `SPG_NFT_CONTRACT` - SPG NFT contract address (REQUIRED)
  - Mainnet: `0xf06808081f6000F17c68D020ec8b159B0A851952`
  - Testnet: `0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc`

**Pinata (IPFS Storage)**
- `PINATA_JWT` - Pinata JWT token for IPFS uploads
- `NEXT_PUBLIC_PINATA_GATEWAY` - Pinata gateway URL (default: https://gateway.pinata.cloud/ipfs/)

**OpenAI (Optional - for AI image descriptions)**
- `OPENAI_API_KEY` - OpenAI API key

The app will run with limited functionality if credentials are not provided. All services use lazy initialization and graceful fallbacks when not configured.

## Architecture Overview

### Routing Structure

The app uses Next.js 15 App Router with internationalized routes:
- **Route Pattern:** `/[lang]/*` where lang is 'en' or 'es'
- **Key Routes:**
  - `/[lang]/landing` - Public landing page with piece catalog
  - `/[lang]/login` - Wallet connection page
  - `/[lang]/home` - User dashboard (authenticated)
  - `/[lang]/register-piece` - Register new artwork
  - `/[lang]/piece/[id]` - Piece details page
  - `/[lang]/remix/[id]` - Remix creation flow

### Internationalization (i18n)

- **Dictionary System:** Custom dictionary-based i18n (no external i18n library)
- **Dictionaries:** [lib/i18n/dictionaries/en.ts](lib/i18n/dictionaries/en.ts), [lib/i18n/dictionaries/es.ts](lib/i18n/dictionaries/es.ts)
- **Locale Validation:** Use `isValidLocale()` from [lib/i18n/getDict.ts](lib/i18n/getDict.ts)
- **Usage Pattern:** Server components receive locale from route params and use `getDictionary(locale)`

### Authentication & Wallet Connection

- **Provider:** Reown AppKit (formerly WalletConnect AppKit)
- **Configuration:** [config/wagmi.ts](config/wagmi.ts) sets up Wagmi adapter with mainnet, arbitrum, polygon
- **AppKit Provider:** [components/providers/AppKitProvider.tsx](components/providers/AppKitProvider.tsx) wraps the app
- **Client-side Hooks:**
  - `useWalletConnect()` - Open modal, get connection status
  - `useWalletSession()` - Get current session info
  - `useUserProfile()` - Get social login info (email, username, auth provider)
  - `useUserEmail()` / `useUserName()` - Simple accessors
- **Service Location:** [lib/services/reown.ts](lib/services/reown.ts)

### Story Protocol Integration

- **SDK:** [@story-protocol/core-sdk](https://docs.story.foundation/developers/typescript-sdk)
- **Service Location:** [lib/services/story.ts](lib/services/story.ts)
- **Key Functions:**
  - `createStoryClient(wallet)` - Initialize Story Protocol client with wallet
  - `registerIPAsset(client, params)` - Register artwork as IP Asset on-chain
  - `prepareMetadata(pieceData)` - Prepare IP and NFT metadata structures
  - `createMetadataHash(metadata)` - Generate SHA-256 hash for metadata verification
  - `getSPGNFTContract()` - Get configured or default SPG NFT contract address

### IPFS Storage (Pinata)

- **Service Location:** [lib/services/ipfs.ts](lib/services/ipfs.ts)
- **Key Functions:**
  - `uploadFileToIPFS(file, name)` - Upload image/file to IPFS
  - `uploadJSONToIPFS(metadata, name)` - Upload JSON metadata to IPFS
  - `getIPFSUrl(hash)` - Convert IPFS hash to gateway URL
  - `uploadPieceToIPFS(imageFile, metadata)` - Complete piece upload (image + metadata)

### Database Schema

- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Schema Location:** [docs/sql/schema.sql](docs/sql/schema.sql)
- **Migration Script:** [docs/sql/migration_add_story_protocol_fields.sql](docs/sql/migration_add_story_protocol_fields.sql)
- **Tables:**
  - `users` - Wallet addresses, display names
  - `pieces` - Artwork metadata with Story Protocol fields:
    - Core: title, description, image_url, creator_user_id
    - Story Protocol: ip_id, token_id, token_contract, transaction_hash
    - IPFS: ip_metadata_uri, nft_metadata_uri, and their SHA-256 hashes
    - License: license_price, can_remix
  - `remixes` - Tracks original-to-remix relationships
- **Client:** [lib/supabase.ts](lib/supabase.ts) uses lazy initialization with Proxy pattern
- **RLS Policies:** All tables have policies - pieces viewable by all, editable only by creators

### IP Asset Registration Flow

The complete flow for registering artwork as IP asset (in [RegisterPieceClient.tsx](app/[lang]/register-piece/RegisterPieceClient.tsx)):

1. **Upload Image to IPFS** - Image file → Pinata → IPFS hash
2. **Prepare Metadata** - Create IP and NFT metadata objects with creator info
3. **Upload Metadata to IPFS** - Both IP and NFT metadata → Pinata → IPFS URIs
4. **Create Hashes** - Generate SHA-256 hashes of metadata for verification
5. **Initialize Story Client** - Create Story Protocol client with connected wallet
6. **Register on Blockchain** - Call `registerIPAsset` to mint NFT and register IP
7. **Save to Database** - Store IP ID, token ID, transaction hash, and metadata URIs in Supabase

### Provenance System

- **Hash Generation:** [lib/crypto.ts](lib/crypto.ts) uses Web Crypto API (SHA-256)
- **Story Protocol Hashes:** Generated for both IP and NFT metadata to ensure integrity
- **Purpose:** Generate cryptographic hashes for piece authenticity tracking
- **Data Included:** title, description, imageUrl, creatorWallet, timestamp

### Component Organization

- **components/imported/** - Original Figma UI components (preserved pixel-perfect)
- **components/layout/** - Shared layout components (header, footer, navigation)
- **components/providers/** - Context providers (AppKit, Registration)
- **components/auth/** - Authentication-related components
- **components/ui/** - Reusable UI components (shadcn-style)

### Type System

- **Core Types:** [types/index.ts](types/index.ts)
  - `User`, `Piece`, `Remix` - Database models
  - `Locale` - 'en' | 'es'
  - `Dictionary` - Full i18n structure with all translation keys
- **AppKit Types:** [types/appkit.d.ts](types/appkit.d.ts) for Reown type augmentation

### Performance Optimizations

This app has extensive bundle size optimizations:

- **Bundle Analysis:** `npm run build:analyze` opens interactive visualizations
- **Code Splitting:** Advanced webpack configuration in [next.config.mjs](next.config.mjs)
  - Separate chunks for: vendor, reown, wagmi, lib (supabase/tanstack)
  - Common chunk for shared code across routes
- **Dynamic Imports:** Large components (like LandingUI) are lazy-loaded
- **Package Optimization:** `optimizePackageImports` for lucide-react, radix-ui, supabase
- **Image Optimization:** AVIF/WebP formats with fallbacks
- **Production Settings:** Console removal (except errors/warnings), compression, no source maps

See [docs/BUNDLE_OPTIMIZATION.md](docs/BUNDLE_OPTIMIZATION.md) for detailed performance metrics and strategies.

### Theming

- **Colors:** Centralized in [lib/constants/colors.ts](lib/constants/colors.ts)
- **Brand Colors:**
  - Primary: `#486B91` (blue)
  - Secondary: `#F1E7D3` (beige)
- **Styling:** Tailwind CSS with custom color references

## Common Patterns

### Server Components with i18n
```typescript
export default async function Page({ params }: { params: { lang: Locale } }) {
  const dict = getDictionary(params.lang);
  return <div>{dict.common.home}</div>;
}
```

### Client Components with Wallet
```typescript
'use client';
import { useWalletConnect } from '@/lib/services/reown';

export function MyComponent() {
  const { openModal, address, isConnected } = useWalletConnect();
  // ...
}
```

### Supabase Queries
```typescript
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

if (!isSupabaseConfigured()) {
  // Handle gracefully
}

const { data, error } = await supabase
  .from('pieces')
  .select('*')
  .eq('creator_user_id', userId);
```

## Database Setup

If working with Supabase features, run the schema:
```bash
# In Supabase SQL Editor, execute:
docs/sql/schema.sql
```

This creates tables, indexes, RLS policies, and triggers.

## Testing

- **Framework:** Vitest + React Testing Library
- **Config:** [vitest.config.ts](vitest.config.ts)
- **Setup:** [tests/setup.ts](tests/setup.ts)
- **Existing Tests:**
  - i18n dictionary loading and validation
  - Provenance hash generation
  - Component rendering (when added)

## Important Notes

- **Figma UI Preservation:** The imported Figma components maintain pixel-perfect styling - avoid modifying their structure
- **No Credentials in Repo:** Never commit `.env.local` or any credentials
- **Server/Client Separation:** Reown hooks are client-only; database queries can be server or client side
- **Bundle Size Monitoring:** Run `build:analyze` periodically to prevent bloat
- **RLS Awareness:** All Supabase queries respect Row Level Security policies based on authenticated wallet
