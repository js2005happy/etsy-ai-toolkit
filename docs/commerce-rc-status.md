# Craftly Commerce RC Status

Status: **release candidate frozen for pre-production verification**

This document records the code state only. It does **not** authorize a production deployment.

## Candidate

- PR: #18 `Category-aware multichannel commerce foundation`
- Branch: `feature/category-aware-multichannel`
- RC head: `80e235d6730c746ce37a8677944704aff920a81f`
- Quality run: #190
- Quality result: **success** (install, lint, production build)
- PR state: open, draft, mergeable
- Review threads: none

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
- Production release checklist in `docs/commerce-release-checklist.md`

## Intentionally gated / not simulated

The following channels remain local reviewed drafts until Craftly has real provider application approval, credentials/scopes, and production-safe connector implementations:

- Amazon
- TikTok Shop
- Walmart
- Google Shopping

Craftly must not present these as live publishing integrations before those requirements are satisfied.

## Pre-production runtime blockers

These are environment/runtime verification items, not code compilation blockers:

1. Confirm the canonical Vercel production project before any merge/deploy.
2. Verify required production environment variables exist without exposing secret values.
3. Apply migrations `0016` → `0017` → `0018` → `0019` in order and verify RLS behavior.
4. Test Shopify OAuth/reconnect, order import and reviewed sync against a safe test store.
5. Test WooCommerce connection, order import and reviewed sync against a safe test store.
6. Test eBay OAuth/reconnect, policy configuration, safe listing publish, order import and reviewed sync against a sandbox/test account where possible.
7. Verify storefront catalog visibility and that no checkout/escrow path is accidentally exposed.
8. Perform one production merge/deploy only after explicit release approval.

## Release rule

Do not merge PR #18 or deploy production merely because CI is green. The batch remains held until explicit approval to release, after which the canonical deployment path should be used once and followed by the smoke tests in `docs/commerce-release-checklist.md`.
