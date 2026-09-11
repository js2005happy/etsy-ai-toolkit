# Craftly Commerce RC Status

Status: **release candidate frozen for pre-production verification**

This document records the code state only. It does **not** authorize a production deployment. The exact final RC head SHA and passing Quality run are recorded in PR #18 after the last code change so this file does not create an endless status-only commit loop.

## Candidate

- PR: #18 `Category-aware multichannel commerce foundation`
- Branch: `feature/category-aware-multichannel`
- PR state: open, draft, mergeable
- Review threads: none at the latest review pass

## Code-complete scope

- Category-aware product profiles and readiness checks
- Product Hub with variants, images, inventory and canonical product facts
- Multichannel draft generation for Etsy, Shopify, WooCommerce, Amazon, eBay, TikTok Shop, Walmart and Google Shopping
- Direct reviewed publishing for Shopify, WooCommerce and eBay
- Explicit create-once protection against duplicate external listings
- Reviewed two-step inventory/price sync for Shopify, WooCommerce and eBay
- Unified read-first Order Inbox for Shopify, WooCommerce and eBay
- Encrypted WooCommerce/eBay secret storage
- Shopify/eBay reconnect guidance for newer scopes
- eBay publishing-policy settings load/save without returning OAuth tokens to the browser
- Seller Storefront catalog foundation, intentionally without Craftly-hosted checkout or escrow
- Commerce RLS hardening through migration `0019_commerce_rls_hardening.sql`
- Security-advisor hardening through migration `0020_security_advisor_hardening.sql`
- Quota reservation/refund RPCs are server-only in application code; direct `anon`/`authenticated` execution is revoked by `0020`
- Production release checklist in `docs/commerce-release-checklist.md`

## Intentionally gated / not simulated

The following channels remain local reviewed drafts until Craftly has real provider application approval, credentials/scopes, and production-safe connector implementations:

- Amazon
- TikTok Shop
- Walmart
- Google Shopping

Craftly must not present these as live publishing integrations before those requirements are satisfied.

## Production Supabase baseline observed during pre-release review

The connected production Supabase project is healthy, but the new commerce tables are **not present yet**, which is expected because the user explicitly requested no deployment until the batch release. The existing migration history currently predates migrations `0016`-`0020`.

A Security Advisor baseline found legacy warnings outside the new commerce tables. The code batch now addresses the mutable `protect_profile_columns()` search path and direct signed-in execution of quota SECURITY DEFINER RPCs through migration `0020`. Supabase Auth leaked-password protection remains a production setting to enable during release verification. A legacy table with RLS enabled but no policy also remains a pre-existing advisor item and must be reviewed before production sign-off rather than altered destructively during development.

## Pre-production runtime blockers

These are environment/runtime verification items, not code compilation blockers:

1. Confirm the canonical Vercel production project before any merge/deploy.
2. Verify required production environment variables exist without exposing secret values.
3. Apply migrations `0016` → `0017` → `0018` → `0019` → `0020` in order and verify RLS/function permissions.
4. Re-run Supabase Security Advisor and review remaining findings.
5. Test Shopify OAuth/reconnect, order import and reviewed sync against a safe test store.
6. Test WooCommerce connection, order import and reviewed sync against a safe test store.
7. Test eBay OAuth/reconnect, policy configuration, safe listing publish, order import and reviewed sync against a sandbox/test account where possible.
8. Verify storefront catalog visibility and that no checkout/escrow path is accidentally exposed.
9. Perform one production merge/deploy only after explicit release approval.

## Release rule

Do not merge PR #18 or deploy production merely because CI is green. The batch remains held until explicit approval to release, after which the canonical deployment path should be used once and followed by the smoke tests in `docs/commerce-release-checklist.md`.
