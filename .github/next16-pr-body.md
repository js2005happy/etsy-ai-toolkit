## Scope

Isolated framework migration on top of the frozen `craftly-reliability-conversion` release candidate.

## Changes

- Next.js 14.2.35 -> 16.3.4
- React / React DOM -> 19.2.0
- `next lint` -> ESLint CLI + flat config
- `middleware.ts` -> `proxy.ts`
- async Next request APIs, including `cookies()`
- async Supabase server client and server i18n helpers
- Etsy / Shopify OAuth cookie state handling updated for async request APIs
- lucide-react updated for React 19 compatibility
- global error internal navigation uses Next Link

## Verification

Migration workflow completed successfully before committing the framework changes:

- lint: 0 errors (4 existing-style internal navigation warnings)
- Next 16 production build: success
- TypeScript: success
- route generation: success (74 routes)
- `npm audit --audit-level=high`: 0 vulnerabilities

## Safety

This PR does not change pricing, quotas, Paddle entitlement mapping, database migrations, Etsy publishing semantics, Shopify publishing semantics, or Seller OS behavior. It preserves the pre-migration `next/core-web-vitals` lint policy rather than mixing unrelated TypeScript cleanup into a framework upgrade.

## Dependency

This PR is based on `craftly-reliability-conversion` and should not be merged to production before that release-candidate PR is accepted. After PR #2 lands on `main`, this PR should be retargeted to `main` and re-verified before merge.

## Manual QA before production merge

Auth/session redirects, Google OAuth, Etsy OAuth + draft/review/publish, Shopify OAuth + push, referral cookie attribution, and Paddle sandbox smoke checks.