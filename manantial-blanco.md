Project Name
Manantial Blanco Portal
High-Level Goal
Integrate an existing TSX UI (exported from Figma) into a Next.js (App Router) + TypeScript app for registering and browsing artists’ intellectual property (“Pieces”). Story handles tokenization + storage, Reown AppKit handles auth/onboarding, and Supabase stores app data. The UI from the TSX file is source-of-truth for visuals; do not regenerate the layout.
 
Inputs You Already Have
•	Prebuilt TSX UI from Figma (single file or multiple).
o	It  renders the Landing.
o	The agent must adopt and modularize this file into the app, preserving visuals and behaviors.
o	the css file is also shared
External Docs
•	Story SDK (TypeScript): https://github.com/storyprotocol/sdk/tree/main
•	Reown AppKit (Next.js): https://docs.reown.com/appkit/next/core/installation
Keep all credentials empty. Wire only.
 
Tech Stack & Constraints
•	Next.js (App Router) + TypeScript (strict)
•	Supabase (DB & RLS; client for app data)
•	Auth/Wallet: Reown AppKit
•	Tokenization & Storage: Story (SDK + storage)
•	Styling: Use the existing TSX styles as-is. If it’s plain CSS/classes, keep them. If it’s Tailwind, keep classes. Only refactor to Tailwind if trivial and strictly non-visual-changing.
•	i18n: English & Spanish dictionaries; wrap existing TSX text into translation keys (no hard-coded text).
•	Testing: Vitest + React Testing Library
•	Accessibility: Preserve design; add aria/semantic tags where absent (non-visual).
 
Domain & Data
Entities
•	User: id, role (creator|creative), walletAddress, displayName, avatarUrl, timestamps.
•	Piece: id, title, description, imageUrl, creatorUserId, tokenId?, tokenContract?, provenanceHash, canRemix, tags[], timestamps.
•	Remix: id, original_piece_id, remix_piece_id, timestamps.
Catalog Filters (MVP)
•	Tags (multiselect) & Upload Date (range).
Remix Policy
•	No special policy yet; allow remix when canRemix = true.
 
Pages & Flows (tie UI to logic)
1.	Landing Page (public)
o	Use the provided TSX for layout/visuals.
o	Place primary CTAs Buy and Register (routes below).
o	Embed Catalog grid beneath (connect data later).
2.	Login (public)
o	Reown AppKit connect UI (modal/redirect per docs).
3.	Registration / Onboarding (public → private)
o	Use Reown callbacks; create/update Supabase profile.
4.	Home Page (private)
o	Creative: Latest pieces + filters
o	Creator: My pieces + “Register New Piece” + account info
5.	Register New Piece (private; creator)
o	Upload image → Story storage
o	Build metadata + provenanceHash
o	Mint via Story; persist tokenId, tokenContract
6.	Piece Details (public)
o	Show metadata/token data
o	If canRemix & user is Creative → Start Remix
7.	Remix Flow (private; creative)
o	Create derived piece (optional mint) + remixes record
 
i18n Requirements (wrap your TSX)
•	Locales: en, es (/lib/i18n/dictionaries)
•	Replace all literal strings in the provided TSX with i18n keys.
•	Provide a header language switcher (non-intrusive to existing design).
 
Environment Variables (leave values empty)
.env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Reown / AppKit
NEXT_PUBLIC_REOWN_PROJECT_ID=
NEXT_PUBLIC_REOWN_REDIRECT_URI=

# Story
NEXT_PUBLIC_STORY_API_URL=
STORY_API_KEY=
 
Project Structure
/app
  /(public)
    /[lang]
      /landing/page.tsx        # Renders your provided TSX (modularized)
      /login/page.tsx
      /piece/[id]/page.tsx
  /(private)
    /[lang]
      /home/page.tsx
      /pieces/new/page.tsx
      /remix/[id]/page.tsx
/components
  /catalog
  /forms
  /layout
  /shared
  /imported                   # put raw imported TSX here before modularizing
/lib
  /i18n
    /dictionaries/en.ts
    /dictionaries/es.ts
    getDict.ts
  /services
    /story.ts                 # Story SDK wiring (placeholders ok)
    /reown.ts                 # Reown AppKit wiring (placeholders ok)
  /supabase.ts
  /crypto.ts                  # provenance hash helper
/styles
/tests
/types
/docs
 
