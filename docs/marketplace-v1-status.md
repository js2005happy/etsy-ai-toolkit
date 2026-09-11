# Marketplace V1 Status

Status: active development on `feature/marketplace-v1`.

This branch is intentionally isolated from Commerce RC PR #18 and must not be merged into the current production release batch.

## Implemented

- Buyer-facing `/discover` catalog with keyword and category filtering
- Seller directory at `/discover/sellers`
- Public seller storefronts and public product detail pages
- Responsive Marketplace navigation for mobile and desktop
- Seller-owned/public/ready product visibility checks
- Evidence-based seller trust context without fake verification claims
- Related products from the same seller
- Persistent authenticated wishlist (`0021_marketplace_wishlist.sql`)
- Save/remove wishlist controls and stale-item handling
- Buyer-controlled 2–4 product comparison selection and `/compare`
- Listing reporting intake (`0022_marketplace_reports.sql`)
- Authenticated report API and product-detail reporting UI
- Human moderation audit fields (`0023_marketplace_moderation_audit.sql`)
- Moderator-only review queue protected by `MARKETPLACE_MODERATOR_USER_IDS`
- Moderation queue enrichment with direct listing/storefront links and duplicate-report counts
- Report intake/review is non-automatic: it does not itself remove a listing or establish wrongdoing

## Safety boundary

Not implemented in this phase:

- cart or checkout
- buyer payment collection
- escrow or seller payouts
- refunds or chargebacks
- tax calculation/remittance
- buyer-protection guarantees
- automated moderation/takedown decisions

## Release note

The Marketplace branch depends on Commerce migrations through `0020`, then adds `0021`, `0022`, and `0023`. Production migration/application must wait for a separately approved Marketplace release. Production moderation also requires explicitly approved user UUIDs in `MARKETPLACE_MODERATOR_USER_IDS`.
