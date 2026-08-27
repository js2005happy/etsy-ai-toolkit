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
- **AI:** OpenAI (GPT-4o-mini)

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key

### 1. Install

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
# Optional: override the OpenAI base URL (custom gateway/proxy)
OPENAI_BASE_URL=
# Optional: set to "true" to run without calling the OpenAI API
USE_MOCK_AI=false
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `OPENAI_BASE_URL` | No | Override the OpenAI base URL (custom gateway/proxy) |
| `USE_MOCK_AI` | No | Set `true` to use mock responses instead of the OpenAI API |

> The OpenAI API key is used **server-side only** and is never exposed to the browser. Never commit `.env.local`.

## Database

The app uses two Supabase tables:

- `profiles` — user profiles with a `credits_remaining` column
- `generations` — a log of every AI generation

Create these tables (and a `profiles` row per user) in your Supabase project before using the dashboard.

## Project Structure

```
app/
  (auth)/           # login / signup
  api/              # AI generation + credits API routes
  dashboard/        # tool pages
lib/
  openai.ts         # OpenAI integration
  supabase/         # Supabase clients (browser / server / middleware)
```
