# Marketplace V1 Status

Status: active development on `feature/marketplace-v1`.

This branch is intentionally isolated from Commerce RC PR #18 and must not be merged into the current production release batch.

## Implemented

- Buyer-facing `/discover` catalog with keyword and category filtering
- Seller directory at `/discover/sellers`
- Public seller storefronts and public product detail pages
- Responsive marketplace navigation for mobile and desktop
- Evidence-based seller trust signals: storefront age, current public catalog count, contact availability, and explicit non-verification disclosure
- Seller-owned/public/ready product visibility checks
- Related products from the same seller
- Persistent authenticated wishlist (`0021_marketplace_wishlist.sql`)
- Save/remove wishlist controls and stale-item handling
- Buyer comparison page for up to four public products
- Listing reporting intake (`0022_marketplace_reports.sql`)
- Authenticated report API and product-detail reporting UI
- Human moderation audit fields (`0023_marketplace_moderation_audit.sql`)
- Moderator-only report queue API guarded by authenticated user-id allowlist in `MARKETPLACE_MODERATOR_USER_IDS`
- Human review dashboard at `/dashboard/marketplace/moderation`
- Report review changes metadata only; it does not automatically hide, delete, suspend, refund, penalize, or establish wrongdoing

## Safety boundary

Not implemented in this phase:

- cart or checkout
- buyer payment collection
- escrow or seller payouts
- refunds or chargebacks
- tax calculation/remittance
- buyer-protection guarantees
- automated moderation/takedown decisions
- fake seller verification badges or marketplace ranking claims

## Release note

The Marketplace branch depends on Commerce migrations through `0020`, then adds `0021`, `0022`, and `0023`. Production migration/application must wait for a separately approved Marketplace release. Before enabling moderation in production, configure `MARKETPLACE_MODERATOR_USER_IDS` with explicitly approved Craftly account UUIDs and verify the queue with a non-moderator access test.
