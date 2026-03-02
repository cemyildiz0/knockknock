# KnockKnock

Neighborhood discovery app for Irvine, CA. Users search for neighborhoods using natural language, browse livability data, and play a home-comparison game ("Knock") that infers housing preferences.

## Stack

Next.js 14 (App Router), TypeScript, Supabase (Postgres + Auth), Cerebras AI, Leaflet, Tailwind CSS

## Setup

```bash
npm install
cp .env.example .env.local    # fill in keys
npm run dev                   # http://localhost:3000
```

Database: run `scripts/schema.sql` against your Supabase project. This is a full dump (`supabase db dump`) containing all tables, functions, RLS policies, and indexes.

## Env Vars

See `.env.example`. Required:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase client
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` - Supabase server-side
- `CEREBRAS_API_KEY` - powers the AI search (`/api/ai/recommend`)

Optional:

- `MODEL_SERVER_URL` - image-based similar-houses model endpoint (sends house photos to `MODEL_SERVER_URL/predict`)

## How It Works

- **AI search** - user describes what they want in plain English, Cerebras (`gpt-oss-120b`) matches against neighborhood data, livability scores, and POIs, returns ranked recommendations via `/api/ai/recommend`
- **Knock game** - on each neighborhood page, users play 5 rounds of "which home would you knock on?". Picks are analyzed to infer preferred property type, size, and price range, then similar homes are suggested. Includes door-knock animation between rounds
- **Livability data** - 7-category scoring (engagement, environment, health, housing, neighborhood, opportunity, transportation) per ZIP, stored in `livability_regions` with detailed sub-metrics, demographics, and climate data
- **Map layers** - neighborhood boundaries, livability heatmap, school districts, POI clusters, review heatmap (Leaflet + react-leaflet)
- **Reviews** - users review address points with 1-5 star ratings. One review per user per address. Reviews can be liked. `/api/map/review-heatmap` aggregates reviewed addresses in a bounding box via the `get_reviewed_addresses` RPC
- **Auth** - Supabase email/password auth. Logged-in users can save neighborhoods and homes to their profile (stored as JSON arrays in the `profiles` table)
- **Similar houses** - `/api/similar-houses` proxies an image upload to an external model server for visual similarity search. Requires `MODEL_SERVER_URL`

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing: hero + AI search bar + top neighborhoods grid
│   ├── search/                   # AI search results page
│   ├── neighborhood/[id]/        # Neighborhood detail + Knock game
│   ├── home/[id]/                # Property detail + tour request form
│   ├── saved/                    # Saved homes & neighborhoods (authed)
│   ├── about/                    # About page
│   ├── auth/                     # Login / signup
│   └── api/
│       ├── ai/recommend/         # Cerebras AI neighborhood recommendations
│       ├── neighborhoods/        # List, detail, nearby, homes-per-neighborhood
│       ├── homes/                # Property listings and detail
│       ├── reviews/              # CRUD + likes + user's reviews
│       ├── addresses/            # Address search + detail + review summaries
│       ├── search/               # General search endpoint
│       ├── similar-houses/       # Image-based similarity (external model)
│       ├── map/                  # Layers, POIs, address points, review heatmap
│       ├── livability/[zip]/     # Livability data by ZIP/geoid
│       ├── pois/                 # Points of interest
│       └── auth/                 # Login, signup, logout, me
├── components/
│   ├── KnockGame.tsx             # Home comparison game logic
│   ├── KnockAnimation.tsx        # Door-knock animation overlay
│   ├── KnockResults.tsx          # Preference analysis + similar home suggestions
│   ├── Map.tsx                   # Main interactive map
│   ├── LivabilitySidebar.tsx     # Livability score breakdown panel
│   ├── LayerControls.tsx         # Map layer toggles
│   └── ...                       # Navbar, Footer, cards, etc.
├── lib/
│   ├── supabase-browser.ts       # Client-side Supabase (singleton)
│   ├── supabase-route.ts         # Route handler Supabase (per-request, cookie-based)
│   ├── supabase-server.ts        # Server-side Supabase (service role key)
│   ├── supabase-middleware.ts     # Middleware Supabase (cookie refresh)
│   └── ...                       # geo-utils, auth helpers, livability colors/labels
└── types/                        # TypeScript interfaces (Home, Review, Neighborhood, etc.)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
