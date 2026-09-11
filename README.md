<h1 align="center">Craftly</h1>

<p align="center">
  <strong>AI-powered seller workspace for creating, managing, and growing products across marketplaces.</strong><br />
  Create and improve listings, generate seller content, review changes safely, and manage connected commerce workflows from one workspace.
</p>

<p align="center">
  <a href="https://craftly.world"><img src="https://img.shields.io/badge/website-craftly.world-0ea5e9" alt="website" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" alt="Next.js 16" /></a>
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" alt="React 19" />
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" /></a>
  <a href="https://paddle.com"><img src="https://img.shields.io/badge/Paddle-billing-6633ee" alt="Paddle" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Vercel-deployed-000000?logo=vercel&logoColor=white" alt="Vercel" /></a>
  <img src="https://img.shields.io/badge/MCP-server-ED8106" alt="MCP server" />
  <img src="https://img.shields.io/badge/i18n-9_languages-16a34a" alt="9 languages" />
</p>

---

## What Craftly is

Craftly is a production SaaS available at **[craftly.world](https://craftly.world)**. It started as an Etsy AI writing toolkit and has grown into a broader seller workspace for marketplace and commerce workflows.

The current product combines:

- **Listing creation and optimization** — titles, descriptions, tags, keywords, bullets, translations, and listing-health review.
- **Seller communication** — buyer replies, review replies, email drafts, announcements, and brand-aware responses.
- **Marketing content** — social posts, ad copy, product visuals, brand story, and localized content.
- **Pricing assistance** — product pricing and market-aware recommendations.
- **Seller Workspace** — a central place to review AI suggestions before publishing.
- **Connected commerce workflows** — Etsy, Shopify, WooCommerce, and eBay are the current live-connector scope.
- **Marketplace discovery layer** — Marketplace V1 is discovery/non-payment only. Craftly does not operate buyer checkout, escrow, payouts, refunds, chargebacks, or tax handling.
- **MCP access** — seller tools can be accessed from compatible MCP clients using a per-user key.
- **9-language UI** — English, German, French, Spanish, Chinese, Japanese, Italian, Korean, and Portuguese.

> Amazon, TikTok Shop, Walmart, and Google should not be treated as completed live connectors unless separately implemented and authorized.

## Product workflow

A typical Craftly flow is:

1. Connect or import product/shop data.
2. Review listing health and identify issues worth fixing.
3. Generate clearer titles, descriptions, tags, images, replies, or marketing content.
4. Review every suggested change before anything is published.
5. Publish approved work to supported connected channels or copy it elsewhere.

Craftly is designed around **human review before external publishing**. AI suggestions are editable, and nothing should be treated as a guaranteed ranking, traffic, or sales outcome.

## Screenshots

The repository screenshots are being refreshed to match the current Craftly production UI and the September 2026 listing-review experience. The previous website hero artwork has been removed from the README so the repository does not present an outdated interface while the new screenshots are being captured.

<p align="center">
  <img src="public/dashboard.webp" alt="Craftly seller workspace dashboard" width="1280" />
</p>

## Included AI tools

| Tool | What it does |
| --- | --- |
| **Listing Generator** | Creates marketplace-ready titles, descriptions, and tags from product details |
| **Listing Optimizer** | Reviews an existing listing and drafts clearer improvements |
| **Keyword Generator** | Produces relevant search and listing keyword ideas |
| **Buyer Reply** | Drafts helpful responses to buyer questions |
| **Review Reply** | Creates rating-aware review responses |
| **Social Post** | Generates social captions and hashtags for seller channels |
| **Shop Announcement** | Writes sales, restock, holiday, and shop notices |
| **Pricing Advisor** | Helps reason about product pricing and margins |
| **Translate** | Localizes listing and seller content across supported languages |
| **Product Images** | Generates promotional product visuals and posters |
| **Ad Copy** | Drafts paid and organic promotional copy |
| **Brand Story** | Creates seller and shop brand narratives |
| **Bullets** | Produces concise benefit-led product bullets |
| **Competitor Analysis** | Helps compare listing positioning and content patterns |
| **Email** | Drafts customer and marketing emails |
| **Global Pricing** | Helps structure market-aware pricing ideas |

## Commerce integrations

Current reviewed live-connector scope:

- **Etsy** — OAuth / seller publishing workflows
- **Shopify**
- **WooCommerce**
- **eBay**

Commerce credentials are handled separately from public product content, and external publishing is intended to remain an explicit reviewed action.

## Product image generation

The image workflow supports batch generation patterns such as variants, platform-sized creatives, and bulk product poster generation. Generated image usage is metered separately from normal text-generation usage.

<p align="center">
  <img src="public/images-page.webp" alt="Craftly product image generation workspace" width="1280" />
</p>

## Authentication and account model

Craftly uses Supabase Auth with SSR session handling. Supported account flows include email authentication and Google OAuth. Protected seller pages validate the authenticated user server-side before allowing access.

The application stores subscription/account entitlements and seller data in Supabase Postgres with Row Level Security where applicable.

## Billing

Billing is powered by Paddle. Pricing, plan entitlements, credits, and image quotas are centralized in the application pricing configuration rather than duplicated across UI surfaces.

## Affiliate program

Craftly includes an affiliate workflow for eligible partners and creators who serve Etsy, handmade, and small-commerce audiences.

Apply at **[craftly.world/affiliates](https://craftly.world/affiliates)**.

## MCP server

A Model Context Protocol server in `mcp-server/` exposes selected Craftly seller tools to compatible MCP clients. It supports per-user API keys so usage and credits are tied to the individual Craftly account rather than a shared service account.

Example tool categories include listing generation, seller replies, review responses, social content, announcements, keywords, translation, optimization, pricing assistance, and credit checks.

Published package:

```bash
npm install -g etsy-ai-toolkit-mcp
etsy-ai-toolkit-mcp
etsy-ai-toolkit-mcp-http
```

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 App Router |
| Runtime | Node.js 22+ |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS, Radix UI, Framer Motion |
| Auth | Supabase Auth + SSR |
| Database | Supabase Postgres + RLS |
| Billing | Paddle |
| Email | Resend |
| Analytics | PostHog / web analytics integrations |
| AI | Multi-provider text, vision, and image-generation workflows |
| i18n | Custom lightweight framework, 9 locales |
| MCP | Model Context Protocol server with per-user keys |
| Hosting | Vercel |

## Getting started

### Prerequisites

- Node.js 22+
- A Supabase project
- An OpenAI-compatible LLM provider key
- Optional Paddle and Resend credentials for billing and email flows

### Install

```bash
npm install
```

### Configure environment variables

Create `.env.local` in the project root and configure the required server and public environment variables. Use `.env.example` as the reference and never commit real production secrets.

At minimum, local development requires the Supabase public URL/key and the configured AI provider credentials.

### Run locally

```bash
npm run dev
```

### Quality checks

```bash
npm run lint
npm run build
```

## Database

Schema and product evolution are tracked in `supabase/migrations/`. The project includes account/profile data, generation history, quota/subscription fields, commerce data, marketplace discovery data, and associated security policies/functions.

## Project structure

```text
app/                  # Next.js routes, auth callbacks, APIs, dashboard and product surfaces
components/           # UI, seller workspace, home, auth and feature components
lib/                  # auth, Supabase, AI, pricing, i18n and product logic
mcp-server/           # MCP server transports and seller tools
supabase/migrations/  # database schema and migrations
docs/                 # product/release/technical documentation
```

## Release boundaries

Craftly's current Marketplace V1 remains a discovery/non-payment layer. It does **not** provide Craftly-operated buyer payment, escrow, seller payout, refund/chargeback handling, or tax handling.

For commerce connectors, stock/price changes and publishing actions should remain explicit reviewed operations rather than silent automated mutations.
