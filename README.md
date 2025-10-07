# Manantial Blanco Portal

A Next.js application for registering and browsing artists' intellectual property ("Pieces"). This platform integrates Reown AppKit for authentication and Supabase for data storage.

## Features

- 🎨 **Register Art IP**: Protect your creative work with provenance tracking
- 🔄 **Remix Art**: Create derivative works while respecting original creators' rights
- 🌍 **i18n Support**: English and Spanish language support
- 🔐 **Wallet Authentication**: Connect via Reown AppKit
- ⚡ **Optimized Performance**: Advanced bundle splitting and code optimization
- 📊 **Bundle Analysis**: Built-in tools for monitoring app performance

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Reown AppKit (wallet-based)
- **Testing**: Vitest + React Testing Library
- **i18n**: Custom dictionary-based system (en/es)
- **Build Tools**: Bundle Analyzer, Webpack optimizations

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

**Note**: The app will run with limited functionality if credentials are not provided.

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
- `npm run build:analyze` - Build with bundle analysis (opens in browser)
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

### Register New Piece (`/[lang]/register-piece`)
- Upload artwork image
- Add metadata (title, description, tags)
- Set remix permissions
- Generate provenance hash for authenticity

### Piece Details (`/[lang]/piece/[id]`)
- View artwork and metadata
- Provenance information
- Remix option (if allowed)

### Remix Flow (`/[lang]/remix/[id]`)
- Create derivative works
- Automatic attribution to original
- Generate provenance chain for remixes

## Performance Optimizations

This app includes comprehensive bundle size optimizations:

- **Bundle Analyzer**: Visualize bundle composition with `npm run build:analyze`
- **Code Splitting**: Advanced chunk splitting for vendor, lib, and common code
- **Dynamic Imports**: Lazy-loaded components for faster initial load
- **Image Optimization**: AVIF/WebP formats with automatic fallbacks
- **Production Optimizations**: Console removal, source map control, compression
- **Tree Shaking**: Optimized imports for lucide-react and radix-ui

See [docs/BUNDLE_OPTIMIZATION.md](docs/BUNDLE_OPTIMIZATION.md) for detailed information.

## Integration Status

### ✅ Implemented
- Next.js App Router with TypeScript
- i18n system (en/es)
- Figma UI integration with preserved styling
- Supabase client setup
- Database schema with RLS policies
- Reown AppKit service integration
- Provenance hash generation
- Comprehensive bundle optimizations
- Component testing setup

### 🚧 Requires Configuration
- **Supabase**: Add credentials to `.env.local` and run schema
- **Reown AppKit**: Add project ID for full wallet integration

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

## Documentation

### Internal Docs
- [Bundle Optimization Guide](docs/BUNDLE_OPTIMIZATION.md) - Performance optimization strategies
- [Database Schema](docs/sql/schema.sql) - Supabase table definitions

### External Documentation
- [Reown AppKit](https://docs.reown.com/appkit/next/core/installation)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)

## Notes

- The Figma UI has been preserved pixel-perfect with i18n integration
- No credentials are committed to the repository
- RLS policies are configured for secure data access
- Bundle size is optimized for production deployment
- All colors are centralized in `lib/constants/colors.ts` for easy theming

## License

Private - Manantial Blanco Project
