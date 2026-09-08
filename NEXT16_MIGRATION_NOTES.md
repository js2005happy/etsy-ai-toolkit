# Craftly Next 16 migration notes

This branch was originally based on `craftly-reliability-conversion` and has now been retargeted to `main` after PR #2 was merged. The framework migration remains isolated from the release-candidate work.

## Migrated

- Next.js 14.2.35 -> 16.3.4
- React / React DOM 18 -> 19.2.0
- ESLint CLI replaces removed `next lint`
- legacy `.eslintrc.json` -> flat `eslint.config.mjs`
- root `middleware.ts` -> `proxy.ts`
- Next request APIs such as `cookies()` migrated to async access
- Supabase server client factory migrated to async cookie access
- server i18n helpers migrated to async cookie access
- Etsy and Shopify OAuth cookie state handling migrated without changing OAuth semantics
- lucide-react updated for React 19 compatibility

## Verification completed before migration commit

- `npm run lint`: 0 errors (4 navigation warnings)
- `npm run build`: success on Next.js 16.3.4 / Turbopack
- TypeScript: success
- 74 static/dynamic app routes generated successfully
- `npm audit --audit-level=high`: 0 vulnerabilities

## Final pre-merge verification

After PR #2 landed on `main`, PR #3 was retargeted to the merged `main` baseline. This documentation-only commit intentionally triggers the repository's normal Quality workflow again so the final merge decision is based on the actual post-PR-#2 base.

## Deliberate compatibility choice

The previous project ESLint policy extended `next/core-web-vitals`. The migration preserves that policy rather than enabling unrelated stricter TypeScript rules during a framework upgrade. The React 19 `react-hooks/set-state-in-effect` rule is disabled for this migration because existing data-loading effects are pre-existing application behavior and should be refactored separately, not as a hidden behavioral rewrite inside the framework migration.

## Manual QA still required before production merge

- sign in / sign up / password reset
- Google OAuth (when provider credentials are configured)
- Etsy OAuth connect/callback and draft/review/publish flow
- Shopify OAuth connect/callback and push flow
- referral cookie capture and application
- dashboard authentication redirects / session refresh through `proxy.ts`
- Paddle checkout / portal / webhook smoke checks without making a real charge
