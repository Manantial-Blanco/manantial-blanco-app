# Manantial Blanco Portal

A Next.js application for registering and browsing artists' intellectual property ("Pieces"). This platform integrates Story Protocol for tokenization, Reown AppKit for authentication, and Supabase for data storage.

## Features

- 🎨 **Register Art IP**: Protect your creative work with blockchain-based ownership
- 🔄 **Remix Art**: Create derivative works while respecting original creators' rights
- 💰 **Monetization**: Automatic royalty payments through smart contracts
- 🌍 **i18n Support**: English and Spanish language support
- 🔐 **Wallet Authentication**: Connect via Reown AppKit
- 📦 **Decentralized Storage**: Story Protocol integration for asset storage

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Reown AppKit (wallet-based)
- **Blockchain**: Story Protocol SDK
- **Testing**: Vitest + React Testing Library
- **i18n**: Custom dictionary-based system (en/es)

## Project Structure

```
/app
  /[lang]                    # Internationalized routes
    /landing/page.tsx        # Landing page with Figma UI
    /login/page.tsx          # Wallet connection
    /home/page.tsx           # User dashboard
    /pieces/new/page.tsx     # Register new piece
    /piece/[id]/page.tsx     # Piece details
    /remix/[id]/page.tsx     # Remix flow
/components
  /imported                  # Original Figma UI components
  /layout                    # Shared layout components
/lib
  /i18n                      # Internationalization
  /services                  # External service integrations
  /supabase.ts               # Supabase client
  /crypto.ts                 # Provenance hash utilities
/types                       # TypeScript type definitions
/tests                       # Test files
/docs/sql                    # Database schema
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `env.template` to `.env.local` and fill in your credentials:

```bash
cp env.template .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_REOWN_PROJECT_ID` - Your Reown AppKit project ID
- `NEXT_PUBLIC_STORY_API_URL` - Story Protocol API URL
- `STORY_API_KEY` - Story Protocol API key

**Note**: The app will run with placeholder/stub functionality if credentials are not provided.

### 3. Set Up Database

If using Supabase, run the schema file:

```bash
# In your Supabase SQL editor, run:
docs/sql/schema.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI

## Key Pages

### Landing Page (`/en/landing` or `/es/landing`)
- Integrated Figma UI with full i18n support
- Catalog of registered pieces
- Search and filter functionality
- Language switcher (EN/ES)

### Register New Piece (`/[lang]/pieces/new`)
- Upload artwork image
- Add metadata (title, description, tags)
- Set remix permissions
- Mint via Story Protocol (when configured)

### Piece Details (`/[lang]/piece/[id]`)
- View artwork and metadata
- Token information (if minted)
- Remix option (if allowed)

### Remix Flow (`/[lang]/remix/[id]`)
- Create derivative works
- Automatic attribution to original
- Separate minting for remix

## Integration Status

### ✅ Implemented
- Next.js App Router with TypeScript
- i18n system (en/es)
- Figma UI integration with preserved styling
- Supabase client setup
- Database schema with RLS policies
- Story Protocol service stubs
- Reown AppKit service stubs
- Provenance hash generation
- Basic tests

### 🚧 Requires Configuration
- **Supabase**: Add credentials to `.env.local` and run schema
- **Reown AppKit**: Add project ID and implement full wallet integration
- **Story Protocol**: Add API credentials and implement SDK calls

## Testing

Run tests:
```bash
npm test
```

Tests include:
- i18n dictionary loading and locale validation
- Provenance hash generation
- Component rendering (when added)

## Accessibility

The application includes:
- Semantic HTML elements
- ARIA labels for interactive elements
- Alt text for images
- Keyboard navigation support
- Focus management

## External Documentation

- [Story Protocol SDK](https://github.com/storyprotocol/sdk/tree/main)
- [Reown AppKit](https://docs.reown.com/appkit/next/core/installation)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

## Notes

- All external service integrations use placeholder/stub implementations when credentials are not configured
- The Figma UI has been preserved pixel-perfect with i18n integration
- No credentials are committed to the repository
- RLS policies are configured for secure data access

## License

Private - Manantial Blanco Project
