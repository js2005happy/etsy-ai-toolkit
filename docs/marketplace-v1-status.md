# Marketplace V1 Status

Status: non-payment V1 feature-complete on `feature/marketplace-v1` and held for release validation.

This branch is intentionally isolated from Commerce RC PR #18 and must not be merged into the current production release batch.

## Implemented

- Buyer-facing `/discover` catalog with keyword/category filtering, loading skeleton, and recoverable error state
- Seller directory at `/discover/sellers` with loading/error/empty states
- Public seller storefronts and public product detail pages
- Responsive Marketplace navigation with mobile menu, active-page state, keyboard focus styles, and ARIA labels
- Seller-owned/public/ready product visibility checks
- Evidence-based seller trust context without fake verification claims
- Related products from the same seller
- Persistent authenticated wishlist (`0021_marketplace_wishlist.sql`) with save/remove and stale-item handling
- Buyer-controlled 2–4 product comparison with loading/error/empty states and accessible comparison table
- Local-only recently viewed history at `/recently-viewed`, capped and clearable, with no account sync or cross-site tracking claim
- Listing report intake (`0022_marketplace_reports.sql`) and authenticated product-detail reporting UI
- Human moderation audit fields (`0023_marketplace_moderation_audit.sql`)
- Moderator-only review queue protected by `MARKETPLACE_MODERATOR_USER_IDS`
- Moderation enrichment with listing/store links, duplicate counts, text filtering, and grouping by product or seller
- Report intake/review remains human and non-automatic: report volume does not itself remove a listing or establish wrongdoing
- Seller-authored processing/shipping/returns/custom-order policy fields (`0024_marketplace_seller_policies.sql`)
- Storefront builder policy character limits and live buyer-facing policy preview
- Public storefront policy section clearly labeled as seller-authored and not independently verified, guaranteed, or enforced by Craftly

## Safety boundary

Intentionally not implemented in Marketplace V1:

- cart or checkout
- buyer payment collection
- escrow or seller payouts
- refunds or chargebacks
- tax calculation/remittance
- buyer-protection guarantees
- automated moderation/takedown decisions
- fake verification badges or marketplace ranking claims
- cross-site behavioral tracking

These require a separate transaction/payments architecture and explicit release approval.

## Release note

The Marketplace branch depends on Commerce migrations through `0020`, then adds `0021`, `0022`, `0023`, and `0024`. None of the Marketplace migrations should be applied to production until a separately approved Marketplace release. Production moderation also requires explicitly approved account UUIDs in `MARKETPLACE_MODERATOR_USER_IDS`.

The code scope is feature-complete, but production readiness still requires successful lint/build/preview validation on the final head, migration verification in a non-production environment, and post-deploy smoke testing. PR #20 should remain Draft until the Commerce RC is released and the Marketplace release window is explicitly opened.
