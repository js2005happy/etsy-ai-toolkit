# Etsy AI Toolkit

An AI-powered toolkit for Etsy sellers — generate listings, reply to messages & reviews, write social posts, optimize SEO, and price your products, all from one dashboard.

## Features

| Tool | What it does |
| --- | --- |
| Listing Generator | Create SEO-optimized titles, descriptions, and 13 tags |
| Message Reply | Draft professional replies to buyer messages |
| Review Reply | Respond to customer reviews in the right tone |
| Social Post | Generate captions + hashtags for social media |
| Shop Announcement | Write shop announcements |
| Keyword Generator | Get high-volume, long-tail keywords |
| Listing Optimizer | Improve existing listings |
| Pricing Advisor | Suggest prices and profit margins |
| Translate | Translate listings while keeping SEO keywords |

Plus email/password authentication and a credits system for tracking generations.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth & DB:** Supabase (SSR)
- **AI:** LLM API

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An LLM provider API key

### 1. Install

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_llm_api_key
# Optional: override the LLM base URL (custom gateway/proxy)
OPENAI_BASE_URL=
# Optional: set to "true" to run without calling the LLM API
USE_MOCK_AI=false
```

### 3. Set up the database

Run the migration in `supabase/migrations/0001_init.sql` (SQL Editor or `supabase db push`).

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `OPENAI_API_KEY` | Yes | LLM API key |
| `OPENAI_BASE_URL` | No | Override the LLM base URL (custom gateway/proxy) |
| `USE_MOCK_AI` | No | Set `true` to use mock responses instead of the LLM API |

> The API key is used **server-side only** and is never exposed to the browser. Never commit `.env.local`.

## Database

The schema lives in [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql):

- `profiles` — one row per user, tracks `credits_remaining`
- `generations` — a log of every AI generation
- `handle_new_user()` trigger — auto-creates a profile row on signup
- Row Level Security policies on both tables

## Project Structure

```
app/
  (auth)/           # login / signup
  api/              # AI generation + credits API routes
  dashboard/        # tool pages
lib/
  openai.ts         # LLM integration
  supabase/         # Supabase clients (browser / server / middleware)
supabase/
  migrations/       # SQL schema migrations
```