Integration Plan for the Prebuilt TSX
1.	Add the TSX file(s) unchanged under /components/imported/YourFigmaUI.tsx.
o	Keep all classNames/styles as provided.
o	If it imports a CSS file, place it under /styles and import in RootLayout.
2.	Wrap with i18n:
o	Find all user-visible strings in YourFigmaUI.tsx.
o	Replace with t.common.*, t.landing.*, etc.
o	Add any missing keys to /lib/i18n/dictionaries/{en,es}.ts.
3.	Modularize (non-visual):
o	Extract obvious subtrees into small components under /components (e.g., Hero.tsx, CatalogShell.tsx, FiltersBar.tsx), but preserve markup structure and classes so visuals don’t change.
o	Only refactor if zero visual regression.
4.	Connect routing/CTAs:
o	Buy → anchor to catalog section #catalog on Landing (or /[lang]/landing#catalog).
o	Register → /[lang]/login.
5.	Catalog data binding:
o	Replace placeholder catalog content with a server-fetched list from Supabase.
o	Wire Tags + Upload Date filters via query params (?tags=a,b&from=YYYY-MM-DD&to=YYYY-MM-DD).
o	Keep the original grid/card styling from the TSX.
6.	Accessibility pass (no visual change):
o	Add alt to images, aria-label to icon buttons, proper headings order, focus outlines.
7.	Theme tokens (optional, non-breaking):
o	If the TSX hardcodes colors/sizes, create CSS variables in :root (e.g., --brand, --text, spacing).
o	Map existing classes to these vars behind the scenes; do not change visuals.
 
Services (stubs remain; just wire)
StoryService (/lib/services/story.ts)
•	Implement using Story SDK when creds exist; until then, return placeholder values and log “not configured”.
•	Methods:
o	prepareAsset({ file, metadata }) → { metadataUrl }
o	mintPiece({ metadataUrl, creatorWallet }) → { tokenId, contract }
o	getPieceToken(tokenId) → { tokenId, contract, owner, metadataUrl, mintedAt? }
ReownService (/lib/services/reown.ts)
•	Initialize per Reown docs; on connect, upsert profiles with walletAddress, default role.
•	Expose:
o	init({ projectId, redirectUri })
o	connect() → { walletAddress }
o	getSession()
o	disconnect()
 
Acceptance Criteria (focused on TSX integration)
1.	Your Figma TSX renders pixel-identical (or visually equivalent) on /[lang]/landing.
2.	All visible strings are i18n-driven (en/es) with a working language switcher.
3.	CTAs on the Landing use Next.js routes as specified.
4.	Catalog section under the Landing is data-driven (Supabase) with tag and upload date filters; URL reflects filters.
5.	Auth via Reown connects/disconnects; on connect, a profile row is inserted/updated (wallet key).
6.	Register New Piece flow completes with Story stubs (no real mint without creds). Data persists to Supabase with placeholder tokenId/contract if creds are absent.
7.	No credentials committed; .env.local has empty placeholders.
8.	A11y basic checks pass; no visual regression from the provided TSX.
 
Build Steps (agent checklist)
1.	Bootstrap Next.js + TS + ESLint/Prettier/Vitest.
2.	Drop YourFigmaUI.tsx under /components/imported and verify it compiles.
3.	Create RootLayout with [lang] param and i18n loader; mount YourFigmaUI in /[lang]/landing/page.tsx.
4.	Wrap text with i18n keys; add dictionaries; add language switcher.
5.	Hook CTAs to routes; create empty login, home, pieces/new, piece/[id], remix/[id] pages.
6.	Add Supabase client + run /docs/sql/schema.sql.
7.	Implement Reown wiring (init/connect); upsert profiles on connect.
8.	Implement Story stubs (log “unconfigured” if envs are empty).
9.	Replace catalog placeholders with Supabase data + filters (tags/date via query params).
10.	A11y additions (alt text, aria labels).
11.	Add light tests for i18n loader, provenance hash, and rendering of Landing without crashing.
 
Notes for the Agent
•	Do not restyle or “improve” the provided TSX beyond what’s necessary for i18n/accessibility/wiring.
•	If the provided TSX is page-level, mount it as the entire Landing content. If it’s component-level, integrate it into the Landing page and keep its layout intact.
•	If the TSX includes inline assets or hardcoded strings, extract them cleanly to dictionaries//public but preserve visual parity.
 

