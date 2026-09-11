# Marketplace V1 Status

Status: active development on `feature/marketplace-v1`.

This branch is intentionally isolated from Commerce RC PR #18 and must not be merged into the current production release batch.

## Implemented

- Buyer-facing `/discover` catalog with keyword and category filtering
- Seller directory at `/discover/sellers`
- Public seller storefronts and public product detail pages
- Seller-owned/public/ready product visibility checks
- Related products from the same seller
- Persistent authenticated wishlist (`0021_marketplace_wishlist.sql`)
- Save/remove wishlist controls and stale-item handling
- Buyer comparison page for up to four public products
- Listing reporting intake (`0022_marketplace_reports.sql`)
- Authenticated report API and product-detail reporting UI
- Report intake is non-automatic: a report does not itself remove a listing or establish wrongdoing

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

The Marketplace branch depends on Commerce migrations through `0020`, then adds `0021` and `0022`. Production migration/application must wait for a separately approved Marketplace release.
